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

  const [networkStats] = useState<NetworkStats>({
    latency: 0,
    jitter: 0,
    packetLoss: 0,
    connectionQuality: 'excellent'
  });

  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioProcessorRef = useRef<AudioWorkletNode | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      setState(prev => ({ ...prev, sessionId }));

      // Connect directly to WebSocket
      const ws = new WebSocket(finalWebsocketUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        setState(prev => ({ ...prev, connectionStatus: 'connected' }));
        startHeartbeat();
        console.log('V2 WebSocket connected');
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

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (websocketRef.current) {
      // Only close if the connection is open or connecting
      if (websocketRef.current.readyState === WebSocket.OPEN || 
          websocketRef.current.readyState === WebSocket.CONNECTING) {
        websocketRef.current.close(1000, 'User disconnect');
      }
      websocketRef.current = null;
    }

    stopRecording();
    setState(prev => ({ 
      ...prev, 
      connectionStatus: 'disconnected',
      processingStatus: 'idle',
      sessionId: null,
      transcript: '',
      interimTranscript: '',
      aiResponse: null
    }));
  }, []);

  // Audio recording
  const startRecording = useCallback(async () => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      mediaStreamRef.current = stream;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Load and use audio processor
      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');
      const processor = new AudioWorkletNode(audioContextRef.current, 'audio-processor');
      audioProcessorRef.current = processor;

      processor.port.onmessage = (event) => {
        if (event.data.type === 'audioData' && websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(event.data.audioData);
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      setIsRecording(true);
      setState(prev => ({ ...prev, processingStatus: 'listening' }));
      console.log('V2 Recording started');

    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start recording'
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
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
    console.log('V2 Recording stopped');
  }, []);

  // Message handling
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'connection_established':
        setState(prev => ({ 
          ...prev, 
          sessionId: data.session_id,
          version: data.version
        }));
        console.log('V2 Session established:', data.session_id);
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
        break;

      case 'processing_complete':
        setState(prev => ({ 
          ...prev, 
          aiResponse: data.response,
          processingStatus: 'speaking'
        }));
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
        console.log('V2 Word timing completed');
        break;

      case 'info':
        console.log('V2 Server info:', data.message);
        // Handle initial connection info
        if (data.version) {
          setState(prev => ({ ...prev, version: data.version }));
        }
        break;

      case 'error':
        setState(prev => ({ 
          ...prev, 
          error: data.message,
          processingStatus: 'error'
        }));
        console.error('V2 Server error:', data.message);
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

      default:
        console.log('V2 Unknown message type:', data.type, data);
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
    if (state.sessionId) {
      const sessionInfo: SessionInfo = {
        sessionId: state.sessionId,
        startTime: new Date().toISOString(),
        messagesProcessed: 0,
        errorsCount: 0,
        duration: 0
      };
      setSessionInfo(sessionInfo);
    }
  }, [state.sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      connect();
    }, 100); // Small delay to ensure component is fully mounted
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [connect]);

  // Fetch session info periodically
  useEffect(() => {
    if (state.sessionId) {
      const interval = setInterval(fetchSessionInfo, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [state.sessionId, fetchSessionInfo]);

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

    // Utilities
    clearTranscript: () => setState(prev => ({ 
      ...prev, 
      transcript: '', 
      interimTranscript: '', 
      aiResponse: null 
    })),
    clearError: () => setState(prev => ({ ...prev, error: null })),
  };
}; 