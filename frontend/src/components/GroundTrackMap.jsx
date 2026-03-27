import { useState, useEffect, useRef, useMemo } from "react";
import { Satellite } from "lucide-react";
import GlassCard from "./ui/GlassCard";

export default function GroundTrackMap({
  satellites,
  debris,
  selectedSatellite,
  onSelectSatellite,
  isEmpty,
}) {
  const [trails, setTrails] = useState({});

  const prevPositions = useRef({});
  const prevDebris = useRef({});

  const lerp = (a, b, t) => a + (b - a) * t;

  // 🎨 DARK COLOR PALETTE
  const getSatelliteColor = (id) => {
    const colors = [
      "#14532d",
      "#1e3a8a",
      "#134e4a",
      "#164e63",
      "#365314",
      "#166534",
      "#1d4ed8",
      "#0f766e",
    ];

    const index =
      id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;

    return colors[index];
  };

  // 🎮 SMOOTH ANIMATION
  useEffect(() => {
    let frame;
    let lastTime = performance.now();

    const animate = (time) => {
      const dt = time - lastTime;
      lastTime = time;
      const speed = 0.005;

      satellites.forEach((sat) => {
        const prev = prevPositions.current[sat.id] || { ...sat.position };

        prev.x = lerp(prev.x, sat.position.x, speed * dt);
        prev.y = lerp(prev.y, sat.position.y, speed * dt);

        prevPositions.current[sat.id] = prev;
      });

      debris.forEach((d) => {
        const prev = prevDebris.current[d.id] || { ...d.position };

        prev.x = lerp(prev.x, d.position.x, speed * dt);
        prev.y = lerp(prev.y, d.position.y, speed * dt);

        prevDebris.current[d.id] = prev;
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [satellites, debris]);

  // 🔥 DYNAMIC BOUNDS
  const bounds = useMemo(() => {
    const allPoints = [
      ...satellites.map((s) => s.position),
      ...debris.map((d) => d.position),
    ];

    if (allPoints.length === 0) {
      return { minX: -100, maxX: 100, minY: -100, maxY: 100 };
    }

    const xs = allPoints.map((p) => p.x);
    const ys = allPoints.map((p) => p.y);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }, [satellites, debris]);

  const scaleX = (x) =>
    bounds.maxX === bounds.minX
      ? 50
      : ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * 100;

  const scaleY = (y) =>
    bounds.maxY === bounds.minY
      ? 50
      : ((y - bounds.minY) / (bounds.maxY - bounds.minY)) * 100;

  // 🔥 TRAILS
  useEffect(() => {
    if (!satellites?.length) return;

    const now = Date.now();

    setTrails((prev) => {
      const updated = { ...prev };

      satellites.forEach((sat) => {
        const smooth = prevPositions.current[sat.id] || sat.position;

        if (!updated[sat.id]) updated[sat.id] = [];

        const last = updated[sat.id][updated[sat.id].length - 1];

        const dx = smooth.x - (last?.x || smooth.x);
        const dy = smooth.y - (last?.y || smooth.y);

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
          updated[sat.id].push({
            x: smooth.x,
            y: smooth.y,
            t: now,
          });
        }

        updated[sat.id] = updated[sat.id].filter((p) => now - p.t < 2000);
      });

      return updated;
    });
  }, [satellites]);

  // 🎯 AUTO-FOCUS
  useEffect(() => {
    const risky = satellites.find((s) => s.fuel < 20);
    if (risky) onSelectSatellite(risky);
  }, [satellites]);

  if (isEmpty) {
    return (
      <GlassCard className="p-8 flex flex-col items-center justify-center h-[500px]">
        <Satellite className="w-20 h-20 text-gray-500 mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">
          No Satellites Detected
        </h3>
        <p className="text-gray-500 text-sm">Waiting for satellite data...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8" neonBorder>
      <h2 className="text-2xl font-bold mb-6">Ground Track Map</h2>

      <div className="relative w-full h-[600px] bg-black rounded-xl overflow-hidden">
        {/* 🌌 GRID */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full grid grid-cols-12 grid-rows-8">
            {Array.from({ length: 96 }).map((_, i) => (
              <div key={i} className="border border-white/5"></div>
            ))}
          </div>
        </div>

        {/* 🎯 CENTER CROSS */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-white/10" />
          <div className="h-full w-px bg-white/10 absolute" />
        </div>

        <svg className="w-full h-full relative z-10" viewBox="0 0 100 100">
          {/* 🛰️ SATELLITES */}
          {satellites.map((sat) => {
            const smooth = prevPositions.current[sat.id] || sat.position;

            const x = scaleX(smooth.x);
            const y = scaleY(smooth.y);

            const isSelected = selectedSatellite?.id === sat.id;

            let color = getSatelliteColor(sat.id);
            if (sat.fuel < 20) color = "#ef4444";
            else if (sat.fuel < 50) color = "#f97316";

            return (
              <g key={sat.id}>
                {/* TRAILS */}
                {trails[sat.id]?.map((p, i) => (
                  <circle
                    key={i}
                    cx={scaleX(p.x)}
                    cy={scaleY(p.y)}
                    r="0.6"
                    fill={color}
                    opacity={Math.max(0.05, 1 - (Date.now() - p.t) / 2000)}
                  />
                ))}

                {/* GLOW */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 2.5 : 2}
                  fill={color}
                  opacity="0.15"
                />

                {/* MAIN */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 1.4 : 1}
                  fill={color}
                  style={{
                    cursor: "pointer",
                    filter: `drop-shadow(0 0 6px ${color})`,
                  }}
                  onClick={() => onSelectSatellite(sat)}
                />
              </g>
            );
          })}

          {/* ☄️ DEBRIS */}
          {debris.slice(0, 30).map((d) => {
            const smooth = prevDebris.current[d.id] || d.position;

            return (
              <rect
                key={d.id}
                x={scaleX(smooth.x) - 0.5}
                y={scaleY(smooth.y) - 0.5}
                width="1"
                height="1"
                fill="#9ca3af"
                opacity="0.7"
              />
            );
          })}
        </svg>
      </div>
    </GlassCard>
  );
}
