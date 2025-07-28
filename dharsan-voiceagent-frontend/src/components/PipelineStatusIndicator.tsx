import React from 'react';
import { usePipelineState } from '../contexts/PipelineStateContext';
import type { PipelineState } from '../types/pipeline';
import { PIPELINE_STATE_COLORS } from '../types/pipeline';

interface PipelineStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  showAnimation?: boolean;
}

export const PipelineStatusIndicator: React.FC<PipelineStatusIndicatorProps> = ({
  className = '',
  showLabel = true,
  showAnimation = true
}) => {
  const { state } = usePipelineState();
  const { pipelineState, isConnected } = state;

  const getStatusColor = (state: PipelineState): string => {
    return PIPELINE_STATE_COLORS[state] || 'gray';
  };

  const getStatusText = (state: PipelineState): string => {
    switch (state) {
      case 'idle':
        return 'Idle';
      case 'listening':
        return 'Listening';
      case 'processing':
        return 'Processing';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (state: PipelineState): string => {
    switch (state) {
      case 'idle':
        return '⏸️';
      case 'listening':
        return '🎤';
      case 'processing':
        return '⚙️';
      case 'complete':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const color = getStatusColor(pipelineState);
  const text = getStatusText(pipelineState);
  const icon = getStatusIcon(pipelineState);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          } ${showAnimation && isConnected ? 'animate-pulse' : ''}`}
        />
        <span className="text-xs text-gray-500">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Pipeline Status */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          {/* Status Circle */}
          <div
            className={`w-4 h-4 rounded-full border-2 border-${color}-500 bg-${color}-100 flex items-center justify-center ${
              showAnimation && pipelineState === 'processing' ? 'animate-spin' : ''
            }`}
          >
            <span className="text-xs">{icon}</span>
          </div>
          
          {/* Pulse Animation for Listening */}
          {showAnimation && pipelineState === 'listening' && (
            <div className="absolute inset-0 w-4 h-4 rounded-full border-2 border-blue-500 animate-ping opacity-75" />
          )}
          
          {/* Pulse Animation for Processing */}
          {showAnimation && pipelineState === 'processing' && (
            <div className="absolute inset-0 w-4 h-4 rounded-full border-2 border-yellow-500 animate-ping opacity-75" />
          )}
        </div>

        {/* Status Text */}
        {showLabel && (
          <span className={`text-sm font-medium text-${color}-700`}>
            {text}
          </span>
        )}
      </div>

      {/* Error Display */}
      {pipelineState === 'error' && state.error && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {state.error}
        </div>
      )}
    </div>
  );
};

// Compact version for smaller spaces
export const CompactPipelineStatusIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state } = usePipelineState();
  const { pipelineState, isConnected } = state;

  const color = PIPELINE_STATE_COLORS[pipelineState] || 'gray';
  const icon = getStatusIcon(pipelineState);

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Connection Dot */}
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      
      {/* Status Icon */}
      <div
        className={`w-3 h-3 rounded-full border border-${color}-500 bg-${color}-100 flex items-center justify-center ${
          pipelineState === 'processing' ? 'animate-spin' : ''
        }`}
      >
        <span className="text-xs">{icon}</span>
      </div>
    </div>
  );
};

// Helper function for status icon
function getStatusIcon(state: PipelineState): string {
  switch (state) {
    case 'idle':
      return '⏸️';
    case 'listening':
      return '🎤';
    case 'processing':
      return '⚙️';
    case 'complete':
      return '✅';
    case 'error':
      return '❌';
    default:
      return '❓';
  }
} 