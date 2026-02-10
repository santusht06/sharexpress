# Copyright 2026 Santusht Kotai
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
