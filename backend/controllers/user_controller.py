# Copyright 2026 sharexpress
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
#
from models.user_model import User, OTPverify as OTP
from fastapi import HTTPException, Response, Request
from utils.OTP import sendOTP, VerifyOTPbyUtils
from core.database import get_db
from datetime import datetime
from utils.JWT import GenerateToken
from lib.generateOTP import generateOTP
from utils.SEND_MAILS import send_otp_email
from uuid import uuid4
from utils.google_auth import oauth
from fastapi.responses import RedirectResponse
from authlib.integrations.base_client.errors import OAuthError


db = get_db()


class UserController:
    @staticmethod
    async def SendOTP(user: User):
        try:
            if not user.email:
                raise HTTPException(status_code=400, detail="Email is required")

            otp_code = generateOTP()

            validate_otp = await sendOTP(user.email, otp_code)

            if not validate_otp.get("success"):
                raise HTTPException(
                    status_code=400, detail="Failed to generate OTP. Please try again."
                )

            transaction_id = validate_otp.get("transactionID")

            send_mail = await send_otp_email(user.email, otp_code)
            if not send_mail:
                raise HTTPException(status_code=400, detail="Failed to send email")

            return {
                "message": f"OTP has been sent successfully to {user.email}",
                "success": True,
                "transactionID": transaction_id,
            }

        except HTTPException:
            raise
        except Exception as e:
            print(f"Error in SendOTP: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def VerifyOTPControl(payload: OTP, response: Response):
        """Verify OTP and create/login user"""
        try:
            verify_result = await VerifyOTPbyUtils(payload.transactionID, payload.OTP)

            if not verify_result.get("valid"):
                raise HTTPException(
                    status_code=400,
                    detail=f"OTP verification failed: {verify_result.get('reason', 'Invalid OTP')}",
                )

            user_email = verify_result.get("email")
            if not user_email:
                raise HTTPException(
                    status_code=400, detail="Email not found in verification result"
                )

            user_exists = await db.user.find_one({"email": user_email})

            if not user_exists:
                user_id = str(uuid4())

                await db.user.insert_one(
                    {
                        "user_id": user_id,
                        "email": user_email,
                        "auth_provider": "OTP",
                        "is_verified": True,
                        "is_active": True,
                        "is_locked": False,
                        "google_sub": None,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "deleted_at": None,
                    }
                )

                GenerateToken(user_id, response)
                return {
                    "message": "User created and verified successfully",
                    "success": True,
                }

            if not user_exists.get("is_verified"):
                await db.user.update_one(
                    {"email": user_email},
                    {
                        "$set": {
                            "is_verified": True,
                            "is_active": True,
                            "auth_provider": "OTP",
                            "updated_at": datetime.utcnow(),
                        }
                    },
                )

            if user_exists.get("is_locked"):
                raise HTTPException(
                    status_code=403, detail="Account is locked. Please contact support."
                )

            if not user_exists.get("is_active", True):
                raise HTTPException(
                    status_code=403,
                    detail="Account is inactive. Please contact support.",
                )

            GenerateToken(user_exists["user_id"], response)
            return {"message": "Login successful", "success": True}

        except HTTPException:
            raise
        except Exception as e:
            print(f"Error in VerifyOTPControl: {e}")
            raise HTTPException(
                status_code=500, detail=f"Internal server error: {str(e)}"
            )

    @staticmethod
    async def redirect_to_uri(request: Request):
        """Redirect user to Google OAuth consent screen"""
        try:
            redirect_uri = request.url_for("google_callback")

            return await oauth.google.authorize_redirect(
                request,
                redirect_uri,
                prompt="select_account consent",
                access_type="offline",
            )

        except HTTPException:
            raise
        except Exception as e:
            print(f"Error in redirect_to_uri: {e}")
            raise HTTPException(
                status_code=500, detail="Failed to initiate Google login"
            )

    @staticmethod
    async def google_callback(request: Request, response: Response):
        """Handle Google OAuth callback and create/login user"""
        try:
            token = await oauth.google.authorize_access_token(request)

            user_info = token.get("userinfo")

            if not user_info:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to retrieve user information from Google",
                )

            email = user_info.get("email")
            google_sub = user_info.get("sub")
            name = user_info.get("name")

            if not email or not google_sub:
                raise HTTPException(
                    status_code=400, detail="Invalid user information from Google"
                )

            user = await db.user.find_one({"email": email})

            if not user:
                user_id = str(uuid4())
                await db.user.insert_one(
                    {
                        "name": name,
                        "user_id": user_id,
                        "email": email,
                        "google_sub": google_sub,
                        "auth_provider": "GOOGLE",
                        "is_verified": True,
                        "is_active": True,
                        "is_locked": False,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "deleted_at": None,
                    }
                )
            else:
                user_id = user["user_id"]

                if user.get("is_locked"):
                    raise HTTPException(
                        status_code=403,
                        detail="Account is locked. Please contact support.",
                    )

                if not user.get("is_active", True):
                    raise HTTPException(
                        status_code=403,
                        detail="Account is inactive. Please contact support.",
                    )

                if not user.get("google_sub"):
                    await db.user.update_one(
                        {"email": email},
                        {
                            "$set": {
                                "google_sub": google_sub,
                                "is_verified": True,
                                "updated_at": datetime.utcnow(),
                            }
                        },
                    )

            GenerateToken(user_id, response)

            # return RedirectResponse(url=f"{request.base_url}auth/success")
            return {"success": True, "message": "GOOGLE AUTHENTICATION SUCCESS"}

        except OAuthError as e:
            print(f"OAuth error: {e}")
            raise HTTPException(
                status_code=400,
                detail="Google login failed or expired. Please try again.",
            )
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error in google_callback: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def Logout_user(response: Response, request: Request):
        """Logout user by clearing authentication cookie"""
        try:
            token = request.cookies.get("user")

            if not token:
                raise HTTPException(status_code=401, detail="Not authenticated")

            response.delete_cookie(
                key="user",
                httponly=True,
                samesite="lax",
                secure=False,
            )

            return {"message": "Logged out successfully", "success": True}

        except HTTPException:
            raise
        except Exception as e:
            print(f"Error in Logout_user: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def fetch_user(user: dict):
        """Return current authenticated user information"""
        safe_user = {
            "user_id": user.get("user_id"),
            "email": user.get("email"),
            "auth_provider": user.get("auth_provider"),
            "is_verified": user.get("is_verified"),
            "is_active": user.get("is_active"),
            "created_at": user.get("created_at"),
        }

        return {"success": True, "user": safe_user}
