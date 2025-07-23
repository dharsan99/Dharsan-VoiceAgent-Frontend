import React from 'react';

interface ControlPanelProps {
  connectionStatus: string;
  isRecording?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onClearTranscript?: () => void;
  onTestMicrophone?: () => void;
  onTestWebSocket?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'light' | 'dark';
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  connectionStatus,
  isRecording = false,
  onConnect,
  onDisconnect,
  onStartRecording,
  onStopRecording,
  onClearTranscript,
  onTestMicrophone,
  onTestWebSocket,
  disabled = false,
  className = ''
}) => {
  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  return (
    <div className={`bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 ${className}`}>
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Controls
      </h2>
      
      <div className="space-y-3">
        {/* Main Connection Control */}
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={disabled || isConnecting}
          className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-lg flex items-center justify-center gap-2
            ${isConnected 
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'
            }
            ${(disabled || isConnecting)
              ? 'bg-gray-600 cursor-not-allowed opacity-50' 
              : 'transform hover:scale-105 active:scale-95 hover:shadow-2xl'
            }`}
        >
          {isConnecting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 018-8Z"/>
              </svg>
              Connecting...
            </>
          ) : isConnected ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z"/>
              </svg>
              Disconnect
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Connect
            </>
          )}
        </button>

        {/* Recording Controls (if available) */}
        {onStartRecording && onStopRecording && (
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={disabled || !isConnected}
            className={`w-full px-4 py-3 text-base font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg flex items-center justify-center gap-2
              ${isRecording
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }
              ${(disabled || !isConnected)
                ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                : 'transform hover:scale-105 active:scale-95 hover:shadow-2xl'
              }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            </svg>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        )}

        {/* Clear Transcript Button */}
        {onClearTranscript && (
          <button
            onClick={onClearTranscript}
            disabled={disabled}
            className="w-full px-4 py-2 text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Transcript
          </button>
        )}

        {/* Debug Buttons */}
        <div className="space-y-2 pt-2 border-t border-gray-600/50">
          {onTestMicrophone && (
            <button
              onClick={onTestMicrophone}
              disabled={disabled}
              className="w-full px-4 py-2 text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Microphone
            </button>
          )}
          
          {onTestWebSocket && (
            <button
              onClick={onTestWebSocket}
              disabled={disabled}
              className="w-full px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test WebSocket
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 