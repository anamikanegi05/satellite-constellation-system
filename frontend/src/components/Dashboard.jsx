import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import MetricsCards from "./MetricsCards";
import GroundTrackMap from "./GroundTrackMap";
import CollisionPanel from "./CollisionPanel";
import SatelliteList from "./SatelliteList";
import ManeuverTimeline from "./ManeuverTimeline";

import { getSnapshot, simulateStep } from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState({
    satellites: [],
    debris: [],
    alerts: [],
    maneuvers: [],
    metrics: {},
  });

  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [error, setError] = useState(null);

  const isRunning = useRef(false);

  const handleSelectSatellite = (sat) => {
    setSelectedSatellite(sat);
  };

  const withTimeout = (promise, ms = 1500) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms),
    );
    return Promise.race([promise, timeout]);
  };

  useEffect(() => {
    const runSimulation = async () => {
      if (isRunning.current) return;
      isRunning.current = true;

      try {
        await withTimeout(simulateStep(), 1500);
        const snapshot = await withTimeout(getSnapshot(), 1500);

        if (!snapshot) {
          setError("No data from backend");
          return;
        }

        setData({
          satellites: snapshot.satellites || [],
          debris: snapshot.debris || snapshot.debris_cloud || [],
          alerts: snapshot.alerts || [],
          maneuvers: [
            ...(snapshot.scheduled_maneuvers || []),
            ...(snapshot.executed_maneuvers || []),
          ],
          metrics: snapshot.metrics || {},
        });

        setLastUpdate(Date.now());
        setError(null);

        setSelectedSatellite((prev) => {
          if (!prev && snapshot.satellites?.length > 0) {
            return snapshot.satellites[0];
          }
          return prev;
        });

        if (snapshot.satellites?.length > 0) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Loop error:", err.message);
        setError("Backend slow / offline");
      } finally {
        isRunning.current = false;
      }
    };

    runSimulation();
    const interval = setInterval(runSimulation, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSatellite && data.satellites.length > 0) {
      const updated = data.satellites.find(
        (s) => s.id === selectedSatellite.id,
      );
      if (updated) setSelectedSatellite(updated);
    }
  }, [data.satellites]);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 space-y-4">
      <Navbar
        systemStatus={{ status: "operational" }}
        lastUpdate={lastUpdate}
      />

      <div>
        <h1 className="text-2xl font-bold text-cyan-400">
          Space Collision Avoidance System
        </h1>
        <p className="text-gray-400 text-sm">
          Real-time satellite monitoring dashboard
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded">
          {error}
        </div>
      )}

      <MetricsCards
        metrics={data.metrics}
        satellites={data.satellites}
        debris={data.debris}
        isLoading={isLoading}
      />

      {data.alerts?.length > 0 && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded font-semibold animate-pulse">
          {data.alerts.length} Collision Alerts Active
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <GroundTrackMap
            satellites={data.satellites}
            debris={data.debris}
            selectedSatellite={selectedSatellite}
            onSelectSatellite={handleSelectSatellite}
            isEmpty={!isLoading && data.satellites.length === 0}
          />
        </div>

        <div className="h-[600px]">
          <SatelliteList
            satellites={data.satellites}
            selectedSatellite={selectedSatellite}
            onSelectSatellite={handleSelectSatellite}
            isLoading={isLoading}
            isEmpty={!isLoading && data.satellites.length === 0}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CollisionPanel
          alerts={data.alerts}
          selectedSatellite={selectedSatellite}
          isEmpty={!selectedSatellite}
        />

        <ManeuverTimeline
          maneuvers={data.maneuvers}
          isLoading={isLoading}
          isEmpty={!isLoading && data.satellites.length === 0}
        />
      </div>
    </div>
  );
}
