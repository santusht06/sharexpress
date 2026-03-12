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
from fastapi import APIRouter, Request, Body, Response, Depends
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


@router.post("/request")
async def request_session(
    req: Request,
    qr_token: QRVerifyRequest = Body(...),
):
    return await SharingController.request_session(req, qr_token)


@router.post("/accept")
async def accept_session(
    req: Request,
    response: Response,
    data: AcceptSessionRequest = Body(...),
):
    return await SharingController.accept_session(
        req,
        response,
        QRVerifyRequest(qr_token=data.qr_token),
        data.sender_id,
    )


@router.post("/reject")
async def reject_session(data: RejectSessionRequest = Body(...)):
    return await SharingController.reject_session(data.sender_id)
