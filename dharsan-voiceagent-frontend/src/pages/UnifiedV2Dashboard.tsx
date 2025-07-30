import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useVoiceAgentWHIP } from '../hooks/useVoiceAgentWHIP_fixed';
import { navigateToHome, navigateToDashboard } from '../utils/navigation';

// Console log interface
interface ConsoleLog {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: Date;
  data?: any;
}

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
  Dashboard: ({ className = "w-6 h-6" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Settings: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Analytics: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Debug: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Play: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    </svg>
  ),
  Stop: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
  Status: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Layers: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Video: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Wifi: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Globe: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Microphone: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  MicrophoneOff: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  ),
  Terminal: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  X: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Trash: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Eye: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
    </svg>
  )
};

const UnifiedV2Dashboard: React.FC = () => {
  const initializedRef = useRef(false);
  const consoleOverriddenRef = useRef(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [showConsole, setShowConsole] = useState(true);
  
  // Use the real voice agent hook
  const [voiceAgentState, voiceAgentActions] = useVoiceAgentWHIP();
  
  // Local state for UI elements
  const [currentPhase, setCurrentPhase] = useState('phase5');
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Console log capture functionality
  const addConsoleLog = useCallback((type: ConsoleLog['type'], message: string, data?: any) => {
    const newLog: ConsoleLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date(),
      data
    };
    
    setConsoleLogs(prev => {
      const updated = [...prev, newLog];
      // Keep only last 50 logs to prevent memory issues
      return updated.slice(-50);
    });
  }, []);

  // Override console methods to capture logs (only once)
  useEffect(() => {
    if (consoleOverriddenRef.current) return; // Prevent multiple overrides
    
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      addConsoleLog('log', args.join(' '), args);
    };

    console.info = (...args) => {
      originalConsole.info(...args);
      addConsoleLog('info', args.join(' '), args);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addConsoleLog('warn', args.join(' '), args);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addConsoleLog('error', args.join(' '), args);
    };

    console.debug = (...args) => {
      originalConsole.debug(...args);
      addConsoleLog('debug', args.join(' '), args);
    };

    consoleOverriddenRef.current = true;

    // Restore original console methods on cleanup
    return () => {
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.debug = originalConsole.debug;
      consoleOverriddenRef.current = false;
    };
  }, [addConsoleLog]);

  // Initialize the dashboard
  useEffect(() => {
    if (initializedRef.current) return;
    
    console.log('🚀 [INIT] Unified V2 Dashboard initialized with real voice agent', { currentPhase });
    console.log('🔧 [CONFIG] Current phase configuration loaded', { phase: currentPhase });
    console.log('📊 [METRICS] Performance monitoring enabled', { phase: currentPhase });
    console.log('🎯 [STATUS] Ready for voice interactions', { phase: currentPhase });
    
    initializedRef.current = true;
  }, [currentPhase]);

  const clearConsoleLogs = () => {
    setConsoleLogs([]);
  };

  const getLogTypeColor = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'log': return 'text-gray-300';
      case 'info': return 'text-blue-400';
      case 'warn': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'debug': return 'text-purple-400';
      default: return 'text-gray-300';
    }
  };

  const getLogTypeLabel = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'log': return 'LOG';
      case 'info': return 'INFO';
      case 'warn': return 'WARN';
      case 'error': return 'ERROR';
      case 'debug': return 'DEBUG';
      default: return 'LOG';
    }
  };

  const handlePhaseChange = (phase: string) => {
    console.log(`🔄 [PHASE] Switching to phase: ${phase}`);
    setCurrentPhase(phase);
    setTheme(phase);
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'phase1':
        return 'from-blue-600 to-blue-700';
      case 'phase2':
        return 'from-green-600 to-green-700';
      case 'phase5':
        return 'from-purple-600 to-purple-700';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getPhaseBorderColor = (phase: string) => {
    switch (phase) {
      case 'phase1':
        return 'border-blue-500';
      case 'phase2':
        return 'border-green-500';
      case 'phase5':
        return 'border-purple-500';
      default:
        return 'border-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-2">
      {/* Header */}
      <header className="mb-4">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-4">
          <div className="flex items-center justify-between">
            {/* Left: Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateToHome()}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                title="Go to Home"
              >
                <Icons.Home className="w-5 h-5 text-gray-300" />
              </button>
              <button
                onClick={() => navigateToDashboard()}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                title="Go to Dashboard"
              >
                <Icons.Dashboard className="w-6 h-6 text-gray-300" />
              </button>
              <div className="text-xl font-bold text-white">Voice Agent V2</div>
            </div>

            {/* Center: Status Indicators */}
            <div className="flex items-center gap-6">
              {/* Voice Status */}
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-400">Voice</div>
                  <div className={`text-xs font-bold ${voiceAgentState.isListening ? 'text-green-400' : 'text-gray-400'}`}>
                    {voiceAgentState.isListening ? 'LISTENING' : 'IDLE'}
                  </div>
                </div>
                <div className="w-16 bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${voiceAgentState.audioLevel}%` }}
                  ></div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Status</div>
                  <div className={`text-xs font-bold ${
                    voiceAgentState.connectionStatus === 'connected' ? 'text-green-400' :
                    voiceAgentState.connectionStatus === 'connecting' ? 'text-blue-400' :
                    voiceAgentState.connectionStatus === 'error' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {voiceAgentState.connectionStatus.toUpperCase()}
                  </div>
                </div>
              </div>
              
              {/* KPIs */}
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <div className="text-xs text-gray-400">Audio</div>
                  <div className="text-xs font-bold text-cyan-400">{Math.round(voiceAgentState.audioLevel)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Qual</div>
                  <div className="text-xs font-bold text-green-400">{voiceAgentState.connectionQuality}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Session</div>
                  <div className="text-xs font-bold text-blue-400">{voiceAgentState.sessionId ? 'ACTIVE' : 'NONE'}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Version</div>
                  <div className="text-xs font-bold text-yellow-400">{voiceAgentState.version}</div>
                </div>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2">
              {/* Phase Indicator */}
              <div className={`px-3 py-1 rounded bg-gradient-to-r ${getPhaseColor(currentPhase)} border ${getPhaseBorderColor(currentPhase)}`}>
                <span className="text-white font-medium text-sm">{currentPhase.toUpperCase()}</span>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  voiceAgentState.connectionStatus === 'connected' ? 'bg-green-400' :
                  voiceAgentState.connectionStatus === 'connecting' ? 'bg-yellow-400' :
                  voiceAgentState.connectionStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs text-gray-400">Voice</span>
              </div>

              {/* Control Buttons */}
              <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                title="Toggle Debug Panel"
              >
                <Icons.Debug className="w-5 h-5 text-gray-300" />
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                title="Toggle Analytics"
              >
                <Icons.Analytics className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Voice Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Voice Control Panel */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Icons.Microphone className="w-5 h-5 text-cyan-400" />
              Voice Controls
            </h3>
            
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Connection:</span>
                <span className={`font-medium ${
                  voiceAgentState.connectionStatus === 'connected' ? 'text-green-400' :
                  voiceAgentState.connectionStatus === 'connecting' ? 'text-yellow-400' :
                  voiceAgentState.connectionStatus === 'error' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {voiceAgentState.connectionStatus.toUpperCase()}
                </span>
              </div>

              {/* Session ID */}
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Session:</span>
                <span className="text-gray-400 font-mono text-sm">
                  {voiceAgentState.sessionId || 'None'}
                </span>
              </div>

              {/* Audio Level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Audio Level:</span>
                  <span className="text-cyan-400 font-medium">{Math.round(voiceAgentState.audioLevel)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${voiceAgentState.audioLevel}%` }}
                  ></div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-2">
                {!voiceAgentState.isConnected ? (
                  <button
                    onClick={voiceAgentActions.connect}
                    disabled={voiceAgentState.isConnecting}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {voiceAgentState.isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Icons.Play className="w-4 h-4" />
                        Connect
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={voiceAgentActions.disconnect}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Icons.Stop className="w-4 h-4" />
                    Disconnect
                  </button>
                )}
              </div>

              {voiceAgentState.isConnected && (
                <div className="flex gap-2">
                  {!voiceAgentState.isListening ? (
                    <button
                      onClick={voiceAgentActions.startListening}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Icons.Microphone className="w-4 h-4" />
                      Start Listening
                    </button>
                  ) : (
                    <button
                      onClick={voiceAgentActions.stopListening}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Icons.MicrophoneOff className="w-4 h-4" />
                      Stop Listening
                    </button>
                  )}
                </div>
              )}

              {/* Error Display */}
              {voiceAgentState.error && (
                <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
                  <div className="text-red-400 text-sm font-medium">Error:</div>
                  <div className="text-red-300 text-sm">{voiceAgentState.error}</div>
                </div>
              )}
            </div>
          </div>

          {/* Conversation History */}
          {voiceAgentState.conversationHistory.length > 0 && (
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Conversation History</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {voiceAgentState.conversationHistory.map((message) => (
                  <div key={message.id} className={`p-3 rounded-lg ${
                    message.type === 'user' ? 'bg-blue-900/30 border border-blue-500/30' : 'bg-green-900/30 border border-green-500/30'
                  }`}>
                    <div className="text-xs text-gray-400 mb-1">
                      {message.type === 'user' ? 'User' : 'AI'} • {message.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="text-sm text-gray-200">{message.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center Column: Transcript & Response */}
        <div className="lg:col-span-2 space-y-4">
          {/* Transcript */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Icons.Terminal className="w-5 h-5 text-blue-400" />
              Live Transcript
            </h3>
            <div className="bg-gray-900/50 rounded-lg p-4 min-h-32">
              {voiceAgentState.transcript ? (
                <div className="text-gray-200 font-mono text-sm whitespace-pre-wrap">
                  {voiceAgentState.transcript}
                </div>
              ) : (
                <div className="text-gray-500 italic">No transcript available...</div>
              )}
            </div>
          </div>

          {/* AI Response */}
          {voiceAgentState.aiResponse && (
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Icons.Status className="w-5 h-5 text-green-400" />
                AI Response
              </h3>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-gray-200 font-mono text-sm whitespace-pre-wrap">
                  {voiceAgentState.aiResponse}
                </div>
              </div>
            </div>
          )}

          {/* Console Logs */}
          {showConsole && (
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Icons.Terminal className="w-5 h-5 text-purple-400" />
                  Console Logs
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowConsole(false)}
                    className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                    title="Hide Console"
                  >
                    <Icons.EyeOff className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={clearConsoleLogs}
                    className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                    title="Clear Logs"
                  >
                    <Icons.Trash className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs">
                {consoleLogs.length === 0 ? (
                  <div className="text-gray-500 italic">No logs available...</div>
                ) : (
                  consoleLogs.map((log) => (
                    <div key={log.id} className="mb-1">
                      <span className="text-gray-500">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <span className={`ml-2 font-bold ${getLogTypeColor(log.type)}`}>
                        [{getLogTypeLabel(log.type)}]
                      </span>
                      <span className="ml-2 text-gray-300">
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show Console Button (when hidden) */}
      {!showConsole && (
        <button
          onClick={() => setShowConsole(true)}
          className="fixed bottom-4 right-4 p-3 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-2xl border border-gray-700/50 hover:bg-gray-700/80 transition-colors"
          title="Show Console"
        >
          <Icons.Eye className="w-5 h-5 text-gray-300" />
        </button>
      )}
    </div>
  );
};

export default UnifiedV2Dashboard;