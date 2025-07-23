import React from 'react';

interface SessionInfo {
  startTime: number | string;
  duration: number;
  messagesProcessed: number;
  errorsCount: number;
}

interface SessionInfoPanelProps {
  sessionInfo: SessionInfo;
  sessionId?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

const SessionInfoPanel: React.FC<SessionInfoPanelProps> = ({
  sessionInfo,
  sessionId,
  className = '',
  variant = 'dark'
}) => {
  const isDark = variant === 'dark';
  const bgClass = isDark ? 'bg-gray-800/80' : 'bg-white';
  const borderClass = isDark ? 'border-gray-700/50' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`${bgClass} backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border ${borderClass} hover:border-gray-600/50 transition-all duration-300 ${className}`}>
      <h2 className={`text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Session Information
      </h2>
      
      <div className="space-y-4">
        {sessionId && (
          <div className="flex items-center justify-between">
            <span className={`text-sm ${textSecondaryClass}`}>Session ID:</span>
            <span className={`font-mono text-sm ${textClass}`}>{sessionId}</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className={`text-sm ${textSecondaryClass}`}>Start Time</p>
            <p className={`font-medium ${textClass}`}>
              {new Date(typeof sessionInfo.startTime === 'string' ? sessionInfo.startTime : sessionInfo.startTime).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <p className={`text-sm ${textSecondaryClass}`}>Duration</p>
            <p className={`font-medium ${textClass}`}>
              {Math.round(sessionInfo.duration / 1000)}s
            </p>
          </div>
          <div>
            <p className={`text-sm ${textSecondaryClass}`}>Messages</p>
            <p className={`font-medium ${textClass}`}>
              {sessionInfo.messagesProcessed}
            </p>
          </div>
          <div>
            <p className={`text-sm ${textSecondaryClass}`}>Errors</p>
            <p className={`font-medium ${textClass}`}>
              {sessionInfo.errorsCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionInfoPanel; 