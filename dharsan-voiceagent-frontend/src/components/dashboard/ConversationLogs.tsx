import React from 'react';
import { Icons } from '../ui/Icons';
import { useBackendLogs } from '../../hooks/useBackendLogs';

interface ConversationLogsProps {
  isProduction?: boolean;
  pipelineStatus: string;
}

const ConversationLogs: React.FC<ConversationLogsProps> = ({ 
  isProduction = false,
  pipelineStatus 
}) => {
  const {
    formattedLogs,
    isLoading,
    error,
    lastUpdate,
    clearLogs,
    logCount
  } = useBackendLogs();

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icons.Mic className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Voice Conversation</h3>
          {isLoading && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-cyan-400">Live</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={clearLogs}
            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-3 p-2 bg-red-900/30 border border-red-500/50 rounded text-xs text-red-300">
          Error fetching logs: {error}
        </div>
      )}
      
      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin bg-gray-900/30 rounded-lg p-2">
        {formattedLogs.map((log, index) => (
          <div key={index} className="text-xs text-gray-300 font-mono break-words">
            {log}
          </div>
        ))}
        {formattedLogs.length === 0 && !isLoading && (
          <div className="text-xs text-gray-500 italic">No backend activity</div>
        )}
        {isLoading && formattedLogs.length === 0 && (
          <div className="text-xs text-gray-500 italic">Loading backend logs...</div>
        )}
      </div>
      
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
        <span>{logCount} backend events</span>
        <span>Pipeline: {pipelineStatus}</span>
      </div>
    </div>
  );
};

export default ConversationLogs; 