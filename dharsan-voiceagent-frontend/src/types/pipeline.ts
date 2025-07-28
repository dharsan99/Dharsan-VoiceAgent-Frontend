// Pipeline State Types
export type PipelineState = 'idle' | 'listening' | 'processing' | 'complete' | 'error';

export type ServiceState = 'idle' | 'waiting' | 'executing' | 'complete' | 'error';

export type ConversationState = 'stopped' | 'active' | 'paused';

// WebSocket Message Types
export type MessageType = 
  | 'pipeline_state_update'
  | 'service_status'
  | 'conversation_control'
  | 'error'
  | 'info';

// Pipeline State Message
export interface PipelineStateMessage {
  type: MessageType;
  session_id: string;
  state: PipelineState;
  services: Record<string, ServiceState>;
  timestamp: string;
  metadata: Record<string, any>;
}

// Service Status Message
export interface ServiceStatusMessage {
  type: MessageType;
  service: string;
  state: ServiceState;
  progress: number;
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
}

// Conversation Control Message
export interface ConversationControlMessage {
  type: MessageType;
  action: 'start' | 'stop' | 'pause';
  session_id: string;
  timestamp: string;
  metadata: Record<string, any>;
}

// Error Message
export interface ErrorMessage {
  type: MessageType;
  error: string;
  code: string;
  session_id?: string;
  timestamp: string;
}

// Info Message
export interface InfoMessage {
  type: MessageType;
  message: string;
  session_id?: string;
  timestamp: string;
  metadata: Record<string, any>;
}

// Pipeline Flags
export interface PipelineFlags {
  session_id: string;
  conversation_id: string;
  state: PipelineState;
  services: Record<string, ServiceState>;
  timestamps: Record<string, string>;
  metadata: Record<string, any>;
}

// Service Information
export interface ServiceInfo {
  name: string;
  displayName: string;
  icon: string;
  description: string;
  color: string;
}

// Pipeline Context State
export interface PipelineContextState {
  // Current state
  pipelineState: PipelineState;
  serviceStates: Record<string, ServiceState>;
  conversationState: ConversationState;
  
  // Session information
  sessionId: string | null;
  conversationId: string | null;
  
  // Metadata
  metadata: Record<string, any>;
  
  // Timestamps
  timestamps: Record<string, string>;
  
  // Error state
  error: string | null;
  
  // Loading states
  isLoading: boolean;
  
  // Connection state
  isConnected: boolean;
}

// Pipeline Context Actions
export interface PipelineContextActions {
  // State updates
  updatePipelineState: (state: PipelineState) => void;
  updateServiceState: (service: string, state: ServiceState) => void;
  updateConversationState: (state: ConversationState) => void;
  
  // Session management
  setSessionId: (sessionId: string) => void;
  clearSession: () => void;
  
  // Metadata updates
  updateMetadata: (key: string, value: any) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  
  // Connection management
  setConnected: (connected: boolean) => void;
  
  // Conversation controls
  startListening: () => void;
  stopConversation: () => void;
  pauseConversation: () => void;
  
  // WebSocket message handling
  handleWebSocketMessage: (message: any) => void;
}

// Pipeline Context
export interface PipelineContextType {
  state: PipelineContextState;
  actions: PipelineContextActions;
}

// Service Configuration
export const SERVICE_CONFIG: Record<string, ServiceInfo> = {
  stt: {
    name: 'stt',
    displayName: 'Speech-to-Text',
    icon: '🎤',
    description: 'Converting speech to text',
    color: 'blue'
  },
  llm: {
    name: 'llm',
    displayName: 'AI Language Model',
    icon: '🧠',
    description: 'Generating AI response',
    color: 'purple'
  },
  tts: {
    name: 'tts',
    displayName: 'Text-to-Speech',
    icon: '🔊',
    description: 'Converting text to speech',
    color: 'green'
  }
};

// Pipeline State Colors
export const PIPELINE_STATE_COLORS: Record<PipelineState, string> = {
  idle: 'gray',
  listening: 'blue',
  processing: 'yellow',
  complete: 'green',
  error: 'red'
};

// Service State Colors
export const SERVICE_STATE_COLORS: Record<ServiceState, string> = {
  idle: 'gray',
  waiting: 'yellow',
  executing: 'blue',
  complete: 'green',
  error: 'red'
}; 