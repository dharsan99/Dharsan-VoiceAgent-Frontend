import { useState, useCallback, useRef, useEffect } from 'react';
import { getServiceUrls, PRODUCTION_CONFIG } from '../config/production';

// PHASE 2: Optimized Voice Agent Hook
// Implements proper MediaStream lifecycle, seamless TTS playback, and deterministic control

interface VoiceAgentState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'failed';
  processingStatus: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  sessionId: string | null;
  transcript: string;
  interimTranscript: string;
  aiResponse: string | null;
  error: string | null;
  version: string;
  audioLevel: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
}

interface SessionInfo {
  sessionId: string;
  timestamp: string;
  userAgent: string;
  platform: string;
}

export const useVoiceAgentPhase2 = () => {
  // State management
  const [state, setState] = useState<VoiceAgentState>({
    connectionStatus: 'disconnected',
    processingStatus: 'idle',
    sessionId: null,
    transcript: '',
    interimTranscript: '',
    aiResponse: null,
    error: null,
    version: '2.0.0',
    audioLevel: 0,
    connectionQuality: 'unknown'
  });

  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  // PHASE 2: Proper MediaStream lifecycle management with useRef
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<NodeJS.Timeout | null>(null);

  // PHASE 2: Web Audio API for seamless TTS playback
  const ttsAudioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const isTTSPlayingRef = useRef<boolean>(false);

  // Function to correctly stop all tracks of a MediaStream
  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop(); // This correctly releases the microphone
      });
      streamRef.current = null;
      console.log("🎤 MediaStream stopped and microphone released.");
    }
  }, []);

  // PHASE 2: Seamless TTS Playback with Web Audio API
  const setupTTSAudioContext = useCallback(async () => {
    if (!ttsAudioContextRef.current) {
      try {
        ttsAudioContextRef.current = new AudioContext();
        await ttsAudioContextRef.current.resume();
        console.log('🔊 TTS AudioContext initialized');
      } catch (error) {
        console.error('Failed to initialize TTS AudioContext:', error);
      }
    }
  }, []);

  const playTTSAudioChunk = useCallback(async (audioData: ArrayBuffer) => {
    if (!ttsAudioContextRef.current) {
      await setupTTSAudioContext();
    }

    if (!ttsAudioContextRef.current) {
      console.error('TTS AudioContext not available');
      return;
    }

    try {
      // Decode audio data
      const audioBuffer = await ttsAudioContextRef.current.decodeAudioData(audioData);
      
      // Create audio source
      const source = ttsAudioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      
      // Connect to destination
      source.connect(ttsAudioContextRef.current.destination);
      
      // Schedule playback at the correct time for seamless stitching
      const startTime = Math.max(nextStartTimeRef.current, ttsAudioContextRef.current.currentTime);
      source.start(startTime);
      
      // Update next start time
      nextStartTimeRef.current = startTime + audioBuffer.duration;
      
      console.log(`🔊 TTS audio chunk scheduled: duration=${audioBuffer.duration}s, startTime=${startTime}s`);
      
    } catch (error) {
      console.error('Error playing TTS audio chunk:', error);
    }
  }, [setupTTSAudioContext]);

  // PHASE 2: Deterministic Control Flow - Start Listening
  const handleStartListening = useCallback(async () => {
    if (state.processingStatus === 'listening') return;

    try {
      console.log('🎤 Starting listening with optimized audio constraints...');
      
      // PHASE 2: Use optimized audio constraints for STT accuracy
      const constraints = {
        audio: PRODUCTION_CONFIG.AUDIO_CONFIG,
        video: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream; // Store stream in ref
      
      console.log('🎤 Microphone access granted with raw audio capture');

      // Send start_listening event to backend
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ 
          event: 'start_listening',
          sessionId: state.sessionId 
        }));
        console.log('📡 Sent start_listening event to backend');
      }

      // Setup audio visualization for voice activity detection
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      
      source.connect(analyser);
      
      // Voice activity detection
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const detectVoiceActivity = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const audioLevel = Math.min(100, Math.max(0, (average / 255) * 100));
        
        setState(prev => ({ ...prev, audioLevel }));
        
        // Update connection quality based on audio level
        let connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown' = 'unknown';
        if (audioLevel > 50) connectionQuality = 'excellent';
        else if (audioLevel > 20) connectionQuality = 'good';
        else connectionQuality = 'poor';
        
        setState(prev => ({ ...prev, connectionQuality }));
      };

      const voiceDetectionInterval = setInterval(detectVoiceActivity, 100);
      animationFrameRef.current = voiceDetectionInterval;

      // Setup MediaRecorder for audio capture
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && websocketRef.current?.readyState === WebSocket.OPEN) {
          // Send raw audio chunk over WebRTC/WHIP
          console.log(`📡 Sending audio chunk: ${event.data.size} bytes`);
          // This would be handled by your WHIP implementation
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log('🎤 Recording stopped - triggering LLM with final transcript');
        // This is where the "get answer" logic is triggered
        if (websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(JSON.stringify({ 
            event: 'trigger_llm', 
            final_transcript: state.transcript,
            sessionId: state.sessionId 
          }));
        }
      };

      mediaRecorderRef.current.start(250); // Send data in chunks
      
      setState(prev => ({ 
        ...prev, 
        processingStatus: 'listening',
        error: null 
      }));

      console.log('🎤 Listening started successfully');

    } catch (error) {
      console.error('Error starting listening:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start listening',
        processingStatus: 'error'
      }));
    }
  }, [state.processingStatus, state.sessionId, state.transcript]);

  // PHASE 2: Deterministic Control Flow - Stop Listening
  const handleStopListening = useCallback(() => {
    if (state.processingStatus !== 'listening' || !mediaRecorderRef.current) return;

    console.log('🛑 Stopping listening...');
    
    mediaRecorderRef.current.stop(); // This will trigger the onstop event
    stopMediaStream(); // Release the microphone
    
    setState(prev => ({ ...prev, processingStatus: 'processing' }));
  }, [state.processingStatus, stopMediaStream]);

  // Connect to backend
  const connect = useCallback(async () => {
    if (state.connectionStatus === 'connected' || state.connectionStatus === 'connecting') {
      return;
    }

    try {
      setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));

      // Generate session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create session info
      const sessionInfo: SessionInfo = {
        sessionId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform
      };
      
      setSessionInfo(sessionInfo);
      setState(prev => ({ ...prev, sessionId }));

      // Setup TTS AudioContext
      await setupTTSAudioContext();

      // Connect to WebSocket
      const { orchestratorWsUrl } = getServiceUrls();
      const socket = new WebSocket(`${orchestratorWsUrl}/${sessionId}`);
      websocketRef.current = socket;

      socket.onopen = () => {
        console.log('🔗 WebSocket connected successfully');
        setState(prev => ({ ...prev, connectionStatus: 'connected' }));
        
        // Send session info
        socket.send(JSON.stringify(sessionInfo));
        
        // Send greeting request
        socket.send(JSON.stringify({ 
          event: 'greeting_request',
          sessionId 
        }));
      };

      socket.onmessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const message = JSON.parse(event.data);
            
            switch (message.event) {
              case 'greeting':
                console.log('👋 Received greeting:', message.text);
                setState(prev => ({ ...prev, aiResponse: message.text }));
                break;
                
              case 'interim_transcript':
                console.log('📝 Interim transcript:', message.text);
                setState(prev => ({ ...prev, interimTranscript: message.text }));
                break;
                
              case 'final_transcript':
                console.log('📝 Final transcript:', message.text);
                setState(prev => ({ 
                  ...prev, 
                  transcript: message.text,
                  interimTranscript: ''
                }));
                break;
                
              case 'ai_response':
                console.log('🤖 AI response:', message.text);
                setState(prev => ({ 
                  ...prev, 
                  aiResponse: message.text,
                  processingStatus: 'speaking'
                }));
                break;
                
              case 'processing_start':
                setState(prev => ({ ...prev, processingStatus: 'processing' }));
                break;
                
              case 'processing_complete':
                setState(prev => ({ ...prev, processingStatus: 'idle' }));
                break;
                
              default:
                console.log('📡 Unknown message:', message);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        } else if (event.data instanceof ArrayBuffer) {
          // PHASE 2: Handle TTS audio chunks with seamless playback
          console.log(`🔊 Received TTS audio chunk: ${event.data.byteLength} bytes`);
          playTTSAudioChunk(event.data);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'failed',
          error: 'WebSocket connection failed'
        }));
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
      };

    } catch (error) {
      console.error('Connection error:', error);
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'failed',
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, [state.connectionStatus, setupTTSAudioContext, playTTSAudioChunk]);

  // Disconnect
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting...');
    
    // Stop listening if active
    if (state.processingStatus === 'listening') {
      handleStopListening();
    }
    
    // Close WebSocket
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    // Stop MediaStream
    stopMediaStream();
    
    // Clear intervals
    if (animationFrameRef.current) {
      clearInterval(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Close audio contexts
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (ttsAudioContextRef.current) {
      ttsAudioContextRef.current.close();
      ttsAudioContextRef.current = null;
    }
    
    setState(prev => ({ 
      ...prev, 
      connectionStatus: 'disconnected',
      processingStatus: 'idle',
      sessionId: null,
      transcript: '',
      interimTranscript: '',
      aiResponse: null,
      error: null,
      audioLevel: 0,
      connectionQuality: 'unknown'
    }));
    
    setSessionInfo(null);
  }, [state.processingStatus, handleStopListening, stopMediaStream]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      transcript: '',
      interimTranscript: '',
      aiResponse: null
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Effect hook to ensure cleanup on component unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    ...state,
    sessionInfo,
    
    // Actions
    connect,
    disconnect,
    handleStartListening,
    handleStopListening,
    clearTranscript,
    clearError
  };
}; 