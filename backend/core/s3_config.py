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
    MINIO_REGION,
    MINIO_BUCKET,
    MINIO_ENDPOINT_PUBLIC,
    MINIO_ENDPOINT_INTERNAL,
)

s3_client = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT_PUBLIC,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    region_name=MINIO_REGION,
    config=Config(
        signature_version="s3v4",
        s3={"addressing_style": "path"},
    ),
)


s3_internal = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT_INTERNAL,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    region_name=MINIO_REGION,
    config=Config(
        signature_version="s3v4",
        s3={"addressing_style": "path"},
    ),
)

s3_public = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT_PUBLIC,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    region_name=MINIO_REGION,
    config=Config(
        signature_version="s3v4",
        s3={"addressing_style": "path"},
    ),
)

print(MINIO_ACCESS_KEY, MINIO_BUCKET, MINIO_ENDPOINT_PUBLIC, MINIO_SECRET_KEY)


def generate_presigned_upload_url(object_name: str):
    url = s3_public.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": MINIO_BUCKET,
            "Key": object_name,
        },
        ExpiresIn=600,
    )
    return url


def ensure_bucket():
    buckets = s3_client.list_buckets()
    if not any(b["Name"] == MINIO_BUCKET for b in buckets["Buckets"]):
        s3_client.create_bucket(Bucket=MINIO_BUCKET)
