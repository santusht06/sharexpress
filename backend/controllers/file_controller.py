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
import asyncio
import os
import hashlib
import logging
from uuid import uuid4
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from collections import defaultdict
from contextlib import asynccontextmanager
from functools import wraps
import time

from fastapi import HTTPException
from botocore.exceptions import ClientError, BotoCoreError
import magic  # python-magic for real mime detection

from core.database import get_db
from core.s3_config import s3_client, generate_presigned_upload_url
from core.config import MINIO_BUCKET


# Configure structured logging
logger = logging.getLogger(__name__)


# ---------------------------
# CUSTOM EXCEPTIONS
# ---------------------------


class FileUploadError(Exception):
    """Base exception for file upload errors"""

    pass


class ValidationError(FileUploadError):
    """Validation failed"""

    pass


class StorageError(FileUploadError):
    """Storage operation failed"""

    pass


class QuotaExceededError(FileUploadError):
    """User quota exceeded"""

    pass


# ---------------------------
# CIRCUIT BREAKER PATTERN
# ---------------------------


class CircuitBreaker:
    """Circuit breaker for external service calls"""

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: type = Exception,
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half-open
        self._lock = asyncio.Lock()

    async def call(self, func, *args, **kwargs):
        async with self._lock:
            if self.state == "open":
                if time.time() - self.last_failure_time > self.recovery_timeout:
                    self.state = "half-open"
                    logger.info("Circuit breaker entering half-open state")
                else:
                    raise StorageError("Circuit breaker is open - service unavailable")

        try:
            result = await func(*args, **kwargs)
            async with self._lock:
                if self.state == "half-open":
                    self.state = "closed"
                    self.failure_count = 0
                    logger.info("Circuit breaker closed - service recovered")
            return result
        except self.expected_exception as e:
            async with self._lock:
                self.failure_count += 1
                self.last_failure_time = time.time()

                if self.failure_count >= self.failure_threshold:
                    self.state = "open"
                    logger.error(
                        f"Circuit breaker opened after {self.failure_count} failures"
                    )
                raise StorageError(f"Storage operation failed: {str(e)}")


def async_retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple = (Exception,),
):
    """Retry decorator with exponential backoff"""

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            attempt = 0
            current_delay = delay

            while attempt < max_attempts:
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    attempt += 1
                    if attempt >= max_attempts:
                        logger.error(
                            f"Function {func.__name__} failed after {max_attempts} attempts: {e}"
                        )
                        raise

                    logger.warning(
                        f"Attempt {attempt}/{max_attempts} failed for {func.__name__}: {e}. "
                        f"Retrying in {current_delay}s..."
                    )
                    await asyncio.sleep(current_delay)
                    current_delay *= backoff

        return wrapper

    return decorator


class RateLimiter:
    """Token bucket rate limiter"""

    def __init__(self, rate: int, per: int):
        self.rate = rate
        self.per = per
        self.allowance = defaultdict(lambda: rate)
        self.last_check = defaultdict(lambda: time.time())
        self._lock = asyncio.Lock()

    async def acquire(self, key: str) -> bool:
        async with self._lock:
            current = time.time()
            time_passed = current - self.last_check[key]
            self.last_check[key] = current

            self.allowance[key] += time_passed * (self.rate / self.per)
            if self.allowance[key] > self.rate:
                self.allowance[key] = self.rate

            if self.allowance[key] < 1.0:
                return False

            self.allowance[key] -= 1.0
            return True


class MetricsCollector:
    """Collect and expose metrics for monitoring"""

    def __init__(self):
        self.upload_counter = 0
        self.upload_bytes = 0
        self.error_counter = 0
        self.upload_durations = []
        self._lock = asyncio.Lock()

    async def record_upload(self, bytes_size: int, duration: float):
        async with self._lock:
            self.upload_counter += 1
            self.upload_bytes += bytes_size
            self.upload_durations.append(duration)

            # Keep only last 1000 durations for memory efficiency
            if len(self.upload_durations) > 1000:
                self.upload_durations = self.upload_durations[-1000:]

    async def record_error(self):
        async with self._lock:
            self.error_counter += 1

    async def get_stats(self) -> Dict[str, Any]:
        async with self._lock:
            avg_duration = (
                sum(self.upload_durations) / len(self.upload_durations)
                if self.upload_durations
                else 0
            )
            return {
                "total_uploads": self.upload_counter,
                "total_bytes": self.upload_bytes,
                "total_errors": self.error_counter,
                "avg_upload_duration": avg_duration,
                "success_rate": (
                    (self.upload_counter / (self.upload_counter + self.error_counter))
                    if (self.upload_counter + self.error_counter) > 0
                    else 0
                ),
            }


class FileValidator:
    """Advanced file validation and security checks"""

    # Dangerous file extensions
    DANGEROUS_EXTENSIONS = {
        ".exe",
        ".bat",
        ".cmd",
        ".com",
        ".pif",
        ".scr",
        ".vbs",
        ".js",
        ".jar",
        ".app",
        ".deb",
        ".rpm",
        ".dmg",
        ".pkg",
        ".sh",
        ".bash",
    }

    # Allowed MIME types (whitelist approach)
    ALLOWED_MIME_TYPES = {
        # Documents
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
        "text/html",
        "text/markdown",
        "application/json",
        "application/xml",
        # Images
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp",
        "image/tiff",
        # Audio
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/webm",
        "audio/aac",
        # Video
        "video/mp4",
        "video/mpeg",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        # Archives
        "application/zip",
        "application/x-rar-compressed",
        "application/x-7z-compressed",
        "application/gzip",
        "application/x-tar",
    }

    @staticmethod
    def validate_filename(filename: str) -> str:
        """Sanitize and validate filename"""
        # Remove path components
        safe_name = os.path.basename(filename)

        # Remove null bytes and control characters
        safe_name = "".join(char for char in safe_name if ord(char) >= 32)

        # Limit length
        if len(safe_name) > 255:
            name, ext = os.path.splitext(safe_name)
            safe_name = name[:250] + ext

        # Check for dangerous extensions
        ext = os.path.splitext(safe_name)[1].lower()
        if ext in FileValidator.DANGEROUS_EXTENSIONS:
            raise ValidationError(f"File type {ext} not allowed for security reasons")

        if not safe_name or safe_name == ".":
            raise ValidationError("Invalid filename")

        return safe_name

    @staticmethod
    async def validate_mime_type(file_content: bytes, declared_mime: str) -> str:
        """Validate MIME type using actual file content"""
        try:
            # Use python-magic to detect actual MIME type
            detected_mime = magic.from_buffer(file_content[:2048], mime=True)

            # Check if detected MIME is in allowed list
            if detected_mime not in FileValidator.ALLOWED_MIME_TYPES:
                raise ValidationError(f"File type {detected_mime} not allowed")

            # Warn if declared and detected don't match
            if detected_mime != declared_mime:
                logger.warning(
                    f"MIME type mismatch: declared={declared_mime}, "
                    f"detected={detected_mime}"
                )

            return detected_mime
        except Exception as e:
            logger.error(f"MIME type detection failed: {e}")
            raise ValidationError("Could not verify file type")

    @staticmethod
    def calculate_checksum(content: bytes) -> str:
        """Calculate SHA-256 checksum for file integrity"""
        return hashlib.sha256(content).hexdigest()


class QuotaManager:
    """Manage user upload quotas"""

    def __init__(self, db):
        self.db = db
        self._cache = {}
        self._cache_ttl = 300  # 5 minutes
        self._cache_timestamps = {}

    async def check_quota(self, user_id: str, session_id: str, size: int) -> bool:
        """Check if user has enough quota"""
        # Daily quota: 1GB per user
        DAILY_QUOTA = 1024 * 1024 * 1024

        # Check cache first
        cache_key = f"{user_id}:{session_id}"
        if cache_key in self._cache:
            if time.time() - self._cache_timestamps[cache_key] < self._cache_ttl:
                current_usage = self._cache[cache_key]
            else:
                current_usage = await self._get_usage_from_db(user_id, session_id)
                self._cache[cache_key] = current_usage
                self._cache_timestamps[cache_key] = time.time()
        else:
            current_usage = await self._get_usage_from_db(user_id, session_id)
            self._cache[cache_key] = current_usage
            self._cache_timestamps[cache_key] = time.time()

        if current_usage + size > DAILY_QUOTA:
            raise QuotaExceededError(
                f"Daily quota exceeded. Used: {current_usage / 1024 / 1024:.2f}MB, "
                f"Limit: {DAILY_QUOTA / 1024 / 1024:.2f}MB"
            )

        return True

    async def _get_usage_from_db(self, user_id: str, session_id: str) -> int:
        """Get current usage from database"""
        start_of_day = datetime.utcnow().replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        result = await self.db.files.aggregate(
            [
                {
                    "$match": {
                        "sender_ID": user_id,
                        "sharing_session_id": session_id,
                        "created_at": {"$gte": start_of_day},
                        "is_deleted": False,
                    }
                },
                {"$group": {"_id": None, "total": {"$sum": "$size"}}},
            ]
        ).to_list(length=1)

        return result[0]["total"] if result else 0

    async def increment_usage(self, user_id: str, session_id: str, size: int):
        """Increment cached usage"""
        cache_key = f"{user_id}:{session_id}"
        if cache_key in self._cache:
            self._cache[cache_key] += size


class FileController:
    """Production-grade file sharing controller"""

    # Configuration
    MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB
    MAX_FILES_PER_REQUEST = 30
    PARALLEL_LIMIT = 10
    CHUNK_SIZE = 5 * 1024 * 1024  # 5MB chunks for multipart upload

    # Concurrency controls
    UPLOAD_SEMAPHORE = asyncio.Semaphore(PARALLEL_LIMIT)

    # Shared instances
    circuit_breaker = CircuitBreaker(
        failure_threshold=5,
        recovery_timeout=60,
        expected_exception=(ClientError, BotoCoreError),
    )
    rate_limiter = RateLimiter(rate=100, per=60)  # 100 requests per minute
    metrics = MetricsCollector()

    def __init__(self):
        self.db = get_db()
        self.quota_manager = QuotaManager(self.db)

    async def validate_batch(self, files: List[Any], session: Dict[str, Any]) -> None:
        """Comprehensive batch validation"""
        start_time = time.time()

        try:
            # Check rate limit
            rate_key = f"{session['sender_ID']}:{session['sharing_session_ID']}"
            if not await self.rate_limiter.acquire(rate_key):
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded. Please wait before uploading more files.",
                )

            # Validate file count
            if len(files) > self.MAX_FILES_PER_REQUEST:
                raise ValidationError(
                    f"Maximum {self.MAX_FILES_PER_REQUEST} files allowed per request"
                )

            if not files:
                raise ValidationError("No files provided")

            # Validate total batch size
            total_size = sum(f.size for f in files)
            max_batch_size = self.MAX_FILE_SIZE * self.MAX_FILES_PER_REQUEST

            if total_size > max_batch_size:
                raise ValidationError(
                    f"Total batch size {total_size / 1024 / 1024:.2f}MB exceeds "
                    f"limit of {max_batch_size / 1024 / 1024:.2f}MB"
                )

            # Check quota
            await self.quota_manager.check_quota(
                user_id=session["sender_ID"],
                session_id=session["sharing_session_ID"],
                size=total_size,
            )

            # Validate individual files
            validation_tasks = [self._validate_single_file(f) for f in files]
            await asyncio.gather(*validation_tasks)

            logger.info(
                f"Batch validation completed in {time.time() - start_time:.2f}s. "
                f"Files: {len(files)}, Total size: {total_size / 1024 / 1024:.2f}MB"
            )

        except (ValidationError, QuotaExceededError) as e:
            await self.metrics.record_error()
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            await self.metrics.record_error()
            logger.error(f"Batch validation failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Validation failed")

    async def _validate_single_file(self, file_data: Any) -> None:
        """Validate a single file"""
        # Validate size
        if file_data.size > self.MAX_FILE_SIZE:
            raise ValidationError(
                f"{file_data.filename} exceeds {self.MAX_FILE_SIZE / 1024 / 1024}MB limit"
            )

        if file_data.size == 0:
            raise ValidationError(f"{file_data.filename} is empty")

        # Validate filename
        try:
            FileValidator.validate_filename(file_data.filename)
        except ValidationError as e:
            raise ValidationError(f"Invalid filename '{file_data.filename}': {e}")

    async def init_upload(
        self, files: List[Any], session: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Initialize upload with presigned URLs"""
        start_time = time.time()

        try:
            # Validate session
            if not session or not session.get("sharing_session_ID"):
                raise HTTPException(status_code=401, detail="Invalid session")

            # Validate batch
            await self.validate_batch(files, session)

            sharing_session_id = session["sharing_session_ID"]

            # Generate presigned URLs in parallel with concurrency control
            tasks = [self._generate_presigned_url(f, sharing_session_id) for f in files]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Check for errors
            successful_results = []
            errors = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    errors.append(f"File {files[i].filename}: {str(result)}")
                    await self.metrics.record_error()
                else:
                    successful_results.append(result)

            if errors:
                logger.error(f"Errors during URL generation: {errors}")
                if not successful_results:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to generate upload URLs: {'; '.join(errors)}",
                    )

            duration = time.time() - start_time
            logger.info(
                f"Upload initialization completed in {duration:.2f}s. "
                f"Successful: {len(successful_results)}, Errors: {len(errors)}"
            )

            return {
                "files": successful_results,
                "errors": errors if errors else None,
                "expires_in": 600,
            }

        except HTTPException:
            raise
        except Exception as e:
            await self.metrics.record_error()
            logger.error(f"Upload initialization failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to initialize upload")

    @async_retry(max_attempts=3, delay=0.5, exceptions=(ClientError, BotoCoreError))
    async def _generate_presigned_url(
        self, file_data: Any, sharing_session_id: str
    ) -> Dict[str, Any]:
        """Generate presigned URL for file upload with circuit breaker"""
        async with self.UPLOAD_SEMAPHORE:

            async def _generate():
                file_id = str(uuid4())
                safe_name = FileValidator.validate_filename(file_data.filename)
                object_key = f"{sharing_session_id}/{file_id}_{safe_name}"

                # Generate presigned URL (sync operation in thread pool)
                loop = asyncio.get_event_loop()
                url = await loop.run_in_executor(
                    None, generate_presigned_upload_url(object_key)
                )

                return {
                    "file_id": file_id,
                    "filename": safe_name,
                    "storage_key": object_key,
                    "upload_url": url,
                    "size": file_data.size,
                    "content_type": file_data.content_type,
                }

            return await self.circuit_breaker.call(_generate)

    async def complete_upload(
        self, files: List[Dict[str, Any]], session: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Complete upload and save metadata to database"""
        start_time = time.time()

        try:
            # Validate session
            if not session or not session.get("sharing_session_ID"):
                raise HTTPException(status_code=401, detail="Invalid session")

            if not files:
                raise HTTPException(status_code=400, detail="No files provided")

            # Verify uploads in parallel
            verification_tasks = [
                self._verify_and_prepare_document(f, session) for f in files
            ]
            results = await asyncio.gather(*verification_tasks, return_exceptions=True)

            # Separate successful and failed uploads
            successful_docs = []
            failed_files = []
            total_size = 0

            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    failed_files.append(
                        {"file_id": files[i].get("file_id"), "error": str(result)}
                    )
                    await self.metrics.record_error()
                else:
                    successful_docs.append(result)
                    total_size += result["size"]

            # Save to database in transaction
            saved_count = 0
            if successful_docs:
                try:
                    saved_count = await self._save_documents_batch(successful_docs)

                    # Update quota cache
                    await self.quota_manager.increment_usage(
                        user_id=session["sender_ID"],
                        session_id=session["sharing_session_ID"],
                        size=total_size,
                    )

                    # Record metrics
                    duration = time.time() - start_time
                    await self.metrics.record_upload(total_size, duration)

                except Exception as e:
                    logger.error(f"Database save failed: {e}", exc_info=True)
                    # Cleanup uploaded files on DB failure
                    cleanup_tasks = [
                        self._cleanup_storage(doc["storage_key"])
                        for doc in successful_docs
                    ]
                    await asyncio.gather(*cleanup_tasks, return_exceptions=True)
                    raise HTTPException(
                        status_code=500, detail="Failed to save file metadata"
                    )

            duration = time.time() - start_time
            logger.info(
                f"Upload completion finished in {duration:.2f}s. "
                f"Saved: {saved_count}, Failed: {len(failed_files)}, "
                f"Total size: {total_size / 1024 / 1024:.2f}MB"
            )

            response = {
                "success": True,
                "files_saved": saved_count,
                "total_size": total_size,
            }

            if failed_files:
                response["failed_files"] = failed_files

            return response

        except HTTPException:
            raise
        except Exception as e:
            await self.metrics.record_error()
            logger.error(f"Upload completion failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to complete upload")

    @async_retry(max_attempts=3, delay=0.5, exceptions=(ClientError, BotoCoreError))
    async def _verify_and_prepare_document(
        self, file_info: Dict[str, Any], session: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verify file exists in storage and prepare document for DB"""

        async def _verify():
            # Verify object exists in storage
            loop = asyncio.get_event_loop()
            try:
                metadata = await loop.run_in_executor(
                    None,
                    lambda: s3_client.head_object(
                        Bucket=MINIO_BUCKET,
                        Key=file_info["storage_key"],
                    ),
                )
            except ClientError as e:
                if e.response["Error"]["Code"] == "404":
                    raise StorageError(
                        f"File {file_info['storage_key']} not found in storage"
                    )
                raise

            # Extract metadata
            actual_size = metadata.get("ContentLength", file_info.get("size", 0))
            etag = metadata.get("ETag", "").strip('"')

            # Prepare document
            return {
                "file_id": file_info["file_id"],
                "sharing_session_id": session["sharing_session_ID"],
                "sender_ID": session["sender_ID"],
                "sender_type": session["sender_type"],
                "storage_key": file_info["storage_key"],
                "size": actual_size,
                "mime_type": file_info.get("content_type"),
                "filename": file_info.get("filename"),
                "etag": etag,
                "is_deleted": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }

        return await self.circuit_breaker.call(_verify)

    async def _save_documents_batch(self, docs: List[Dict[str, Any]]) -> int:
        """Save documents to database with batching"""
        if not docs:
            return 0

        # Insert in batches of 100 for better performance
        BATCH_SIZE = 100
        saved_count = 0

        for i in range(0, len(docs), BATCH_SIZE):
            batch = docs[i : i + BATCH_SIZE]
            try:
                result = await self.db.files.insert_many(
                    batch,
                    ordered=False,  # Continue on error
                )
                saved_count += len(result.inserted_ids)
            except Exception as e:
                logger.error(f"Batch insert failed: {e}", exc_info=True)
                # Try to save individually
                for doc in batch:
                    try:
                        await self.db.files.insert_one(doc)
                        saved_count += 1
                    except Exception as inner_e:
                        logger.error(
                            f"Failed to save document {doc['file_id']}: {inner_e}"
                        )

        return saved_count

    @async_retry(max_attempts=2, delay=1.0, exceptions=(ClientError, BotoCoreError))
    async def _cleanup_storage(self, storage_key: str) -> None:
        """Cleanup file from storage"""
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: s3_client.delete_object(Bucket=MINIO_BUCKET, Key=storage_key),
            )
            logger.info(f"Cleaned up storage key: {storage_key}")
        except Exception as e:
            logger.error(f"Failed to cleanup {storage_key}: {e}")
            # Don't raise - cleanup is best effort

    async def get_metrics(self) -> Dict[str, Any]:
        """Get system metrics"""
        return await self.metrics.get_stats()

    async def health_check(self) -> Dict[str, Any]:
        """Health check endpoint"""
        try:
            # Check database
            await self.db.files.find_one()
            db_healthy = True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            db_healthy = False

        try:
            # Check S3
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None, lambda: s3_client.list_objects_v2(Bucket=MINIO_BUCKET, MaxKeys=1)
            )
            s3_healthy = True
        except Exception as e:
            logger.error(f"S3 health check failed: {e}")
            s3_healthy = False

        return {
            "status": "healthy" if (db_healthy and s3_healthy) else "degraded",
            "database": "healthy" if db_healthy else "unhealthy",
            "storage": "healthy" if s3_healthy else "unhealthy",
            "circuit_breaker_state": self.circuit_breaker.state,
            "timestamp": datetime.utcnow().isoformat(),
        }


class BackgroundCleaner:
    """Background task to cleanup expired/orphaned files"""

    def __init__(self, file_controller: FileController):
        self.controller = file_controller
        self.running = False

    async def start(self):
        """Start background cleanup task"""
        self.running = True
        while self.running:
            try:
                await self.cleanup_expired_files()
                await asyncio.sleep(3600)  # Run every hour
            except Exception as e:
                logger.error(f"Background cleanup error: {e}", exc_info=True)
                await asyncio.sleep(60)

    async def cleanup_expired_files(self):
        """Cleanup files older than retention period"""
        RETENTION_DAYS = 30
        cutoff_date = datetime.utcnow() - timedelta(days=RETENTION_DAYS)

        # Find expired files
        expired_files = await self.controller.db.files.find(
            {"created_at": {"$lt": cutoff_date}, "is_deleted": False}
        ).to_list(length=1000)

        if not expired_files:
            return

        logger.info(f"Cleaning up {len(expired_files)} expired files")

        # Delete from storage
        cleanup_tasks = [
            self.controller._cleanup_storage(f["storage_key"]) for f in expired_files
        ]
        await asyncio.gather(*cleanup_tasks, return_exceptions=True)

        # Mark as deleted in database
        file_ids = [f["file_id"] for f in expired_files]
        await self.controller.db.files.update_many(
            {"file_id": {"$in": file_ids}},
            {"$set": {"is_deleted": True, "deleted_at": datetime.utcnow()}},
        )

        logger.info(f"Cleanup completed for {len(expired_files)} files")

    def stop(self):
        """Stop background cleanup task"""
        self.running = False
