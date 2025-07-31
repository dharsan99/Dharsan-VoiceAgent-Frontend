// Production Configuration for GKE Phase 5 Deployment
export const PRODUCTION_CONFIG = {
  // GKE Phase 5 Production URLs - Using environment variables for flexibility
  WHIP_URL: import.meta.env.VITE_WHIP_URL || 'https://34.70.216.41:8001/whip', // Media Server secure connection
  ORCHESTRATOR_WS_URL: import.meta.env.VITE_WEBSOCKET_URL || 'wss://34.70.216.41:8001/ws', // Orchestrator WebSocket secure connection
  ORCHESTRATOR_HTTP_URL: import.meta.env.VITE_BACKEND_URL || 'https://34.70.216.41:8001', // Orchestrator HTTP API direct connection
  ORCHESTRATOR_GRPC_URL: import.meta.env.VITE_WEBSOCKET_URL?.replace('/ws', '/grpc') || 'wss://34.70.216.41:8001/grpc', // Orchestrator gRPC WebSocket secure connection
  
  // Service URLs (internal cluster IPs - for reference)
  STT_SERVICE_URL: import.meta.env.VITE_STT_SERVICE_URL || 'https://34.70.216.41:8001/stt', // STT Service
  TTS_SERVICE_URL: import.meta.env.VITE_TTS_SERVICE_URL || 'https://34.70.216.41:8001/tts', // TTS Service (Port 5000, not 8000)
  LLM_SERVICE_URL: import.meta.env.VITE_LLM_SERVICE_URL || 'https://34.70.216.41:8001/llm', // LLM Service
  
  // Environment
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'production',
  VERSION: '5.0.0',
  
  // Connection settings
  ICE_SERVERS: [
    // STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.stunprotocol.org:3478' },
    
    // TURN servers with authentication
    {
      urls: 'turn:global.relay.metered.ca:80',
      username: import.meta.env.VITE_TURN_USERNAME || '10f1dfa42670d72b3a31482a',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || 'FvFd4gNrt9+OZk4r',
    },
    {
      urls: 'turn:global.relay.metered.ca:80?transport=tcp',
      username: import.meta.env.VITE_TURN_USERNAME || '10f1dfa42670d72b3a31482a',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || 'FvFd4gNrt9+OZk4r',
    },
    {
      urls: 'turn:global.relay.metered.ca:443',
      username: import.meta.env.VITE_TURN_USERNAME || '10f1dfa42670d72b3a31482a',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || 'FvFd4gNrt9+OZk4r',
    },
    {
      urls: 'turns:global.relay.metered.ca:443?transport=tcp',
      username: import.meta.env.VITE_TURN_USERNAME || '10f1dfa42670d72b3a31482a',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || 'FvFd4gNrt9+OZk4r',
    },
  ],
  
  // PHASE 2: Optimized Audio Configuration for STT Accuracy
  // Disable browser audio processing to provide raw audio to STT models
  AUDIO_CONFIG: {
    // Disable browser audio processing for raw audio capture
    echoCancellation: false,  // Disable to get raw audio
    noiseSuppression: false,  // Disable to get raw audio  
    autoGainControl: false,   // Disable to get raw audio
    
    // Don't specify sampleRate - let client capture at native rate
    // Server will resample if needed (e.g., to 16kHz for Whisper)
    // Forcing sampleRate can lead to poor quality resampling by browser
    
    // Use mono for better compatibility and smaller data size
    channelCount: 1
  }
};

// Helper function to get the appropriate URLs based on environment
export const getServiceUrls = () => {
  // Check for URL parameter override for testing production from localhost
  const urlParams = new URLSearchParams(window.location.search);
  const forceProduction = urlParams.get('production') === 'true';
  
  // Always use production URLs if production parameter is set
  if (forceProduction) {
    return {
      whipUrl: PRODUCTION_CONFIG.WHIP_URL,
      orchestratorWsUrl: PRODUCTION_CONFIG.ORCHESTRATOR_WS_URL,
      orchestratorHttpUrl: PRODUCTION_CONFIG.ORCHESTRATOR_HTTP_URL,
      orchestratorGrpcUrl: PRODUCTION_CONFIG.ORCHESTRATOR_GRPC_URL,
      iceServers: PRODUCTION_CONFIG.ICE_SERVERS
    };
  }
  
  const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1';
  
  if (isProduction) {
    return {
      whipUrl: PRODUCTION_CONFIG.WHIP_URL,
      orchestratorWsUrl: PRODUCTION_CONFIG.ORCHESTRATOR_WS_URL,
      orchestratorHttpUrl: PRODUCTION_CONFIG.ORCHESTRATOR_HTTP_URL,
      orchestratorGrpcUrl: PRODUCTION_CONFIG.ORCHESTRATOR_GRPC_URL,
      iceServers: PRODUCTION_CONFIG.ICE_SERVERS
    };
  } else {
    // Development URLs - Using environment variables
    return {
      whipUrl: import.meta.env.VITE_WHIP_URL || 'http://34.70.216.41:8001/whip',
      orchestratorWsUrl: import.meta.env.VITE_WEBSOCKET_URL || 'ws://34.70.216.41:8001/ws',
      orchestratorHttpUrl: import.meta.env.VITE_BACKEND_URL || 'http://34.70.216.41:8001',
      orchestratorGrpcUrl: import.meta.env.VITE_WEBSOCKET_URL?.replace('/ws', '/grpc') || 'ws://34.70.216.41:8001/grpc',
      iceServers: PRODUCTION_CONFIG.ICE_SERVERS
    };
  }
}; 