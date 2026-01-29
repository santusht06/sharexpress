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


db = get_db()


class UserController:
    @staticmethod
    async def SendOTP(user: User):
        try:
            print(user.email)
            if user.email is None:
                raise HTTPException(status_code=404, detail="EMAIL NOT FOUND")

            OTP = generateOTP()

            validateOTP = await sendOTP(user.email, OTP)

            if not validateOTP.get("success"):
                raise HTTPException(
                    status_code=400, detail="SOMETHING WENT WRONG TO GENERATE OTP"
                )

            TRANSACTIONID = validateOTP.get("transactionID")
            sendMail = await send_otp_email(user.email, OTP)

            sendMail = True
            if sendMail is False:
                raise HTTPException(status_code=400, detail="ERROR IN SENDING MAIL")

            return {
                "message": f"OTP HAS BEEN SENT SUCCESSFULLY TO {user.email} ",
                "success": True,
                "TRANSACTIONID": TRANSACTIONID,
            }

        except HTTPException:
            raise

        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERRROR")

    @staticmethod
    async def VerifyOTPControl(payload: OTP, response: Response):
        try:
            verify_result = await VerifyOTPbyUtils(payload.transactionID, payload.OTP)

            if verify_result.get("valid") is not True:
                raise HTTPException(
                    status_code=400,
                    detail=f"OTP verification failed: {verify_result.get('reason')}",
                )

            userEmail = verify_result["email"]
            userexists = await db.user.find_one({"email": userEmail})

            if not userexists:
                user_id = str(uuid4())

                await db.user.insert_one(
                    {
                        "user_id": user_id,
                        "email": userEmail,
                        "is_verified": True,
                        "auth_provider": "OTP",
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                    }
                )

                GenerateToken(user_id, response)
                return {"message": "User created and verified", "success": True}

            if not userexists.get("is_verified"):
                await db.user.update_one(
                    {"email": userEmail},
                    {"$set": {"is_verified": True, "updated_at": datetime.utcnow()}},
                )

            GenerateToken(userexists["user_id"], response)
            return {"message": "Login successful", "success": True}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"INTERNAL SERVER ERROR: {str(e)}"
            )

    @staticmethod
    async def redirect_to_uri(request: Request):
        try:
            redirect_uri = request.url_for("google_callback")

            if redirect_uri is None:
                raise HTTPException(
                    status_code=400, detail="ERROR OCCURED WHILE LOGGING VIA GOOGLE"
                )
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
            print(e)
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERROR")

    @staticmethod
    async def google_callback(request: Request, response: Response):
        try:
            token = await oauth.google.authorize_access_token(request)
            user_info = token.get("userinfo")

            if not user_info:
                raise Exception("Google auth failed")

            email = user_info["email"]
            google_sub = user_info["sub"]

            user = await db.user.find_one({"email": email})

            if not user:
                user_id = str(uuid4())
                await db.user.insert_one(
                    {
                        "user_id": user_id,
                        "email": email,
                        "google_sub": google_sub,
                        "auth_provider": "GOOGLE",
                        "is_verified": True,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                    }
                )
                GenerateToken(user_id, response)
                return {"message": "User registered via Google", "success": True}

            if not user.get("google_sub"):
                await db.user.update_one(
                    {"email": email}, {"$set": {"google_sub": google_sub}}
                )

            GenerateToken(user["user_id"], response)
            return {"message": "Google login successful", "success": True}

        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERROR")

    @staticmethod
    async def Logout_user(response: Response, request: Request):
        try:
            token = request.cookies.get("user")

            if not token:
                raise HTTPException(status_code=404, detail="TOKEN NOT FOUND")

            response.delete_cookie(key="user", httponly=True, samesite="lax")

        except HTTPException:
            raise
        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERROR")
