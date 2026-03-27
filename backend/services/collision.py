from math import sqrt

CRITICAL_DISTANCE_KM = 0.1
WARNING_DISTANCE_KM = 5.0


def _distance(a, b):
    dx = a["x"] - b["x"]
    dy = a["y"] - b["y"]
    dz = a["z"] - b["z"]
    return sqrt(dx * dx + dy * dy + dz * dz)


def _predict_position(obj, t):
    return {
        "x": obj["position"]["x"] + obj["velocity"]["x"] * t,
        "y": obj["position"]["y"] + obj["velocity"]["y"] * t,
        "z": obj["position"]["z"] + obj["velocity"]["z"] * t,
    }


def detect_collision_alerts(satellites, debris_items):
    alerts = []

    time_steps = [1, 2, 3, 5, 10]

    for sat in satellites:
        for deb in debris_items:
            for t in time_steps:
                sat_future = _predict_position(sat, t)
                deb_future = _predict_position(deb, t)

                distance_km = _distance(sat_future, deb_future)

                if distance_km < CRITICAL_DISTANCE_KM:
                    alerts.append({
                        "satellite_id": sat["id"],
                        "debris_id": deb["id"],
                        "risk_level": "CRITICAL",
                        "distance": round(distance_km, 6),
                        "time_to_collision": t
                    })
                    break

                elif distance_km < WARNING_DISTANCE_KM:
                    alerts.append({
                        "satellite_id": sat["id"],
                        "debris_id": deb["id"],
                        "risk_level": "WARNING",
                        "distance": round(distance_km, 6),
                        "time_to_collision": t
                    })
                    break

    return alerts