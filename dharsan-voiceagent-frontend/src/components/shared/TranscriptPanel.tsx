import React from 'react';

interface TranscriptPanelProps {
  transcript?: string;
  interimTranscript?: string;
  aiResponse?: string | { text: string };
  onClear?: () => void;
  className?: string;
  variant?: 'light' | 'dark';
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  transcript,
  interimTranscript,
  aiResponse,
  onClear,
  className = '',
  variant = 'dark'
}) => {
  const isDark = variant === 'dark';
  const bgClass = isDark ? 'bg-gray-800/80' : 'bg-white';
  const borderClass = isDark ? 'border-gray-700/50' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgClass = isDark ? 'bg-gray-700' : 'bg-gray-50';
  const cardBorderClass = isDark ? 'border-gray-600' : 'border-gray-200';

  const getResponseText = (response: string | { text: string }) => {
    return typeof response === 'string' ? response : response.text;
  };

  return (
    <div className={`${bgClass} backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border ${borderClass} hover:border-gray-600/50 transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg sm:text-xl font-bold text-cyan-400 flex items-center gap-2`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Transcript
        </h2>
        {onClear && (
          <button
            onClick={onClear}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-all duration-300"
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* User Input */}
        <div className="space-y-3">
          <h3 className={`text-base font-semibold ${textClass}`}>Your Speech</h3>
          
          {interimTranscript && (
            <div className={`p-3 ${cardBgClass} border ${cardBorderClass} rounded-md`}>
              <p className={`text-sm ${textSecondaryClass} font-medium mb-1`}>Interim:</p>
              <p className={isDark ? 'text-blue-300' : 'text-blue-900'}>{interimTranscript}</p>
            </div>
          )}
          
          {transcript && (
            <div className={`p-3 ${cardBgClass} border ${cardBorderClass} rounded-md`}>
              <p className={`text-sm ${textSecondaryClass} font-medium mb-1`}>Final:</p>
              <p className={isDark ? 'text-green-300' : 'text-green-900'}>{transcript}</p>
            </div>
          )}
          
          {!transcript && !interimTranscript && (
            <div className={`p-3 ${cardBgClass} border ${cardBorderClass} rounded-md`}>
              <p className={`${textSecondaryClass} text-center`}>
                Start speaking to see your transcript here...
              </p>
            </div>
          )}
        </div>

        {/* AI Response */}
        <div className="space-y-3">
          <h3 className={`text-base font-semibold ${textClass}`}>AI Response</h3>
          
          {aiResponse && (
            <div className={`p-3 ${cardBgClass} border ${cardBorderClass} rounded-md`}>
              <p className={`text-sm ${textSecondaryClass} font-medium mb-1`}>Response:</p>
              <p className={isDark ? 'text-purple-300' : 'text-purple-900'}>
                {getResponseText(aiResponse)}
              </p>
            </div>
          )}
          
          {!aiResponse && (
            <div className={`p-3 ${cardBgClass} border ${cardBorderClass} rounded-md`}>
              <p className={`${textSecondaryClass} text-center`}>
                AI response will appear here...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptPanel; 