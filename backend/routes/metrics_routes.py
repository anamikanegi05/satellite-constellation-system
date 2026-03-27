from fastapi import APIRouter
from services.data_store import store
router = APIRouter()
@router.get("/metrics")
def get_metrics() -> dict:
    return store.get_metrics()

