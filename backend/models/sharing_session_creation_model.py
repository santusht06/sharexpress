from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID, uuid4
from enum import Enum
from datetime import datetime


class ParticipantsType(str, Enum):
    USER = "user"
    SESSION = "session"


class Status(str, Enum):
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"
    COMPLETED = "COMPLETED"


class SharingSession(BaseModel):
    sharing_session_ID: str = Field(default_factory=lambda: str(uuid4()))

    sender_ID: str
    sender_type: ParticipantsType

    qr_token: str

    receiver_ID: Optional[str] = None
    receiver_type: ParticipantsType

    status: Status = Status.PENDING
    is_active: bool = False

    created_at: datetime = Field(default_factory=datetime.utcnow)

    claimed_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
