// Unified V2 Dashboard Types and Interfaces

export type PhaseType = 'phase1' | 'phase2' | 'phase5';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type ServiceStatus = 'idle' | 'waiting' | 'executing' | 'complete' | 'error';

export type ServiceType = 'stt' | 'llm' | 'tts' | 'webrtc' | 'whip' | 'websocket';

export interface PhaseStatus {
  phase: PhaseType;
  enabled: boolean;
  active: boolean;
  features: {
    webRTC: boolean;
    whip: boolean;
    eventDriven: boolean;
    audioProcessing: boolean;
    pipelineMonitoring: boolean;
    testingTools: boolean;
  };
}

export interface ConnectionState {
  status: ConnectionStatus;
  sessionId?: string;
  error?: string;
  connectedAt?: Date;
  lastActivity?: Date;
}

export interface ServiceState {
  type: ServiceType;
  status: ServiceStatus;
  progress: number; // 0-1
  message?: string;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number; // milliseconds
}

export interface PerformanceMetrics {
  latency: number; // milliseconds
  packetLoss: number; // percentage
  audioQuality: number; // 0-100
  connectionUptime: number; // percentage
  successRate: number; // percentage
  processingTime: number; // milliseconds
}

export interface AudioState {
  isStreaming: boolean;
  isListening: boolean;
  audioLevel: number; // 0-1
  sampleRate: number;
  channels: number;
  bufferSize: number;
}

export interface NetworkState {
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  jitter: number;
  bandwidth: number;
  rtt: number; // round trip time
}

export interface SessionAnalytics {
  sessionId: string;
  startTime: Date;
  duration: number; // milliseconds
  messagesSent: number;
  messagesReceived: number;
  errors: number;
  averageLatency: number;
  peakAudioLevel: number;
}

export type PipelineStep = 'idle' | 'listening' | 'stt_processing' | 'llm_processing' | 'tts_processing' | 'receiving_response' | 'complete' | 'error';

export type PipelineState = {
  currentStep: PipelineStep;
  progress: number; // 0-1
  isActive: boolean;
  isListening: boolean;
  isProcessing: boolean;
  message?: string;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  cycleCount: number;
};

export interface TestResult {
  id: string;
  type: 'config' | 'pipeline' | 'service' | 'end-to-end';
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  error?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  details?: Record<string, any>;
}

export interface DebugInfo {
  logs: Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: any;
  }>;
  errors: Array<{
    timestamp: Date;
    error: string;
    stack?: string;
    context?: any;
  }>;
  warnings: Array<{
    timestamp: Date;
    warning: string;
    context?: any;
  }>;
}

export interface KPIState {
  connectionUptime: number; // percentage
  audioQualityScore: number; // 0-100
  processingLatency: number; // milliseconds
  successRate: number; // percentage
  totalSessions: number;
  averageSessionDuration: number; // milliseconds
  errorRate: number; // percentage
}

export interface UnifiedV2State {
  // Phase Management
  currentPhase: PhaseType;
  phases: Record<PhaseType, PhaseStatus>;
  
  // Connection States
  webRTC: ConnectionState;
  whip: ConnectionState;
  websocket: ConnectionState;
  
  // Service States
  services: Record<ServiceType, ServiceState>;
  
  // Pipeline State
  pipeline: PipelineState;
  
  // Audio State
  audio: AudioState;
  
  // Network State
  network: NetworkState;
  
  // Performance Metrics
  performance: PerformanceMetrics;
  
  // Session Analytics
  sessionAnalytics: SessionAnalytics | null;
  
  // Testing & Debug
  testResults: TestResult[];
  debugInfo: DebugInfo;
  
  // KPIs
  kpis: KPIState;
  
  // UI State
  ui: {
    showConfigTest: boolean;
    showDebugPanel: boolean;
    showAnalytics: boolean;
    theme: 'phase1' | 'phase2' | 'phase5';
    sidebarCollapsed: boolean;
  };
}

// Action Types for State Management
export interface UnifiedV2Actions {
  // Phase Management
  setCurrentPhase: (phase: PhaseType) => void;
  togglePhase: (phase: PhaseType) => void;
  enablePhase: (phase: PhaseType) => void;
  disablePhase: (phase: PhaseType) => void;
  
  // Connection Management
  connectWebRTC: () => Promise<void>;
  disconnectWebRTC: () => void;
  connectWHIP: () => Promise<void>;
  disconnectWHIP: () => void;
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  
  // Service Management
  updateServiceStatus: (service: ServiceType, status: ServiceState) => void;
  resetService: (service: ServiceType) => void;
  
  // Pipeline Management
  startPipeline: () => void;
  stopPipeline: () => void;
  updatePipelineStep: (step: 'listening' | 'stt_processing' | 'llm_processing' | 'tts_processing' | 'receiving_response' | 'complete' | 'error', message?: string) => void;
  updatePipelineProgress: (progress: number) => void;
  resetPipeline: () => void;
  
  // Audio Management
  startAudioStreaming: () => void;
  stopAudioStreaming: () => void;
  startListening: () => void;
  stopListening: () => void;
  updateAudioLevel: (level: number) => void;
  
  // Testing & Debug
  runConfigTest: () => Promise<TestResult>;
  runPipelineTest: () => Promise<TestResult>;
  runServiceTest: (service: ServiceType) => Promise<TestResult>;
  addDebugLog: (level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) => void;
  clearDebugLogs: () => void;
  
  // UI Management
  toggleConfigTest: () => void;
  toggleDebugPanel: () => void;
  toggleAnalytics: () => void;
  setTheme: (theme: 'phase1' | 'phase2' | 'phase5') => void;
  toggleSidebar: () => void;
  
  // Analytics
  updateSessionAnalytics: (analytics: Partial<SessionAnalytics>) => void;
  updateKPIs: (kpis: Partial<KPIState>) => void;
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void;
}

// Combined State and Actions
export interface UnifiedV2Store extends UnifiedV2State, UnifiedV2Actions {}

// Component Props Interfaces
export interface PhaseToggleProps {
  currentPhase: PhaseType;
  phases: Record<PhaseType, PhaseStatus>;
  onPhaseChange: (phase: PhaseType) => void;
}

export interface UnifiedControlPanelProps {
  currentPhase: PhaseType;
  webRTC: ConnectionState;
  whip: ConnectionState;
  websocket: ConnectionState;
  audio: AudioState;
  onConnectWebRTC: () => Promise<void>;
  onDisconnectWebRTC: () => void;
  onConnectWHIP: () => Promise<void>;
  onDisconnectWHIP: () => void;
  onConnectWebSocket: () => Promise<void>;
  onDisconnectWebSocket: () => void;
  onStartAudioStreaming: () => void;
  onStopAudioStreaming: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
}

export interface UnifiedStatusDashboardProps {
  webRTC: ConnectionState;
  whip: ConnectionState;
  websocket: ConnectionState;
  services: Record<ServiceType, ServiceState>;
  pipeline: PipelineState;
  performance: PerformanceMetrics;
}

export interface AudioProcessingPanelProps {
  audio: AudioState;
  onStartStreaming: () => void;
  onStopStreaming: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
}

export interface NetworkQualityPanelProps {
  network: NetworkState;
  performance: PerformanceMetrics;
}

export interface AIPipelinePanelProps {
  pipeline: PipelineState;
  services: Record<ServiceType, ServiceState>;
}

export interface SessionAnalyticsPanelProps {
  sessionAnalytics: SessionAnalytics | null;
  kpis: KPIState;
}

export interface TestingDebugToolsProps {
  testResults: TestResult[];
  debugInfo: DebugInfo;
  onRunConfigTest: () => Promise<TestResult>;
  onRunPipelineTest: () => Promise<TestResult>;
  onRunServiceTest: (service: ServiceType) => Promise<TestResult>;
  onClearDebugLogs: () => void;
}

export interface KPIDashboardProps {
  kpis: KPIState;
  performance: PerformanceMetrics;
  sessionAnalytics: SessionAnalytics | null;
}

// Theme Configuration
export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export const PHASE_THEMES: Record<PhaseType, ThemeConfig> = {
  phase1: {
    primary: '#3B82F6', // Blue
    secondary: '#1D4ED8',
    accent: '#60A5FA',
    background: '#1E293B',
    surface: '#334155',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1'
  },
  phase2: {
    primary: '#10B981', // Green
    secondary: '#059669',
    accent: '#34D399',
    background: '#1E293B',
    surface: '#334155',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1'
  },
  phase5: {
    primary: '#8B5CF6', // Purple
    secondary: '#7C3AED',
    accent: '#A78BFA',
    background: '#1E293B',
    surface: '#334155',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1'
  }
}; 