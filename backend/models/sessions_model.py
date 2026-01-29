from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from typing import Optional
from datetime import datetime


class Session(BaseModel):
    session_id: UUID = Field(default_factory=uuid4)

    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    is_guest: bool = True
    linked_user_id: Optional[UUID] = None

    is_active: bool = True
    revoked_at: Optional[datetime] = None

    last_active_at: Optional[datetime] = None

    expires_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
