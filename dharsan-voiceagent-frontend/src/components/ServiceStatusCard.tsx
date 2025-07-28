import React from 'react';
import { usePipelineState } from '../contexts/PipelineStateContext';
import type { ServiceState } from '../types/pipeline';
import { SERVICE_CONFIG, SERVICE_STATE_COLORS } from '../types/pipeline';

interface ServiceStatusCardProps {
  service: string;
  className?: string;
  showProgress?: boolean;
  showDetails?: boolean;
}

export const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({
  service,
  className = '',
  showProgress = true,
  showDetails = true
}) => {
  const { state } = usePipelineState();
  const serviceState = state.serviceStates[service] || 'idle';
  const serviceConfig = SERVICE_CONFIG[service];

  if (!serviceConfig) {
    return (
      <div className={`bg-gray-100 rounded-lg p-3 ${className}`}>
        <div className="text-gray-500 text-sm">Unknown Service: {service}</div>
      </div>
    );
  }

  const getStateColor = (state: ServiceState): string => {
    return SERVICE_STATE_COLORS[state] || 'gray';
  };

  const getStateText = (state: ServiceState): string => {
    switch (state) {
      case 'idle':
        return 'Idle';
      case 'waiting':
        return 'Waiting';
      case 'executing':
        return 'Processing';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getProgressValue = (state: ServiceState): number => {
    switch (state) {
      case 'idle':
        return 0;
      case 'waiting':
        return 25;
      case 'executing':
        return 75;
      case 'complete':
        return 100;
      case 'error':
        return 0;
      default:
        return 0;
    }
  };

  const color = getStateColor(serviceState);
  const stateText = getStateText(serviceState);
  const progressValue = getProgressValue(serviceState);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-3">
        {/* Service Icon and Name */}
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full bg-${color}-100 border-2 border-${color}-500 flex items-center justify-center ${
            serviceState === 'executing' ? 'animate-pulse' : ''
          }`}>
            <span className="text-lg">{serviceConfig.icon}</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{serviceConfig.displayName}</h3>
            {showDetails && (
              <p className="text-xs text-gray-500">{serviceConfig.description}</p>
            )}
          </div>
        </div>

        {/* State Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}>
          {stateText}
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progressValue}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-${color}-500 transition-all duration-300 ${
                serviceState === 'executing' ? 'animate-pulse' : ''
              }`}
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      )}

      {/* Metadata Display */}
      {showDetails && state.metadata && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {state.metadata.buffer_size && (
              <div>
                <span className="text-gray-500">Buffer:</span>
                <span className="ml-1 font-medium">
                  {Math.round(state.metadata.buffer_size / 1024)}KB
                </span>
              </div>
            )}
            {state.metadata.audio_quality && (
              <div>
                <span className="text-gray-500">Quality:</span>
                <span className="ml-1 font-medium">
                  {Math.round(state.metadata.audio_quality * 100)}%
                </span>
              </div>
            )}
            {state.metadata.stt_processing_time && (
              <div>
                <span className="text-gray-500">STT Time:</span>
                <span className="ml-1 font-medium">
                  {state.metadata.stt_processing_time}ms
                </span>
              </div>
            )}
            {state.metadata.llm_processing_time && (
              <div>
                <span className="text-gray-500">LLM Time:</span>
                <span className="ml-1 font-medium">
                  {state.metadata.llm_processing_time}ms
                </span>
              </div>
            )}
            {state.metadata.tts_processing_time && (
              <div>
                <span className="text-gray-500">TTS Time:</span>
                <span className="ml-1 font-medium">
                  {state.metadata.tts_processing_time}ms
                </span>
              </div>
            )}
            {state.metadata.tts_audio_size && (
              <div>
                <span className="text-gray-500">Audio Size:</span>
                <span className="ml-1 font-medium">
                  {Math.round(state.metadata.tts_audio_size / 1024)}KB
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {serviceState === 'error' && state.error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
          {state.error}
        </div>
      )}
    </div>
  );
};

// Compact version for smaller spaces
export const CompactServiceStatusCard: React.FC<{ service: string; className?: string }> = ({
  service,
  className = ''
}) => {
  const { state } = usePipelineState();
  const serviceState = state.serviceStates[service] || 'idle';
  const serviceConfig = SERVICE_CONFIG[service];

  if (!serviceConfig) {
    return null;
  }

  const color = SERVICE_STATE_COLORS[serviceState] || 'gray';

  return (
    <div className={`flex items-center space-x-2 p-2 bg-gray-50 rounded ${className}`}>
      <div className={`w-4 h-4 rounded-full bg-${color}-100 border border-${color}-500 flex items-center justify-center ${
        serviceState === 'executing' ? 'animate-pulse' : ''
      }`}>
        <span className="text-xs">{serviceConfig.icon}</span>
      </div>
      <span className="text-xs font-medium text-gray-700">{serviceConfig.displayName}</span>
      <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
    </div>
  );
};

// Service Status Grid
export const ServiceStatusGrid: React.FC<{ className?: string }> = ({ className = '' }) => {
  const services = Object.keys(SERVICE_CONFIG);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {services.map((service) => (
        <ServiceStatusCard key={service} service={service} />
      ))}
    </div>
  );
}; 