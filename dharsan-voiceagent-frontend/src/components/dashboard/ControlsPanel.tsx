import React from 'react';
import { Icons } from '../ui/Icons';
import { getButtonColor } from '../../utils/uiUtils';
import ConnectionButton from './ConnectionButton';

interface ControlsPanelProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  useEventDriven: boolean;
  audioLevel: number;
  onConnect: () => void;
  onStartListening?: () => void;
  onStopListening?: () => void;
  onTriggerLLM?: () => void;
  isListening?: boolean;
  isProcessing?: boolean;
  hasAudioData?: boolean;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  connectionStatus,
  useEventDriven,
  audioLevel,
  onConnect,
  onStartListening,
  onStopListening,
  onTriggerLLM,
  isListening = false,
  isProcessing = false,
  hasAudioData = false
}) => {
  // Determine dynamic button state
  const getDynamicButtonState = () => {
    if (isProcessing) {
      return {
        text: 'Processing...',
        icon: <Icons.RefreshCw className="w-5 h-5 animate-spin" />,
        onClick: undefined,
        disabled: true,
        color: 'gray'
      };
    } else if (hasAudioData && !isListening) {
      return {
        text: 'Get Answer',
        icon: <Icons.Zap className="w-5 h-5" />,
        onClick: onTriggerLLM,
        disabled: connectionStatus !== 'connected',
        color: 'purple'
      };
    } else if (isListening) {
      return {
        text: 'Listening...',
        icon: <Icons.Mic className="w-5 h-5" />,
        onClick: onStopListening,
        disabled: false,
        color: 'red'
      };
    } else {
      return {
        text: 'Start Listening',
        icon: <Icons.Wifi className="w-5 h-5" />,
        onClick: onStartListening,
        disabled: connectionStatus !== 'connected',
        color: 'primary'
      };
    }
  };

  const dynamicButton = getDynamicButtonState();

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Icons.Settings className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Controls</h3>
      </div>
      <div className="space-y-3">
        <ConnectionButton 
          connectionStatus={connectionStatus}
          onConnect={onConnect}
        />

        {useEventDriven ? (
          // Event-Driven Mode Controls - Dynamic Button
          <>
            <button 
              onClick={dynamicButton.onClick}
              disabled={dynamicButton.disabled}
              className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor(dynamicButton.color, dynamicButton.disabled)}`}
            >
              {dynamicButton.icon}
              <span>{dynamicButton.text}</span>
            </button>
          </>
        ) : (
          // WHIP WebRTC Mode Controls
          <>
            <button 
              disabled={connectionStatus !== 'connected'}
              className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('primary', connectionStatus !== 'connected')}`}
            >
              <Icons.Video className="w-5 h-5" />
              <span>Enable Audio</span>
            </button>
            <button 
              disabled={connectionStatus !== 'connected'}
              className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('secondary', connectionStatus !== 'connected')}`}
            >
              <Icons.Stop className="w-5 h-5" />
              <span>Disable Audio</span>
            </button>
            <button 
              disabled={connectionStatus !== 'connected'}
              className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor('warning', connectionStatus !== 'connected')}`}
            >
              <Icons.RefreshCw className="w-5 h-5" />
              <span>Reset Session</span>
            </button>
          </>
        )}
        
        {/* Audio Level Display */}
        <div className="pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Audio Level</span>
            <span>{audioLevel}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${audioLevel}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel; 