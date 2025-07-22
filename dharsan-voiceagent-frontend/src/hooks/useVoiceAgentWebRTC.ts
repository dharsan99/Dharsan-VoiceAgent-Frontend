import { useState, useCallback, useRef, useEffect } from 'react';

// WebRTC Configuration
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

interface VoiceAgentState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'failed';
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

export const useVoiceAgentWebRTC = (signalingUrl: string = 'wss://dharsan99--voice-ai-backend-v2-run-app.modal.run/ws/v2') => {
  // State management
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
    connectionQuality: 'fair'
  });

  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  // Refs for WebRTC and signaling
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const signalingSocketRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebRTC setup
  const setupWebRTC = useCallback(async () => {
    try {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && signalingSocketRef.current?.readyState === WebSocket.OPEN) {
          signalingSocketRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate
          }));
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('WebRTC connection state:', pc.connectionState);
        setState(prev => ({ ...prev, connectionStatus: pc.connectionState as any }));
      };

      // Handle incoming tracks (AI audio)
      pc.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (event.track.kind === 'audio') {
          remoteStreamRef.current = event.streams[0];
          const audio = new Audio();
          audio.srcObject = event.streams[0];
          audio.play().catch(console.error);
        }
      };

      // Handle ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'failed') {
          setState(prev => ({ ...prev, connectionStatus: 'failed' }));
        }
      };

      return pc;
    } catch (error) {
      console.error('Failed to setup WebRTC:', error);
      throw error;
    }
  }, []);

  // Connection management
  const connect = useCallback(async () => {
    if (peerConnectionRef.current?.connectionState === 'connected' || 
        peerConnectionRef.current?.connectionState === 'connecting') {
      return;
    }

    try {
      setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));

      // Generate session ID
      const sessionId = crypto.randomUUID();
      setState(prev => ({ ...prev, sessionId }));

      // Setup WebRTC
      const pc = await setupWebRTC();
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      localStreamRef.current = stream;

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Connect to signaling server
      const socket = new WebSocket(`${signalingUrl}/${sessionId}`);
      signalingSocketRef.current = socket;

      socket.onopen = async () => {
        console.log('Signaling WebSocket connected');
        
        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socket.send(JSON.stringify({
          type: 'offer',
          sdp: offer.sdp
        }));
      };

      socket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'answer':
              await pc.setRemoteDescription(new RTCSessionDescription(message));
              break;
              
            case 'ice-candidate':
              if (message.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
              }
              break;
              
            case 'pong':
              // Handle heartbeat response
              break;
              
            case 'error':
              setState(prev => ({ 
                ...prev, 
                error: message.message,
                connectionStatus: 'failed'
              }));
              break;
              
            default:
              console.log('Unknown signaling message:', message.type);
          }
        } catch (error) {
          console.error('Failed to parse signaling message:', error);
        }
      };

      socket.onclose = (event) => {
        console.log('Signaling WebSocket closed:', event.code, event.reason);
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'disconnected',
          processingStatus: 'idle'
        }));
        
        // Auto-reconnect logic
        if (event.code !== 1000) { // Not a normal closure
          scheduleReconnect();
        }
      };

      socket.onerror = (error) => {
        console.error('Signaling WebSocket error:', error);
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'failed',
          error: 'Signaling connection failed'
        }));
      };

    } catch (error) {
      console.error('Connection failed:', error);
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'failed',
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, [signalingUrl, setupWebRTC]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (signalingSocketRef.current) {
      signalingSocketRef.current.close(1000, 'User disconnect');
      signalingSocketRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

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

  // Heartbeat and reconnection
  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (signalingSocketRef.current?.readyState === WebSocket.OPEN) {
        signalingSocketRef.current.send(JSON.stringify({ type: 'ping' }));
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
      console.log('Attempting to reconnect...');
      connect();
    }, 5000); // 5 seconds
  }, [connect]);

  // Session management
  const fetchSessionInfo = useCallback(async () => {
    try {
      const baseUrl = (import.meta.env.VITE_WEBSOCKET_URL || 'wss://dharsan99--voice-ai-backend-v2-run-app.modal.run/ws').replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws', '');
      const response = await fetch(`${baseUrl}/v2/sessions`);
      if (response.ok) {
        const data = await response.json();
        const currentSession = data.sessions.find((s: any) => s.id === state.sessionId);
        if (currentSession) {
          setSessionInfo({
            sessionId: currentSession.id,
            startTime: currentSession.created_at,
            messagesProcessed: 0, // TODO: Implement message counting
            errorsCount: 0, // TODO: Implement error counting
            duration: Date.now() - new Date(currentSession.created_at).getTime()
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch session info:', error);
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

    // Utilities
    clearTranscript: () => setState(prev => ({ 
      ...prev, 
      transcript: '', 
      interimTranscript: '', 
      aiResponse: null 
    })),
  };
}; 