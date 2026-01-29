from uuid import UUID
from core.database import get_db
from fastapi import Request, Response, HTTPException
from datetime import datetime, timedelta
from uuid import uuid4

db = get_db()


async def get_user_by_id(user_id: str):
    user = await db.user.find_one(
        {
            "user_id": str(user_id),
            "is_active": True,
            "deleted_at": None,
        },
        {"_id": 0},
    )
    return user


SESSION_TTL_MINUTES = 30


async def get_or_create_guest_session(request: Request, response: Response):
    session_id = request.cookies.get("session_id")

    if session_id:
        session = await db.sessions.find_one(
            {
                "session_id": session_id,
                "is_active": True,
                "expires_at": {"$gt": datetime.utcnow()},
            }
        )

        if session:
            await db.sessions.update_one(
                {"session_id": session_id},
                {"$set": {"last_active_at": datetime.utcnow()}},
            )
            return session

    new_session_id = str(uuid4())
    expires_at = datetime.utcnow() + timedelta(minutes=SESSION_TTL_MINUTES)

    session_data = {
        "session_id": new_session_id,
        "is_guest": True,
        "is_active": True,
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "created_at": datetime.utcnow(),
        "last_active_at": datetime.utcnow(),
        "expires_at": expires_at,
    }

    await db.sessions.insert_one(session_data)

    response.set_cookie(
        key="session_id",
        value=new_session_id,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=SESSION_TTL_MINUTES * 60,
    )

    return session_data
