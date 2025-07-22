import { useState } from 'react';
import { useVoiceAgent } from './hooks/useVoiceAgent';
import { WordHighlightDisplay } from './components/WordHighlightDisplay';
import { SessionAnalytics } from './components/analytics/SessionAnalytics';
import VersionSwitcher from './components/VersionSwitcher';
import VoiceAgentV2 from './components/VoiceAgentV2';
import VoiceAgentWebRTC from './components/VoiceAgentWebRTC';

// Premium SVG Icons
interface IconProps {
  className?: string;
}

const Icons = {
  Controls: ({ className = "w-6 h-6" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  SystemStatus: ({ className = "w-6 h-6" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    </svg>
  ),
  AdvancedFeatures: ({ className = "w-6 h-6" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.5 2.54l2.6 1.53c.56-1.24.9-2.62.9-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
    </svg>
  ),
  Transcript: ({ className = "w-6 h-6" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
  Network: ({ className = "w-6 h-6" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  ),
  Target: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
    </svg>
  )
};

// Reusable component for displaying stats
const StatCard = ({ title, value, unit = '', color = 'text-white', subtitle = '' }: {
  title: string;
  value: number;
  unit?: string;
  color?: string;
  subtitle?: string;
}) => (
  <div className="bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl text-center border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
    <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">{title}</p>
    <p className={`text-3xl font-bold ${color} group-hover:scale-110 transition-transform duration-300`}>
      {value}{unit}
    </p>
    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

const BufferVisualizer = ({ size, capacity, isPlaying }: {
  size: number;
  capacity: number;
  isPlaying: boolean;
}) => {
  const percentage = (size / capacity) * 100;
  return (
    <div className="bg-gray-800/60 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-gray-700/50 shadow-lg">
      <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <Icons.AdvancedFeatures />
        Audio Buffer
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-gray-400 font-medium">Buffer Size:</span>
          <span className="font-bold text-white">{size} / {capacity}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${isPlaying ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-gray-400 font-medium">Status:</span>
          <span className={`font-bold ${isPlaying ? 'text-green-400' : 'text-gray-400'}`}>
            {isPlaying ? 'Playing' : 'Idle'}
          </span>
        </div>
      </div>
    </div>
  );
};

const NetworkQualityIndicator = ({ latency, jitter, packetLoss }: {
  latency: number;
  jitter: number;
  packetLoss: number;
}) => {
  const getQualityColor = (value: number, thresholds: [number, number, number]) => {
    if (value <= thresholds[0]) return 'text-green-400';
    if (value <= thresholds[1]) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getQualityText = (value: number, thresholds: [number, number, number]) => {
    if (value <= thresholds[0]) return 'Excellent';
    if (value <= thresholds[1]) return 'Good';
    return 'Poor';
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <Icons.Network />
        Network Quality
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-gray-400 font-medium">Latency:</span>
          <span className={`font-bold ${getQualityColor(latency, [50, 100, 200])}`}>
            {latency}ms ({getQualityText(latency, [50, 100, 200])})
          </span>
        </div>
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-gray-400 font-medium">Jitter:</span>
          <span className={`font-bold ${getQualityColor(jitter, [10, 25, 50])}`}>
            {jitter}ms ({getQualityText(jitter, [10, 25, 50])})
          </span>
        </div>
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-gray-400 font-medium">Packet Loss:</span>
          <span className={`font-bold ${getQualityColor(packetLoss, [1, 5, 10])}`}>
            {packetLoss}% ({getQualityText(packetLoss, [1, 5, 10])})
          </span>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [currentVersion, setCurrentVersion] = useState<'v1' | 'v2' | 'webrtc'>('v1');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleVersionChange = (version: 'v1' | 'v2' | 'webrtc') => {
    setCurrentVersion(version);
  };

  // V1 Voice Agent
  const v1VoiceAgent = useVoiceAgent();
  const {
    connectionStatus,
    listeningState,
    isVoiceActive,
    interimTranscript,
    finalTranscripts,
    currentSpokenWordIndex,
    aiResponse,
    networkStats,
    errorStats,
    recoveryInfo,
    bufferInfo,
    connect,
    disconnect,
    clearTranscripts,
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
      default:
        return { 
          text: 'Disconnected', 
          color: 'bg-red-500', 
          icon: <Icons.Error />, 
          bgGradient: 'from-red-500 to-red-600' 
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans overflow-x-hidden">
      {/* Analytics Modal */}
      {showAnalytics && <SessionAnalytics onClose={() => setShowAnalytics(false)} />}
      
      <div className="w-full max-w-none px-4 py-6 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <header className="text-center mb-8 lg:mb-12 relative">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-3 animate-pulse">
            Real-Time Voice AI Agent
          </h1>
          <p className="text-gray-400 text-base sm:text-lg lg:text-xl mb-2">Technical Demonstration for smallest.ai</p>
          <p className="text-gray-500 text-sm sm:text-base">Advanced Features Showcase</p>
          
          {/* Version Switcher */}
          <div className="mt-6 mb-8">
            <VersionSwitcher 
              currentVersion={currentVersion} 
              onVersionChange={handleVersionChange} 
            />
          </div>
          
          {/* Analytics Button */}
          <button 
            onClick={() => setShowAnalytics(true)}
            className="absolute top-0 right-0 bg-gray-700/80 hover:bg-gray-600/80 text-white font-medium py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 backdrop-blur-sm border border-gray-600/50 hover:border-gray-500/50 text-xs sm:text-sm"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </button>
        </header>

        {/* Conditional Rendering based on Version */}
        {currentVersion === 'v1' ? (
          /* V1 Dashboard */
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
                      ? <><Icons.Stop /> Stop Conversation</>
                      : <><Icons.Play /> Start Conversation</>
                  }
                </button>
                
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600/30">
                  <p className="text-xs text-gray-400 mb-1">Status: <span className="text-cyan-400 font-medium">{connectionStatus}</span></p>
                  <p className="text-xs text-gray-400">Backend: <span className="text-green-400 font-mono text-xs break-all">{import.meta.env.VITE_WEBSOCKET_URL}</span></p>
                </div>
              </div>

              {/* System Status Panel */}
              <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                  <Icons.SystemStatus />
                  System Status
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl border border-gray-600/30 hover:bg-gray-700/70 transition-all duration-300">
                    <span className="text-gray-300 font-medium text-sm sm:text-base">Agent State:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${statusInfo.bgGradient} shadow-lg`}></div>
                      <span className="font-bold text-sm sm:text-base flex items-center gap-1">
                        {statusInfo.icon} {statusInfo.text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl border border-gray-600/30 hover:bg-gray-700/70 transition-all duration-300">
                    <span className="text-gray-300 font-medium text-sm sm:text-base">Voice Activity:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${isVoiceActive ? 'bg-red-500 animate-pulse' : 'bg-gray-600'} transition-all duration-300`}></div>
                      <span className="font-bold text-sm sm:text-base flex items-center gap-1">
                        {isVoiceActive ? <><Icons.Microphone /> Detected</> : <><Icons.Speaker /> Silent</>}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl border border-gray-600/30 hover:bg-gray-700/70 transition-all duration-300">
                    <span className="text-gray-300 font-medium text-sm sm:text-base">Error Recovery:</span>
                    <span className={`font-bold text-sm sm:text-base flex items-center gap-1 ${recoveryInfo.isRecovering ? 'text-yellow-400' : 'text-green-400'}`}>
                      {recoveryInfo.isRecovering ? <><Icons.Loading /> Recovering</> : <><Icons.Check /> Stable</>}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                  <Icons.Target />
                  Performance
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <StatCard 
                    title="Latency" 
                    value={networkStats.averageLatency} 
                    unit="ms"
                    color={networkStats.averageLatency > 200 ? 'text-red-400' : networkStats.averageLatency > 100 ? 'text-yellow-400' : 'text-green-400'}
                    subtitle={networkStats.averageLatency > 200 ? 'High' : networkStats.averageLatency > 100 ? 'Medium' : 'Low'}
                  />
                  <StatCard 
                    title="Jitter" 
                    value={networkStats.jitter} 
                    unit="ms"
                    color={networkStats.jitter > 50 ? 'text-red-400' : networkStats.jitter > 25 ? 'text-yellow-400' : 'text-green-400'}
                    subtitle={networkStats.jitter > 50 ? 'High' : networkStats.jitter > 25 ? 'Medium' : 'Low'}
                  />
                  <StatCard 
                    title="Packet Loss" 
                    value={networkStats.packetLoss} 
                    unit="%"
                    color={networkStats.packetLoss > 5 ? 'text-red-400' : networkStats.packetLoss > 1 ? 'text-yellow-400' : 'text-green-400'}
                    subtitle={networkStats.packetLoss > 5 ? 'High' : networkStats.packetLoss > 1 ? 'Medium' : 'Low'}
                  />
                  <StatCard 
                    title="Buffer Delay" 
                    value={networkStats.jitterBufferDelay} 
                    unit="ms"
                    color={networkStats.jitterBufferDelay > 150 ? 'text-yellow-400' : 'text-green-400'}
                    subtitle={networkStats.jitterBufferDelay > 150 ? 'High' : 'Low'}
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <BufferVisualizer 
                    size={bufferInfo.size} 
                    capacity={bufferInfo.capacity}
                    isPlaying={bufferInfo.isPlaying}
                  />
                  
                  <div className="bg-gray-800/60 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-gray-700/50 shadow-lg">
                    <NetworkQualityIndicator 
                      latency={networkStats.averageLatency}
                      jitter={networkStats.jitter}
                      packetLoss={networkStats.packetLoss}
                    />
                    
                    <div className="mt-4 pt-4 border-t border-gray-600/30">
                      <div className="flex justify-between text-sm sm:text-base mb-2">
                        <span className="text-gray-400 font-medium">Total Errors:</span>
                        <span className={`font-bold ${errorStats.totalErrors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {errorStats.totalErrors}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-400 font-medium">Recent Errors:</span>
                        <span className={`font-bold ${errorStats.recentErrors > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {errorStats.recentErrors}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Transcript & Performance */}
            <div className="lg:col-span-3 xl:col-span-3 2xl:col-span-4 space-y-4 sm:space-y-6">
              {/* Live Transcript Panel */}
              <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-cyan-400 flex items-center gap-2">
                    <Icons.Transcript />
                    Live Transcript
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="px-2 py-1 bg-gray-700/50 rounded-full">
                      {finalTranscripts.length} exchanges
                    </span>
                    {interimTranscript && (
                      <span className="px-2 py-1 bg-yellow-600/30 text-yellow-300 rounded-full animate-pulse">
                        Processing...
                      </span>
                    )}
                  </div>
                </div>
                
                                 <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
                   {finalTranscripts.map((transcript, index) => (
                     <div key={index} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/30">
                       <div className="mb-3">
                         <p className="text-sm text-gray-400 mb-1">You said:</p>
                         <p className="text-white font-medium">{transcript.text}</p>
                       </div>
                     </div>
                   ))}
                  
                  {interimTranscript && (
                    <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4">
                      <p className="text-sm text-yellow-400 mb-1">Processing:</p>
                      <p className="text-yellow-300 font-medium">{interimTranscript}</p>
                    </div>
                  )}
                  
                  {finalTranscripts.length === 0 && !interimTranscript && (
                    <div className="text-center py-8 text-gray-500">
                      <Icons.Microphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Start speaking to see your transcript here...</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={clearTranscripts}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                  >
                    Clear Transcript
                  </button>
                  <div className="text-xs text-gray-400">
                    {finalTranscripts.length > 0 && (
                      <span>Last exchange: {new Date().toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>
              </div>

                             {/* Word Highlight Display */}
               <WordHighlightDisplay 
                 finalTranscripts={finalTranscripts}
                 currentSpokenWordIndex={currentSpokenWordIndex}
                 interimTranscript={interimTranscript}
                 aiResponse={aiResponse}
                 className=""
               />
            </div>
          </div>
        ) : currentVersion === 'v2' ? (
          /* V2 Dashboard */
          <VoiceAgentV2 />
        ) : (
          /* WebRTC Dashboard */
          <VoiceAgentWebRTC />
        )}

        {/* Footer */}
        <footer className="text-center mt-8 sm:mt-12 text-gray-500 text-sm sm:text-base">
          <p className="mb-1">Built with React, TypeScript, Web Audio API, and WebSocket for real-time communication</p>
          <p>Backend: FastAPI + Modal | Frontend: Vite + Tailwind CSS</p>
        </footer>
      </div>

      {/* Enhanced Custom scrollbar styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6b7280, #4b5563);
          border-radius: 4px;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #9ca3af, #6b7280);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, #d1d5db, #9ca3af);
        }
        
        /* Firefox scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #6b7280 rgba(55, 65, 81, 0.5);
        }
        
        /* Smooth scrolling for all browsers */
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        
        /* Custom animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
