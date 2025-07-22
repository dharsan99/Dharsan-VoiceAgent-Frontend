import React from 'react';
import { useVoiceAgentWebRTC } from '../hooks/useVoiceAgentWebRTC';

const VoiceAgentWebRTC: React.FC = () => {
  const {
    connectionStatus,
    processingStatus,
    sessionId,
    transcript,
    interimTranscript,
    aiResponse,
    error,
    networkStats,
    sessionInfo,
    connect,
    disconnect,
    clearTranscript
  } = useVoiceAgentWebRTC();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getProcessingColor = (status: string) => {
    switch (status) {
      case 'listening': return 'text-blue-500';
      case 'processing': return 'text-yellow-500';
      case 'speaking': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Voice AI Agent v2 - WebRTC
        </h1>
        <p className="text-gray-400">
          Low-latency audio transport with WebRTC
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Connection Status</h2>
            <div className="flex items-center space-x-4">
              <span className={`font-medium ${getStatusColor(connectionStatus)}`}>
                {connectionStatus.toUpperCase()}
              </span>
              <span className={`font-medium ${getProcessingColor(processingStatus)}`}>
                {processingStatus.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={connect}
              disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Connect
            </button>
            <button
              onClick={disconnect}
              disabled={connectionStatus === 'disconnected'}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Disconnect
            </button>
          </div>
        </div>
        
        {sessionId && (
          <div className="mt-2 text-sm text-gray-400">
            Session ID: {sessionId}
          </div>
        )}
        
        {error && (
          <div className="mt-2 p-2 bg-red-900/50 border border-red-500 rounded text-red-300">
            Error: {error}
          </div>
        )}
      </div>

      {/* Network Stats */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-3">Network Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{networkStats.latency}ms</div>
            <div className="text-sm text-gray-400">Latency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{networkStats.jitter}ms</div>
            <div className="text-sm text-gray-400">Jitter</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{networkStats.packetLoss}%</div>
            <div className="text-sm text-gray-400">Packet Loss</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              networkStats.connectionQuality === 'excellent' ? 'text-green-400' :
              networkStats.connectionQuality === 'good' ? 'text-blue-400' :
              networkStats.connectionQuality === 'fair' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {networkStats.connectionQuality.toUpperCase()}
            </div>
            <div className="text-sm text-gray-400">Quality</div>
          </div>
        </div>
      </div>

      {/* Session Info */}
      {sessionInfo && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-3">Session Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-400">Start Time</div>
              <div className="text-white">{new Date(sessionInfo.startTime).toLocaleTimeString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Duration</div>
              <div className="text-white">{Math.round(sessionInfo.duration / 1000)}s</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Messages</div>
              <div className="text-white">{sessionInfo.messagesProcessed}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Errors</div>
              <div className="text-white">{sessionInfo.errorsCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Transcript</h2>
          <button
            onClick={clearTranscript}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
        
        <div className="space-y-2">
          {transcript && (
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-sm text-gray-400 mb-1">Final Transcript:</div>
              <div className="text-white">{transcript}</div>
            </div>
          )}
          
          {interimTranscript && (
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-sm text-gray-400 mb-1">Interim Transcript:</div>
              <div className="text-white italic">{interimTranscript}</div>
            </div>
          )}
          
          {!transcript && !interimTranscript && (
            <div className="p-3 bg-gray-700 rounded text-gray-400 text-center">
              No transcript available
            </div>
          )}
        </div>
      </div>

      {/* AI Response */}
      {aiResponse && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-3">AI Response</h2>
          <div className="p-3 bg-gray-700 rounded">
            <div className="text-white">{aiResponse}</div>
          </div>
        </div>
      )}

      {/* WebRTC Info */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-3">WebRTC Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Transport:</span>
            <span className="text-white">UDP (WebRTC)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Codec:</span>
            <span className="text-white">Opus</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Sample Rate:</span>
            <span className="text-white">48kHz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Channels:</span>
            <span className="text-white">Mono</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Jitter Buffer:</span>
            <span className="text-white">Native WebRTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentWebRTC; 