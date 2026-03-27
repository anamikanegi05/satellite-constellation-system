from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime


class Vector3D(BaseModel):
    x: float
    y: float
    z: float


class Satellite(BaseModel):
    id: str
    name: Optional[str] = None
    status: str = "active"
    position: Vector3D
    velocity: Vector3D
    fuel: float = Field(default=50.0, ge=0)


class Debris(BaseModel):
    id: str
    size: float = Field(default=1.0, gt=0)
    position: Vector3D
    velocity: Vector3D


class TelemetryPayload(BaseModel):
    satellites: List[Satellite]
    debris: List[Debris]


class Maneuver(BaseModel):
    satellite_id: str
    delta_v: Vector3D
    execute_at: Optional[int] = None


class RiskLevel(str, Enum):
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"


class Alert(BaseModel):
    satellite_id: str
    debris_id: str
    risk_level: RiskLevel
    distance: float


class ManeuverOut(BaseModel):
    satellite_id: str
    delta_v: Vector3D
    execute_at: int
    status: str = "scheduled"


class Metrics(BaseModel):
    total_satellites: int
    collisions_avoided: int
    active_warnings: int
    system_health: float


class SimulationResponse(BaseModel):
    tick: int
    alerts: List[Alert]
    executed_maneuvers: List[ManeuverOut]
    scheduled_remaining: int
    active_warnings: int
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat()
    )


class SnapshotResponse(BaseModel):
    tick: int
    satellites: List[Satellite]
    debris: List[Debris]
    scheduled_maneuvers: List[ManeuverOut]
    executed_maneuvers: List[ManeuverOut]
    active_warnings: int
    metrics: Metrics