import React from 'react';

// Word-level data from Deepgram
interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

// Final transcript with word-level data
interface FinalTranscript {
  text: string;
  words: Word[];
}

// AI response with word-level data
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
  className?: string;
}

export const WordHighlightDisplay: React.FC<Props> = ({ 
  finalTranscripts, 
  currentSpokenWordIndex, 
  interimTranscript,
  aiResponse,
  className = '' 
}) => {
  // Auto-scroll to bottom when new content is added
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [finalTranscripts, interimTranscript, aiResponse]);

  if (finalTranscripts.length === 0 && !interimTranscript && !aiResponse) {
    return (
      <div className={`text-gray-400 text-center py-8 ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium mb-1">Ready to start conversation...</p>
            <p className="text-sm text-gray-500">Click "Start Conversation" to begin</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className={`space-y-3 ${className}`}>
      {/* Display final transcripts with confidence visualization */}
      {finalTranscripts.map((transcript, transcriptIndex) => {
        const avgConfidence = transcript.words && transcript.words.length > 0 
          ? transcript.words.reduce((sum, word) => sum + word.confidence, 0) / transcript.words.length
          : 0;
        
        return (
          <div key={transcriptIndex} className="bg-gray-800/60 rounded-xl p-4 border-l-4 border-cyan-500/60 hover:bg-gray-800/80 transition-all duration-300 animate-slideInLeft">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-cyan-300">You</span>
                    <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded-full">Final</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Avg confidence: {(avgConfidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="break-words leading-relaxed text-sm sm:text-base">
                  {transcript.words && transcript.words.length > 0 ? (
                    transcript.words.map((word, wordIndex) => {
                      // Calculate confidence-based opacity
                      const confidenceOpacity = word.confidence * 0.7 + 0.3;
                      
                      return (
                        <span
                          key={wordIndex}
                          className="transition-all duration-200 ease-in-out inline-block animate-fadeIn"
                          style={{ 
                            opacity: confidenceOpacity,
                            color: word.confidence > 0.8 ? '#e5e7eb' : '#9ca3af',
                            animationDelay: `${wordIndex * 50}ms` // Staggered appearance
                          }}
                          title={`Confidence: ${(word.confidence * 100).toFixed(1)}%`}
                        >
                          {word.word}
                          {wordIndex < transcript.words.length - 1 && ' '}
                        </span>
                      );
                    })
                  ) : (
                    // Fallback: display text without word-level highlighting
                    <span className="text-gray-300">{transcript.text}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Display AI response with word highlighting */}
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
                  // Show typing animation
                  <div className="text-gray-300">
                    <span>{aiResponse.displayedText}</span>
                    <span className="inline-block w-0.5 h-5 bg-blue-400 ml-1 animate-blink" />
                  </div>
                ) : (
                  // Show completed text with word highlighting
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
      
      {/* Display interim transcript */}
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
                {/* Improved interim transcript display with better word spacing */}
                {interimTranscript.split(/\s+/).map((word, index) => (
                  <span key={index} className="inline-block mr-1 animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                    {word}
                  </span>
                ))}
                <span className="inline-block w-2 h-4 bg-yellow-400 ml-1 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 