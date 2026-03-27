export default function RadarSweep({ size = 200 }) {
  return (
    <svg width={size} height={size} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
      <defs>
        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0, 200, 255, 0)" />
          <stop offset="100%" stopColor="rgba(0, 200, 255, 0.6)" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 2}
        fill="none"
        stroke="rgba(0, 200, 255, 0.2)"
        strokeWidth="1"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={(size / 2 - 2) * 0.66}
        fill="none"
        stroke="rgba(0, 200, 255, 0.15)"
        strokeWidth="1"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={(size / 2 - 2) * 0.33}
        fill="none"
        stroke="rgba(0, 200, 255, 0.1)"
        strokeWidth="1"
      />
      <path
        d={`M ${size / 2} ${size / 2} L ${size / 2} 2 A ${size / 2 - 2} ${size / 2 - 2} 0 0 1 ${size - 2} ${size / 2} Z`}
        fill="url(#radarGradient)"
        style={{
          transformOrigin: 'center',
          animation: 'radar-sweep 4s linear infinite'
        }}
      />
    </svg>
  );
}
