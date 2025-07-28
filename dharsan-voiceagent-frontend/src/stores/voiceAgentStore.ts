import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types
export interface VoiceAgentState {
  // Connection state
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isStreaming: boolean;
  sessionId: string | null;
  
  // Audio state
  audioLevel: number;
  isRecording: boolean;
  
  // Error handling
  error: string | null;
  
  // Performance metrics
  latency: number;
  packetLoss: number;
  jitter: number;
  
  // Timestamps
  connectedAt: Date | null;
  lastActivity: Date | null;
}

export interface VoiceAgentActions {
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => void;
  startStreaming: () => Promise<void>;
  stopStreaming: () => void;
  
  // State updates
  setConnectionStatus: (status: VoiceAgentState['connectionStatus']) => void;
  setSessionId: (sessionId: string | null) => void;
  setError: (error: string | null) => void;
  setAudioLevel: (level: number) => void;
  setMetrics: (metrics: { latency: number; packetLoss: number; jitter: number }) => void;
  
  // Utility
  reset: () => void;
}

export interface VoiceAgentStore extends VoiceAgentState, VoiceAgentActions {}

// Initial state
const initialState: VoiceAgentState = {
  connectionStatus: 'disconnected',
  isStreaming: false,
  sessionId: null,
  audioLevel: 0,
  isRecording: false,
  error: null,
  latency: 0,
  packetLoss: 0,
  jitter: 0,
  connectedAt: null,
  lastActivity: null,
};

// Create store
export const useVoiceAgentStore = create<VoiceAgentStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Connection management
      connect: async () => {
        try {
          set({ 
            connectionStatus: 'connecting', 
            error: null,
            lastActivity: new Date()
          });

          // Generate session ID
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          set({ sessionId });

          // Simulate connection (will be replaced with actual WebRTC logic)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ 
            connectionStatus: 'connected',
            connectedAt: new Date(),
            lastActivity: new Date()
          });

        } catch (error) {
          set({ 
            connectionStatus: 'error', 
            error: error instanceof Error ? error.message : 'Connection failed',
            lastActivity: new Date()
          });
        }
      },

      disconnect: () => {
        set({
          connectionStatus: 'disconnected',
          isStreaming: false,
          isRecording: false,
          sessionId: null,
          connectedAt: null,
          lastActivity: new Date()
        });
      },

      startStreaming: async () => {
        try {
          const { connectionStatus } = get();
          
          if (connectionStatus !== 'connected') {
            throw new Error('Must be connected before starting streaming');
          }

          set({ 
            isStreaming: true,
            isRecording: true,
            lastActivity: new Date()
          });

          // Simulate streaming start (will be replaced with actual WebRTC logic)
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to start streaming',
            lastActivity: new Date()
          });
        }
      },

      stopStreaming: () => {
        set({
          isStreaming: false,
          isRecording: false,
          lastActivity: new Date()
        });
      },

      // State updates
      setConnectionStatus: (status) => {
        set({ 
          connectionStatus: status,
          lastActivity: new Date()
        });
      },

      setSessionId: (sessionId) => {
        set({ 
          sessionId,
          lastActivity: new Date()
        });
      },

      setError: (error) => {
        set({ 
          error,
          lastActivity: new Date()
        });
      },

      setAudioLevel: (level) => {
        set({ 
          audioLevel: Math.max(0, Math.min(100, level)),
          lastActivity: new Date()
        });
      },

      setMetrics: (metrics) => {
        set({ 
          ...metrics,
          lastActivity: new Date()
        });
      },

      // Utility
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'voice-agent-store',
    }
  )
); 