from fastapi import APIRouter, Response, Request
from models.user_model import User, OTPverify
from controllers.user_controller import UserController


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
