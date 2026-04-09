from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import uuid4, UUID


class FileMeta(BaseModel):
    file_id: str
    filename: str
    size: int
    mime_type: Optional[str] = None


class UserMeta(BaseModel):
    user_id: str
    name: Optional[str] = None
    user_type: Optional[str] = None


class TransferHistory(BaseModel):
    transfer_id: UUID = Field(default_factory=uuid4)

    sender: UserMeta
    receiver: UserMeta

    direction: str = Field(..., description="Direction of transfer: sender_to_receiver")

    files: List[FileMeta]

    total_files: int
    total_size: int

    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    sharing_session_id: Optional[str] = None

<<<<<<< HEAD
=======
    # 📌 Status
>>>>>>> 67e9495 (HISTORY MODEL SETUP)
    status: str = Field(default="completed", description="pending / completed / failed")

    metadata: Optional[dict] = None
