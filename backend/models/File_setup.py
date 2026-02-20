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
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any
from enum import Enum


class UploadInitItem(BaseModel):
    filename: str
    content_type: str
    size: int


class UploadInitRequest(BaseModel):
    files: List[UploadInitItem]


class CompleteUploadItem(BaseModel):
    file_id: str
    storage_key: str
    size: int
    content_type: str
    filename: str


class CompleteUploadRequest(BaseModel):
    files: List[CompleteUploadItem]


class Action(str, Enum):
    VIEW = "view"
    DOWNLOAD = "download"
    EDIT = "edit"
    DELETE = "delete"
    UPLOAD = "upload"
    SHARE = "share"


class Role(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


class SessionParticipant(BaseModel):
    user_id: str
    role: Role


class FilePermission(BaseModel):
    user_id: str
    allowed_actions: List[Action]


class FileMetadata(BaseModel):
    """File metadata for upload initialization"""

    filename: str = Field(
        ..., min_length=1, max_length=255, description="Original filename"
    )
    size: int = Field(
        ..., gt=0, le=20_971_520, description="File size in bytes (max 20MB)"
    )
    content_type: str = Field(..., description="MIME type of the file")

    @validator("filename")
    def validate_filename(cls, v):
        """Ensure filename doesn't contain path separators"""
        if "/" in v or "\\" in v or "\x00" in v:
            raise ValueError("Filename cannot contain path separators or null bytes")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "filename": "document.pdf",
                "size": 2048576,
                "content_type": "application/pdf",
            }
        }


class UploadInitRequest(BaseModel):
    """Request to initialize file upload"""

    files: List[FileMetadata] = Field(
        ..., min_items=1, max_items=30, description="List of files to upload (max 30)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "files": [
                    {
                        "filename": "report.pdf",
                        "size": 1024000,
                        "content_type": "application/pdf",
                    },
                    {
                        "filename": "image.png",
                        "size": 512000,
                        "content_type": "image/png",
                    },
                ]
            }
        }


class UploadInitResponse(BaseModel):
    """Response from upload initialization"""

    files: List[Dict[str, Any]]
    errors: Optional[List[str]] = None
    expires_in: int = Field(default=600, description="URL expiration in seconds")


class CompletedFile(BaseModel):
    """File completion confirmation"""

    file_id: str = Field(..., description="UUID of the file")
    storage_key: str = Field(..., description="S3 storage key")
    filename: str
    size: int = Field(..., gt=0)
    content_type: Optional[str] = None
    file_permissions: Optional[List[FilePermission]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "file_id": "123e4567-e89b-12d3-a456-426614174000",
                "storage_key": "session_123/file_456_document.pdf",
                "filename": "document.pdf",
                "size": 1024000,
                "content_type": "application/pdf",
            }
        }


class CompleteUploadRequest(BaseModel):
    """Request to complete file upload"""

    files: List[CompletedFile] = Field(
        ..., min_items=1, description="List of successfully uploaded files"
    )


class CompleteUploadResponse(BaseModel):
    """Response from upload completion"""

    success: bool
    files_saved: int
    total_size: int
    failed_files: Optional[List[Dict[str, str]]] = None


class FileListResponse(BaseModel):
    """Response for file listing"""

    success: bool
    files: List[Dict[str, Any]]
    total_count: int
    total_size: int
    total_size_human: str


class DownloadResponse(BaseModel):
    """Response for download URL generation"""

    file_id: str
    filename: str
    download_url: str
    expires_in: int = 600


class DeleteFileRequest(BaseModel):
    """Request to delete file(s)"""

    permanent: bool = Field(
        default=False,
        description="If true, permanently delete from S3. If false, soft delete.",
    )


class HealthCheckResponse(BaseModel):
    """System health check response"""

    status: str
    database: str
    storage: str
    circuit_breaker_state: str
    timestamp: str


class MetricsResponse(BaseModel):
    """System metrics response"""

    total_uploads: int
    total_bytes: int
    total_errors: int
    avg_upload_duration: float
    success_rate: float
