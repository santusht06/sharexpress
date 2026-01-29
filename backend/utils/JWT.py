from datetime import datetime, timedelta
from jose import jwt
from fastapi import Response
import os
from pathlib import Path

PRIVATE_KEY = Path("private.pem").read_text()
PUBLIC_KEY = Path("public.pem").read_text()


JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
JWT_EXPIRES = int(os.getenv("JWT_EXPIRES", 7))


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
