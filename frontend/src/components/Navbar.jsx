import { Satellite, Radio, AlertCircle } from 'lucide-react';
import NeonBadge from './ui/NeonBadge';

export default function Navbar({ systemStatus, lastUpdate }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'operational':
        return {
          status: 'operational',
          icon: Radio,
          message: 'All Systems Nominal',
          pulse: false
        };
      case 'warning':
        return {
          status: 'warning',
          icon: AlertCircle,
          message: 'Minor Issues Detected',
          pulse: true
        };
      case 'critical':
        return {
          status: 'critical',
          icon: AlertCircle,
          message: 'Critical System Errors',
          pulse: true
        };
      default:
        return {
          status: 'idle',
          icon: Radio,
          message: 'System Initializing',
          pulse: false
        };
    }
  };

  const config = getStatusConfig(systemStatus?.status);
  const StatusIcon = config.icon;

  return (
    <nav className="glass-card border-b border-cyan-500/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Satellite className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold neon-text">Satellite Operations</h1>
              <p className="text-xs text-gray-400">Ground Control Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-400">System Status</div>
              <div className="text-sm font-semibold text-gray-300">{config.message}</div>
            </div>
            <NeonBadge status={config.status} pulse={config.pulse}>
              <StatusIcon className="w-3 h-3" />
              {systemStatus?.status || 'Loading'}
            </NeonBadge>
          </div>

          {lastUpdate && (
            <div className="text-xs text-gray-500">
              <div>Last Update</div>
              <div className="font-mono text-gray-400">
                {new Date(lastUpdate).toLocaleTimeString()}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 8px rgba(0, 255, 100, 0.6)' }}></div>
            <span className="text-xs text-gray-400">Live</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
