import { useState, useEffect, useCallback, useRef } from 'react';
import { getServiceUrls } from '../config/production';

interface VoiceAgentState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  processingStatus: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  sessionId: string | null;
  transcript: string;
  interimTranscript: string;
  aiResponse: string | null;
  error: string | null;
  version: string;
}

interface NetworkStats {
  latency: number;
  jitter: number;
  packetLoss: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface SessionInfo {
  sessionId: string;
  startTime: string;
  messagesProcessed: number;
  errorsCount: number;
  duration: number;
}

export const useVoiceAgentV2 = (websocketUrl?: string) => {
  const { orchestratorWsUrl } = getServiceUrls();
  const finalWebsocketUrl = websocketUrl || orchestratorWsUrl;
  const [state, setState] = useState<VoiceAgentState>({
    connectionStatus: 'disconnected',
    processingStatus: 'idle',
    sessionId: null,
    transcript: '',
    interimTranscript: '',
    aiResponse: null,
    error: null,
    version: '2.0.0'
  });

  console.log('V2 useVoiceAgentV2 initialized with state:', state);

  // Override setState to add debugging for processingStatus changes
  const setStateWithDebug = useCallback((updater: any) => {
    setState(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater;
      if (prev.processingStatus !== newState.processingStatus) {
        console.log('V2 processingStatus changed from', prev.processingStatus, 'to', newState.processingStatus);
      }
      return newState;
    });
  }, []);

  // Monitor state changes for debugging
  useEffect(() => {
    console.log('V2 State changed:', {
      connectionStatus: state.connectionStatus,
      processingStatus: state.processingStatus,
      sessionId: state.sessionId
    });
  }, [state.connectionStatus, state.processingStatus, state.sessionId]);

  const [isRecording, setIsRecording] = useState(false);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    latency: 0,
    jitter: 0,
    packetLoss: 0,
    connectionQuality: 'poor'
  });
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  // Refs for WebSocket and audio handling
  const websocketRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopRecordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalMessageSentRef = useRef<boolean>(false);
  
  // Audio collection refs
  const audioChunksRef = useRef<Int16Array[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<AudioWorkletNode | null>(null);

  // Audio recording
  const startRecording = useCallback(async () => {
    if (isRecording) return;
    
    try {
      console.log('V2 startRecording called - isRecording:', isRecording);
      
      // Clear previous audio chunks
      audioChunksRef.current = [];
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      mediaStreamRef.current = stream;
      
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      
      console.log('V2 Loading audio processor...');
      
      // Load audio processor
      try {
        await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');
        console.log('V2 Audio processor loaded successfully');
      } catch (error) {
        console.warn('V2 Failed to load audio processor:', error);
        // Continue without audio processor - don't fail the entire recording
      }
      
      const processor = new AudioWorkletNode(audioContextRef.current, 'audio-processor');
      audioProcessorRef.current = processor;
      console.log('V2 Audio processor node created');

      // Create media stream source
      const source = audioContextRef.current.createMediaStreamSource(stream);

      processor.port.onmessage = (event) => {
        try {
          if (event.data.type === 'audioData') {
            // Collect audio chunks instead of sending immediately
            const int16Array = new Int16Array(event.data.audioData);
            audioChunksRef.current.push(int16Array);
            // Removed console.log to reduce spam - audio chunks are being collected silently
          } else if (event.data.type === 'audioLevel') {
            // Handle audio level updates - no console log to reduce spam
            // Audio level is already displayed in the UI controls
          } else {
            console.log('V2 Audio processor message type:', event.data.type);
          }
        } catch (error) {
          console.error('V2 Error in audio processor message handler:', error);
          if (error instanceof Error) {
            console.error('V2 Error details:', error.message, error.stack);
          }
          // Don't disconnect WebSocket on audio processing error
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      setIsRecording(true);
      setState(prev => ({ ...prev, processingStatus: 'listening' }));
      finalMessageSentRef.current = false; // Reset final message flag
      console.log('V2 Recording started - collecting audio chunks');

      // Send start_listening event to orchestrator
      if (websocketRef.current?.readyState === WebSocket.OPEN && sessionIdRef.current) {
        const startListeningMessage = {
          event: 'start_listening',
          session_id: sessionIdRef.current,
          timestamp: new Date().toISOString()
        };
        websocketRef.current.send(JSON.stringify(startListeningMessage));
        console.log('V2 Sent start_listening event:', startListeningMessage);
      } else {
        console.error('V2 Cannot send start_listening - WebSocket not ready or no session ID');
        console.log('V2 WebSocket state:', websocketRef.current?.readyState);
        console.log('V2 Session ID:', sessionIdRef.current);
      }

    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start recording'
      }));
      
      // Don't disconnect WebSocket on audio recording failure
      console.log('V2 Audio recording failed, but keeping WebSocket connection alive');
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    console.log('V2 stopRecording called - isRecording:', isRecording, 'finalMessageSent:', finalMessageSentRef.current);
    if (!isRecording) return;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }

    setIsRecording(false);
    setState(prev => ({ ...prev, processingStatus: 'idle' }));
    console.log('V2 Recording stopped - audio chunks collected:', audioChunksRef.current.length);
    
    // Clear any existing timeout
    if (stopRecordingTimeoutRef.current) {
      clearTimeout(stopRecordingTimeoutRef.current);
      stopRecordingTimeoutRef.current = null;
    }
  }, [isRecording]);

  const triggerFinalMessage = useCallback(() => {
    console.log('V2 triggerFinalMessage called - sending collected audio chunks');
    
    // Prevent multiple final messages
    if (finalMessageSentRef.current) {
      console.log('V2 Final message already sent, skipping');
      return;
    }
    
    // Send final audio message to trigger STT processing
    if (websocketRef.current?.readyState === WebSocket.OPEN && sessionIdRef.current) {
      // Concatenate all collected audio chunks
      const totalSamples = audioChunksRef.current.reduce((total, chunk) => total + chunk.length, 0);
      const concatenatedAudio = new Int16Array(totalSamples);
      
      let offset = 0;
      for (const chunk of audioChunksRef.current) {
        concatenatedAudio.set(chunk, offset);
        offset += chunk.length;
      }
      
      console.log('V2 Concatenated audio chunks:', {
        totalChunks: audioChunksRef.current.length,
        totalSamples: totalSamples,
        audioSize: concatenatedAudio.byteLength
      });
      
      // Convert to base64 - use a more efficient approach for large arrays
      const uint8Array = new Uint8Array(concatenatedAudio.buffer);
      // Use a more efficient method to avoid stack overflow with large arrays
      const chunks = [];
      const chunkSize = 8192; // Process in smaller chunks
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
      }
      const binaryString = chunks.join('');
      const audioBase64 = btoa(binaryString);
      
      const finalMessage = {
        event: 'audio_data',
        session_id: sessionIdRef.current,
        audio_data: audioBase64,
        is_final: true,
        timestamp: new Date().toISOString()
      };
      
      console.log('V2 Sending final message with collected audio:', {
        sessionId: sessionIdRef.current,
        audioSize: concatenatedAudio.byteLength,
        base64Size: audioBase64.length,
        totalChunks: audioChunksRef.current.length
      });
      
      try {
        // Send final message immediately
        websocketRef.current.send(JSON.stringify(finalMessage));
        console.log('V2 Sent final audio message with collected chunks');
        finalMessageSentRef.current = true; // Mark as sent
        
        // Clear collected audio chunks
        audioChunksRef.current = [];
      } catch (error) {
        console.error('V2 Failed to send final message:', error);
      }
    } else {
      console.error('V2 Cannot send final message - WebSocket not ready or no session ID');
      console.log('V2 WebSocket state:', websocketRef.current?.readyState);
      console.log('V2 Session ID:', sessionIdRef.current);
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('V2 Disconnect called - checking why...');
    console.log('V2 Current state - isRecording:', isRecording, 'websocket state:', websocketRef.current?.readyState);
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    // Clear stopRecording timeout
    if (stopRecordingTimeoutRef.current) {
      clearTimeout(stopRecordingTimeoutRef.current);
      stopRecordingTimeoutRef.current = null;
    }

    if (websocketRef.current) {
      // Only close if the connection is open or connecting
      if (websocketRef.current.readyState === WebSocket.OPEN || 
          websocketRef.current.readyState === WebSocket.CONNECTING) {
        console.log('V2 Closing WebSocket connection...');
        websocketRef.current.close(1000, 'User disconnect');
      }
      websocketRef.current = null;
    }
    // Only stop recording if currently recording
    if (isRecording) {
      console.log('V2 Stopping recording during disconnect...');
      stopRecording();
    }
    sessionIdRef.current = null;
    setState(prev => ({ 
      ...prev, 
      connectionStatus: 'disconnected',
      processingStatus: 'idle',
      sessionId: null,
      transcript: '',
      interimTranscript: '',
      aiResponse: null
    }));
  }, [isRecording, stopRecording]);

  // Connection management
  const connect = useCallback(async () => {
    if (websocketRef.current?.readyState === WebSocket.OPEN || 
        websocketRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));

      // Generate a unique session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionIdRef.current = sessionId;
      setState(prev => ({ ...prev, sessionId }));

      // Connect directly to WebSocket
      const ws = new WebSocket(finalWebsocketUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        setState(prev => ({ ...prev, connectionStatus: 'connected' }));
        startHeartbeat();
        console.log('V2 WebSocket connected');
        
        // Send greeting request to establish session
        const greetingMessage = {
          event: 'greeting_request',
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(greetingMessage));
        console.log('V2 Sent greeting request:', greetingMessage);
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
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'disconnected',
          processingStatus: 'idle'
        }));
        stopHeartbeat();
        console.log('V2 WebSocket disconnected:', event.code, event.reason);
        
        // Auto-reconnect logic
        if (event.code !== 1000) { // Not a normal closure
          scheduleReconnect();
        }
      };

      ws.onerror = (error) => {
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'error',
          error: 'WebSocket connection error'
        }));
        console.error('V2 WebSocket error:', error);
      };

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
      }, [finalWebsocketUrl]);

  // Send custom messages to WebSocket
  const sendMessage = useCallback((message: any) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
      console.log('V2 Sent custom message:', message);
    } else {
      console.error('V2 WebSocket not connected, cannot send message');
    }
  }, []);

  // Message handling
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('V2 Received WebSocket message:', data.event || data.type, data);
    switch (data.event || data.type) {
      case 'connection_established':
        setState(prev => ({ 
          ...prev, 
          sessionId: data.session_id,
          version: data.version
        }));
        console.log('V2 Session established:', data.session_id);
        break;

      case 'greeting':
        console.log('V2 Greeting received:', data.text);
        break;
        
      case 'greeting_audio':
        console.log('V2 Greeting audio received:', data.text);
        console.log('V2 Greeting audio data present:', !!data.audio_data);
        console.log('V2 Greeting audio data length:', data.audio_data ? data.audio_data.length : 0);
        // Update state with greeting text for display
        setState(prev => ({ ...prev, aiResponse: data.text }));
        // Trigger a custom event to notify the parent component about the greeting
        const greetingEvent = new CustomEvent('greetingReceived', { 
          detail: { text: data.text, hasAudio: !!data.audio_data } 
        });
        window.dispatchEvent(greetingEvent);
        // Play the greeting audio
        if (data.audio_data) {
          try {
            const audioBytes = atob(data.audio_data);
            const audioArray = new Uint8Array(audioBytes.length);
            for (let i = 0; i < audioBytes.length; i++) {
              audioArray[i] = audioBytes.charCodeAt(i);
            }
            
            const audioBlob = new Blob([audioArray], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl); // Clean up
            };
            
            audio.play().catch(error => {
              console.error('V2 Failed to play greeting audio:', error);
            });
            
            console.log('V2 Playing greeting audio');
          } catch (error) {
            console.error('V2 Error processing greeting audio:', error);
          }
        }
        break;

      case 'interim_transcript':
        setState(prev => ({ ...prev, interimTranscript: data.text }));
        break;

      case 'final_transcript':
        console.log('V2 Final transcript received - setting processingStatus to processing');
        setState(prev => ({ 
          ...prev, 
          transcript: data.text,
          interimTranscript: '',
          processingStatus: 'processing'
        }));
        console.log('V2 Final transcript received:', data.text);
        
        // Now send trigger_llm with the final transcript
        if (websocketRef.current?.readyState === WebSocket.OPEN && sessionIdRef.current && data.text) {
          const triggerLlmMessage = {
            event: 'trigger_llm',
            session_id: sessionIdRef.current,
            final_transcript: data.text,
            timestamp: new Date().toISOString()
          };
          websocketRef.current.send(JSON.stringify(triggerLlmMessage));
          console.log('V2 Triggered LLM processing with transcript:', data.text);
        }
        break;

      case 'ai_response':
      case 'llm_response_text':
        setState(prev => ({ 
          ...prev, 
          aiResponse: data.text,
          processingStatus: 'speaking'
        }));
        console.log('V2 LLM response received:', data.text);
        break;

      case 'tts_audio':
      case 'tts_audio_chunk':
        // Handle TTS audio playback
        if (data.audio_data) {
          try {
            const audioData = atob(data.audio_data);
            const arrayBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < audioData.length; i++) {
              view[i] = audioData.charCodeAt(i);
            }
            
            // Create audio blob and play it
            const audioBlob = new Blob([arrayBuffer], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl); // Clean up
              console.log('V2 TTS audio playback completed');
            };
            
            audio.play().catch(error => {
              console.error('V2 Failed to play TTS audio:', error);
            });
            
            console.log('V2 Playing TTS audio response, size:', arrayBuffer.byteLength);
          } catch (error) {
            console.error('V2 Failed to decode TTS audio:', error);
          }
        }
        break;

      case 'processing_start':
        console.log('V2 Processing started - setting processingStatus to processing');
        // Only set to processing if we're not already processing
        setState(prev => {
          if (prev.processingStatus === 'processing') {
            console.log('V2 Already processing, ignoring processing_start');
            return prev;
          }
          return { ...prev, processingStatus: 'processing' };
        });
        console.log('V2 Processing started');
        break;

      case 'processing_complete':
        setState(prev => ({ 
          ...prev, 
          aiResponse: data.response || data.text,
          processingStatus: 'idle'  // Mark as idle when fully complete
        }));
        console.log('V2 Processing completed - Pipeline finished');
        break;

      case 'error':
        setState(prev => ({ 
          ...prev, 
          error: data.text || data.message || 'Unknown error',
          processingStatus: 'idle'
        }));
        console.error('V2 Pipeline error:', data.text || data.message);
        break;

      case 'word_timing_start':
        console.log('V2 Word timing started:', data.text);
        break;

      case 'word_highlight':
        // Handle word highlighting for visual feedback
        console.log('V2 Word highlight:', data.word, data.word_index);
        break;

      case 'word_timing_complete':
        setState(prev => ({ ...prev, processingStatus: 'idle' }));
        console.log('V2 Word timing completed - Pipeline finished');
        break;

      case 'info':
        console.log('V2 Server info:', data.message);
        // Handle initial connection info
        if (data.version) {
          setState(prev => ({ ...prev, version: data.version }));
        }
        break;

      case 'echo':
        console.log('V2 Echo received:', data.data);
        // Handle echo messages (for testing)
        break;
        
      case 'ping':
        console.log('V2 Received ping, sending pong');
        if (websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(JSON.stringify({ type: 'pong' }));
        }
        break;
        
      case 'pong':
        console.log('V2 Received pong');
        break;

      case 'pipeline_state_update':
        console.log('V2 Pipeline state update:', data.state);
        if (data.state === 'completed') {
          setState(prev => ({ ...prev, processingStatus: 'idle' }));
        } else if (data.state === 'processing') {
          setState(prev => ({ ...prev, processingStatus: 'processing' }));
        }
        break;

      case 'service_status':
        console.log('V2 Service status:', data.service, data.state, data.message);
        // Update processing status based on service state
        if (data.service === 'stt' && data.state === 'completed') {
          setState(prev => ({ ...prev, processingStatus: 'processing' }));
        } else if (data.service === 'llm' && data.state === 'completed') {
          setState(prev => ({ ...prev, processingStatus: 'speaking' }));
        } else if (data.service === 'tts' && data.state === 'completed') {
          setState(prev => ({ ...prev, processingStatus: 'idle' }));
        }
        break;

      default:
        console.log('V2 Unknown message type:', data.event || data.type, data);
    }
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
      console.log('V2 Attempting to reconnect...');
      connect();
    }, 5000); // 5 seconds
  }, [connect]);

  // Session management - simplified since orchestrator doesn't have session endpoints
  const fetchSessionInfo = useCallback(async () => {
    // Create basic session info since orchestrator doesn't provide session management
    if (sessionIdRef.current) {
      const sessionInfo: SessionInfo = {
        sessionId: sessionIdRef.current,
        startTime: new Date().toISOString(),
        messagesProcessed: 0,
        errorsCount: 0,
        duration: 0
      };
      setSessionInfo(sessionInfo);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('V2 Component unmounting, cleaning up...');
      // Don't call disconnect here as it can cause infinite loops
      // Just clean up the WebSocket directly
      if (websocketRef.current) {
        websocketRef.current.close(1000, 'Component unmount');
        websocketRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (stopRecordingTimeoutRef.current) {
        clearTimeout(stopRecordingTimeoutRef.current);
        stopRecordingTimeoutRef.current = null;
      }
    };
  }, []); // Empty dependency array to only run on unmount

  // Auto-connect on mount - DISABLED to prevent autoplay issues
  // User must manually click Connect button to enable audio playback
  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     connect();
  //   }, 100); // Small delay to ensure component is fully mounted
  //   
  //   return () => {
  //     clearTimeout(timeoutId);
  //   };
  // }, [connect]);

  // Fetch session info periodically
  useEffect(() => {
    if (sessionIdRef.current) {
      const interval = setInterval(fetchSessionInfo, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [fetchSessionInfo]);

  return {
    // State
    ...state,
    isRecording,
    networkStats,
    sessionInfo,

    // Actions
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendMessage,
    triggerFinalMessage, // Add the new function to the return object

    // Utilities
    clearTranscript: () => setState(prev => ({ 
      ...prev, 
      transcript: '', 
      interimTranscript: '', 
      aiResponse: null 
    })),
    clearError: () => setState(prev => ({ ...prev, error: null })),
    
    // Internal refs for advanced usage
    websocketRef,
  };
}; 