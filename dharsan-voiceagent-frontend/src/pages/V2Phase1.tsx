import React, { useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useVoiceAgentStore } from '../stores/voiceAgentStore';
import AudioControls from '../components/AudioControls';
import AudioMeter from '../components/AudioMeter';
import AudioVisualizer from '../components/AudioVisualizer';
import ConnectionQuality from '../components/ConnectionQuality';
import DebugPanel from '../components/DebugPanel';
import { navigateToHome } from '../utils/navigation';

// Icons component
interface IconProps {
  className?: string;
}

const Icons = {
  Home: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  WebRTC: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Info: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const V2Phase1: React.FC = () => {
  const {
    connectionStatus,
    isStreaming,
    sessionId,
    error,
    audioLevel,
    latency,
    packetLoss,
    jitter,
    connectedAt,
    lastActivity
  } = useVoiceAgentStore();

  const {
    connect,
    disconnect,
    startStreaming,
    stopStreaming
  } = useWebRTC();

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionStatus === 'connected') {
        disconnect();
      }
    };
  }, [connectionStatus, disconnect]);

  const formatDuration = (date: Date | null) => {
    if (!date) return 'N/A';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={navigateToHome}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icons.Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Icons.WebRTC className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">V2 Phase 1 - WebRTC Echo Test</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Icons.Info className="w-4 h-4" />
                <span>Testing WHIP Protocol</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <AudioControls
              onConnect={connect}
              onDisconnect={disconnect}
              onStartStreaming={startStreaming}
              onStopStreaming={stopStreaming}
            />
            
            <AudioMeter />
            
            <AudioVisualizer />
            
            <ConnectionQuality />
            
            <DebugPanel />
          </div>

          {/* Right Column - Status & Metrics */}
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Status</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <div className="font-medium text-gray-900">
                      {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Streaming:</span>
                    <div className="font-medium text-gray-900">
                      {isStreaming ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                {sessionId && (
                  <div>
                    <span className="text-sm text-gray-600">Session ID:</span>
                    <div className="font-mono text-sm text-gray-900 break-all">
                      {sessionId}
                    </div>
                  </div>
                )}

                {connectedAt && (
                  <div>
                    <span className="text-sm text-gray-600">Connected:</span>
                    <div className="font-medium text-gray-900">
                      {formatDuration(connectedAt)} ago
                    </div>
                  </div>
                )}

                {lastActivity && (
                  <div>
                    <span className="text-sm text-gray-600">Last Activity:</span>
                    <div className="font-medium text-gray-900">
                      {formatDuration(lastActivity)} ago
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{latency}ms</div>
                  <div className="text-sm text-gray-600">Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{packetLoss}%</div>
                  <div className="text-sm text-gray-600">Packet Loss</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{jitter}ms</div>
                  <div className="text-sm text-gray-600">Jitter</div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">How to Test</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-start space-x-2">
                  <span className="font-medium">1.</span>
                  <span>Click "Connect" to establish WebRTC connection</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">2.</span>
                  <span>Click "Start Streaming" to begin audio echo test</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">3.</span>
                  <span>Speak into your microphone - you should hear your voice echoed back</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">4.</span>
                  <span>Monitor audio levels and connection metrics</span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default V2Phase1; 