import React, { useEffect, useState } from 'react';

interface Props {
  isActive: boolean;
  listeningState: 'idle' | 'listening' | 'processing' | 'thinking' | 'speaking' | 'error';
  className?: string;
}

export const VoiceActivityIndicator: React.FC<Props> = ({ 
  isActive, 
  listeningState, 
  className = '' 
}) => {
  const [pulseIntensity, setPulseIntensity] = useState(0);

  // Simulate voice activity pulse
  useEffect(() => {
    if (isActive && listeningState === 'listening') {
      const interval = setInterval(() => {
        setPulseIntensity(Math.random() * 0.5 + 0.5);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setPulseIntensity(0);
    }
  }, [isActive, listeningState]);

  const getStateColor = () => {
    switch (listeningState) {
      case 'listening':
        return isActive ? 'text-green-400' : 'text-gray-400';
      case 'processing':
        return 'text-yellow-400';
      case 'thinking':
        return 'text-blue-400';
      case 'speaking':
        return 'text-purple-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStateBg = () => {
    switch (listeningState) {
      case 'listening':
        return isActive ? 'bg-green-500/20' : 'bg-gray-500/20';
      case 'processing':
        return 'bg-yellow-500/20';
      case 'thinking':
        return 'bg-blue-500/20';
      case 'speaking':
        return 'bg-purple-500/20';
      case 'error':
        return 'bg-red-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  const getStateIcon = () => {
    switch (listeningState) {
      case 'listening':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'thinking':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'speaking':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        );
    }
  };

  const getStateText = () => {
    switch (listeningState) {
      case 'listening':
        return isActive ? 'Listening...' : 'Ready to listen';
      case 'processing':
        return 'Processing...';
      case 'thinking':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 bg-gray-800/60 rounded-xl border border-gray-700/50 ${className}`}>
      {/* Voice activity indicator */}
      <div className="relative">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${getStateBg()}`}>
          <div className={`${getStateColor()} transition-all duration-300`}>
            {getStateIcon()}
          </div>
        </div>
        
        {/* Pulse ring for active listening */}
        {isActive && listeningState === 'listening' && (
          <div 
            className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping"
            style={{ 
              opacity: pulseIntensity,
              animationDuration: '1s'
            }}
          />
        )}
      </div>

      {/* State information */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-semibold ${getStateColor()}`}>
            {getStateText()}
          </span>
          {listeningState === 'listening' && isActive && (
            <div className="flex gap-1">
              {Array.from({ length: 3 }, (_, i) => (
                <span
                  key={i}
                  className="w-1 h-1 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Status description */}
        <p className="text-xs text-gray-500">
          {listeningState === 'listening' && isActive && 'Voice detected - transcribing in real-time'}
          {listeningState === 'listening' && !isActive && 'Waiting for voice input...'}
          {listeningState === 'processing' && 'Converting speech to text...'}
          {listeningState === 'thinking' && 'AI is processing your request...'}
          {listeningState === 'speaking' && 'AI is responding...'}
          {listeningState === 'error' && 'An error occurred'}
          {listeningState === 'idle' && 'Ready to start conversation'}
        </p>
      </div>

      {/* Activity level indicator */}
      {listeningState === 'listening' && (
        <div className="flex flex-col items-center gap-1">
          <div className="w-2 h-8 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`w-full transition-all duration-200 ${
                isActive ? 'bg-green-400' : 'bg-gray-600'
              }`}
              style={{ 
                height: isActive ? `${pulseIntensity * 100}%` : '20%'
              }}
            />
          </div>
          <span className="text-xs text-gray-500">Level</span>
        </div>
      )}
    </div>
  );
}; 