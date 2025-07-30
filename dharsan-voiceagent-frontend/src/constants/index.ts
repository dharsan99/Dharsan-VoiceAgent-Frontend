// Environment Configuration
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const;

// API Endpoints (DEPRECATED - Use CONFIG from ../config instead)
// This is kept for backwards compatibility only
import { CONFIG } from '../config';

export const API_ENDPOINTS = {
  LOCAL: {
    WEBSOCKET: CONFIG.ORCHESTRATOR.WS_URL,
    HTTP: CONFIG.ORCHESTRATOR.HTTP_URL,
  },
  PRODUCTION: {
    WEBSOCKET: CONFIG.ORCHESTRATOR.WS_URL,
    HTTP: CONFIG.ORCHESTRATOR.HTTP_URL,
  },
} as const;

// WebSocket Message Types
export const WS_MESSAGE_TYPES = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUDIO_DATA: 'audio_data',
  TRANSCRIPT: 'transcript',
  LLM_RESPONSE: 'llm_response',
  TTS_AUDIO: 'tts_audio',
  PIPELINE_STATUS: 'pipeline_status',
  ERROR: 'error',
} as const;

// Phase Configuration
export const PHASES = {
  PHASE1: 'phase1',
  PHASE2: 'phase2',
  PHASE5: 'phase5',
} as const;

// Connection Status
export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
} as const;

// Service Status
export const SERVICE_STATUS = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  ERROR: 'error',
} as const;

// Pipeline Steps
export const PIPELINE_STEPS = {
  IDLE: 'idle',
  LISTENING: 'listening',
  STT_PROCESSING: 'stt_processing',
  LLM_PROCESSING: 'llm_processing',
  TTS_PROCESSING: 'tts_processing',
  RECEIVING_RESPONSE: 'receiving_response',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const;

// Console Log Types
export const CONSOLE_LOG_TYPES = {
  LOG: 'log',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug',
} as const;

// UI Constants
export const UI = {
  ANIMATION_DURATION: 300,
  SCROLLBAR_WIDTH: 4,
  MAX_CONSOLE_LOGS: 50,
  CONSOLE_LOG_HEIGHT: 60,
  HEADER_Z_INDEX: 50,
  FOOTER_Z_INDEX: 40,
} as const;

// Audio Configuration
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 16000,
  CHANNELS: 1,
  BIT_DEPTH: 16,
  BUFFER_SIZE: 4096,
  SILENCE_THRESHOLD: 0.01,
} as const;

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  LATENCY_WARNING: 1000,
  LATENCY_ERROR: 3000,
  AUDIO_QUALITY_WARNING: 70,
  AUDIO_QUALITY_ERROR: 50,
  SUCCESS_RATE_WARNING: 80,
  SUCCESS_RATE_ERROR: 60,
} as const;

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: {
    BLUE: '#3B82F6',
    CYAN: '#06B6D4',
    PURPLE: '#8B5CF6',
    GREEN: '#10B981',
    YELLOW: '#F59E0B',
    RED: '#EF4444',
    ORANGE: '#F97316',
  },
  GRAY: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  PRODUCTION_MODE: 'voice-agent-production-mode',
  DEBUG_MODE: 'voice-agent-debug-mode',
  CONSOLE_LOGS: 'voice-agent-console-logs',
  USER_PREFERENCES: 'voice-agent-preferences',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_CONSOLE_LOGGING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_AUDIO_VISUALIZATION: true,
  ENABLE_DEBUG_PANEL: true,
} as const; 