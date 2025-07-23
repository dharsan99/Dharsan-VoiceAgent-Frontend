import React from 'react';
import { useVoiceAgentWebRTC } from '../hooks/useVoiceAgentWebRTC';
import StatusIndicator from './shared/StatusIndicator';
import ControlPanel from './shared/ControlPanel';
import TranscriptPanel from './shared/TranscriptPanel';
import NetworkStatsPanel from './shared/NetworkStatsPanel';
import SessionInfoPanel from './shared/SessionInfoPanel';

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

  const handleTestMicrophone = async () => {
    try {
      console.log('Testing microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone test successful, tracks:', stream.getTracks().length);
      alert('Microphone test successful! Check console for details.');
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Microphone test failed:', error);
      alert(`Microphone test failed: ${error}`);
    }
  };

  const handleTestWebSocket = () => {
    try {
      console.log('Testing WebSocket connection...');
      // You can add WebSocket test logic here
      alert('WebSocket test message sent! Check console and backend logs.');
    } catch (error) {
      console.error('WebSocket test failed:', error);
      alert(`WebSocket test failed: ${error}`);
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
              <StatusIndicator status={connectionStatus} variant="dark" />
              <StatusIndicator status={processingStatus} variant="dark" />
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
      <NetworkStatsPanel networkStats={networkStats} variant="dark" />

      {/* Session Info */}
      {sessionInfo && (
        <SessionInfoPanel
          sessionInfo={sessionInfo}
          sessionId={sessionId || undefined}
          variant="dark"
        />
      )}

      {/* Controls */}
      <ControlPanel
        connectionStatus={connectionStatus}
        onConnect={connect}
        onDisconnect={disconnect}
        onClearTranscript={clearTranscript}
        onTestMicrophone={handleTestMicrophone}
        onTestWebSocket={handleTestWebSocket}
        variant="dark"
      />

      {/* Transcript */}
      <TranscriptPanel
        transcript={transcript}
        interimTranscript={interimTranscript}
        aiResponse={aiResponse || undefined}
        onClear={clearTranscript}
        variant="dark"
      />

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