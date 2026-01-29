from fastapi import APIRouter, Response, Request, Depends
from models.user_model import User, OTPverify
from controllers.user_controller import UserController
from utils.JWT import check_auth_middleware, check_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/sendOTP")
async def send_otp(
    user: User,
    _: None = Depends(check_token),
):
    return await UserController.SendOTP(user)


@router.post("/verifyOTP")
async def verify_otp(
    payload: OTPverify,
    response: Response,
    _: None = Depends(check_token),
):
    return await UserController.VerifyOTPControl(payload, response)


@router.get("/google/login")
async def google_login(request: Request):
    return await UserController.redirect_to_uri(request)


@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request, response: Response):
    return await UserController.google_callback(request, response)


@router.post("/logout")
async def logout(response: Response, request: Request):
    return await UserController.Logout_user(response, request)


@router.get("/me")
async def get_current_user(user=Depends(check_auth_middleware)):
    return await UserController.fetch_user(user)


@router.get("/success")
async def auth_success():
    return {
        "success": True,
        "message": "Authentication successful",
        "redirect": "You can close this window or redirect to your app",
    }
