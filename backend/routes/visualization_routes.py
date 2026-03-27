from fastapi import APIRouter
from services.data_store import store
from models.schemas import SnapshotResponse

router = APIRouter()


@router.get("/visualization/snapshot", response_model=SnapshotResponse)
def get_snapshot():

    satellites = store.satellites or []
    warnings = store.active_warnings or 0
    total = len(satellites)

    ratio = min(1, warnings / total) if total > 0 else 0
    health = max(10, 100 - ratio * 30)

    metrics = {
    "total_satellites": total,

    "active_satellites": len([
        s for s in satellites
        if s.get("status") in ["active", "operational"]
    ]),

    "collisions_avoided": len(store.executed_maneuvers or []),

    "active_warnings": warnings,

    "active_maneuvers": len(store.scheduled_maneuvers or []),

    "system_health": round(health, 1)
    }

    return {
        "tick": store.tick or 0,
        "satellites": satellites,
        "debris": store.debris or [],
        "scheduled_maneuvers": store.scheduled_maneuvers or [],
        "executed_maneuvers": store.executed_maneuvers or [],
        "active_warnings": warnings,
        "metrics": metrics
    }