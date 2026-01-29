from fastapi import Request, HTTPException, Response
from utils.user_repo import get_or_create_guest_session
from models.qr_model import QRCode
from core.database import get_db
from datetime import datetime, timedelta
from utils.qr_generate import generate_qr_token
from uuid import uuid4
from utils.JWT import get_current_user_optional

db = get_db()


class Qr_controller:
    @staticmethod
    async def create_QR(request: Request, response: Response):
        try:
            current_user = await get_current_user_optional(request)

            if current_user:
                owner_type = "user"
                owner_id = current_user["user_id"]
                expires_at = None
                is_permanent = True
                response.delete_cookie("session_id")

            else:
                session = await get_or_create_guest_session(request, response)
                owner_type = "session"
                owner_id = session["session_id"]
                expires_at = datetime.utcnow() + timedelta(minutes=10)
                is_permanent = False

                response.delete_cookie("user")

            qr_token = generate_qr_token()

            qr_data = {
                "qr_id": str(uuid4()),
                "qr_token": qr_token,
                "owner_type": owner_type,
                "owner_id": owner_id,
                "is_permanent": is_permanent,
                "is_active": True,
                "expires_at": expires_at,
                "created_at": datetime.utcnow(),
            }

            await db.qr_codes.delete_many(
                {"owner_type": owner_type, "owner_id": owner_id}
            )

            await db.qr_codes.insert_one(qr_data)

            return {
                "success": True,
                "qr_token": qr_token,
                "owner_type": owner_type,
                "expires_at": expires_at,
                "is_permanent": is_permanent,
                "is_active": True,
                "expires_at": expires_at,
                "created_at": datetime.utcnow(),
            }

        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERROR")
