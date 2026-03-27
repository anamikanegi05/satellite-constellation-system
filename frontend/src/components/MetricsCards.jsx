import {
  Satellite,
  Zap,
  AlertTriangle,
  Activity,
  Fuel,
  TrendingUp,
} from "lucide-react";
import GlassCard from "./ui/GlassCard";
import AnimatedNumber from "./ui/AnimatedNumber";
import LoadingSkeleton from "./ui/LoadingSkeleton";

export default function MetricsCards({
  metrics,
  satellites = [],
  debris = [],
  isLoading,
}) {
  console.log("METRICS:", metrics);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GlassCard key={i} className="p-4">
            <LoadingSkeleton height="h-6" className="mb-2" />
            <LoadingSkeleton height="h-8" />
          </GlassCard>
        ))}
      </div>
    );
  }

  const totalSatellites = metrics?.total_satellites ?? satellites.length ?? 0;

  const operational =
    metrics?.active_satellites ??
    satellites.filter((s) => ["active", "operational"].includes(s.status))
      .length ??
    0;

  const activeManeuvers = metrics?.active_maneuvers ?? 0;

  const debrisTracked = debris?.length || 0;

  const avgFuel =
    satellites.length > 0
      ? satellites.reduce((sum, s) => sum + (s.fuel || 0), 0) /
        satellites.length
      : 0;

  const systemHealth = Number(metrics?.system_health ?? 0);

  const cards = [
    {
      icon: Satellite,
      label: "Total Satellites",
      value: totalSatellites,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      suffix: "",
    },
    {
      icon: Zap,
      label: "Operational",
      value: operational,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      suffix: "",
    },
    {
      icon: Activity,
      label: "Active Maneuvers",
      value: activeManeuvers,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      suffix: "",
    },
    {
      icon: AlertTriangle,
      label: "Debris Tracked",
      value: debrisTracked,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      suffix: "",
    },
    {
      icon: Fuel,
      label: "Avg Fuel",
      value: avgFuel,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      suffix: "%",
      decimals: 1,
    },
    {
      icon: TrendingUp,
      label: "System Health",
      value: systemHealth,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      suffix: "%",
      decimals: 1,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        const width =
          card.suffix === "%"
            ? `${Math.min(Math.max(Number(card.value) || 0, 0), 100)}%`
            : "100%";

        return (
          <GlassCard
            key={index}
            className={`p-4 border ${card.borderColor} hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>

            <div className="space-y-1">
              <div className={`text-3xl font-bold ${card.color}`}>
                <AnimatedNumber
                  value={Number(card.value) || 0}
                  duration={1500}
                  decimals={card.decimals || 0}
                  suffix={card.suffix}
                />
              </div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {card.label}
              </div>
            </div>

            <div
              className={`mt-3 h-1 rounded-full ${card.bgColor} overflow-hidden`}
            >
              <div
                className={`h-full bg-gradient-to-r ${card.color.replace(
                  "text-",
                  "from-",
                )} to-transparent`}
                style={{
                  width,
                  animation: "progress-glow 2s infinite",
                }}
              />
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
