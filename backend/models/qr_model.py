from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID, uuid4
from enum import Enum
from datetime import datetime


class OwnerType(str, Enum):
    user = "user"
    session = "session"


class QRCode(BaseModel):
    qr_id: UUID = Field(default_factory=uuid4)

    # OWNERSHIP
    owner_type: OwnerType = OwnerType.session
    owner_id: UUID

    # QR DATA
    qr_token: str
    is_permanent: bool = False

    # LIFECYCLE
    is_active: bool = True
    expires_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None

    # TIMESTAMPS
    created_at: datetime = Field(default_factory=datetime.utcnow)
