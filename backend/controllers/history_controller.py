from core.database import get_db
from fastapi import HTTPException

from models.history_model import UserMeta, FileMeta, TransferHistory
from datetime import datetime


class HistoryController:
    @staticmethod
    async def create_History(session: dict, files: list):
        try:
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

            await db.transfer_history.insert_one(history.dict())

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
