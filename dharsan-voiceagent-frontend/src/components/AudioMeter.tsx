import React from 'react';
import { useVoiceAgentStore } from '../stores/voiceAgentStore';

interface AudioMeterProps {
  className?: string;
}

const AudioMeter: React.FC<AudioMeterProps> = ({ className = '' }) => {
  const { audioLevel, isStreaming } = useVoiceAgentStore();

  const getAudioLevelColor = (level: number) => {
    if (level < 30) return 'bg-green-500';
    if (level < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAudioLevelWidth = (level: number) => {
    return Math.min(100, Math.max(0, level));
  };

  const getAudioLevelText = (level: number) => {
    if (level === 0) return 'Silent';
    if (level < 20) return 'Low';
    if (level < 50) return 'Medium';
    if (level < 80) return 'High';
    return 'Very High';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Audio Level</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className="text-sm text-gray-600">
            {isStreaming ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Audio Level Bar */}
      <div className="space-y-3">
        <div className="relative">
          <div className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ease-out ${getAudioLevelColor(audioLevel)}`}
              style={{ width: `${getAudioLevelWidth(audioLevel)}%` }}
            />
          </div>
          
          {/* Level markers */}
          <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
            <div className="w-px h-4 bg-gray-400"></div>
            <div className="w-px h-4 bg-gray-400"></div>
            <div className="w-px h-4 bg-gray-400"></div>
            <div className="w-px h-4 bg-gray-400"></div>
            <div className="w-px h-4 bg-gray-400"></div>
          </div>
        </div>

        {/* Level indicators */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Audio Level Info */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getAudioLevelColor(audioLevel)}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {getAudioLevelText(audioLevel)}
          </span>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-gray-800">
            {Math.round(audioLevel)}%
          </div>
          <div className="text-xs text-gray-500">
            Audio Level
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${isStreaming ? 'text-green-600' : 'text-gray-400'}`}>
              {isStreaming ? 'Streaming' : 'Idle'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Level:</span>
            <span className="font-medium text-gray-800">
              {audioLevel > 0 ? `${Math.round(audioLevel)}%` : '0%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioMeter; 