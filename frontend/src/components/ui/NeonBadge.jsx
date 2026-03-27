export default function NeonBadge({ status, children, pulse = false }) {
  const statusClass = status ? `status-${status}` : '';
  const pulseClass = pulse ? 'animate-pulse' : '';

  return (
    <span className={`status-badge ${statusClass} ${pulseClass}`}>
      {status && <span className="w-2 h-2 rounded-full bg-current"></span>}
      {children}
    </span>
  );
}
