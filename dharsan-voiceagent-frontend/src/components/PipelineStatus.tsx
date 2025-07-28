import React from 'react';

export interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'connecting' | 'processing' | 'success' | 'error';
  message?: string;
  timestamp?: Date;
  latency?: number;
  audioLevel?: number; // Audio level from 0 to 1
}

export interface PipelineStatusProps {
  steps: PipelineStep[];
  isActive: boolean;
}

// Audio Level Meter Component
const AudioLevelMeter: React.FC<{ level: number; isActive: boolean }> = ({ level, isActive }) => {
  const bars = 8;
  const activeBars = Math.floor(level * bars);
  
  return (
    <div className="flex items-end space-x-1 h-8">
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className={`w-1 rounded-sm transition-all duration-100 ${
            i < activeBars
              ? isActive 
                ? 'bg-green-500' 
                : 'bg-blue-500'
              : 'bg-gray-300'
          }`}
          style={{
            height: `${((i + 1) / bars) * 100}%`,
            minHeight: '4px'
          }}
        />
      ))}
    </div>
  );
};

const PipelineStatus: React.FC<PipelineStatusProps> = ({ steps, isActive }) => {
  const getStepIcon = (status: PipelineStep['status']) => {
    switch (status) {
      case 'pending':
        return (
          <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          </div>
        );
      case 'connecting':
      case 'processing':
        return (
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center animate-spin">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
        );
      case 'success':
        return (
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const getStepColor = (status: PipelineStep['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500 bg-gray-100 border-gray-300';
      case 'connecting':
      case 'processing':
        return 'text-blue-700 bg-blue-50 border-blue-300';
      case 'success':
        return 'text-green-700 bg-green-50 border-green-300';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-300';
    }
  };

  const getStepIconColor = (status: PipelineStep['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-400';
      case 'connecting':
      case 'processing':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Pipeline Status</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </div>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 relative">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-300 relative ${getStepColor(step.status)}`}
          >
            <div className="flex flex-col items-center space-y-2">
              {getStepIcon(step.status)}
              <div className="text-center">
                <div className="font-medium text-xs">{step.name}</div>
                
                {/* Audio Level Meter for Audio Input step */}
                {step.id === 'audio-in' && step.audioLevel !== undefined && (
                  <div className="mt-2">
                    <AudioLevelMeter level={step.audioLevel} isActive={isActive} />
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(step.audioLevel * 100)}%
                    </div>
                  </div>
                )}
                
                {step.message && (
                  <div className="text-xs opacity-75 mt-1 truncate max-w-full">{step.message}</div>
                )}
                {step.timestamp && (
                  <div className="text-xs opacity-60 mt-1">
                    {step.timestamp.toLocaleTimeString()}
                    {step.latency && ` (${step.latency}ms)`}
                  </div>
                )}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 left-full transform -translate-y-1/2 w-4 h-0.5 bg-gray-300 z-10"></div>
            )}
          </div>
        ))}
      </div>
      
      {steps.some(step => step.status === 'error') && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-700">
              Some pipeline steps encountered errors. Check the logs for details.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineStatus; 