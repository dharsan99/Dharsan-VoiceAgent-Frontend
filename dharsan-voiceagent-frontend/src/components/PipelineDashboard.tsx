import React, { useState } from 'react';
import { usePipelineState } from '../contexts/PipelineStateContext';
import { PipelineStatusIndicator, CompactPipelineStatusIndicator } from './PipelineStatusIndicator';
import { ServiceStatusGrid, ServiceStatusCard } from './ServiceStatusCard';
import { ConversationControls, CompactConversationControls } from './ConversationControls';

interface PipelineDashboardProps {
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
  showMetadata?: boolean;
  showTimestamps?: boolean;
  collapsible?: boolean;
}

export const PipelineDashboard: React.FC<PipelineDashboardProps> = ({
  className = '',
  variant = 'full',
  showMetadata = true,
  showTimestamps = true,
  collapsible = false
}) => {
  const { state } = usePipelineState();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    pipelineState,
    serviceStates,
    conversationState,
    sessionId,
    conversationId,
    metadata,
    timestamps,
    error,
    isConnected
  } = state;

  if (variant === 'minimal') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <PipelineStatusIndicator showLabel={false} />
          <ConversationControls variant="minimal" />
        </div>
        
        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <PipelineStatusIndicator />
            <div className="text-sm text-gray-500">
              Session: {sessionId ? sessionId.slice(-8) : 'None'}
            </div>
          </div>
          <ConversationControls variant="minimal" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {Object.entries(serviceStates).map(([service, state]) => (
            <div key={service} className="text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                state === 'executing' ? 'bg-blue-100 border-2 border-blue-500 animate-pulse' :
                state === 'complete' ? 'bg-green-100 border-2 border-green-500' :
                state === 'error' ? 'bg-red-100 border-2 border-red-500' :
                'bg-gray-100 border-2 border-gray-500'
              }`}>
                <span className="text-sm">
                  {service === 'stt' ? '🎤' : service === 'llm' ? '🧠' : '🔊'}
                </span>
              </div>
              <div className="text-xs text-gray-600 capitalize">{state}</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Pipeline Status</h2>
            <PipelineStatusIndicator />
          </div>
          
          <div className="flex items-center space-x-3">
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-400 hover:text-gray-600"
              >
                {isCollapsed ? '📂' : '📁'}
              </button>
            )}
            <ConversationControls />
          </div>
        </div>

        {/* Session Info */}
        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
          <div>
            <span className="font-medium">Session:</span> {sessionId || 'None'}
          </div>
          {conversationId && (
            <div>
              <span className="font-medium">Conversation:</span> {conversationId}
            </div>
          )}
          <div>
            <span className="font-medium">State:</span> {conversationState}
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Service Status Grid */}
          <div className="p-4">
            <h3 className="text-md font-medium text-gray-900 mb-3">Service Status</h3>
            <ServiceStatusGrid />
          </div>

          {/* Metadata Section */}
          {showMetadata && Object.keys(metadata).length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">Pipeline Metadata</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500 font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {typeof value === 'number' 
                        ? key.includes('time') 
                          ? `${value}ms`
                          : key.includes('size') || key.includes('buffer')
                          ? `${Math.round(value / 1024)}KB`
                          : key.includes('quality')
                          ? `${Math.round(value * 100)}%`
                          : value
                        : String(value)
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps Section */}
          {showTimestamps && Object.keys(timestamps).length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">Timeline</h3>
              <div className="space-y-2">
                {Object.entries(timestamps).map(([key, timestamp]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-900 font-mono">
                      {new Date(timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="border-t border-gray-200 p-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">❌</span>
                  <span className="text-sm font-medium text-red-800">Pipeline Error</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Connection Status */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-gray-600">
                  WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Floating Dashboard for overlay display
export const FloatingPipelineDashboard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state } = usePipelineState();
  const { isConnected, pipelineState } = state;

  if (!isConnected) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <CompactPipelineStatusIndicator />
          <CompactConversationControls />
        </div>
        
        <div className="text-xs text-gray-500">
          Pipeline: {pipelineState}
        </div>
      </div>
    </div>
  );
};

// Sidebar Dashboard
export const SidebarPipelineDashboard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-80 bg-white border-r border-gray-200 h-full overflow-y-auto ${className}`}>
      <PipelineDashboard variant="full" collapsible={true} />
    </div>
  );
}; 