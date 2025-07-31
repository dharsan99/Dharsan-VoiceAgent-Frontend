import { useState, useEffect, useCallback, useRef } from 'react';
import { getServiceUrls } from '../config/production';
import { mobileAudioFix, isMobileDevice, playMobileAudio, requestMobileMicrophone } from '../utils/mobileAudioFix';

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
      // Reset final message sent flag for new recording session
      finalMessageSentRef.current = false;
      
      // Clear previous audio chunks
      audioChunksRef.current = [];
      
      // Use mobile-optimized microphone access
      let stream;
      if (isMobileDevice()) {
        stream = await requestMobileMicrophone();
      } else {
        // Get microphone access
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
          } 
        });
      }
      
      mediaStreamRef.current = stream;
      
      // Create audio context with mobile optimization
      if (isMobileDevice()) {
        audioContextRef.current = await mobileAudioFix.ensureAudioContext();
      } else {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000
        });
      }
      
      // Load audio processor
      try {
        await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');
      } catch (error) {
        // Continue without audio processor - don't fail the entire recording
      }
      
      const processor = new AudioWorkletNode(audioContextRef.current, 'audio-processor');
      audioProcessorRef.current = processor;


      // Create media stream source
      const source = audioContextRef.current.createMediaStreamSource(stream);

      processor.port.onmessage = (event) => {
        if (event.data.type === 'audioData') {
          const audioData = new Int16Array(event.data.audioData);
          audioChunksRef.current.push(audioData);
          
          // Only send non-final audio data if final message hasn't been sent yet
          if (!finalMessageSentRef.current && websocketRef.current?.readyState === WebSocket.OPEN && sessionIdRef.current) {
            const audioMessage = {
              event: 'audio_data',
              session_id: sessionIdRef.current,
              audio_data: btoa(String.fromCharCode(...new Uint8Array(audioData.buffer))),
              timestamp: new Date().toISOString()
            };
            websocketRef.current.send(JSON.stringify(audioMessage));
          }
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      setState(prev => ({ ...prev, processingStatus: 'listening' }));
      setIsRecording(true);
      
    } catch (error) {
      console.error('V2 Failed to start recording:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start recording',
        processingStatus: 'error'
      }));
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

    
    // Clear any existing timeout
    if (stopRecordingTimeoutRef.current) {
      clearTimeout(stopRecordingTimeoutRef.current);
      stopRecordingTimeoutRef.current = null;
    }
  }, [isRecording]);

  const triggerFinalMessage = useCallback(() => {
    // Prevent multiple final messages
    if (finalMessageSentRef.current) {
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
      

      
      try {
        // Send final message immediately
        websocketRef.current.send(JSON.stringify(finalMessage));
        finalMessageSentRef.current = true; // Mark as sent
        
        // Clear collected audio chunks
        audioChunksRef.current = [];
      } catch (error) {
        // Handle send error silently
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    
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
        
        // Send greeting request to establish session
        const greetingMessage = {
          event: 'greeting_request',
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(greetingMessage));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          // Handle parse error silently
        }
      };

      ws.onclose = (event) => {
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'disconnected',
          processingStatus: 'idle'
        }));
        stopHeartbeat();
        
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
    }
  }, []);

  // Message handling
  const handleWebSocketMessage = useCallback(async (data: any) => {
    switch (data.event || data.type) {
      case 'connection_established':
        setState(prev => ({ 
          ...prev, 
          sessionId: data.session_id,
          version: data.version
        }));
        break;

      case 'greeting':
        break;
        
      case 'greeting_audio':
        // Update state with greeting text for display
        setState(prev => ({ ...prev, aiResponse: data.text }));
        // Trigger a custom event to notify the parent component about the greeting
        const greetingEvent = new CustomEvent('greetingReceived', { 
          detail: { text: data.text, hasAudio: !!data.audio_data } 
        });
        window.dispatchEvent(greetingEvent);
        // Play the greeting audio using mobile-optimized playback
        if (data.audio_data) {
          try {
            const success = await playMobileAudio(data.audio_data, 'wav');
            if (success) {
              console.log('V2 Greeting audio played successfully');
            } else {
              console.warn('V2 Failed to play greeting audio');
            }
          } catch (error) {
            console.error('V2 Error processing greeting audio:', error);
          }
        }
        break;

      case 'interim_transcript':
        setState(prev => ({ ...prev, interimTranscript: data.text }));
        break;

      case 'final_transcript':
        setState(prev => ({ 
          ...prev, 
          transcript: data.text,
          interimTranscript: '',
          processingStatus: 'processing'
        }));
        
        // Now send trigger_llm with the final transcript
        if (websocketRef.current?.readyState === WebSocket.OPEN && sessionIdRef.current && data.text) {
          const triggerLlmMessage = {
            event: 'trigger_llm',
            session_id: sessionIdRef.current,
            final_transcript: data.text,
            timestamp: new Date().toISOString()
          };
          websocketRef.current.send(JSON.stringify(triggerLlmMessage));
        }
        break;

      case 'ai_response':
      case 'llm_response_text':
        setState(prev => ({ 
          ...prev, 
          aiResponse: data.text,
          processingStatus: 'speaking'
        }));
        break;

      case 'tts_audio':
      case 'tts_audio_chunk':
        // Handle TTS audio playback using mobile-optimized playback
        if (data.audio_data) {
          try {
            await playMobileAudio(data.audio_data, 'wav');
          } catch (error) {
            // Handle audio playback error silently
          }
        }
        break;

      case 'processing_start':
        // Only set to processing if we're not already processing
        setState(prev => {
          if (prev.processingStatus === 'processing') {
            return prev;
          }
          return { ...prev, processingStatus: 'processing' };
        });
        break;

      case 'processing_complete':
        setState(prev => ({ 
          ...prev, 
          aiResponse: data.response || data.text,
          processingStatus: 'idle'  // Mark as idle when fully complete
        }));
        // Reset final message sent flag so user can trigger another "Get Answer"
        finalMessageSentRef.current = false;
        break;

      case 'error':
        setState(prev => ({ 
          ...prev, 
          error: data.text || data.message || 'Unknown error',
          processingStatus: 'idle'
        }));
        // Reset final message sent flag on error
        finalMessageSentRef.current = false;
        break;

      case 'word_timing_start':
        break;

      case 'word_highlight':
        // Handle word highlighting for visual feedback
        break;

      case 'word_timing_complete':
        setState(prev => ({ ...prev, processingStatus: 'idle' }));
        // Reset final message sent flag when timing is complete
        finalMessageSentRef.current = false;
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