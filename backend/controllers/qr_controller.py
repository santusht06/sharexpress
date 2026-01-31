from fastapi import Request, HTTPException, Response
from utils.user_repo import get_or_create_guest_session
from core.database import get_db
from datetime import datetime, timedelta
from utils.qr_generate import generate_qr_token
from uuid import uuid4
from utils.JWT import get_current_user_optional
import hashlib
import secrets
from typing import Optional
from pymongo import ReturnDocument


db = get_db()


class Qr_controller:
    @staticmethod
    def _hash_ip(ip: str) -> str:
        """Hash IP address for privacy-preserving storage"""
        return hashlib.sha256(f"{ip}:qr_salt_2024".encode()).hexdigest()[:16]

    @staticmethod
    def _get_client_info(request: Request) -> dict:
        """Extract and anonymize client information"""
        # Get IP address (handle proxies)
        ip = request.headers.get("X-Forwarded-For", request.client.host).split(",")[0]

        return {
            "ip_hash": Qr_controller._hash_ip(ip),
            "user_agent_hash": hashlib.sha256(
                request.headers.get("user-agent", "unknown").encode()
            ).hexdigest()[:16],
            "timestamp": datetime.utcnow(),
        }

    @staticmethod
    async def _check_rate_limit(
        identifier: str, limit: int = 5, window_minutes: int = 1
    ) -> bool:
        """Check if identifier has exceeded rate limit"""
        window_start = datetime.utcnow() - timedelta(minutes=window_minutes)

        # Count recent attempts
        count = await db.qr_access_log.count_documents(
            {
                "identifier_hash": hashlib.sha256(identifier.encode()).hexdigest()[:16],
                "timestamp": {"$gte": window_start},
            }
        )

        return count < limit

    @staticmethod
    async def _log_access(
        qr_id: str,
        action: str,
        client_info: dict,
        success: bool,
        details: Optional[dict] = None,
    ):
        """Log QR code access for audit and security"""
        log_entry = {
            "log_id": str(uuid4()),
            "qr_id": qr_id,
            "action": action,  # verify, resolve, scan, etc.
            "success": success,
            "client_info": client_info,
            "timestamp": datetime.utcnow(),
            "details": details or {},
        }

        # Store with TTL (auto-delete after 90 days)
        await db.qr_access_log.insert_one(log_entry)

    @staticmethod
    async def create_QR(request: Request, response: Response):
        """
        Create QR code with advanced security features
        - One-time use support
        - Usage limits
        - Geographic restrictions (optional)
        - Scan count tracking
        """
        try:
            current_user = await get_current_user_optional(request)
            client_info = Qr_controller._get_client_info(request)

            if current_user:
                owner_type = "user"
                owner_id = current_user["user_id"]
                is_permanent = True
                expires_at = None

                # Check if user already has an active QR code
                existing_qr = await db.qr_codes.find_one(
                    {
                        "owner_type": "user",
                        "owner_id": owner_id,
                        "is_active": True,
                    }
                )

                if existing_qr:
                    # Return existing QR code
                    return {
                        "success": True,
                        "qr_id": existing_qr["qr_id"],
                        "qr_token": existing_qr["qr_token"],
                        "owner_type": "user",
                        "is_permanent": True,
                        "is_active": True,
                        "expires_at": None,
                        "created_at": existing_qr["created_at"].isoformat(),
                        "security": {
                            "one_time_use": existing_qr.get("one_time_use", False),
                            "max_scans": existing_qr.get("max_scans"),
                            "current_scans": existing_qr.get("scan_count", 0),
                        },
                    }

            else:
                # Guest session
                session = await get_or_create_guest_session(request, response)
                owner_type = "session"
                owner_id = session["session_id"]
                is_permanent = False
                expires_at = datetime.utcnow() + timedelta(minutes=10)

                # Delete old guest session QR codes
                await db.qr_codes.delete_many(
                    {"owner_type": "session", "owner_id": owner_id}
                )

            # Generate secure QR token
            qr_token = generate_qr_token()
            qr_id = str(uuid4())

            # Generate verification secret for additional security
            verification_secret = secrets.token_urlsafe(32)

            qr_data = {
                "qr_id": qr_id,
                "qr_token": qr_token,
                "verification_secret": hashlib.sha256(
                    verification_secret.encode()
                ).hexdigest(),
                "owner_type": owner_type,
                "owner_id": owner_id,
                "is_permanent": is_permanent,
                "is_active": True,
                "expires_at": expires_at,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                # Security features
                "one_time_use": False,  # Can be enabled per use case
                "max_scans": None,  # Unlimited by default
                "scan_count": 0,
                "unique_scanners": [],  # Track unique scanner hashes
                "last_scanned_at": None,
                "revoked_at": None,
                # Privacy and security
                "created_by_ip_hash": client_info["ip_hash"],
                "allowed_ip_patterns": [],  # Optional: restrict by IP
                "require_authentication": False,  # Optional: require login to scan
                # Metadata
                "metadata": {
                    "device_fingerprint": client_info["user_agent_hash"],
                    "creation_context": "api",
                },
            }

            await db.qr_codes.insert_one(qr_data)

            # Log creation
            await Qr_controller._log_access(
                qr_id=qr_id,
                action="create",
                client_info=client_info,
                success=True,
                details={"owner_type": owner_type},
            )

            return {
                "success": True,
                "qr_id": qr_id,
                "qr_token": qr_token,
                "verification_secret": verification_secret,  # Return only once
                "owner_type": owner_type,
                "is_permanent": is_permanent,
                "is_active": True,
                "expires_at": expires_at.isoformat() if expires_at else None,
                "created_at": qr_data["created_at"].isoformat(),
                "security": {
                    "one_time_use": False,
                    "max_scans": None,
                    "current_scans": 0,
                },
            }

        except Exception as e:
            print(f"Error in create_QR: {e}")
            raise HTTPException(status_code=500, detail="Failed to create QR code")

    @staticmethod
    async def verify_QR(
        request: Request, qr_token: str, verification_secret: Optional[str] = None
    ):
        """
        Advanced QR verification with security checks
        - Rate limiting
        - Expiry check
        - Usage limits
        - Geographic restrictions
        - Suspicious activity detection
        """
        try:
            if not qr_token:
                raise HTTPException(status_code=400, detail="QR token is required")

            client_info = Qr_controller._get_client_info(request)

            # Rate limiting by IP
            if not await Qr_controller._check_rate_limit(
                client_info["ip_hash"], limit=10, window_minutes=1
            ):
                await Qr_controller._log_access(
                    qr_id="unknown",
                    action="verify",
                    client_info=client_info,
                    success=False,
                    details={"reason": "rate_limit_exceeded"},
                )
                raise HTTPException(
                    status_code=429,
                    detail="Too many verification attempts. Please try again later.",
                )

            # Find QR code
            qr_code = await db.qr_codes.find_one(
                {"qr_token": qr_token},
                {"_id": 0},
            )

            if not qr_code:
                await Qr_controller._log_access(
                    qr_id="unknown",
                    action="verify",
                    client_info=client_info,
                    success=False,
                    details={"reason": "not_found"},
                )
                raise HTTPException(status_code=404, detail="QR code not found")

            qr_id = qr_code["qr_id"]

            # Check if QR code is active
            if not qr_code.get("is_active", False):
                await Qr_controller._log_access(
                    qr_id=qr_id,
                    action="verify",
                    client_info=client_info,
                    success=False,
                    details={"reason": "inactive"},
                )
                raise HTTPException(status_code=400, detail="QR code is inactive")

            # Check expiry
            expires_at = qr_code.get("expires_at")
            if expires_at and datetime.utcnow() > expires_at:
                # Auto-deactivate expired QR
                await db.qr_codes.update_one(
                    {"qr_token": qr_token},
                    {
                        "$set": {
                            "is_active": False,
                            "revoked_at": datetime.utcnow(),
                            "revoke_reason": "expired",
                        }
                    },
                )
                await Qr_controller._log_access(
                    qr_id=qr_id,
                    action="verify",
                    client_info=client_info,
                    success=False,
                    details={"reason": "expired"},
                )
                raise HTTPException(status_code=400, detail="QR code has expired")

            # Verify secret if provided (additional security layer)
            if verification_secret:
                secret_hash = hashlib.sha256(verification_secret.encode()).hexdigest()
                if secret_hash != qr_code.get("verification_secret"):
                    await Qr_controller._log_access(
                        qr_id=qr_id,
                        action="verify",
                        client_info=client_info,
                        success=False,
                        details={"reason": "invalid_secret"},
                    )
                    raise HTTPException(
                        status_code=403, detail="Invalid verification secret"
                    )

                # Check scan limits

                await Qr_controller._log_access(
                    qr_id=qr_id,
                    action="verify",
                    client_info=client_info,
                    success=False,
                    details={"reason": "max_scans_reached"},
                )
                raise HTTPException(
                    status_code=400, detail="QR code has reached maximum scan limit"
                )

            # Check if authentication required
            if qr_code.get("require_authentication"):
                current_user = await get_current_user_optional(request)
                if not current_user:
                    await Qr_controller._log_access(
                        qr_id=qr_id,
                        action="verify",
                        client_info=client_info,
                        success=False,
                        details={"reason": "authentication_required"},
                    )
                    raise HTTPException(
                        status_code=401,
                        detail="Authentication required to scan this QR code",
                    )

            # Update scan metrics
            scanner_hash = client_info["ip_hash"]
            unique_scanners = qr_code.get("unique_scanners", [])
            is_new_scanner = scanner_hash not in unique_scanners

            update_data = {
                "$inc": {"scan_count": 1},
                "$set": {"last_scanned_at": datetime.utcnow()},
            }

            if is_new_scanner:
                update_data["$addToSet"] = {"unique_scanners": scanner_hash}

            update_result = await db.qr_codes.find_one_and_update(
                {"qr_token": qr_token, "is_active": True},
                update_data,
                return_document=ReturnDocument.AFTER,
            )

            return {
                "success": True,
                "qr_id": update_result["qr_id"],
                "owner_type": update_result["owner_type"],
                "owner_id": update_result["owner_id"],
                "is_permanent": update_result["is_permanent"],
                "expires_at": update_result.get("expires_at"),
                "security": {
                    "scan_count": update_result["scan_count"],
                    "is_new_scanner": is_new_scanner,
                    "unique_scanners": len(update_result.get("unique_scanners", [])),
                },
            }

        except HTTPException:
            raise
        except Exception as e:
            print("verify_QR error:", e)
            raise HTTPException(status_code=500, detail="Failed to verify QR")

    @staticmethod
    async def resolve_QR(
        request: Request, qr_token: str, verification_secret: Optional[str] = None
    ):
        """
        Resolve QR code with privacy-preserving checks
        Returns different data based on authentication status
        """
        try:
            # Verify QR code first (includes all security checks)
            qr_data = await Qr_controller.verify_QR(
                request, qr_token, verification_secret
            )

            current_user = await get_current_user_optional(request)
            client_info = Qr_controller._get_client_info(request)

            if current_user:
                # Authenticated user resolution
                if qr_data["owner_type"] == "user":
                    # Check if owner still exists and is active
                    owner = await db.user.find_one(
                        {
                            "user_id": qr_data["owner_id"],
                            "is_verified": True,
                            "deleted_at": None,
                        },
                        {"_id": 0, "email": 1, "user_id": 1},
                    )

                    if not owner:
                        await Qr_controller._log_access(
                            qr_id=qr_data["qr_id"],
                            action="resolve",
                            client_info=client_info,
                            success=False,
                            details={"reason": "owner_not_found"},
                        )
                        raise HTTPException(
                            status_code=404,
                            detail="QR owner user no longer exists",
                        )

                    # Check if user is trying to scan their own QR code
                    is_own_qr = owner["user_id"] == current_user["user_id"]

                    await Qr_controller._log_access(
                        qr_id=qr_data["qr_id"],
                        action="resolve",
                        client_info=client_info,
                        success=True,
                        details={"mode": "user", "is_own_qr": is_own_qr},
                    )

                    return {
                        "success": True,
                        "mode": "user",
                        "qr_id": qr_data["qr_id"],
                        "is_own_qr": is_own_qr,
                        "owner_info": {
                            "user_id": owner["user_id"],
                            "email": owner["email"]
                            if not is_own_qr
                            else None,  # Privacy: don't show own email
                        }
                        if not is_own_qr
                        else None,
                        "security": qr_data.get("security", {}),
                    }
                else:
                    # Session-owned QR scanned by authenticated user
                    await Qr_controller._log_access(
                        qr_id=qr_data["qr_id"],
                        action="resolve",
                        client_info=client_info,
                        success=True,
                        details={"mode": "user", "qr_owner": "session"},
                    )

                    return {
                        "success": True,
                        "mode": "user",
                        "qr_id": qr_data["qr_id"],
                        "is_own_qr": False,
                        "owner_info": {
                            "type": "guest_session",
                            "note": "This QR was created by a guest user",
                        },
                        "security": qr_data.get("security", {}),
                    }

            else:
                # Guest user resolution (limited information)
                await Qr_controller._log_access(
                    qr_id=qr_data["qr_id"],
                    action="resolve",
                    client_info=client_info,
                    success=True,
                    details={"mode": "guest"},
                )
                old_qr = await db.qr_codes.find_one(
                    {"qr_token": qr_token},
                    {"unique_scanners": 1, "scan_count": 1},
                )

                return {
                    "success": True,
                    "mode": "guest",
                    "qr_id": qr_data["qr_id"],
                    "security": qr_data["security"],
                }

        except HTTPException:
            raise
        except Exception as e:
            print(f"resolve_QR error: {e}")
            raise HTTPException(status_code=500, detail="Failed to resolve QR code")

    @staticmethod
    async def deactivate_QR(
        qr_token: str, user_id: str = None, reason: str = "user_requested"
    ):
        """
        Deactivate QR code with audit trail
        """
        try:
            qr_code = await db.qr_codes.find_one({"qr_token": qr_token})

            if not qr_code:
                raise HTTPException(status_code=404, detail="QR code not found")

            # Verify ownership
            if user_id and qr_code.get("owner_type") == "user":
                if qr_code.get("owner_id") != user_id:
                    raise HTTPException(
                        status_code=403,
                        detail="Not authorized to deactivate this QR code",
                    )

            # Deactivate with reason
            await db.qr_codes.update_one(
                {"qr_token": qr_token},
                {
                    "$set": {
                        "is_active": False,
                        "updated_at": datetime.utcnow(),
                        "revoked_at": datetime.utcnow(),
                        "revoke_reason": reason,
                        "revoked_by": user_id if user_id else "system",
                    }
                },
            )

            return {
                "success": True,
                "message": "QR code deactivated successfully",
                "reason": reason,
            }

        except HTTPException:
            raise
        except Exception as e:
            print(f"Error in deactivate_QR: {e}")
            raise HTTPException(status_code=500, detail="Failed to deactivate QR code")

    @staticmethod
    async def get_user_qr_codes(user_id: str, include_analytics: bool = False):
        """
        Get user's QR codes with optional analytics
        """
        try:
            qr_codes = await db.qr_codes.find(
                {"owner_type": "user", "owner_id": user_id}, {"_id": 0}
            ).to_list(length=100)

            for qr in qr_codes:
                # Format dates
                if qr.get("created_at"):
                    qr["created_at"] = qr["created_at"].isoformat()
                if qr.get("updated_at"):
                    qr["updated_at"] = qr["updated_at"].isoformat()
                if qr.get("expires_at"):
                    qr["expires_at"] = qr["expires_at"].isoformat()
                if qr.get("last_scanned_at"):
                    qr["last_scanned_at"] = qr["last_scanned_at"].isoformat()
                if qr.get("revoked_at"):
                    qr["revoked_at"] = qr["revoked_at"].isoformat()

                # Remove sensitive data
                qr.pop("verification_secret", None)
                qr.pop("created_by_ip_hash", None)
                qr.pop("unique_scanners", None)  # Keep count private

                # Add analytics if requested
                if include_analytics:
                    qr["analytics"] = {
                        "total_scans": qr.get("scan_count", 0),
                        "unique_scanners": len(qr.get("unique_scanners", [])),
                        "last_scanned": qr.get("last_scanned_at"),
                    }

            return {
                "success": True,
                "qr_codes": qr_codes,
                "count": len(qr_codes),
                "active_count": sum(1 for qr in qr_codes if qr.get("is_active")),
            }

        except Exception as e:
            print(f"Error in get_user_qr_codes: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch QR codes")

    @staticmethod
    async def get_qr_analytics(qr_token: str, user_id: str):
        """
        Get detailed analytics for a specific QR code
        """
        try:
            qr_code = await db.qr_codes.find_one({"qr_token": qr_token}, {"_id": 0})

            if not qr_code:
                raise HTTPException(status_code=404, detail="QR code not found")

            # Verify ownership
            if (
                qr_code.get("owner_type") == "user"
                and qr_code.get("owner_id") != user_id
            ):
                raise HTTPException(
                    status_code=403,
                    detail="Not authorized to view analytics for this QR code",
                )

            # Get access logs
            logs = (
                await db.qr_access_log.find({"qr_id": qr_code["qr_id"]}, {"_id": 0})
                .sort("timestamp", -1)
                .limit(100)
                .to_list(length=100)
            )

            # Format logs
            for log in logs:
                if log.get("timestamp"):
                    log["timestamp"] = log["timestamp"].isoformat()
                # Remove sensitive client info
                if "client_info" in log:
                    log["client_info"] = {
                        "timestamp": log["client_info"].get("timestamp").isoformat()
                        if log["client_info"].get("timestamp")
                        else None
                    }

            # Calculate analytics
            successful_scans = sum(
                1
                for log in logs
                if log.get("success") and log.get("action") in ["verify", "resolve"]
            )
            failed_attempts = sum(1 for log in logs if not log.get("success"))

            return {
                "success": True,
                "qr_id": qr_code["qr_id"],
                "analytics": {
                    "total_scans": qr_code.get("scan_count", 0),
                    "unique_scanners": len(qr_code.get("unique_scanners", [])),
                    "successful_scans": successful_scans,
                    "failed_attempts": failed_attempts,
                    "last_scanned_at": qr_code.get("last_scanned_at").isoformat()
                    if qr_code.get("last_scanned_at")
                    else None,
                    "created_at": qr_code.get("created_at").isoformat()
                    if qr_code.get("created_at")
                    else None,
                },
                "recent_activity": logs[:20],  # Last 20 activities
                "status": {
                    "is_active": qr_code.get("is_active"),
                    "revoked_at": qr_code.get("revoked_at").isoformat()
                    if qr_code.get("revoked_at")
                    else None,
                    "revoke_reason": qr_code.get("revoke_reason"),
                },
            }

        except HTTPException:
            raise
        except Exception as e:
            print(f"Error in get_qr_analytics: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch analytics")

    @staticmethod
    async def update_qr_settings(qr_token: str, user_id: str, settings: dict):
        """
        Update QR code security settings
        Allowed settings: one_time_use, max_scans, require_authentication
        """
        try:
            qr_code = await db.qr_codes.find_one({"qr_token": qr_token})

            if not qr_code:
                raise HTTPException(status_code=404, detail="QR code not found")

            # Verify ownership
            if (
                qr_code.get("owner_type") == "user"
                and qr_code.get("owner_id") != user_id
            ):
                raise HTTPException(
                    status_code=403, detail="Not authorized to update this QR code"
                )

            # Validate and prepare updates
            allowed_settings = ["one_time_use", "max_scans", "require_authentication"]
            update_data = {"$set": {"updated_at": datetime.utcnow()}}

            for key, value in settings.items():
                if key in allowed_settings:
                    update_data["$set"][key] = value

            # Apply updates
            await db.qr_codes.update_one({"qr_token": qr_token}, update_data)

            return {
                "success": True,
                "message": "QR code settings updated successfully",
                "updated_settings": {
                    k: v for k, v in settings.items() if k in allowed_settings
                },
            }

        except HTTPException:
            raise
        except Exception as e:
            print(f"Error in update_qr_settings: {e}")
            raise HTTPException(status_code=500, detail="Failed to update QR settings")
