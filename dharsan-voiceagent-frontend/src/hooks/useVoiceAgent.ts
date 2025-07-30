import { useState, useRef, useCallback, useEffect } from 'react';
import type { 
  ConversationMetrics, 
  NetworkMetrics, 
  SessionMetrics,
  ConversationExchange,
  MetricsMessage} from '../types/metrics';
import { 
  StorageUtils, 
  MetricsStorage, 
  ConversationStorage, 
  SessionStorage, 
  NetworkStatsStorage, 
  ErrorStatsStorage
} from '../utils/storage';
import { getServiceUrls } from '../config/production';

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

// Enhanced metrics functions
const sendNetworkMetrics = (socket: WebSocket, metrics: NetworkMetrics) => {
  if (socket.readyState === WebSocket.OPEN) {
    const message: MetricsMessage = {
      type: 'metrics',
      data: metrics
    };
    socket.send(JSON.stringify(message));
  }
};



const fetchSessionMetrics = async (sessionId: string): Promise<SessionMetrics | null> => {
  try {
    const { orchestratorHttpUrl } = getServiceUrls();
    const baseUrl = orchestratorHttpUrl;
    const response = await fetch(`${baseUrl}/metrics/session/${sessionId}/realtime`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch session metrics:', error);
  }
  return null;
};

export const useVoiceAgent = (version: 'v1' | 'v2' | 'webrtc' = 'v1') => {
  // Initialize session ID
  const [sessionId] = useState<string>(() => {
    const currentSession = SessionStorage.getCurrent();
    return currentSession?.sessionId || StorageUtils.generateSessionId();
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [listeningState, setListeningState] = useState<ListeningState>('idle');
  const [transcript, setTranscript] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  // Load network stats from storage
  const [networkStats, setNetworkStats] = useState<NetworkStats>(() => {
    return NetworkStatsStorage.get();
  });

  // Enhanced metrics state
  const [currentMetrics, setCurrentMetrics] = useState<ConversationMetrics | null>(null);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationExchange[]>(() => {
    const storedConversations = ConversationStorage.getBySession(sessionId);
    return storedConversations.map(conv => ({
      user_input: conv.userInput,
      ai_response: conv.aiResponse,
      processing_time_seconds: conv.processingTime,
      timestamp: conv.timestamp,
    }));
  });
  const [metricsVisible, setMetricsVisible] = useState(false);
  
  // Error tracking and recovery
  const [errorStats] = useState<ErrorStats>(() => {
    return ErrorStatsStorage.get();
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

  // Advanced transcript state with real-time feedback
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscripts, setFinalTranscripts] = useState<FinalTranscript[]>([]);
  const [currentSpokenWordIndex, setCurrentSpokenWordIndex] = useState<number | null>(null);
  const [transcriptConfidence, setTranscriptConfidence] = useState<number>(0);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date | null>(null);
  
  // AI response state
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const voiceActivityTimeoutRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);

  // Save data to storage when it changes
  useEffect(() => {
    NetworkStatsStorage.update(networkStats);
  }, [networkStats]);

  useEffect(() => {
    ErrorStatsStorage.update(errorStats);
  }, [errorStats]);

  // Initialize session on mount and cleanup on unmount
  useEffect(() => {
    const currentSession = SessionStorage.getCurrent();
    if (!currentSession) {
      const newSession = {
        sessionId,
        totalExchanges: 0,
        averageLatency: 0,
        totalErrors: 0,
        status: 'active' as const,
      };
      SessionStorage.add(newSession);
      SessionStorage.setCurrent({
        ...newSession,
        startTime: new Date().toISOString(),
      });
    }

    // Cleanup function to end session when component unmounts
    return () => {
      SessionStorage.endSession(sessionId);
      SessionStorage.setCurrent(null);
    };
  }, [sessionId]);
  
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
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Continuous audio stream management
  const playContinuousAudio = useCallback(async () => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 TTS PINPOINT [${timestamp}]: playContinuousAudio called`);
    
    if (isAudioPlayingRef.current || audioChunksRef.current.length === 0) {
      console.log(`🔍 TTS PINPOINT [${timestamp}]: Skipping playback - isPlaying: ${isAudioPlayingRef.current}, queueSize: ${audioChunksRef.current.length}`);
      return;
    }

    console.log(`🔍 TTS PINPOINT [${timestamp}]: Starting continuous audio playback`);
    isAudioPlayingRef.current = true;
    setListeningState('speaking');

    try {
      // Ensure audio context is resumed
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log(`🔍 TTS PINPOINT [${timestamp}]: Resuming audio context`);
        await audioContextRef.current.resume();
      }

      // Wait for all chunks to arrive before playing (for smooth playback)
      if (audioChunksRef.current.length < 2) {
        console.log(`🔍 TTS PINPOINT [${timestamp}]: Waiting for more chunks (${audioChunksRef.current.length}/2)`);
        setTimeout(() => playContinuousAudio(), 100);
        return;
      }

      // Take all available chunks for seamless playback
      const allChunks = [...audioChunksRef.current];
      audioChunksRef.current = [];
      console.log(`🔍 TTS PINPOINT [${timestamp}]: Playing all ${allChunks.length} chunks for seamless audio`);
      
      if (allChunks.length === 0) {
        console.log(`🔍 TTS PINPOINT [${timestamp}]: No chunks to play, stopping`);
        isAudioPlayingRef.current = false;
        setListeningState('idle');
        return;
      }

      // Create a single blob from all chunks for seamless playback
      const audioBlob = new Blob(allChunks, { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log(`🔍 TTS PINPOINT [${timestamp}]: Created seamless audio blob, size: ${audioBlob.size} bytes`);
      
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      currentAudioRef.current = audio;
      
      // Set optimal playback settings for conversational audio
      audio.playbackRate = 1.0;
      audio.volume = 0.9; // Slightly higher volume for clarity
      
      // Add more detailed logging for audio element
      console.log(`🔍 TTS PINPOINT [${timestamp}]: Audio element created:`, {
        src: audioUrl,
        preload: audio.preload,
        volume: audio.volume,
        playbackRate: audio.playbackRate,
        readyState: audio.readyState,
        networkState: audio.networkState,
        totalChunks: allChunks.length
      });
      
      // Connect to audio context for better control and quality
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        const source = audioContextRef.current.createMediaElementSource(audio);
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.setValueAtTime(0.9, audioContextRef.current.currentTime);
        
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        console.log(`🔍 TTS PINPOINT [${timestamp}]: Connected audio to Web Audio API for enhanced quality`);
      } else {
        console.warn(`🔍 TTS PINPOINT [${timestamp}]: Audio context not available or not running:`, {
          hasContext: !!audioContextRef.current,
          contextState: audioContextRef.current?.state
        });
      }
      
      // Handle audio events with more detailed logging
      audio.onloadstart = () => {
        console.log(`🔍 TTS PINPOINT [${timestamp}]: Audio load started`);
      };
      
      audio.oncanplay = () => {
        console.log(`🔍 TTS PINPOINT [${timestamp}]: Audio can play`);
      };
      
      audio.oncanplaythrough = () => {
        const playTimestamp = new Date().toISOString();
        console.log(`🔍 TTS PINPOINT [${playTimestamp}]: Audio can play through, starting seamless playback`);
        console.log(`🔍 TTS PINPOINT [${playTimestamp}]: Audio details:`, {
          duration: audio.duration,
          currentTime: audio.currentTime,
          readyState: audio.readyState,
          networkState: audio.networkState,
          totalChunks: allChunks.length
        });
        
        audio.play().then(() => {
          console.log(`🔍 TTS PINPOINT [${playTimestamp}]: Seamless audio playback started successfully!`);
          console.log(`🔍 TTS PINPOINT [${playTimestamp}]: Audio playback details:`, {
            duration: audio.duration,
            currentTime: audio.currentTime,
            volume: audio.volume,
            muted: audio.muted,
            paused: audio.paused,
            chunks_played: allChunks.length,
            remaining_in_queue: audioChunksRef.current.length
          });
          
          // Set a timeout to ensure audio doesn't get stuck
          if (audioTimeoutRef.current) {
            clearTimeout(audioTimeoutRef.current);
          }
          audioTimeoutRef.current = setTimeout(() => {
            const timeoutTimestamp = new Date().toISOString();
            console.log(`🔍 TTS PINPOINT [${timeoutTimestamp}]: Audio timeout - forcing cleanup`);
            if (currentAudioRef.current) {
              currentAudioRef.current.pause();
              currentAudioRef.current = null;
            }
            isAudioPlayingRef.current = false;
            setListeningState('idle');
          }, (audio.duration * 1000) + 2000); // Audio duration + 2 seconds buffer
          
        }).catch((error) => {
          const errorTimestamp = new Date().toISOString();
          console.error(`🔍 TTS PINPOINT [${errorTimestamp}]: Audio playback error:`, error);
          console.error(`🔍 TTS PINPOINT [${errorTimestamp}]: Error details:`, {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          URL.revokeObjectURL(audioUrl);
          isAudioPlayingRef.current = false;
          setListeningState('idle');
        });
      };
      
      audio.onended = () => {
        const endTimestamp = new Date().toISOString();
        console.log(`🔍 TTS PINPOINT [${endTimestamp}]: Seamless audio playback ended normally`);
        
        // Clear timeout since audio ended normally
        if (audioTimeoutRef.current) {
          clearTimeout(audioTimeoutRef.current);
          audioTimeoutRef.current = null;
        }
        
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        isAudioPlayingRef.current = false;
        
        // Check if there's more audio to play (new chunks arrived during playback)
        if (audioChunksRef.current.length > 0) {
          console.log(`🔍 TTS PINPOINT [${endTimestamp}]: More audio in queue (${audioChunksRef.current.length} chunks), scheduling next batch`);
          // Small delay before playing next batch
          setTimeout(() => playContinuousAudio(), 50);
        } else {
          console.log(`🔍 TTS PINPOINT [${endTimestamp}]: No more audio in queue, setting to idle`);
          setListeningState('idle');
        }
      };
      
      audio.onerror = (error) => {
        const errorTimestamp = new Date().toISOString();
        console.error(`🔍 TTS PINPOINT [${errorTimestamp}]: Audio element error:`, error);
        console.error(`🔍 TTS PINPOINT [${errorTimestamp}]: Audio error details:`, {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState
        });
        
        // Clear timeout on error
        if (audioTimeoutRef.current) {
          clearTimeout(audioTimeoutRef.current);
          audioTimeoutRef.current = null;
        }
        
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        isAudioPlayingRef.current = false;
        setListeningState('idle');
      };
      
    } catch (error) {
      const errorTimestamp = new Date().toISOString();
      console.error(`🔍 TTS PINPOINT [${errorTimestamp}]: Error in continuous audio playback:`, error);
      isAudioPlayingRef.current = false;
      setListeningState('idle');
    }
  }, []);

  // Simple audio test function
  const testAudioPlayback = useCallback(async () => {
    console.log('🔊 Testing audio playback...');
    
    try {
      // Create a simple test tone
      if (audioContextRef.current) {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4 note
        gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime); // Low volume
        
        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.5); // 500ms beep
        
        console.log('🔊 Test tone played successfully - audio system is working');
        return true;
      } else {
        console.error('🔊 No audio context available for test');
        return false;
      }
    } catch (error) {
      console.error('🔊 Audio test failed:', error);
      return false;
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
    // Only connect if this is the v1 version
    if (version !== 'v1') {
      console.log('V1 hook: Not connecting - version is', version);
      return;
    }

    if (socketRef.current) return;

    // Send session ID to backend for metrics tracking
    const sessionInfo = {
      type: 'session_info',
      session_id: sessionId
    };

          console.log('🔗 Attempting to connect to WebSocket...');
      console.log('Environment variables:');
      console.log('- VITE_WEBSOCKET_URL_V1:', import.meta.env.VITE_WEBSOCKET_URL_V1);
      console.log('- VITE_WEBSOCKET_URL:', import.meta.env.VITE_WEBSOCKET_URL);
      console.log('- NODE_ENV:', import.meta.env.NODE_ENV);
      console.log('- MODE:', import.meta.env.MODE);
      console.log('- All env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

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
          try {
            const context = new AudioContext({ sampleRate: 16000 }); // Use 16kHz to match microphone
            console.log('Audio context created, loading audio worklet...');
            await context.audioWorklet.addModule('/audio-processor.js');
            console.log('Audio worklet loaded successfully');
            audioContextRef.current = context;
            console.log('Audio context initialized with sample rate:', context.sampleRate);
          } catch (error) {
            console.error('Failed to initialize audio context:', error);
            throw new Error(`Audio initialization failed: ${error}`);
          }
        }

        // Resume audio context (required for audio output)
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
          console.log('Audio context resumed from suspended state');
        }
        
        console.log('Audio context state:', audioContextRef.current.state);
        console.log('Audio context sample rate:', audioContextRef.current.sampleRate);

      const { orchestratorWsUrl } = getServiceUrls();
      const websocketUrl = orchestratorWsUrl;
      const socket = new WebSocket(websocketUrl);
      console.log('Connecting to WebSocket URL:', websocketUrl);
      socketRef.current = socket;
      
      socket.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        console.error('WebSocket URL attempted:', websocketUrl);
        console.error('WebSocket ready state:', socket.readyState);
        setConnectionStatus('error');
        setListeningState('error');
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          url: websocketUrl
        });
        
        if (event.code === 1005) {
          console.error('WebSocket closed with unexpected code: 1005');
          console.error('This usually indicates a connection failure or server not responding');
        }
        
        setConnectionStatus('disconnected');
        setListeningState('idle');
        socketRef.current = null;
      };

      socket.onopen = async () => {
        console.log('WebSocket connected successfully');
        setConnectionStatus('connected');
        setListeningState('idle');
        setRecoveryInfo(prev => ({ ...prev, isRecovering: false, retryAttempt: 0, lastError: null }));
        
        // Send session info to backend for metrics tracking
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(sessionInfo));
          console.log('📊 Sent session info to backend:', sessionInfo);
        }
        
        try {

        // Start microphone stream with proper audio constraints
        console.log('Requesting microphone access...');
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              sampleRate: 16000,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            } 
          });
          console.log('Microphone access granted, stream tracks:', stream.getTracks().length);
        } catch (error) {
          console.error('Failed to access microphone:', error);
          throw new Error(`Microphone access failed: ${error}`);
        }
        
        const source = audioContextRef.current!.createMediaStreamSource(stream);
        const workletNode = new AudioWorkletNode(audioContextRef.current!, 'audio-processor');
        
        console.log('Audio worklet node created, setting up message handler...');
        
        workletNode.port.onmessage = (event) => {
          if (socket.readyState === WebSocket.OPEN) {
            // Send audio data with packet tracking
            const packetId = `packet_${Date.now()}_${Math.random()}`;
            packetTimestampsRef.current.set(packetId, performance.now());
            
            console.log(`Sending audio data: ${event.data.audioData.byteLength} bytes, voice activity: ${event.data.voiceActivity}`);
            socket.send(event.data.audioData);
            
            // Handle voice activity detection
            if (event.data.voiceActivity !== undefined) {
              handleVoiceActivity(event.data.voiceActivity);
            }
          } else {
            console.warn('WebSocket not open, cannot send audio data');
          }
        };

        source.connect(workletNode);
        // Don't connect to destination to avoid feedback
        audioWorkletNodeRef.current = workletNode;
        console.log('Audio pipeline setup complete');
      } catch (error) {
        console.error('Failed to setup audio pipeline:', error);
        setConnectionStatus('error');
        setListeningState('error');
        setRecoveryInfo(prev => ({ 
          ...prev, 
          isRecovering: true, 
          lastError: error instanceof Error ? error.message : 'Unknown audio error',
          recoveryStrategy: ['retry', 'fallback']
        }));
        throw error;
      }
    };

    socket.onmessage = (event) => {
        // TTS PINPOINT LOGGING - Track every audio chunk and state change
        const timestamp = new Date().toISOString();
        
        // Debug: Log all incoming messages
        console.log(`🎯 WebSocket message received:`, {
          type: typeof event.data,
          isBlob: event.data instanceof Blob,
          isArrayBuffer: event.data instanceof ArrayBuffer,
          size: event.data instanceof Blob ? event.data.size : event.data instanceof ArrayBuffer ? event.data.byteLength : event.data.length,
          preview: typeof event.data === 'string' ? event.data.substring(0, 100) : 'N/A'
        });
        
        // Special logging for audio chunks
        if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
          console.log(`🎵 AUDIO CHUNK RECEIVED:`, {
            type: event.data instanceof Blob ? 'Blob' : 'ArrayBuffer',
            size: event.data instanceof Blob ? event.data.size : event.data.byteLength,
            timestamp: new Date().toISOString()
          });
        }
        
        if (typeof event.data === 'string') {
          // Handle different message types
          try {
            const message = JSON.parse(event.data);
            
            // TTS PINPOINT: Log all TTS-related messages
            if (message.type === 'word_timing_start' || 
                message.type === 'word_highlight' || 
                message.type === 'word_timing_complete' ||
                message.type === 'processing_complete') {
              console.log(`🔍 TTS PINPOINT [${timestamp}]: ${message.type}`, message);
            }
            
            switch (message.type) {
              case 'info':
                console.log('Received info message:', message.message);
                break;
                
              case 'TEST_RESPONSE':
                console.log('Received test response from backend:', message);
                break;
                
              case 'heartbeat':
                console.log('Received heartbeat from backend:', message.timestamp);
                break;
                
              case 'transcript':
                // Handle both interim and final transcripts
                if (message.is_final) {
                  setInterimTranscript(''); // Clear interim when final arrives
                  console.log('Final Transcript Message:', message);
                  setFinalTranscripts(prev => [...prev, message]);
                  setTranscript(message.text);
                  setListeningState('processing');
                  
                  // Add realistic thinking delay before AI starts responding
                  setTimeout(() => {
                    setListeningState('thinking');
                  }, 500 + Math.random() * 1000); // 0.5-1.5s thinking delay
                } else {
                  setInterimTranscript(message.text);
                  setListeningState('listening');
                }
                break;
                
              case 'interim_transcript':
                console.log('🎤 Interim transcript received:', message.text);
                setInterimTranscript(message.text);
                setListeningState('listening');
                setLastTranscriptUpdate(new Date());
                // Estimate confidence based on text length and stability
                const estimatedConfidence = Math.min(0.7 + (message.text.length * 0.01), 0.95);
                setTranscriptConfidence(estimatedConfidence);
                break;
                
              case 'final_transcript':
                setInterimTranscript(''); // Clear interim when final arrives
                console.log('✅ Final transcript received:', message.text);
                console.log('📊 Word confidence data:', message.words?.length || 0, 'words');
                setFinalTranscripts(prev => [...prev, message]);
                setTranscript(message.text);
                setListeningState('processing');
                setLastTranscriptUpdate(new Date());
                
                // Calculate average confidence from word data
                if (message.words && message.words.length > 0) {
                  const avgConfidence = message.words.reduce((sum: number, word: Word) => sum + word.confidence, 0) / message.words.length;
                  setTranscriptConfidence(avgConfidence);
                  console.log('📊 Average confidence:', (avgConfidence * 100).toFixed(1) + '%');
                } else {
                  setTranscriptConfidence(0.9); // Default high confidence for text without word data
                }
                
                // Add realistic thinking delay before AI starts responding
                setTimeout(() => {
                  setListeningState('thinking');
                }, 500 + Math.random() * 1000); // 0.5-1.5s thinking delay
                break;
                
              case 'ai_response':
                console.log('🎯 AI Response Message received:', message);
                console.log('🎯 Current audio queue size:', audioChunksRef.current.length);
                setListeningState('speaking');
                
                // Store AI response and start word highlighting
                const aiResponseText = message.text || '';
                
                console.log('AI Response Text:', aiResponseText);
                
                // Improved word splitting that handles concatenated words
                const aiWords = aiResponseText
                  .split(/\s+/)
                  .map((word: string) => word.trim())
                  .filter((word: string) => word.length > 0)
                  .flatMap((word: string) => {
                    // Split concatenated words (e.g., "HiDarshan!" -> ["Hi", "Darshan", "!"])
                    return word.match(/[A-Z][a-z]*|[a-z]+|[0-9]+|[^\\w\\s]/g) || [word];
                  })
                  .filter((word: string) => word.length > 0);
                
                console.log('AI Words after splitting:', aiWords);
                
                // Add a small delay before starting to type for more realistic conversation flow
                setTimeout(() => {
                  const typingSpeed = 50 + Math.random() * 30; // 50-80ms per character for realistic typing
                  
                  console.log('🎯 Setting AI Response State:', {
                    text: aiResponseText,
                    words: aiWords,
                    isComplete: true,
                    isTyping: true,
                    displayedText: '',
                    typingSpeed: typingSpeed
                  });
                  
                  setAiResponse({
                    text: aiResponseText,
                    words: aiWords,
                    isComplete: true,
                    isTyping: true,
                    displayedText: '',
                    typingSpeed: typingSpeed
                  });
                  
                  // Start word timing data
                  setWordTimingData({
                    text: aiResponseText,
                    words: aiWords.map((word: string, index: number) => ({
                      word,
                      index,
                      timestamp: 0,
                      isActive: false
                    })),
                    currentWordIndex: -1,
                    isActive: true
                  });
                  
                  // Start typing simulation
                  simulateTypingAnimation(aiResponseText, typingSpeed);
                  simulateWordHighlighting(aiResponseText);
                }, 200);
                break;
                
              case 'processing_complete':
                console.log(`🔍 TTS PINPOINT [${timestamp}]: AI processing complete, starting TTS`);
                setListeningState('speaking');
                
                // Set AI response for display
                if (message.response) {
                  const aiResponseText = message.response;
                  const aiWords = aiResponseText.split(/\s+/);
                  const typingSpeed = 50; // ms per character
                  
                  console.log('🎯 Setting AI Response from processing_complete:', {
                    text: aiResponseText,
                    words: aiWords,
                    isComplete: true,
                    isTyping: true,
                    displayedText: '',
                    typingSpeed: typingSpeed
                  });
                  
                  setAiResponse({
                    text: aiResponseText,
                    words: aiWords,
                    isComplete: true,
                    isTyping: true,
                    displayedText: '',
                    typingSpeed: typingSpeed
                  });
                  
                  // Start word timing data
                  setWordTimingData({
                    text: aiResponseText,
                    words: aiWords.map((word: string, index: number) => ({
                      word,
                      index,
                      timestamp: 0,
                      isActive: false
                    })),
                    currentWordIndex: -1,
                    isActive: true
                  });
                  
                  // Start typing simulation
                  simulateTypingAnimation(aiResponseText, typingSpeed);
                  simulateWordHighlighting(aiResponseText);
                }
                
                // Handle enhanced metrics
                if (message.metrics) {
                  setCurrentMetrics(message.metrics);
                  console.log('Received conversation metrics:', message.metrics);
                  
                  // Add to conversation history
                  const exchange: ConversationExchange = {
                    user_input: transcript,
                    ai_response: message.response || '',
                    processing_time_seconds: message.metrics.processing_time_ms / 1000,
                    timestamp: new Date().toISOString()
                  };
                  setConversationHistory(prev => [...prev, exchange]);
                  
                  // Save to persistent storage
                  ConversationStorage.add({
                    userInput: transcript,
                    aiResponse: message.response || '',
                    confidence: 0.9, // Default confidence
                    processingTime: message.metrics.processing_time_ms / 1000,
                    sessionId,
                  });
                  
                  // Save metrics to storage
                  MetricsStorage.add({
                    averageLatency: networkStats.averageLatency,
                    jitter: networkStats.jitter,
                    packetLoss: networkStats.packetLoss,
                    processingTime: message.metrics.processing_time_ms,
                    sessionId,
                  });
                  
                  // Fetch updated session metrics
                  if (sessionId) {
                    fetchSessionMetrics(sessionId).then(setSessionMetrics);
                  }
                }
                break;
                

                
              case 'word_highlight':
                console.log(`🔍 TTS PINPOINT [${timestamp}]: Word highlight - ${message.word} at ${message.timestamp}s`);
                setWordTimingData(prev => ({
                  ...prev,
                  words: prev.words.map((word, index) => 
                    index === message.word_index 
                      ? { ...word, timestamp: message.timestamp, isActive: true }
                      : { ...word, isActive: false }
                  ),
                  currentWordIndex: message.word_index
                }));
                break;
                
              case 'word_timing_complete':
                console.log(`🔍 TTS PINPOINT [${timestamp}]: TTS synthesis completed, waiting for audio to finish`);
                setWordTimingData(prev => ({
                  ...prev,
                  isActive: false,
                  currentWordIndex: -1
                }));
                break;
                
              case 'audio_enhancement':
                // Audio enhancement disabled for compatibility
                console.log('Audio enhancement disabled for MP3 compatibility');
                break;
                
              case 'echo':
                // Only log echo messages in debug mode or first few messages
                if (import.meta.env.DEV && Math.random() < 0.1) {
                  console.log('Received echo message:', message.data);
                  console.log('Full echo message:', message);
                }
                break;
                
              case 'ping':
                console.log('Received ping message, sending pong');
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                  socketRef.current.send(JSON.stringify({ 
                    type: 'pong',
                    timestamp: Date.now()
                  }));
                }
                break;
                
              case 'error':
                console.error('Received error from backend:', message.message);
                setConnectionStatus('error');
                setListeningState('error');
                setRecoveryInfo(prev => ({ 
                  ...prev, 
                  isRecovering: true, 
                  lastError: message.message,
                  recoveryStrategy: ['retry', 'fallback']
                }));
                break;
                
              case 'tts_error':
                console.error('🔍 TTS PINPOINT: TTS Error received:', message);
                console.error('🔍 TTS PINPOINT: TTS Error details:', message.error_details);
                setListeningState('error');
                // Show TTS error to user but don't disconnect
                console.error(`TTS Service Error: ${message.message}`);
                if (message.error_details?.error_type === 'tts_fallback_error') {
                  console.error('Both primary and fallback TTS failed');
                }
                break;
                
              case 'pong':
                console.log('Received pong message');
                break;
                
              case 'metrics_ack':
                console.log('Metrics acknowledged by server:', message);
                break;
                
              case 'connection_established':
                console.log('Test connection established');
                break;
                
              default:
                console.log('Unknown message type:', message.type);
            }
          } catch (error) {
            // Handle plain text messages (like test responses)
            if (event.data.startsWith('TEST_RESPONSE:')) {
              console.log('Received test response from backend:', event.data);
              return;
            }
            // Fallback for other plain text
            console.log('Received plain text message:', event.data);
            setTranscript(event.data);
            setListeningState('processing');
          }
        } else if (event.data instanceof Blob) {
          // TTS PINPOINT: Log every audio blob received
          console.log(`🔍 TTS PINPOINT [${timestamp}]: Received Blob audio chunk, size: ${event.data.size} bytes`);
          
          // Convert Blob to ArrayBuffer for Web Audio API
          event.data.arrayBuffer().then(async (arrayBuffer) => {
            console.log(`🔍 TTS PINPOINT [${timestamp}]: Blob converted to ArrayBuffer, size: ${arrayBuffer.byteLength} bytes`);
            
            // Check if this is a completion signal (empty blob)
            if (arrayBuffer.byteLength === 0) {
              console.log(`🔍 TTS PINPOINT [${timestamp}]: Received completion signal - audio stream ended`);
              // Start playback if we have any chunks and not currently playing
              if (!isAudioPlayingRef.current && audioChunksRef.current.length > 0) {
                console.log(`🔍 TTS PINPOINT [${timestamp}]: Starting playback with ${audioChunksRef.current.length} chunks (completion signal received)`);
                playContinuousAudio();
              }
              return;
            }
            
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
            console.log(`🔍 TTS PINPOINT [${timestamp}]: Added audio chunk to queue. Queue size: ${audioChunksRef.current.length}`);
            
            // Start playback if we have enough chunks and not currently playing
            if (!isAudioPlayingRef.current && audioChunksRef.current.length >= 3) {
              console.log(`🔍 TTS PINPOINT [${timestamp}]: Starting seamless audio playback with ${audioChunksRef.current.length} chunks`);
              playContinuousAudio();
            }
          }).catch((error) => {
            console.error(`🔍 TTS PINPOINT [${timestamp}]: Error processing Blob audio data:`, error);
          });
        } else if (event.data instanceof ArrayBuffer) {
          // TTS PINPOINT: Log every ArrayBuffer received
          console.log(`🔍 TTS PINPOINT [${timestamp}]: Received ArrayBuffer audio chunk, size: ${event.data.byteLength} bytes`);
          
          // Check if this is a completion signal (empty buffer)
          if (event.data.byteLength === 0) {
            console.log(`🔍 TTS PINPOINT [${timestamp}]: Received completion signal - audio stream ended`);
            // Start playback if we have any chunks and not currently playing
            if (!isAudioPlayingRef.current && audioChunksRef.current.length > 0) {
              console.log(`🔍 TTS PINPOINT [${timestamp}]: Starting playback with ${audioChunksRef.current.length} chunks (completion signal received)`);
              playContinuousAudio();
            }
            return;
          }
          
          // Estimate latency for ArrayBuffer data
          const estimatedLatency = 50 + Math.random() * 100;
          networkLatencyRef.current.push(estimatedLatency);
          
          // Update network stats periodically
          if (networkLatencyRef.current.length % 3 === 0) {
            calculateNetworkStats();
          }
          
          audioChunksRef.current.push(event.data);
          console.log(`🔍 TTS PINPOINT [${timestamp}]: Added ArrayBuffer to queue. Queue size: ${audioChunksRef.current.length}`);
          
          // Start playback if we have enough chunks and not currently playing
          if (!isAudioPlayingRef.current && audioChunksRef.current.length >= 3) {
            console.log(`🔍 TTS PINPOINT [${timestamp}]: Starting seamless audio playback with ${audioChunksRef.current.length} chunks`);
            playContinuousAudio();
          }
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('WebSocket readyState:', socket.readyState);
        console.error('WebSocket URL:', socket.url);
        handleConnectionError('WebSocket connection error');
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          url: socket.url,
          readyState: socket.readyState
        });
        
        // Log specific error codes
        if (event.code === 1006) {
          console.error('WebSocket closed abnormally (1006) - connection was closed without a close frame');
        } else if (event.code === 1011) {
          console.error('WebSocket closed with server error (1011) - server encountered an error');
        } else if (event.code === 1000) {
          console.log('WebSocket closed normally (1000)');
        } else {
          console.error(`WebSocket closed with unexpected code: ${event.code}`);
        }
        
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
          if (audioTimeoutRef.current) {
            clearTimeout(audioTimeoutRef.current);
            audioTimeoutRef.current = null;
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
    // Only disconnect if this is the v1 version
    if (version !== 'v1') {
      console.log('V1 hook: Not disconnecting - version is', version);
      return;
    }

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
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = null;
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

  // Test function to send a simple message to verify WebSocket connection
  const testWebSocketConnection = useCallback(() => {
    console.log('🧪 Testing WebSocket connection...');
    console.log('Current WebSocket state:', socketRef.current?.readyState);
            console.log('WebSocket URL:', import.meta.env.VITE_WEBSOCKET_URL_V1 || 'wss://dharsan99--voice-ai-backend-with-storage-voice-agent-app.modal.run/ws');
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        const testMessage = { type: 'test', data: 'Connection test from frontend' };
        socketRef.current.send(JSON.stringify(testMessage));
        console.log('✅ Test message sent to backend');
      } catch (error) {
        console.error('❌ Error sending test message:', error);
      }
    } else {
      console.error('❌ WebSocket not connected, cannot send test message');
      console.error('WebSocket state:', socketRef.current?.readyState);
              console.error('WebSocket URL:', import.meta.env.VITE_WEBSOCKET_URL_V1 || 'wss://dharsan99--voice-ai-backend-with-storage-voice-agent-app.modal.run/ws');
      
      // Try to reconnect
      console.log('🔄 Attempting to reconnect...');
      if (socketRef.current) {
        socketRef.current.close();
      }
      setTimeout(() => {
        connect();
      }, 1000);
    }
  }, []);

  // Simulate typing animation for AI responses
  const simulateTypingAnimation = useCallback((text: string, speed: number) => {
    console.log('🎯 Starting typing animation:', { text, speed });
    let currentIndex = 0;
    
    const typeNextCharacter = () => {
      if (currentIndex >= text.length) {
        // Typing complete, mark as not typing
        console.log('🎯 Typing animation complete');
        setAiResponse(prev => prev ? { ...prev, isTyping: false } : null);
        return;
      }
      
      setAiResponse(prev => {
        if (!prev) return null;
        
        const newDisplayedText = text.substring(0, currentIndex + 1);
        console.log('🎯 Typing progress:', { currentIndex, newDisplayedText });
        return {
          ...prev,
          displayedText: newDisplayedText
        };
      });
      
      currentIndex++;
      
      // Schedule next character
      setTimeout(typeNextCharacter, speed);
    };
    
    // Start typing
    typeNextCharacter();
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

  // Send network metrics to backend periodically
  useEffect(() => {
    if (connectionStatus === 'connected' && socketRef.current) {
      const interval = setInterval(() => {
        const metrics = {
          averageLatency: networkStats.averageLatency,
          jitter: networkStats.jitter,
          packetLoss: networkStats.packetLoss,
          bufferSize: networkStats.bufferSize
        };
        sendNetworkMetrics(socketRef.current!, metrics);
      }, 5000); // Send every 5 seconds

      return () => clearInterval(interval);
    }
  }, [connectionStatus, networkStats]);

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

  // Handle version changes - disconnect if not v1
  useEffect(() => {
    if (version !== 'v1' && connectionStatus === 'connected') {
      console.log('V1 hook: Version changed to', version, '- disconnecting');
      disconnect();
    }
  }, [version, connectionStatus, disconnect]);

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
    transcriptConfidence,
    lastTranscriptUpdate,
    networkStats,
    errorStats,
    recoveryInfo,
    bufferInfo,
    // Enhanced metrics
    currentMetrics,
    sessionMetrics,
    conversationHistory,
    sessionId,
    metricsVisible,
    setMetricsVisible,
    connect: connectWithCleanup,
    disconnect,
    clearTranscripts,
    testWebSocketConnection,
    testAudioPlayback,
  };
}; 