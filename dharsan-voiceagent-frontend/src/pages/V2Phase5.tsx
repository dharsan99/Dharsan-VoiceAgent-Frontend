import React, { useEffect, useState } from 'react';
import { useVoiceAgentGRPC } from '../hooks/useVoiceAgentGRPC';
import { navigateToHome } from '../utils/navigation';
import ProductionConfigTest from '../components/ProductionConfigTest';
import PipelineStatus from '../components/PipelineStatus';
import VoiceAgentEventDriven from '../components/VoiceAgentEventDriven';

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
  AI: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Microphone: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  Speaker: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  ),
  Brain: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
  Processing: ({ className = "w-4 h-4 animate-spin" }: IconProps) => (
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
  Network: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Chat: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Settings: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  GRPC: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
};

const V2Phase5: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showConfigTest, setShowConfigTest] = useState(false);
  const [isStoppingConversation, setIsStoppingConversation] = useState(false);
  const [isGettingAnswer, setIsGettingAnswer] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [useEventDriven, setUseEventDriven] = useState(true); // Default to event-driven

  // gRPC Voice Agent (fallback)
  const [grpcState, grpcActions] = useVoiceAgentGRPC();
  
  const {
    connectionStatus,
    isConnected,
    isConnecting,
    isListening,
    transcript,
    aiResponse,
    isProcessing,
    conversationHistory,
    audioLevel,
    connectionQuality,
    pipelineSteps,
    pipelineLogs,
    grpcStreamActive,
    error,
    sessionId,
    version
  } = grpcState;

  const {
    connect,
    disconnect,
    stopConversation,
    startListening,
    stopListening,
    getAnswer,
    resetPipeline,
    sendControlMessage
  } = grpcActions;

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      console.log('🚀 V2 Phase 5 gRPC Voice Agent initialized');
    }
  }, [isInitialized]);

  const handleMainButton = async () => {
    if (!isConnected) {
      await connect();
    } else if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        title: 'Disconnected',
        subtitle: 'Click to connect to gRPC server',
        icon: <Icons.Network className="w-6 h-6 text-gray-400" />,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
    }

    if (isListening) {
      return {
        title: 'Listening',
        subtitle: 'Speak now...',
        icon: <Icons.Microphone className="w-6 h-6 text-red-500 animate-pulse" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    if (isProcessing) {
      return {
        title: 'Processing',
        subtitle: 'AI is thinking...',
        icon: <Icons.Processing className="w-6 h-6 text-blue-500" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }

    return {
      title: 'Ready',
      subtitle: 'Click to start listening',
      icon: <Icons.Idle className="w-6 h-6 text-green-500" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={navigateToHome}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Go Home"
              >
                <Icons.Home className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Voice Agent V2 Phase 5 - Event-Driven Architecture
                </h1>
                <p className="text-sm text-gray-500">
                  Deterministic event sequence: Connect → Greeting → Start Listening → Get Answer → Response
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {useEventDriven ? (
                  <>
                    <Icons.Network className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Event-Driven</span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Default</span>
                  </>
                ) : (
                  <>
                    <Icons.GRPC className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">gRPC v{version}</span>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setUseEventDriven(!useEventDriven)}
                className="px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
                title="Switch Implementation"
              >
                {useEventDriven ? 'Switch to gRPC (Legacy)' : 'Switch to Event-Driven (Recommended)'}
              </button>
              
              <button
                onClick={() => setShowConfigTest(!showConfigTest)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Test Configuration"
              >
                <Icons.Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {useEventDriven ? (
          <VoiceAgentEventDriven />
        ) : (
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
                  <div className="text-sm text-gray-500">Connection</div>
                  <div className={`text-sm font-medium ${
                    connectionStatus === 'connected' ? 'text-green-600' :
                    connectionStatus === 'connecting' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {connectionStatus.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Audio Level Meter */}
              {isListening && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Audio Level:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-100"
                        style={{ width: `${audioLevel * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {Math.round(audioLevel * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icons.Error className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Main Control Button */}
            <div className="text-center">
              <button
                onClick={handleMainButton}
                disabled={isConnecting}
                className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                  isConnecting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : !isConnected
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : isListening
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isConnecting ? (
                  <div className="flex items-center space-x-2">
                    <Icons.Loading className="w-5 h-5" />
                    <span>Connecting...</span>
                  </div>
                ) : !isConnected ? (
                  <div className="flex items-center space-x-2">
                    <Icons.Network className="w-5 h-5" />
                    <span>Connect to gRPC</span>
                  </div>
                ) : isListening ? (
                  <div className="flex items-center space-x-2">
                    <Icons.Stop className="w-5 h-5" />
                    <span>Stop Listening</span>
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
                <div className="text-sm text-gray-500">
                  Session: {sessionId ? sessionId.substring(0, 8) + '...' : 'None'}
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
                            : 'bg-yellow-100 text-gray-700'
                        }`}
                      >
                        <div className="text-sm">{message.text}</div>
                        <div className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                          {message.confidence && (
                            <span className="ml-2">
                              ({Math.round(message.confidence * 100)}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Current Transcript */}
              {transcript && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    <strong>Current:</strong> {transcript}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pipeline Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Icons.Brain className="w-5 h-5" />
                <span>gRPC Pipeline</span>
              </h3>
              <PipelineStatus 
                steps={pipelineSteps} 
                isActive={grpcStreamActive} 
              />
            </div>

            {/* Connection Quality */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Quality</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium ${
                    connectionQuality === 'excellent' ? 'text-green-600' :
                    connectionQuality === 'good' ? 'text-yellow-600' :
                    connectionQuality === 'poor' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {connectionQuality.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">gRPC Stream:</span>
                  <span className={`text-sm font-medium ${
                    grpcStreamActive ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {grpcStreamActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Control Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleToggleListening}
                  disabled={!isConnected}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !isConnected
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isListening
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isListening ? 'Stop Listening' : 'Start Listening'}
                </button>
                
                <button
                  onClick={getAnswer}
                  disabled={!isConnected || isProcessing}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !isConnected || isProcessing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Get AI Answer'}
                </button>
                
                <button
                  onClick={resetPipeline}
                  className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Reset Pipeline
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Configuration Test Modal */}
      {showConfigTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Production Configuration Test</h2>
              <button
                onClick={() => setShowConfigTest(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ProductionConfigTest />
          </div>
        </div>
      )}
    </div>
  );
};

export default V2Phase5; 