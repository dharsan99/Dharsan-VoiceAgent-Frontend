import React, { useState, useEffect } from 'react';
import { useVoiceAgentWebRTC } from '../hooks/useVoiceAgentWebRTC';
import { navigateToHome } from '../utils/navigation';

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
  WebRTC: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Network: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Home: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
};

const V3Dashboard: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Error handling for component initialization
  useEffect(() => {
    if (!isInitialized) {
      console.log('V3 Dashboard initializing...');
      try {
        console.log('V3 Dashboard mounted successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('V3 Dashboard initialization error:', error);
      }
    }
  }, [isInitialized]);

  // V3 Voice Agent (WebRTC)
  const v3VoiceAgent = useVoiceAgentWebRTC();
  
  const {
    connectionStatus,
    isRecording,
    transcript,
    aiResponse,
    connect,
    disconnect
  } = v3VoiceAgent;

  const handleToggleConversation = () => {
    if (connectionStatus === 'connected') {
      disconnect();
    } else {
      connect();
    }
  };

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'disconnected':
        return { 
          text: 'Disconnected', 
          color: 'bg-gray-500', 
          icon: <Icons.Idle />, 
          bgGradient: 'from-gray-500 to-gray-600' 
        };
      case 'connecting':
        return { 
          text: 'Connecting...', 
          color: 'bg-yellow-500 animate-pulse', 
          icon: <Icons.Loading />, 
          bgGradient: 'from-yellow-500 to-yellow-600' 
        };
      case 'connected':
        return { 
          text: 'Connected', 
          color: 'bg-green-500', 
          icon: <Icons.Microphone />, 
          bgGradient: 'from-green-500 to-green-600' 
        };
      case 'failed':
        return { 
          text: 'Failed', 
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
                <h1 className="text-2xl sm:text-3xl font-bold text-white">V3 Dashboard</h1>
                <p className="text-gray-400 text-sm sm:text-base">WebRTC Ultra-Low Latency Voice Agent</p>
              </div>
            </div>
            
            {/* WebRTC Badge */}
            <div className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
              WebRTC
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column: Controls & Status */}
          <div className="lg:col-span-1 xl:col-span-2 space-y-4 sm:space-y-6">
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
                    ? <><Icons.Stop /> Stop Connection</>
                    : <><Icons.Play /> Start Connection</>
                }
              </button>
              
              {/* Recording Status */}
              {connectionStatus === 'connected' && (
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Recording Status:</div>
                  <div className="text-white font-medium">
                    {isRecording ? 'Active' : 'Inactive'}
                  </div>
                </div>
              )}
            </div>

            {/* Connection Status Panel */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.Network />
                WebRTC Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                    connectionStatus === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {connectionStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">Protocol:</span>
                  <span className="text-blue-400 font-medium">WebRTC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">Transport:</span>
                  <span className="text-green-400 font-medium">UDP</span>
                </div>
              </div>
            </div>

            {/* System Status Panel */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.WebRTC />
                System Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusInfo.color}`}></div>
                  <div>
                    <div className="text-white font-medium">Connection:</div>
                    <div className="text-sm text-gray-400">{statusInfo.text}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <div>
                    <div className="text-white font-medium">Recording:</div>
                    <div className="text-sm text-gray-400">
                      {isRecording ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Panel */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.WebRTC />
                Performance
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-400 font-medium">Latency:</span>
                  <span className="text-green-400 font-bold">~50ms</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-400 font-medium">Protocol:</span>
                  <span className="text-blue-400 font-bold">WebRTC</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-400 font-medium">Transport:</span>
                  <span className="text-green-400 font-bold">UDP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transcript & Performance */}
          <div className="lg:col-span-3 xl:col-span-3 2xl:col-span-4 space-y-4 sm:space-y-6">
            {/* Transcript Display */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.Network />
                Real-time Transcript
              </h2>
              <div className="space-y-4">
                {transcript && (
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Transcript:</div>
                    <div className="text-white">{transcript}</div>
                  </div>
                )}
                {aiResponse && (
                  <div className="bg-blue-900/50 p-3 rounded-lg border-l-4 border-blue-500">
                    <div className="text-sm text-blue-400 mb-1">AI Response:</div>
                    <div className="text-white">{aiResponse}</div>
                  </div>
                )}
                {!transcript && !aiResponse && (
                  <div className="text-center text-gray-500 py-8">
                    <Icons.Microphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start recording to see real-time transcript</p>
                  </div>
                )}
              </div>
            </div>

            {/* WebRTC Info */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <Icons.WebRTC />
                WebRTC Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Ultra-Low Latency</div>
                  <div className="text-white text-sm">Direct peer-to-peer communication for minimal delay</div>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">UDP Transport</div>
                  <div className="text-white text-sm">Fast, connectionless protocol for real-time audio</div>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Peer-to-Peer</div>
                  <div className="text-white text-sm">Direct connection without intermediate servers</div>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Real-time Processing</div>
                  <div className="text-white text-sm">Instant audio streaming and processing</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 sm:mt-12 text-gray-500 text-sm sm:text-base">
          <p className="mb-1">Built with React, TypeScript, WebRTC, and Web Audio API for ultra-low latency communication</p>
          <p>Backend: FastAPI + Modal | Frontend: Vite + Tailwind CSS</p>
        </footer>
      </div>


    </div>
  );
};

export default V3Dashboard; 