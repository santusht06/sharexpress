import asyncio
import os
from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException
from core.database import get_db
from core.s3_config import s3_client
from core.config import MINIO_BUCKET
import magic  # python-magic for real mime detection

db = get_db()


class FileController:
    MAX_FILE_SIZE = 20 * 1024 * 1024
    MAX_FILES_PER_REQUEST = 30
    PARALLEL_LIMIT = 10

    UPLOAD_SEMAPHORE = asyncio.Semaphore(PARALLEL_LIMIT)

    # ---------------------------
    # VALIDATION
    # ---------------------------

    @staticmethod
    def validate_batch(files):
        if len(files) > FileController.MAX_FILES_PER_REQUEST:
            raise HTTPException(
                status_code=400,
                detail="Maximum 30 files allowed per request",
            )

        total_size = sum(f.size for f in files)

        if (
            total_size
            > FileController.MAX_FILE_SIZE * FileController.MAX_FILES_PER_REQUEST
        ):
            raise HTTPException(
                status_code=400,
                detail="Total batch size exceeded",
            )

        for f in files:
            if f.size > FileController.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"{f.filename} exceeds 20MB limit",
                )

    # ---------------------------
    # INIT MULTI UPLOAD
    # ---------------------------

    @staticmethod
    async def init_upload(files, session):

        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")

        FileController.validate_batch(files)

        sharing_session_id = session["sharing_session_ID"]

        async def generate_url(file_data):
            async with FileController.UPLOAD_SEMAPHORE:
                file_id = str(uuid4())
                safe_name = os.path.basename(file_data.filename)

                object_key = f"{sharing_session_id}/{file_id}_{safe_name}"

                url = s3_client.generate_presigned_url(
                    "put_object",
                    Params={
                        "Bucket": MINIO_BUCKET,
                        "Key": object_key,
                        "ContentType": file_data.content_type,
                    },
                    ExpiresIn=600,
                )

                return {
                    "file_id": file_id,
                    "storage_key": object_key,
                    "upload_url": url,
                }

        results = await asyncio.gather(*(generate_url(f) for f in files))

        return {"files": results}

    # ---------------------------
    # COMPLETE UPLOAD
    # ---------------------------

    @staticmethod
    async def complete_upload(files, session):

        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")

        docs = []

        for f in files:
            # Verify object exists in MinIO
            try:
                s3_client.head_object(
                    Bucket=MINIO_BUCKET,
                    Key=f["storage_key"],
                )
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail=f"Object {f['storage_key']} not found in storage",
                )

            docs.append(
                {
                    "file_id": f["file_id"],
                    "sharing_session_id": session["sharing_session_ID"],
                    "sender_ID": session["sender_ID"],
                    "sender_type": session["sender_type"],
                    "storage_key": f["storage_key"],
                    "size": f["size"],
                    "mime_type": f["content_type"],
                    "is_deleted": False,
                    "created_at": datetime.utcnow(),
                }
            )

        if docs:
            await db.files.insert_many(docs)

        return {"success": True, "files_saved": len(docs)}
