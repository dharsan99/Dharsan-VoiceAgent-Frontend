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
  // gRPC specific states
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
  // gRPC specific tracking
  grpcStreamActive: boolean;
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
  sendControlMessage: (controlType: string, parameters?: Record<string, string>) => Promise<void>;
}

// gRPC Client using WebSocket for browser compatibility
class GRPCWebClient {
  private ws: WebSocket | null = null;
  private messageId = 0;
  private callbacks = new Map<number, (response: any) => void>();
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('🔗 gRPC WebSocket connected');
        resolve();
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ gRPC WebSocket error:', error);
        reject(error);
      };
      
      this.ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          const callback = this.callbacks.get(response.id);
          if (callback) {
            callback(response);
            this.callbacks.delete(response.id);
          }
        } catch (error) {
          console.error('❌ Failed to parse gRPC response:', error);
        }
      };
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async healthCheck(): Promise<any> {
    return this.sendRequest('HealthCheck', {
      service_name: 'frontend-client',
      timestamp: Date.now()
    });
  }

  async sendControlMessage(sessionId: string, controlType: string, parameters: Record<string, string> = {}): Promise<any> {
    return this.sendRequest('SendControlMessage', {
      session_id: sessionId,
      control_type: controlType,
      parameters,
      timestamp: Date.now()
    });
  }

  async startAudioStream(sessionId: string, onAudioResponse: (response: any) => void): Promise<void> {
    const messageId = ++this.messageId;
    
    return new Promise((resolve, reject) => {
      this.callbacks.set(messageId, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });

      this.ws?.send(JSON.stringify({
        id: messageId,
        method: 'StreamAudio',
        params: {
          session_id: sessionId,
          start_stream: true
        }
      }));
    });
  }

  async sendAudioChunk(sessionId: string, audioData: ArrayBuffer, metadata: any): Promise<void> {
    this.ws?.send(JSON.stringify({
      method: 'AudioChunk',
      params: {
        session_id: sessionId,
        audio_data: Array.from(new Uint8Array(audioData)),
        timestamp: Date.now(),
        metadata
      }
    }));
  }

  private async sendRequest(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = ++this.messageId;
      
      this.callbacks.set(messageId, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.result);
        }
      });

      this.ws?.send(JSON.stringify({
        id: messageId,
        method,
        params
      }));
    });
  }
}

export const useVoiceAgentGRPC = (): [VoiceAgentState, VoiceAgentActions] => {
  const [state, setState] = useState<VoiceAgentState>({
    isConnected: false,
    isConnecting: false,
    connectionStatus: 'disconnected',
    error: null,
    transcript: '',
    isListening: false,
    sessionId: null,
    version: '5.0.0-grpc',
    aiResponse: null,
    isProcessing: false,
    conversationHistory: [],
    audioLevel: 0,
    connectionQuality: 'unknown',
    pipelineSteps: [
      { id: 'grpc-connection', name: 'gRPC Connection', status: 'pending' },
      { id: 'audio-capture', name: 'Audio Capture', status: 'pending' },
      { id: 'audio-stream', name: 'Audio Stream', status: 'pending' },
      { id: 'stt-processing', name: 'Speech-to-Text', status: 'pending' },
      { id: 'llm-processing', name: 'AI Processing', status: 'pending' },
      { id: 'tts-generation', name: 'Text-to-Speech', status: 'pending' },
      { id: 'audio-playback', name: 'Audio Playback', status: 'pending' }
    ],
    pipelineLogs: [],
    grpcStreamActive: false,
    isAudioProcessing: false
  });

  const grpcClientRef = useRef<GRPCWebClient | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const isStreamingRef = useRef<boolean>(false);

  const updatePipelineStep = useCallback((stepId: string, status: 'pending' | 'connecting' | 'processing' | 'success' | 'error', message?: string) => {
    setState(prev => ({
      ...prev,
      pipelineSteps: prev.pipelineSteps.map(step => 
        step.id === stepId ? { ...step, status } : step
      ),
      pipelineLogs: message ? [
        ...prev.pipelineLogs,
        {
          timestamp: new Date(),
          step: stepId,
          message,
          type: status === 'error' ? 'error' : status === 'success' ? 'success' : 'info'
        }
      ] : prev.pipelineLogs
    }));
  }, []);

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, connectionStatus: 'connecting' }));
      updatePipelineStep('grpc-connection', 'connecting', 'Connecting to gRPC server...');

      const { orchestratorGrpcUrl } = getServiceUrls();
      const grpcUrl = orchestratorGrpcUrl;
      
      grpcClientRef.current = new GRPCWebClient(grpcUrl);
      await grpcClientRef.current.connect();

      // Test health check
      const healthResponse = await grpcClientRef.current.healthCheck();
      console.log('🏥 Health check response:', healthResponse);

      // Generate session ID
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        connectionStatus: 'connected',
        sessionId: sessionIdRef.current,
        error: null
      }));

      updatePipelineStep('grpc-connection', 'success', 'gRPC connection established');
      
    } catch (error) {
      console.error('❌ Failed to connect:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
      updatePipelineStep('grpc-connection', 'error', `Connection failed: ${error}`);
    }
  }, [updatePipelineStep]);

  const disconnect = useCallback(() => {
    if (grpcClientRef.current) {
      grpcClientRef.current.disconnect();
      grpcClientRef.current = null;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    isStreamingRef.current = false;
    sessionIdRef.current = null;

    setState(prev => ({
      ...prev,
      isConnected: false,
      connectionStatus: 'disconnected',
      isListening: false,
      grpcStreamActive: false,
      isAudioProcessing: false,
      audioLevel: 0
    }));
  }, []);

  const startListening = useCallback(async () => {
    if (!grpcClientRef.current || !sessionIdRef.current) {
      console.error('❌ Not connected to gRPC server');
      return;
    }

    try {
      updatePipelineStep('audio-capture', 'processing', 'Starting audio capture...');

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 16000
        }
      });

      localStreamRef.current = stream;
      updatePipelineStep('audio-capture', 'success', 'Audio capture started');

      // Start audio context and analyzer
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

      // Start gRPC audio stream
      updatePipelineStep('audio-stream', 'processing', 'Starting gRPC audio stream...');
      await grpcClientRef.current.startAudioStream(sessionIdRef.current, (response) => {
        console.log('🎵 Received audio response:', response);
        
        if (response.transcript) {
          setState(prev => ({
            ...prev,
            transcript: response.transcript,
            conversationHistory: [
              ...prev.conversationHistory,
              {
                id: `user_${Date.now()}`,
                type: 'user',
                text: response.transcript,
                timestamp: new Date(),
                isFinal: response.response_type === 'final',
                confidence: response.confidence
              }
            ]
          }));
        }

        if (response.ai_response) {
          setState(prev => ({
            ...prev,
            aiResponse: response.ai_response,
            conversationHistory: [
              ...prev.conversationHistory,
              {
                id: `ai_${Date.now()}`,
                type: 'ai',
                text: response.ai_response,
                timestamp: new Date()
              }
            ]
          }));
        }
      });

      updatePipelineStep('audio-stream', 'success', 'gRPC audio stream active');

      // Start audio level monitoring
      const updateAudioLevel = () => {
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
          const normalizedLevel = average / 255;
          
          setState(prev => ({ ...prev, audioLevel: normalizedLevel }));

          // Send audio chunk if streaming
          if (isStreamingRef.current && grpcClientRef.current && sessionIdRef.current) {
            // Convert audio data to buffer (simplified - in real implementation, you'd capture actual audio data)
            const audioBuffer = new ArrayBuffer(1024);
            grpcClientRef.current.sendAudioChunk(sessionIdRef.current, audioBuffer, {
              energy_level: normalizedLevel,
              voice_activity: normalizedLevel > 0.1,
              confidence: normalizedLevel,
              audio_format: 'opus',
              sample_rate: 16000,
              channels: 1
            });
          }
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
      isStreamingRef.current = true;

      setState(prev => ({
        ...prev,
        isListening: true,
        grpcStreamActive: true
      }));

    } catch (error) {
      console.error('❌ Failed to start listening:', error);
      updatePipelineStep('audio-capture', 'error', `Failed to start audio capture: ${error}`);
    }
  }, [updatePipelineStep]);

  const stopListening = useCallback(() => {
    isStreamingRef.current = false;
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isListening: false,
      grpcStreamActive: false,
      audioLevel: 0
    }));
  }, []);

  const sendControlMessage = useCallback(async (controlType: string, parameters: Record<string, string> = {}) => {
    if (!grpcClientRef.current || !sessionIdRef.current) {
      throw new Error('Not connected to gRPC server');
    }

    try {
      const response = await grpcClientRef.current.sendControlMessage(sessionIdRef.current, controlType, parameters);
      console.log('🎛️ Control message response:', response);
      return response;
    } catch (error) {
      console.error('❌ Control message failed:', error);
      throw error;
    }
  }, []);

  const getAnswer = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }));
      updatePipelineStep('llm-processing', 'processing', 'Processing AI response...');

      await sendControlMessage('CONTROL_TYPE_TRIGGER_LLM');
      
      updatePipelineStep('llm-processing', 'success', 'AI response generated');
      setState(prev => ({ ...prev, isProcessing: false }));
    } catch (error) {
      console.error('❌ Failed to get answer:', error);
      updatePipelineStep('llm-processing', 'error', `Failed to get AI response: ${error}`);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [sendControlMessage, updatePipelineStep]);

  const stopConversation = useCallback(async () => {
    try {
      await sendControlMessage('CONTROL_TYPE_STOP_LISTENING');
      stopListening();
      setState(prev => ({ ...prev, isProcessing: false }));
    } catch (error) {
      console.error('❌ Failed to stop conversation:', error);
    }
  }, [sendControlMessage, stopListening]);

  const resetPipeline = useCallback(() => {
    setState(prev => ({
      ...prev,
      pipelineSteps: prev.pipelineSteps.map(step => ({ ...step, status: 'pending' })),
      pipelineLogs: [],
      transcript: '',
      aiResponse: null,
      conversationHistory: []
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return [state, {
    connect,
    disconnect,
    stopConversation,
    startListening,
    stopListening,
    getAnswer,
    resetPipeline,
    sendControlMessage
  }];
}; 