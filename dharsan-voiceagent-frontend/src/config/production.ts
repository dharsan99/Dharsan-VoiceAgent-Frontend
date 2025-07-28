// Production Configuration for GKE Phase 5 Deployment
export const PRODUCTION_CONFIG = {
  // GKE Phase 5 Production URLs
  WHIP_URL: 'https://35.244.8.62:8001/whip', // Media Server LoadBalancer IP
  ORCHESTRATOR_WS_URL: 'wss://35.244.33.111:443/ws', // Orchestrator WebSocket (HTTPS)
  ORCHESTRATOR_HTTP_URL: 'https://35.244.33.111:443', // Orchestrator HTTP API (HTTPS)
  ORCHESTRATOR_GRPC_URL: 'wss://35.244.33.111:443/grpc', // Orchestrator gRPC WebSocket (HTTPS)
  
  // Service URLs (internal cluster IPs - for reference)
  STT_SERVICE_URL: 'http://34.118.229.142:8000', // STT Service
  TTS_SERVICE_URL: 'http://34.118.229.5:8000', // TTS Service
  LLM_SERVICE_URL: 'http://34.118.227.19:11434', // LLM Service
  
  // Environment
  ENVIRONMENT: 'production',
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
    console.log('🌐 [CONFIG] Using production URLs (forced via URL parameter)');
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
    console.log('🌐 [CONFIG] Using production URLs (detected production hostname)');
    return {
      whipUrl: PRODUCTION_CONFIG.WHIP_URL,
      orchestratorWsUrl: PRODUCTION_CONFIG.ORCHESTRATOR_WS_URL,
      orchestratorHttpUrl: PRODUCTION_CONFIG.ORCHESTRATOR_HTTP_URL,
      orchestratorGrpcUrl: PRODUCTION_CONFIG.ORCHESTRATOR_GRPC_URL,
      iceServers: PRODUCTION_CONFIG.ICE_SERVERS
    };
  } else {
    // Development URLs
    console.log('🌐 [CONFIG] Using development URLs (localhost detected)');
    return {
      whipUrl: 'http://localhost:8080/whip',
      orchestratorWsUrl: 'ws://localhost:8001/ws',
      orchestratorHttpUrl: 'http://localhost:8001',
      orchestratorGrpcUrl: 'ws://localhost:8001/grpc',
      iceServers: PRODUCTION_CONFIG.ICE_SERVERS
    };
  }
}; 