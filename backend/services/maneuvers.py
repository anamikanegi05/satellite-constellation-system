
import math

print("maneuvers.py loaded")

MAX_DELTA_V = 15.0
FUEL_CONSUMPTION_FACTOR = 0.05


def magnitude(v):
    return math.sqrt(v["x"]**2 + v["y"]**2 + v["z"]**2)


def normalize(v):
    mag = magnitude(v)
    if mag == 0:
        return {"x": 0, "y": 0, "z": 0}
    return {
        "x": v["x"] / mag,
        "y": v["y"] / mag,
        "z": v["z"] / mag,
    }


def calculate_evasion_maneuver(satellite, debris, risk_level):
    sat_pos = satellite.get("position", {})
    deb_pos = debris.get("position", {})

    direction = {
        "x": sat_pos.get("x", 0) - deb_pos.get("x", 0),
        "y": sat_pos.get("y", 0) - deb_pos.get("y", 0),
        "z": sat_pos.get("z", 0) - deb_pos.get("z", 0),
    }

    direction = normalize(direction)

    if risk_level == "CRITICAL":
        scale = 5
    elif risk_level == "WARNING":
        scale = 2
    else:
        scale = 0

    delta_v = {
        "x": direction["x"] * scale,
        "y": direction["y"] * scale,
        "z": direction["z"] * scale,
    }

    return delta_v


def apply_maneuver(satellite, delta_v):
    if "velocity" not in satellite:
        satellite["velocity"] = {"x": 0, "y": 0, "z": 0}

    dv_mag = magnitude(delta_v)

    if dv_mag > MAX_DELTA_V:
        print("Skipped: exceeds max dv")
        return False

    if "fuel" not in satellite:
        satellite["fuel"] = 0

    fuel_needed = dv_mag * FUEL_CONSUMPTION_FACTOR

    if satellite["fuel"] < fuel_needed:
        print("Skipped: not enough fuel")
        return False

    satellite["velocity"]["x"] += delta_v.get("x", 0)
    satellite["velocity"]["y"] += delta_v.get("y", 0)
    satellite["velocity"]["z"] += delta_v.get("z", 0)

    satellite["fuel"] -= fuel_needed

    return True