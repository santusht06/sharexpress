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
