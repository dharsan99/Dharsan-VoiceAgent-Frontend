import React, { useState } from 'react';
import { useBackendLogs } from '../../hooks/useBackendLogs';
import type { BackendLog } from '../../hooks/useBackendLogs';
import { Icons } from '../ui/Icons';
import Card from '../ui/Card';

interface BackendLogsProps {
  sessionId?: string;
  showBackendLogs?: boolean;
  onToggleBackendLogs?: (show: boolean) => void;
  className?: string;
}

const BackendLogs: React.FC<BackendLogsProps> = ({
  sessionId,
  showBackendLogs = true,
  onToggleBackendLogs,
  className = '',
}) => {
  const [selectedService, setSelectedService] = useState<string>('all');
  const [logLevel, setLogLevel] = useState<string>('all');

  const { logs, loading, error, lastFetch, fetchLogs, clearLogs, refreshLogs } = useBackendLogs({
    sessionId,
    limit: 200,
    service: selectedService === 'all' ? undefined : selectedService,
    autoRefresh: true,
    refreshInterval: 3000,
  });

  const getLogLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'border-red-400 bg-red-400';
      case 'warn':
        return 'border-yellow-400 bg-yellow-400';
      case 'info':
        return 'border-blue-400 bg-blue-400';
      case 'debug':
        return 'border-purple-400 bg-purple-400';
      default:
        return 'border-gray-400 bg-gray-400';
    }
  };

  const getLogLevelLabel = (level: string) => {
    return level.toUpperCase();
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'orchestrator':
        return 'text-cyan-300';
      case 'stt-service':
        return 'text-green-300';
      case 'tts-service':
        return 'text-blue-300';
      case 'media-server':
        return 'text-purple-300';
      default:
        return 'text-gray-300';
    }
  };

  // Filter logs by level
  const filteredLogs = logs.filter(log => {
    if (logLevel === 'all') return true;
    return log.level.toLowerCase() === logLevel.toLowerCase();
  });

  const handleToggleBackendLogs = () => {
    onToggleBackendLogs?.(!showBackendLogs);
  };

  const handleServiceChange = (service: string) => {
    setSelectedService(service);
  };

  const handleLevelChange = (level: string) => {
    setLogLevel(level);
  };

  return (
    <Card
      title="Backend Logs"
      icon={<Icons.Terminal />}
      variant="compact"
      className={`flex-1 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleBackendLogs}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            title={showBackendLogs ? 'Hide backend logs' : 'Show backend logs'}
          >
            {showBackendLogs ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={refreshLogs}
            disabled={loading}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
            title="Refresh backend logs"
          >
            <Icons.RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={clearLogs}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            title="Clear backend logs"
          >
            <Icons.Trash2 className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {lastFetch && (
            <span>Last: {lastFetch.toLocaleTimeString()}</span>
          )}
          <span>{filteredLogs.length} logs</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-2 text-xs">
        <select
          value={selectedService}
          onChange={(e) => handleServiceChange(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300"
        >
          <option value="all">All Services</option>
          <option value="orchestrator">Orchestrator</option>
          <option value="stt-service">STT Service</option>
          <option value="tts-service">TTS Service</option>
          <option value="media-server">Media Server</option>
        </select>
        <select
          value={logLevel}
          onChange={(e) => handleLevelChange(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300"
        >
          <option value="all">All Levels</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
      </div>
      
      {showBackendLogs && (
        <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {error ? (
            <div className="text-xs text-red-400 p-2 bg-red-900/20 rounded border border-red-500/30">
              Error: {error}
            </div>
          ) : loading && logs.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-4">
              Loading backend logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-4">
              No backend logs available...
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className={`text-xs p-2 rounded bg-gray-700/30 border-l-2 ${getLogLevelColor(log.level).split(' ')[0]}`}>
                <div className="flex items-center gap-1 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${getLogLevelColor(log.level).split(' ')[1]}`}></span>
                  <span className="text-gray-300 font-medium">{getLogLevelLabel(log.level)}</span>
                  <span className={`font-medium ${getServiceColor(log.service)}`}>[{log.service}]</span>
                  <span className="text-gray-500 text-xs">{log.timestamp}</span>
                </div>
                <div className="text-gray-400 break-words">{log.message}</div>
                {log.session_id && (
                  <div className="text-xs text-gray-500 mt-1">
                    Session: {log.session_id}
                  </div>
                )}
                {/* Show additional log data if available */}
                {Object.keys(log).some(key => !['timestamp', 'level', 'message', 'service', 'session_id'].includes(key)) && (
                  <details className="mt-1">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
                      Show details
                    </summary>
                    <pre className="text-xs text-gray-500 mt-1 p-1 bg-gray-700 rounded-sm overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 max-h-20">
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(log).filter(([key]) => 
                            !['timestamp', 'level', 'message', 'service', 'session_id'].includes(key)
                          )
                        ), 
                        null, 
                        2
                      )}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
};

export default BackendLogs; 