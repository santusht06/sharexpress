from fastapi import Request, HTTPException, Response
from utils.user_repo import get_or_create_guest_session
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
                is_permanent = True
                expires_at = None

                existing_qr = await db.qr_codes.find_one(
                    {
                        "owner_type": "user",
                        "owner_id": owner_id,
                        "is_active": True,
                    }
                )

                if existing_qr:
                    return {
                        "success": True,
                        "qr_id": existing_qr["qr_id"],
                        "qr_token": existing_qr["qr_token"],
                        "owner_type": "user",
                        "is_permanent": True,
                        "is_active": True,
                        "expires_at": None,
                        "created_at": existing_qr["created_at"].isoformat(),
                    }

            else:
                session = await get_or_create_guest_session(request, response)
                owner_type = "session"
                owner_id = session["session_id"]
                is_permanent = False
                expires_at = datetime.utcnow() + timedelta(minutes=10)

                await db.qr_codes.delete_many(
                    {"owner_type": "session", "owner_id": owner_id}
                )

            qr_token = generate_qr_token()
            qr_id = str(uuid4())

            qr_data = {
                "qr_id": qr_id,
                "qr_token": qr_token,
                "owner_type": owner_type,
                "owner_id": owner_id,
                "is_permanent": is_permanent,
                "is_active": True,
                "expires_at": expires_at,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }

            await db.qr_codes.insert_one(qr_data)

            return {
                "success": True,
                "qr_id": qr_id,
                "qr_token": qr_token,
                "owner_type": owner_type,
                "is_permanent": is_permanent,
                "is_active": True,
                "expires_at": expires_at.isoformat() if expires_at else None,
                "created_at": qr_data["created_at"].isoformat(),
            }

        except Exception as e:
            print(f"Error in create_QR: {e}")
            raise HTTPException(status_code=500, detail="Failed to create QR code")

    @staticmethod
    async def verify_QR(qr_token: str):
        try:
            qr_code = await db.qr_codes.find_one({"qr_token": qr_token})

            if not qr_code:
                raise HTTPException(status_code=404, detail="QR code not found")

            if not qr_code.get("is_active"):
                raise HTTPException(status_code=400, detail="QR code is not active")

            if qr_code.get("expires_at"):
                if datetime.utcnow() > qr_code["expires_at"]:
                    # Deactivate expired QR code
                    await db.qr_codes.update_one(
                        {"qr_token": qr_token}, {"$set": {"is_active": False}}
                    )
                    raise HTTPException(status_code=400, detail="QR code has expired")

            return {
                "success": True,
                "qr_id": qr_code["qr_id"],
                "owner_type": qr_code["owner_type"],
                "owner_id": qr_code["owner_id"],
                "is_permanent": qr_code["is_permanent"],
            }

        except HTTPException:
            raise
        except Exception as e:
            print(f"Error in verify_QR: {e}")
            raise HTTPException(status_code=500, detail="Failed to verify QR code")

    @staticmethod
    async def deactivate_QR(qr_token: str, user_id: str = None):
        """
        Deactivate QR code (optional: verify ownership)
        """
        try:
            qr_code = await db.qr_codes.find_one({"qr_token": qr_token})

            if not qr_code:
                raise HTTPException(status_code=404, detail="QR code not found")

            if user_id and qr_code.get("owner_type") == "user":
                if qr_code.get("owner_id") != user_id:
                    raise HTTPException(
                        status_code=403,
                        detail="Not authorized to deactivate this QR code",
                    )

            await db.qr_codes.update_one(
                {"qr_token": qr_token},
                {"$set": {"is_active": False, "updated_at": datetime.utcnow()}},
            )

            return {"success": True, "message": "QR code deactivated successfully"}

        except HTTPException:
            raise
        except Exception as e:
            print(f"Error in deactivate_QR: {e}")
            raise HTTPException(status_code=500, detail="Failed to deactivate QR code")

    @staticmethod
    async def get_user_qr_codes(user_id: str):
        try:
            qr_codes = await db.qr_codes.find(
                {"owner_type": "user", "owner_id": user_id}, {"_id": 0}
            ).to_list(length=100)

            for qr in qr_codes:
                if qr.get("created_at"):
                    qr["created_at"] = qr["created_at"].isoformat()
                if qr.get("updated_at"):
                    qr["updated_at"] = qr["updated_at"].isoformat()
                if qr.get("expires_at"):
                    qr["expires_at"] = qr["expires_at"].isoformat()

            return {"success": True, "qr_codes": qr_codes, "count": len(qr_codes)}

        except Exception as e:
            print(f"Error in get_user_qr_codes: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch QR codes")
