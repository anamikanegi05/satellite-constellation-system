


from math import sqrt
from services.data_store import store
from models.schemas import RiskLevel


if len(store.satellites) < 10:
    print("Reinitializing satellites")

    store.satellites = [
        {
            "id": f"SAT-{i}",
            "name": f"Satellite-{i}",
            "status": "operational",
            "position": {"x": i * 150, "y": (i % 5) * 120, "z": 0},
            "velocity": {"x": 2, "y": 1, "z": 0},
            "fuel": 100
        }
        for i in range(1, 16)
    ]


store.debris = [
    {
    "id": "DEB-1",
    "size": 2,
    "position": {"x": 20, "y": 0, "z": 0},
    "velocity": {"x": -2, "y": 0, "z": 0}
    },
    {
        "id": "DEB-2",
        "size": 3,
        "position": {"x": -20, "y": 10, "z": 0},
        "velocity": {"x": 1, "y": -1, "z": 0}
    }
]


CRITICAL_DISTANCE = 10
WARNING_DISTANCE = 30


def calculate_distance(p1, p2):
    return sqrt(
        (p1["x"] - p2["x"])**2 +
        (p1["y"] - p2["y"])**2 +
        (p1["z"] - p2["z"])**2
    )


def simulate_movement():
    for obj in store.satellites + store.debris:

        if "position" not in obj:
            continue

        obj.setdefault("velocity", {"x": 0, "y": 0, "z": 0})

        vx = obj["velocity"].get("x", 0)
        vy = obj["velocity"].get("y", 0)
        vz = obj["velocity"].get("z", 0)

        obj["position"]["x"] += vx * 3
        obj["position"]["y"] += vy * 3
        obj["position"]["z"] += vz * 3


def detect_collisions():
    alerts = []

    for sat in store.satellites:
        for deb in store.debris:

            if "position" not in sat or "position" not in deb:
                continue

            dist = calculate_distance(sat["position"], deb["position"])

            if dist < CRITICAL_DISTANCE:
                alerts.append({
                    "satellite_id": sat["id"],
                    "debris_id": deb["id"],
                    "risk_level": RiskLevel.CRITICAL,
                    "distance": dist
                })

            elif dist < WARNING_DISTANCE:
                alerts.append({
                    "satellite_id": sat["id"],
                    "debris_id": deb["id"],
                    "risk_level": RiskLevel.WARNING,
                    "distance": dist
                })

    return alerts


def execute_scheduled_maneuvers(current_tick):
    executed_now = []

    for m in list(store.scheduled_maneuvers):

        if m.get("status") != "scheduled":
            continue

        if m.get("execute_at") != current_tick:
            continue

        sat = next(
            (s for s in store.satellites if s["id"] == m["satellite_id"]),
            None
        )

        if not sat:
            continue

        sat.setdefault("velocity", {"x": 0, "y": 0, "z": 0})

        if sat.get("fuel", 0) < m.get("fuel_required", 0):
            m["status"] = "skipped"
            continue

        dv = m["delta_v"]

        sat["velocity"]["x"] += dv.get("x", 0)
        sat["velocity"]["y"] += dv.get("y", 0)
        sat["velocity"]["z"] += dv.get("z", 0)

        sat["fuel"] -= m.get("fuel_required", 0)

        m["status"] = "executed"

        store.executed_maneuvers.append(m)
        executed_now.append(m)

    store.scheduled_maneuvers = [
        m for m in store.scheduled_maneuvers
        if m.get("status") == "scheduled"
    ]

    return executed_now


def run_simulation_tick():
    store.tick += 1
    current_tick = store.tick

    print(f"\nTick: {current_tick}")

    executed = execute_scheduled_maneuvers(current_tick)

    simulate_movement()

    alerts = detect_collisions()

    for alert in alerts:
        already_scheduled = any(
            m["satellite_id"] == alert["satellite_id"]
            for m in store.scheduled_maneuvers
        )

        if not already_scheduled:
            store.scheduled_maneuvers.append({
                "satellite_id": alert["satellite_id"],
                "delta_v": {"x": 1, "y": 1, "z": 0},
                "execute_at": store.tick + 2,
                "fuel_required": 5,
                "status": "scheduled"
            })

    store.active_warnings = len(alerts)

    return {
        "tick": current_tick,
        "alerts": alerts,
        "active_warnings": len(alerts),
        "executed_maneuvers": executed,
        "scheduled_maneuvers": store.scheduled_maneuvers,
        "scheduled_remaining": len(store.scheduled_maneuvers),
        "satellites": store.satellites,
        "debris": store.debris
    }