from fastapi import APIRouter, Request, Response, Depends
from controllers.qr_controller import Qr_controller
from utils.JWT import check_auth_middleware
from pydantic import BaseModel

router = APIRouter(prefix="/QR", tags=["QR"])


class QRVerifyRequest(BaseModel):
    qr_token: str


class QRDeactivateRequest(BaseModel):
    qr_token: str


@router.post("/create")
async def generate_qr(request: Request, response: Response):
    return await Qr_controller.create_QR(request, response)


#  IS SAB KO BAAD ME DEKHENGE


# @router.post("/verify")
# async def verify_qr(payload: QRVerifyRequest):
#     """
#     Verify a QR code token
#     Returns QR code details if valid and not expired
#     """
#     return await Qr_controller.verify_QR(payload.qr_token)


# @router.post("/deactivate")
# async def deactivate_qr(
#     payload: QRDeactivateRequest, user=Depends(check_auth_middleware)
# ):
#     """
#     Deactivate a QR code (requires authentication)
#     Users can only deactivate their own QR codes
#     """
#     return await Qr_controller.deactivate_QR(payload.qr_token, user["user_id"])


# @router.get("/my-qr-codes")
# async def get_my_qr_codes(user=Depends(check_auth_middleware)):
#     """
#     Get all QR codes for the authenticated user
#     """
#     return await Qr_controller.get_user_qr_codes(user["user_id"])
