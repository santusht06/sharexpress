from fastapi import APIRouter, Response, Request, Depends
from models.user_model import User, OTPverify
from controllers.user_controller import UserController
from utils.JWT import check_auth_middleware


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/sendOTP")
async def SendOTP(user: User):
    return await UserController.SendOTP(user)


@router.post("/verifyOTP")
async def VerifyOTP(payload: OTPverify, response: Response):
    return await UserController.VerifyOTPControl(payload, response)


@router.get("/google/login")
async def google_login(request: Request):
    return await UserController.redirect_to_uri(request)


@router.get("/google/callback", name="google_callback")
async def google_callback_function(request: Request, response: Response):
    return await UserController.google_callback(request, response)


@router.post("/logout")
async def logout_user(response: Response, request: Request):
    return await UserController.Logout_user(response, request)


@router.get("/me")
async def fetch_me(user=Depends(check_auth_middleware)):
    return await UserController.fetch_user(user)
