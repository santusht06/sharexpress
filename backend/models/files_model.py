from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from typing import Optional
from enum import Enum
from datetime import datetime


class OwnerType(str, Enum):
    user = "user"
    session = "session"


class Files(BaseModel):
    File_ID: UUID = Field(default_factory=uuid4)
    owner_Type: OwnerType = OwnerType.session
    owner_ID: UUID
    original_name: Optional[str]
    mime_type: Optional[str]
    size: Optional[int]
    hashFile: Optional[str]
    storage_key: Optional[str]

    created_at: datetime = Field(default_factory=datetime.utcnow)
