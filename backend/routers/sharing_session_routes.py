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
from fastapi import APIRouter, Request, Body, Response, Depends, WebSocket
from controllers.share_controller import SharingController
from models.qr_model import QRVerifyRequest
from middlewares.sharing_token_middleware import verify_x_sharing_token
from models.sharing_session_creation_model import (
    AcceptSessionRequest,
    RejectSessionRequest,
)

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


@router.websocket("/ws/{user_id}")
async def WS_ENDPOINT(websocket: WebSocket, user_id: str):
    return await SharingController.websocket_endpoint(websocket, user_id)


@router.post("/request")
async def request_session(req: Request, qr_token: QRVerifyRequest):
    return await SharingController.RS(req, qr_token)
