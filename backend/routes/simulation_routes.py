from fastapi import APIRouter
from services.simulation import run_simulation_tick
from services.data_store import store
from models.schemas import SimulationResponse

router = APIRouter()


@router.post("/init")
def initialize_data():
    store.satellites = [
        {
            "id": "SAT-1",
            "name": "Test Sat",
            "status": "active",
            "position": {"x": 100, "y": 200, "z": 0},
            "velocity": {"x": 1, "y": 1, "z": 0},
            "fuel": 100
        },
        {
            "id": "SAT-2",
            "name": "Explorer",
            "status": "active",
            "position": {"x": 300, "y": 100, "z": 0},
            "velocity": {"x": -1, "y": 1, "z": 0},
            "fuel": 80
        }
    ]

    store.debris = [
        {
            "id": "DEB-1",
            "size": 2,
            "position": {"x": 150, "y": 250, "z": 0},
            "velocity": {"x": -1, "y": 0, "z": 0}
        },
        {
            "id": "DEB-2",
            "size": 3,
            "position": {"x": 250, "y": 150, "z": 0},
            "velocity": {"x": 0, "y": -1, "z": 0}
        }
    ]

    store.tick = 0
    store.active_warnings = 0

    return {
        "message": "Initialized successfully",
        "satellites": len(store.satellites),
        "debris": len(store.debris)
    }


@router.post("/simulate/step", response_model=SimulationResponse)
def simulate_step():
    result = run_simulation_tick()

    return {
        "tick": result["tick"],
        "alerts": result["alerts"],
        "executed_maneuvers": result["executed_maneuvers"],
        "scheduled_remaining": result["scheduled_remaining"],
        "active_warnings": store.active_warnings
    }