import { useCallback, useRef, useEffect } from 'react';
import { useVoiceAgentStore } from '../stores/voiceAgentStore';
import { getServiceUrls } from '../config/production';

interface WebRTCConfig {
  whipUrl: string;
  iceServers: RTCIceServer[];
  audioConstraints: MediaTrackConstraints;
}

const DEFAULT_CONFIG: WebRTCConfig = {
  whipUrl: getServiceUrls().whipUrl,
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' }
  ],
  audioConstraints: {
    echoCancellation: false, // Disable to get raw audio
    noiseSuppression: false, // Disable to get raw audio
    autoGainControl: false,  // Disable to get raw audio
    sampleRate: 48000,
    channelCount: 1 // Use mono for better compatibility
  }
};

export const useWebRTC = (config: Partial<WebRTCConfig> = {}) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioWorkletRef = useRef<AudioWorkletNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Store
  const {
    connectionStatus,
    isStreaming,
    sessionId,
    error,
    connect,
    disconnect,
    startStreaming,
    stopStreaming,
    setConnectionStatus,
    setSessionId,
    setError,
    setAudioLevel,
    setMetrics
  } = useVoiceAgentStore();

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Disconnect audio worklet
    if (audioWorkletRef.current) {
      audioWorkletRef.current.disconnect();
      audioWorkletRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, []);

  // Connect to WHIP server
  const connectToServer = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      setError(null);

      // Generate session ID
      const sessionId = `webrtc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(sessionId);

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: mergedConfig.audioConstraints
      });
      localStreamRef.current = stream;
      
      // Setup audio visualization for local microphone
      await setupAudioVisualization(stream);

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: mergedConfig.iceServers
      });
      peerConnectionRef.current = peerConnection;

      // Add local audio track
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle incoming audio
      peerConnection.ontrack = (event) => {
        // Note: For echo test, we don't need to visualize remote audio
        // The local microphone audio is what we want to visualize
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        switch (peerConnection.connectionState) {
          case 'connected':
            setConnectionStatus('connected');
            break;
          case 'disconnected':
          case 'failed':
            setConnectionStatus('error');
            setError('WebRTC connection failed');
            break;
          case 'closed':
            setConnectionStatus('disconnected');
            break;
        }
      };

      // Handle ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === 'failed') {
          setError('ICE connection failed');
        }
      };

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send WHIP request
      const response = await fetch(mergedConfig.whipUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp
      });

      if (!response.ok) {
        throw new Error(`WHIP request failed: ${response.status} ${response.statusText}`);
      }

      const answerSdp = await response.text();

      // Set remote description
      await peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
      });

      // Manually set connection status to connected since WHIP response was successful
      setConnectionStatus('connected');

    } catch (error) {
      console.error('Connection error:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
      setConnectionStatus('error');
      cleanup();
    }
  }, [mergedConfig, setConnectionStatus, setError, cleanup]);

  // Setup audio visualization with AudioWorklet
  const setupAudioVisualization = useCallback(async (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Load and register AudioWorklet
      await audioContext.audioWorklet.addModule('/audio-processor.js');
      
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create AudioWorklet node for processing
      const audioWorklet = new AudioWorkletNode(audioContext, 'audio-processor');
      audioWorkletRef.current = audioWorklet;
      
      // Connect audio chain: source -> worklet -> analyser -> destination
      source.connect(audioWorklet);
      audioWorklet.connect(analyser);
      audioWorklet.connect(audioContext.destination); // For audio playback
      
      // Also connect source directly to analyser for testing
      source.connect(analyser);
      
      // Handle audio level messages from worklet
      audioWorklet.port.onmessage = (event) => {
        if (event.data.type === 'audioLevel') {
          // Convert 0-1 range to 0-100 percentage
          const percentage = Math.round(event.data.level * 100);
          setAudioLevel(percentage);
        }
      };
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioMeter = () => {
        if (!analyserRef.current) return;
        
        // Use time domain data for microphone input (more accurate for voice)
        analyserRef.current.getByteTimeDomainData(dataArray);
        
        // Calculate RMS (Root Mean Square) for better volume representation
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const sample = (dataArray[i] - 128) / 128; // Convert to -1 to 1 range
          sum += sample * sample;
        }
        const rms = Math.sqrt(sum / bufferLength);
        const volume = Math.min(1, rms * 3); // Scale and clamp to 0-1
        const percentage = Math.round(volume * 100); // Convert to percentage
        setAudioLevel(percentage);
        
        animationFrameRef.current = requestAnimationFrame(updateAudioMeter);
      };
      
      updateAudioMeter();
      
    } catch (error) {
      setError('Failed to setup audio visualization');
    }
  }, [setAudioLevel, setError]);

  // Start streaming
  const startAudioStreaming = useCallback(async () => {
    try {
      if (connectionStatus !== 'connected') {
        throw new Error('Must be connected before starting streaming');
      }

      // Update store to indicate streaming has started
      startStreaming();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start streaming');
    }
  }, [connectionStatus, startStreaming, setError]);

  // Stop streaming
  const stopAudioStreaming = useCallback(() => {
    stopStreaming();
  }, [stopStreaming]);

  // Disconnect from server
  const disconnectFromServer = useCallback(() => {
    cleanup();
    disconnect();
  }, [cleanup, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // State
    connectionStatus,
    isStreaming,
    sessionId,
    error,
    
    // Actions
    connect: connectToServer,
    disconnect: disconnectFromServer,
    startStreaming: startAudioStreaming,
    stopStreaming: stopAudioStreaming,
    
    // Utility
    cleanup
  };
}; 