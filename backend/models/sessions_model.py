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
