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
from fastapi import APIRouter, Request, Body
from controllers.share_controller import SharingController
from models.qr_model import QRVerifyRequest

router = APIRouter(prefix="/share", tags=["share"])


@router.post("/create")
async def create_session(req: Request, qr_token: QRVerifyRequest = Body(...)):
    return await SharingController.create_session(req, qr_token)
