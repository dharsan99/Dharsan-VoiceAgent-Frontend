import React from 'react';
import { usePipelineState } from '../contexts/PipelineStateContext';
import type { ConversationState } from '../types/pipeline';

interface ConversationControlsProps {
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'floating';
}

export const ConversationControls: React.FC<ConversationControlsProps> = ({
  className = '',
  showLabels = true,
  size = 'md',
  variant = 'default'
}) => {
  const { state, actions } = usePipelineState();
  const { conversationState, isConnected, isLoading } = state;
  const { startListening, stopConversation, pauseConversation } = actions;

  const getButtonSize = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getIconSize = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  const buttonSize = getButtonSize(size);
  const iconSize = getIconSize(size);

  const isActive = conversationState === 'active';
  const isPaused = conversationState === 'paused';
  const isStopped = conversationState === 'stopped';

  const handleStart = () => {
    if (!isConnected) {
      console.warn('WebSocket not connected');
      return;
    }
    startListening();
  };

  const handleStop = () => {
    if (!isConnected) {
      console.warn('WebSocket not connected');
      return;
    }
    stopConversation();
  };

  const handlePause = () => {
    if (!isConnected) {
      console.warn('WebSocket not connected');
      return;
    }
    pauseConversation();
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!isConnected || isLoading || isActive}
          className={`${buttonSize} rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors ${iconSize}`}
          title="Start Listening"
        >
          🎤
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          disabled={!isConnected || isLoading || isStopped}
          className={`${buttonSize} rounded-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors ${iconSize}`}
          title="Stop Conversation"
        >
          ⏹️
        </button>

        {/* Pause Button */}
        <button
          onClick={handlePause}
          disabled={!isConnected || isLoading || isStopped}
          className={`${buttonSize} rounded-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors ${iconSize}`}
          title="Pause Conversation"
        >
          ⏸️
        </button>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2">
          <div className="flex items-center space-x-2">
            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={!isConnected || isLoading || isActive}
              className={`w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center ${iconSize}`}
              title="Start Listening"
            >
              🎤
            </button>

            {/* Stop Button */}
            <button
              onClick={handleStop}
              disabled={!isConnected || isLoading || isStopped}
              className={`w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center ${iconSize}`}
              title="Stop Conversation"
            >
              ⏹️
            </button>

            {/* Pause Button */}
            <button
              onClick={handlePause}
              disabled={!isConnected || isLoading || isStopped}
              className={`w-12 h-12 rounded-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center ${iconSize}`}
              title="Pause Conversation"
            >
              ⏸️
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-gray-500">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-2">
        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!isConnected || isLoading || isActive}
          className={`${buttonSize} rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center space-x-2`}
        >
          <span className={iconSize}>🎤</span>
          {showLabels && <span>Start Listening</span>}
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          disabled={!isConnected || isLoading || isStopped}
          className={`${buttonSize} rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center space-x-2`}
        >
          <span className={iconSize}>⏹️</span>
          {showLabels && <span>Stop</span>}
        </button>

        {/* Pause Button */}
        <button
          onClick={handlePause}
          disabled={!isConnected || isLoading || isStopped}
          className={`${buttonSize} rounded-lg bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center space-x-2`}
        >
          <span className={iconSize}>⏸️</span>
          {showLabels && <span>Pause</span>}
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500">Processing...</span>
        </div>
      )}

      {/* Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          isActive ? 'bg-green-500' : isPaused ? 'bg-yellow-500' : 'bg-gray-400'
        }`} />
        <span className="text-xs text-gray-500 capitalize">
          {conversationState}
        </span>
      </div>
    </div>
  );
};

// Compact version for smaller spaces
export const CompactConversationControls: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state, actions } = usePipelineState();
  const { conversationState, isConnected } = state;
  const { startListening, stopConversation } = actions;

  const isActive = conversationState === 'active';

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <button
        onClick={isActive ? stopConversation : startListening}
        disabled={!isConnected}
        className={`w-8 h-8 rounded-full ${
          isActive 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        } disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center justify-center`}
        title={isActive ? 'Stop Conversation' : 'Start Listening'}
      >
        {isActive ? '⏹️' : '🎤'}
      </button>
    </div>
  );
}; 