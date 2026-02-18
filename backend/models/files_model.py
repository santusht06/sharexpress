# Copyright 2026 sharexpress
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
#
from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from typing import Optional
from enum import Enum
from datetime import datetime


class OwnerType(str, Enum):
    USER = "user"
    SESSION = "session"


class FileStatus(str, Enum):
    pending = "pending"
    uploaded = "uploaded"
    failed = "failed"
    deleted = "deleted"


class FileCategory(str, Enum):
    image = "image"
    video = "video"
    document = "document"
    other = "other"


class Files(BaseModel):
    file_id: UUID = Field(default_factory=uuid4)

    owner_type: OwnerType
    owner_id: UUID
    sharing_session_id: UUID

    original_name: str
    mime_type: str
    size: int
    file_hash: Optional[str]
    storage_key: str
    file_category: FileCategory

    upload_status: FileStatus = FileStatus.pending

    expires_at: Optional[datetime]
    is_deleted: bool = False
    deleted_at: Optional[datetime]

    download_count: int = 0

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime]
