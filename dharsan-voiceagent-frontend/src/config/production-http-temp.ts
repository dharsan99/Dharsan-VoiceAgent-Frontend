// Temporary HTTP Configuration for Testing (while resolving HTTPS)
export const PRODUCTION_CONFIG_HTTP_TEMP = {
  // GKE Phase 5 Production URLs - Using HTTP temporarily
  WHIP_URL: import.meta.env.VITE_WHIP_URL || 'http://api.groundedai.in/whip',
  ORCHESTRATOR_WS_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://api.groundedai.in/ws',
  ORCHESTRATOR_HTTP_URL: import.meta.env.VITE_BACKEND_URL || 'http://api.groundedai.in',
  ORCHESTRATOR_GRPC_URL: import.meta.env.VITE_WEBSOCKET_URL?.replace('/ws', '/grpc') || 'ws://api.groundedai.in/grpc',
  
  // Service URLs (HTTP temporarily)
  STT_SERVICE_URL: import.meta.env.VITE_STT_SERVICE_URL || 'http://api.groundedai.in/stt',
  TTS_SERVICE_URL: import.meta.env.VITE_TTS_SERVICE_URL || 'http://api.groundedai.in/tts',
  LLM_SERVICE_URL: import.meta.env.VITE_LLM_SERVICE_URL || 'http://api.groundedai.in/llm',
  
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
  
  // Audio Configuration
  AUDIO_CONFIG: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    channelCount: 1
  }
}; 