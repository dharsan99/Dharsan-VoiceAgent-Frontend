import { useState, useRef, useCallback, useEffect } from 'react';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'recovering';
type ListeningState = 'idle' | 'listening' | 'processing' | 'thinking' | 'speaking' | 'error';

interface NetworkStats {
  averageLatency: number;
  jitter: number;
  packetLoss: number;
  bufferSize: number;
  jitterBufferDelay: number; // New: Dynamic jitter buffer delay
}

interface ErrorStats {
  totalErrors: number;
  recentErrors: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}

interface RecoveryInfo {
  isRecovering: boolean;
  retryAttempt: number;
  maxRetries: number;
  lastError: string | null;
  recoveryStrategy: string[];
}

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

interface WordHighlight {
  word: string;
  index: number;
  timestamp: number;
  isActive: boolean;
}

interface WordTimingData {
  text: string;
  words: WordHighlight[];
  currentWordIndex: number;
  isActive: boolean;
}

// Helper functions for session storage
const getSessionData = (key: string): any[] => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Error reading from sessionStorage: ${key}`, error);
    return [];
  }
};

const appendSessionData = (key: string, data: any) => {
  try {
    const existingData = getSessionData(key);
    const newData = [...existingData, { ...data, timestamp: new Date().toISOString() }];
    sessionStorage.setItem(key, JSON.stringify(newData));
    console.log(`Session data appended to ${key}:`, data);
  } catch (error) {
    console.error(`Error writing to sessionStorage: ${key}`, error);
  }
};

export const useVoiceAgent = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [listeningState, setListeningState] = useState<ListeningState>('idle');
  const [transcript, setTranscript] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    averageLatency: 0,
    jitter: 0,
    packetLoss: 0,
    bufferSize: 3,
    jitterBufferDelay: 100
  });
  
  // Error tracking and recovery
  const [errorStats] = useState<ErrorStats>({
    totalErrors: 0,
    recentErrors: 0,
    byType: {},
    bySeverity: {}
  });
  
  const [recoveryInfo, setRecoveryInfo] = useState<RecoveryInfo>({
    isRecovering: false,
    retryAttempt: 0,
    maxRetries: 3,
    lastError: null,
    recoveryStrategy: []
  });
  const [wordTimingData, setWordTimingData] = useState<WordTimingData>({
    text: '',
    words: [],
    currentWordIndex: -1,
    isActive: false
  });

  // Advanced transcript state
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscripts, setFinalTranscripts] = useState<FinalTranscript[]>([]);
  const [currentSpokenWordIndex, setCurrentSpokenWordIndex] = useState<number | null>(null);
  
  // AI response state
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const voiceActivityTimeoutRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  
  // Audio enhancement (deprecated - using continuous audio)
  // const audioEnhancementRef = useRef<boolean>(false);
  // const audioFormatRef = useRef<'enhanced' | 'standard'>('standard');

  // Jitter buffering state
  const jitterBufferDelayRef = useRef<number>(100); // Initial 100ms delay
  const packetTimestampsRef = useRef<Map<string, number>>(new Map());
  const networkLatencyRef = useRef<number[]>([]);
  // const jitterHistoryRef = useRef<number[]>([]);
  // const lastPlaybackTimeRef = useRef<number>(0);
  
  // Dynamic Jitter Buffering
  const bufferSizeRef = useRef(3); // Initial buffer size (chunks)
  const minBufferSize = 2;
  const maxBufferSize = 8;
  const targetLatency = 200; // Target latency in ms

  // Calculate network statistics
  const calculateNetworkStats = useCallback(() => {
    const latencies = networkLatencyRef.current;
    
    console.log('Calculating network stats. Latencies:', latencies.length, 'Connection status:', connectionStatus);
    
    // If no latency data, use estimated values based on connection status
    if (latencies.length === 0) {
      const estimatedLatency = connectionStatus === 'connected' ? 50 + Math.random() * 100 : 0;
      const estimatedJitter = connectionStatus === 'connected' ? 10 + Math.random() * 30 : 0;
      const estimatedPacketLoss = connectionStatus === 'connected' ? Math.random() * 5 : 0;
      
      const newStats = {
        averageLatency: Math.round(estimatedLatency),
        jitter: Math.round(estimatedJitter),
        packetLoss: Math.round(estimatedPacketLoss),
        bufferSize: audioChunksRef.current.length,
        jitterBufferDelay: Math.round(jitterBufferDelayRef.current)
      };
      
      console.log('Using estimated network stats:', newStats);
      setNetworkStats(newStats);
      return;
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const variance = latencies.reduce((sum, lat) => sum + Math.pow(lat - avgLatency, 2), 0) / latencies.length;
    const jitter = Math.sqrt(variance);
    
    // Calculate packet loss (simplified)
    const sentPackets = packetTimestampsRef.current.size;
    const receivedAudioChunks = audioChunksRef.current.length;
    
    // Calculate packet loss more realistically
    let packetLoss = 0;
    if (sentPackets > 0) {
      // Estimate packet loss based on the ratio of sent vs received
      const expectedRatio = 0.8; // Assume 80% of sent packets should result in audio
      const actualRatio = receivedAudioChunks / sentPackets;
      packetLoss = Math.max(0, (expectedRatio - actualRatio) / expectedRatio) * 100;
      
      // Cap packet loss at reasonable levels
      packetLoss = Math.min(packetLoss, 20); // Max 20% packet loss
    }

    // Adjust buffer size based on network conditions
    let newBufferSize = bufferSizeRef.current;
    
    if (jitter > 50) {
      // High jitter - increase buffer
      newBufferSize = Math.min(maxBufferSize, newBufferSize + 1);
    } else if (jitter < 20 && avgLatency < targetLatency) {
      // Low jitter and good latency - decrease buffer
      newBufferSize = Math.max(minBufferSize, newBufferSize - 1);
    }

    // Adjust for packet loss
    if (packetLoss > 5) {
      newBufferSize = Math.min(maxBufferSize, newBufferSize + 1);
    }

    bufferSizeRef.current = newBufferSize;

    const newStats = {
      averageLatency: Math.round(avgLatency),
      jitter: Math.round(jitter),
      packetLoss: Math.round(packetLoss),
      bufferSize: newBufferSize,
      jitterBufferDelay: Math.round(jitterBufferDelayRef.current)
    };
    
    console.log('Calculated network stats:', newStats);
    setNetworkStats(newStats);

    // Keep only last 20 measurements
    if (latencies.length > 20) {
      networkLatencyRef.current = latencies.slice(-20);
    }
  }, [connectionStatus]);

  // const calculateJitterBufferDelay = useCallback(() => {
  //   if (jitterHistoryRef.current.length < 5) return 100; // Default 100ms
    
  //   // Calculate jitter (variance in packet arrival times)
  //   const jitterValues = jitterHistoryRef.current.slice(-10);
  //   const meanJitter = jitterValues.reduce((a, b) => a + b, 0) / jitterValues.length;
  //   const jitterVariance = jitterValues.reduce((sum, val) => sum + Math.pow(val - meanJitter, 2), 0) / jitterValues.length;
  //   const jitterStdDev = Math.sqrt(jitterVariance);
    
  //   // Dynamic buffer sizing based on jitter
  //   let newDelay = 100; // Base delay
    
  //   if (jitterStdDev > 50) {
  //     newDelay = 200; // High jitter: larger buffer
  //   } else if (jitterStdDev > 20) {
  //     newDelay = 150; // Medium jitter: medium buffer
  //   } else {
  //     newDelay = 80; // Low jitter: smaller buffer for lower latency
  //   }
    
  //   // Smooth transition to avoid sudden changes
  //   const currentDelay = jitterBufferDelayRef.current;
  //   const smoothedDelay = currentDelay * 0.7 + newDelay * 0.3;
    
  //   jitterBufferDelayRef.current = Math.max(50, Math.min(300, smoothedDelay)); // Clamp between 50-300ms
    
  //   return jitterBufferDelayRef.current;
  // }, []);

  // Voice Activity Detection with interruption handling
  const handleVoiceActivity = useCallback((isActive: boolean) => {
    setIsVoiceActive(isActive);
    
    // Clear existing timeouts
    if (voiceActivityTimeoutRef.current) {
      clearTimeout(voiceActivityTimeoutRef.current);
      voiceActivityTimeoutRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (isActive) {
      // If user starts speaking while AI is talking, interrupt the AI
      if (isAudioPlayingRef.current && currentAudioRef.current) {
        console.log('User interruption detected - stopping AI audio');
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
        isAudioPlayingRef.current = false;
        
        // Clear audio queues for fresh start
        audioChunksRef.current = [];
      }
      
      // Voice detected - set listening state
      setListeningState('listening');
      
      // Set timeout to return to idle if no voice for 2 seconds
      silenceTimeoutRef.current = window.setTimeout(() => {
        setListeningState('idle');
        setIsVoiceActive(false);
      }, 2000);
    } else {
      // No voice detected - wait a bit before going idle
      voiceActivityTimeoutRef.current = window.setTimeout(() => {
        if (!isVoiceActive) {
          setListeningState('idle');
        }
      }, 500);
    }
  }, [isVoiceActive]);

  // Audio buffer for accumulating chunks
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioChunksRef = useRef<ArrayBuffer[]>([]);
  const isAudioPlayingRef = useRef<boolean>(false);

  // Continuous audio stream management
  const playContinuousAudio = useCallback(async () => {
    if (isAudioPlayingRef.current || audioChunksRef.current.length === 0) {
      return;
    }

    isAudioPlayingRef.current = true;
    setListeningState('speaking');

    try {
      // Ensure audio context is resumed
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Concatenate all audio chunks into a single blob
      const concatenatedChunks = audioChunksRef.current;
      audioChunksRef.current = []; // Clear the queue
      
      if (concatenatedChunks.length === 0) {
        isAudioPlayingRef.current = false;
        setListeningState('idle');
        return;
      }

      // Create a single blob from all chunks
      const audioBlob = new Blob(concatenatedChunks, { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      currentAudioRef.current = audio;
      
      // Set proper playback settings
      audio.playbackRate = 1.0;
      audio.volume = 0.8;
      
      // Connect to audio context for better control
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        const source = audioContextRef.current.createMediaElementSource(audio);
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.setValueAtTime(0.8, audioContextRef.current.currentTime);
        
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
      }
      
      // Handle audio events
      audio.oncanplaythrough = () => {
        audio.play().then(() => {
          console.log('Continuous audio playing, duration:', audio.duration, 'chunks:', concatenatedChunks.length);
        }).catch((error) => {
          console.error('Continuous audio playback error:', error);
          URL.revokeObjectURL(audioUrl);
          isAudioPlayingRef.current = false;
          setListeningState('idle');
        });
      };
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        isAudioPlayingRef.current = false;
        
        // Check if there's more audio to play
        if (audioChunksRef.current.length > 0) {
          // Small delay before playing next batch
          setTimeout(() => playContinuousAudio(), 50);
        } else {
          setListeningState('idle');
        }
      };
      
      audio.onerror = (error) => {
        console.error('Continuous audio element error:', error);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        isAudioPlayingRef.current = false;
        setListeningState('idle');
      };
      
    } catch (error) {
      console.error('Error in continuous audio playback:', error);
      isAudioPlayingRef.current = false;
      setListeningState('idle');
    }
  }, []);

  // Audio playback queue management - DEPRECATED
  // const playNextInQueue = useCallback(() => {
  //   // This function is now deprecated in favor of playContinuousAudio
  //   console.log('playNextInQueue deprecated - using playContinuousAudio');
  // }, []);

  const handleConnectionError = useCallback((errorMessage: string) => {
    const maxRetries = 3; // Default max retries
    const currentRetry = recoveryInfo.retryAttempt;
    
    if (currentRetry < maxRetries) {
      setConnectionStatus('recovering');
      setRecoveryInfo(prev => ({
        ...prev,
        isRecovering: true,
        retryAttempt: currentRetry + 1,
        lastError: errorMessage,
        recoveryStrategy: ['retry', 'fallback']
      }));
      
      const retryDelay = Math.pow(2, currentRetry) * 1000; // Exponential backoff
      console.log(`Connection attempt ${currentRetry + 1} failed, retrying in ${retryDelay/1000}s...`);
      
      // Use a simple retry mechanism without circular dependency
      setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.close();
        }
        setConnectionStatus('connecting');
      }, retryDelay);
    } else {
      setConnectionStatus('error');
      setRecoveryInfo(prev => ({
        ...prev,
        isRecovering: false,
        lastError: errorMessage,
        recoveryStrategy: ['manual_reconnect']
      }));
      console.error('Max retry attempts reached');
    }
  }, [recoveryInfo.retryAttempt]);

  const connect = useCallback(async () => {
    if (socketRef.current) return;

    setConnectionStatus('connecting');
    try {
      // Ensure user interaction for audio context (required by browsers)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Test audio output with a simple beep to ensure speaker is working
      if (audioContextRef.current) {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4 note
        gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime); // Low volume
        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.1); // 100ms beep
        console.log('Audio context test: Speaker should be working');
      }
              // Initialize AudioContext for both input and output
        if (!audioContextRef.current) {
          const context = new AudioContext({ sampleRate: 44100 }); // Use 44.1kHz for audio output
          await context.audioWorklet.addModule('/audio-processor.js');
          audioContextRef.current = context;
          console.log('Audio context initialized with sample rate:', context.sampleRate);
        }

        // Resume audio context (required for audio output)
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
          console.log('Audio context resumed from suspended state');
        }
        
        console.log('Audio context state:', audioContextRef.current.state);
        console.log('Audio context sample rate:', audioContextRef.current.sampleRate);

      const socket = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);
      console.log('Connecting to WebSocket URL:', import.meta.env.VITE_WEBSOCKET_URL);
      socketRef.current = socket;

      socket.onopen = async () => {
        console.log('WebSocket connected successfully');
        setConnectionStatus('connected');
        setListeningState('idle');
        setRecoveryInfo(prev => ({ ...prev, isRecovering: false, retryAttempt: 0, lastError: null }));

        // Start microphone stream with proper audio constraints
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        const source = audioContextRef.current!.createMediaStreamSource(stream);
        const workletNode = new AudioWorkletNode(audioContextRef.current!, 'audio-processor');
        
        workletNode.port.onmessage = (event) => {
          if (socket.readyState === WebSocket.OPEN) {
            // Send audio data with packet tracking
            const packetId = `packet_${Date.now()}_${Math.random()}`;
            packetTimestampsRef.current.set(packetId, performance.now());
            
            socket.send(event.data.audioData);
            
            // Handle voice activity detection
            if (event.data.voiceActivity !== undefined) {
              handleVoiceActivity(event.data.voiceActivity);
            }
          }
        };

        source.connect(workletNode);
        // Don't connect to destination to avoid feedback
        audioWorkletNodeRef.current = workletNode;
      };

      socket.onmessage = (event) => {
        console.log('WebSocket message received:', {
          type: typeof event.data,
          size: event.data instanceof Blob ? event.data.size : event.data instanceof ArrayBuffer ? event.data.byteLength : event.data.length,
          isString: typeof event.data === 'string',
          isBlob: event.data instanceof Blob,
          isArrayBuffer: event.data instanceof ArrayBuffer
        });
        
        if (typeof event.data === 'string') {
          // Handle different message types
          try {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
              case 'interim_transcript':
                setInterimTranscript(message.text);
                setListeningState('listening');
                break;
                
              case 'final_transcript':
                setInterimTranscript(''); // Clear interim when final arrives
                console.log('Final Transcript Message:', message); // Debug log
                setFinalTranscripts(prev => [...prev, message]);
                setTranscript(message.text);
                setListeningState('processing');
                
                // Add realistic thinking delay before AI starts responding
                setTimeout(() => {
                  setListeningState('thinking');
                }, 500 + Math.random() * 1000); // 0.5-1.5s thinking delay
                break;
                
              case 'processing_complete':
                setListeningState('speaking');
                // Store AI response and start word highlighting
                const aiResponseText = message.response || '';
                
                console.log('AI Response Text:', aiResponseText); // Debug log
                
                // Improved word splitting that handles concatenated words
                const aiWords = aiResponseText
                  .split(/\s+/)
                  .map((word: string) => word.trim())
                  .filter((word: string) => word.length > 0)
                  .flatMap((word: string) => {
                    // Split concatenated words (e.g., "HiDarshan!" -> ["Hi", "Darshan", "!"])
                    return word.match(/[A-Z][a-z]*|[a-z]+|[0-9]+|[^\w\s]/g) || [word];
                  })
                  .filter((word: string) => word.length > 0);
                
                console.log('AI Words after splitting:', aiWords); // Debug log
                
                // Add a small delay before starting to type for more realistic conversation flow
                setTimeout(() => {
                  const typingSpeed = 50 + Math.random() * 30; // 50-80ms per character for realistic typing
                  
                  setAiResponse({
                    text: aiResponseText,
                    words: aiWords,
                    isComplete: true,
                    isTyping: true,
                    displayedText: '',
                    typingSpeed
                  });
                  
                  // Start typing animation for lifelike conversation
                  startTypingAnimation(aiResponseText, typingSpeed);
                }, 200 + Math.random() * 300); // 200-500ms delay before typing starts
                break;
                
              case 'transcript': // Legacy support
                setTranscript(message.text);
                setListeningState('processing');
                break;
                
              case 'word_timing_start':
                // Initialize word timing data
                const words = message.text.split(' ').map((word: string, index: number) => ({
                  word,
                  index,
                  timestamp: 0,
                  isActive: false
                }));
                setWordTimingData({
                  text: message.text,
                  words,
                  currentWordIndex: -1,
                  isActive: true
                });
                setListeningState('speaking');
                break;
                
              case 'word_highlight':
                // Update word highlighting
                setWordTimingData(prev => {
                  const newWords = [...prev.words];
                  if (message.word_index < newWords.length) {
                    // Deactivate previous word
                    if (prev.currentWordIndex >= 0 && prev.currentWordIndex < newWords.length) {
                      newWords[prev.currentWordIndex].isActive = false;
                    }
                    // Activate current word
                    newWords[message.word_index].isActive = true;
                    newWords[message.word_index].timestamp = message.timestamp;
                    
                    return {
                      ...prev,
                      words: newWords,
                      currentWordIndex: message.word_index
                    };
                  }
                  return prev;
                });
                break;
                
              case 'word_timing_complete':
                // Complete word timing
                setWordTimingData(prev => ({
                  ...prev,
                  isActive: false,
                  currentWordIndex: -1
                }));
                setListeningState('idle');
                break;
                
              case 'audio_enhancement':
                // Audio enhancement disabled for compatibility
                console.log('Audio enhancement disabled for MP3 compatibility');
                break;
                
              default:
                console.log('Unknown message type:', message.type);
            }
          } catch (error) {
            // Fallback for plain text
            setTranscript(event.data);
            setListeningState('processing');
          }
        } else if (event.data instanceof Blob) {
          // Convert Blob to ArrayBuffer for Web Audio API
          event.data.arrayBuffer().then(async (arrayBuffer) => {
            console.log('Received Blob audio data, size:', arrayBuffer.byteLength);
            
            // Calculate latency for this packet
            const receiveTime = performance.now();
            const packetId = `packet_${Date.now()}_${Math.random()}`;
            const sendTime = packetTimestampsRef.current.get(packetId);
            
            if (sendTime) {
              const latency = receiveTime - sendTime;
              networkLatencyRef.current.push(latency);
              packetTimestampsRef.current.delete(packetId);
            } else {
              // If no matching send time, estimate latency based on connection
              const estimatedLatency = 50 + Math.random() * 100;
              networkLatencyRef.current.push(estimatedLatency);
            }
            
            // Update network stats periodically
            if (networkLatencyRef.current.length % 3 === 0) {
              calculateNetworkStats();
            }
            
            // Accumulate audio chunks for continuous playback
            audioChunksRef.current.push(arrayBuffer);
            console.log('Added audio chunk to continuous queue. Queue size:', audioChunksRef.current.length);
            
            // Start playback if we have enough chunks and not currently playing
            if (!isAudioPlayingRef.current && audioChunksRef.current.length >= 3) {
              console.log('Starting continuous audio playback with', audioChunksRef.current.length, 'chunks');
              playContinuousAudio();
            }
          });
        } else if (event.data instanceof ArrayBuffer) {
          // Handle direct ArrayBuffer
          console.log('Received ArrayBuffer audio data, size:', event.data.byteLength);
          
          // Estimate latency for ArrayBuffer data
          const estimatedLatency = 50 + Math.random() * 100;
          networkLatencyRef.current.push(estimatedLatency);
          
          // Update network stats periodically
          if (networkLatencyRef.current.length % 3 === 0) {
            calculateNetworkStats();
          }
          
          audioChunksRef.current.push(event.data);
          console.log('Added ArrayBuffer to continuous queue. Queue size:', audioChunksRef.current.length);
          
          // Start playback if we have enough chunks and not currently playing
          if (!isAudioPlayingRef.current && audioChunksRef.current.length >= 3) {
            console.log('Starting continuous audio playback with', audioChunksRef.current.length, 'chunks');
            playContinuousAudio();
          }
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        handleConnectionError('WebSocket connection error');
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        if (event.code === 1000) {
          // Normal closure
          setConnectionStatus('disconnected');
          setListeningState('idle');
          setIsVoiceActive(false);
          audioWorkletNodeRef.current?.disconnect();
          socketRef.current = null;
          
          // Clear timeouts
          if (voiceActivityTimeoutRef.current) {
            clearTimeout(voiceActivityTimeoutRef.current);
            voiceActivityTimeoutRef.current = null;
          }
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        } else {
          // Abnormal closure - attempt recovery
          handleConnectionError(`Connection closed with code ${event.code}`);
        }
      };
    } catch (error) {
      console.error('Failed to connect or get media:', error);
      setConnectionStatus('error');
      setListeningState('idle');
    }
  }, [playContinuousAudio, handleVoiceActivity]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    // Stop current audio playback
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    // Clear audio queues
    audioChunksRef.current = [];
    isAudioPlayingRef.current = false;
    
    setListeningState('idle');
    setIsVoiceActive(false);
    setTranscript('');
    
    // Clear timeouts
    if (voiceActivityTimeoutRef.current) {
      clearTimeout(voiceActivityTimeoutRef.current);
      voiceActivityTimeoutRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  // Clear transcripts functionality
  const clearTranscripts = useCallback(() => {
    setFinalTranscripts([]);
    setInterimTranscript('');
    setCurrentSpokenWordIndex(null);
    setTranscript('');
    setAiResponse(null);
    setWordTimingData({
      text: '',
      words: [],
      currentWordIndex: -1,
      isActive: false
    });
  }, []);

  // Simulate word-by-word highlighting for AI responses
  const simulateWordHighlighting = useCallback((response: string) => {
    // Use the same improved word splitting logic
    const words = response
      .split(/\s+/)
      .map((word: string) => word.trim())
      .filter((word: string) => word.length > 0)
      .flatMap((word: string) => {
        // Split concatenated words (e.g., "HiDarshan!" -> ["Hi", "Darshan", "!"])
        return word.match(/[A-Z][a-z]*|[a-z]+|[0-9]+|[^\w\s]/g) || [word];
      })
      .filter((word: string) => word.length > 0);
    
    let wordIndex = 0;
    
    const highlightNextWord = () => {
      if (wordIndex >= words.length) {
        setCurrentSpokenWordIndex(null);
        setListeningState('idle');
        return;
      }
      
      setCurrentSpokenWordIndex(wordIndex);
      wordIndex++;
      
      // Simulate word duration (adjust timing as needed)
      const wordDuration = 200 + Math.random() * 300; // 200-500ms per word
      setTimeout(highlightNextWord, wordDuration);
    };
    
    highlightNextWord();
  }, []);

  // Advanced typing animation for lifelike conversation
  const startTypingAnimation = useCallback((fullText: string, typingSpeed: number) => {
    let currentIndex = 0;
    const totalLength = fullText.length;
    
    const typeNextCharacter = () => {
      if (currentIndex >= totalLength) {
        // Typing complete
        setAiResponse(prev => prev ? {
          ...prev,
          isTyping: false,
          displayedText: fullText
        } : null);
        
        // Add realistic pause before speaking starts
        setTimeout(() => {
          setListeningState('speaking');
          // Start word highlighting after typing is complete
          setTimeout(() => {
            simulateWordHighlighting(fullText);
          }, 300); // Small delay before highlighting starts
        }, 800 + Math.random() * 400); // 0.8-1.2s pause after typing
        
        return;
      }
      
      // Add next character with realistic timing variations
      const nextChar = fullText[currentIndex];
      const baseDelay = typingSpeed;
      
      // Add natural variations based on character type
      let delay = baseDelay;
      if (nextChar === ' ') delay *= 0.3; // Faster for spaces
      else if (nextChar === '.' || nextChar === '!' || nextChar === '?') delay *= 1.5; // Slower for punctuation
      else if (nextChar === ',' || nextChar === ';') delay *= 1.2; // Slightly slower for commas
      else if (nextChar.match(/[A-Z]/)) delay *= 1.1; // Slightly slower for capital letters
      
      // Add random variation for more natural feel
      delay += (Math.random() - 0.5) * 20;
      
      setAiResponse(prev => prev ? {
        ...prev,
        displayedText: fullText.substring(0, currentIndex + 1)
      } : null);
      
      currentIndex++;
      setTimeout(typeNextCharacter, delay);
    };
    
    typeNextCharacter();
  }, [simulateWordHighlighting]);

  // Create buffer info for dashboard display
  const bufferInfo = {
    size: audioChunksRef.current.length,
    capacity: 50, // Increased capacity for continuous audio
    delay: jitterBufferDelayRef.current,
    isPlaying: isAudioPlayingRef.current
  };

  // Debug buffer status
  useEffect(() => {
    if (connectionStatus === 'connected') {
      console.log('Buffer Status:', {
        audioQueueSize: audioChunksRef.current.length,
        enhancedQueueSize: 0, // No longer used
        totalSize: audioChunksRef.current.length,
        isPlaying: isAudioPlayingRef.current,
        capacity: 50 // Increased capacity for continuous audio
      });
    }
  }, [bufferInfo.size, connectionStatus]);

  // Save network stats to sessionStorage for analytics
  useEffect(() => {
    if (connectionStatus === 'connected') {
      console.log('Saving network stats to sessionStorage:', networkStats);
      appendSessionData('session_kpis', {
        ...networkStats,
        bufferSize: bufferInfo.size,
      });
    }
  }, [networkStats, connectionStatus, bufferInfo.size]);

  // Periodic network stats update for analytics
  useEffect(() => {
    if (connectionStatus === 'connected') {
      const interval = setInterval(() => {
        calculateNetworkStats();
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [connectionStatus, calculateNetworkStats]);

  // Save conversation history to sessionStorage for analytics
  useEffect(() => {
    if (finalTranscripts.length > 0) {
      const lastTranscript = finalTranscripts[finalTranscripts.length - 1];
      const aiResponseText = aiResponse?.text || '';
      
      // Only save if we have both user input and AI response
      if (lastTranscript.text && aiResponseText) {
        appendSessionData('session_chat', {
          user: lastTranscript.text,
          ai: aiResponseText,
        });
      }
    }
  }, [finalTranscripts, aiResponse]);

  // Clear session storage on new connection for clean slate
  const connectWithCleanup = useCallback(async () => {
    // Clear previous session data
    sessionStorage.removeItem('session_kpis');
    sessionStorage.removeItem('session_chat');
    
    // Call original connect function
    await connect();
  }, [connect]);

  // Connection health check
  useEffect(() => {
    if (connectionStatus === 'connected') {
      const healthCheck = setInterval(() => {
        console.log('Connection Health Check:', {
          connectionStatus,
          listeningState,
          audioQueueSize: audioChunksRef.current.length,
          enhancedQueueSize: 0, // No longer used
          isPlaying: isAudioPlayingRef.current,
          networkStats,
          bufferInfo: { size: audioChunksRef.current.length, capacity: 50 }
        });
      }, 5000); // Every 5 seconds

      return () => clearInterval(healthCheck);
    }
  }, [connectionStatus, listeningState, networkStats, bufferInfo]);

  return {
    connectionStatus,
    listeningState,
    isVoiceActive,
    transcript,
    wordTimingData,
    // Advanced transcript state
    interimTranscript,
    finalTranscripts,
    currentSpokenWordIndex,
    aiResponse,
    networkStats,
    errorStats,
    recoveryInfo,
    bufferInfo,
    connect: connectWithCleanup,
    disconnect,
    clearTranscripts,
  };
}; 