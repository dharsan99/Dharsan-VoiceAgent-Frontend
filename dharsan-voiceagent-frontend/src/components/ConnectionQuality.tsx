import React from 'react';
import { useVoiceAgentStore } from '../stores/voiceAgentStore';

interface ConnectionQualityProps {
  className?: string;
}

const ConnectionQuality: React.FC<ConnectionQualityProps> = ({ className = '' }) => {
  const { latency, packetLoss, jitter, connectionStatus } = useVoiceAgentStore();

  const getQualityScore = () => {
    if (connectionStatus !== 'connected') return 0;
    
    let score = 100;
    
    // Deduct points for high latency
    if (latency > 200) score -= 30;
    else if (latency > 100) score -= 15;
    else if (latency > 50) score -= 5;
    
    // Deduct points for packet loss
    if (packetLoss > 5) score -= 40;
    else if (packetLoss > 2) score -= 20;
    else if (packetLoss > 0.5) score -= 10;
    
    // Deduct points for high jitter
    if (jitter > 50) score -= 20;
    else if (jitter > 20) score -= 10;
    else if (jitter > 10) score -= 5;
    
    return Math.max(0, score);
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  };

  const qualityScore = getQualityScore();

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Quality</h3>
      
      <div className="space-y-4">
        {/* Quality Score */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getQualityColor(qualityScore)}`}>
            {qualityScore}
          </div>
          <div className="text-sm text-gray-600">Quality Score</div>
          <div className={`text-sm font-medium ${getQualityColor(qualityScore)}`}>
            {getQualityLabel(qualityScore)}
          </div>
        </div>

        {/* Quality Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              qualityScore >= 80 ? 'bg-green-500' :
              qualityScore >= 60 ? 'bg-yellow-500' :
              qualityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${qualityScore}%` }}
          />
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className={`text-xl font-bold ${
              latency <= 50 ? 'text-green-600' :
              latency <= 100 ? 'text-yellow-600' :
              latency <= 200 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {latency}ms
            </div>
            <div className="text-xs text-gray-600">Latency</div>
          </div>
          
          <div className="text-center">
            <div className={`text-xl font-bold ${
              packetLoss <= 0.5 ? 'text-green-600' :
              packetLoss <= 2 ? 'text-yellow-600' :
              packetLoss <= 5 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {packetLoss}%
            </div>
            <div className="text-xs text-gray-600">Packet Loss</div>
          </div>
          
          <div className="text-center">
            <div className={`text-xl font-bold ${
              jitter <= 10 ? 'text-green-600' :
              jitter <= 20 ? 'text-yellow-600' :
              jitter <= 50 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {jitter}ms
            </div>
            <div className="text-xs text-gray-600">Jitter</div>
          </div>
        </div>

        {/* Quality Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Latency Quality:</span>
            <span className={`font-medium ${
              latency <= 50 ? 'text-green-600' :
              latency <= 100 ? 'text-yellow-600' :
              latency <= 200 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {latency <= 50 ? 'Excellent' :
               latency <= 100 ? 'Good' :
               latency <= 200 ? 'Fair' : 'Poor'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Packet Loss Quality:</span>
            <span className={`font-medium ${
              packetLoss <= 0.5 ? 'text-green-600' :
              packetLoss <= 2 ? 'text-yellow-600' :
              packetLoss <= 5 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {packetLoss <= 0.5 ? 'Excellent' :
               packetLoss <= 2 ? 'Good' :
               packetLoss <= 5 ? 'Fair' : 'Poor'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Jitter Quality:</span>
            <span className={`font-medium ${
              jitter <= 10 ? 'text-green-600' :
              jitter <= 20 ? 'text-yellow-600' :
              jitter <= 50 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {jitter <= 10 ? 'Excellent' :
               jitter <= 20 ? 'Good' :
               jitter <= 50 ? 'Fair' : 'Poor'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionQuality; 