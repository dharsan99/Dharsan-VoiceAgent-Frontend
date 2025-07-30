/**
 * Centralized Configuration Management System
 * 
 * This file centralizes all application configuration to eliminate hardcoded endpoints.
 * All URLs, ports, and environment-specific settings are managed here.
 */

// Environment detection
const getEnvironment = (): 'development' | 'production' | 'staging' => {
  // Check for explicit environment override
  if (import.meta.env.VITE_ENVIRONMENT) {
    return import.meta.env.VITE_ENVIRONMENT as 'development' | 'production' | 'staging';
  }
  
  // Auto-detect based on hostname
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return 'development';
  }
  
  return 'production';
};

// Configuration schema interface
interface ServiceConfig {
  ORCHESTRATOR: {
    WS_URL: string;
    HTTP_URL: string;
    GRPC_URL: string;
    PORT: string;
  };
  MEDIA_SERVER: {
    WHIP_URL: string;
    HTTP_URL: string;
    PORT: string;
  };
  STT_SERVICE: {
    HTTP_URL: string;
    PORT: string;
  };
  TTS_SERVICE: {
    HTTP_URL: string;
    PORT: string;
  };
  LLM_SERVICE: {
    HTTP_URL: string;
    PORT: string;
  };
}

interface AppConfig extends ServiceConfig {
  ENVIRONMENT: string;
  VERSION: string;
  ICE_SERVERS: RTCIceServer[];
  AUDIO_CONFIG: {
    SAMPLE_RATE: number;
    CHANNELS: number;
    BIT_DEPTH: number;
    BUFFER_SIZE: number;
  };
  TURN_CREDENTIALS: {
    USERNAME: string;
    CREDENTIAL: string;
  };
}

// Development configuration
const DEVELOPMENT_CONFIG: AppConfig = {
  ENVIRONMENT: 'development',
  VERSION: '5.0.0-dev',
  
  ORCHESTRATOR: {
    WS_URL: import.meta.env.VITE_ORCHESTRATOR_WS_URL || 'ws://localhost:8004/ws',
    HTTP_URL: import.meta.env.VITE_ORCHESTRATOR_HTTP_URL || 'http://localhost:8004',
    GRPC_URL: import.meta.env.VITE_ORCHESTRATOR_GRPC_URL || 'ws://localhost:8004/grpc',
    PORT: import.meta.env.VITE_ORCHESTRATOR_PORT || '8004',
  },
  
  MEDIA_SERVER: {
    WHIP_URL: import.meta.env.VITE_MEDIA_SERVER_WHIP_URL || 'http://localhost:8001/whip',
    HTTP_URL: import.meta.env.VITE_MEDIA_SERVER_HTTP_URL || 'http://localhost:8001',
    PORT: import.meta.env.VITE_MEDIA_SERVER_PORT || '8001',
  },
  
  STT_SERVICE: {
    HTTP_URL: import.meta.env.VITE_STT_SERVICE_URL || 'http://localhost:8000',
    PORT: import.meta.env.VITE_STT_SERVICE_PORT || '8000',
  },
  
  TTS_SERVICE: {
    HTTP_URL: import.meta.env.VITE_TTS_SERVICE_URL || 'http://localhost:5001',
    PORT: import.meta.env.VITE_TTS_SERVICE_PORT || '5001',
  },
  
  LLM_SERVICE: {
    HTTP_URL: import.meta.env.VITE_LLM_SERVICE_URL || 'http://localhost:8003',
    PORT: import.meta.env.VITE_LLM_SERVICE_PORT || '8003',
  },
  
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.stunprotocol.org:3478' },
  ],
  
  AUDIO_CONFIG: {
    SAMPLE_RATE: parseInt(import.meta.env.VITE_SAMPLE_RATE || '48000'),
    CHANNELS: parseInt(import.meta.env.VITE_CHANNELS || '1'),
    BIT_DEPTH: parseInt(import.meta.env.VITE_BIT_DEPTH || '16'),
    BUFFER_SIZE: parseInt(import.meta.env.VITE_BUFFER_SIZE || '4096'),
  },
  
  TURN_CREDENTIALS: {
    USERNAME: import.meta.env.VITE_TURN_USERNAME || '10f1dfa42670d72b3a31482a',
    CREDENTIAL: import.meta.env.VITE_TURN_CREDENTIAL || 'FvFd4gNrt9+OZk4r',
  },
};

// Production configuration
const PRODUCTION_CONFIG: AppConfig = {
  ENVIRONMENT: 'production',
  VERSION: '5.0.0',
  
  ORCHESTRATOR: {
    WS_URL: import.meta.env.VITE_ORCHESTRATOR_WS_URL || 'ws://34.47.230.178:8004/ws',
    HTTP_URL: import.meta.env.VITE_ORCHESTRATOR_HTTP_URL || 'http://34.47.230.178:8004',
    GRPC_URL: import.meta.env.VITE_ORCHESTRATOR_GRPC_URL || 'ws://34.47.230.178:8004/grpc',
    PORT: import.meta.env.VITE_ORCHESTRATOR_PORT || '8004',
  },
  
  MEDIA_SERVER: {
    WHIP_URL: import.meta.env.VITE_MEDIA_SERVER_WHIP_URL || 'http://35.244.8.62:8001/whip',
    HTTP_URL: import.meta.env.VITE_MEDIA_SERVER_HTTP_URL || 'http://35.244.8.62:8001',
    PORT: import.meta.env.VITE_MEDIA_SERVER_PORT || '8001',
  },
  
  STT_SERVICE: {
    HTTP_URL: import.meta.env.VITE_STT_SERVICE_URL || 'http://34.118.229.142:8000',
    PORT: import.meta.env.VITE_STT_SERVICE_PORT || '8000',
  },
  
  TTS_SERVICE: {
    HTTP_URL: import.meta.env.VITE_TTS_SERVICE_URL || 'http://34.118.234.172:5001',
    PORT: import.meta.env.VITE_TTS_SERVICE_PORT || '5001',
  },
  
  LLM_SERVICE: {
    HTTP_URL: import.meta.env.VITE_LLM_SERVICE_URL || 'http://34.118.227.19:8003',
    PORT: import.meta.env.VITE_LLM_SERVICE_PORT || '8003',
  },
  
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
  
  AUDIO_CONFIG: {
    SAMPLE_RATE: parseInt(import.meta.env.VITE_SAMPLE_RATE || '48000'),
    CHANNELS: parseInt(import.meta.env.VITE_CHANNELS || '1'),
    BIT_DEPTH: parseInt(import.meta.env.VITE_BIT_DEPTH || '16'),
    BUFFER_SIZE: parseInt(import.meta.env.VITE_BUFFER_SIZE || '4096'),
  },
  
  TURN_CREDENTIALS: {
    USERNAME: import.meta.env.VITE_TURN_USERNAME || '10f1dfa42670d72b3a31482a',
    CREDENTIAL: import.meta.env.VITE_TURN_CREDENTIAL || 'FvFd4gNrt9+OZk4r',
  },
};

// Staging configuration (if needed)
const STAGING_CONFIG: AppConfig = {
  ...PRODUCTION_CONFIG,
  ENVIRONMENT: 'staging',
  VERSION: '5.0.0-staging',
  // Override with staging-specific URLs when available
};

// Configuration validator
const validateConfig = (config: AppConfig): void => {
  const errors: string[] = [];
  
  // Check required URLs
  if (!config.ORCHESTRATOR.WS_URL) errors.push('ORCHESTRATOR.WS_URL is required');
  if (!config.ORCHESTRATOR.HTTP_URL) errors.push('ORCHESTRATOR.HTTP_URL is required');
  if (!config.MEDIA_SERVER.WHIP_URL) errors.push('MEDIA_SERVER.WHIP_URL is required');
  if (!config.STT_SERVICE.HTTP_URL) errors.push('STT_SERVICE.HTTP_URL is required');
  if (!config.TTS_SERVICE.HTTP_URL) errors.push('TTS_SERVICE.HTTP_URL is required');
  if (!config.LLM_SERVICE.HTTP_URL) errors.push('LLM_SERVICE.HTTP_URL is required');
  
  // Check URL formats
  const urlRegex = /^(ws|wss|http|https):\/\/.+/;
  if (!urlRegex.test(config.ORCHESTRATOR.WS_URL)) errors.push('Invalid ORCHESTRATOR.WS_URL format');
  if (!urlRegex.test(config.ORCHESTRATOR.HTTP_URL)) errors.push('Invalid ORCHESTRATOR.HTTP_URL format');
  if (!urlRegex.test(config.MEDIA_SERVER.WHIP_URL)) errors.push('Invalid MEDIA_SERVER.WHIP_URL format');
  
  if (errors.length > 0) {
    console.error('🚨 Configuration validation errors:', errors);
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
};

// Get configuration based on environment
const getConfig = (): AppConfig => {
  const environment = getEnvironment();
  
  let config: AppConfig;
  switch (environment) {
    case 'development':
      config = DEVELOPMENT_CONFIG;
      break;
    case 'staging':
      config = STAGING_CONFIG;
      break;
    case 'production':
      config = PRODUCTION_CONFIG;
      break;
    default:
      config = DEVELOPMENT_CONFIG;
  }
  
  // Validate configuration
  validateConfig(config);
  
  console.log(`🔧 [CONFIG] Loaded ${environment} configuration`, {
    environment: config.ENVIRONMENT,
    version: config.VERSION,
    orchestrator: config.ORCHESTRATOR.HTTP_URL,
    mediaServer: config.MEDIA_SERVER.HTTP_URL,
    stt: config.STT_SERVICE.HTTP_URL,
    tts: config.TTS_SERVICE.HTTP_URL,
    llm: config.LLM_SERVICE.HTTP_URL,
  });
  
  return config;
};

// Export the active configuration
export const CONFIG = getConfig();

// Export individual components for convenience
export const {
  ORCHESTRATOR,
  MEDIA_SERVER,
  STT_SERVICE,
  TTS_SERVICE,
  LLM_SERVICE,
  ICE_SERVERS,
  AUDIO_CONFIG,
  TURN_CREDENTIALS,
  ENVIRONMENT,
  VERSION,
} = CONFIG;

// Utility functions
export const isProduction = () => CONFIG.ENVIRONMENT === 'production';
export const isDevelopment = () => CONFIG.ENVIRONMENT === 'development';
export const isStaging = () => CONFIG.ENVIRONMENT === 'staging';

// Legacy support for existing components (deprecated - use CONFIG instead)
export const API_ENDPOINTS = {
  LOCAL: {
    WEBSOCKET: CONFIG.ORCHESTRATOR.WS_URL,
    HTTP: CONFIG.ORCHESTRATOR.HTTP_URL,
  },
  PRODUCTION: {
    WEBSOCKET: CONFIG.ORCHESTRATOR.WS_URL,
    HTTP: CONFIG.ORCHESTRATOR.HTTP_URL,
  },
};

// Export configuration types
export type { AppConfig, ServiceConfig };