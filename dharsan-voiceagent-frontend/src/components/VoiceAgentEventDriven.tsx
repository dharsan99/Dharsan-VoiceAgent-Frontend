import React, { useState, useEffect } from 'react';
import { useVoiceAgentEventDriven } from '../hooks/useVoiceAgentEventDriven';

// Icons component
interface IconProps {
  className?: string;
}

const Icons = {
  Network: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Microphone: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  Chat: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
  Idle: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  Error: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  Connect: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Disconnect: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

const VoiceAgentEventDriven: React.FC = () => {
  const [state, actions] = useVoiceAgentEventDriven();
  const [showEventSequence, setShowEventSequence] = useState(false);
  
  const {
    connectionStatus,
    agentStatus,
    sessionId,
    greeting,
    transcript,
    interimTranscript,
    aiResponse,
    error,
    conversationHistory
  } = state;

  const {
    connect,
    disconnect,
    startListening,
    stopListening,
    getAnswer,
    clearTranscript,
    clearError,
    testAudioContext
  } = actions;

  // Remove auto-connect - let user manually connect

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusInfo = () => {
    switch (agentStatus) {
      case 'listening':
        return {
          title: 'Listening',
          subtitle: 'Speak now...',
          icon: <Icons.Microphone className="w-6 h-6 text-red-500 animate-pulse" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'thinking':
        return {
          title: 'Thinking',
          subtitle: 'AI is processing...',
          icon: <Icons.Loading className="w-6 h-6 text-yellow-500" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'speaking':
        return {
          title: 'Speaking',
          subtitle: 'AI is responding...',
          icon: <Icons.Chat className="w-6 h-6 text-green-500" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      default:
        return {
          title: 'Ready',
          subtitle: 'Click to start listening',
          icon: <Icons.Idle className="w-6 h-6 text-blue-500" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Control Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status */}
          <div className={`p-6 rounded-xl border-2 ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {statusInfo.icon}
                <div>
                  <h2 className={`text-lg font-semibold ${statusInfo.color}`}>
                    {statusInfo.title}
                  </h2>
                  <p className="text-sm text-gray-600">{statusInfo.subtitle}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Event-Driven</div>
                <div className={`text-sm font-medium ${
                  connectionStatus === 'connected' ? 'text-green-600' :
                  connectionStatus === 'connecting' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {connectionStatus.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Connection Controls */}
            <div className="mt-4 flex items-center space-x-3">
              {connectionStatus === 'connected' ? (
                <button
                  onClick={disconnect}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center space-x-2"
                >
                  <Icons.Disconnect className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              ) : (
                <button
                  onClick={connect}
                  disabled={connectionStatus === 'connecting'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    connectionStatus === 'connecting'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <Icons.Connect className="w-4 h-4" />
                  <span>{connectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}</span>
                </button>
              )}
              
              <button
                onClick={() => setShowEventSequence(!showEventSequence)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {showEventSequence ? 'Hide' : 'Show'} Event Sequence
              </button>
              
              {connectionStatus === 'connected' && (
                <button
                  onClick={async () => {
                    console.log('🎵 Testing audio context...');
                    const audioTestResult = await testAudioContext();
                    console.log('🎵 Audio context test result:', audioTestResult);
                    if (audioTestResult) {
                      alert('Audio test successful! You should hear "Audio working".');
                    } else {
                      alert('Audio test failed. Check console for details.');
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  Test Audio
                </button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icons.Error className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Greeting Display */}
          {greeting && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Icons.Chat className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Agent Greeting</h3>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-blue-800 text-lg">
                  <strong>Agent:</strong> {greeting}
                </p>
              </div>
            </div>
          )}

          {/* Main Control Button */}
          <div className="text-center">
            <button
              onClick={agentStatus === 'listening' ? getAnswer : startListening}
              disabled={connectionStatus !== 'connected' || agentStatus === 'thinking' || agentStatus === 'speaking'}
              className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                connectionStatus !== 'connected' || agentStatus === 'thinking' || agentStatus === 'speaking'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : agentStatus === 'listening'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {connectionStatus !== 'connected' ? (
                <div className="flex items-center space-x-2">
                  <Icons.Error className="w-5 h-5" />
                  <span>Connect First</span>
                </div>
              ) : agentStatus === 'thinking' ? (
                <div className="flex items-center space-x-2">
                  <Icons.Loading className="w-5 h-5" />
                  <span>Processing...</span>
                </div>
              ) : agentStatus === 'speaking' ? (
                <div className="flex items-center space-x-2">
                  <Icons.Chat className="w-5 h-5" />
                  <span>Speaking...</span>
                </div>
              ) : agentStatus === 'listening' ? (
                <div className="flex items-center space-x-2">
                  <Icons.Stop className="w-5 h-5" />
                  <span>Get Answer</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Icons.Play className="w-5 h-5" />
                  <span>Start Listening</span>
                </div>
              )}
            </button>
          </div>

          {/* Conversation Display */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Icons.Chat className="w-5 h-5" />
                <span>Conversation</span>
              </h3>
              <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                  Session: {sessionId ? sessionId.substring(0, 8) + '...' : 'None'}
                </div>
                <button
                  onClick={clearTranscript}
                  className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversationHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icons.Chat className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No conversation yet. Start listening to begin!</p>
                </div>
              ) : (
                conversationHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.type === 'ai'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <div className="text-sm">{message.text}</div>
                      <div className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Current Transcript */}
            {(transcript || interimTranscript) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  {transcript && (
                    <div className="mb-2">
                      <strong>Final:</strong> {transcript}
                    </div>
                  )}
                  {interimTranscript && (
                    <div className="italic">
                      <strong>Interim:</strong> {interimTranscript}
                    </div>
                  )}
                </div>
                </div>
              )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  agentStatus === 'idle' ? 'text-gray-600' :
                  agentStatus === 'listening' ? 'text-blue-600' :
                  agentStatus === 'thinking' ? 'text-yellow-600' :
                  agentStatus === 'speaking' ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  {agentStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Connection:</span>
                <span className={`text-sm font-medium ${
                  connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {connectionStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Event Sequence Info */}
          {showEventSequence && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Sequence</h3>
              <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connect → greeting_request → greeting</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Start Listening → start_listening → listening</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Speak → interim_transcript (live)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Get Answer → trigger_llm → response</span>
              </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">
                    <strong>Note:</strong> This follows the deterministic event-driven architecture where the user explicitly controls when to trigger the LLM processing.
                  </p>
          </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={startListening}
                disabled={connectionStatus !== 'connected' || agentStatus === 'listening'}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  connectionStatus !== 'connected' || agentStatus === 'listening'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                Start Listening
              </button>
              
              <button
                onClick={getAnswer}
                disabled={connectionStatus !== 'connected' || agentStatus !== 'listening'}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  connectionStatus !== 'connected' || agentStatus !== 'listening'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                Get Answer
              </button>
              
              <button
                onClick={clearTranscript}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Clear Transcript
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentEventDriven; 