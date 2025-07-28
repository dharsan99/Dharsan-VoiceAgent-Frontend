import { useState, useCallback, useEffect, useRef } from 'react';
import { getServiceUrls } from '../config/production';

interface VoiceAgentState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  error: string | null;
  transcript: string;
  isListening: boolean;
  sessionId: string | null;
  version: string;
  // Phase 2 specific states
  aiResponse: string | null;
  isProcessing: boolean;
  conversationHistory: Array<{
    id: string;
    type: 'user' | 'ai';
    text: string;
    timestamp: Date;
  }>;
  audioLevel: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
}

interface VoiceAgentActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  startListening: () => void;
  stopListening: () => void;
}

export const useVoiceAgentWHIP = (): [VoiceAgentState, VoiceAgentActions] => {

  const [state, setState] = useState<VoiceAgentState>({
    isConnected: false,
    isConnecting: false,
    connectionStatus: 'disconnected',
    error: null,
    transcript: '',
    isListening: false,
    sessionId: null,
    version: '4.0.0',
    // Phase 2 specific states
    aiResponse: null,
    isProcessing: false,
    conversationHistory: [],
    audioLevel: 0,
    connectionQuality: 'unknown'
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const connectionQualityRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    
    if (animationFrameRef.current) {
      if (typeof animationFrameRef.current === 'number') {
        cancelAnimationFrame(animationFrameRef.current);
      } else {
        clearInterval(animationFrameRef.current);
      }
      animationFrameRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    if (connectionQualityRef.current) {
      clearInterval(connectionQualityRef.current);
      connectionQualityRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionStatus: 'disconnected',
      error: null,
      isListening: false
    }));
  }, []);

  // Connect function
  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, connectionStatus: 'connecting', error: null }));

      // Generate session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setState(prev => ({ ...prev, sessionId }));

      // Request user media
      const { PRODUCTION_CONFIG } = await import('../config/production');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: PRODUCTION_CONFIG.AUDIO_CONFIG
      });
      
      localStreamRef.current = stream;

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: getServiceUrls().iceServers || [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peerConnectionRef.current = peerConnection;

      // Add local tracks
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Set up event handlers
      peerConnection.onicecandidate = (event) => {
        // ICE candidate handling (no logging needed)
      };

      peerConnection.oniceconnectionstatechange = () => {
        
        // Update connection status and quality based on ICE connection state
        let connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown' = 'unknown';
        
        if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
          connectionQuality = 'excellent';
          setState(prev => ({ 
            ...prev, 
            connectionStatus: 'connected', 
            isConnected: true, 
            isConnecting: false,
            connectionQuality
          }));
        } else if (peerConnection.iceConnectionState === 'checking') {
          connectionQuality = 'good';
          setState(prev => ({ 
            ...prev, 
            connectionStatus: 'connecting',
            connectionQuality
          }));
        } else if (peerConnection.iceConnectionState === 'failed') {
          connectionQuality = 'poor';
          setState(prev => ({ 
            ...prev, 
            connectionStatus: 'error', 
            error: 'ICE connection failed', 
            isConnecting: false,
            connectionQuality
          }));
        } else if (peerConnection.iceConnectionState === 'disconnected') {
          connectionQuality = 'poor';
          setState(prev => ({ 
            ...prev, 
            connectionStatus: 'error',
            connectionQuality
          }));
        }
      };

      peerConnection.onconnectionstatechange = () => {
        // Connection state handling (no logging needed)
      };

      peerConnection.onsignalingstatechange = () => {
        // Signaling state handling (no logging needed)
      };

      peerConnection.ontrack = (event) => {
        console.log('🔊 [TTS] AI audio response received');
        remoteStreamRef.current = event.streams[0];
      };

      // Create SDP offer
      const offer = await peerConnection.createOffer();
      if (!offer.sdp) {
        throw new Error('Failed to create SDP offer');
      }
      
      await peerConnection.setLocalDescription(offer);

      // Wait for ICE gathering to complete
      await new Promise<void>((resolve) => {
        const checkGatheringState = () => {
          if (peerConnection.iceGatheringState === 'complete') {
            resolve();
          } else {
            setTimeout(checkGatheringState, 100);
          }
        };
        checkGatheringState();
      });

      // Get the final SDP with ICE candidates
      const finalOffer = peerConnection.localDescription;
      if (!finalOffer || !finalOffer.sdp) {
        throw new Error('No local description available after ICE gathering');
      }

      // Send WHIP request with final SDP
      const { whipUrl } = getServiceUrls();
      
      console.log('🌐 [WHIP] Sending request to:', whipUrl);
      console.log('📄 [WHIP] Final SDP Offer length:', finalOffer.sdp.length);
      
      const response = await fetch(whipUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
          'X-Session-ID': sessionId,
        },
        body: finalOffer.sdp
      });

      console.log('📡 [WHIP] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [WHIP] Error response:', errorText);
        throw new Error(`WHIP request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const answerSdp = await response.text();
      console.log('✅ [WHIP] SDP Answer received, length:', answerSdp.length);

      // Set remote description
      const answer = new RTCSessionDescription({ type: 'answer', sdp: answerSdp });
      console.log('🔗 [WHIP] Setting remote description...');
      await peerConnection.setRemoteDescription(answer);
      console.log('✅ [WHIP] Remote description set successfully');

      // Connect to orchestrator WebSocket for transcripts and AI responses
      const { orchestratorWsUrl } = getServiceUrls();
      console.log('🔗 [WS] Connecting to orchestrator:', orchestratorWsUrl);
      
      const websocket = new WebSocket(orchestratorWsUrl);
      websocketRef.current = websocket;

      websocket.onopen = () => {
        console.log('✅ [WS] WebSocket connection opened successfully');
        // Send session info to orchestrator
        const sessionInfo = {
          type: 'session_info',
          session_id: sessionId,
          version: 'phase2'
        };
        console.log('📤 [WS] Sending session info:', sessionInfo);
        websocket.send(JSON.stringify(sessionInfo));
        
        // Start heartbeat
        startHeartbeat();
      };

      // Heartbeat functions
      const startHeartbeat = () => {
        heartbeatIntervalRef.current = setInterval(() => {
          if (websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Send ping every 30 seconds
      };

      const stopHeartbeat = () => {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'ping':
              console.log('📡 [WS] Received ping, sending pong');
              websocket.send(JSON.stringify({ type: 'pong' }));
              break;

            case 'pong':
              console.log('📡 [WS] Received pong');
              break;
            case 'final_transcript':
              console.log('🎤 [STT] User said:', data.transcript);
              // Only add user message if it's not empty and not a duplicate
              if (data.transcript && data.transcript.trim() !== '') {
                setState(prev => {
                  // Check if this is a duplicate of the last user message
                  const lastMessage = prev.conversationHistory[prev.conversationHistory.length - 1];
                  if (lastMessage && lastMessage.type === 'user' && lastMessage.text === data.transcript) {
                    // Skip duplicate
                    return prev;
                  }
                  
                  const userMessage = {
                    id: `user_${Date.now()}_${Math.random()}`,
                    type: 'user' as const,
                    text: data.transcript,
                    timestamp: new Date()
                  };
                  
                  return {
                    ...prev, 
                    transcript: data.transcript,
                    conversationHistory: [...prev.conversationHistory, userMessage],
                    isProcessing: true
                  };
                });
              }
              break;

            case 'ai_response':
              console.log('🤖 [AI] Response:', data.response);
              // Only add AI message if it's not empty
              if (data.response && data.response.trim() !== '') {
                setState(prev => {
                  // Check if this is a duplicate of the last AI message
                  const lastMessage = prev.conversationHistory[prev.conversationHistory.length - 1];
                  if (lastMessage && lastMessage.type === 'ai' && lastMessage.text === data.response) {
                    // Skip duplicate
                    return prev;
                  }
                  
                  const aiMessage = {
                    id: `ai_${Date.now()}_${Math.random()}`,
                    type: 'ai' as const,
                    text: data.response,
                    timestamp: new Date()
                  };
                  
                  return {
                    ...prev, 
                    aiResponse: data.response,
                    conversationHistory: [...prev.conversationHistory, aiMessage],
                    isProcessing: false
                  };
                });
              }
              break;

            case 'processing_start':
              console.log('🔄 [AI] Processing started...');
              setState(prev => ({ ...prev, isProcessing: true }));
              break;

            case 'processing_end':
            case 'processing_complete':
              console.log('✅ [AI] Processing completed');
              setState(prev => ({ ...prev, isProcessing: false }));
              break;

            case 'connection_established':
              console.log('🔗 [WS] Orchestrator connected');
              // Clear conversation history when establishing new connection
              setState(prev => ({ 
                ...prev, 
                conversationHistory: [],
                transcript: '',
                aiResponse: null,
                error: null
              }));
              break;

            case 'error':
              console.error('❌ [ERROR]', data.error);
              setState(prev => ({ ...prev, error: data.error, isProcessing: false }));
              break;

            default:
              // Ignore unknown message types
              break;
          }
        } catch (error) {
          console.error('❌ [ERROR] Failed to parse WebSocket message:', error);
        }
      };

      websocket.onerror = (error) => {
        console.error('❌ [ERROR] WebSocket connection failed:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'WebSocket connection failed',
          connectionStatus: 'error'
        }));
      };

      websocket.onclose = (event) => {
        console.log('🔌 [WS] Connection closed:', event.code, event.reason);
        stopHeartbeat();
        setState(prev => ({ 
          ...prev, 
          error: `WebSocket connection closed: ${event.code} ${event.reason || ''}`,
          connectionStatus: 'error'
        }));
      };

      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (websocket.readyState === WebSocket.CONNECTING) {
          console.error('⏰ [WS] Connection timeout after 10 seconds');
          websocket.close();
          setState(prev => ({ 
            ...prev, 
            error: 'WebSocket connection timeout',
            connectionStatus: 'error'
          }));
        }
      }, 10000);
      
      // Set up audio context for voice activity detection (for UI feedback)
      if (localStreamRef.current) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(localStreamRef.current);
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        source.connect(analyser);
        
        const detectVoiceActivity = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          
          // Update audio level (0-100%)
          const audioLevel = Math.min(100, Math.max(0, (average / 255) * 100));
          setState(prev => ({ ...prev, audioLevel }));
          
          // Update connection quality based on audio level and connection state
          let connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown' = 'unknown';
          if (peerConnectionRef.current) {
            const iceState = peerConnectionRef.current.iceConnectionState;
            const connectionState = peerConnectionRef.current.connectionState;
            
            if (iceState === 'connected' || iceState === 'completed') {
              if (connectionState === 'connected') {
                connectionQuality = audioLevel > 50 ? 'excellent' : audioLevel > 20 ? 'good' : 'poor';
              } else {
                connectionQuality = 'poor';
              }
            } else if (iceState === 'checking') {
              connectionQuality = 'good';
            } else {
              connectionQuality = 'poor';
            }
          }
          
          setState(prev => ({ ...prev, connectionQuality }));
          
          // Only log significant voice activity (above 50%) or when starting/stopping
          if (average > 50) {
            console.log('🎵 [AUDIO] Strong voice detected - Level:', audioLevel.toFixed(1) + '%');
          }
        };
        
        // Start voice activity detection
        const voiceDetectionInterval = setInterval(detectVoiceActivity, 100);
        
        // Store interval for cleanup
        if (animationFrameRef.current) {
          clearInterval(animationFrameRef.current);
        }
        animationFrameRef.current = voiceDetectionInterval;

        // Also set up periodic connection quality check
        const connectionQualityInterval = setInterval(() => {
          if (peerConnectionRef.current) {
            const iceState = peerConnectionRef.current.iceConnectionState;
            const connectionState = peerConnectionRef.current.connectionState;
            
            let connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown' = 'unknown';
            
            if (iceState === 'connected' || iceState === 'completed') {
              if (connectionState === 'connected') {
                connectionQuality = 'excellent';
              } else {
                connectionQuality = 'good';
              }
            } else if (iceState === 'checking') {
              connectionQuality = 'good';
            } else {
              connectionQuality = 'poor';
            }
            
            setState(prev => ({ ...prev, connectionQuality }));
          }
        }, 2000); // Check every 2 seconds
        
        // Store connection quality interval for cleanup
        if (connectionQualityRef.current) {
          clearInterval(connectionQualityRef.current);
        }
        connectionQualityRef.current = connectionQualityInterval;
      }

      setState(prev => ({ 
        ...prev, 
        isConnecting: false,
        connectionStatus: 'connected',
        isConnected: true 
      }));

    } catch (error) {
      console.error('❌ [ERROR] Connection failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Connection failed',
        isConnecting: false,
        connectionStatus: 'error'
      }));
      cleanup();
    }
  }, [cleanup]);

  // Disconnect function
  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Start listening function
  const startListening = useCallback(() => {
    if (!localStreamRef.current) {
      console.error('❌ [ERROR] No local stream available');
      return;
    }

    setState(prev => ({ ...prev, isListening: true }));
    
    console.log('🎤 [AUDIO] Voice monitoring started');

    // Create audio context for voice activity detection
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(localStreamRef.current);
    const analyser = audioContext.createAnalyser();
    analyserRef.current = analyser;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;

    source.connect(analyser);

    const detectVoiceActivity = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
      
      // Update audio level for UI feedback
      setState(prev => ({ ...prev, audioLevel: average }));
      
      // Only log significant voice activity (above 50%) to reduce console spam
      if (average > 50) { // Higher threshold for voice activity logging
        console.log('🎵 [AUDIO] Strong voice detected - Level:', (average / 255 * 100).toFixed(1) + '%');
      }

      animationFrameRef.current = requestAnimationFrame(detectVoiceActivity);
    };

    detectVoiceActivity();
  }, []);

  // Stop listening function
  const stopListening = useCallback(() => {
    setState(prev => ({ ...prev, isListening: false }));
    
    console.log('🔇 [AUDIO] Voice monitoring stopped');

    if (animationFrameRef.current) {
      if (typeof animationFrameRef.current === 'number') {
        cancelAnimationFrame(animationFrameRef.current);
      } else {
        clearInterval(animationFrameRef.current);
      }
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const actions: VoiceAgentActions = {
    connect,
    disconnect,
    startListening,
    stopListening
  };

  return [state, actions];
}; 