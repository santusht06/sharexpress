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
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import List

from controllers.file_controller import FileController
from middlewares.sharing_token_middleware import verify_x_sharing_token
from slowapi import Limiter
from slowapi.util import get_remote_address
from models.File_setup import (
    UploadInitItem,
    UploadInitRequest,
    CompleteUploadItem,
    CompleteUploadRequest,
)

# Router
router = APIRouter(prefix="/files", tags=["files"])

# Rate limiter (IP based)
limiter = Limiter(key_func=get_remote_address)

# Create controller instance
file_controller = FileController()


@router.get("/health")
async def get_files_health():
    return {"success": True, "message": "File route working properly"}


@router.post("/init-upload")
@limiter.limit("20/minute")
async def init_upload(
    request: Request,
    payload: UploadInitRequest,
    session=Depends(verify_x_sharing_token),
):
    return await file_controller.init_upload(files=payload.files, session=session)


@router.post("/complete-upload")
async def complete_upload(
    data: CompleteUploadRequest,
    session=Depends(verify_x_sharing_token),
):
    controller = FileController()

    files_as_dict = [f.model_dump() for f in data.files]

    return await controller.complete_upload(files_as_dict, session)


@router.get("/download/{file_id}")
async def download_file(
    file_id: str,
    session=Depends(verify_x_sharing_token),
):
    return await file_controller.generate_download_url(file_id=file_id, session=session)


@router.get("/metrics")
async def get_metrics():
    return await file_controller.get_metrics()


@router.get("/system-health")
async def system_health():
    return await file_controller.health_check()
