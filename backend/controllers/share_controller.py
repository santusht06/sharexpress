from models.sharing_session_creation_model import SharingSession, Status
from fastapi import Request, Response, HTTPException, Body
from core.database import get_db
from utils.JWT import get_current_user_optional
from models.qr_model import QRVerifyRequest
from utils.mongo_format_ import serialize_mongo
from enum import Enum
from typing import Dict

db = get_db()


class ParticipantsType(str, Enum):
    USER = "user"
    SESSION = "session"


class SharingController:
    @staticmethod
    async def get_sender_info(request: Request) -> tuple:
        """
        Get receiver information from request
        Returns: (receiver_type, receiver_id)
        """
        current_user = await get_current_user_optional(request)

        if current_user:
            # Authenticated user
            sender_type = ParticipantsType.USER.value
            sender_id = current_user["user_id"]
        else:
            # Guest session
            sender_type = ParticipantsType.SESSION.value
            session_id = request.cookies.get("guest_session")

            if not session_id:
                raise HTTPException(
                    status_code=401, detail="No authentication or guest session found"
                )

            sender_id = session_id

        return (
            sender_type,
            sender_id,
        )

    @staticmethod
    async def get_reciever_details_by_token(qr_token: QRVerifyRequest):
        qr_token_t = qr_token.qr_token

        reciever_details = await db.qr_codes.find_one({"qr_token": qr_token_t})

        if not reciever_details:
            raise HTTPException(status_code=404, detail="QR NOT FOUND OR EXPIRED")

        owner_type = reciever_details["owner_type"]

        if owner_type == ParticipantsType.SESSION.value:
            reciever_type = ParticipantsType.SESSION.value
            reciever_id = reciever_details["owner_id"]

        elif owner_type == ParticipantsType.USER.value:
            reciever_type = ParticipantsType.USER.value
            reciever_id = reciever_details["owner_id"]

        else:
            raise HTTPException(status_code=400, detail="OWNER TYPE MUST BE DEFINED")

        return (
            reciever_type,
            reciever_id,
        )

    @staticmethod
    async def create_session(req: Request, qr_token: QRVerifyRequest):
        try:
            print(qr_token.qr_token)

            (
                sender_type,
                sender_id,
            ) = await SharingController.get_sender_info(req)

            sender_user_details = {
                "sender_type": sender_type,
                "sender_id": sender_id,
            }

            print("SENDER DETAILS = ", sender_user_details["sender_type"])

            (
                reciever_type,
                reciever_id,
            ) = await SharingController.get_reciever_details_by_token(qr_token)

            reciever_QR_scanned_details = {
                "reciever_type": reciever_type,
                "reciever_id": reciever_id,
            }

            check_existing_session = await db.sharing_session.find_one(
                {
                    "qr_token": qr_token.qr_token,
                    "sender_type": sender_user_details["sender_type"],
                    "sender_ID": sender_user_details["sender_id"],
                    "receiver_ID": reciever_QR_scanned_details["reciever_id"],
                    "receiver_type": reciever_QR_scanned_details["reciever_type"],
                    "is_active": True,
                    "status": Status.ACTIVE,
                }
            )

            if check_existing_session:
                raise HTTPException(status_code=400, detail="SESSION ALREADY CREATED")

            session_data = SharingSession(
                qr_token=qr_token.qr_token,
                sender_ID=sender_user_details["sender_id"],
                sender_type=ParticipantsType(sender_user_details["sender_type"]),
                receiver_ID=reciever_QR_scanned_details["reciever_id"],
                receiver_type=ParticipantsType(
                    reciever_QR_scanned_details["reciever_type"]
                ),
                status=Status.ACTIVE,
                is_active=True,
            )

            session_dict = session_data.dict()

            insert_session = await db.sharing_session.insert_one(session_dict)

            if not insert_session.inserted_id:
                raise HTTPException(
                    status_code=400,
                    detail="ERROR OCCURED WHILE INSERTING DATA IN DATABASE",
                )

            print(insert_session)

            return {
                "qr_token": qr_token.qr_token,
                "sender_type": serialize_mongo(sender_user_details),
                "receiver_user_details": serialize_mongo(reciever_QR_scanned_details),
            }

        except HTTPException:
            raise
        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERROR")
