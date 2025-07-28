import { useState, useRef, useCallback, useEffect } from 'react';
import { getServiceUrls } from '../config/production';

interface VoiceAgentWHIPState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  agentStatus: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
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

interface VoiceAgentWHIPActions {
  connect: () => void;
  disconnect: () => void;
  startListening: () => void;
  stopListening: () => void;
  getAnswer: () => void;
  clearTranscript: () => void;
  clearError: () => void;
  testAudioContext: () => Promise<boolean>;
}

export const useVoiceAgentWHIP = (): [VoiceAgentWHIPState, VoiceAgentWHIPActions] => {
  const { orchestratorWsUrl, whipUrl } = getServiceUrls();
  
  const [state, setState] = useState<VoiceAgentWHIPState>({
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

  // WebRTC (WHIP) refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  
  // WebSocket refs for orchestrator communication
  const websocketRef = useRef<WebSocket | null>(null);
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

      // Connect to orchestrator WebSocket
      const wsUrl = orchestratorWsUrl;
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected to orchestrator');
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
        
        // Attempt to reconnect after a delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (state.connectionStatus === 'disconnected') {
            connect();
          }
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'error',
          error: 'WebSocket connection failed'
        }));
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, [orchestratorWsUrl, generateSessionId, state.connectionStatus]);

  // WHIP (WebRTC) connection for audio
  const connectWHIP = useCallback(async () => {
    if (!state.sessionId) {
      console.error('No session ID available for WHIP connection');
      return;
    }

    try {
      console.log('🎤 Connecting to media server via WHIP...');

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

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peerConnectionRef.current = pc;

      // Add local audio track
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote tracks (AI audio)
      pc.ontrack = (event) => {
        console.log('🎵 Received remote audio track');
        if (event.track.kind === 'audio') {
          remoteStreamRef.current = event.streams[0];
          const audio = new Audio();
          audio.srcObject = event.streams[0];
          audio.play().catch(console.error);
        }
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send WHIP request to media server
      const whipEndpoint = `${whipUrl}`;
      const response = await fetch(whipEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
          'X-Session-ID': state.sessionId
        },
        body: offer.sdp
      });

      if (!response.ok) {
        throw new Error(`WHIP request failed: ${response.status} ${response.statusText}`);
      }

      // Get answer SDP
      const answerSDP = await response.text();
      const answer = new RTCSessionDescription({
        type: 'answer',
        sdp: answerSDP
      });

      await pc.setRemoteDescription(answer);

      console.log('✅ WHIP connection established');

      // Start listening on media server
      await fetch(`${whipUrl.replace('/whip', '')}/listening/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': state.sessionId
        },
        body: JSON.stringify({ session_id: state.sessionId })
      });

      console.log('🎤 Started listening on media server');

    } catch (error) {
      console.error('Failed to connect WHIP:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'WHIP connection failed'
      }));
    }
  }, [state.sessionId, whipUrl]);

  // Disconnect both WebSocket and WHIP
  const disconnect = useCallback(() => {
    // Disconnect WebSocket
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    // Disconnect WHIP
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Stop remote stream
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }

    setState(prev => ({ 
      ...prev, 
      connectionStatus: 'disconnected',
      agentStatus: 'idle',
      sessionId: null
    }));

    stopHeartbeat();
  }, []);

  // Start listening (both WHIP and orchestrator)
  const startListening = useCallback(async () => {
    if (state.agentStatus === 'listening') return;

    try {
      setState(prev => ({ ...prev, agentStatus: 'listening' }));

      // Ensure WebSocket is connected
      if (websocketRef.current?.readyState !== WebSocket.OPEN) {
        await connect();
      }

      // Ensure WHIP is connected
      if (!peerConnectionRef.current) {
        await connectWHIP();
      }

      // Send start_listening event to orchestrator
      if (websocketRef.current?.readyState === WebSocket.OPEN && state.sessionId) {
        websocketRef.current.send(JSON.stringify({
          event: 'start_listening',
          session_id: state.sessionId
        }));
        console.log('🎤 Sent start_listening event');
      }

    } catch (error) {
      console.error('Failed to start listening:', error);
      setState(prev => ({ 
        ...prev, 
        agentStatus: 'idle',
        error: error instanceof Error ? error.message : 'Failed to start listening'
      }));
    }
  }, [state.agentStatus, state.sessionId, connect, connectWHIP]);

  // Stop listening
  const stopListening = useCallback(async () => {
    if (state.agentStatus !== 'listening') return;

    try {
      setState(prev => ({ ...prev, agentStatus: 'thinking' }));

      // Stop listening on media server
      if (state.sessionId) {
        await fetch(`${whipUrl.replace('/whip', '')}/listening/stop`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': state.sessionId
          },
          body: JSON.stringify({ session_id: state.sessionId })
        });
        console.log('🛑 Stopped listening on media server');
      }

      // Send trigger_llm event to orchestrator
      if (websocketRef.current?.readyState === WebSocket.OPEN && state.sessionId) {
        websocketRef.current.send(JSON.stringify({
          event: 'trigger_llm',
          final_transcript: state.transcript || state.interimTranscript || '',
          session_id: state.sessionId
        }));
        console.log('📤 Sent trigger_llm event');
      }

    } catch (error) {
      console.error('Failed to stop listening:', error);
      setState(prev => ({ 
        ...prev, 
        agentStatus: 'idle',
        error: error instanceof Error ? error.message : 'Failed to stop listening'
      }));
    }
  }, [state.agentStatus, state.sessionId, state.transcript, state.interimTranscript, whipUrl]);

  // Get answer (trigger LLM processing)
  const getAnswer = useCallback(() => {
    if (state.agentStatus === 'listening') {
      stopListening();
    } else if (state.agentStatus === 'idle') {
      startListening();
    }
  }, [state.agentStatus, startListening, stopListening]);

  // Handle WebSocket messages from orchestrator
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('📥 Received message:', data);

    switch (data.event) {
      case 'greeting':
        setState(prev => ({ 
          ...prev, 
          greeting: data.text,
          conversationHistory: [...prev.conversationHistory, {
            id: `ai_${Date.now()}`,
            type: 'ai',
            text: data.text,
            timestamp: new Date()
          }]
        }));
        console.log('👋 Received greeting:', data.text);
        break;

      case 'listening_started':
        setState(prev => ({ ...prev, agentStatus: 'listening' }));
        console.log('🎤 Listening started for session:', data.session_id);
        break;

      case 'tts_audio_chunk':
        if (data.audio_data) {
          console.log('🎵 Received TTS audio chunk');
          playAudioChunk(data.audio_data);
        }
        break;

      case 'llm_response_text':
        setState(prev => ({ 
          ...prev, 
          aiResponse: data.text,
          conversationHistory: [...prev.conversationHistory, {
            id: `ai_${Date.now()}`,
            type: 'ai',
            text: data.text,
            timestamp: new Date()
          }]
        }));
        console.log('🤖 Received AI response:', data.text);
        break;

      case 'processing_complete':
        setState(prev => ({ 
          ...prev, 
          aiResponse: data.text || prev.aiResponse,
          agentStatus: 'idle'
        }));
        console.log('✅ Processing complete');
        break;

      default:
        console.log('📥 Unhandled message event:', data.event);
    }
  }, []);

  // Play audio chunk
  const playAudioChunk = useCallback((base64Audio: string) => {
    try {
      // Decode base64 audio
      const audioData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
      console.log('🎵 Decoded audio data size:', audioData.byteLength);

      // Initialize audio context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Convert to WAV format if needed (assuming it's already WAV)
      const wavData = new Uint8Array(audioData.byteLength + 44);
      
      // WAV header (44 bytes)
      const sampleRate = 22050; // TTS sample rate
      const numChannels = 1;
      const bitsPerSample = 16;
      const byteRate = sampleRate * numChannels * bitsPerSample / 8;
      const blockAlign = numChannels * bitsPerSample / 8;
      
      // Write WAV header
      const view = new DataView(wavData.buffer);
      let offset = 0;
      
      // RIFF header
      view.setUint32(offset, 0x52494646, false); offset += 4; // "RIFF"
      view.setUint32(offset, 36 + audioData.byteLength, true); offset += 4; // File size
      view.setUint32(offset, 0x57415645, false); offset += 4; // "WAVE"
      
      // fmt chunk
      view.setUint32(offset, 0x666D7420, false); offset += 4; // "fmt "
      view.setUint32(offset, 16, true); offset += 4; // Chunk size
      view.setUint16(offset, 1, true); offset += 2; // Audio format (PCM)
      view.setUint16(offset, numChannels, true); offset += 2; // Channels
      view.setUint32(offset, sampleRate, true); offset += 4; // Sample rate
      view.setUint32(offset, byteRate, true); offset += 4; // Byte rate
      view.setUint16(offset, blockAlign, true); offset += 2; // Block align
      view.setUint16(offset, bitsPerSample, true); offset += 2; // Bits per sample
      
      // data chunk
      view.setUint32(offset, 0x64617461, false); offset += 4; // "data"
      view.setUint32(offset, audioData.byteLength, true); offset += 4; // Data size
      
      // Copy audio data
      wavData.set(audioData, 44);

      console.log('🎵 Creating WAV with sample rate:', sampleRate, 'Hz');
      console.log('🎵 First 10 bytes of audio data:', Array.from(audioData.slice(0, 10)));
      console.log('🎵 Last 10 bytes of audio data:', Array.from(audioData.slice(-10)));
      console.log('🎵 WAV data size:', wavData.byteLength);
      console.log('🎵 Audio data size:', audioData.byteLength);
      console.log('🎵 WAV header size: 44 bytes');

      // Decode and play audio
      audioContextRef.current.decodeAudioData(wavData.buffer, function(buffer) {
        console.log('🎵 Audio buffer decoded successfully');
        console.log('🎵 Audio buffer length:', buffer.length, 'samples');
        console.log('🎵 Audio buffer duration:', buffer.duration, 'seconds');
        console.log('🎵 Audio buffer sample rate:', buffer.sampleRate, 'Hz');
        console.log('🎵 Audio buffer number of channels:', buffer.numberOfChannels);

        const source = audioContextRef.current!.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current!.destination);
        source.start();
        console.log('🎵 Started playing audio chunk');
      }, function(error) {
        console.error('❌ Error decoding audio:', error);
      });

    } catch (error) {
      console.error('❌ Error playing audio:', error);
    }
  }, []);

  // Heartbeat management
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    heartbeatIntervalRef.current = setInterval(() => {
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

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

  const testAudioContext = useCallback(async (): Promise<boolean> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await audioContext.resume();
      return true;
    } catch (error) {
      console.error('Audio context test failed:', error);
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [disconnect]);

  return [state, {
    connect,
    disconnect,
    startListening,
    stopListening,
    getAnswer,
    clearTranscript,
    clearError,
    testAudioContext
  }];
}; 