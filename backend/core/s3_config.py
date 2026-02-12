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
import boto3
from botocore.client import Config
from core.config import MINIO_ACCESS_KEY, MINIO_BUCKET, MINIO_ENDPOINT, MINIO_SECRET_KEY
from datetime import timedelta


s3_client = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    region_name="us-east-1",
    config=Config(signature_version="s3v4"),
)


def ensure_bucket():
    buckets = s3_client.list_buckets()
    if not any(b["Name"] == MINIO_BUCKET for b in buckets["Buckets"]):
        s3_client.create_bucket(Bucket=MINIO_BUCKET)


def generate_presigned_upload_url(object_name: str, content_type: str):
    url = s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": MINIO_BUCKET,
            "Key": object_name,
            "ContentType": content_type,
        },
        ExpiresIn=600,  # 10 minutes
    )
    return url
