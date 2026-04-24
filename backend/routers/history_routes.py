from fastapi import APIRouter, Depends, HTTPException, Query
from core.database import get_db
from utils.JWT import check_auth_middleware
from controllers.history_controller import HistoryController

router = APIRouter(prefix="/history", tags=["History"])


@router.post("/create")
async def create_history(data: dict, user=Depends(check_auth_middleware)):
    session = data.get("session")
    files = data.get("files")

    if not session or not files:
        raise HTTPException(status_code=400, detail="Missing data")

    return await HistoryController.create_History(session, files)


@router.get("/")
async def get_history(
    type: str = Query("all", enum=["all", "sent", "received"]),
    page: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user=Depends(check_auth_middleware),
):
    return await HistoryController.get_history(
        user=user,
        type=type,
        page=page,
        limit=limit,
    )


@router.get("/{transfer_id}")
async def get_one_history(
    transfer_id: str,
    user: dict = Depends(check_auth_middleware),
):
    return await HistoryController.get_one_history(transfer_id, user)


@router.get("/{transfer_id}/download")
async def download_transfer_zip(
    transfer_id: str, user: dict = Depends(check_auth_middleware)
):
    print("🔥 ROUTE HIT:", transfer_id)
    return await HistoryController.download_transfer_zip(transfer_id, user)
