import { useState, useEffect, useRef } from "react";
import { Clock, Rocket } from "lucide-react";
import GlassCard from "./ui/GlassCard";
import LoadingSkeleton from "./ui/LoadingSkeleton";

export default function ManeuverTimeline({ maneuvers, isLoading, isEmpty }) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold neon-text mb-4">Maneuver Timeline</h2>
        <div className="space-y-3">
          <LoadingSkeleton height="h-20" />
          <LoadingSkeleton height="h-20" />
        </div>
      </GlassCard>
    );
  }

  if (isEmpty || !maneuvers || maneuvers.length === 0) {
    return (
      <GlassCard className="p-6 flex flex-col items-center justify-center h-64">
        <Rocket className="w-12 h-12 text-gray-500 mb-3 opacity-50" />
        <h3 className="text-lg font-semibold text-gray-400 mb-1">
          No Maneuvers Scheduled
        </h3>
        <p className="text-gray-500 text-xs">
          All satellites are in stable orbits
        </p>
      </GlassCard>
    );
  }

  const hasTimelineData = maneuvers.some((m) => m.startTime && m.endTime);

  if (!hasTimelineData) {
    return (
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold neon-text mb-5 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-cyan-400" />
          Maneuver Activity (Live)
        </h2>

        <div className="space-y-3">
          {maneuvers.map((m, idx) => {
            const isActive = m.status === "active";

            return (
              <div
                key={idx}
                className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300
                ${
                  isActive
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-cyan-500/30 bg-black/30 hover:bg-black/50"
                }`}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 rounded-l-xl 
                  ${isActive ? "bg-red-500" : "bg-cyan-500"}`}
                />

                <div className="flex flex-col gap-1 pl-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-cyan-400 font-semibold">
                      {m.satellite_id}
                    </span>

                    <span className="text-gray-400">→</span>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${
                        isActive
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400">
                    ΔV: x:{m.delta_v?.x ?? 0}, y:{m.delta_v?.y ?? 0}, z:
                    {m.delta_v?.z ?? 0}
                  </div>
                </div>

                <div
                  className={`text-xs font-semibold px-2 py-1 rounded-md
                  ${
                    isActive
                      ? "text-red-400 bg-red-500/10"
                      : "text-cyan-400 bg-cyan-500/10"
                  }`}
                >
                  {isActive ? "LIVE" : "DONE"}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    );
  }

  const firstManeuver = new Date(maneuvers[0].startTime).getTime();
  const lastManeuver = new Date(
    maneuvers[maneuvers.length - 1].endTime,
  ).getTime();
  const totalDuration = lastManeuver - firstManeuver;
  const pixelsPerMs = 0.0005;

  return (
    <GlassCard className="p-6" neonBorder>
      <h2 className="text-xl font-bold neon-text mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Maneuver Timeline
      </h2>

      <div
        ref={scrollRef}
        className="relative overflow-x-auto"
        style={{ height: "300px" }}
      >
        <div
          style={{
            minWidth: `${totalDuration * pixelsPerMs}px`,
            height: "100%",
            position: "relative",
          }}
        >
          {maneuvers.map((m, idx) => {
            const start = new Date(m.startTime).getTime();
            const end = new Date(m.endTime).getTime();
            const left = (start - firstManeuver) * pixelsPerMs;
            const width = (end - start) * pixelsPerMs;

            return (
              <div
                key={idx}
                className="absolute p-2 text-xs text-white bg-cyan-500/60 rounded"
                style={{
                  left: `${left}px`,
                  width: `${Math.max(width, 80)}px`,
                  top: `${20 + idx * 40}px`,
                }}
              >
                {m.satelliteId}
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
