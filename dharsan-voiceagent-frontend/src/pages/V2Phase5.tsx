import React, { useState, useEffect } from 'react';
import { navigateToHome } from '../utils/navigation';
import { scrollbarStyles } from '../utils/uiUtils';
import { useVoiceAgentV2 } from '../hooks/useVoiceAgentV2';
import TestStepsModal from '../components/TestStepsModal';
import HealthCheckModal from '../components/HealthCheckModal';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import ControlsPanel from '../components/dashboard/ControlsPanel';
import ConversationLogs from '../components/dashboard/ConversationLogs';
import PhaseTimings from '../components/dashboard/PhaseTimings';
import { Icons } from '../components/ui/Icons';
import { getStatusColor, getButtonColor } from '../utils/uiUtils';

const V2Phase5: React.FC = () => {
  const [showTestSteps, setShowTestSteps] = useState(false);
  const [showHealthCheck, setShowHealthCheck] = useState(false);
  const [useEventDriven, setUseEventDriven] = useState(true);
  const [isProduction, setIsProduction] = useState(true);
  const [stepStatus, setStepStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  
  // Real timing tracking for pipeline phases
  const [phaseTimings, setPhaseTimings] = useState({
    stt: 0,
    llm: 0,
    tts: 0
  });
  const [timingStartTimes, setTimingStartTimes] = useState({
    stt: 0,
    llm: 0,
    tts: 0
  });

  // Initialize production state from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productionParam = urlParams.get('production');
    if (productionParam === 'true') {
      setIsProduction(true);
    }
  }, []);

  // Use the real voice agent V2 hook with actual audio capture
  const {
    connectionStatus,
    processingStatus,
    sessionId,
    transcript,
    interimTranscript,
    aiResponse,
    error,
    version,
    isRecording,
    networkStats,
    sessionInfo,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendMessage,
    clearTranscript,
    clearError,
    websocketRef,
    triggerFinalMessage
  } = useVoiceAgentV2();

  // Map useVoiceAgentV2 state to component expectations
  const isListening = isRecording;
  const isProcessing = processingStatus === 'processing';
  const hasAudioData = transcript.length > 0;
  
  // Audio level tracking
  const [audioLevel, setAudioLevel] = useState(0);
  const [speakerLevel, setSpeakerLevel] = useState(0);
  
  // Update audio levels based on processing status
  useEffect(() => {
    if (isListening) {
      // Simulate microphone activity when listening
      const interval = setInterval(() => {
        // More realistic microphone levels with some variation
        const baseLevel = Math.random() * 25 + 5; // 5-30% base level
        const variation = Math.sin(Date.now() / 500) * 10; // Add some wave pattern
        setAudioLevel(Math.max(0, Math.min(100, baseLevel + variation)));
      }, 50);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isListening]);
  
  // Update speaker level when TTS is playing
  useEffect(() => {
    if (processingStatus === 'speaking') {
      const interval = setInterval(() => {
        // More realistic speaker levels during TTS playback
        const baseLevel = Math.random() * 35 + 15; // 15-50% base level
        const variation = Math.sin(Date.now() / 300) * 15; // Add wave pattern
        setSpeakerLevel(Math.max(0, Math.min(100, baseLevel + variation)));
      }, 50);
      return () => clearInterval(interval);
    } else {
      setSpeakerLevel(0);
    }
  }, [processingStatus]);
  
  // Map processing status to pipeline status for UI compatibility
  const pipelineStatus = processingStatus === 'listening' || processingStatus === 'processing' || processingStatus === 'speaking' ? 'active' : 'idle';
  
  // Map connection status to exclude 'error' for ControlsPanel compatibility
  const controlsConnectionStatus = connectionStatus === 'error' ? 'disconnected' : connectionStatus;

  // Auto-connect on component mount if production mode - TEMPORARILY DISABLED FOR DEBUGGING
  useEffect(() => {
    console.log('V2Phase5 Auto-connect effect - isProduction:', isProduction, 'connectionStatus:', connectionStatus);
    // if (isProduction && connectionStatus === 'disconnected') {
    //   connect();
    // }
  }, [isProduction, connectionStatus, connect]);

  // Track timing for pipeline phases
  useEffect(() => {
    if (processingStatus === 'processing') {
      // Start timing for STT phase
      setTimingStartTimes(prev => ({ ...prev, stt: Date.now() }));
    } else if (processingStatus === 'speaking') {
      // STT completed, start LLM timing
      setTimingStartTimes(prev => {
        if (prev.stt > 0) {
          const sttDuration = Date.now() - prev.stt;
          setPhaseTimings(phasePrev => ({ ...phasePrev, stt: sttDuration }));
          return { ...prev, llm: Date.now() };
        }
        return prev;
      });
    } else if (processingStatus === 'idle' && timingStartTimes.tts > 0) {
      // TTS completed, calculate final timings
      const ttsDuration = Date.now() - timingStartTimes.tts;
      setPhaseTimings(phasePrev => ({ ...phasePrev, tts: ttsDuration }));
      setTimingStartTimes({ stt: 0, llm: 0, tts: 0 }); // Reset timing start times
    }
  }, [processingStatus, timingStartTimes.tts]);

  // Handle LLM completion (when we receive aiResponse)
  useEffect(() => {
    if (aiResponse && timingStartTimes.llm > 0) {
      const llmDuration = Date.now() - timingStartTimes.llm;
      setPhaseTimings(phasePrev => ({ ...phasePrev, llm: llmDuration }));
      setTimingStartTimes(prev => ({ ...prev, tts: Date.now() }));
    }
  }, [aiResponse, timingStartTimes.llm]);

  // Conversation logs management
  const [conversationLogs, setConversationLogs] = useState<string[]>([]);

  const addConversationLog = (message: string) => {
    setConversationLogs(prev => [...prev, message]);
  };

  // Add transcript to conversation when it changes
  useEffect(() => {
    if (transcript && transcript.trim()) {
      addConversationLog(`User: ${transcript}`);
    }
  }, [transcript]);

  // Add AI response to conversation when it changes
  useEffect(() => {
    if (aiResponse && aiResponse.trim()) {
      addConversationLog(`AI: ${aiResponse}`);
    }
  }, [aiResponse]);

  // Handle greeting received event
  useEffect(() => {
    const handleGreetingReceived = (event: CustomEvent) => {
      console.log('V2Phase5 Greeting received:', event.detail);
      addConversationLog(`Greeting: ${event.detail.text}`);
    };

    window.addEventListener('greetingReceived', handleGreetingReceived as EventListener);
    return () => {
      window.removeEventListener('greetingReceived', handleGreetingReceived as EventListener);
    };
  }, []);

  const getStatusDot = (status: boolean) => (
    <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-400' : 'bg-red-400'}`}></div>
  );

  const handleToggleProduction = () => {
    setIsProduction(!isProduction);
    if (connectionStatus === 'connected') {
      disconnect();
    }
  };

  const handleToggleMode = (newUseEventDriven: boolean) => {
    setUseEventDriven(newUseEventDriven);
    if (connectionStatus === 'connected') {
      disconnect();
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
      addConversationLog('Connected to voice agent');
    } catch (error) {
      console.error('Failed to connect:', error);
      addConversationLog('Connection failed');
    }
  };

  const handleStartListening = async () => {
    try {
      await startRecording();
      addConversationLog('Started listening');
    } catch (error) {
      console.error('Failed to start listening:', error);
      addConversationLog('Failed to start listening');
    }
  };

  const handleStopListening = () => {
    stopRecording();
    addConversationLog('Stopped listening');
  };

  const handleGetAnswer = () => {
    // Use the hook's triggerFinalMessage function to send final message
    triggerFinalMessage();
    console.log('V2 Sent final message via Get Answer button');
    setConversationLogs(prev => [...prev, `Triggered AI processing pipeline`]);
  };

  const getEnvironmentUrl = () => isProduction ? 'ws://34.70.216.41:8001/ws' : 'ws://localhost:8001/ws';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Inject custom scrollbar styles */}
      <style>{scrollbarStyles}</style>

      {/* Dashboard Header */}
      <DashboardHeader
        isProduction={isProduction}
        useEventDriven={useEventDriven}
        pipelineStatus={pipelineStatus}
        stepStatus={stepStatus}
        onToggleProduction={handleToggleProduction}
        onToggleMode={handleToggleMode}
        getEnvironmentUrl={getEnvironmentUrl}
      />

      {/* Main Content - Simplified Layout */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Controls & Debug */}
          <div className="space-y-6">
            <ControlsPanel
              connectionStatus={controlsConnectionStatus}
              useEventDriven={useEventDriven}
              audioLevel={audioLevel}
              speakerLevel={speakerLevel}
              onConnect={handleConnect}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              onGetAnswer={handleGetAnswer}
              isListening={isListening}
              isProcessing={isProcessing}
              hasAudioData={hasAudioData}
            />

            {/* Debug Card - Moved from right column */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Icons.Status className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Debug</h3>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowTestSteps(true)}
                  className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('danger')}`}
                >
                  <Icons.Status className="w-5 h-5" />
                  <span>Test Steps</span>
                </button>
                <button 
                  onClick={() => setShowHealthCheck(true)}
                  className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('primary')}`}
                >
                  <Icons.BarChart3 className="w-5 h-5" />
                  <span>Health Check</span>
                </button>
                <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('secondary')}`}>
                  <Icons.Activity className="w-5 h-5" />
                  <span>Audio Stats</span>
                </button>
              </div>
            </div>
          </div>

          {/* Middle Column - Main Features */}
          <div className="space-y-6">
            {/* Voice Conversation Card with Phase Timings */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Icons.Mic className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Voice Conversation</h3>
                </div>
              </div>
              
              {/* Phase Timings Component */}
              <PhaseTimings phaseTimings={phaseTimings} />

              {/* Session Info Card */}
              {sessionId && (
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Icons.Wifi className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Session Info</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Session ID:</span>
                      <span className="font-mono text-green-400 text-sm">{sessionId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Status:</span>
                      <span className={`font-medium ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                        {connectionStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Environment:</span>
                      <span className={`font-medium ${isProduction ? 'text-orange-400' : 'text-blue-400'}`}>
                        {isProduction ? 'PRODUCTION' : 'LOCAL'}
                      </span>
                    </div>
                    {transcript && (
                      <div className="mt-3">
                        <span className="text-gray-300">Last Transcript:</span>
                        <div className="mt-1 p-2 bg-gray-700/30 rounded text-cyan-400 text-sm">{transcript}</div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* Live Voice Conversation with AI Responses */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Icons.MessageSquare className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Live Voice Conversation</h3>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {/* User Input */}
                  {transcript && (
                    <div className="flex justify-end">
                      <div className="bg-blue-600/30 border border-blue-500/30 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-white">{transcript}</p>
                        <p className="text-xs text-blue-300 mt-1">You</p>
                      </div>
                    </div>
                  )}
                  
                  {/* AI Response */}
                  {aiResponse && (
                    <div className="flex justify-start">
                      <div className="bg-green-600/30 border border-green-500/30 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-white">{aiResponse}</p>
                        <p className="text-xs text-green-300 mt-1">AI Assistant</p>
                      </div>
                    </div>
                  )}
                  
                  {/* System Messages */}
                  {conversationLogs.length > 0 && (
                    conversationLogs.map((log, index) => (
                      <div key={index} className="flex justify-center">
                        <div className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-2">
                          <p className="text-xs text-gray-400">{log}</p>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* Empty State */}
                  {!transcript && !aiResponse && conversationLogs.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No conversation yet</p>
                      <p className="text-sm text-gray-500 mt-1">Connect and start speaking to begin</p>
                    </div>
                  )}
                </div>
              </div>
            </div>


          </div>

          {/* Right Column - System Status Only */}
          <div className="space-y-6">
            
            {/* System Status Card */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Icons.BarChart3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">System Status</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Connections</h4>
                  <div className="space-y-2">
                    {useEventDriven ? (
                      // Event-Driven Connection Status
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">WebSocket</span>
                          {getStatusDot(connectionStatus === 'connected')}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Session</span>
                          {getStatusDot(pipelineStatus === 'active')}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Audio Stream</span>
                          {getStatusDot(stepStatus === 'listening')}
                        </div>
                      </>
                    ) : (
                      // WHIP WebRTC Connection Status
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">WHIP</span>
                          {getStatusDot(connectionStatus === 'connected')}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">WebRTC</span>
                          {getStatusDot(pipelineStatus === 'active')}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Audio Processing</span>
                          {getStatusDot(stepStatus === 'listening')}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Services</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">STT</span>
                      {getStatusDot(stepStatus === 'processing')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">LLM</span>
                      {getStatusDot(stepStatus === 'processing')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">TTS</span>
                      {getStatusDot(stepStatus === 'speaking')}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Pipeline</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Status</span>
                      {getStatusDot(pipelineStatus === 'active')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Progress</span>
                      {getStatusDot(stepStatus !== 'idle')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Cycles</span>
                      {getStatusDot(true)}
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <span className="text-2xl font-bold text-green-400">0</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>


      </main>

      {/* Test Steps Modal */}
      <TestStepsModal 
        isOpen={showTestSteps}
        onClose={() => setShowTestSteps(false)}
        mode={useEventDriven ? 'event-driven' : 'whip-webrtc'}
      />

      {/* Health Check Modal */}
      <HealthCheckModal 
        isOpen={showHealthCheck}
        onClose={() => setShowHealthCheck(false)}
        mode={useEventDriven ? 'event-driven' : 'whip-webrtc'}
        isProduction={isProduction}
      />
    </div>
  );
};

export default V2Phase5; 