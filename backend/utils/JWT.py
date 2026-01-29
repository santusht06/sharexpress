from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Response, Request
import os
from pathlib import Path
from typing import Optional
from uuid import UUID
from utils.user_repo import get_user_by_id
from fastapi import HTTPException
from core.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRES
from core.database import get_db


db = get_db()


PRIVATE_KEY = Path("private.pem").read_text()
PUBLIC_KEY = Path("public.pem").read_text()


JWT_SECRET = JWT_SECRET
JWT_ALGORITHM = JWT_ALGORITHM
JWT_EXPIRES = JWT_EXPIRES


def GenerateToken(user_id: str, response: Response) -> str:
    try:
        payload = {
            "sub": user_id,
            "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRES),
        }

        token = jwt.encode(payload, PRIVATE_KEY, algorithm=JWT_ALGORITHM)

        response.set_cookie(
            key="user",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=JWT_EXPIRES * 24 * 60 * 60,
        )

        return token

    except Exception as e:
        print("ERROR IN GENERATING TOKEN = ", e)
        return False


async def get_current_user_optional(request: Request):
    token: Optional[str] = request.cookies.get("user")

    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            PUBLIC_KEY,
            algorithms=[JWT_ALGORITHM],
        )

        user_id = payload.get("sub")
        if not user_id:
            return None

        user = await get_user_by_id(user_id)

        if not user:
            return None

        return user

    except JWTError:
        return None


async def check_auth_middleware(request: Request):
    try:
        token = request.cookies.get("user")

        if not token:
            raise HTTPException(status_code=403, detail="FORBIDDEN")

        payload = jwt.decode(
            token,
            PUBLIC_KEY,
            algorithms=[JWT_ALGORITHM],
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=403, detail="INVALID TOKEN")

        user = await db.user.find_one(
            {"user_id": user_id, "deleted_at": None}, {"_id": 0}
        )

        if not user:
            raise HTTPException(status_code=404, detail="USER NOT FOUND")

        return user

    except JWTError:
        raise HTTPException(status_code=403, detail="INVALID TOKEN")
