from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID, uuid4
from enum import Enum
from datetime import datetime


class QRCode(BaseModel):
    qr_id: UUID = Field(default_factory=uuid4)

    owner_type: Optional[str]
    owner_id: UUID

    qr_token: str
    is_permanent: bool = False

    is_active: bool = True
    expires_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
