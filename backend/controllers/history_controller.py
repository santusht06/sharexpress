from core.database import get_db
from fastapi import HTTPException

from models.history_model import UserMeta, FileMeta, TransferHistory
from datetime import datetime
from fastapi.responses import StreamingResponse
import zipfile
import io
from core.s3_config import s3_internal
from core.config import MINIO_BUCKET


class HistoryController:
    async def _get_storage_key(self, file_id):
        from core.database import get_db

        db = get_db()
        file_doc = await self.db.files.find_one({"file_id": file_id})
        return file_doc["storage_key"]

    @staticmethod
    async def create_History(session: dict, files: list):
        try:
            print(files)
            db = get_db()

            if not session:
                raise HTTPException(status_code=400, detail="Session not found")

            sender = UserMeta(
                user_id=session.get("sender_ID"),
                name=session.get("sender_name"),
                user_type=session.get("sender_type"),
            )

            receiver = UserMeta(
                user_id=session.get("receiver_ID"),
                name=session.get("reciever_name"),
                user_type=session.get("receiver_type"),
            )

            file_meta_list = []
            total_size = 0

            for f in files:
                file_meta = FileMeta(
                    file_id=f.get("file_id"),
                    filename=f.get("filename"),
                    size=f.get("size"),
                    mime_type=f.get("mime_type"),
                )
                file_meta_list.append(file_meta)
                total_size += f.get("size", 0)

            history = TransferHistory(
                sender=sender,
                receiver=receiver,
                direction="sender_to_receiver",
                files=file_meta_list,
                total_files=len(file_meta_list),
                total_size=total_size,
                sharing_session_id=session.get("sharing_session_ID"),
                completed_at=datetime.utcnow(),
                status="completed",
            )

            history_dict = history.dict()

            # ✅ Convert UUID to string
            history_dict["transfer_id"] = str(history_dict["transfer_id"])

            await db.transfer_history.insert_one(history_dict)

            return {
                "success": True,
                "transfer_id": str(history.transfer_id),
                "total_files": history.total_files,
            }

        except HTTPException:
            raise

        except Exception as e:
            print("History Error:", e)
            raise HTTPException(status_code=500, detail="FAILED TO CREATE HISTORY")

    @staticmethod
    async def get_history(
        user: dict, type: str = "all", page: int = 0, limit: int = 20
    ):
        try:
            db = get_db()

            user_id = user.get("user_id")

            if not user_id:
                raise HTTPException(status_code=401, detail="Unauthorized")

            query = {}

            if type == "sent":
                query = {"sender.user_id": user_id}

            elif type == "received":
                query = {"receiver.user_id": user_id}

            else:  # "all"
                query = {
                    "$or": [
                        {"sender.user_id": user_id},
                        {"receiver.user_id": user_id},
                    ]
                }

            skip = page * limit

            cursor = (
                db.transfer_history.find(query, {"_id": 0})
                .sort("created_at", -1)
                .skip(skip)
                .limit(limit)
            )

            history = await cursor.to_list(length=limit)

            total = await db.transfer_history.count_documents(query)

            return {
                "success": True,
                "page": page,
                "limit": limit,
                "total": total,
                "has_more": skip + limit < total,
                "history": history,
            }

        except HTTPException:
            raise

        except Exception as e:
            print("GET HISTORY ERROR:", e)
            raise HTTPException(status_code=500, detail="FAILED TO FETCH HISTORY")

    @staticmethod
    async def get_one_history(transfer_id: str, user: dict):
        try:
            db = get_db()

            # 🔍 Find history
            history = await db.transfer_history.find_one({"transfer_id": transfer_id})

            if not history:
                raise HTTPException(status_code=404, detail="History not found")

            if (
                history["sender"]["user_id"] != user["user_id"]
                and history["receiver"]["user_id"] != user["user_id"]
            ):
                raise HTTPException(status_code=403, detail="Unauthorized")

            history["_id"] = str(history["_id"])

            return {"success": True, "data": history}

        except HTTPException:
            raise

        except Exception as e:
            print("Get one history error:", e)
            raise HTTPException(status_code=500, detail="Failed to fetch history")

    @staticmethod
    async def download_transfer_zip(transfer_id: str, user: dict):
        db = get_db()

        history = await db.transfer_history.find_one({"transfer_id": transfer_id})
        if not history:
            raise HTTPException(status_code=404, detail="Transfer not found")

        if (
            history["sender"]["user_id"] != user["user_id"]
            and history["receiver"]["user_id"] != user["user_id"]
        ):
            raise HTTPException(status_code=403, detail="Unauthorized")

        files = history.get("files", [])

        if not files:
            raise HTTPException(status_code=404, detail="No files in transfer")

        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for file in files:
                file_doc = await db.files.find_one(
                    {"file_id": file["file_id"]},
                    {"storage_key": 1, "_id": 0},
                )

                if not file_doc:
                    continue

                storage_key = file_doc["storage_key"]

                try:
                    obj = s3_internal.get_object(
                        Bucket=MINIO_BUCKET,
                        Key=storage_key,
                    )

                    data = obj["Body"].read()

                    zip_file.writestr(file["filename"], data)

                except Exception as e:
                    print("File fetch failed:", file["file_id"], e)
                    continue

        zip_buffer.seek(0)

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="sharexpress_{transfer_id[:8]}.zip"'
            },
        )
