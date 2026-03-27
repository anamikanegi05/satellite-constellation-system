from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.telemetry_routes import router as telemetry_router
from routes.metrics_routes import router as metrics_router
from routes.maneuver_routes import router as maneuver_router
from routes.simulation_routes import router as simulation_router
from routes.visualization_routes import router as visualization_router

print("THIS FILE IS RUNNING")

app = FastAPI(
    title="Satellite Constellation Backend",
    description="High-performance in-memory API for satellites, debris, and maneuvers.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(telemetry_router, prefix="/api", tags=["Telemetry"])
app.include_router(metrics_router, prefix="/api", tags=["Metrics"])
app.include_router(maneuver_router, prefix="/api", tags=["Maneuvers"])
app.include_router(simulation_router, prefix="/api", tags=["Simulation"])
app.include_router(visualization_router, prefix="/api", tags=["Visualization"])


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "Satellite backend is running"
    }