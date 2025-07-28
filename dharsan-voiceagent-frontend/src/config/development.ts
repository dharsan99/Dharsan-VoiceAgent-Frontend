// Development Configuration for Testing
export const DEVELOPMENT_CONFIG = {
  // Development URLs (HTTPS/WSS for testing with new secure backend)
  WHIP_URL: 'https://35.244.8.62:8001/whip', // Media Server LoadBalancer IP
  ORCHESTRATOR_WS_URL: 'wss://35.244.33.111:443/ws', // Orchestrator WebSocket (HTTPS)
  ORCHESTRATOR_HTTP_URL: 'https://35.244.33.111:443', // Orchestrator HTTP API (HTTPS)
  ORCHESTRATOR_GRPC_URL: 'wss://35.244.33.111:443/grpc', // Orchestrator gRPC WebSocket (HTTPS)
  
  // Environment
  ENVIRONMENT: 'development',
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