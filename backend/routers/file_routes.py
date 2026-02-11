from fastapi import Depends, HTTPException, Request, Response, Body, APIRouter
from controllers.file_controller import File_controllers

router = APIRouter(prefix="/files", tags=["files"])


@router.get("/health")
async def check_file_health():
    return await {"success": True}


@router.post("/upload")
async def upload_files():
    return await File_controllers.share_files()
