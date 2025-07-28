import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type {
  PipelineContextType,
  PipelineContextState,
  PipelineContextActions,
  PipelineState,
  ServiceState,
  ConversationState,
  MessageType,
  PipelineStateMessage,
  ServiceStatusMessage,
  ConversationControlMessage,
  ErrorMessage,
  InfoMessage
} from '../types/pipeline';

// Initial state
const initialState: PipelineContextState = {
  pipelineState: 'idle',
  serviceStates: {
    stt: 'idle',
    llm: 'idle',
    tts: 'idle'
  },
  conversationState: 'stopped',
  sessionId: null,
  conversationId: null,
  metadata: {},
  timestamps: {},
  error: null,
  isLoading: false,
  isConnected: false
};

// Action types
type PipelineAction =
  | { type: 'SET_PIPELINE_STATE'; payload: PipelineState }
  | { type: 'SET_SERVICE_STATE'; payload: { service: string; state: ServiceState } }
  | { type: 'SET_CONVERSATION_STATE'; payload: ConversationState }
  | { type: 'SET_SESSION_ID'; payload: string | null }
  | { type: 'SET_CONVERSATION_ID'; payload: string | null }
  | { type: 'UPDATE_METADATA'; payload: { key: string; value: any } }
  | { type: 'SET_TIMESTAMPS'; payload: Record<string, string> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_FROM_MESSAGE'; payload: PipelineStateMessage }
  | { type: 'RESET_STATE' };

// Reducer
function pipelineReducer(state: PipelineContextState, action: PipelineAction): PipelineContextState {
  switch (action.type) {
    case 'SET_PIPELINE_STATE':
      return { ...state, pipelineState: action.payload };
    
    case 'SET_SERVICE_STATE':
      return {
        ...state,
        serviceStates: {
          ...state.serviceStates,
          [action.payload.service]: action.payload.state
        }
      };
    
    case 'SET_CONVERSATION_STATE':
      return { ...state, conversationState: action.payload };
    
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    
    case 'SET_CONVERSATION_ID':
      return { ...state, conversationId: action.payload };
    
    case 'UPDATE_METADATA':
      return {
        ...state,
        metadata: {
          ...state.metadata,
          [action.payload.key]: action.payload.value
        }
      };
    
    case 'SET_TIMESTAMPS':
      return { ...state, timestamps: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    case 'UPDATE_FROM_MESSAGE':
      return {
        ...state,
        pipelineState: action.payload.state,
        serviceStates: action.payload.services,
        metadata: action.payload.metadata,
        timestamps: {
          ...state.timestamps,
          [`pipeline_${action.payload.state}`]: action.payload.timestamp
        }
      };
    
    case 'RESET_STATE':
      return {
        ...initialState,
        sessionId: state.sessionId,
        conversationId: state.conversationId
      };
    
    default:
      return state;
  }
}

// Create context
const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

// Provider component
export const PipelineStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(pipelineReducer, initialState);

  // WebSocket connection
  const [ws, setWs] = React.useState<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // Use the orchestrator WebSocket endpoint
        const wsUrl = 'ws://localhost:8001/ws'; // For development
        // const wsUrl = 'wss://your-production-domain.com/ws'; // For production
        
        const websocket = new WebSocket(wsUrl);
        
        websocket.onopen = () => {
          console.log('🔌 WebSocket connected to pipeline state manager');
          dispatch({ type: 'SET_CONNECTED', payload: true });
          
          // Send session info if we have a session ID
          if (state.sessionId) {
            websocket.send(JSON.stringify({
              type: 'session_info',
              session_id: state.sessionId
            }));
          }
        };
        
        websocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        websocket.onclose = () => {
          console.log('🔌 WebSocket disconnected from pipeline state manager');
          dispatch({ type: 'SET_CONNECTED', payload: false });
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
        
        websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          dispatch({ type: 'SET_CONNECTED', payload: false });
        };
        
        setWs(websocket);
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        dispatch({ type: 'SET_CONNECTED', payload: false });
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [state.sessionId]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: any) => {
    const messageType = message.type as MessageType;
    
    switch (messageType) {
      case 'pipeline_state_update':
        dispatch({ type: 'UPDATE_FROM_MESSAGE', payload: message as PipelineStateMessage });
        break;
        
      case 'service_status':
        const serviceMsg = message as ServiceStatusMessage;
        dispatch({
          type: 'SET_SERVICE_STATE',
          payload: { service: serviceMsg.service, state: serviceMsg.state }
        });
        break;
        
      case 'conversation_control':
        const controlMsg = message as ConversationControlMessage;
        if (controlMsg.action === 'stop') {
          dispatch({ type: 'SET_CONVERSATION_STATE', payload: 'stopped' });
        } else if (controlMsg.action === 'pause') {
          dispatch({ type: 'SET_CONVERSATION_STATE', payload: 'paused' });
        }
        break;
        
      case 'error':
        const errorMsg = message as ErrorMessage;
        dispatch({ type: 'SET_ERROR', payload: errorMsg.error });
        break;
        
      case 'info':
        const infoMsg = message as InfoMessage;
        console.log('Pipeline info:', infoMsg.message);
        break;
        
      default:
        console.log('Unknown message type:', messageType);
    }
  }, []);

  // Actions
  const actions: PipelineContextActions = {
    updatePipelineState: useCallback((state: PipelineState) => {
      dispatch({ type: 'SET_PIPELINE_STATE', payload: state });
    }, []),
    
    updateServiceState: useCallback((service: string, state: ServiceState) => {
      dispatch({ type: 'SET_SERVICE_STATE', payload: { service, state } });
    }, []),
    
    updateConversationState: useCallback((state: ConversationState) => {
      dispatch({ type: 'SET_CONVERSATION_STATE', payload: state });
    }, []),
    
    setSessionId: useCallback((sessionId: string) => {
      dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
      
      // Send session info to WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'session_info',
          session_id: sessionId
        }));
      }
    }, [ws]),
    
    clearSession: useCallback(() => {
      dispatch({ type: 'SET_SESSION_ID', payload: null });
      dispatch({ type: 'SET_CONVERSATION_ID', payload: null });
    }, []),
    
    updateMetadata: useCallback((key: string, value: any) => {
      dispatch({ type: 'UPDATE_METADATA', payload: { key, value } });
    }, []),
    
    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),
    
    clearError: useCallback(() => {
      dispatch({ type: 'SET_ERROR', payload: null });
    }, []),
    
    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),
    
    setConnected: useCallback((connected: boolean) => {
      dispatch({ type: 'SET_CONNECTED', payload: connected });
    }, []),
    
    startListening: useCallback(() => {
      if (ws && ws.readyState === WebSocket.OPEN && state.sessionId) {
        ws.send(JSON.stringify({
          type: 'conversation_control',
          action: 'start',
          session_id: state.sessionId
        }));
        dispatch({ type: 'SET_CONVERSATION_STATE', payload: 'active' });
      }
    }, [ws, state.sessionId]),
    
    stopConversation: useCallback(() => {
      if (ws && ws.readyState === WebSocket.OPEN && state.sessionId) {
        ws.send(JSON.stringify({
          type: 'conversation_control',
          action: 'stop',
          session_id: state.sessionId
        }));
        dispatch({ type: 'SET_CONVERSATION_STATE', payload: 'stopped' });
      }
    }, [ws, state.sessionId]),
    
    pauseConversation: useCallback(() => {
      if (ws && ws.readyState === WebSocket.OPEN && state.sessionId) {
        ws.send(JSON.stringify({
          type: 'conversation_control',
          action: 'pause',
          session_id: state.sessionId
        }));
        dispatch({ type: 'SET_CONVERSATION_STATE', payload: 'paused' });
      }
    }, [ws, state.sessionId]),
    
    handleWebSocketMessage
  };

  const contextValue: PipelineContextType = {
    state,
    actions
  };

  return (
    <PipelineContext.Provider value={contextValue}>
      {children}
    </PipelineContext.Provider>
  );
};

// Custom hook to use the pipeline context
export const usePipelineState = (): PipelineContextType => {
  const context = useContext(PipelineContext);
  if (context === undefined) {
    throw new Error('usePipelineState must be used within a PipelineStateProvider');
  }
  return context;
}; 