import { useState, useEffect, useCallback } from 'react';
import { establishBackendConnection, getEnvironmentUrl, updateUrlWithProduction } from '../utils/connectionUtils';
import { fetchPipelineStatus, fetchServiceMetrics, type PhaseTimings } from '../utils/metricsUtils';
import { ConversationLogger } from '../utils/loggerUtils';
import { getServiceUrls } from '../config/production';

export const useConnectionManager = (isProduction: boolean, useEventDriven: boolean = true) => {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [pipelineStatus, setPipelineStatus] = useState<string>('idle');
  const [phaseTimings, setPhaseTimings] = useState<PhaseTimings>({});
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAudioData, setHasAudioData] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [logger] = useState(() => new ConversationLogger());

  const establishConnection = useCallback(async () => {
    setConnectionStatus('connecting');
    logger.addLog('Attempting to connect to backend services...');
    
    try {
      const result = await establishBackendConnection(isProduction);
      setConnectionStatus(result.status);
      setPipelineStatus(result.pipelineStatus);
      
      if (result.status === 'connected') {
        logger.addLog('Connection established successfully');
        logger.addLog('Starting real-time metrics monitoring...');
        
        // Start fetching metrics immediately
        await updateMetrics();
      } else {
        logger.addLog(`Failed to connect: ${result.error}`);
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      logger.addLog('Failed to connect: Network error');
    }
  }, [logger]);

  const updateMetrics = useCallback(async () => {
    try {
      // Fetch pipeline status
      const pipelineResult = await fetchPipelineStatus(isProduction);
      setPipelineStatus(pipelineResult.pipelineStatus);
      setPhaseTimings(pipelineResult.phaseTimings);
      
      if (pipelineResult.activeSessions) {
        logger.addLog(`Pipeline: ${pipelineResult.activeSessions} active session(s)`);
      }
    } catch (error) {
      logger.addErrorLog('orchestrator', 'Orchestrator: Connection failed');
    }

    try {
      // Fetch service metrics (gracefully handle CORS issues)
      const serviceMetrics = await fetchServiceMetrics(isProduction);
      
      if (serviceMetrics.stt) {
        setPhaseTimings(prev => ({ ...prev, stt: serviceMetrics.stt! }));
        logger.addLog(`STT: Average latency ${serviceMetrics.stt.toFixed(0)}ms`);
      }
      if (serviceMetrics.tts) {
        setPhaseTimings(prev => ({ ...prev, tts: serviceMetrics.tts! }));
        logger.addLog(`TTS: Average latency ${serviceMetrics.tts.toFixed(0)}ms`);
      }
      if (serviceMetrics.llm) {
        setPhaseTimings(prev => ({ ...prev, llm: serviceMetrics.llm! }));
        logger.addLog(`LLM: Average latency ${serviceMetrics.llm.toFixed(0)}ms`);
      }
    } catch (error) {
      // Log any errors with service metrics
      logger.addErrorLog('general', 'Error: Unable to fetch service metrics');
    }
  }, [logger]);

  // Poll for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectionStatus === 'connected' || pipelineStatus === 'active') {
        updateMetrics();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [connectionStatus, pipelineStatus, updateMetrics]);

  const clearLogs = useCallback(() => {
    logger.clearLogs();
    setPhaseTimings({});
  }, [logger]);

  const getEnvironmentUrlCallback = useCallback(() => {
    return getEnvironmentUrl(isProduction, useEventDriven);
  }, [isProduction, useEventDriven]);

  const toggleProduction = useCallback(() => {
    const newProductionState = !isProduction;
    updateUrlWithProduction(newProductionState);
    logger.addLog(`Environment switched to: ${newProductionState ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    logger.addLog(`Connection URL: ${getEnvironmentUrl(newProductionState)}`);
  }, [isProduction, logger]);

  const startListening = useCallback(async () => {
    if (connectionStatus === 'connected') {
      try {
        logger.addLog('Requesting microphone access...');
        
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        logger.addLog('Microphone access granted');
        setIsListening(true);
        setIsProcessing(false);
        setHasAudioData(false);
        setAudioChunks([]);
        
        // Create MediaRecorder
        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        setMediaRecorder(recorder);
        
        // Set up audio level monitoring
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateAudioLevel = () => {
          if (isListening) {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average / 255); // Normalize to 0-1
            requestAnimationFrame(updateAudioLevel);
          }
        };
        
        updateAudioLevel();
        
        // Handle recording data
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioChunks(prev => [...prev, event.data]);
          }
        };
        
        // Start recording
        recorder.start(100); // Record in 100ms chunks
        logger.addLog('Started recording audio...');
        
        // Auto-stop after 5 seconds
        setTimeout(() => {
          if (isListening && recorder.state === 'recording') {
            stopListening();
          }
        }, 5000);
        
      } catch (error) {
        logger.addLog(`Microphone access denied: ${error}`);
        console.error('Microphone access error:', error);
      }
    }
  }, [connectionStatus, logger, isListening]);

  const stopListening = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      logger.addLog('Stopped recording audio');
    }
    
    // Stop all tracks in the stream
    if (mediaRecorder) {
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsListening(false);
    setAudioLevel(0);
    
    // Check if we have audio data
    if (audioChunks.length > 0) {
      setHasAudioData(true);
      logger.addLog(`Audio data collected (${audioChunks.length} chunks), ready for processing`);
    } else {
      setHasAudioData(false);
      logger.addLog('No audio data collected');
    }
  }, [logger, mediaRecorder, audioChunks.length]);

  const triggerLLM = useCallback(async () => {
    if (connectionStatus === 'connected' && hasAudioData && audioChunks.length > 0) {
      setIsProcessing(true);
      setIsListening(false);
      logger.addLog('Triggering LLM processing...');
      logger.addLog(`Processing ${audioChunks.length} audio chunks...`);
      
      try {
        // Create audio blob from chunks
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        logger.addLog(`Audio blob created: ${audioBlob.size} bytes`);
        
        // Convert audio blob to base64 for WebSocket transmission
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        // Send audio data to orchestrator via WebSocket
        const { orchestratorWsUrl } = getServiceUrls();
        const wsUrl = orchestratorWsUrl;
        
        logger.addLog(`Connecting to orchestrator: ${wsUrl}`);
        
        const websocket = new WebSocket(wsUrl);
        
        websocket.onopen = () => {
          logger.addLog('WebSocket connected, sending audio data...');
          
          // Send audio data to trigger LLM processing
          const message = {
            event: 'trigger_llm',
            session_id: `session_${Date.now()}`,
            audio_data: base64Audio,
            timestamp: new Date().toISOString()
          };
          
          websocket.send(JSON.stringify(message));
          logger.addLog('Audio data sent to backend for processing');
        };
        
        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            logger.addLog(`Received response: ${data.event || data.type || 'unknown'}`);
            
            if (data.event === 'processing_complete' || data.type === 'processing_complete') {
              logger.addLog('AI processing completed successfully');
              setIsProcessing(false);
              setHasAudioData(false);
              setAudioChunks([]);
              websocket.close();
            } else if (data.event === 'error' || data.type === 'error') {
              logger.addLog(`Processing error: ${data.text || data.message}`);
              setIsProcessing(false);
              websocket.close();
            }
          } catch (error) {
            logger.addLog(`Error parsing response: ${error instanceof Error ? error.message : String(error)}`);
          }
        };
        
        websocket.onerror = (error) => {
          logger.addLog(`WebSocket error: ${error instanceof Error ? error.message : String(error)}`);
          setIsProcessing(false);
        };
        
        websocket.onclose = () => {
          logger.addLog('WebSocket connection closed');
        };
        
        // Set a timeout for processing
        setTimeout(() => {
          if (isProcessing) {
            logger.addLog('Processing timeout, resetting state');
            setIsProcessing(false);
            setHasAudioData(false);
            setAudioChunks([]);
            websocket.close();
          }
        }, 30000); // 30 second timeout
        
      } catch (error) {
        logger.addLog(`Error sending audio data: ${error instanceof Error ? error.message : String(error)}`);
        setIsProcessing(false);
      }
    } else {
      logger.addLog('No audio data available for processing');
    }
  }, [connectionStatus, hasAudioData, audioChunks, logger, isProduction, useEventDriven, isProcessing]);

  return {
    connectionStatus,
    pipelineStatus,
    phaseTimings,
    isListening,
    isProcessing,
    hasAudioData,
    audioLevel,
    logs: logger.getLogs(),
    logCount: logger.getLogCount(),
    establishConnection,
    updateMetrics,
    clearLogs,
    toggleProduction,
    startListening,
    stopListening,
    triggerLLM,
    getEnvironmentUrl: getEnvironmentUrlCallback
  };
}; 