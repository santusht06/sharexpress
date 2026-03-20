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
from fastapi import (
    APIRouter,
    Request,
    Body,
    Response,
    Depends,
    WebSocket,
    WebSocketDisconnect,
)
from controllers.share_controller import SharingController
from models.qr_model import QRVerifyRequest
from middlewares.sharing_token_middleware import verify_x_sharing_token
from core.ws_manager import ws_manager
import json

router = APIRouter(prefix="/share", tags=["share"])


@router.post("/create")
async def create_session(
    req: Request,
    response: Response,
    qr_token: QRVerifyRequest = Body(...),
):
    return await SharingController.create_session(req, qr_token, response)


@router.delete("/revoke")
async def revoke_session(res: Response, session=Depends(verify_x_sharing_token)):
    return await SharingController.terminate_session(session, res)


@router.get("/check")
async def check_session(session: dict = Depends(verify_x_sharing_token)):
    if session:
        return {
            "success": True,
            "mode": session["status"],
            "sender_name": session["sender_name"],
            "reciever_name": session["reciever_name"],
        }

    return {"success": False, "message": "TOKEN EXPIRED OR NOT FOUND"}


@router.post("/connect_session")
async def connect_session(session: dict = Depends(verify_x_sharing_token)):
    return await SharingController.connect_sender_receiver(session)


@router.websocket("/ws/{QR_ID}")
async def websocket_endpoint(websocket: WebSocket, QR_ID: str):

    await ws_manager.connect(QR_ID, websocket)

    # 🔥 TEST MESSAGE
    await websocket.send_json(
        {"type": "test_connection", "msg": "WS WORKING", "qr_id": QR_ID}
    )

    try:
        while True:
            data = await websocket.receive_text()
            print("Received:", data)

    except WebSocketDisconnect:
        ws_manager.disconnect(QR_ID)


@router.get("/test_ws/{qr_id}")
async def test_ws(qr_id: str):
    await ws_manager.send_to_user(
        qr_id, {"type": "manual_test", "msg": "HELLO FROM API"}
    )
    return {"success": True}
