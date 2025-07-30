import React from 'react';
import type { PhaseTimings as PhaseTimingsType } from '../../utils/metricsUtils';

interface PhaseTimingsProps {
  phaseTimings: PhaseTimingsType;
}

const PhaseTimings: React.FC<PhaseTimingsProps> = ({ phaseTimings }) => {
  const totalTime = phaseTimings.stt && phaseTimings.llm && phaseTimings.tts 
    ? phaseTimings.stt + phaseTimings.llm + phaseTimings.tts 
    : 0;

  return (
    <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-400 mb-2">Phase Timings</h4>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-blue-400 font-mono">STT</div>
          <div className="text-white">{phaseTimings.stt ? `${phaseTimings.stt.toFixed(0)}ms` : 'N/A'}</div>
        </div>
        <div className="text-center">
          <div className="text-green-400 font-mono">LLM</div>
          <div className="text-white">{phaseTimings.llm ? `${phaseTimings.llm.toFixed(0)}ms` : 'N/A'}</div>
        </div>
        <div className="text-center">
          <div className="text-purple-400 font-mono">TTS</div>
          <div className="text-white">{phaseTimings.tts ? `${phaseTimings.tts.toFixed(0)}ms` : 'N/A'}</div>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-yellow-400 font-mono text-xs">Total Pipeline</div>
        <div className="text-white text-sm">
          {totalTime > 0 ? `${totalTime.toFixed(0)}ms` : 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default PhaseTimings; 