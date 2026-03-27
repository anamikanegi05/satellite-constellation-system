export default function GlassCard({ children, className = '', neonBorder = false, onClick }) {
  const borderClass = neonBorder ? 'neon-border' : '';

  return (
    <div
      className={`glass-card ${borderClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
