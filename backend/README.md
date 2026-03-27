# Satellite Constellation Backend

## Overview

A high-performance backend system built with FastAPI to simulate and manage a satellite constellation.
It handles satellite telemetry, debris tracking, collision detection, and automated maneuver scheduling in real time.

---

## Key Features

* Real-time satellite & debris simulation
* Collision detection system (CRITICAL / WARNING)
* Auto + Manual maneuver scheduling
* Fuel-based maneuver constraints
* Tick-based simulation engine
* System health & metrics tracking
* High-speed in-memory architecture

---

## Tech Stack

* Python
* FastAPI
* Pydantic

---

## Project Structure

```
backend/
│── main.py
│── models/
│   └── schemas.py
│── routes/
│   ├── telemetry_routes.py
│   ├── metrics_routes.py
│   ├── maneuver_routes.py
│   ├── simulation_routes.py
│   └── visualization_routes.py
│── services/
│   ├── data_store.py
│   ├── simulation.py
│   ├── collision.py
│   └── maneuvers.py
│── README.md
```

---

## Getting Started

### Install dependencies

```
pip install fastapi uvicorn
```

### Run the server

```
uvicorn main:app --reload
```

### Open in browser

http://127.0.0.1:8000/docs

---

## API Endpoints

### Health

GET /

### Initialize Data

POST /api/init

### Simulation

POST /api/simulate/step

### Maneuvers

POST /api/maneuver/schedule
GET /api/maneuvers

### Visualization

GET /api/visualization/snapshot

---

## Example Workflow

1. Initialize system:
   POST /api/init

2. Run simulation:
   POST /api/simulate/step

3. View system state:
   GET /api/visualization/snapshot

---

## Notes

* In-memory system (no database)
* Data resets on restart

---

## Team Members

- Anamika Negi  
- Chetaney Kant  
- Jatin Kumar  
- Aanchal Srivastava