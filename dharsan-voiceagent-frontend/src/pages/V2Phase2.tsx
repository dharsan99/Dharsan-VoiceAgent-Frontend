import React, { useEffect, useState } from 'react';
import { useVoiceAgentWHIP } from '../hooks/useVoiceAgentWHIP_fixed_v2';
import { navigateToHome } from '../utils/navigation';
import ProductionConfigTest from '../components/ProductionConfigTest';
import PipelineStatus from '../components/PipelineStatus';

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
  )
};

// ConversationMessage interface is now handled by the WHIP client
// This interface is kept for reference but not used directly in this component

const V2Phase2: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showConfigTest, setShowConfigTest] = useState(false);
  const [isStoppingConversation, setIsStoppingConversation] = useState(false);
  const [isGettingAnswer, setIsGettingAnswer] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // V2 Voice Agent with WHIP
  const [v2State, v2Actions] = useVoiceAgentWHIP();
  
  const {
    connectionStatus,
    sessionId,
    transcript,
    isListening,
    error,
    isConnected,
    isConnecting,
    isProcessing,
    conversationHistory,
    audioLevel,
    connectionQuality
  } = v2State;
  
  const {
    connect,
    disconnect,
    stopConversation,
    startListening,
    stopListening,
    getAnswer,
    resetPipeline
  } = v2Actions;

  // Error handling for component initialization
  useEffect(() => {
    if (!isInitialized) {
      try {
        setIsInitialized(true);
      } catch (error) {
        // Silent error handling
      }
    }
  }, [isInitialized]);

  // Handle transcript updates (now managed by WHIP client)
  useEffect(() => {
    // Transcript updates are now handled by the pipeline logs
  }, [transcript]);

  // Reset processing state when AI response is received
  useEffect(() => {
    if (isProcessingAI && conversationHistory.length > 0) {
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      if (lastMessage.type === 'ai') {
        // AI response received, reset processing state
        setIsProcessingAI(false);
      }
    }
  }, [conversationHistory, isProcessingAI]);

  const handleMainButton = async () => {
    if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
      // Not connected - connect first
      connect();
    } else if (connectionStatus === 'connected' && !isListening) {
      // Connected but not listening - start listening
      startListening();
    } else if (isListening && !isProcessingAI) {
      // Listening - get answer
      setIsGettingAnswer(true);
      setIsProcessingAI(true);
      try {
        await getAnswer();
      } finally {
        setIsGettingAnswer(false);
        // Note: isProcessingAI will be reset when AI response is received
      }
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
    if (error) {
      return { 
        text: 'Error', 
        color: 'bg-red-500', 
        icon: <Icons.Error />, 
        bgGradient: 'from-red-500 to-red-600' 
      };
    }
    
    if (isConnecting) {
      return { 
        text: 'Connecting...', 
        color: 'bg-yellow-500 animate-pulse', 
        icon: <Icons.Processing />, 
        bgGradient: 'from-yellow-500 to-yellow-600' 
      };
    }
    
    if (isConnected && isListening) {
      return { 
        text: 'Listening...', 
        color: 'bg-green-500 animate-pulse', 
        icon: <Icons.Microphone />, 
        bgGradient: 'from-green-500 to-green-600' 
      };
    }
    
    if (isConnected) {
      return { 
        text: 'Connected - Ready for AI Conversation', 
        color: 'bg-blue-500', 
        icon: <Icons.Brain />, 
        bgGradient: 'from-blue-500 to-blue-600' 
      };
    }
    
    return { 
      text: 'Disconnected', 
      color: 'bg-gray-500', 
      icon: <Icons.Idle />, 
      bgGradient: 'from-gray-500 to-gray-600' 
    };
  };

  const statusInfo = getStatusInfo();

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="relative mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={navigateToHome}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Icons.Home />
                <span className="text-sm">Back to Home</span>
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">V2 Phase 2 - AI Conversation</h1>
                <p className="text-gray-400 text-sm sm:text-base">Google AI Pipeline with STT → LLM → TTS</p>
              </div>
            </div>
            
            {/* Session Info */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowConfigTest(!showConfigTest)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {showConfigTest ? 'Hide' : 'Show'} Config Test
              </button>
              <div className="text-sm text-gray-400">
                {sessionId && <span>Session: {sessionId}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Pipeline Status - Full Width */}
        <div className="mb-6">
          <PipelineStatus 
            steps={v2State.pipelineSteps}
            isActive={isConnected}
          />
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column: Controls & Status */}
          <div className="lg:col-span-1 xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Controls Panel */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.Settings />
                AI Controls
              </h2>
              <div className="space-y-3">
                {/* Main Dynamic Button */}
                <button
                  onClick={handleMainButton}
                  disabled={connectionStatus === 'connecting' || isStoppingConversation || isGettingAnswer || isProcessingAI}
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-lg flex items-center justify-center gap-2
                    ${connectionStatus === 'connecting' || isStoppingConversation
                      ? 'bg-gray-600 cursor-not-allowed opacity-50'
                      : isProcessingAI
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-700'
                        : isListening
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                          : connectionStatus === 'connected'
                            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'
                    }
                    ${(connectionStatus === 'connecting' || isStoppingConversation || isGettingAnswer || isProcessingAI)
                      ? 'cursor-not-allowed opacity-50' 
                      : 'transform hover:scale-105 active:scale-95 hover:shadow-2xl'
                    }`}
                >
                  {connectionStatus === 'connecting' 
                    ? <><Icons.Loading /> Connecting...</>
                    : isStoppingConversation
                      ? <><Icons.Loading /> Stopping...</>
                      : isProcessingAI
                        ? <><Icons.Loading /> Processing...</>
                        : isListening
                          ? <><Icons.Brain /> Get Answer</>
                          : connectionStatus === 'connected'
                            ? <><Icons.Microphone /> Start Listening</>
                            : <><Icons.Play /> Start AI Conversation</>
                  }
                </button>
                

                
                {/* Stop Button */}
                {isConnected && (
                  <button
                    onClick={async () => {
                      setIsStoppingConversation(true);
                      try {
                        await stopConversation();
                      } finally {
                        setIsStoppingConversation(false);
                      }
                    }}
                    disabled={isStoppingConversation || isGettingAnswer}
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 hover:shadow-2xl ${
                      isStoppingConversation || isGettingAnswer
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    }`}
                  >
                    {isStoppingConversation ? (
                      <><Icons.Loading /> Stopping...</>
                    ) : (
                      <><Icons.Stop /> Stop Conversation</>
                    )}
                  </button>
                )}
                
                <button
                  onClick={resetPipeline}
                  className="w-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500/50 shadow-md flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <Icons.Settings className="w-4 h-4" />
                  Reset Pipeline
                </button>
              </div>
            </div>

            {/* Connection Status Panel */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.Network />
                Connection Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                    connectionStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {connectionStatus}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">AI Pipeline:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    isConnected ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {isConnected ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* System Status Panel */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.AI />
                AI System Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusInfo.color}`}></div>
                  <div>
                    <div className="text-white font-medium">Agent State:</div>
                    <div className="text-sm text-gray-400">{statusInfo.text}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <div>
                    <div className="text-white font-medium">Listening:</div>
                    <div className="text-sm text-gray-400">
                      {isListening ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <div>
                    <div className="text-white font-medium">Processing:</div>
                    <div className="text-sm text-gray-400">
                      {isProcessing ? 'AI Thinking...' : 'Idle'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    connectionQuality === 'excellent' ? 'bg-green-500' :
                    connectionQuality === 'good' ? 'bg-yellow-500' :
                    connectionQuality === 'poor' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <div className="text-white font-medium">Connection Quality:</div>
                    <div className="text-sm text-gray-400 capitalize">
                      {connectionQuality}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <div className="text-white font-medium">Audio Level:</div>
                    <div className="text-sm text-gray-400">
                      {Math.round(audioLevel)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <Icons.Chat />
                How to Use
              </h3>
              <div className="space-y-2 text-sm text-blue-300">
                <div className="flex items-start space-x-2">
                  <span className="font-medium">1.</span>
                  <span>Click "Start AI Conversation" to connect</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">2.</span>
                  <span>Click "Start Listening" to begin voice input</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">3.</span>
                  <span>Click "Get Answer" to process your speech</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">4.</span>
                  <span>Wait for AI response, then repeat from step 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Conversation & Transcript */}
          <div className="lg:col-span-3 xl:col-span-3 2xl:col-span-4 space-y-4 sm:space-y-6">
            {/* Conversation History */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.Chat />
                AI Conversation
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
                {conversationHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Icons.Chat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No conversation yet. Start listening to begin!</p>
                  </div>
                ) : (
                  conversationHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' || message.type === 'interim_user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.type === 'interim_user'
                            ? 'bg-gradient-to-r from-blue-400/50 to-blue-500/50 text-white border-2 border-blue-300/50 border-dashed'
                            : message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                            : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 border border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs opacity-75">
                            {message.type === 'interim_user' ? 'You (typing...)' : message.type === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                          <span className="text-xs opacity-50">
                            {formatTimestamp(message.timestamp)}
                          </span>
                          {message.type === 'interim_user' && message.confidence && (
                            <span className="text-xs opacity-50">
                              ({Math.round(message.confidence * 100)}%)
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        {message.type === 'interim_user' && (
                          <div className="mt-2 flex items-center gap-1">
                            <div className="w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 border border-gray-600 max-w-xs lg:max-w-md px-4 py-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Icons.Processing className="w-4 h-4" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline Logs */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.Network />
                Pipeline Logs
              </h2>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {v2State.pipelineLogs.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    <p>No pipeline activity yet. Start a conversation to see logs!</p>
                  </div>
                ) : (
                  v2State.pipelineLogs.slice(-20).map((log, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded ${
                        log.type === 'error' ? 'bg-red-900/50 text-red-300 border-l-2 border-red-500' :
                        log.type === 'success' ? 'bg-green-900/50 text-green-300 border-l-2 border-green-500' :
                        log.type === 'warning' ? 'bg-yellow-900/50 text-yellow-300 border-l-2 border-yellow-500' :
                        'bg-gray-700/50 text-gray-300 border-l-2 border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{log.step}</span>
                        <span className="text-xs opacity-75">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1">{log.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Current Transcript */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.Microphone />
                Live Transcript
              </h2>
              <div className="space-y-4">
                {transcript ? (
                  <div className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="text-sm text-green-400 mb-2 flex items-center gap-2">
                      <Icons.Microphone className="w-4 h-4" />
                      Live Input
                    </div>
                    <div className="text-white text-lg">{transcript}</div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Icons.Microphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transcript yet. Start listening to see your speech here!</p>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-900/50 p-4 rounded-lg border-l-4 border-red-500">
                    <div className="text-sm text-red-400 mb-2">Error:</div>
                    <div className="text-white">{error}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 sm:mt-12 text-gray-500 text-sm sm:text-base">
          <p className="mb-1">V2 Phase 2: Google AI Pipeline with STT → LLM → TTS</p>
          <p>Backend: Go Media Server + Orchestrator | Frontend: React + WebRTC WHIP</p>
        </footer>
      </div>

      {/* Production Configuration Test Modal */}
      {showConfigTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ProductionConfigTest />
            <div className="text-center mt-4">
              <button
                onClick={() => setShowConfigTest(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default V2Phase2; 