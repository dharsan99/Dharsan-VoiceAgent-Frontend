import { useState, useCallback, useEffect, useRef } from 'react';
import { getServiceUrls } from '../config/production';
import type { PipelineStep } from '../components/PipelineStatus';

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
    type: 'user' | 'ai' | 'interim_user';
    text: string;
    timestamp: Date;
    isFinal?: boolean;
    confidence?: number;
  }>;
  audioLevel: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  // Pipeline status
  pipelineSteps: PipelineStep[];
  pipelineLogs: Array<{
    timestamp: Date;
    step: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
  }>;
  // New state tracking for audio processing
  hasRealAudioStarted: boolean;
  isAudioProcessing: boolean;
}

interface VoiceAgentActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  stopConversation: () => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  getAnswer: () => Promise<void>;
  resetPipeline: () => void;
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
    connectionQuality: 'unknown',
    // Pipeline status
    pipelineSteps: [
      { id: 'whip', name: 'WHIP Connection', status: 'pending' },
      { id: 'websocket', name: 'WebSocket Connection', status: 'pending' },
      { id: 'orchestrator', name: 'Orchestrator', status: 'pending' },
      { id: 'audio-in', name: 'Audio Input', status: 'pending' },
      { id: 'kafka', name: 'Kafka Message', status: 'pending' },
      { id: 'stt', name: 'Speech-to-Text', status: 'pending' },
      { id: 'llm', name: 'AI Response', status: 'pending' },
      { id: 'tts', name: 'Text-to-Speech', status: 'pending' },
      { id: 'frontend-receive', name: 'Frontend Receive', status: 'pending' }
    ],
    pipelineLogs: [],
    // New state tracking
    hasRealAudioStarted: false,
    isAudioProcessing: false
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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio enhancement nodes
  const gainNodeRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const enhancedStreamRef = useRef<MediaStream | null>(null);

  const addPipelineLog = useCallback((step: string, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setState(prev => ({
      ...prev,
      pipelineLogs: [...prev.pipelineLogs, {
        timestamp: new Date(),
        step,
        message,
        type
      }]
    }));
  }, []);

  // Pipeline status update functions
  const updatePipelineStep = useCallback((stepId: string, status: PipelineStep['status'], message?: string, latency?: number, audioLevel?: number) => {
    setState(prev => ({
      ...prev,
      pipelineSteps: prev.pipelineSteps.map(step => 
        step.id === stepId 
          ? { ...step, status, message, timestamp: new Date(), latency, audioLevel }
          : step
      ),
      pipelineLogs: [...prev.pipelineLogs, {
        timestamp: new Date(),
        step: stepId,
        message: message || `${stepId} ${status}`,
        type: status === 'error' ? 'error' : status === 'success' ? 'success' : 'info'
      }]
    }));
  }, []);

  // Audio enhancement function
  const enhanceAudio = useCallback((stream: MediaStream): MediaStream => {
    try {
      console.log('🎵 [AUDIO] Starting audio enhancement processing...');
      
      const audioContext = new AudioContext({ sampleRate: 48000 }); // Higher sample rate for better quality
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create audio enhancement chain
      
      // 1. Gain boost for quiet audio
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 2.5; // Boost quiet audio by 2.5x
      gainNodeRef.current = gainNode;
      
      // 2. Compressor to even out volume levels
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -24; // Start compression at -24dB
      compressor.knee.value = 30; // Soft knee for smooth compression
      compressor.ratio.value = 4; // 4:1 compression ratio
      compressor.attack.value = 0.003; // Fast attack (3ms)
      compressor.release.value = 0.25; // Moderate release (250ms)
      compressorRef.current = compressor;
      
      // 3. High-pass filter to remove low-frequency noise
      const highPassFilter = audioContext.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.value = 80; // Remove frequencies below 80Hz
      highPassFilter.Q.value = 1.0; // Moderate resonance
      filterRef.current = highPassFilter;
      
      // 4. Low-pass filter to remove high-frequency noise
      const lowPassFilter = audioContext.createBiquadFilter();
      lowPassFilter.type = 'lowpass';
      lowPassFilter.frequency.value = 8000; // Keep frequencies below 8kHz
      lowPassFilter.Q.value = 1.0;
      
      // 5. Final gain control for output level
      const outputGain = audioContext.createGain();
      outputGain.gain.value = 1.2; // Slight boost for final output
      
      // Connect the audio processing chain
      source
        .connect(gainNode)
        .connect(compressor)
        .connect(highPassFilter)
        .connect(lowPassFilter)
        .connect(outputGain);
      
      // Create destination stream
      const destination = audioContext.createMediaStreamDestination();
      outputGain.connect(destination);
      
      // Store the enhanced stream
      enhancedStreamRef.current = destination.stream;
      
      console.log('✅ [AUDIO] Audio enhancement chain created successfully');
      addPipelineLog('audio-in', 'Audio enhancement enabled: Gain boost + Compression + Noise filtering', 'success');
      
      return destination.stream;
      
    } catch (error) {
      console.error('❌ [AUDIO] Audio enhancement failed:', error);
      addPipelineLog('audio-in', 'Audio enhancement failed, using original stream', 'warning');
      return stream; // Fallback to original stream
    }
  }, [addPipelineLog]);

  const resetPipeline = useCallback(() => {
    setState(prev => ({
      ...prev,
      pipelineSteps: prev.pipelineSteps.map(step => ({ ...step, status: 'pending' as const, message: undefined, timestamp: undefined, latency: undefined, audioLevel: undefined })),
      pipelineLogs: [],
      hasRealAudioStarted: false,
      isAudioProcessing: false
    }));
  }, []);

  // Helper functions for managing interim messages
  const updateInterimMessage = useCallback((transcript: string, isFinal: boolean, confidence: number = 0) => {
    setState(prev => {
      const newHistory = [...prev.conversationHistory];
      
      // Find the last interim message
      let lastInterimIndex = -1;
      for (let i = newHistory.length - 1; i >= 0; i--) {
        if (newHistory[i].type === 'interim_user') {
          lastInterimIndex = i;
          break;
        }
      }
      
      if (lastInterimIndex !== -1) {
        // Update existing interim message
        newHistory[lastInterimIndex] = {
          ...newHistory[lastInterimIndex],
          text: transcript,
          isFinal,
          confidence,
          timestamp: new Date()
        };
        
        // If this is final, convert to regular user message
        if (isFinal) {
          newHistory[lastInterimIndex] = {
            ...newHistory[lastInterimIndex],
            type: 'user' as const
          };
        }
      } else {
        // Create new interim message
        newHistory.push({
          id: `interim_${Date.now()}`,
          type: isFinal ? 'user' : 'interim_user',
          text: transcript,
          timestamp: new Date(),
          isFinal,
          confidence
        });
      }
      
      return {
        ...prev,
        conversationHistory: newHistory
      };
    });
  }, []);

  const clearInterimMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversationHistory: prev.conversationHistory.filter(msg => msg.type !== 'interim_user')
    }));
  }, []);

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

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
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

  // WebSocket connection with retry logic
  const connectWebSocket = useCallback(async (sessionId: string, retryCount = 0): Promise<WebSocket> => {
    const maxRetries = 3;
    const { orchestratorWsUrl } = getServiceUrls();
    
            addPipelineLog('websocket', `Attempting WebSocket connection (attempt ${retryCount + 1}/${maxRetries + 1}): ${orchestratorWsUrl}`);
        updatePipelineStep('websocket', 'connecting', `Attempt ${retryCount + 1}/${maxRetries + 1}`);
    
    return new Promise((resolve, reject) => {
      const websocket = new WebSocket(orchestratorWsUrl);
      
      // Clear any existing timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      
      // Set connection timeout (increased to 15 seconds)
      connectionTimeoutRef.current = setTimeout(() => {
        if (websocket.readyState === WebSocket.CONNECTING) {
          console.error(`⏰ [WS] Connection timeout after 15 seconds (attempt ${retryCount + 1})`);
          websocket.close();
          reject(new Error('WebSocket connection timeout'));
        }
      }, 15000);

      websocket.onopen = () => {
        addPipelineLog('websocket', `WebSocket connection opened successfully (attempt ${retryCount + 1})`, 'success');
        updatePipelineStep('websocket', 'success', `Connected on attempt ${retryCount + 1}`);
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
        
        // Send session info to orchestrator
        const sessionInfo = {
          type: 'session_info',
          session_id: sessionId,
          version: 'phase2'
        };
        addPipelineLog('websocket', `Sending session info: ${JSON.stringify(sessionInfo)}`);
        websocket.send(JSON.stringify(sessionInfo));
        
        resolve(websocket);
      };

      websocket.onerror = (error) => {
        console.error(`❌ [WS] WebSocket error (attempt ${retryCount + 1}):`, error);
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
        reject(error);
      };

      websocket.onclose = (event) => {
        addPipelineLog('websocket', `WebSocket closed (attempt ${retryCount + 1}) - Code: ${event.code}, Reason: ${event.reason}`, 'error');
        updatePipelineStep('websocket', 'error', `Closed: ${event.code}`);
        
        // Update frontend connection status
        setState(prev => ({
          ...prev,
          connectionStatus: 'disconnected',
          isConnected: false,
          isConnecting: false
        }));
        
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
        
        if (event.code === 1006 && retryCount < maxRetries) {
          addPipelineLog('websocket', 'Abnormal closure (1006), retrying in 2 seconds...', 'warning');
          setTimeout(() => {
            connectWebSocket(sessionId, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, 2000);
        } else {
          reject(new Error(`WebSocket closed with code ${event.code}: ${event.reason}`));
        }
      };
    });
  }, []);

  // Heartbeat functions
  const startHeartbeat = useCallback((websocket: WebSocket) => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (websocket.readyState === WebSocket.OPEN) {
        // Send JSON ping message (for application-level heartbeat)
        websocket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000); // Send ping every 25 seconds (before server's 30-second ping)
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Connect function
  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, connectionStatus: 'connecting', error: null }));

      // Generate temporary session ID for WHIP request (will be replaced by backend response)
      const tempSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setState(prev => ({ ...prev, sessionId: tempSessionId }));

      // Request user media
      const { PRODUCTION_CONFIG } = await import('../config/production');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: PRODUCTION_CONFIG.AUDIO_CONFIG
      });
      
      // Enhance the audio stream for better quality
      const enhancedStream = enhanceAudio(stream);
      localStreamRef.current = enhancedStream;

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: getServiceUrls().iceServers || [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peerConnectionRef.current = peerConnection;

      // Add local tracks
      enhancedStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, enhancedStream);
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
          // Don't set connectionStatus to 'connected' yet - wait for WHIP to complete
          setState(prev => ({ 
            ...prev, 
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
        // TTS track established - this is just the connection, not actual audio
        addPipelineLog('tts', 'TTS audio track established', 'info');
        updatePipelineStep('tts', 'connecting', 'TTS track ready');
        updatePipelineStep('frontend-receive', 'connecting', 'Audio channel ready');
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
      
      addPipelineLog('whip', `Sending WHIP request to: ${whipUrl}`);
      addPipelineLog('whip', `SDP Offer length: ${finalOffer.sdp.length} bytes`);
      updatePipelineStep('whip', 'connecting', 'Sending SDP offer');
      
      const response = await fetch(whipUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
          'X-Session-ID': tempSessionId,
        },
        body: finalOffer.sdp
      });

      addPipelineLog('whip', `WHIP Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [WHIP] Error response:', errorText);
        throw new Error(`WHIP request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const answerSdp = await response.text();
      addPipelineLog('whip', `SDP Answer received, length: ${answerSdp.length} bytes`, 'success');

      // Extract session ID from response headers
      const backendSessionId = response.headers.get('X-Session-ID');
      if (backendSessionId) {
        addPipelineLog('whip', `Backend session ID received: ${backendSessionId}`, 'success');
        setState(prev => ({ ...prev, sessionId: backendSessionId }));
      } else {
        addPipelineLog('whip', 'No session ID in response headers, using temporary ID', 'warning');
      }

      // Set remote description
      const answer = new RTCSessionDescription({ type: 'answer', sdp: answerSdp });
      addPipelineLog('whip', 'Setting remote description...');
      await peerConnection.setRemoteDescription(answer);
      addPipelineLog('whip', 'Remote description set successfully', 'success');
      updatePipelineStep('whip', 'success', 'WHIP connection established');

      // Now that WHIP is established, set connection status to connected
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'connected', 
        isConnected: true, 
        isConnecting: false
      }));

      // Connect to orchestrator WebSocket with retry logic
      addPipelineLog('websocket', 'Connecting to orchestrator WebSocket...');
      const websocket = await connectWebSocket(backendSessionId || tempSessionId);
      websocketRef.current = websocket;

      // Set up WebSocket message handling
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'ping':
              addPipelineLog('websocket', 'Received ping, sending pong');
              websocket.send(JSON.stringify({ type: 'pong' }));
              break;

            case 'pong':
              addPipelineLog('websocket', 'Received pong');
              break;

            case 'session_confirmed':
              addPipelineLog('websocket', 'Session confirmed by orchestrator', 'success');
              updatePipelineStep('orchestrator', 'success', 'Session confirmed');
              break;

            case 'interim_transcript':
              // Handle interim transcript updates
              if (data.transcript && data.transcript.trim() !== '') {
                const isFinal = data.is_final || false;
                const confidence = data.confidence || 0;
                
                // Update or create interim message
                updateInterimMessage(data.transcript, isFinal, confidence);
                
                // Update transcript state
                setState(prev => ({ ...prev, transcript: data.transcript }));
                
                // Log the interim update
                addPipelineLog('stt', `Interim transcript: ${data.transcript}${isFinal ? ' (final)' : ''}`, 'info');
                
                // Update pipeline step for interim processing
                updatePipelineStep('stt', 'processing', 'Processing transcript');
              }
              break;

            case 'final_transcript':
              // Check if this is real user audio vs background noise
              const isRealAudio = isRealUserAudio(data.transcript);
              
              if (isRealAudio) {
                // Real user audio - mark pipeline steps as success
                addPipelineLog('stt', `User said: ${data.transcript}`, 'success');
                updatePipelineStep('stt', 'success', 'Transcription completed');
                updatePipelineStep('audio-in', 'success', 'Audio processed');
                updatePipelineStep('kafka', 'success', 'Message delivered');
                
                // Set audio processing state
                setState(prev => ({ 
                  ...prev, 
                  hasRealAudioStarted: true,
                  isAudioProcessing: true
                }));
                
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
              } else {
                // Background noise - log but don't mark as success
                addPipelineLog('stt', `Background noise detected: ${data.transcript}`, 'info');
                // Don't update pipeline steps or conversation history for background noise
              }
              break;

            case 'ai_response':
              // Check if this is a real AI response vs test/mock response
              const isRealResponse = isRealAIResponse(data.response);
              
              if (isRealResponse && state.hasRealAudioStarted) {
                // Real AI response for real user audio - mark pipeline steps as success
                addPipelineLog('llm', `AI Response: ${data.response}`, 'success');
                updatePipelineStep('llm', 'success', 'Response generated');
                
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
                      isProcessing: false,
                      isAudioProcessing: false
                    };
                  });
                }
              } else {
                // Test/mock response or response without real audio - log but don't mark as success
                addPipelineLog('llm', `Test/mock response received: ${data.response}`, 'info');
                // Don't update pipeline steps or conversation history for test responses
              }
              break;

            case 'processing_start':
              addPipelineLog('llm', 'AI processing started...');
              updatePipelineStep('llm', 'processing', 'Generating response');
              setState(prev => ({ ...prev, isProcessing: true }));
              break;

            case 'processing_end':
            case 'processing_complete':
              addPipelineLog('llm', 'AI processing completed', 'success');
              setState(prev => ({ ...prev, isProcessing: false }));
              break;

            case 'connection_established':
              addPipelineLog('orchestrator', 'Orchestrator connected', 'success');
              updatePipelineStep('orchestrator', 'success', 'Connected');
              // Clear conversation history and reset audio processing state when establishing new connection
              setState(prev => ({ 
                ...prev, 
                conversationHistory: [],
                transcript: '',
                aiResponse: null,
                error: null,
                hasRealAudioStarted: false,
                isAudioProcessing: false
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

      // Set up WebSocket ping/pong handling for connection stability
      websocket.onopen = () => {
        addPipelineLog('websocket', 'WebSocket connection opened and ready', 'success');
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
        addPipelineLog('websocket', `Connection closed: ${event.code} ${event.reason || ''}`, 'error');
        updatePipelineStep('websocket', 'error', `Closed: ${event.code}`);
        stopHeartbeat();
        setState(prev => ({ 
          ...prev, 
          error: `WebSocket connection closed: ${event.code} ${event.reason || ''}`,
          connectionStatus: 'error'
        }));
      };

      // Start heartbeat
      startHeartbeat(websocket);
      
      // Set up audio context for voice activity detection (for UI feedback)
      if (localStreamRef.current) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(localStreamRef.current);
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        source.connect(analyser);
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        audioContextRef.current = audioContext;

        // Start voice activity detection
        const detectVoiceActivity = () => {
          if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            
            // Calculate average volume
            const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
            const normalizedVolume = average / 255;
            
            setState(prev => ({ ...prev, audioLevel: normalizedVolume }));
            
            // Update pipeline step with audio level
            updatePipelineStep('audio-in', 'processing', 'Listening for audio', undefined, normalizedVolume);
            
            // Continue monitoring
            animationFrameRef.current = requestAnimationFrame(detectVoiceActivity);
          }
        };
        
        detectVoiceActivity();
      }

      addPipelineLog('connection', 'All connections established successfully', 'success');
      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isConnecting: false, 
        connectionStatus: 'connected',
        error: null
      }));

    } catch (error) {
      console.error('❌ [CONNECTION] Connection failed:', error);
      setState(prev => ({ 
        ...prev, 
        isConnecting: false,
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
      cleanup();
    }
  }, [cleanup, connectWebSocket, startHeartbeat, stopHeartbeat]);

  const disconnect = useCallback(() => {
    addPipelineLog('connection', 'Disconnecting...', 'warning');
    cleanup();
  }, [cleanup]);

  const stopConversation = useCallback(async () => {
    try {
      addPipelineLog('connection', 'Stopping AI conversation gracefully...', 'info');
      
      // Step 1: Stop listening if currently listening
      if (state.isListening) {
        addPipelineLog('audio-in', 'Stopping listening...', 'info');
        updatePipelineStep('audio-in', 'pending', 'Stopping listening', undefined, 0);
        setState(prev => ({ ...prev, isListening: false }));
      }

      // Step 2: Send graceful shutdown message to orchestrator
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        addPipelineLog('websocket', 'Sending graceful shutdown message...', 'info');
        const shutdownMessage = {
          type: 'shutdown',
          session_id: state.sessionId,
          timestamp: new Date().toISOString()
        };
        websocketRef.current.send(JSON.stringify(shutdownMessage));
        
        // Wait a moment for the message to be sent
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Step 3: Update pipeline status to show stopping
      updatePipelineStep('orchestrator', 'processing', 'Stopping conversation');
      updatePipelineStep('websocket', 'processing', 'Closing connection');
      updatePipelineStep('whip', 'processing', 'Closing media connection');

      // Step 4: Clean up resources gracefully
      addPipelineLog('connection', 'Cleaning up resources...', 'info');
      
      // Stop audio level monitoring
      if (animationFrameRef.current) {
        if (typeof animationFrameRef.current === 'number') {
          cancelAnimationFrame(animationFrameRef.current);
        } else {
          clearInterval(animationFrameRef.current);
        }
        animationFrameRef.current = null;
      }

      // Close WebSocket gracefully
      if (websocketRef.current) {
        websocketRef.current.close(1000, 'User requested conversation stop');
        websocketRef.current = null;
      }

      // Close peer connection gracefully
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Stop local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Clear intervals and timeouts
      if (connectionQualityRef.current) {
        clearInterval(connectionQualityRef.current);
        connectionQualityRef.current = null;
      }

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }

      // Step 5: Update final state
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        connectionStatus: 'disconnected',
        error: null,
        isListening: false,
        audioLevel: 0,
        transcript: '',
        aiResponse: null,
        isProcessing: false
      }));

      // Step 6: Update pipeline status to show completion
      updatePipelineStep('orchestrator', 'success', 'Conversation stopped');
      updatePipelineStep('websocket', 'success', 'Connection closed');
      updatePipelineStep('whip', 'success', 'Media connection closed');
      updatePipelineStep('audio-in', 'pending', 'Ready for new conversation', undefined, 0);

      addPipelineLog('connection', 'AI conversation stopped gracefully', 'success');
      
    } catch (error) {
      addPipelineLog('connection', `Error stopping conversation: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      // Fallback to basic cleanup if graceful stop fails
      cleanup();
    }
  }, [state.isListening, state.sessionId, cleanup, updatePipelineStep, addPipelineLog]);

  const startListening = useCallback(async () => {
    if (!state.isConnected) {
      console.warn('⚠️ [LISTENING] Cannot start listening - not connected');
      return;
    }
    
    if (!state.sessionId) {
      console.warn('⚠️ [LISTENING] Cannot start listening - no session ID');
      return;
    }


    
    try {
      addPipelineLog('audio-in', 'Starting listening...');
      updatePipelineStep('audio-in', 'processing', 'Starting audio processing...', undefined, 0);
      
      // Call media server to enable audio processing
      const response = await fetch('http://35.244.8.62:8001/listening/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: state.sessionId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ [LISTENING] Media server listening started:', result);
      
      updatePipelineStep('audio-in', 'processing', 'Listening for audio', undefined, 0);
      setState(prev => ({ ...prev, isListening: true }));
      addPipelineLog('audio-in', 'Audio processing enabled on media server');
      
    } catch (error) {
      console.error('❌ [LISTENING] Failed to start listening:', error);
      addPipelineLog('audio-in', `Failed to start listening: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      updatePipelineStep('audio-in', 'error', 'Failed to start listening');
    }
  }, [state.isConnected, state.sessionId, addPipelineLog, updatePipelineStep]);

  const stopListening = useCallback(async () => {
    if (!state.sessionId) {
      console.warn('⚠️ [LISTENING] Cannot stop listening - no session ID');
      return;
    }
    
    try {
      addPipelineLog('audio-in', 'Stopping listening...');
      
      // Call media server to disable audio processing
      const response = await fetch('http://35.244.8.62:8001/listening/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: state.sessionId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ [LISTENING] Media server listening stopped:', result);
      
      updatePipelineStep('audio-in', 'pending', 'Not listening', undefined, 0);
      setState(prev => ({ ...prev, isListening: false }));
      addPipelineLog('audio-in', 'Audio processing disabled on media server');
      
    } catch (error) {
      console.error('❌ [LISTENING] Failed to stop listening:', error);
      addPipelineLog('audio-in', `Failed to stop listening: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }, [state.sessionId, addPipelineLog, updatePipelineStep]);

  const getAnswer = useCallback(async () => {
    try {
      if (!state.isConnected) {
        addPipelineLog('connection', 'Cannot get answer - not connected', 'error');
        return;
      }

      if (!state.isListening) {
        addPipelineLog('audio-in', 'Cannot get answer - not listening', 'error');
        return;
      }

      addPipelineLog('pipeline', 'Processing audio through AI pipeline...', 'info');
      updatePipelineStep('kafka', 'processing', 'Sending audio to pipeline');
      updatePipelineStep('stt', 'processing', 'Converting speech to text');
      updatePipelineStep('llm', 'processing', 'Generating AI response');
      updatePipelineStep('tts', 'processing', 'Converting response to speech');

      // Stop listening to prevent more audio input
      setState(prev => ({ 
        ...prev, 
        isListening: false,
        hasRealAudioStarted: true,
        isAudioProcessing: true
      }));
      updatePipelineStep('audio-in', 'success', 'Audio captured, processing...', undefined, 0);

      // Wait for processing to complete (this will be handled by WebSocket messages)
      addPipelineLog('pipeline', 'Audio sent to AI pipeline, waiting for response...', 'info');

    } catch (error) {
      addPipelineLog('pipeline', `Error getting answer: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      updatePipelineStep('kafka', 'error', 'Failed to send audio');
      updatePipelineStep('stt', 'error', 'Processing failed');
      updatePipelineStep('llm', 'error', 'Response generation failed');
      updatePipelineStep('tts', 'error', 'Speech synthesis failed');
    }
  }, [state.isConnected, state.isListening, addPipelineLog, updatePipelineStep]);

  // Update audio level in pipeline when listening
  useEffect(() => {
    if (state.isListening) {
      updatePipelineStep('audio-in', 'processing', 'Listening for audio', undefined, state.audioLevel);
    }
  }, [state.isListening, state.audioLevel, updatePipelineStep]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Helper function to check if transcript is real user audio vs background noise
  const isRealUserAudio = useCallback((transcript: string): boolean => {
    if (!transcript || transcript.trim() === '') return false;
    
    // Filter out common background noise/breathing patterns
    const noisePatterns = [
      'I heard something. Please continue speaking.',
      'Hello, this is a test message for the voice agent system.',
      'Background noise detected',
      'Speech pause detected',
      'Breathing detected',
      'Silence detected'
    ];
    
    return !noisePatterns.some(pattern => 
      transcript.toLowerCase().includes(pattern.toLowerCase())
    );
  }, []);

  // Helper function to check if AI response is a real response vs test/mock
  const isRealAIResponse = useCallback((response: string): boolean => {
    if (!response || response.trim() === '') return false;
    
    // Filter out common test/mock responses
    const mockPatterns = [
      'Hi there! I\'m here to assist you.',
      'Greetings! What would you like to know?',
      'Hello, this is a test response',
      'Test response generated',
      'Mock AI response'
    ];
    
    return !mockPatterns.some(pattern => 
      response.toLowerCase().includes(pattern.toLowerCase())
    );
  }, []);

  return [state, { connect, disconnect, stopConversation, startListening, stopListening, getAnswer, resetPipeline }];
}; 