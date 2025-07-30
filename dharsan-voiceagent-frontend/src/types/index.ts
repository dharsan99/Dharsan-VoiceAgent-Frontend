// Core Types
export interface ConsoleLog {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: Date;
  data?: any;
}

export interface IconProps {
  className?: string;
}

// Phase Types
export type Phase = 'phase1' | 'phase2' | 'phase5';

export interface PhaseStatus {
  enabled: boolean;
  active: boolean;
  features: string[];
}

export interface Phases {
  [key: string]: PhaseStatus;
}

// Connection Types
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectionStates {
  webRTC: { status: ConnectionStatus };
  whip: { status: ConnectionStatus };
  websocket: { status: ConnectionStatus };
}

// Service Types
export type ServiceStatus = 'inactive' | 'active' | 'error';

export interface ServiceStates {
  stt: { status: ServiceStatus };
  llm: { status: ServiceStatus };
  tts: { status: ServiceStatus };
  orchestrator: { status: ServiceStatus };
}

// Pipeline Types
export type PipelineStep = 'idle' | 'listening' | 'stt_processing' | 'llm_processing' | 'tts_processing' | 'receiving_response' | 'complete' | 'error';

export interface PipelineState {
  isActive: boolean;
  currentStep: PipelineStep;
  progress: number;
  error?: string;
}

// Audio Types
export interface AudioState {
  isStreaming: boolean;
  isListening: boolean;
  level: number;
  quality: number;
}

// Performance Types
export interface PerformanceMetrics {
  latency: number;
  audioQuality: number;
  successRate: number;
  connectionUptime: number;
}

// UI Types
export interface UIState {
  isProductionMode: boolean;
  debugMode: boolean;
  showConsole: boolean;
}

// Component Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface StatusIndicatorProps extends BaseComponentProps {
  status: ConnectionStatus | ServiceStatus;
  label: string;
  showLabel?: boolean;
}

export interface ButtonProps extends BaseComponentProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

// API Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
}

// Theme Types
export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
} 