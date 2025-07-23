import React from 'react';

interface Props {
  confidence: number;
  isLive?: boolean;
  className?: string;
}

export const TranscriptConfidence: React.FC<Props> = ({ 
  confidence, 
  isLive = false, 
  className = '' 
}) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.9) return 'text-green-400';
    if (conf >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceBg = (conf: number) => {
    if (conf >= 0.9) return 'bg-green-500/20';
    if (conf >= 0.7) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const getConfidenceText = (conf: number) => {
    if (conf >= 0.9) return 'Excellent';
    if (conf >= 0.7) return 'Good';
    return 'Poor';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Confidence bar */}
      <div className="flex items-center gap-1">
        <div className="w-8 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              confidence >= 0.9 ? 'bg-green-500' :
              confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${getConfidenceColor(confidence)}`}>
          {(confidence * 100).toFixed(0)}%
        </span>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${getConfidenceBg(confidence)}`} />
        <span className="text-xs text-gray-500">
          {isLive ? 'Live' : getConfidenceText(confidence)}
        </span>
      </div>

      {/* Live indicator */}
      {isLive && (
        <div className="flex gap-1">
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 