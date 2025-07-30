import React, { useEffect, useState } from 'react';
import type { ConsoleLog } from '../../types';
import { consoleLogger } from '../../utils/ConsoleLogger';
import { Icons } from '../ui/Icons';
import Card from '../ui/Card';

interface ConsoleLogsProps {
  showConsole?: boolean;
  onToggleConsole?: (show: boolean) => void;
  className?: string;
}

const ConsoleLogs: React.FC<ConsoleLogsProps> = ({
  showConsole = true,
  onToggleConsole,
  className = '',
}) => {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);

  useEffect(() => {
    // Subscribe to console log updates
    const unsubscribe = consoleLogger.subscribe(setLogs);
    
    // Override console on mount
    consoleLogger.overrideConsole();
    
    return () => {
      unsubscribe();
      consoleLogger.restoreConsole();
    };
  }, []);

  const getLogTypeColor = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'log':
        return 'border-blue-400 bg-blue-400';
      case 'info':
        return 'border-cyan-400 bg-cyan-400';
      case 'warn':
        return 'border-yellow-400 bg-yellow-400';
      case 'error':
        return 'border-red-400 bg-red-400';
      case 'debug':
        return 'border-purple-400 bg-purple-400';
      default:
        return 'border-gray-400 bg-gray-400';
    }
  };

  const getLogTypeLabel = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'log':
        return 'LOG';
      case 'info':
        return 'INFO';
      case 'warn':
        return 'WARN';
      case 'error':
        return 'ERROR';
      case 'debug':
        return 'DEBUG';
      default:
        return 'LOG';
    }
  };

  const handleClearLogs = () => {
    consoleLogger.clearLogs();
  };

  const handleToggleConsole = () => {
    onToggleConsole?.(!showConsole);
  };

  return (
    <Card
      title="Console Logs"
      icon={<Icons.Terminal />}
      variant="compact"
      className={`flex-1 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleConsole}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            title={showConsole ? 'Hide console' : 'Show console'}
          >
            {showConsole ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={handleClearLogs}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            title="Clear console logs"
          >
            <Icons.Trash2 className="w-3 h-3" />
          </button>
        </div>
        <span className="text-xs text-gray-500">
          {logs.length} logs
        </span>
      </div>
      
      {showConsole && (
        <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {logs.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-4">
              No console logs yet...
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={`text-xs p-2 rounded bg-gray-700/30 border-l-2 ${getLogTypeColor(log.type).split(' ')[0]}`}>
                <div className="flex items-center gap-1 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${getLogTypeColor(log.type).split(' ')[1]}`}></span>
                  <span className="text-gray-300 font-medium">{getLogTypeLabel(log.type)}</span>
                  <span className="text-gray-500 text-xs">{log.timestamp.toLocaleTimeString()}</span>
                </div>
                <div className="text-gray-400 break-words">{log.message}</div>
                {log.data && log.data.length > 1 && (
                  <details className="mt-1">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
                      Show data ({log.data.length} items)
                    </summary>
                    <pre className="text-xs text-gray-500 mt-1 p-1 bg-gray-700 rounded-sm overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 max-h-20">
                      {JSON.stringify(log.data, null, 2)}
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

export default ConsoleLogs; 