import React from 'react';
import type { PhaseToggleProps, PhaseType } from '../../types/unifiedV2';

// Icons component
interface IconProps {
  className?: string;
}

const Icons = {
  Phase1: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Phase2: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Phase5: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

const PhaseToggle: React.FC<PhaseToggleProps> = ({ 
  currentPhase, 
  phases, 
  onPhaseChange 
}) => {
  const getPhaseIcon = (phase: PhaseType) => {
    switch (phase) {
      case 'phase1':
        return <Icons.Phase1 />;
      case 'phase2':
        return <Icons.Phase2 />;
      case 'phase5':
        return <Icons.Phase5 />;
      default:
        return <Icons.Phase2 />;
    }
  };

  const getPhaseColor = (phase: PhaseType) => {
    switch (phase) {
      case 'phase1':
        return 'from-blue-600 to-blue-700';
      case 'phase2':
        return 'from-green-600 to-green-700';
      case 'phase5':
        return 'from-purple-600 to-purple-700';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getPhaseBorderColor = (phase: PhaseType) => {
    switch (phase) {
      case 'phase1':
        return 'border-blue-500';
      case 'phase2':
        return 'border-green-500';
      case 'phase5':
        return 'border-purple-500';
      default:
        return 'border-gray-500';
    }
  };

  const getPhaseTextColor = (phase: PhaseType) => {
    switch (phase) {
      case 'phase1':
        return 'text-blue-400';
      case 'phase2':
        return 'text-green-400';
      case 'phase5':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPhaseDescription = (phase: PhaseType) => {
    switch (phase) {
      case 'phase1':
        return 'WebRTC Echo Test';
      case 'phase2':
        return 'WHIP WebRTC';
      case 'phase5':
        return 'Advanced WHIP + Event-Driven';
      default:
        return 'Unknown Phase';
    }
  };

  const getPhaseFeatures = (phase: PhaseType) => {
    const phaseData = phases[phase];
    if (!phaseData) return [];

    const features = [];
    if (phaseData.features.webRTC) features.push('WebRTC');
    if (phaseData.features.whip) features.push('WHIP');
    if (phaseData.features.eventDriven) features.push('Event-Driven');
    if (phaseData.features.audioProcessing) features.push('Audio Processing');
    if (phaseData.features.pipelineMonitoring) features.push('Pipeline Monitoring');
    if (phaseData.features.testingTools) features.push('Testing Tools');

    return features;
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Phase Selection
      </h3>
      
      {/* Vertical Phase Stack */}
      <div className="space-y-4">
        {Object.entries(phases).map(([phaseKey, phaseData]) => {
          const phase = phaseKey as PhaseType;
          const isCurrentPhase = currentPhase === phase;
          const isEnabled = phaseData.enabled;
          const isActive = phaseData.active;
          
          return (
            <button
              key={phase}
              onClick={() => isEnabled && onPhaseChange(phase)}
              disabled={!isEnabled}
              className={`w-full p-5 rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-lg
                ${isCurrentPhase 
                  ? `bg-gradient-to-br ${getPhaseColor(phase)} border-2 ${getPhaseBorderColor(phase)} transform scale-105 shadow-2xl` 
                  : isEnabled 
                    ? 'bg-gray-700/50 hover:bg-gray-600/50 border-2 border-gray-600 hover:border-gray-500 transform hover:scale-102 hover:shadow-xl' 
                    : 'bg-gray-800/50 border-2 border-gray-700 cursor-not-allowed opacity-50'
                }
              `}
            >
              {/* Phase Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    isCurrentPhase ? 'bg-white/20 shadow-lg' : 'bg-gray-600/50'
                  }`}>
                    {getPhaseIcon(phase)}
                  </div>
                  
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-xl ${
                        isCurrentPhase ? 'text-white' : isEnabled ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {phase.toUpperCase()}
                      </h4>
                      
                      {isCurrentPhase && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white animate-pulse">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm mt-1 ${
                      isCurrentPhase ? 'text-gray-200' : isEnabled ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {getPhaseDescription(phase)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    isCurrentPhase ? 'text-white' : isEnabled ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isEnabled ? (
                      <div className="flex items-center gap-1">
                        <Icons.Check className="w-4 h-4" />
                        <span>Enabled</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Icons.X className="w-4 h-4" />
                        <span>Disabled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Features Grid */}
              {isEnabled && (
                <div className="mt-4 pt-4 border-t border-gray-600/50">
                  <div className="text-xs text-gray-400 mb-2 font-medium">Features:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {getPhaseFeatures(phase).map((feature, index) => (
                      <span
                        key={index}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-center ${
                          isCurrentPhase 
                            ? 'bg-white/20 text-white shadow-md' 
                            : 'bg-gray-600/50 text-gray-300'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Status Indicator */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isCurrentPhase ? 'bg-white animate-pulse' : isEnabled ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className={`text-xs ${
                    isCurrentPhase ? 'text-white' : isEnabled ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isCurrentPhase ? 'Currently Active' : isEnabled ? 'Ready to Switch' : 'Not Available'}
                  </span>
                </div>
                
                {isEnabled && !isCurrentPhase && (
                  <span className="text-xs text-cyan-400 font-medium">
                    Click to Switch →
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Current Phase Summary */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-gray-700/50 to-gray-600/50 border border-gray-600/50">
        <div className="text-sm text-gray-400 mb-2 font-medium">Current Phase Summary</div>
        <div className={`font-bold text-lg ${getPhaseTextColor(currentPhase)}`}>
          {currentPhase.toUpperCase()} - {getPhaseDescription(currentPhase)}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {phases[currentPhase]?.enabled 
            ? '✓ Phase is enabled and ready for use' 
            : '✗ Phase is currently disabled'
          }
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Active Features: {getPhaseFeatures(currentPhase).join(', ')}
        </div>
      </div>
    </div>
  );
};

export default PhaseToggle; 