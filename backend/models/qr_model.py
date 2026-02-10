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


class QRVerifyRequest(BaseModel):
    qr_token: str
