class InMemoryStore:
    def __init__(self) -> None:
        self.satellites: list[dict] = []
        self.debris: list[dict] = []

        self.maneuvers: list[dict] = []

        self.scheduled_maneuvers: list[dict] = []
        self.executed_maneuvers: list[dict] = []

        self.collisions_avoided: int = 0
        self.active_warnings: int = 0

        self.tick: int = 0

    def save_telemetry(self, satellites, debris) -> None:

        if satellites and not self.satellites:
            self.satellites.clear()
            self.satellites.extend([sat.model_dump() for sat in satellites])

        if debris and not self.debris:
            self.debris.clear()
            self.debris.extend([deb.model_dump() for deb in debris])

        if not hasattr(self, "tick"):
            self.tick = 0

        if not hasattr(self, "scheduled_maneuvers"):
            self.scheduled_maneuvers = []

        if not hasattr(self, "executed_maneuvers"):
            self.executed_maneuvers = []

    def schedule_maneuver(self, maneuver: dict):
        self.scheduled_maneuvers.append(maneuver)

    def execute_maneuver(self, maneuver: dict):
        maneuver["status"] = "executed"
        self.executed_maneuvers.append(maneuver)

        self.collisions_avoided += 1
        self.active_warnings = max(0, self.active_warnings - 1)

    def reduce_satellite_fuel(self, satellite_id: str, fuel_drop: float):
        for sat in self.satellites:
            if sat["id"] == satellite_id:
                current = float(sat.get("fuel") or 0)
                sat["fuel"] = max(0.0, current - fuel_drop)
                break

    def get_metrics(self):
        return {
            "total_satellites": len(self.satellites),
            "collisions_avoided": self.collisions_avoided,
            "active_warnings": self.active_warnings,
            "scheduled": len(self.scheduled_maneuvers),
        }


store = InMemoryStore()


store.satellites = [
    {
        "id": f"SAT-{i}",
        "name": f"Satellite-{i}",
        "status": "operational",
        "position": {
            "x": i * 200,
            "y": (i % 5) * 150,
            "z": 0
        },
        "velocity": {
            "x": (i % 3) + 1,
            "y": ((i + 1) % 3) + 1,
            "z": 0
        },
        "fuel": 100 - i * 3
    }
    for i in range(1, 16)
]


store.satellites += [
    {
        "id": "SAT-C1",
        "name": "Collision-1",
        "status": "operational",
        "position": {"x": 0, "y": 0, "z": 0},
        "velocity": {"x": 2, "y": 0, "z": 0},
        "fuel": 90
    },
    {
        "id": "SAT-C2",
        "name": "Collision-2",
        "status": "operational",
        "position": {"x": 20, "y": 0, "z": 0},
        "velocity": {"x": -2, "y": 0, "z": 0},
        "fuel": 85
    }
]


store.debris = [
    {
        "id": f"DEB-{i}",
        "size": 2 + (i % 3),
        "position": {
            "x": i * 180,
            "y": (i % 4) * 200,
            "z": 0
        },
        "velocity": {
            "x": -((i % 2) + 1),
            "y": (i % 3),
            "z": 0
        }
    }
    for i in range(1, 8)
]


store.debris += [
    {
        "id": "DEB-C1",
        "size": 3,
        "position": {"x": 10, "y": 0, "z": 0},
        "velocity": {"x": -1, "y": 0, "z": 0}
    }
]


def process_telemetry(payload, auto_schedule: bool = False):
    from services.collision import detect_collision_alerts
    from services.maneuvers import calculate_evasion_maneuver, magnitude

    print("process_telemetry called")

    def is_valid(obj):
        return all(k in obj for k in ["position", "velocity"])

    def is_moving_away(sat, deb):
        try:
            rel_pos = {
                "x": deb["position"]["x"] - sat["position"]["x"],
                "y": deb["position"]["y"] - sat["position"]["y"],
                "z": deb["position"]["z"] - sat["position"]["z"],
            }

            rel_vel = {
                "x": deb["velocity"]["x"] - sat["velocity"]["x"],
                "y": deb["velocity"]["y"] - sat["velocity"]["y"],
                "z": deb["velocity"]["z"] - sat["velocity"]["z"],
            }

            dot = (
                rel_pos["x"] * rel_vel["x"] +
                rel_pos["y"] * rel_vel["y"] +
                rel_pos["z"] * rel_vel["z"]
            )

            return dot > 0

        except Exception as e:
            print("Moving-away calc error:", str(e))
            return False

    if payload.satellites or payload.debris:
        store.save_telemetry(payload.satellites, payload.debris)

    satellites = store.satellites
    debris = store.debris

    alerts = detect_collision_alerts(satellites, debris)

    if not auto_schedule:
        store.active_warnings = len(alerts)
        return {
            "message": "Telemetry processed (manual mode)",
            "collision_alerts": alerts,
        }

    for alert in alerts:
        risk = alert.get("risk_level") or alert.get("risk")

        if risk not in ["CRITICAL", "WARNING"]:
            continue

        sat = next((s for s in satellites if s["id"] == alert.get("satellite_id")), None)
        deb = next((d for d in debris if d["id"] == alert.get("debris_id")), None)

        if not sat or not deb:
            continue

        if not is_valid(sat) or not is_valid(deb):
            continue

        try:
            if is_moving_away(sat, deb):
                continue

            delta_v = calculate_evasion_maneuver(sat, deb, risk)

            fuel_required = float(magnitude(delta_v)) * 0.5
            fuel_available = float(sat.get("fuel") or 0)

            if fuel_available < fuel_required:
                continue

            execute_at = store.tick + 1

            already_exists = any(
                m["satellite_id"] == sat["id"]
                and m["execute_at"] == execute_at
                for m in store.scheduled_maneuvers
            )

            if not already_exists:
                store.schedule_maneuver({
                    "satellite_id": sat["id"],
                    "delta_v": delta_v,
                    "execute_at": execute_at,
                    "fuel_required": fuel_required,
                    "status": "scheduled"
                })

                print(f"Auto Scheduled: {sat['id']}")

        except Exception as e:
            print("Maneuver error:", str(e))

    store.active_warnings = len(alerts)

    return {
        "message": "Telemetry processed (auto mode)",
        "collision_alerts": alerts,
    }