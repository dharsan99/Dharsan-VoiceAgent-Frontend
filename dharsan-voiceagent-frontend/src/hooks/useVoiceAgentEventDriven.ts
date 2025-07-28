import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceAgentEventDrivenState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  agentStatus: 'idle' | 'listening' | 'thinking' | 'speaking';
  sessionId: string | null;
  greeting: string;
  transcript: string;
  interimTranscript: string;
  aiResponse: string;
  error: string | null;
  conversationHistory: Array<{
    id: string;
    type: 'user' | 'ai' | 'system';
    text: string;
    timestamp: Date;
  }>;
}

interface VoiceAgentEventDrivenActions {
  connect: () => void;
  disconnect: () => void;
  startListening: () => void;
  stopListening: () => void;
  getAnswer: () => void;
  clearTranscript: () => void;
  clearError: () => void;
  testAudioContext: () => Promise<boolean>;
}

export const useVoiceAgentEventDriven = (): [VoiceAgentEventDrivenState, VoiceAgentEventDrivenActions] => {
  const [state, setState] = useState<VoiceAgentEventDrivenState>({
    connectionStatus: 'disconnected',
    agentStatus: 'idle',
    sessionId: null,
    greeting: '',
    transcript: '',
    interimTranscript: '',
    aiResponse: '',
    error: null,
    conversationHistory: []
  });

  const websocketRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // WebSocket connection management
  const connect = useCallback(async () => {
    if (websocketRef.current?.readyState === WebSocket.OPEN || 
        websocketRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));

      // Generate session ID
      const sessionId = generateSessionId();
      setState(prev => ({ ...prev, sessionId }));

      // Connect to WebSocket
      const wsUrl = 'ws://35.244.33.111:8001/ws';
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setState(prev => ({ ...prev, connectionStatus: 'connected' }));
        startHeartbeat();
        
        // Send greeting request immediately upon connection
        ws.send(JSON.stringify({ 
          event: 'greeting_request',
          session_id: sessionId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'disconnected',
          agentStatus: 'idle'
        }));
        stopHeartbeat();
        
        // Auto-reconnect logic
        if (event.code !== 1000) { // Not a normal closure
          scheduleReconnect();
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'error',
          error: 'WebSocket connection error'
        }));
      };

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, [generateSessionId]);

  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close(1000, 'User disconnect');
      websocketRef.current = null;
    }
    stopMediaStream();
    setState(prev => ({ 
      ...prev, 
      connectionStatus: 'disconnected',
      agentStatus: 'idle'
    }));
  }, []);

  // WebSocket message handling
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('📥 Received message:', data);

    if (data.event) {
      // Event-based messages
      switch (data.event) {
        case 'greeting':
          console.log('👋 Received greeting:', data.text);
          setState(prev => ({ 
            ...prev, 
            greeting: data.text || '',
            conversationHistory: [...prev.conversationHistory, {
              id: `greeting_${Date.now()}`,
              type: 'system',
              text: data.text || 'Hello! How may I help you today?',
              timestamp: new Date()
            }]
          }));
          break;
          
        case 'listening_started':
          console.log('🎤 Listening started for session:', data.session_id);
          setState(prev => ({ ...prev, agentStatus: 'listening' }));
          break;
          
        case 'interim_transcript':
          console.log('📝 Interim transcript:', data.text);
          setState(prev => ({ 
            ...prev, 
            interimTranscript: data.text || '',
            agentStatus: 'listening'
          }));
          break;
          
        case 'final_transcript':
          console.log('✅ Final transcript:', data.text);
          setState(prev => ({ 
            ...prev, 
            transcript: data.text || '',
            interimTranscript: '',
            agentStatus: 'thinking',
            conversationHistory: [...prev.conversationHistory, {
              id: `user_${Date.now()}`,
              type: 'user',
              text: data.text || '',
              timestamp: new Date()
            }]
          }));
          break;
          
        case 'llm_response_text':
          console.log('🤖 LLM response:', data.text);
          setState(prev => ({ 
            ...prev, 
            aiResponse: data.text || '',
            agentStatus: 'speaking',
            conversationHistory: [...prev.conversationHistory, {
              id: `ai_${Date.now()}`,
              type: 'ai',
              text: data.text || '',
              timestamp: new Date()
            }]
          }));
          break;
          
        case 'tts_audio_chunk':
          if (data.audio_data) {
            console.log('🎵 Received TTS audio chunk');
            // Decode base64 audio and add to queue
            const audioData = Uint8Array.from(atob(data.audio_data), c => c.charCodeAt(0));
            console.log('🎵 Decoded audio data size:', audioData.byteLength, 'bytes');
            audioQueueRef.current.push(audioData);
            playNextAudioChunk();
          }
          break;
          
        case 'error':
          console.error('❌ Server error:', data.text);
          setState(prev => ({ 
            ...prev, 
            error: data.text || 'An error occurred',
            agentStatus: 'idle'
          }));
          break;
          
        default:
          console.log('❓ Unhandled event:', data.event);
      }
    } else if (data.type) {
      // Type-based messages (pipeline state updates, info, etc.)
      switch (data.type) {
        case 'pipeline_state_update':
          console.log('🔄 Pipeline state update:', data.state);
          if (data.state === 'listening') {
            setState(prev => ({ ...prev, agentStatus: 'listening' }));
          } else if (data.state === 'processing') {
            setState(prev => ({ ...prev, agentStatus: 'thinking' }));
          } else if (data.state === 'complete') {
            setState(prev => ({ ...prev, agentStatus: 'idle' }));
          } else if (data.state === 'error') {
            setState(prev => ({ 
              ...prev, 
              agentStatus: 'idle',
              error: 'Pipeline error occurred'
            }));
          }
          break;
          
        case 'info':
          console.log('ℹ️ Info message:', data.message);
          if (data.message?.includes('Started listening')) {
            setState(prev => ({ ...prev, agentStatus: 'listening' }));
          }
          break;
          
        case 'service_status':
          console.log('🔧 Service status:', data.service, data.state, data.progress);
          if (data.service === 'llm' && data.state === 'executing') {
            setState(prev => ({ ...prev, agentStatus: 'thinking' }));
          } else if (data.service === 'tts' && data.state === 'executing') {
            setState(prev => ({ ...prev, agentStatus: 'speaking' }));
          } else if (data.state === 'complete') {
            setState(prev => ({ ...prev, agentStatus: 'idle' }));
          }
          break;
          
        case 'ping':
          console.log('📡 Received ping, sending pong');
          if (websocketRef.current?.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify({ type: 'pong' }));
          }
          break;
          
        default:
          console.log('❓ Unhandled message type:', data.type);
      }
    } else {
      console.log('❓ Message without event or type:', data);
    }
  }, []);

  // Test audio context functionality with real TTS
  const testAudioContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('🎵 Test: Audio context resumed');
      }
      
      // Test with real TTS audio
      console.log('🎵 Test: Requesting TTS test audio...');
      
      // Make a direct request to the TTS service
      const response = await fetch('http://35.244.33.111:8001/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Audio working',
          voice: 'en_US-lessac-high',
          speed: 1.0,
          format: 'wav'
        })
      });
      
      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }
      
      const audioData = await response.arrayBuffer();
      console.log('🎵 Test: Received TTS audio data:', audioData.byteLength, 'bytes');
      
      // Create WAV header for the raw PCM data
      const sampleRate = 22050;
      const channels = 1;
      const bitsPerSample = 16;
      
      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);
      
      // RIFF header
      view.setUint32(0, 0x52494646, false); // "RIFF"
      view.setUint32(4, 36 + audioData.byteLength, true); // File size - 8
      view.setUint32(8, 0x57415645, false); // "WAVE"
      
      // fmt chunk
      view.setUint32(12, 0x666D7420, false); // "fmt "
      view.setUint32(16, 16, true); // Chunk size
      view.setUint16(20, 1, true); // Audio format (PCM)
      view.setUint16(22, channels, true); // Channels
      view.setUint32(24, sampleRate, true); // Sample rate
      view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true); // Byte rate
      view.setUint16(32, channels * bitsPerSample / 8, true); // Block align
      view.setUint16(34, bitsPerSample, true); // Bits per sample
      
      // data chunk
      view.setUint32(36, 0x64617461, false); // "data"
      view.setUint32(40, audioData.byteLength, true); // Data size
      
      // Combine header and audio data
      const wavData = new Uint8Array(wavHeader.byteLength + audioData.byteLength);
      wavData.set(new Uint8Array(wavHeader), 0);
      wavData.set(new Uint8Array(audioData), wavHeader.byteLength);
      
      // Decode and play
      const audioBuffer = await audioContextRef.current.decodeAudioData(wavData.buffer);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
      
      console.log('🎵 Test: Played TTS test audio successfully');
      return true;
    } catch (error) {
      console.error('🎵 Test: Audio context test failed:', error);
      return false;
    }
  }, []);

  // Audio playback
  const playNextAudioChunk = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isPlayingRef.current = true;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioData = audioQueueRef.current.shift()!;
      
                   // Convert raw PCM data to WAV format for Web Audio API
             const sampleRate = 22050; // TTS service sample rate (from voice config)
             const channels = 1; // Mono
             const bitsPerSample = 16; // 16-bit audio
             
             // Ensure the sample rate matches what the TTS service actually outputs
             console.log('🎵 Creating WAV with sample rate:', sampleRate, 'Hz');
      
      // Create WAV header
      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);
      
      // RIFF header
      view.setUint32(0, 0x52494646, false); // "RIFF"
      view.setUint32(4, 36 + audioData.byteLength, true); // File size - 8
      view.setUint32(8, 0x57415645, false); // "WAVE"
      
      // fmt chunk
      view.setUint32(12, 0x666D7420, false); // "fmt "
      view.setUint32(16, 16, true); // Chunk size
      view.setUint16(20, 1, true); // Audio format (PCM)
      view.setUint16(22, channels, true); // Channels
      view.setUint32(24, sampleRate, true); // Sample rate
      view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true); // Byte rate
      view.setUint16(32, channels * bitsPerSample / 8, true); // Block align
      view.setUint16(34, bitsPerSample, true); // Bits per sample
      
      // data chunk
      view.setUint32(36, 0x64617461, false); // "data"
      view.setUint32(40, audioData.byteLength, true); // Data size
      
                   // Combine header and audio data
             const wavData = new Uint8Array(wavHeader.byteLength + audioData.byteLength);
             wavData.set(new Uint8Array(wavHeader), 0);
             wavData.set(new Uint8Array(audioData), wavHeader.byteLength);
             
             // Debug: Check the first few bytes of audio data
             const audioUint8 = new Uint8Array(audioData);
             console.log('🎵 First 10 bytes of audio data:', Array.from(audioUint8.slice(0, 10)));
             console.log('🎵 Last 10 bytes of audio data:', Array.from(audioUint8.slice(-10)));
      
      console.log('🎵 WAV data size:', wavData.byteLength, 'bytes');
      console.log('🎵 Audio data size:', audioData.byteLength, 'bytes');
      console.log('🎵 WAV header size:', wavHeader.byteLength, 'bytes');
      
      const audioBuffer = await audioContextRef.current.decodeAudioData(wavData.buffer as ArrayBuffer);
      
      console.log('🎵 Audio buffer decoded successfully');
      console.log('🎵 Audio buffer length:', audioBuffer.length, 'samples');
      console.log('🎵 Audio buffer duration:', audioBuffer.duration, 'seconds');
      console.log('🎵 Audio buffer sample rate:', audioBuffer.sampleRate, 'Hz');
      console.log('🎵 Audio buffer number of channels:', audioBuffer.numberOfChannels);
      
                   // Ensure audio context is resumed (required for modern browsers)
             if (audioContextRef.current.state === 'suspended') {
               await audioContextRef.current.resume();
               console.log('🎵 Audio context resumed');
             }
             
             // Check if context is running
             if (audioContextRef.current.state === 'suspended') {
               console.warn('🎵 Audio context is suspended, attempting to resume');
               await audioContextRef.current.resume();
             }
             
             if (audioContextRef.current.state === 'closed') {
               console.warn('🎵 Audio context is closed, creating new one');
               audioContextRef.current = new AudioContext();
             }
             
             const source = audioContextRef.current.createBufferSource();
             source.buffer = audioBuffer;
             source.connect(audioContextRef.current.destination);
             
             source.onended = () => {
               console.log('🎵 Audio chunk playback completed');
               isPlayingRef.current = false;
               // Play next chunk if available
               if (audioQueueRef.current.length > 0) {
                 playNextAudioChunk();
               }
             };
             
             source.start();
             console.log('🎵 Started playing audio chunk');
    } catch (error) {
      console.error('Error playing audio:', error);
      isPlayingRef.current = false;
    }
  }, []);

  // Media stream management
  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      mediaStreamRef.current = null;
      console.log("🎤 MediaStream stopped");
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    if (state.agentStatus === 'listening') return;

    try {
      const constraints = {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 16000
        },
        video: false,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      
      setState(prev => ({ 
        ...prev, 
        agentStatus: 'listening',
        interimTranscript: '',
        transcript: '',
        aiResponse: ''
      }));
      
      // Send start_listening event
      if (websocketRef.current?.readyState === WebSocket.OPEN && state.sessionId) {
        websocketRef.current.send(JSON.stringify({
          event: 'start_listening',
          session_id: state.sessionId
        }));
        console.log('🎤 Sent start_listening event');
      }

      // Set up MediaRecorder for audio capture
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          event.data.arrayBuffer().then(buffer => {
            console.log(`🎵 Captured audio chunk: ${buffer.byteLength} bytes`);
            // Audio processing is handled by the backend pipeline
          });
        }
      };
      
      mediaRecorderRef.current.start(250); // Capture in 250ms chunks
      console.log("🎤 Started listening...");

    } catch (error) {
      console.error("❌ Error accessing microphone:", error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to access microphone',
        agentStatus: 'idle'
      }));
    }
  }, [state.agentStatus, state.sessionId]);

  // Stop listening and trigger LLM
  const stopListening = useCallback(() => {
    if (state.agentStatus !== 'listening') return;
    
    stopMediaStream();
    setState(prev => ({ ...prev, agentStatus: 'thinking' }));
    
    // Send trigger_llm event with final transcript
    const finalTranscript = state.interimTranscript || state.transcript || "Hello, this is a test message from the event-driven voice agent.";
    
    if (websocketRef.current?.readyState === WebSocket.OPEN && state.sessionId) {
      websocketRef.current.send(JSON.stringify({
        event: 'trigger_llm',
        final_transcript: finalTranscript,
        session_id: state.sessionId
      }));
      console.log("🛑 Stopped listening. Triggering LLM with transcript:", finalTranscript);
    }
  }, [state.agentStatus, state.interimTranscript, state.transcript, state.sessionId, stopMediaStream]);

  // Get answer (alias for stopListening)
  const getAnswer = useCallback(() => {
    stopListening();
  }, [stopListening]);

  // Utility functions
  const clearTranscript = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      transcript: '',
      interimTranscript: '',
      aiResponse: ''
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Heartbeat and reconnection
  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Attempting to reconnect...');
      connect();
    }, 5000); // 5 seconds
  }, [connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [stopMediaStream]);

  const actions: VoiceAgentEventDrivenActions = {
    connect,
    disconnect,
    startListening,
    stopListening,
    getAnswer,
    clearTranscript,
    clearError,
    testAudioContext
  };

  return [state, actions];
}; 