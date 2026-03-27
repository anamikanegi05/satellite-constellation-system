import { Satellite, Fuel, Activity, Thermometer } from "lucide-react";
import GlassCard from "./ui/GlassCard";
import NeonBadge from "./ui/NeonBadge";
import Tooltip from "./ui/Tooltip";
import LoadingSkeleton from "./ui/LoadingSkeleton";

export default function SatelliteList({
  satellites,
  selectedSatellite,
  onSelectSatellite,
  isLoading,
  isEmpty,
}) {
  if (isLoading) {
    return (
      <GlassCard className="p-6 h-full flex flex-col">
        <h2 className="text-xl font-bold neon-text mb-4">Satellite Status</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3 bg-white/5 rounded">
              <LoadingSkeleton className="mb-2" height="h-4" />
              <LoadingSkeleton height="h-3" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  if (isEmpty) {
    return (
      <GlassCard className="p-6 h-full flex flex-col items-center justify-center">
        <Satellite className="w-12 h-12 text-gray-500 mb-3 opacity-50" />
        <h3 className="text-lg font-semibold text-gray-400 mb-1">
          System Offline
        </h3>
        <p className="text-gray-500 text-xs text-center">
          No satellites in constellation
        </p>
      </GlassCard>
    );
  }

  const getFuelColor = (fuel) => {
    if (fuel > 60) return "from-green-500 to-emerald-400";
    if (fuel > 30) return "from-yellow-500 to-orange-400";
    return "from-red-500 to-pink-400";
  };

  const getHealthColor = (health) => {
    if (health > 80) return "text-green-400";
    if (health > 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold neon-text">Satellite Status</h2>
        <div className="text-xs text-gray-400">
          {satellites?.length || 0} Total
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
        {satellites?.map((sat) => {
          const isSelected =
            selectedSatellite && selectedSatellite.id === sat.id;

          // ✅ POSITION SAFE
          const pos = sat.position || { x: 0, y: 0, z: 0 };
          const vel = sat.velocity || { x: 0, y: 0, z: 0 };

          const x = Number(pos?.x || 0).toFixed(2);
          const y = Number(pos?.y || 0).toFixed(2);
          const vx = Number(vel?.x || 0).toFixed(2);
          const vy = Number(vel?.y || 0).toFixed(2);

          // ✅ 🔥 FINAL FIX (NO NaN EVER)
          const fuelRaw = Number(sat?.fuel);
          const healthRaw = Number(sat?.health);

          const fuel = isNaN(fuelRaw) ? 0 : fuelRaw;
          const health = isNaN(healthRaw) ? 100 : healthRaw;

          const temp = sat?.temperature ?? "--";
          const altitude = sat?.altitude ?? "--";

          return (
            <div
              key={sat.id}
              onClick={() => onSelectSatellite(sat)}
              className={`p-3 rounded cursor-pointer transition-all ${
                isSelected
                  ? "bg-cyan-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                  : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Satellite className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-sm text-white">
                      {sat.name || "Unknown"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {sat.id}
                  </div>
                </div>
                <NeonBadge status={sat.status}>{sat.status}</NeonBadge>
              </div>

              <div className="space-y-2 text-xs">
                {/* FUEL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Fuel className="w-3 h-3" />
                      <span>Fuel</span>
                    </div>
                    <span className="text-white font-semibold">
                      {Number(fuel).toFixed(1)}%
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className={`progress-fill bg-gradient-to-r ${getFuelColor(
                        fuel,
                      )}`}
                      style={{ width: `${fuel}%` }}
                    />
                  </div>

                  {fuel < 20 && (
                    <div className="text-[10px] text-red-400 mt-1">
                      ⚠ Low fuel — maneuver risk
                    </div>
                  )}
                </div>

                {/* HEALTH */}
                <div className="flex items-center justify-between">
                  <Tooltip
                    content={`System health: ${Number(health).toFixed(0)}%`}
                  >
                    <div className="flex items-center gap-1 text-gray-400">
                      <Activity className="w-3 h-3" />
                      <span>Health</span>
                    </div>
                  </Tooltip>
                  <span className={`font-semibold ${getHealthColor(health)}`}>
                    {Number(health).toFixed(0)}%
                  </span>
                </div>

                {/* TEMP */}
                <div className="flex items-center justify-between">
                  <Tooltip content={`Temperature: ${temp}°C`}>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Thermometer className="w-3 h-3" />
                      <span>Temp</span>
                    </div>
                  </Tooltip>
                  <span className="text-gray-300 font-mono">{temp}°C</span>
                </div>

                {/* ORBIT */}
                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <span className="text-gray-500">Orbit</span>
                  <span className="text-cyan-400 font-semibold">
                    {sat.orbitType || "N/A"}
                  </span>
                </div>

                {/* ALTITUDE */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Altitude</span>
                  <span className="text-gray-300">{altitude} km</span>
                </div>

                {/* DEBUG SAFE */}
                {/*
                <div className="text-[10px] text-gray-500">
                  Pos: {x}, {y} | Vel: {vx}, {vy}
                </div>
                */}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-gray-400">
              {satellites?.filter((s) => s.status === "operational").length ||
                0}{" "}
              Operational
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <span className="text-gray-400">
              {satellites?.filter((s) => s.status === "warning").length || 0}{" "}
              Warning
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
