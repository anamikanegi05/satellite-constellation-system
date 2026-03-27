# Satellite Constellation Frontend

## Overview

This is the frontend dashboard for the **Satellite Constellation System**, built to visualize real-time satellite activity, collision risks, and maneuver operations.

It connects with the FastAPI backend to display:

* Satellite positions
* Debris tracking
* Collision alerts
* Maneuver activity
* System metrics

---

## Features

* Real-time dashboard UI
* Satellite monitoring and selection
* Collision detection visualization
* Maneuver activity timeline
* System metrics (health, fuel, warnings)
* Interactive map (Ground Track)
* Auto-refresh simulation updates

---

## Tech Stack

* React.js
* Tailwind CSS
* Axios
* Lucide Icons

---

## Project Structure

```
frontend/
│── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── CollisionPanel.jsx
│   │   ├── GroundTrackMap.jsx
│   │   ├── SatelliteList.jsx
│   │   ├── ManeuverTimeline.jsx
│   │   ├── MetricsCards.jsx
│   │   └── ui/
│   │       ├── GlassCard.jsx
│   │       ├── NeonBadge.jsx
│   │       ├── Tooltip.jsx
│   │       └── LoadingSkeleton.jsx
│   ├── services/
│   │   └── api.js
│   └── App.js
│── package.json
│── README.md
```

---

## Getting Started

### 1. Install dependencies

```
npm install
```

### 2. Run frontend

```
npm run dev
```

or (if using CRA)

```
npm start
```

---

## Backend Connection

Make sure backend is running at:

```
http://localhost:8000
```

API base used:

```
http://localhost:8000/api
```

---

## Main Functional Flow

1. Frontend calls `/simulate/step`
2. Then fetches `/visualization/snapshot`
3. Updates UI with:

   * satellites
   * debris
   * maneuvers
   * metrics

---

## Notes

* Requires backend to be running
* Uses polling (auto refresh every ~1 second)
* UI updates in real-time

---

## Limitations

* No authentication
* No persistent storage
* Simulation-based data only

---

## Future Improvements

* WebSocket real-time updates
* Better collision visualization
* Advanced filtering & controls
* User authentication
* Deployment optimization

---

## Team Members

* Anamika Negi
* Chetaney Kant
* Jatin Kumar
* Aanchal Srivastava

---
