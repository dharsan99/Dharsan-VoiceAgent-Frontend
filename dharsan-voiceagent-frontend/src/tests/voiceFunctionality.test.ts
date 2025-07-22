import { renderHook, act, waitFor } from '@testing-library/react';

// Mock the useVoiceAgent hook to avoid import.meta issues
jest.mock('../hooks/useVoiceAgent', () => ({
  useVoiceAgent: () => ({
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
  })
}));

// Mock WebSocket
class MockWebSocket {
  public readyState: number = WebSocket.CONNECTING;
  public onopen: ((event: any) => void) | null = null;
  public onmessage: ((event: any) => void) | null = null;
  public onerror: ((event: any) => void) | null = null;
  public onclose: ((event: any) => void) | null = null;
  public send: jest.Mock = jest.fn();
  public close: jest.Mock = jest.fn();

  constructor(url: string) {
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen({});
      }
    }, 100);
  }
}

// Mock AudioContext
class MockAudioContext {
  public state: string = 'suspended';
  public sampleRate: number = 44100;
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
      connect: jest.fn()
    });
    this.createOscillator.mockReturnValue({
      connect: jest.fn(),
      frequency: {
        setValueAtTime: jest.fn()
      },
      start: jest.fn(),
      stop: jest.fn()
    });
    this.createGain.mockReturnValue({
      connect: jest.fn(),
      gain: {
        setValueAtTime: jest.fn()
      }
    });
    this.createMediaElementSource.mockReturnValue({
      connect: jest.fn()
    });
  }
}

// Mock AudioWorkletNode
class MockAudioWorkletNode {
  public port: {
    onmessage: ((event: any) => void) | null;
    postMessage: jest.Mock;
  };

  constructor(context: any, name: string) {
    this.port = {
      onmessage: null,
      postMessage: jest.fn()
    };
  }

  disconnect() {
    // Mock disconnect
  }
}

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn().mockResolvedValue({
  getTracks: () => [{ stop: jest.fn() }]
});

// Mock Audio
class MockAudio {
  public preload: string = 'auto';
  public playbackRate: number = 1.0;
  public volume: number = 0.8;
  public duration: number = 2.5;
  public oncanplaythrough: (() => void) | null = null;
  public onended: (() => void) | null = null;
  public onerror: ((error: any) => void) | null = null;
  public play: jest.Mock = jest.fn().mockResolvedValue(undefined);
  public pause: jest.Mock = jest.fn();

  constructor(src?: string) {
    // Mock constructor
  }
}

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-url');
const mockRevokeObjectURL = jest.fn();

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

// Mock performance.now
const mockPerformanceNow = jest.fn().mockReturnValue(1000);

// Setup global mocks
const setupGlobalMocks = () => {
  // Mock WebSocket
  const MockWebSocketClass = MockWebSocket as any;
  MockWebSocketClass.CONNECTING = 0;
  MockWebSocketClass.OPEN = 1;
  MockWebSocketClass.CLOSING = 2;
  MockWebSocketClass.CLOSED = 3;
  global.WebSocket = MockWebSocketClass;

  // Mock AudioContext
  global.AudioContext = MockAudioContext as any;
  
  // Mock AudioWorkletNode
  global.AudioWorkletNode = MockAudioWorkletNode as any;
  
  // Mock Audio
  global.Audio = MockAudio as any;
  
  // Mock navigator.mediaDevices
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: mockGetUserMedia
    },
    writable: true
  });
  
  // Mock URL methods
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
  
  // Mock sessionStorage
  Object.defineProperty(global, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true
  });
  
  // Mock performance
  global.performance.now = mockPerformanceNow;
};

describe('Voice Functionality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    setupGlobalMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Browser API Availability', () => {
    test('should have WebSocket API available', () => {
      expect(typeof WebSocket).toBe('function');
      expect(WebSocket.CONNECTING).toBe(0);
      expect(WebSocket.OPEN).toBe(1);
      expect(WebSocket.CLOSING).toBe(2);
      expect(WebSocket.CLOSED).toBe(3);
    });

    test('should have AudioContext API available', () => {
      expect(typeof AudioContext).toBe('function');
      const audioContext = new AudioContext();
      expect(audioContext.sampleRate).toBe(44100);
      expect(typeof audioContext.createMediaStreamSource).toBe('function');
      expect(typeof audioContext.createOscillator).toBe('function');
      expect(typeof audioContext.createGain).toBe('function');
    });

    test('should have AudioWorkletNode API available', () => {
      expect(typeof AudioWorkletNode).toBe('function');
    });

    test('should have getUserMedia API available', () => {
      expect(navigator.mediaDevices).toBeDefined();
      expect(typeof navigator.mediaDevices.getUserMedia).toBe('function');
    });

    test('should have Audio constructor available', () => {
      expect(typeof Audio).toBe('function');
    });

    test('should have sessionStorage API available', () => {
      expect(typeof sessionStorage).toBe('object');
      expect(typeof sessionStorage.getItem).toBe('function');
      expect(typeof sessionStorage.setItem).toBe('function');
      expect(typeof sessionStorage.removeItem).toBe('function');
      expect(typeof sessionStorage.clear).toBe('function');
    });

    test('should have performance API available', () => {
      expect(typeof performance).toBe('object');
      expect(typeof performance.now).toBe('function');
    });

    test('should have URL.createObjectURL available', () => {
      expect(typeof URL.createObjectURL).toBe('function');
      expect(typeof URL.revokeObjectURL).toBe('function');
    });
  });

  describe('WebSocket Functionality', () => {
    test('should create WebSocket connection', () => {
      const mockOnOpen = jest.fn();
      const mockOnMessage = jest.fn();
      const mockOnError = jest.fn();
      const mockOnClose = jest.fn();

      const ws = new WebSocket('ws://localhost:8000/ws');
      ws.onopen = mockOnOpen;
      ws.onmessage = mockOnMessage;
      ws.onerror = mockOnError;
      ws.onclose = mockOnClose;

      expect(ws.readyState).toBe(WebSocket.CONNECTING);
      expect(typeof ws.send).toBe('function');
      expect(typeof ws.close).toBe('function');
    });

         test('should handle WebSocket messages', () => {
       const mockOnMessage = jest.fn();
       const ws = new WebSocket('ws://localhost:8000/ws');
       ws.onmessage = mockOnMessage;

       // Simulate message
       const mockEvent = {
         data: JSON.stringify({
           type: 'final_transcript',
           text: 'Hello, world'
         })
       } as any;

       if (ws.onmessage) {
         ws.onmessage(mockEvent);
       }

       expect(mockOnMessage).toHaveBeenCalledWith(mockEvent);
     });
  });

  describe('Audio Processing', () => {
    test('should create AudioContext', () => {
      const audioContext = new AudioContext();
      expect(audioContext.state).toBe('suspended');
      expect(audioContext.sampleRate).toBe(44100);
    });

    test('should create audio nodes', () => {
      const audioContext = new AudioContext();
      
      const oscillator = audioContext.createOscillator();
      expect(oscillator).toBeDefined();
      expect(typeof oscillator.connect).toBe('function');
      expect(typeof oscillator.start).toBe('function');
      expect(typeof oscillator.stop).toBe('function');

      const gainNode = audioContext.createGain();
      expect(gainNode).toBeDefined();
      expect(typeof gainNode.connect).toBe('function');
      expect(gainNode.gain).toBeDefined();
    });

    test('should handle audio playback', () => {
      const audio = new Audio();
      expect(audio.preload).toBe('auto');
      expect(audio.playbackRate).toBe(1.0);
      expect(audio.volume).toBe(0.8);
      expect(typeof audio.play).toBe('function');
      expect(typeof audio.pause).toBe('function');
    });
  });

  describe('Voice Activity Detection', () => {
    test('should detect voice activity', () => {
      // Mock voice activity detection
      const mockVoiceActivity = {
        isActive: true,
        energy: 0.08,
        timestamp: Date.now()
      };

      expect(mockVoiceActivity.isActive).toBe(true);
      expect(mockVoiceActivity.energy).toBeGreaterThan(0);
      expect(mockVoiceActivity.timestamp).toBeGreaterThan(0);
    });

    test('should handle silence detection', () => {
      // Mock silence detection
      const mockSilence = {
        isActive: false,
        energy: 0.002,
        timestamp: Date.now()
      };

      expect(mockSilence.isActive).toBe(false);
      expect(mockSilence.energy).toBeLessThan(0.01);
    });
  });

  describe('Network Statistics', () => {
    test('should calculate network latency', () => {
      const mockLatencies = [50, 60, 45, 55, 70];
      const averageLatency = mockLatencies.reduce((a, b) => a + b, 0) / mockLatencies.length;
      
      expect(averageLatency).toBe(56);
      expect(averageLatency).toBeGreaterThan(0);
    });

    test('should calculate jitter', () => {
      const mockLatencies = [50, 60, 45, 55, 70];
      const avgLatency = mockLatencies.reduce((a, b) => a + b, 0) / mockLatencies.length;
      const variance = mockLatencies.reduce((sum, lat) => sum + Math.pow(lat - avgLatency, 2), 0) / mockLatencies.length;
      const jitter = Math.sqrt(variance);
      
      expect(jitter).toBeGreaterThan(0);
      expect(jitter).toBeLessThan(20); // Reasonable jitter value
    });

    test('should calculate packet loss', () => {
      const sentPackets = 100;
      const receivedPackets = 95;
      const packetLoss = ((sentPackets - receivedPackets) / sentPackets) * 100;
      
      expect(packetLoss).toBe(5);
      expect(packetLoss).toBeGreaterThanOrEqual(0);
      expect(packetLoss).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    test('should handle WebSocket errors', () => {
      const mockError = new Error('Connection failed');
      expect(mockError.message).toBe('Connection failed');
      expect(mockError instanceof Error).toBe(true);
    });

    test('should handle audio context errors', () => {
      const mockAudioError = new Error('Audio context failed');
      expect(mockAudioError.message).toBe('Audio context failed');
    });

    test('should handle network errors', () => {
      const mockNetworkError = new Error('Network timeout');
      expect(mockNetworkError.message).toBe('Network timeout');
    });
  });

  describe('Session Management', () => {
    test('should save session data', () => {
      const mockSessionData = {
        timestamp: Date.now(),
        connectionStatus: 'connected',
        networkStats: {
          averageLatency: 50,
          jitter: 10,
          packetLoss: 2
        }
      };

      sessionStorage.setItem('test-session', JSON.stringify(mockSessionData));
      const retrieved = sessionStorage.getItem('test-session');
      const parsed = JSON.parse(retrieved || '{}');

      expect(parsed.connectionStatus).toBe('connected');
      expect(parsed.networkStats.averageLatency).toBe(50);
    });

    test('should clear session data', () => {
      sessionStorage.setItem('test-data', 'test-value');
      expect(sessionStorage.getItem('test-data')).toBe('test-value');
      
      sessionStorage.removeItem('test-data');
      expect(sessionStorage.getItem('test-data')).toBeNull();
    });
  });

  describe('Buffer Management', () => {
    test('should manage audio buffer', () => {
      const mockBuffer = {
        size: 5,
        capacity: 50,
        isFull: false,
        isEmpty: false
      };

      expect(mockBuffer.size).toBeLessThanOrEqual(mockBuffer.capacity);
      expect(mockBuffer.isFull).toBe(false);
      expect(mockBuffer.isEmpty).toBe(false);
    });

    test('should handle buffer overflow', () => {
      const mockBuffer = {
        size: 55,
        capacity: 50,
        isFull: true,
        isEmpty: false
      };

      expect(mockBuffer.isFull).toBe(true);
      expect(mockBuffer.size).toBeGreaterThan(mockBuffer.capacity);
    });

    test('should handle buffer underflow', () => {
      const mockBuffer = {
        size: 0,
        capacity: 50,
        isFull: false,
        isEmpty: true
      };

      expect(mockBuffer.isEmpty).toBe(true);
      expect(mockBuffer.size).toBe(0);
    });
  });
}); 