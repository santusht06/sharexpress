from fastapi import APIRouter, Request, Response
from controllers.qr_controller import Qr_controller

router = APIRouter(prefix="/QR", tags=["QR"])


@router.post("/create")
async def generate_qr(request: Request, response: Response):
    return await Qr_controller.create_QR(request, response)
