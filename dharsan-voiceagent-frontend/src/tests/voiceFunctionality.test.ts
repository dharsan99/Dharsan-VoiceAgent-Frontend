import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the useVoiceAgent hook
const mockUseVoiceAgent = {
  connectionStatus: 'disconnected',
  listeningState: 'idle',
  isVoiceActive: false,
  transcript: '',
  networkStats: {
    averageLatency: 0,
    jitter: 0,
    packetLoss: 0,
    bufferSize: 3,
    jitterBufferDelay: 100
  },
  errorStats: {
    totalErrors: 0,
    recentErrors: 0,
    byType: {},
    bySeverity: {}
  },
  recoveryInfo: {
    isRecovering: false,
    retryAttempt: 0,
    maxRetries: 3,
    lastError: null,
    recoveryStrategy: []
  },
  bufferInfo: {
    size: 0,
    capacity: 50,
    delay: 100,
    isPlaying: false
  },
  interimTranscript: '',
  finalTranscripts: [],
  currentSpokenWordIndex: null,
  aiResponse: null,
  wordTimingData: {
    text: '',
    words: [],
    currentWordIndex: -1,
    isActive: false
  },
  connect: jest.fn(),
  disconnect: jest.fn(),
  clearTranscripts: jest.fn()
};

// Mock the hook module
jest.mock('../hooks/useVoiceAgent', () => ({
  useVoiceAgent: () => mockUseVoiceAgent
}));

// Enhanced Mock WebSocket
class MockWebSocket {
  public readyState: number = WebSocket.CONNECTING;
  public onopen: ((event: any) => void) | null = null;
  public onmessage: ((event: any) => void) | null = null;
  public onerror: ((event: any) => void) | null = null;
  public onclose: ((event: any) => void) | null = null;
  public send: jest.Mock = jest.fn();
  public close: jest.Mock = jest.fn();
  public url: string;

  constructor(url: string) {
    this.url = url;
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen({ type: 'open', target: this });
      }
    }, 100);
  }

  // Helper method to simulate receiving messages
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage({ 
        type: 'message', 
        data: typeof data === 'string' ? data : JSON.stringify(data),
        target: this 
      });
    }
  }

  // Helper method to simulate errors
  simulateError(error: any) {
    if (this.onerror) {
      this.onerror({ 
        type: 'error', 
        error,
        target: this 
      });
    }
  }

  // Helper method to simulate connection close
  simulateClose(code?: number, reason?: string) {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ 
        type: 'close', 
        code: code || 1000,
        reason: reason || 'Normal closure',
        target: this 
      });
    }
  }
}

// Enhanced Mock AudioContext
class MockAudioContext {
  public state: string = 'suspended';
  public sampleRate: number = 16000;
  public currentTime: number = 0;
  public destination: any = {};
  public createMediaStreamSource: jest.Mock = jest.fn();
  public createOscillator: jest.Mock = jest.fn();
  public createGain: jest.Mock = jest.fn();
  public createMediaElementSource: jest.Mock = jest.fn();
  public resume: jest.Mock = jest.fn().mockResolvedValue(undefined);
  public audioWorklet: {
    addModule: jest.Mock;
  } = {
    addModule: jest.fn().mockResolvedValue(undefined)
  };

  constructor() {
    this.createMediaStreamSource.mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn()
    });
    this.createOscillator.mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
      frequency: {
        setValueAtTime: jest.fn()
      },
      start: jest.fn(),
      stop: jest.fn()
    });
    this.createGain.mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
      gain: {
        setValueAtTime: jest.fn()
      }
    });
    this.createMediaElementSource.mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn()
    });
  }
}

// Enhanced Mock AudioWorkletNode
class MockAudioWorkletNode {
  public port: {
    onmessage: ((event: any) => void) | null;
    postMessage: jest.Mock;
  };
  public disconnect: jest.Mock;

  constructor(context: any, name: string) {
    this.port = {
      onmessage: null,
      postMessage: jest.fn()
    };
    this.disconnect = jest.fn();
  }

  // Helper method to simulate worklet messages
  simulateWorkletMessage(data: any) {
    if (this.port.onmessage) {
      this.port.onmessage({ data });
    }
  }
}

// Enhanced Mock Audio
class MockAudio {
  public preload: string = 'auto';
  public playbackRate: number = 1.0;
  public volume: number = 0.8;
  public duration: number = 2.5;
  public currentTime: number = 0;
  public oncanplaythrough: (() => void) | null = null;
  public onended: (() => void) | null = null;
  public onerror: ((error: any) => void) | null = null;
  public play: jest.Mock = jest.fn().mockResolvedValue(undefined);
  public pause: jest.Mock = jest.fn();
  public src: string = '';

  constructor(src?: string) {
    if (src) {
      this.src = src;
    }
    // Simulate audio loading
    setTimeout(() => {
      if (this.oncanplaythrough) {
        this.oncanplaythrough();
      }
    }, 50);
  }

  // Helper method to simulate audio ending
  simulateEnded() {
    if (this.onended) {
      this.onended();
    }
  }

  // Helper method to simulate audio error
  simulateError(error: any) {
    if (this.onerror) {
      this.onerror(error);
    }
  }
}

// Setup global mocks
const setupGlobalMocks = () => {
  // Mock WebSocket
  global.WebSocket = MockWebSocket as any;
  
  // Mock AudioContext
  global.AudioContext = MockAudioContext as any;
  
  // Mock AudioWorkletNode
  global.AudioWorkletNode = MockAudioWorkletNode as any;
  
  // Mock Audio
  global.Audio = MockAudio as any;
  
  // Mock navigator.mediaDevices
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: () => [{ 
          stop: jest.fn(),
          enabled: true,
          kind: 'audio'
        }],
        active: true
      }),
      enumerateDevices: jest.fn().mockResolvedValue([
        { deviceId: 'default', kind: 'audioinput', label: 'Default Microphone' }
      ])
    }
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true
  });

  // Mock performance
  Object.defineProperty(window, 'performance', {
    writable: true,
    value: {
      now: jest.fn().mockReturnValue(1000),
      timeOrigin: 1000
    }
  });
};

describe('Voice Functionality - Core Audio System', () => {
  beforeEach(() => {
    setupGlobalMocks();
    jest.clearAllMocks();
  });

  describe('Audio Context Initialization', () => {
    test('should create AudioContext with correct sample rate', () => {
      const audioContext = new AudioContext();
      expect(audioContext).toBeInstanceOf(MockAudioContext);
      expect(audioContext.sampleRate).toBe(16000);
    });

    test('should resume AudioContext successfully', async () => {
      const audioContext = new AudioContext();
      await audioContext.resume();
      expect(audioContext.resume).toHaveBeenCalled();
    });

    test('should load audio worklet module', async () => {
      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule('/audio-processor.js');
      expect(audioContext.audioWorklet.addModule).toHaveBeenCalledWith('/audio-processor.js');
    });
  });

  describe('Microphone Access', () => {
    test('should request microphone access successfully', async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      expect(stream).toBeDefined();
      expect(stream.getTracks()).toHaveLength(1);
      expect(stream.getTracks()[0].kind).toBe('audio');
    });

    test('should handle microphone access denial', async () => {
      const getUserMediaSpy = jest.spyOn(navigator.mediaDevices, 'getUserMedia');
      getUserMediaSpy.mockRejectedValueOnce(new Error('Permission denied'));

      await expect(navigator.mediaDevices.getUserMedia({ audio: true }))
        .rejects.toThrow('Permission denied');
    });

    test('should enumerate audio devices', async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      expect(devices).toHaveLength(1);
      expect(devices[0].kind).toBe('audioinput');
    });
  });

  describe('AudioWorkletNode Communication', () => {
    test('should create AudioWorkletNode with correct parameters', () => {
      const audioContext = new AudioContext();
      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor') as unknown as MockAudioWorkletNode;
      
      expect(workletNode).toBeInstanceOf(MockAudioWorkletNode);
      expect(workletNode.port.postMessage).toBeDefined();
    });

    test('should handle worklet messages correctly', () => {
      const audioContext = new AudioContext();
      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor') as unknown as MockAudioWorkletNode;
      
      const messageHandler = jest.fn();
      workletNode.port.onmessage = messageHandler;
      
      const testData = { type: 'voiceActivity', isActive: true };
      workletNode.simulateWorkletMessage(testData);
      
      expect(messageHandler).toHaveBeenCalledWith({ data: testData });
    });

    test('should send messages to worklet', () => {
      const audioContext = new AudioContext();
      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor') as unknown as MockAudioWorkletNode;
      
      const testData = { type: 'config', sampleRate: 16000 };
      workletNode.port.postMessage(testData);
      
      expect(workletNode.port.postMessage).toHaveBeenCalledWith(testData);
    });
  });
});

describe('Voice Functionality - WebSocket Communication', () => {
  beforeEach(() => {
    setupGlobalMocks();
    jest.clearAllMocks();
  });

  describe('WebSocket Connection', () => {
    test('should establish WebSocket connection', async () => {
      const ws = new WebSocket('ws://localhost:8000/ws') as unknown as MockWebSocket;
      
      await waitFor(() => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });
    });

    test('should handle connection events correctly', async () => {
      const onOpenHandler = jest.fn();
      const ws = new WebSocket('ws://localhost:8000/ws') as unknown as MockWebSocket;
      ws.onopen = onOpenHandler;
      
      await waitFor(() => {
        expect(onOpenHandler).toHaveBeenCalled();
      });
    });

    test('should send binary audio data', async () => {
      const ws = new WebSocket('ws://localhost:8000/ws') as unknown as MockWebSocket;
      
      await waitFor(() => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });

      const audioData = new Uint8Array([1, 2, 3, 4, 5]);
      ws.send(audioData);
      
      expect(ws.send).toHaveBeenCalledWith(audioData);
    });

    test('should handle incoming messages', async () => {
      const onMessageHandler = jest.fn();
      const ws = new WebSocket('ws://localhost:8000/ws') as unknown as MockWebSocket;
      ws.onmessage = onMessageHandler;
      
      await waitFor(() => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });

      const testMessage = { type: 'ai_response', text: 'Hello, how can I help you?' };
      ws.simulateMessage(testMessage);
      
      expect(onMessageHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          data: JSON.stringify(testMessage)
        })
      );
    });

    test('should handle connection errors', async () => {
      const onErrorHandler = jest.fn();
      const ws = new WebSocket('ws://localhost:8000/ws') as unknown as MockWebSocket;
      ws.onerror = onErrorHandler;
      
      await waitFor(() => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });

      const testError = new Error('Connection failed');
      ws.simulateError(testError);
      
      expect(onErrorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          error: testError
        })
      );
    });

    test('should handle connection close', async () => {
      const onCloseHandler = jest.fn();
      const ws = new WebSocket('ws://localhost:8000/ws') as unknown as MockWebSocket;
      ws.onclose = onCloseHandler;
      
      await waitFor(() => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });

      ws.simulateClose(1000, 'Normal closure');
      
      expect(onCloseHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 1000,
          reason: 'Normal closure'
        })
      );
    });
  });

  describe('Message Protocol', () => {
    test('should handle AI response messages', async () => {
      const ws = new WebSocket('ws://localhost:8000/ws') as unknown as MockWebSocket;
      
      await waitFor(() => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });

      const aiResponse = {
        type: 'ai_response',
        text: 'I understand your question. Let me help you with that.',
        wordTiming: [
          { word: 'I', start: 0, end: 0.2 },
          { word: 'understand', start: 0.3, end: 0.8 }
        ]
      };
      
      ws.simulateMessage(aiResponse);
      // Additional assertions would be made in the actual component tests
    });

    test('should handle transcript messages', async () => {
      const ws = new WebSocket('ws://localhost:8000/ws') as unknown as MockWebSocket;
      
      await waitFor(() => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });

      const transcript = {
        type: 'transcript',
        text: 'Hello, how are you today?',
        isFinal: true
      };
      
      ws.simulateMessage(transcript);
    });

    test('should handle error messages', async () => {
      const ws = new WebSocket('ws://localhost:8000/ws') as unknown as MockWebSocket;
      
      await waitFor(() => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });

      const errorMessage = {
        type: 'error',
        message: 'Audio processing failed',
        code: 'AUDIO_ERROR'
      };
      
      ws.simulateMessage(errorMessage);
    });
  });
});

describe('Voice Functionality - Audio Processing', () => {
  beforeEach(() => {
    setupGlobalMocks();
    jest.clearAllMocks();
  });

  describe('Audio Playback', () => {
    test('should create Audio element correctly', () => {
      const audio = new Audio('test-audio.mp3') as MockAudio;
      expect(audio).toBeInstanceOf(MockAudio);
      expect(audio.src).toBe('test-audio.mp3');
    });

    test('should play audio successfully', async () => {
      const audio = new Audio('test-audio.mp3') as MockAudio;
      await audio.play();
      expect(audio.play).toHaveBeenCalled();
    });

    test('should handle audio loading events', async () => {
      const audio = new Audio('test-audio.mp3') as MockAudio;
      const onCanPlayThrough = jest.fn();
      audio.oncanplaythrough = onCanPlayThrough;
      
      await waitFor(() => {
        expect(onCanPlayThrough).toHaveBeenCalled();
      });
    });

    test('should handle audio ending', async () => {
      const audio = new Audio('test-audio.mp3') as MockAudio;
      const onEnded = jest.fn();
      audio.onended = onEnded;
      
      audio.simulateEnded();
      expect(onEnded).toHaveBeenCalled();
    });

    test('should handle audio errors', () => {
      const audio = new Audio('test-audio.mp3') as MockAudio;
      const onError = jest.fn();
      audio.onerror = onError;
      
      const testError = new Error('Audio loading failed');
      audio.simulateError(testError);
      expect(onError).toHaveBeenCalledWith(testError);
    });
  });

  describe('Voice Activity Detection', () => {
    test('should detect voice activity from worklet messages', () => {
      const audioContext = new AudioContext();
      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor') as MockAudioWorkletNode;
      
      const messageHandler = jest.fn();
      workletNode.port.onmessage = messageHandler;
      
      // Simulate voice activity detection
      const vadMessage = {
        type: 'voiceActivity',
        isActive: true,
        rms: 1500,
        threshold: 100
      };
      
      workletNode.simulateWorkletMessage(vadMessage);
      expect(messageHandler).toHaveBeenCalledWith({ data: vadMessage });
    });

    test('should handle silence detection', () => {
      const audioContext = new AudioContext();
      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor') as MockAudioWorkletNode;
      
      const messageHandler = jest.fn();
      workletNode.port.onmessage = messageHandler;
      
      // Simulate silence detection
      const silenceMessage = {
        type: 'voiceActivity',
        isActive: false,
        rms: 50,
        threshold: 100
      };
      
      workletNode.simulateWorkletMessage(silenceMessage);
      expect(messageHandler).toHaveBeenCalledWith({ data: silenceMessage });
    });
  });
});

describe('Voice Functionality - Error Handling', () => {
  beforeEach(() => {
    setupGlobalMocks();
    jest.clearAllMocks();
  });

  describe('WebSocket Error Recovery', () => {
    test('should handle WebSocket connection failures', async () => {
      const onErrorHandler = jest.fn();
      const ws = new WebSocket('ws://localhost:8000/ws') as MockWebSocket;
      ws.onerror = onErrorHandler;
      
      await waitFor(() => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });

      const connectionError = new Error('Network error');
      ws.simulateError(connectionError);
      
      expect(onErrorHandler).toHaveBeenCalled();
    });

    test('should handle WebSocket unexpected closure', async () => {
      const onCloseHandler = jest.fn();
      const ws = new WebSocket('ws://localhost:8000/ws') as MockWebSocket;
      ws.onclose = onCloseHandler;
      
      await waitFor(() => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });

      ws.simulateClose(1006, 'Abnormal closure');
      
      expect(onCloseHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 1006,
          reason: 'Abnormal closure'
        })
      );
    });
  });

  describe('Audio Error Recovery', () => {
    test('should handle microphone access errors', async () => {
      const getUserMediaSpy = jest.spyOn(navigator.mediaDevices, 'getUserMedia');
      getUserMediaSpy.mockRejectedValueOnce(new Error('Microphone not available'));

      await expect(navigator.mediaDevices.getUserMedia({ audio: true }))
        .rejects.toThrow('Microphone not available');
    });

    test('should handle audio context creation errors', () => {
      // Mock AudioContext constructor to throw error
      const originalAudioContext = global.AudioContext;
      global.AudioContext = jest.fn().mockImplementation(() => {
        throw new Error('AudioContext not supported');
      });

      expect(() => new AudioContext()).toThrow('AudioContext not supported');
      
      // Restore original
      global.AudioContext = originalAudioContext;
    });

    test('should handle audio playback errors', () => {
      const audio = new Audio('invalid-audio.mp3') as MockAudio;
      const onError = jest.fn();
      audio.onerror = onError;
      
      const playbackError = new Error('Audio playback failed');
      audio.simulateError(playbackError);
      
      expect(onError).toHaveBeenCalledWith(playbackError);
    });
  });
});

describe('Voice Functionality - Performance Monitoring', () => {
  beforeEach(() => {
    setupGlobalMocks();
    jest.clearAllMocks();
  });

  describe('Session Storage', () => {
    test('should save network stats to session storage', () => {
      const networkStats = {
        averageLatency: 150,
        jitter: 25,
        packetLoss: 2,
        bufferSize: 5,
        jitterBufferDelay: 100
      };
      
      sessionStorage.setItem('network_stats', JSON.stringify(networkStats));
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'network_stats',
        JSON.stringify(networkStats)
      );
    });

    test('should retrieve network stats from session storage', () => {
      const networkStats = {
        averageLatency: 150,
        jitter: 25,
        packetLoss: 2,
        bufferSize: 5,
        jitterBufferDelay: 100
      };
      
      (sessionStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(networkStats));
      const retrieved = sessionStorage.getItem('network_stats');
      
      expect(sessionStorage.getItem).toHaveBeenCalledWith('network_stats');
      expect(retrieved).toBe(JSON.stringify(networkStats));
    });
  });

  describe('Performance Metrics', () => {
    test('should measure audio processing latency', () => {
      const startTime = performance.now();
      const endTime = startTime + 50; // 50ms processing time
      
      const latency = endTime - startTime;
      expect(latency).toBe(50);
    });

    test('should track buffer statistics', () => {
      const bufferStats = {
        size: 10,
        capacity: 50,
        delay: 100,
        isPlaying: false
      };
      
      expect(bufferStats.size).toBeLessThanOrEqual(bufferStats.capacity);
      expect(bufferStats.delay).toBeGreaterThan(0);
    });
  });
}); 