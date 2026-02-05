from fastapi import APIRouter, Request, Body
from controllers.share_controller import SharingController
from models.qr_model import QRVerifyRequest

router = APIRouter(prefix="/share", tags=["share"])


@router.post("/create")
async def create_session(req: Request, qr_token: QRVerifyRequest = Body(...)):
    return await SharingController.create_session(req, qr_token)
