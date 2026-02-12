from fastapi import (
    Depends,
    HTTPException,
    Request,
    Response,
    Body,
    APIRouter,
    File,
    UploadFile,
)
from controllers.file_controller import FileController
from middlewares.sharing_token_middleware import verify_x_sharing_token
from typing import List

router = APIRouter(prefix="/files", tags=["files"])


@router.get("/health")
async def check_file_health():
    return {"success": True}


@router.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    sharing_session=Depends(verify_x_sharing_token),
):
    return await FileController.upload_files(files, sharing_session)
