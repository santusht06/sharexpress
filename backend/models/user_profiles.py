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
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime


class User_profile(BaseModel):
    profile_ID: UUID = Field(default_factory=uuid4)
    user_ID: UUID
    display_name: Optional[str]
    avatarURL: Optional[str]


class updateUser(BaseModel):
    name: str


class ProfilePictureResponse(BaseModel):
    success: bool
    picture_url: Optional[str]


class ProfilePicUploadRequest(BaseModel):
    filename: str = Field(..., example="profile.png")
    content_type: str = Field(..., example="image/png")


class ProfilePicConfirmRequest(BaseModel):
    object_key: str = Field(..., example="profile_pictures/userid/file.png")


class ProfilePicUploadResponse(BaseModel):
    success: bool
    upload_url: str
    object_key: str


class ProfilePicConfirmResponse(BaseModel):
    success: bool
    picture_url: str
