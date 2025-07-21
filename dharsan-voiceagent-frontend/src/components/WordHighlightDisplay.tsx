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
    <div ref={scrollContainerRef} className={`space-y-4 ${className}`}>
      {/* Display final transcripts with confidence visualization */}
      {finalTranscripts.map((transcript, transcriptIndex) => {
        // const isLastTranscript = transcriptIndex === finalTranscripts.length - 1;
        
        return (
          <div key={transcriptIndex} className="bg-gray-800/30 rounded-lg p-3 border-l-4 border-cyan-500/50 hover:bg-gray-800/50 transition-colors duration-200 animate-slideInLeft">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <span className="font-bold text-cyan-300 text-sm bg-cyan-900/30 px-2 py-1 rounded-full">
                  You
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="break-words leading-relaxed text-sm sm:text-base">
                  {transcript.words.map((word, wordIndex) => {
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
                  })}
                </div>
                
                {/* Enhanced Confidence indicator */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Confidence:</span>
                    <div className="flex gap-1">
                      {transcript.words.map((word, index) => (
                        <span
                          key={index}
                          className="inline-block w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: word.confidence > 0.8 ? '#10b981' : 
                                            word.confidence > 0.6 ? '#f59e0b' : '#ef4444',
                            opacity: word.confidence
                          }}
                          title={`${word.word}: ${(word.confidence * 100).toFixed(1)}%`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {transcript.words.length} words
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Display AI response with word highlighting */}
      {aiResponse && (
        <div className="bg-gray-800/30 rounded-lg p-3 border-l-4 border-blue-500/50 hover:bg-gray-800/50 transition-colors duration-200 animate-slideInRight">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <span className="font-bold text-blue-300 text-sm bg-blue-900/30 px-2 py-1 rounded-full">
                AI
              </span>
            </div>
            <div className="flex-1 min-w-0">
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
                    
                    return (
                      <span
                        key={wordIndex}
                        className={`transition-all duration-300 ease-out inline-block
                          ${isSpoken
                            ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-md px-1 scale-110 font-semibold shadow-lg'
                            : 'text-gray-300'
                          }
                          ${wordIndex < (currentSpokenWordIndex || 0) ? 'text-gray-400' : ''}
                        `}
                      >
                        {word}
                        {wordIndex < aiResponse.words.length - 1 && ' '}
                      </span>
                    );
                  })
                )}
              </div>
              
              {/* AI response metadata */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>
                    {aiResponse.isTyping ? 'Typing...' : 
                     currentSpokenWordIndex !== null ? 'Speaking...' : 'Complete'}
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
            </div>
          </div>
        </div>
      )}
      
      {/* Display interim transcript */}
      {interimTranscript && (
        <div className="bg-gray-800/20 rounded-lg p-3 border-l-4 border-yellow-500/50 border-dashed animate-slideInLeft">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <span className="font-bold text-yellow-300 text-sm bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse">
                Processing
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-400 italic break-words leading-relaxed text-sm sm:text-base">
                {/* Improved interim transcript display with better word spacing */}
                {interimTranscript.split(/\s+/).map((word, index) => (
                  <span key={index} className="inline-block mr-1">
                    {word}
                  </span>
                ))}
                <span className="inline-block w-2 h-4 bg-yellow-400 ml-1 animate-pulse" />
              </div>
              
              {/* Processing metadata */}
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span>Live transcription...</span>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 