import React from 'react';
import type { UnifiedControlPanelProps, PhaseType } from '../../types/unifiedV2';

// Icons component
interface IconProps {
  className?: string;
}

const Icons = {
  Controls: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
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
  WebRTC: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  WHIP: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  WebSocket: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Emergency: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
};

const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({
  currentPhase,
  webRTC,
  whip,
  websocket,
  audio,
  onConnectWebRTC,
  onDisconnectWebRTC,
  onConnectWHIP,
  onDisconnectWHIP,
  onConnectWebSocket,
  onDisconnectWebSocket,
  onStartAudioStreaming,
  onStopAudioStreaming,
  onStartListening,
  onStopListening
}) => {
  const getPhaseColor = (phase: PhaseType) => {
    switch (phase) {
      case 'phase1':
        return 'from-blue-600 to-blue-700';
      case 'phase2':
        return 'from-green-600 to-green-700';
      case 'phase5':
        return 'from-purple-600 to-purple-700';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getPhaseBorderColor = (phase: PhaseType) => {
    switch (phase) {
      case 'phase1':
        return 'border-blue-500';
      case 'phase2':
        return 'border-green-500';
      case 'phase5':
        return 'border-purple-500';
      default:
        return 'border-gray-500';
    }
  };

  const isAnyConnectionActive = () => {
    return webRTC.status === 'connected' || 
           whip.status === 'connected' || 
           websocket.status === 'connected';
  };

  const getConnectionStatus = () => {
    if (webRTC.status === 'connected') return 'WebRTC Connected';
    if (whip.status === 'connected') return 'WHIP Connected';
    if (websocket.status === 'connected') return 'WebSocket Connected';
    return 'Disconnected';
  };

  const getConnectionStatusColor = () => {
    if (isAnyConnectionActive()) return 'text-green-400';
    if (webRTC.status === 'connecting' || whip.status === 'connecting' || websocket.status === 'connecting') {
      return 'text-yellow-400';
    }
    return 'text-red-400';
  };

  const handleEmergencyStop = () => {
    console.log('🚨 Emergency stop triggered!', {
      currentConnections: {
        webRTC: webRTC.status,
        whip: whip.status,
        websocket: websocket.status
      },
      audioState: {
        isStreaming: audio.isStreaming,
        isListening: audio.isListening
      }
    });
    
    // Stop all connections and audio
    onDisconnectWebRTC();
    onDisconnectWHIP();
    onDisconnectWebSocket();
    onStopAudioStreaming();
    onStopListening();
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <Icons.Controls />
        Unified Controls
      </h3>
      
      {/* Phase Indicator */}
      <div className={`mb-4 p-3 rounded-lg bg-gradient-to-r ${getPhaseColor(currentPhase)} border ${getPhaseBorderColor(currentPhase)}`}>
        <div className="text-white font-medium">Current Phase: {currentPhase.toUpperCase()}</div>
        <div className="text-white/80 text-sm">{getConnectionStatus()}</div>
      </div>

      {/* Global Connection Controls */}
      <div className="space-y-3 mb-6">
        <h4 className="text-lg font-semibold text-gray-300 mb-3">Connection Controls</h4>
        
        {/* WebRTC Controls (Phase 1) */}
        {currentPhase === 'phase1' && (
          <button
            onClick={webRTC.status === 'connected' ? onDisconnectWebRTC : onConnectWebRTC}
            disabled={webRTC.status === 'connecting'}
            className={`w-full px-4 py-3 text-base font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg flex items-center justify-center gap-2
              ${webRTC.status === 'connected' 
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }
              ${webRTC.status === 'connecting' 
                ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                : 'transform hover:scale-105 active:scale-95 hover:shadow-2xl'
              }`}
          >
            {webRTC.status === 'connecting' 
              ? <><Icons.Loading /> Connecting WebRTC...</>
              : webRTC.status === 'connected' 
                ? <><Icons.Stop /> Disconnect WebRTC</>
                : <><Icons.Play /> Connect WebRTC</>
            }
          </button>
        )}

        {/* WHIP Controls (Phase 2 & 5) */}
        {(currentPhase === 'phase2' || currentPhase === 'phase5') && (
          <button
            onClick={whip.status === 'connected' ? onDisconnectWHIP : onConnectWHIP}
            disabled={whip.status === 'connecting'}
            className={`w-full px-4 py-3 text-base font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-500/50 shadow-lg flex items-center justify-center gap-2
              ${whip.status === 'connected' 
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
              }
              ${whip.status === 'connecting' 
                ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                : 'transform hover:scale-105 active:scale-95 hover:shadow-2xl'
              }`}
          >
            {whip.status === 'connecting' 
              ? <><Icons.Loading /> Connecting WHIP...</>
              : whip.status === 'connected' 
                ? <><Icons.Stop /> Disconnect WHIP</>
                : <><Icons.Play /> Connect WHIP</>
            }
          </button>
        )}

        {/* WebSocket Controls (All Phases) */}
        <button
          onClick={websocket.status === 'connected' ? onDisconnectWebSocket : onConnectWebSocket}
          disabled={websocket.status === 'connecting'}
          className={`w-full px-4 py-3 text-base font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-lg flex items-center justify-center gap-2
            ${websocket.status === 'connected' 
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
              : 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800'
            }
            ${websocket.status === 'connecting' 
              ? 'bg-gray-600 cursor-not-allowed opacity-50' 
              : 'transform hover:scale-105 active:scale-95 hover:shadow-2xl'
            }`}
        >
          {websocket.status === 'connecting' 
            ? <><Icons.Loading /> Connecting WebSocket...</>
            : websocket.status === 'connected' 
              ? <><Icons.Stop /> Disconnect WebSocket</>
              : <><Icons.Play /> Connect WebSocket</>
          }
        </button>
      </div>

      {/* Audio Controls */}
      {isAnyConnectionActive() && (
        <div className="space-y-3 mb-6">
          <h4 className="text-lg font-semibold text-gray-300 mb-3">Audio Controls</h4>
          
          <button
            onClick={() => {
              console.log('🎤 Audio streaming button clicked', {
                currentState: audio.isStreaming,
                connections: {
                  webRTC: webRTC.status,
                  whip: whip.status,
                  websocket: websocket.status
                }
              });
              
              if (audio.isStreaming) {
                onStopAudioStreaming();
              } else {
                onStartAudioStreaming();
              }
            }}
            className={`w-full px-4 py-3 text-base font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-500/50 shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 hover:shadow-2xl ${
              audio.isStreaming
                ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
            }`}
          >
            {audio.isStreaming ? (
              <><Icons.Speaker /> Stop Audio Streaming</>
            ) : (
              <><Icons.Speaker /> Start Audio Streaming</>
            )}
          </button>

          <button
            onClick={() => {
              console.log('🎤 Listening button clicked', {
                currentState: audio.isListening,
                connections: {
                  webRTC: webRTC.status,
                  whip: whip.status,
                  websocket: websocket.status
                }
              });
              
              if (audio.isListening) {
                onStopListening();
              } else {
                onStartListening();
              }
            }}
            className={`w-full px-4 py-3 text-base font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 hover:shadow-2xl ${
              audio.isListening
                ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {audio.isListening ? (
              <><Icons.Microphone /> Stop Listening</>
            ) : (
              <><Icons.Microphone /> Start Listening</>
            )}
          </button>
        </div>
      )}

      {/* Emergency Stop */}
      {isAnyConnectionActive() && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-300 mb-3">Emergency Controls</h4>
          
          <button
            onClick={handleEmergencyStop}
            className="w-full px-4 py-3 text-base font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transform hover:scale-105 active:scale-95 hover:shadow-2xl"
          >
            <Icons.Emergency />
            Emergency Stop
          </button>
        </div>
      )}

      {/* Status Summary */}
      <div className="mt-6 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50">
        <div className="text-sm text-gray-400 mb-2">Connection Status</div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">WebRTC:</span>
            <span className={`text-sm font-medium ${webRTC.status === 'connected' ? 'text-green-400' : webRTC.status === 'connecting' ? 'text-yellow-400' : 'text-red-400'}`}>
              {webRTC.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">WHIP:</span>
            <span className={`text-sm font-medium ${whip.status === 'connected' ? 'text-green-400' : whip.status === 'connecting' ? 'text-yellow-400' : 'text-red-400'}`}>
              {whip.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">WebSocket:</span>
            <span className={`text-sm font-medium ${websocket.status === 'connected' ? 'text-green-400' : websocket.status === 'connecting' ? 'text-yellow-400' : 'text-red-400'}`}>
              {websocket.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Audio:</span>
            <span className={`text-sm font-medium ${audio.isStreaming || audio.isListening ? 'text-green-400' : 'text-red-400'}`}>
              {audio.isStreaming || audio.isListening ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedControlPanel; 