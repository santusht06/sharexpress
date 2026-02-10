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
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime


from enum import Enum


class User(BaseModel):
    user_id: UUID = Field(default_factory=uuid4)
    email: EmailStr

    google_sub: Optional[str] = None

    # ACCOUNT STATE
    is_verified: bool = False
    is_active: bool = False
    is_locked: bool = False

    # STORAGE (logical link)
    storage_limit: int = 52428800

    # ACTIVITY
    last_login: Optional[datetime] = None
    last_login_ip: Optional[str] = None
    last_active_at: Optional[datetime] = None

    # CONSENT
    accepted_terms: Optional[bool] = False

    # TIMESTAMPS
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None


class OTPverify(BaseModel):
    transactionID: str
    OTP: str
