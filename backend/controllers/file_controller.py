from fastapi import HTTPException, UploadFile
from uuid import uuid4
from core.database import get_db
from datetime import datetime
from typing import List
import aiofiles
import os
import asyncio
import mimetypes

db = get_db()


class FileController:
    MAX_FILE_SIZE = 20 * 1024 * 1024
    MAX_TOTAL_SIZE = 100 * 1024 * 1024
    CHUNK_SIZE = 1024 * 1024
    UPLOAD_SEMAPHORE = asyncio.Semaphore(3)

    @staticmethod
    def detect_category(mime_type: str) -> str:
        if mime_type.startswith("image/"):
            return "image"
        elif mime_type.startswith("video/"):
            return "video"
        elif mime_type.startswith("audio/"):
            return "audio"
        elif mime_type in [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]:
            return "document"
        return "other"

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        return os.path.basename(filename).replace(" ", "_")

    @staticmethod
    async def upload_files(files: List[UploadFile], session: dict):

        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")

        sharing_session_id = session["sharing_session_ID"]
        owner_id = session["sender_ID"]
        owner_type = session["sender_type"]

        base_path = "/mnt/storage"
        total_request_size = 0
        file_docs = []

        for file in files:
            async with FileController.UPLOAD_SEMAPHORE:
                file_id = str(uuid4())
                safe_filename = FileController.sanitize_filename(file.filename)
                storage_key = f"{sharing_session_id}/{file_id}_{safe_filename}"
                full_path = os.path.join(base_path, storage_key)

                os.makedirs(os.path.dirname(full_path), exist_ok=True)

                size = 0

                try:
                    async with aiofiles.open(full_path, "wb") as out:
                        while chunk := await file.read(FileController.CHUNK_SIZE):
                            size += len(chunk)
                            total_request_size += len(chunk)

                            if size > FileController.MAX_FILE_SIZE:
                                raise HTTPException(
                                    status_code=400,
                                    detail=f"{file.filename} exceeds 20MB limit",
                                )

                            if total_request_size > FileController.MAX_TOTAL_SIZE:
                                raise HTTPException(
                                    status_code=400,
                                    detail="Total upload size exceeded (100MB)",
                                )

                            await out.write(chunk)

                except Exception as e:
                    if os.path.exists(full_path):
                        os.remove(full_path)
                    raise e

                mime_type = (
                    file.content_type
                    or mimetypes.guess_type(file.filename)[0]
                    or "application/octet-stream"
                )
                category = FileController.detect_category(mime_type)

                file_docs.append(
                    {
                        "file_id": file_id,
                        "sharing_session_id": sharing_session_id,
                        "sender_ID": owner_id,
                        "sender_type": owner_type,
                        "original_name": file.filename,
                        "mime_type": mime_type,
                        "size": size,
                        "storage_key": storage_key,
                        "file_category": category,
                        "upload_status": "uploaded",
                        "is_deleted": False,
                        "created_at": datetime.utcnow(),
                    }
                )

        if file_docs:
            await db.files.insert_many(file_docs)

        return {
            "success": True,
            "files_uploaded": len(file_docs),
        }
