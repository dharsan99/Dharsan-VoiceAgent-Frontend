import React from 'react';

interface NetworkStats {
  latency?: number;
  jitter?: number;
  packetLoss?: number;
  connectionQuality?: string;
  averageLatency?: number;
}

interface NetworkStatsPanelProps {
  networkStats: NetworkStats;
  className?: string;
  variant?: 'light' | 'dark';
}

const NetworkStatsPanel: React.FC<NetworkStatsPanelProps> = ({
  networkStats,
  className = '',
  variant = 'dark'
}) => {
  const isDark = variant === 'dark';
  const bgClass = isDark ? 'bg-gray-800/80' : 'bg-white';
  const borderClass = isDark ? 'border-gray-700/50' : 'border-gray-200';
  const textSecondaryClass = isDark ? 'text-gray-400' : 'text-gray-600';

  const getQualityColor = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case 'excellent':
        return isDark ? 'text-green-400' : 'text-green-600';
      case 'good':
        return isDark ? 'text-blue-400' : 'text-blue-600';
      case 'fair':
        return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'poor':
        return isDark ? 'text-red-400' : 'text-red-600';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getMetricColor = (value: number, thresholds: { good: number; fair: number }) => {
    if (value <= thresholds.good) {
      return isDark ? 'text-green-400' : 'text-green-600';
    } else if (value <= thresholds.fair) {
      return isDark ? 'text-yellow-400' : 'text-yellow-600';
    } else {
      return isDark ? 'text-red-400' : 'text-red-600';
    }
  };

  const latency = networkStats.latency || networkStats.averageLatency || 0;
  const jitter = networkStats.jitter || 0;
  const packetLoss = networkStats.packetLoss || 0;
  const connectionQuality = networkStats.connectionQuality || 'unknown';

  return (
    <div className={`${bgClass} backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border ${borderClass} hover:border-gray-600/50 transition-all duration-300 ${className}`}>
      <h2 className={`text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
        Network Quality
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getMetricColor(latency, { good: 100, fair: 200 })}`}>
            {latency}ms
          </div>
          <div className={`text-sm ${textSecondaryClass}`}>Latency</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${getMetricColor(jitter, { good: 20, fair: 50 })}`}>
            {jitter}ms
          </div>
          <div className={`text-sm ${textSecondaryClass}`}>Jitter</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${getMetricColor(packetLoss, { good: 2, fair: 5 })}`}>
            {packetLoss}%
          </div>
          <div className={`text-sm ${textSecondaryClass}`}>Packet Loss</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${getQualityColor(connectionQuality)}`}>
            {connectionQuality.toUpperCase()}
          </div>
          <div className={`text-sm ${textSecondaryClass}`}>Quality</div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatsPanel; 