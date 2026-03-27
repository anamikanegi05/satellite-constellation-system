

from fastapi import APIRouter
from models.schemas import TelemetryPayload
from services.data_store import process_telemetry

router = APIRouter()


@router.post("/telemetry")
def telemetry(payload: TelemetryPayload):
    return process_telemetry(payload)