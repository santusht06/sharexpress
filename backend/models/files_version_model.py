from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from typing import Optional
from datetime import datetime

from enum import Enum


class editedBy(str, Enum):
    user = "user"
    session = "session"


class FilesVersion(BaseModel):
    version_ID: UUID = Field(default_factory=uuid4)
    file_ID: UUID
    version_No: Optional[int]
    storage_key: Optional[str]

    editedBy: editedBy
    editedByUserID: UUID

    createdAt: datetime = Field(default_factory=datetime.utcnow())
