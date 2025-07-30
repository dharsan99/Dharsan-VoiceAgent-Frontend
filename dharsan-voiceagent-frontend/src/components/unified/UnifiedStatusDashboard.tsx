import React from 'react';
import type { UnifiedStatusDashboardProps, ServiceType } from '../../types/unifiedV2';

// Icons component
interface IconProps {
  className?: string;
}

const Icons = {
  Status: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  WebRTC: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  WHIP: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  WebSocket: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Pipeline: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Performance: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  STT: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  LLM: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  TTS: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  )
};

const UnifiedStatusDashboard: React.FC<UnifiedStatusDashboardProps> = ({
  webRTC,
  whip,
  websocket,
  services,
  pipeline,
  performance
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'complete':
        return 'text-green-400';
      case 'connecting':
      case 'waiting':
      case 'executing':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'disconnected':
      case 'idle':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'complete':
        return 'bg-green-400';
      case 'connecting':
      case 'waiting':
      case 'executing':
        return 'bg-yellow-400';
      case 'error':
        return 'bg-red-400';
      case 'disconnected':
      case 'idle':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusAnimation = (status: string) => {
    switch (status) {
      case 'connected':
      case 'complete':
        return 'animate-pulse';
      case 'connecting':
      case 'waiting':
      case 'executing':
        return 'animate-ping';
      case 'error':
        return 'animate-pulse';
      case 'disconnected':
      case 'idle':
        return '';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'complete':
        return '🟢';
      case 'connecting':
      case 'waiting':
      case 'executing':
        return '🟡';
      case 'error':
        return '🔴';
      case 'disconnected':
      case 'idle':
        return '⚪';
      default:
        return '⚪';
    }
  };

  const getServiceIcon = (serviceType: ServiceType) => {
    switch (serviceType) {
      case 'stt':
        return <Icons.STT />;
      case 'llm':
        return <Icons.LLM />;
      case 'tts':
        return <Icons.TTS />;
      case 'webrtc':
        return <Icons.WebRTC />;
      case 'whip':
        return <Icons.WHIP />;
      case 'websocket':
        return <Icons.WebSocket />;
      default:
        return <Icons.Status />;
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const formatProgress = (progress: number) => {
    return `${Math.round(progress * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
        <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <Icons.Status />
          Connection Status
        </h3>
        
        <div className="space-y-4">
          {/* WebRTC Status */}
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icons.WebRTC className="text-blue-400" />
              <span className="text-gray-300 font-medium">WebRTC</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(webRTC.status).replace('text-', 'bg-')} ${getStatusAnimation(webRTC.status)}`}></div>
              <span className={`text-sm font-medium ${getStatusColor(webRTC.status)}`}>
                {webRTC.status === 'connected' ? 'Connected' : 
                 webRTC.status === 'connecting' ? 'Connecting...' : 
                 webRTC.status === 'error' ? 'Error' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* WHIP Status */}
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icons.WHIP className="text-green-400" />
              <span className="text-gray-300 font-medium">WHIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(whip.status).replace('text-', 'bg-')} ${getStatusAnimation(whip.status)}`}></div>
              <span className={`text-sm font-medium ${getStatusColor(whip.status)}`}>
                {whip.status === 'connected' ? 'Connected' : 
                 whip.status === 'connecting' ? 'Connecting...' : 
                 whip.status === 'error' ? 'Error' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* WebSocket Status */}
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icons.WebSocket className="text-cyan-400" />
              <span className="text-gray-300 font-medium">WebSocket</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(websocket.status).replace('text-', 'bg-')} ${getStatusAnimation(websocket.status)}`}></div>
              <span className={`text-sm font-medium ${getStatusColor(websocket.status)}`}>
                {websocket.status === 'connected' ? 'Connected' : 
                 websocket.status === 'connecting' ? 'Connecting...' : 
                 websocket.status === 'error' ? 'Error' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Status */}
      <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
        <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <Icons.Pipeline />
          Pipeline Status
        </h3>
        
        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 font-medium">Progress</span>
            <span className="text-cyan-400 font-bold">{formatProgress(pipeline.progress)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pipeline.progress * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Pipeline Steps */}
        <div className="space-y-3">
          {/* STT Service */}
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icons.STT className="text-blue-400" />
              <span className="text-gray-300 font-medium">STT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(services.stt.status).replace('text-', 'bg-')} ${getStatusAnimation(services.stt.status)}`}></div>
              <span className={`text-sm font-medium ${getStatusColor(services.stt.status)}`}>
                {services.stt.status === 'complete' ? 'Complete' : 
                 services.stt.status === 'executing' ? 'Processing...' : 
                 services.stt.status === 'waiting' ? 'Waiting...' : 
                 services.stt.status === 'error' ? 'Error' : 'Idle'}
              </span>
            </div>
          </div>

          {/* LLM Service */}
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icons.LLM className="text-green-400" />
              <span className="text-gray-300 font-medium">LLM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(services.llm.status).replace('text-', 'bg-')} ${getStatusAnimation(services.llm.status)}`}></div>
              <span className={`text-sm font-medium ${getStatusColor(services.llm.status)}`}>
                {services.llm.status === 'complete' ? 'Complete' : 
                 services.llm.status === 'executing' ? 'Processing...' : 
                 services.llm.status === 'waiting' ? 'Waiting...' : 
                 services.llm.status === 'error' ? 'Error' : 'Idle'}
              </span>
            </div>
          </div>

          {/* TTS Service */}
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icons.TTS className="text-purple-400" />
              <span className="text-gray-300 font-medium">TTS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(services.tts.status).replace('text-', 'bg-')} ${getStatusAnimation(services.tts.status)}`}></div>
              <span className={`text-sm font-medium ${getStatusColor(services.tts.status)}`}>
                {services.tts.status === 'complete' ? 'Complete' : 
                 services.tts.status === 'executing' ? 'Processing...' : 
                 services.tts.status === 'waiting' ? 'Waiting...' : 
                 services.tts.status === 'error' ? 'Error' : 'Idle'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Step Indicator */}
        {pipeline.isActive && (
          <div className="mt-4 p-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-400 font-medium">Current Step: {pipeline.currentStep.toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
        <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <Icons.Performance />
          Performance
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{performance.latency}ms</div>
            <div className="text-sm text-gray-400">Latency</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{performance.packetLoss}%</div>
            <div className="text-sm text-gray-400">Packet Loss</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{performance.audioQuality}%</div>
            <div className="text-sm text-gray-400">Audio Quality</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{performance.connectionUptime}%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{performance.successRate}%</div>
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{performance.processingTime}ms</div>
            <div className="text-sm text-gray-400">Processing</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedStatusDashboard;