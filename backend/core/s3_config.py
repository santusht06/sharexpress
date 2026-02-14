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
import boto3
from botocore.client import Config
from core.config import (
    MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY,
    MINIO_ENDPOINT,
    MINIO_REGION,
    MINIO_BUCKET,
)

s3_client = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    region_name=MINIO_REGION,
    config=Config(
        signature_version="s3v4",
        s3={"addressing_style": "path"},  # important for MinIO
    ),
)

print(MINIO_ACCESS_KEY, MINIO_BUCKET, MINIO_ENDPOINT, MINIO_SECRET_KEY)


def ensure_bucket():
    buckets = s3_client.list_buckets()
    if not any(b["Name"] == MINIO_BUCKET for b in buckets["Buckets"]):
        s3_client.create_bucket(Bucket=MINIO_BUCKET)


def generate_presigned_upload_url(object_name: str):
    url = s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": MINIO_BUCKET,
            "Key": object_name,
        },
        ExpiresIn=600,
    )
    return url


# print(s3_client.list_buckets())
