export default function LoadingSkeleton({ className = '', height = 'h-4' }) {
  return (
    <div className={`skeleton ${height} rounded ${className}`}></div>
  );
}
