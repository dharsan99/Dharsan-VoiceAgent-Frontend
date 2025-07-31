import React from 'react';
import { Icons } from '../ui/Icons';
import { getButtonColor } from '../../utils/uiUtils';
import ConnectionButton from './ConnectionButton';

interface ControlsPanelProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  useEventDriven: boolean;
  audioLevel: number;
  speakerLevel?: number;
  onConnect: () => void;
  onStartListening?: () => void;
  onStopListening?: () => void;
  onGetAnswer?: () => void;
  isListening?: boolean;
  isProcessing?: boolean;
  hasAudioData?: boolean;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  connectionStatus,
  useEventDriven,
  audioLevel,
  speakerLevel = 0,
  onConnect,
  onStartListening,
  onStopListening,
  onGetAnswer,
  isListening = false,
  isProcessing = false,
  hasAudioData = false
}) => {
  // Determine button states for two-button system
  const getListenButtonState = () => {
    if (isProcessing) {
      return {
        text: 'Processing...',
        icon: <Icons.RefreshCw className="w-5 h-5 animate-spin" />,
        onClick: undefined,
        disabled: true,
        color: 'gray'
      };
    } else if (isListening) {
      return {
        text: 'Stop Listening',
        icon: <Icons.Stop className="w-5 h-5" />,
        onClick: onStopListening,
        disabled: false,
        color: 'red'
      };
    } else {
      return {
        text: 'Start Listening',
        icon: <Icons.Mic className="w-5 h-5" />,
        onClick: onStartListening,
        disabled: connectionStatus !== 'connected',
        color: 'primary'
      };
    }
  };

  const getAnswerButtonState = () => {
    // Allow Get Answer if: connected AND listening AND not processing
    // This allows users to trigger processing while actively listening
    const disabled = connectionStatus !== 'connected' || 
                    !isListening || 
                    isProcessing;
    
    return {
      text: isProcessing ? 'Processing...' : 'Get Answer',
      icon: isProcessing ? <Icons.RefreshCw className="w-5 h-5 animate-spin" /> : <Icons.Zap className="w-5 h-5" />,
      onClick: onGetAnswer,
      disabled,
      color: 'purple'
    };
  };

  const listenButton = getListenButtonState();
  const answerButton = getAnswerButtonState();

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
          // Event-Driven Mode Controls - Two Button System
          <>
            {/* Start/Stop Listening Button */}
            <button 
              onClick={listenButton.onClick}
              disabled={listenButton.disabled}
              className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor(listenButton.color, listenButton.disabled)}`}
            >
              {listenButton.icon}
              <span>{listenButton.text}</span>
            </button>
            
            {/* Get Answer Button */}
            <button 
              onClick={answerButton.onClick}
              disabled={answerButton.disabled}
              className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getButtonColor(answerButton.color, answerButton.disabled)}`}
            >
              {answerButton.icon}
              <span>{answerButton.text}</span>
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
          <div className="space-y-3">
            {/* Microphone Level */}
            <div>
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <div className="flex items-center space-x-2">
                  <Icons.Mic className="w-4 h-4" />
                  <span>Microphone</span>
                </div>
                <span>{audioLevel}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${audioLevel}%` }}
                ></div>
              </div>
            </div>
            
            {/* Speaker Level */}
            <div>
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <div className="flex items-center space-x-2">
                  <Icons.Volume2 className="w-4 h-4" />
                  <span>Speaker</span>
                </div>
                <span>{speakerLevel}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${speakerLevel}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel; 