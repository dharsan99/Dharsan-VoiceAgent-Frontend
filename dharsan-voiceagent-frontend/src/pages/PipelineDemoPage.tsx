import React, { useEffect } from 'react';
import { PipelineStateProvider, usePipelineState } from '../contexts/PipelineStateContext';
import { PipelineDashboard } from '../components/PipelineDashboard';
import { PipelineStatusIndicator } from '../components/PipelineStatusIndicator';
import { ServiceStatusGrid } from '../components/ServiceStatusCard';
import { ConversationControls } from '../components/ConversationControls';
import { FloatingPipelineDashboard } from '../components/PipelineDashboard';

// Demo component that simulates pipeline state changes
const PipelineDemo: React.FC = () => {
  const { state, actions } = usePipelineState();
  const { sessionId, isConnected } = state;

  // Set up a demo session when component mounts
  useEffect(() => {
    if (!sessionId) {
      const demoSessionId = `demo_session_${Date.now()}`;
      actions.setSessionId(demoSessionId);
    }
  }, [sessionId, actions]);

  // Simulate pipeline state changes for demo
  useEffect(() => {
    if (!isConnected) return;

    const simulatePipeline = async () => {
      // Simulate listening state
      actions.updatePipelineState('listening');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate processing state
      actions.updatePipelineState('processing');
      actions.updateServiceState('stt', 'executing');
      await new Promise(resolve => setTimeout(resolve, 1500));

      actions.updateServiceState('stt', 'complete');
      actions.updateServiceState('llm', 'executing');
      await new Promise(resolve => setTimeout(resolve, 2000));

      actions.updateServiceState('llm', 'complete');
      actions.updateServiceState('tts', 'executing');
      await new Promise(resolve => setTimeout(resolve, 1000));

      actions.updateServiceState('tts', 'complete');
      actions.updatePipelineState('complete');
      
      // Reset after 3 seconds
      setTimeout(() => {
        actions.updatePipelineState('idle');
        actions.updateServiceState('stt', 'idle');
        actions.updateServiceState('llm', 'idle');
        actions.updateServiceState('tts', 'idle');
      }, 3000);
    };

    const interval = setInterval(simulatePipeline, 10000); // Run every 10 seconds
    return () => clearInterval(interval);
  }, [isConnected, actions]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pipeline State Management Demo
          </h1>
          <p className="text-gray-600">
            Real-time pipeline state tracking with WebSocket integration
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Connection Status</h2>
            <div className="flex items-center space-x-4">
              <PipelineStatusIndicator />
              <div className="text-sm text-gray-500">
                Session ID: {sessionId || 'None'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Full Dashboard */}
          <div className="lg:col-span-2">
            <PipelineDashboard variant="full" />
          </div>

          {/* Compact Dashboard */}
          <div>
            <PipelineDashboard variant="compact" />
          </div>
        </div>

        {/* Service Status Grid */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Service Status Details</h2>
            <ServiceStatusGrid />
          </div>
        </div>

        {/* Conversation Controls */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Conversation Controls</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Default Controls</h3>
                <ConversationControls />
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Minimal Controls</h3>
                <ConversationControls variant="minimal" />
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Large Controls</h3>
                <ConversationControls size="lg" />
              </div>
            </div>
          </div>
        </div>

        {/* State Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Current State</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pipeline State:</span>
                <span className="font-medium">{state.pipelineState}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversation State:</span>
                <span className="font-medium">{state.conversationState}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">WebSocket Connected:</span>
                <span className="font-medium">{state.isConnected ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loading:</span>
                <span className="font-medium">{state.isLoading ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Service States</h2>
            <div className="space-y-2 text-sm">
              {Object.entries(state.serviceStates).map(([service, serviceState]) => (
                <div key={service} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{service}:</span>
                  <span className="font-medium">{serviceState}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Dashboard */}
        <FloatingPipelineDashboard />
      </div>
    </div>
  );
};

// Wrapper component with provider
export const PipelineDemoPage: React.FC = () => {
  return (
    <PipelineStateProvider>
      <PipelineDemo />
    </PipelineStateProvider>
  );
}; 