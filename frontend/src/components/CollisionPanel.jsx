import { AlertTriangle, Shield, Info } from "lucide-react";
import GlassCard from "./ui/GlassCard";
import RadarSweep from "./ui/RadarSweep";
import NeonBadge from "./ui/NeonBadge";

export default function CollisionPanel({
  selectedSatellite,
  debris,
  satellites,
  isEmpty,
}) {
  if (isEmpty) {
    return (
      <GlassCard className="p-6 h-full flex flex-col items-center justify-center">
        <Shield className="w-12 h-12 text-gray-500 mb-3 opacity-50" />
        <h3 className="text-lg font-semibold text-gray-400 mb-1">
          No Active Monitoring
        </h3>
        <p className="text-gray-500 text-xs text-center">
          Select a satellite to monitor collisions
        </p>
      </GlassCard>
    );
  }

  const calculateDistance = (pos1, pos2) => {
    const lat1 = (parseFloat(pos1.lat) * Math.PI) / 180;
    const lat2 = (parseFloat(pos2.lat) * Math.PI) / 180;
    const lon1 = (parseFloat(pos1.lon) * Math.PI) / 180;
    const lon2 = (parseFloat(pos2.lon) * Math.PI) / 180;

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371 * c;

    const altDiff = Math.abs(parseFloat(pos1.alt) - parseFloat(pos2.alt));

    return Math.sqrt(distance * distance + altDiff * altDiff);
  };

  let nearbyDebris = [];
  let nearbySatellites = [];

  if (selectedSatellite && debris) {
    nearbyDebris = debris
      .map((deb) => ({
        ...deb,
        distance: calculateDistance(selectedSatellite.position, deb.position),
      }))
      .filter((deb) => deb.distance < 500)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  }

  if (selectedSatellite && satellites) {
    nearbySatellites = satellites
      .filter((sat) => sat.id !== selectedSatellite.id)
      .map((sat) => ({
        ...sat,
        distance: calculateDistance(selectedSatellite.position, sat.position),
      }))
      .filter((sat) => sat.distance < 300)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }

  const highThreatCount = nearbyDebris.filter((d) => d.distance < 100).length;
  const mediumThreatCount = nearbyDebris.filter(
    (d) => d.distance >= 100 && d.distance < 250,
  ).length;

  return (
    <GlassCard
      className="p-6 h-full flex flex-col"
      neonBorder={highThreatCount > 0}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold neon-text">Collision Monitoring</h2>

        {highThreatCount > 0 ? (
          <NeonBadge status="critical" pulse>
            {highThreatCount} High Risk
          </NeonBadge>
        ) : mediumThreatCount > 0 ? (
          <NeonBadge status="warning">
            {mediumThreatCount} Medium Risk
          </NeonBadge>
        ) : (
          <NeonBadge status="operational">All Clear</NeonBadge>
        )}
      </div>

      {selectedSatellite ? (
        <>
          <div className="relative h-48 mb-4 flex items-center justify-center">
            <RadarSweep size={180} />

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Monitoring</div>
                <div className="text-sm font-bold text-cyan-400">
                  {selectedSatellite.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedSatellite.id}
                </div>
              </div>
            </div>

            {nearbyDebris.slice(0, 5).map((deb, idx) => {
              const angle = (idx / 5) * 2 * Math.PI;
              const radius = 60 + (deb.distance / 500) * 30;

              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              const color =
                deb.distance < 100
                  ? "#ff3250"
                  : deb.distance < 250
                    ? "#ffc800"
                    : "#6b7280";

              return (
                <div
                  key={deb.id}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}`,
                  }}
                />
              );
            })}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Nearby Threats ({nearbyDebris.length})
            </div>

            <div className="text-xs text-cyan-400 mb-2">
              Autonomous system analyzing orbital threats in real-time...
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {nearbyDebris.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No threats detected within 500km
                </div>
              ) : (
                nearbyDebris.map((deb) => {
                  const riskLevel =
                    deb.distance < 100
                      ? "high"
                      : deb.distance < 250
                        ? "medium"
                        : "low";

                  const riskColor =
                    riskLevel === "high"
                      ? "text-red-400"
                      : riskLevel === "medium"
                        ? "text-yellow-400"
                        : "text-gray-400";

                  return (
                    <div
                      key={deb.id}
                      className="p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="text-xs font-mono text-gray-400">
                            {deb.id}
                          </div>
                          <div className="text-xs text-gray-500">
                            Size: {deb.size}m | Velocity: {deb.velocity} km/s
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-sm font-bold ${riskColor}`}>
                            {deb.distance.toFixed(1)} km
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {riskLevel} risk
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 mt-1">
                        AI:{" "}
                        {deb.distance < 100
                          ? `Collision probability HIGH (${deb.distance.toFixed(1)} km). Immediate evasive maneuver required.`
                          : deb.distance < 250
                            ? `Collision probability MODERATE (${deb.distance.toFixed(1)} km). Trajectory monitoring active.`
                            : `Collision probability LOW (${deb.distance.toFixed(1)} km). System stable. No action required.`}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {nearbySatellites.length > 0 && (
              <>
                <div className="text-sm font-semibold text-gray-300 mt-4 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Nearby Satellites ({nearbySatellites.length})
                </div>

                <div className="space-y-2">
                  {nearbySatellites.map((sat) => (
                    <div
                      key={sat.id}
                      className="flex justify-between p-2 bg-cyan-500/10 rounded border border-cyan-500/20 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-cyan-400">
                          {sat.name}
                        </div>
                        <div className="text-gray-500">{sat.id}</div>
                      </div>

                      <div className="text-cyan-400 font-bold">
                        {sat.distance.toFixed(1)} km
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Select a satellite from the map</p>
            <p className="text-xs mt-1">to monitor collision threats</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
