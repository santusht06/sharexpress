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
from pydantic import BaseModel
from typing import List


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
