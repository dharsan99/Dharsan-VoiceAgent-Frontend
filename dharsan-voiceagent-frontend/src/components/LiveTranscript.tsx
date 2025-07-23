import React, { useEffect, useRef, useState } from 'react';

interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

interface FinalTranscript {
  text: string;
  words: Word[];
}

interface AIResponse {
  text: string;
  words: string[];
  isComplete: boolean;
  isTyping: boolean;
  displayedText: string;
  typingSpeed: number;
}

interface Props {
  finalTranscripts: FinalTranscript[];
  currentSpokenWordIndex: number | null;
  interimTranscript: string;
  aiResponse: AIResponse | null;
  listeningState: 'idle' | 'listening' | 'processing' | 'thinking' | 'speaking' | 'error';
  transcriptConfidence?: number;
  lastTranscriptUpdate?: Date | null;
  className?: string;
}

export const LiveTranscript: React.FC<Props> = ({ 
  finalTranscripts, 
  currentSpokenWordIndex, 
  interimTranscript,
  aiResponse,
  listeningState,
  transcriptConfidence = 0,

  className = '' 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [lastInterimLength, setLastInterimLength] = useState(0);
  
  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (scrollContainerRef.current && !isScrolling) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [finalTranscripts, interimTranscript, aiResponse, isScrolling]);

  // Track interim transcript changes for animation
  useEffect(() => {
    if (interimTranscript.length > lastInterimLength) {
      setLastInterimLength(interimTranscript.length);
    }
  }, [interimTranscript, lastInterimLength]);

  // Handle scroll events
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 10;
      setIsScrolling(!isAtBottom);
    }
  };

  // Get confidence color based on confidence score
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400';
    if (confidence >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };



  // Get status display text and color
  const getStatusDisplay = () => {
    switch (listeningState) {
      case 'listening':
        return { text: 'Listening', color: 'text-green-400', bgColor: 'bg-green-500/20' };
      case 'processing':
        return { text: 'Processing', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
      case 'thinking':
        return { text: 'Thinking', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
      case 'speaking':
        return { text: 'Speaking', color: 'text-purple-400', bgColor: 'bg-purple-500/20' };
      case 'error':
        return { text: 'Error', color: 'text-red-400', bgColor: 'bg-red-500/20' };
      default:
        return { text: 'Idle', color: 'text-gray-400', bgColor: 'bg-gray-500/20' };
    }
  };

  const statusDisplay = getStatusDisplay();

  if (finalTranscripts.length === 0 && !interimTranscript && !aiResponse) {
    return (
      <div className={`text-gray-400 text-center py-8 sm:py-12 ${className}`}>
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="text-center px-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-300 mb-2">Ready to Start Conversation</h3>
            <p className="text-sm sm:text-base text-gray-500 max-w-md">
              Click "Start" to begin. Your voice will be transcribed in real-time with live feedback.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl ${className}`}>
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <h2 className="text-base sm:text-lg font-bold text-cyan-400 flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Live Transcript
          </h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full ${statusDisplay.bgColor} border border-gray-600/50`}>
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${statusDisplay.color.replace('text-', 'bg-')} ${listeningState !== 'idle' ? 'animate-pulse' : ''}`} />
              <span className={`text-xs font-medium ${statusDisplay.color}`}>{statusDisplay.text}</span>
            </div>
            {transcriptConfidence > 0 && (
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-gray-800/50 border border-gray-600/50">
                <span className="text-xs text-gray-400">{(transcriptConfidence * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transcript Content */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-64 sm:h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-3 sm:p-4 space-y-2 sm:space-y-3"
      >
        {/* Final Transcripts */}
        {finalTranscripts.map((transcript, transcriptIndex) => {
          const avgConfidence = transcript.words && transcript.words.length > 0 
            ? transcript.words.reduce((sum, word) => sum + word.confidence, 0) / transcript.words.length
            : 0;
          
          return (
            <div 
              key={transcriptIndex} 
              className="bg-gray-800/60 rounded-xl p-3 sm:p-4 border-l-4 border-cyan-500/60 hover:bg-gray-800/80 transition-all duration-300 animate-slideInLeft"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-cyan-300">You</span>
                      <span className="text-xs text-gray-500 bg-gray-700/50 px-1.5 sm:px-2 py-0.5 rounded-full">Final</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {(avgConfidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                  <div className="break-words leading-relaxed text-sm sm:text-base">
                    {transcript.words && transcript.words.length > 0 ? (
                      transcript.words.map((word, wordIndex) => (
                        <span
                          key={wordIndex}
                          className={`transition-all duration-200 ease-in-out inline-block ${getConfidenceColor(word.confidence)}`}
                          style={{ 
                            opacity: word.confidence * 0.7 + 0.3,
                            animationDelay: `${wordIndex * 30}ms`
                          }}
                          title={`Confidence: ${(word.confidence * 100).toFixed(1)}%`}
                        >
                          {word.word}
                          {wordIndex < transcript.words.length - 1 && ' '}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-300">{transcript.text}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Interim Transcript */}
        {interimTranscript && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border-l-4 border-yellow-500/60 border-dashed animate-pulse">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-yellow-300">You</span>
                    <span className="text-xs text-gray-500 bg-yellow-500/20 px-2 py-0.5 rounded-full">Live</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 3 }, (_, i) => (
                        <span
                          key={i}
                          className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Live transcription...</span>
                </div>
                <div className="text-gray-300 italic break-words leading-relaxed text-sm sm:text-base">
                  {interimTranscript.split(/\s+/).map((word, index) => (
                    <span 
                      key={index} 
                      className="inline-block mr-1 animate-fadeIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {word}
                    </span>
                  ))}
                  <span className="inline-block w-2 h-4 bg-yellow-400 ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border-l-4 border-blue-500/60 hover:bg-blue-500/20 transition-all duration-300 animate-slideInRight">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-300">AI Assistant</span>
                    <span className="text-xs text-gray-500 bg-blue-500/20 px-2 py-0.5 rounded-full">
                      {aiResponse.isTyping ? 'Typing' : 
                       currentSpokenWordIndex !== null ? 'Speaking' : 'Complete'}
                    </span>
                    {(aiResponse.isTyping || currentSpokenWordIndex !== null) && (
                      <div className="flex gap-1">
                        {Array.from({ length: 3 }, (_, i) => (
                          <span
                            key={i}
                            className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {aiResponse.isTyping ? 
                      `${aiResponse.displayedText.length}/${aiResponse.text.length} chars` : 
                      `${aiResponse.words.length} words`
                    }
                  </span>
                </div>
                <div className="break-words leading-relaxed text-sm sm:text-base">
                  {aiResponse.isTyping ? (
                    <div className="text-gray-300">
                      <span>{aiResponse.displayedText}</span>
                      <span className="inline-block w-0.5 h-5 bg-blue-400 ml-1 animate-blink" />
                    </div>
                  ) : (
                    aiResponse.words.map((word, wordIndex) => {
                      const isSpoken = wordIndex === currentSpokenWordIndex;
                      const isCompleted = wordIndex < (currentSpokenWordIndex || 0);
                      
                      return (
                        <span
                          key={wordIndex}
                          className={`transition-all duration-300 ease-out inline-block
                            ${isSpoken
                              ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-md px-1 scale-110 font-semibold shadow-lg'
                              : isCompleted
                              ? 'text-gray-400'
                              : 'text-gray-300'
                            }
                          `}
                        >
                          {word}
                          {wordIndex < aiResponse.words.length - 1 && ' '}
                        </span>
                      );
                    })
                  )}
                </div>
                
                {/* Progress indicator */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ 
                        width: aiResponse.isTyping 
                          ? `${(aiResponse.displayedText.length / aiResponse.text.length) * 100}%`
                          : currentSpokenWordIndex !== null 
                          ? `${((currentSpokenWordIndex + 1) / aiResponse.words.length) * 100}%`
                          : '100%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll to bottom indicator */}
        {!isScrolling && (finalTranscripts.length > 0 || interimTranscript || aiResponse) && (
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Auto-scroll enabled
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 