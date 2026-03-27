from fastapi import APIRouter, HTTPException
from models.schemas import Maneuver
from services.data_store import store

router = APIRouter()

FUEL_COST_PER_UNIT = 0.5


@router.post("/maneuver/schedule")
def schedule_maneuver(maneuver: Maneuver):

    satellite_id = maneuver.satellite_id
    delta_v = maneuver.delta_v.dict()

    execute_at = maneuver.execute_at if maneuver.execute_at is not None else store.current_tick + 1

    print("Satellites in store:", store.satellites)
    print("Requested satellite_id:", satellite_id)

    satellite = next(
        (s for s in store.satellites if s["id"] == satellite_id),
        None
    )

    if not satellite:
        print("Satellite not found. Current store:", store.satellites)
        raise HTTPException(status_code=404, detail="Satellite not found")

    fuel_required = (
        abs(delta_v.get("x", 0)) +
        abs(delta_v.get("y", 0)) +
        abs(delta_v.get("z", 0))
    ) * FUEL_COST_PER_UNIT

    if satellite.get("fuel", 0) < fuel_required:
        raise HTTPException(status_code=400, detail="Not enough fuel")

    scheduled = {
        "satellite_id": satellite_id,
        "delta_v": delta_v,
        "execute_at": execute_at,
        "fuel_required": fuel_required,
        "status": "scheduled"
    }

    store.scheduled_maneuvers.append(scheduled)

    return {
        "message": "Maneuver scheduled successfully",
        "scheduled": scheduled
    }


@router.get("/maneuvers")
def get_maneuvers():
    clean_data = []

    for m in store.scheduled_maneuvers:
        clean_data.append({
            "satellite_id": str(m.get("satellite_id")),
            "delta_v": {
                "x": float(m.get("delta_v", {}).get("x", 0)),
                "y": float(m.get("delta_v", {}).get("y", 0)),
                "z": float(m.get("delta_v", {}).get("z", 0)),
            },
            "execute_at": m.get("execute_at"),
            "fuel_required": m.get("fuel_required"),
            "status": m.get("status")
        })

    return {
        "count": len(clean_data),
        "maneuvers": clean_data
    }