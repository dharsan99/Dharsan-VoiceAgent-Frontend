import React, { useState, useEffect } from 'react';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import { navigateToHome } from '../utils/navigation';
import { LiveTranscript } from '../components/LiveTranscript';
import { StorageManager } from '../components/StorageManager';
import { CloudStorageManager } from '../components/CloudStorageManager';

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
      <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 018-8Z"/>
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
  Processing: ({ className = "w-4 h-4 animate-spin" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 018-8Z"/>
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
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  ),
  Target: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  AdvancedFeatures: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Network: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Transcript: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Home: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
};

const V1Dashboard: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showStorageManager, setShowStorageManager] = useState(false);
  const [showCloudStorageManager, setShowCloudStorageManager] = useState(false);

  // Error handling for component initialization
  useEffect(() => {
    if (!isInitialized) {
      console.log('V1 Dashboard initializing...');
      try {
        console.log('V1 Dashboard mounted successfully');
        console.log('Environment variables:', {
          VITE_WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL,
          VITE_WEBSOCKET_URL_V1: import.meta.env.VITE_WEBSOCKET_URL_V1,
          NODE_ENV: process.env.NODE_ENV
        });
        setIsInitialized(true);
      } catch (error) {
        console.error('V1 Dashboard initialization error:', error);
      }
    }
  }, [isInitialized]);

  // V1 Voice Agent
  const v1VoiceAgent = useVoiceAgent('v1');
  
  const {
    connectionStatus,
    listeningState,
    isVoiceActive,
    interimTranscript,
    finalTranscripts,
    currentSpokenWordIndex,
    aiResponse,
    transcriptConfidence,
    lastTranscriptUpdate,
    networkStats,
    connect,
    disconnect,
  } = v1VoiceAgent;

  const handleToggleConversation = () => {
    if (connectionStatus === 'connected') {
      disconnect();
    } else {
      connect();
    }
  };

  const getStatusInfo = () => {
    switch (listeningState) {
      case 'idle':
        return { 
          text: 'Idle - Ready to listen', 
          color: 'bg-gray-500', 
          icon: <Icons.Idle />, 
          bgGradient: 'from-gray-500 to-gray-600' 
        };
      case 'listening':
        return { 
          text: 'Listening...', 
          color: 'bg-green-500 animate-pulse', 
          icon: <Icons.Microphone />, 
          bgGradient: 'from-green-500 to-green-600' 
        };
      case 'processing':
        return { 
          text: 'AI Processing...', 
          color: 'bg-yellow-500 animate-pulse', 
          icon: <Icons.Processing />, 
          bgGradient: 'from-yellow-500 to-yellow-600' 
        };
      case 'thinking':
        return { 
          text: 'AI Thinking...', 
          color: 'bg-purple-500 animate-pulse', 
          icon: <Icons.Processing />, 
          bgGradient: 'from-purple-500 to-purple-600' 
        };
      case 'speaking':
        return { 
          text: 'AI Speaking...', 
          color: 'bg-blue-500 animate-pulse', 
          icon: <Icons.Speaker />, 
          bgGradient: 'from-blue-500 to-blue-600' 
        };
      case 'error':
        return { 
          text: 'Error', 
          color: 'bg-red-500', 
          icon: <Icons.Error />, 
          bgGradient: 'from-red-500 to-red-600' 
        };
      default:
        return { 
          text: 'Unknown', 
          color: 'bg-gray-500', 
          icon: <Icons.Idle />, 
          bgGradient: 'from-gray-500 to-gray-600' 
        };
    }
  };

  const statusInfo = getStatusInfo();

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
                <h1 className="text-2xl sm:text-3xl font-bold text-white">V1 Dashboard</h1>
                <p className="text-gray-400 text-sm sm:text-base">Stable Voice Agent</p>
              </div>
            </div>
            
            {/* Storage Manager Button */}
            <button 
              onClick={() => setShowStorageManager(true)}
              className="bg-gray-700/80 hover:bg-gray-600/80 text-white font-medium py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 backdrop-blur-sm border border-gray-600/50 hover:border-gray-500/50 text-xs sm:text-sm"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <span className="hidden sm:inline">Storage</span>
              <span className="sm:hidden">Data</span>
            </button>
            
            {/* Cloud Storage Manager Button */}
            <button 
              onClick={() => setShowCloudStorageManager(true)}
              className="bg-blue-700/80 hover:bg-blue-600/80 text-white font-medium py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 backdrop-blur-sm border border-blue-600/50 hover:border-blue-500/50 text-xs sm:text-sm"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span className="hidden sm:inline">Cloud</span>
              <span className="sm:hidden">Cloud</span>
            </button>


          </div>
        </header>

        {/* Main Dashboard */}
        <div className="flex flex-col lg:grid lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
          {/* Mobile: Top Section - Main Controls */}
          <div className="lg:hidden space-y-4">
            {/* Mobile Controls Panel - Compact */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-gray-700/50">
              <h2 className="text-lg font-bold mb-3 text-cyan-400 flex items-center gap-2">
                <Icons.Controls />
                Voice Controls
              </h2>
              <button
                onClick={handleToggleConversation}
                disabled={connectionStatus === 'connecting'}
                className={`w-full px-4 py-3 text-lg font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-lg flex items-center justify-center gap-2
                  ${connectionStatus === 'connected' 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'
                  }
                  ${connectionStatus === 'connecting' 
                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                    : 'transform hover:scale-105 active:scale-95 hover:shadow-2xl'
                  }`}
              >
                {connectionStatus === 'connecting' 
                  ? <><Icons.Loading /> Connecting...</>
                  : connectionStatus === 'connected' 
                    ? <><Icons.Stop /> Stop</>
                    : <><Icons.Play /> Start</>
                }
              </button>
              
              {/* Audio Test Button */}
              <button
                onClick={() => {
                  console.log('🔊 Testing audio playback...');
                  // Call the test function from the hook
                  if (v1VoiceAgent.testAudioPlayback) {
                    v1VoiceAgent.testAudioPlayback();
                  } else {
                    console.error('🔊 testAudioPlayback function not available');
                  }
                }}
                className="w-full mt-3 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-md flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 active:scale-95"
              >
                <Icons.Speaker />
                Test Audio
              </button>
            </div>

            {/* Mobile Status Summary */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-gray-700/50">
              <h2 className="text-lg font-bold mb-3 text-cyan-400 flex items-center gap-2">
                <Icons.Network />
                Status
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                    connectionStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {connectionStatus}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    isVoiceActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {isVoiceActive ? 'Active' : 'Idle'}
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Desktop: Left Column: Controls & Status */}
          <div className="hidden lg:block lg:col-span-1 xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Controls Panel */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.Controls />
                Controls
              </h2>
              <button
                onClick={handleToggleConversation}
                disabled={connectionStatus === 'connecting'}
                className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-lg flex items-center justify-center gap-2
                  ${connectionStatus === 'connected' 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'
                  }
                  ${connectionStatus === 'connecting' 
                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                    : 'transform hover:scale-105 active:scale-95 hover:shadow-2xl'
                  }`}
              >
                {connectionStatus === 'connecting' 
                  ? <><Icons.Loading /> Connecting...</>
                  : connectionStatus === 'connected' 
                    ? <><Icons.Stop /> Stop Conversation</>
                    : <><Icons.Play /> Start Conversation</>
                }
              </button>
              
              {/* Audio Test Button */}
              <button
                onClick={() => {
                  console.log('🔊 Testing audio playback...');
                  // Call the test function from the hook
                  if (v1VoiceAgent.testAudioPlayback) {
                    v1VoiceAgent.testAudioPlayback();
                  } else {
                    console.error('🔊 testAudioPlayback function not available');
                  }
                }}
                className="w-full mt-3 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-md flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 active:scale-95"
              >
                <Icons.Speaker />
                Test Audio Playback
              </button>
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
                <div className="text-sm text-gray-400">
                  <span className="font-medium">Backend:</span>
                  <br />
                  <span className="font-mono text-xs break-all">
                    {import.meta.env.VITE_WEBSOCKET_URL_V1 || 'wss://dharsan99--voice-ai-backend-v2-run-app.modal.run/ws/v2'}
                  </span>
                </div>
              </div>
            </div>

            {/* System Status Panel */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.AdvancedFeatures />
                System Status
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
                  <div className={`w-3 h-3 rounded-full ${isVoiceActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <div>
                    <div className="text-white font-medium">Voice Activity:</div>
                    <div className="text-sm text-gray-400">
                      {isVoiceActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Quality Panel */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.Network />
                Network Quality
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-400 font-medium">Latency:</span>
                  <span className={`font-bold ${
                    networkStats.averageLatency <= 100 ? 'text-green-400' :
                    networkStats.averageLatency <= 200 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {networkStats.averageLatency}ms
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-400 font-medium">Jitter:</span>
                  <span className={`font-bold ${
                    networkStats.jitter <= 20 ? 'text-green-400' :
                    networkStats.jitter <= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {networkStats.jitter}ms
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-400 font-medium">Packet Loss:</span>
                  <span className={`font-bold ${
                    networkStats.packetLoss <= 2 ? 'text-green-400' :
                    networkStats.packetLoss <= 5 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {networkStats.packetLoss}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transcript & Performance */}
          <div className="lg:col-span-3 xl:col-span-3 2xl:col-span-4 space-y-4 sm:space-y-6">
            {/* Live Transcript Display */}
            <LiveTranscript 
              finalTranscripts={finalTranscripts}
              currentSpokenWordIndex={currentSpokenWordIndex}
              interimTranscript={interimTranscript}
              aiResponse={aiResponse}
              listeningState={listeningState}
              transcriptConfidence={transcriptConfidence}
              lastTranscriptUpdate={lastTranscriptUpdate}
              className="min-h-[60vh] lg:min-h-0"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 sm:mt-12 text-gray-500 text-sm sm:text-base">
          <p className="mb-1">Built with React, TypeScript, Web Audio API, and WebSocket for real-time communication</p>
          <p>Backend: FastAPI + Modal | Frontend: Vite + Tailwind CSS</p>
        </footer>
      </div>

      {/* Storage Manager */}
      <StorageManager 
        isVisible={showStorageManager}
        onClose={() => setShowStorageManager(false)}
      />

      {/* Cloud Storage Manager */}
      <CloudStorageManager 
        isVisible={showCloudStorageManager}
        onClose={() => setShowCloudStorageManager(false)}
      />
    </div>
  );
};

export default V1Dashboard; 