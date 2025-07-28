import React from 'react';
import { useVoiceAgentStore } from '../stores/voiceAgentStore';

// Icons component
interface IconProps {
  className?: string;
}

const Icons = {
  Play: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
  ),
  Stop: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 6h12v12H6z"/>
    </svg>
  ),
  Loading: ({ className = "w-5 h-5 animate-spin" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"/>
    </svg>
  ),
  Microphone: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
    </svg>
  ),
  Speaker: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  ),
  Connect: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  Disconnect: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
    </svg>
  ),
  Error: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  )
};

interface AudioControlsProps {
  onConnect: () => void;
  onDisconnect: () => void;
  onStartStreaming: () => void;
  onStopStreaming: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  onConnect,
  onDisconnect,
  onStartStreaming,
  onStopStreaming
}) => {
  const {
    connectionStatus,
    isStreaming,
    error,
    sessionId
  } = useVoiceAgentStore();

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          text: 'Connected',
          className: 'text-green-600 bg-green-100 border-green-300',
          icon: <Icons.Connect className="w-4 h-4" />
        };
      case 'connecting':
        return {
          text: 'Connecting...',
          className: 'text-yellow-600 bg-yellow-100 border-yellow-300',
          icon: <Icons.Loading className="w-4 h-4" />
        };
      case 'error':
        return {
          text: 'Error',
          className: 'text-red-600 bg-red-100 border-red-300',
          icon: <Icons.Error className="w-4 h-4" />
        };
      default:
        return {
          text: 'Disconnected',
          className: 'text-gray-600 bg-gray-100 border-gray-300',
          icon: <Icons.Disconnect className="w-4 h-4" />
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Audio Controls</h2>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${statusInfo.className}`}>
          {statusInfo.icon}
          <span className="text-sm font-medium">{statusInfo.text}</span>
        </div>
      </div>

      {sessionId && (
        <div className="text-sm text-gray-600">
          Session ID: <span className="font-mono">{sessionId}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <Icons.Error className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-3">
        {/* Connection Controls */}
        <div className="flex space-x-3">
          <button
            onClick={onConnect}
            disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              connectionStatus === 'connecting' || connectionStatus === 'connected'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Icons.Connect className="w-4 h-4" />
            <span>Connect</span>
          </button>

          <button
            onClick={onDisconnect}
            disabled={connectionStatus === 'disconnected'}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              connectionStatus === 'disconnected'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Icons.Disconnect className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </div>

        {/* Streaming Controls */}
        <div className="flex space-x-3">
          <button
            onClick={onStartStreaming}
            disabled={connectionStatus !== 'connected' || isStreaming}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              connectionStatus !== 'connected' || isStreaming
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Icons.Play className="w-4 h-4" />
            <span>Start Streaming</span>
          </button>

          <button
            onClick={onStopStreaming}
            disabled={!isStreaming}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              !isStreaming
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <Icons.Stop className="w-4 h-4" />
            <span>Stop Streaming</span>
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Icons.Microphone className="w-4 h-4" />
            <span>Microphone</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icons.Speaker className="w-4 h-4" />
            <span>Speaker</span>
          </div>
        </div>
        
        <div className="text-xs">
          WebRTC WHIP Protocol
        </div>
      </div>
    </div>
  );
};

export default AudioControls; 