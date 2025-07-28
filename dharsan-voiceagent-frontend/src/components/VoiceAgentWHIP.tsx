import React from 'react';
import { useVoiceAgentWHIP } from '../hooks/useVoiceAgentWHIP';

const VoiceAgentWHIP: React.FC = () => {
  const [state, actions] = useVoiceAgentWHIP();

  const getStatusColor = () => {
    switch (state.connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getAgentStatusColor = () => {
    switch (state.agentStatus) {
      case 'listening': return 'text-blue-500';
      case 'thinking': return 'text-yellow-500';
      case 'speaking': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getMainButtonText = () => {
    switch (state.agentStatus) {
      case 'listening': return 'Stop Listening';
      case 'thinking': return 'Processing...';
      case 'speaking': return 'Speaking...';
      default: return 'Start Listening';
    }
  };

  const getMainButtonColor = () => {
    switch (state.agentStatus) {
      case 'listening': return 'bg-red-500 hover:bg-red-600';
      case 'thinking': return 'bg-yellow-500 cursor-not-allowed';
      case 'speaking': return 'bg-green-500 cursor-not-allowed';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const isMainButtonDisabled = () => {
    return state.agentStatus === 'thinking' || state.agentStatus === 'speaking';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Voice Agent WHIP
        </h1>
        <p className="text-gray-600">
          WebRTC WHIP protocol with media server integration
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connection Status</h2>
            <p className={`text-sm ${getStatusColor()}`}>
              {state.connectionStatus.charAt(0).toUpperCase() + state.connectionStatus.slice(1)}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={actions.connect}
              disabled={state.connectionStatus === 'connected' || state.connectionStatus === 'connecting'}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Connect
            </button>
            <button
              onClick={actions.disconnect}
              disabled={state.connectionStatus === 'disconnected'}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Agent Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Agent Status</h2>
            <p className={`text-sm ${getAgentStatusColor()}`}>
              {state.agentStatus.charAt(0).toUpperCase() + state.agentStatus.slice(1)}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Session: {state.sessionId ? state.sessionId.slice(-8) : 'None'}
          </div>
        </div>
      </div>

      {/* Main Control */}
      <div className="mb-6 text-center">
        <button
          onClick={actions.getAnswer}
          disabled={isMainButtonDisabled() || state.connectionStatus !== 'connected'}
          className={`px-8 py-4 text-white rounded-lg text-lg font-semibold transition-colors ${getMainButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {getMainButtonText()}
        </button>
      </div>

      {/* Greeting */}
      {state.greeting && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Greeting</h3>
          <p className="text-blue-800">{state.greeting}</p>
        </div>
      )}

      {/* Transcript */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Transcript</h3>
          <button
            onClick={actions.clearTranscript}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg min-h-[100px]">
          {state.transcript || state.interimTranscript ? (
            <p className="text-gray-800 whitespace-pre-wrap">
              {state.transcript || state.interimTranscript}
            </p>
          ) : (
            <p className="text-gray-500 italic">No transcript available</p>
          )}
        </div>
      </div>

      {/* AI Response */}
      {state.aiResponse && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Response</h3>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 whitespace-pre-wrap">{state.aiResponse}</p>
          </div>
        </div>
      )}

      {/* Conversation History */}
      {state.conversationHistory.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversation History</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {state.conversationHistory.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-100 text-blue-900'
                    : message.type === 'ai'
                    ? 'bg-green-100 text-green-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase">
                    {message.type === 'user' ? 'You' : message.type === 'ai' ? 'AI' : 'System'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{message.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-800">{state.error}</p>
            </div>
            <button
              onClick={actions.clearError}
              className="px-3 py-1 text-sm bg-red-200 text-red-800 rounded hover:bg-red-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Technical Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Technical Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Protocol:</strong> WHIP (WebRTC HTTP Ingestion Protocol)</p>
            <p><strong>Audio Transport:</strong> WebRTC</p>
            <p><strong>Signaling:</strong> WebSocket</p>
          </div>
          <div>
            <p><strong>Media Server:</strong> Go-based WHIP server</p>
            <p><strong>Orchestrator:</strong> WebSocket communication</p>
            <p><strong>Audio Format:</strong> Opus (48kHz, mono)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentWHIP; 