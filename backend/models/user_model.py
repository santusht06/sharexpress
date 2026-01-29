from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime


from enum import Enum


class User(BaseModel):
    user_id: UUID = Field(default_factory=uuid4)
    email: EmailStr

    google_sub: Optional[str] = None

    # ACCOUNT STATE
    is_verified: bool = False
    is_active: bool = False
    is_locked: bool = False

    # STORAGE (logical link)
    storage_limit: int = 52428800

    # ACTIVITY
    last_login: Optional[datetime] = None
    last_login_ip: Optional[str] = None
    last_active_at: Optional[datetime] = None

    # CONSENT
    accepted_terms: Optional[bool] = False

    # TIMESTAMPS
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None


class OTPverify(BaseModel):
    transactionID: str
    OTP: str
