// Enhanced Metrics Types for V1 Voice Agent

export interface ConversationMetrics {
  processing_time_ms: number;
  response_length: number;
  word_count: number;
  conversation_turn: number;
}

export interface NetworkMetrics {
  averageLatency: number;
  jitter: number;
  packetLoss: number;
  bufferSize: number;
}

export interface SessionMetrics {
  session_id: string;
  total_conversations: number;
  average_processing_time: number;
  total_words: number;
  average_response_length: number;
  network_metrics: Partial<NetworkMetrics>;
  recent_conversations: ConversationExchange[];
}

export interface ConversationExchange {
  user_input: string;
  ai_response: string;
  processing_time_seconds: number;
  timestamp: string;
}

export interface SessionSummary {
  session_id: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  total_exchanges: number;
  total_errors: number;
}

export interface AggregatedMetrics {
  period_hours: number;
  total_sessions: number;
  total_conversations: number;
  average_session_duration: number;
  average_processing_time: number;
  total_words_generated: number;
  error_rate: number;
}

export interface MetricsMessage {
  type: 'metrics';
  data: NetworkMetrics;
}

export interface ProcessingCompleteMessage {
  type: 'processing_complete';
  response: string;
  metrics: ConversationMetrics;
}

export interface MetricsAckMessage {
  type: 'metrics_ack';
  success: boolean;
  session_id: string;
}

export interface PingMessage {
  type: 'ping';
}

export interface PongMessage {
  type: 'pong';
}

export type WebSocketMessage = 
  | MetricsMessage 
  | ProcessingCompleteMessage 
  | MetricsAckMessage 
  | PingMessage 
  | PongMessage;

// Real-time metrics display interface
export interface RealTimeMetrics {
  currentSession: SessionMetrics | null;
  conversationHistory: ConversationExchange[];
  networkStats: NetworkMetrics;
  performanceStats: {
    averageProcessingTime: number;
    totalWords: number;
    conversationCount: number;
  };
} 