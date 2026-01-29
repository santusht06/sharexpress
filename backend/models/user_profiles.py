from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime


class User_profile(BaseModel):
    profile_ID: UUID = Field(default_factory=uuid4)
    user_ID: UUID
    display_name: Optional[str]
    avatarURL: Optional[str]
