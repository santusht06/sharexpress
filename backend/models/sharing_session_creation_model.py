from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional
from uuid import uuid4


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
    # Primary identifiers
    sharing_session_ID: str = Field(default_factory=lambda: str(uuid4()))
    qr_token: str
    sharing_token: str

    # Participants
    sender_name: str
    sender_ID: str
    sender_type: ParticipantsType

    receiver_ID: Optional[str] = None
    receiver_type: ParticipantsType
    reciever_name: str

    # State
    status: Status = Status.PENDING
    is_active: bool = False

    # Audit
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    claimed_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
