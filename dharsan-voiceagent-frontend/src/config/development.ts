// Development Configuration for Testing
export const DEVELOPMENT_CONFIG = {
  // Development URLs (Local development) - Using environment variables
  WHIP_URL: import.meta.env.VITE_WHIP_URL || 'http://34.70.216.41:8001/whip',
  ORCHESTRATOR_WS_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://34.70.216.41:8001/ws',
  ORCHESTRATOR_HTTP_URL: import.meta.env.VITE_BACKEND_URL || 'http://34.70.216.41:8001',
  ORCHESTRATOR_GRPC_URL: import.meta.env.VITE_WEBSOCKET_URL?.replace('/ws', '/grpc') || 'ws://34.70.216.41:8001/grpc',
  
  // Environment
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  VERSION: '5.0.0-dev',
  
  // Connection settings (same as production)
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

// Helper function to get development URLs  
export const getDevelopmentUrls = () => {
  return {
    whipUrl: DEVELOPMENT_CONFIG.WHIP_URL,
    orchestratorWsUrl: DEVELOPMENT_CONFIG.ORCHESTRATOR_WS_URL,
    orchestratorHttpUrl: DEVELOPMENT_CONFIG.ORCHESTRATOR_HTTP_URL,
    orchestratorGrpcUrl: DEVELOPMENT_CONFIG.ORCHESTRATOR_GRPC_URL,
    iceServers: DEVELOPMENT_CONFIG.ICE_SERVERS
  };
}; 