import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUnifiedV2Store } from '../stores/unifiedV2Store';
import type { PhaseType, ServiceType, ServiceState } from '../types/unifiedV2';
import { CONFIG } from '../config';

/**
 * Custom hook for unified V2 state management
 * Provides easy access to the store and additional utility functions
 */
export const useUnifiedV2 = () => {
  const store = useUnifiedV2Store();

  // Memoized selectors for better performance
  const currentPhase = useMemo(() => store.currentPhase, [store.currentPhase]);
  const phases = useMemo(() => store.phases, [store.phases]);
  const activePhase = useMemo(() => 
    Object.values(phases).find(phase => phase.active), [phases]
  );

  // Connection states
  const connectionStates = useMemo(() => ({
    webRTC: store.webRTC,
    whip: store.whip,
    websocket: store.websocket
  }), [store.webRTC, store.whip, store.websocket]);

  // Service states
  const serviceStates = useMemo(() => store.services, [store.services]);

  // Pipeline state
  const pipelineState = useMemo(() => store.pipeline, [store.pipeline]);

  // Audio state
  const audioState = useMemo(() => store.audio, [store.audio]);

  // Performance metrics
  const performanceMetrics = useMemo(() => store.performance, [store.performance]);

  // UI state
  const uiState = useMemo(() => store.ui, [store.ui]);

  // Utility functions
  const isPhaseEnabled = useCallback((phase: PhaseType) => {
    return phases[phase]?.enabled ?? false;
  }, [phases]);

  const isPhaseActive = useCallback((phase: PhaseType) => {
    return phases[phase]?.active ?? false;
  }, [phases]);

  const getPhaseFeatures = useCallback((phase: PhaseType) => {
    return phases[phase]?.features ?? {
      webRTC: false,
      whip: false,
      eventDriven: false,
      audioProcessing: false,
      pipelineMonitoring: false,
      testingTools: false
    };
  }, [phases]);

  const isAnyConnectionActive = useCallback(() => {
    return Object.values(connectionStates).some(
      connection => connection.status === 'connected'
    );
  }, [connectionStates]);

  const getActiveConnections = useCallback(() => {
    return Object.entries(connectionStates)
      .filter(([_, connection]) => connection.status === 'connected')
      .map(([type, connection]) => ({ type, ...connection }));
  }, [connectionStates]);

  const isServiceActive = useCallback((service: ServiceType) => {
    return serviceStates[service]?.status === 'executing' || 
           serviceStates[service]?.status === 'waiting';
  }, [serviceStates]);

  const getActiveServices = useCallback(() => {
    return Object.entries(serviceStates)
      .filter(([_, service]) => 
        service.status === 'executing' || service.status === 'waiting'
      )
      .map(([serviceType, service]) => ({ 
        serviceType, 
        ...service 
      }));
  }, [serviceStates]);

  const isPipelineActive = useCallback(() => {
    return pipelineState.isActive;
  }, [pipelineState.isActive]);

  const getPipelineProgress = useCallback(() => {
    return pipelineState.progress;
  }, [pipelineState.progress]);

  const getCurrentPipelineStep = useCallback(() => {
    return pipelineState.currentStep;
  }, [pipelineState.currentStep]);

  const isAudioStreaming = useCallback(() => {
    return audioState.isStreaming;
  }, [audioState.isStreaming]);

  const isListening = useCallback(() => {
    return audioState.isListening;
  }, [audioState.isListening]);

  const getAudioLevel = useCallback(() => {
    return audioState.audioLevel;
  }, [audioState.audioLevel]);

  // Phase-specific utility functions
  const canUseWebRTC = useCallback(() => {
    return getPhaseFeatures(currentPhase).webRTC;
  }, [currentPhase, getPhaseFeatures]);

  const canUseWHIP = useCallback(() => {
    return getPhaseFeatures(currentPhase).whip;
  }, [currentPhase, getPhaseFeatures]);

  const canUseEventDriven = useCallback(() => {
    return getPhaseFeatures(currentPhase).eventDriven;
  }, [currentPhase, getPhaseFeatures]);

  const hasAudioProcessing = useCallback(() => {
    return getPhaseFeatures(currentPhase).audioProcessing;
  }, [currentPhase, getPhaseFeatures]);

  const hasPipelineMonitoring = useCallback(() => {
    return getPhaseFeatures(currentPhase).pipelineMonitoring;
  }, [currentPhase, getPhaseFeatures]);

  const hasTestingTools = useCallback(() => {
    return getPhaseFeatures(currentPhase).testingTools;
  }, [currentPhase, getPhaseFeatures]);

  // Connection management utilities
  const connectToPhase = useCallback(async (phase: PhaseType) => {
    if (!isPhaseEnabled(phase)) {
      throw new Error(`Phase ${phase} is not enabled`);
    }

    store.setCurrentPhase(phase);
    
    // Connect based on phase features
    const features = getPhaseFeatures(phase);
    
    if (features.webRTC) {
      await store.connectWebRTC();
    }
    
    if (features.whip) {
      await store.connectWHIP();
    }
    
    // Always connect WebSocket for communication
    await store.connectWebSocket();
  }, [store, isPhaseEnabled, getPhaseFeatures]);

  const disconnectFromPhase = useCallback(() => {
    console.log('🔌 Disconnecting from phase...', {
      currentPhase,
      connections: {
        webRTC: connectionStates.webRTC.status,
        whip: connectionStates.whip.status,
        websocket: connectionStates.websocket.status
      },
      audio: {
        isStreaming: audioState.isStreaming,
        isListening: audioState.isListening
      }
    });
    
    store.disconnectWebRTC();
    store.disconnectWHIP();
    store.disconnectWebSocket();
  }, [store]); // Remove problematic dependencies that cause re-creation

  // Service management utilities
  const startService = useCallback((service: ServiceType, message?: string) => {
    const serviceState: ServiceState = {
      type: service,
      status: 'waiting',
      progress: 0,
      message,
      startTime: new Date(),
      error: undefined,
      endTime: undefined,
      duration: undefined
    };
    store.updateServiceStatus(service, serviceState);
  }, [store]);

  const updateServiceProgress = useCallback((service: ServiceType, progress: number, message?: string) => {
    const currentService = serviceStates[service];
    if (!currentService) return;

    const serviceState: ServiceState = {
      ...currentService,
      status: 'executing',
      progress: Math.max(0, Math.min(1, progress)),
      message
    };
    store.updateServiceStatus(service, serviceState);
  }, [store, serviceStates]);

  const completeService = useCallback((service: ServiceType, message?: string) => {
    const currentService = serviceStates[service];
    if (!currentService) return;

    const endTime = new Date();
    const duration = currentService.startTime 
      ? endTime.getTime() - currentService.startTime.getTime()
      : undefined;

    const serviceState: ServiceState = {
      ...currentService,
      status: 'complete',
      progress: 1,
      message,
      endTime,
      duration
    };
    store.updateServiceStatus(service, serviceState);
  }, [store, serviceStates]);

  const failService = useCallback((service: ServiceType, error: string) => {
    const currentService = serviceStates[service];
    if (!currentService) return;

    const endTime = new Date();
    const duration = currentService.startTime 
      ? endTime.getTime() - currentService.startTime.getTime()
      : undefined;

    const serviceState: ServiceState = {
      ...currentService,
      status: 'error',
      error,
      endTime,
      duration
    };
    store.updateServiceStatus(service, serviceState);
  }, [store, serviceStates]);

  // Debug utilities
  const logInfo = useCallback((message: string, data?: any) => {
    store.addDebugLog('info', message, data);
  }, [store]);

  const logWarning = useCallback((message: string, data?: any) => {
    store.addDebugLog('warn', message, data);
  }, [store]);

  const logError = useCallback((message: string, data?: any) => {
    store.addDebugLog('error', message, data);
  }, [store]);

  const logDebug = useCallback((message: string, data?: any) => {
    store.addDebugLog('debug', message, data);
  }, [store]);

  // Pipeline management utilities
  const startPipeline = useCallback(() => {
    store.startPipeline();
    logInfo('Pipeline started - beginning listening phase');
  }, [store, logInfo]);

  const updatePipelineStep = useCallback((step: 'listening' | 'stt_processing' | 'llm_processing' | 'tts_processing' | 'receiving_response' | 'complete' | 'error', message?: string) => {
    store.updatePipelineStep(step, message);
    logInfo(`Pipeline step updated: ${step}`, { message });
  }, [store, logInfo]);

  const simulatePipelineFlow = useCallback(async () => {
    if (!isAnyConnectionActive()) {
      logError('Cannot start pipeline - no active connections');
      return;
    }

    try {
      // Start listening
      updatePipelineStep('listening', 'Listening for voice input...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // STT Processing
      updatePipelineStep('stt_processing', 'Converting speech to text...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // LLM Processing
      updatePipelineStep('llm_processing', 'Generating AI response...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TTS Processing
      updatePipelineStep('tts_processing', 'Converting response to speech...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Receiving Response
      updatePipelineStep('receiving_response', 'Receiving and processing response...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Complete cycle
      updatePipelineStep('complete', 'Response cycle completed');
      
      // Auto-restart listening for next cycle
      setTimeout(() => {
        if (pipelineState.isActive) {
          updatePipelineStep('listening', 'Starting next listening cycle...');
        }
      }, 1000);

    } catch (error) {
      updatePipelineStep('error', `Pipeline error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      logError('Pipeline simulation failed', error);
    }
  }, [isAnyConnectionActive, updatePipelineStep, pipelineState.isActive, logError]);

  const stopPipeline = useCallback(() => {
    store.stopPipeline();
    logInfo('Pipeline stopped');
  }, [store, logInfo]);

  const resetPipeline = useCallback(() => {
    store.resetPipeline();
    logInfo('Pipeline reset');
  }, [store, logInfo]);

  // Audio management utilities
  const startAudioProcessing = useCallback(() => {
    if (hasAudioProcessing()) {
      store.startAudioStreaming();
      store.startListening();
    }
  }, [store, hasAudioProcessing]);

  const stopAudioProcessing = useCallback(() => {
    store.stopAudioStreaming();
    store.stopListening();
  }, [store]);

  // Performance monitoring utilities
  const updatePerformanceMetrics = useCallback((metrics: Partial<typeof performanceMetrics>) => {
    store.updatePerformanceMetrics(metrics);
  }, [store, performanceMetrics]);

  // Note: Removed auto-cleanup effect to prevent unwanted disconnections
  // The component should handle its own cleanup when needed

  // Real-time pipeline integration
  const [websocketConnection, setWebsocketConnection] = useState<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [pipelineConnectionStatus, setPipelineConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  // WebSocket connection management
  const connectToBackendPipeline = useCallback(async () => {
    if (websocketConnection) {
      websocketConnection.close();
    }

    setPipelineConnectionStatus('connecting');
    logInfo('Attempting to connect to V2 orchestrator WebSocket...');

    try {
      // Connect to the V2 orchestrator WebSocket
              const ws = new WebSocket(CONFIG.ORCHESTRATOR.WS_URL);
      
      ws.onopen = () => {
        logInfo('✅ WebSocket connected to V2 orchestrator pipeline');
        setWebsocketConnection(ws);
        setPipelineConnectionStatus('connected');
        
        // Generate session ID
        const newSessionId = `frontend_${Date.now()}`;
        setSessionId(newSessionId);
        
        // Send start listening event
        const startListeningMsg = {
          event: 'start_listening',
          session_id: newSessionId,
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(startListeningMsg));
        logInfo('Sent start_listening event to backend', { sessionId: newSessionId });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          logInfo('📨 Received WebSocket message', data);
          handlePipelineMessage(data);
        } catch (error) {
          logError('Failed to parse WebSocket message', error);
        }
      };

      ws.onerror = (error) => {
        logError('❌ WebSocket connection error', error);
        setPipelineConnectionStatus('error');
      };

      ws.onclose = (event) => {
        logInfo('🔌 WebSocket disconnected from V2 orchestrator', { 
          code: event.code, 
          reason: event.reason,
          wasClean: event.wasClean 
        });
        setWebsocketConnection(null);
        setPipelineConnectionStatus('disconnected');
        // Reset pipeline state when connection is lost
        resetPipeline();
      };

    } catch (error) {
      logError('❌ Failed to connect to V2 orchestrator pipeline', error);
      setPipelineConnectionStatus('error');
    }
  }, [logInfo, logError, resetPipeline]);

  const disconnectFromBackendPipeline = useCallback(() => {
    if (websocketConnection) {
      websocketConnection.close();
      setWebsocketConnection(null);
    }
  }, [websocketConnection]);

  // Handle real-time pipeline messages from backend
  const handlePipelineMessage = useCallback((data: any) => {
    logInfo('📨 Received WebSocket message', data);
    
    switch (data.type) {
      case 'pipeline_state_update':
        handlePipelineStateUpdate(data);
        break;
      case 'service_status':
        handleServiceStatusUpdate(data);
        break;
      case 'llm_response_text':
        handleLLMResponse(data);
        break;
      case 'tts_audio_chunk':
        handleTTSAudio(data);
        break;
      case 'error':
        handlePipelineError(data);
        break;
      case 'info':
        handlePipelineInfo(data);
        break;
      case 'conversation_control':
        handleConversationControl(data);
        break;
      default:
        logInfo('Unknown message type', data);
    }
  }, [logInfo, logDebug]);

  const handlePipelineStateUpdate = useCallback((data: any) => {
    logInfo('🔄 Pipeline state update', data);
    
    // Map backend states to frontend pipeline steps
    switch (data.state) {
      case 'listening':
        updatePipelineStep('listening', data.message || 'Listening for audio input');
        break;
      case 'processing':
        updatePipelineStep('llm_processing', data.message || 'Processing with LLM');
        break;
      case 'complete':
        updatePipelineStep('complete', data.message || 'Pipeline completed');
        break;
      case 'error':
        updatePipelineStep('error', data.message || 'Pipeline error occurred');
        break;
      default:
        logInfo('Unknown pipeline state', data.state);
    }
    
    // Update service statuses if provided
    if (data.services) {
      store.updateServiceStatus('stt', data.services.stt);
      store.updateServiceStatus('llm', data.services.llm);
      store.updateServiceStatus('tts', data.services.tts);
    }
  }, [updatePipelineStep, store, logInfo]);

  const handleServiceStatusUpdate = useCallback((data: any) => {
    logInfo('🔧 Service status update', data);
    
    const { service, state, progress, message } = data;
    
    // Update service status
    store.updateServiceStatus(service, state);
    
    // Update pipeline progress based on service state
    if (service === 'llm') {
      if (state === 'waiting') {
        updatePipelineStep('llm_processing', 'Waiting for LLM response...');
        store.updatePipelineProgress(0.3);
      } else if (state === 'executing') {
        updatePipelineStep('llm_processing', 'Generating AI response...');
        store.updatePipelineProgress(0.3 + (progress * 0.2)); // 30% to 50%
      }
    } else if (service === 'stt') {
      if (state === 'processing') {
        updatePipelineStep('stt_processing', 'Processing speech...');
        store.updatePipelineProgress(0.1 + (progress * 0.2)); // 10% to 30%
      }
    } else if (service === 'tts') {
      if (state === 'processing') {
        updatePipelineStep('tts_processing', 'Generating speech...');
        store.updatePipelineProgress(0.7 + (progress * 0.2)); // 70% to 90%
      }
    }
    
    // Log the status update
    logInfo(`Service ${service} status: ${state} (${Math.round(progress * 100)}%)`, { message });
  }, [store, updatePipelineStep, logInfo]);

  const handleLLMResponse = useCallback((data: any) => {
    logInfo('🤖 LLM response received', data);
    
    // Update pipeline to receiving response state
    updatePipelineStep('receiving_response', 'Receiving AI response...');
    store.updatePipelineProgress(0.9);
    
    // Store the LLM response
    if (data.response_text) {
      store.addDebugLog('info', `LLM Response: ${data.response_text}`);
    }
  }, [updatePipelineStep, store, logInfo]);

  const handleTTSAudio = useCallback((data: any) => {
    logInfo('🔊 TTS audio chunk received', data);
    
    // Update pipeline to receiving response state
    updatePipelineStep('receiving_response', 'Receiving audio response...');
    store.updatePipelineProgress(0.95);
    
    // Store the TTS audio info
    if (data.audio_data) {
      store.addDebugLog('info', `TTS Audio: ${data.audio_data.length} bytes`);
    }
  }, [updatePipelineStep, store, logInfo]);

  const handlePipelineError = useCallback((data: any) => {
    logError('❌ Pipeline error', data);
    
    updatePipelineStep('error', data.message || 'Pipeline error occurred');
    store.updatePipelineProgress(0);
    
    // Store the error
    store.addDebugLog('error', `Pipeline Error: ${data.message || 'Unknown error'}`);
  }, [updatePipelineStep, store, logError]);

  const handlePipelineInfo = useCallback((data: any) => {
    logInfo('ℹ️ Pipeline info', data);
    
    // Store the info message
    if (data.message) {
      store.addDebugLog('info', data.message);
    }
  }, [store, logInfo]);

  const handleConversationControl = useCallback((data: any) => {
    logInfo('🎮 Conversation control', data);
    
    if (data.event === 'listening_started') {
      updatePipelineStep('listening', 'Listening for audio input');
      store.updatePipelineProgress(0.1);
    } else if (data.event === 'listening_stopped') {
      updatePipelineStep('complete', 'Listening stopped');
      store.updatePipelineProgress(0);
    }
    
    // Store the control event
    store.addDebugLog('info', `Control Event: ${data.event}`);
  }, [updatePipelineStep, store, logInfo]);

  // Send trigger LLM event to backend
  const triggerLLMProcessing = useCallback((transcript: string) => {
    if (websocketConnection && websocketConnection.readyState === WebSocket.OPEN) {
      const triggerMsg = {
        event: 'trigger_llm',
        final_transcript: transcript,
        session_id: sessionId,
        timestamp: new Date().toISOString()
      };
      websocketConnection.send(JSON.stringify(triggerMsg));
      logInfo('Sent trigger LLM event', { transcript });
    } else {
      logError('WebSocket not connected for LLM trigger');
    }
  }, [websocketConnection, sessionId, logInfo, logError]);

  return {
    // State
    currentPhase,
    phases,
    activePhase,
    connectionStates,
    serviceStates,
    pipelineState,
    audioState,
    performanceMetrics,
    uiState,
    
    // Utility functions
    isPhaseEnabled,
    isPhaseActive,
    getPhaseFeatures,
    isAnyConnectionActive,
    getActiveConnections,
    isServiceActive,
    getActiveServices,
    isPipelineActive,
    getPipelineProgress,
    getCurrentPipelineStep,
    isAudioStreaming,
    isListening,
    getAudioLevel,
    
    // Phase-specific utilities
    canUseWebRTC,
    canUseWHIP,
    canUseEventDriven,
    hasAudioProcessing,
    hasPipelineMonitoring,
    hasTestingTools,
    
    // Connection management
    connectToPhase,
    disconnectFromPhase,
    
    // Service management
    startService,
    updateServiceProgress,
    completeService,
    failService,
    
    // Pipeline management
    startPipeline,
    updatePipelineStep,
    simulatePipelineFlow,
    stopPipeline,
    resetPipeline,
    
    // Audio management
    startAudioProcessing,
    stopAudioProcessing,
    
    // Debug utilities
    logInfo,
    logWarning,
    logError,
    logDebug,
    
    // Store actions (direct access, excluding duplicates)
    setCurrentPhase: store.setCurrentPhase,
    togglePhase: store.togglePhase,
    enablePhase: store.enablePhase,
    disablePhase: store.disablePhase,
    connectWebRTC: store.connectWebRTC,
    disconnectWebRTC: store.disconnectWebRTC,
    connectWHIP: store.connectWHIP,
    disconnectWHIP: store.disconnectWHIP,
    connectWebSocket: store.connectWebSocket,
    disconnectWebSocket: store.disconnectWebSocket,
    updateServiceStatus: store.updateServiceStatus,
    resetService: store.resetService,
    updatePipelineProgress: store.updatePipelineProgress,
    startAudioStreaming: store.startAudioStreaming,
    stopAudioStreaming: store.stopAudioStreaming,
    startListening: store.startListening,
    stopListening: store.stopListening,
    updateAudioLevel: store.updateAudioLevel,
    runConfigTest: store.runConfigTest,
    runPipelineTest: store.runPipelineTest,
    runServiceTest: store.runServiceTest,
    addDebugLog: store.addDebugLog,
    clearDebugLogs: store.clearDebugLogs,
    toggleConfigTest: store.toggleConfigTest,
    toggleDebugPanel: store.toggleDebugPanel,
    toggleAnalytics: store.toggleAnalytics,
    setTheme: store.setTheme,
    toggleSidebar: store.toggleSidebar,
    updateSessionAnalytics: store.updateSessionAnalytics,
    updateKPIs: store.updateKPIs,
    updatePerformanceMetrics: store.updatePerformanceMetrics,

    // Real-time pipeline integration
    connectToBackendPipeline,
    disconnectFromBackendPipeline,
    triggerLLMProcessing,
    websocketConnection,
    sessionId,
    pipelineConnectionStatus
  };
}; 