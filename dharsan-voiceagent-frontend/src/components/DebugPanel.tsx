import React from 'react';
import { useVoiceAgentStore } from '../stores/voiceAgentStore';

const DebugPanel: React.FC = () => {
  const {
    connectionStatus,
    isStreaming,
    sessionId,
    error,
    audioLevel,
    latency,
    packetLoss,
    jitter
  } = useVoiceAgentStore();

  return (
    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs">
      <h3 className="text-white mb-2">Debug Panel</h3>
      <div className="space-y-1">
        <div>connectionStatus: <span className="text-yellow-400">"{connectionStatus}"</span></div>
        <div>isStreaming: <span className="text-yellow-400">{isStreaming.toString()}</span></div>
        <div>sessionId: <span className="text-yellow-400">"{sessionId || 'null'}"</span></div>
        <div>error: <span className="text-yellow-400">"{error || 'null'}"</span></div>
        <div>audioLevel: <span className="text-yellow-400">{audioLevel.toFixed(3)}</span></div>
        <div>latency: <span className="text-yellow-400">{latency}ms</span></div>
        <div>packetLoss: <span className="text-yellow-400">{packetLoss}%</span></div>
        <div>jitter: <span className="text-yellow-400">{jitter}ms</span></div>
      </div>
    </div>
  );
};

export default DebugPanel; 