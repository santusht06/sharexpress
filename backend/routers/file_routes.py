from fastapi import APIRouter, Depends, HTTPException, Request
from controllers.file_controller import FileController
from middlewares.sharing_token_middleware import verify_x_sharing_token
from pydantic import BaseModel
from core.s3_config import s3_client
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/files", tags=["files"])


limiter = Limiter(key_func=get_remote_address)


class UploadInitRequest(BaseModel):
    filename: str
    content_type: str
    size: int


@router.get("/health")
async def get_files_health():
    return await {"success": True, "MESSAGE": "FILE ROUTE HEALTH CHECKED SUCCESS "}


@router.post("/init-upload")
@limiter.limit("20/minute")
async def init_upload(
    request: Request,
    data: UploadInitRequest,
    session=Depends(verify_x_sharing_token),
):
    return await FileController.init_upload(data, session)


@router.post("/complete-upload")
async def complete_upload(
    file_id: str,
    storage_key: str,
    size: int,
    content_type: str,
    session=Depends(verify_x_sharing_token),
):
    return await FileController.complete_upload(
        file_id, storage_key, size, content_type, session
    )


@router.get("/download/{file_id}")
async def download_file(
    file_id: str,
    session=Depends(verify_x_sharing_token),
):
    return await FileController.generate_download_url(file_id, session)


@router.get("/debugs3")
async def debug_s3():
    buckets = s3_client.list_buckets()
    return buckets
