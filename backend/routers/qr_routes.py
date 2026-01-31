from fastapi import APIRouter, Request, Response, Depends, Query
from controllers.qr_controller import Qr_controller
from utils.JWT import check_auth_middleware, get_current_user_optional
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter(prefix="/QR", tags=["QR Code Management"])


class QRVerifyRequest(BaseModel):
    qr_token: str = Field(..., description="QR code token to verify")
    verification_secret: Optional[str] = Field(
        None, description="Optional verification secret for enhanced security"
    )


class QRResolveRequest(BaseModel):
    qr_token: str = Field(..., description="QR code token to resolve")
    verification_secret: Optional[str] = Field(
        None, description="Optional verification secret"
    )


class QRDeactivateRequest(BaseModel):
    qr_token: str = Field(..., description="QR code token to deactivate")
    reason: str = Field(default="user_requested", description="Reason for deactivation")


class QRSettingsUpdate(BaseModel):
    one_time_use: Optional[bool] = Field(None, description="Enable one-time use")
    max_scans: Optional[int] = Field(
        None, description="Maximum number of scans allowed"
    )
    require_authentication: Optional[bool] = Field(
        None, description="Require user to be logged in to scan"
    )


@router.post("/create", summary="Create QR Code")
async def generate_qr(request: Request, response: Response):
    """
    Create a new QR code with advanced security features

    **Authenticated Users:**
    - Get permanent QR codes (no expiry)
    - One QR per user (returns existing if already created)
    - Full analytics and tracking

    **Guest Users:**
    - Get temporary QR codes (10 minute expiry)
    - Limited tracking

    **Security Features:**
    - Unique verification secret (returned only once)
    - Rate limiting
    - IP tracking (anonymized)
    - Scan count tracking
    - Optional usage limits

    **Returns:**
    - `qr_token`: Use this to verify/resolve the QR code
    - `verification_secret`: Store securely, used for enhanced verification
    - Security metadata including scan limits and current usage
    """
    return await Qr_controller.create_QR(request, response)


@router.post("/verify", summary="Verify QR Code")
async def verify_qr(payload: QRVerifyRequest, request: Request):
    """
    Verify a QR code token with comprehensive security checks

    **Security Checks:**
    - Rate limiting (10 attempts per minute per IP)
    - Expiry validation
    - Scan limit enforcement
    - Optional secret verification
    - One-time use enforcement
    - Authentication requirement check

    **Returns:**
    - QR code details
    - Owner information (anonymized)
    - Security metrics (scan count, unique scanners)
    - New scanner detection

    **Error Cases:**
    - 429: Rate limit exceeded
    - 404: QR code not found
    - 400: Expired, inactive, or max scans reached
    - 403: Invalid verification secret
    - 401: Authentication required
    """
    return await Qr_controller.verify_QR(
        request, payload.qr_token, payload.verification_secret
    )


@router.post("/resolve", summary="Resolve QR Code")
async def resolve_qr(payload: QRResolveRequest, request: Request):
    """
    Resolve QR code and get context-aware information

    **For Authenticated Users:**
    - Full owner information (if different user)
    - Indication if scanning own QR code
    - Complete security metrics

    **For Guest Users:**
    - Limited information
    - Prompt to login for full details
    - Basic security metrics

    **Privacy Features:**
    - Owner email hidden if scanning own QR
    - IP addresses anonymized
    - Unique scanner tracking without PII

    **Returns different data based on:**
    - Authentication status
    - QR code ownership
    - Privacy settings
    """
    return await Qr_controller.resolve_QR(
        request, payload.qr_token, payload.verification_secret
    )


@router.post("/deactivate", summary="Deactivate QR Code")
async def deactivate_qr(
    payload: QRDeactivateRequest, user=Depends(check_auth_middleware)
):
    """
    Deactivate a QR code (requires authentication)

    **Requirements:**
    - User must be authenticated
    - User must own the QR code (for user-type QR codes)

    **Effects:**
    - Sets QR code to inactive
    - Records deactivation timestamp
    - Logs deactivation reason
    - Records who deactivated it

    **Note:** Deactivated QR codes cannot be reactivated
    """
    return await Qr_controller.deactivate_QR(
        payload.qr_token, user["user_id"], payload.reason
    )


@router.get("/my-qr-codes", summary="List My QR Codes")
async def get_my_qr_codes(
    include_analytics: bool = Query(False, description="Include detailed analytics"),
    user=Depends(check_auth_middleware),
):
    """
    Get all QR codes for the authenticated user

    **Parameters:**
    - `include_analytics`: Include scan statistics and metrics

    **Returns:**
    - List of all user's QR codes
    - Total count
    - Active count
    - Optional analytics per QR code

    **Analytics Include:**
    - Total scans
    - Unique scanners count
    - Last scanned timestamp
    """
    return await Qr_controller.get_user_qr_codes(user["user_id"], include_analytics)


@router.get("/analytics/{qr_token}", summary="Get QR Code Analytics")
async def get_qr_analytics(qr_token: str, user=Depends(check_auth_middleware)):
    """
    Get detailed analytics for a specific QR code

    **Requirements:**
    - User must be authenticated
    - User must own the QR code

    **Returns:**
    - Total scans and unique scanners
    - Success vs failed attempts
    - Last 20 recent activities with timestamps
    - Status information (active, revoked, etc.)
    - Revocation details if applicable

    **Privacy:**
    - Scanner IPs are anonymized
    - Only aggregated data is shown
    - Recent activity shows actions without PII
    """
    return await Qr_controller.get_qr_analytics(qr_token, user["user_id"])


@router.patch("/settings/{qr_token}", summary="Update QR Code Settings")
async def update_qr_settings(
    qr_token: str, settings: QRSettingsUpdate, user=Depends(check_auth_middleware)
):
    """
    Update security settings for a QR code

    **Requirements:**
    - User must be authenticated
    - User must own the QR code

    **Updatable Settings:**
    - `one_time_use`: Make QR code single-use
    - `max_scans`: Set maximum scan limit
    - `require_authentication`: Require login to scan

    **Examples:**
    ```json
    {
      "one_time_use": true,
      "max_scans": 100,
      "require_authentication": true
    }
    ```

    **Notes:**
    - Settings apply immediately
    - Cannot decrease scan count below current
    - One-time use deactivates after next scan
    """
    return await Qr_controller.update_qr_settings(
        qr_token, user["user_id"], settings.dict(exclude_none=True)
    )


@router.get("/scan-statistics", summary="Get Scan Statistics")
async def get_scan_statistics(user=Depends(check_auth_middleware)):
    """
    Get aggregated scan statistics for all user's QR codes

    **Returns:**
    - Total QR codes created
    - Total scans across all QR codes
    - Active vs inactive count
    - Most scanned QR code
    - Recent activity summary
    """
    # This would aggregate data from all user's QR codes
    # Implementation can be added based on requirements
    return {
        "success": True,
        "message": "Statistics endpoint - to be implemented based on specific requirements",
    }
