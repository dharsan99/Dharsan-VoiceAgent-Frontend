import React, { useState, useEffect } from 'react';
import { navigateToHome } from '../utils/navigation';
import { scrollbarStyles } from '../utils/uiUtils';
import { useConnectionManager } from '../hooks/useConnectionManager';
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
  const [isProduction, setIsProduction] = useState(false);
  const [stepStatus, setStepStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  // Initialize production state from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productionParam = urlParams.get('production');
    if (productionParam === 'true') {
      setIsProduction(true);
    }
  }, []);

  // Use the connection manager hook
  const {
    connectionStatus,
    pipelineStatus,
    phaseTimings,
    isListening,
    isProcessing,
    hasAudioData,
    audioLevel,
    establishConnection,
    updateMetrics,
    toggleProduction,
    startListening,
    stopListening,
    triggerLLM,
    getEnvironmentUrl
  } = useConnectionManager(isProduction, useEventDriven);

  // Initial conversation logs
  useEffect(() => {
    // Add initial logs through the connection manager
    // This will be handled by the hook
  }, [useEventDriven, isProduction]);

  const getStatusDot = (status: boolean) => (
    <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></div>
  );

  const handleToggleProduction = () => {
    setIsProduction(!isProduction);
    toggleProduction();
  };

  const handleToggleMode = (newUseEventDriven: boolean) => {
    setUseEventDriven(newUseEventDriven);
  };

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
          
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <ControlsPanel
              connectionStatus={connectionStatus}
              useEventDriven={useEventDriven}
              audioLevel={audioLevel}
              onConnect={establishConnection}
              onStartListening={startListening}
              onStopListening={stopListening}
              onTriggerLLM={triggerLLM}
              isListening={isListening}
              isProcessing={isProcessing}
              hasAudioData={hasAudioData}
            />

            {/* Pipeline Card */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Icons.Play className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Pipeline</h3>
              </div>
              <div className="space-y-3">
                {useEventDriven ? (
                  // Event-Driven Pipeline Controls
                  <>
                    <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('primary')}`}>
                      <Icons.Play className="w-5 h-5" />
                      <span>Start Session</span>
                    </button>
                    <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('secondary', true)}`}>
                      <Icons.Stop className="w-5 h-5" />
                      <span>Stop Session</span>
                    </button>
                    <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('purple')}`}>
                      <Icons.FileText className="w-5 h-5" />
                      <span>Process Transcript</span>
                    </button>
                  </>
                ) : (
                  // WHIP WebRTC Pipeline Controls
                  <>
                    <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('primary')}`}>
                      <Icons.Play className="w-5 h-5" />
                      <span>Connect WHIP</span>
                    </button>
                    <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('secondary', true)}`}>
                      <Icons.Stop className="w-5 h-5" />
                      <span>Disconnect</span>
                    </button>
                    <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('purple')}`}>
                      <Icons.FileText className="w-5 h-5" />
                      <span>AI Processing</span>
                    </button>
                  </>
                )}
              </div>
              <div className="mt-4">
                <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('warning')}`}>
                  <Icons.RefreshCw className="w-5 h-5" />
                  <span>Reset Pipeline</span>
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

              {/* Backend Conversation Logs */}
              <ConversationLogs 
                isProduction={isProduction}
                pipelineStatus={pipelineStatus}
              />
            </div>

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

          {/* Right Column - Debug & Actions */}
          <div className="space-y-6">
            
            {/* Debug Card */}
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

            {/* Quick Actions Card */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Icons.Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                {useEventDriven ? (
                  // Event-Driven Quick Actions
                  <>
                    <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('secondary', true)}`}>
                      <Icons.Stop className="w-5 h-5" />
                      <span>Stop Conversation</span>
                    </button>
                    <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('warning')}`}>
                      <Icons.RefreshCw className="w-5 h-5" />
                      <span>Pause Conversation</span>
                    </button>
                    <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('secondary', true)}`}>
                      <Icons.Trash2 className="w-5 h-5" />
                      <span>Clear Session</span>
                    </button>
                  </>
                ) : (
                  // WHIP WebRTC Quick Actions
                  <>
                    <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('secondary', true)}`}>
                      <Icons.Stop className="w-5 h-5" />
                      <span>Stop Pipeline</span>
                    </button>
                    <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('warning')}`}>
                      <Icons.RefreshCw className="w-5 h-5" />
                      <span>Reset Session</span>
                    </button>
                    <button className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('secondary', true)}`}>
                      <Icons.Trash2 className="w-5 h-5" />
                      <span>Cleanup Connection</span>
                    </button>
                  </>
                )}
              </div>
            </div>


          </div>
        </div>

        {/* Global Reset Button */}
        <div className="mt-8 text-center">
          <button className={`px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-3 mx-auto ${getButtonColor('warning')}`}>
            <Icons.RefreshCw className="w-6 h-6" />
            <span>Reset Pipeline</span>
          </button>
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