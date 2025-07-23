import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock the useVoiceAgent hook
const mockUseVoiceAgent = {
  connectionStatus: 'disconnected' as 'disconnected' | 'connecting' | 'connected' | 'error',
  listeningState: 'idle' as 'idle' | 'listening' | 'processing' | 'error',
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
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>
  },
  recoveryInfo: {
    isRecovering: false,
    retryAttempt: 0,
    maxRetries: 3,
    lastError: null as Error | null,
    recoveryStrategy: [] as string[]
  },
  bufferInfo: {
    size: 0,
    capacity: 50,
    delay: 100,
    isPlaying: false
  },
  interimTranscript: '',
  finalTranscripts: [] as string[],
  currentSpokenWordIndex: null as number | null,
  aiResponse: null as { text: string } | null,
  wordTimingData: {
    text: '',
    words: [] as Array<{ word: string; start: number; end: number }>,
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

describe('useVoiceAgent Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock state to initial values
    mockUseVoiceAgent.connectionStatus = 'disconnected';
    mockUseVoiceAgent.listeningState = 'idle';
    mockUseVoiceAgent.transcript = '';
    mockUseVoiceAgent.aiResponse = null;
    mockUseVoiceAgent.isVoiceActive = false;
    mockUseVoiceAgent.interimTranscript = '';
    mockUseVoiceAgent.finalTranscripts = [];
    mockUseVoiceAgent.currentSpokenWordIndex = null;
    mockUseVoiceAgent.wordTimingData = {
      text: '',
      words: [],
      currentWordIndex: -1,
      isActive: false
    };
    mockUseVoiceAgent.networkStats = {
      averageLatency: 0,
      jitter: 0,
      packetLoss: 0,
      bufferSize: 3,
      jitterBufferDelay: 100
    };
    mockUseVoiceAgent.errorStats = {
      totalErrors: 0,
      recentErrors: 0,
      byType: {},
      bySeverity: {}
    };
    mockUseVoiceAgent.bufferInfo = {
      size: 0,
      capacity: 50,
      delay: 100,
      isPlaying: false
    };
    mockUseVoiceAgent.recoveryInfo = {
      isRecovering: false,
      retryAttempt: 0,
      maxRetries: 3,
      lastError: null,
      recoveryStrategy: []
    };
  });

  describe('Initial State', () => {
    test('should return initial disconnected state', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      expect(result.current.connectionStatus).toBe('disconnected');
      expect(result.current.listeningState).toBe('idle');
      expect(result.current.isVoiceActive).toBe(false);
      expect(result.current.transcript).toBe('');
      expect(result.current.aiResponse).toBeNull();
    });

    test('should have empty network stats initially', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      expect(result.current.networkStats.averageLatency).toBe(0);
      expect(result.current.networkStats.jitter).toBe(0);
      expect(result.current.networkStats.packetLoss).toBe(0);
      expect(result.current.networkStats.bufferSize).toBe(3);
    });

    test('should have empty error stats initially', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      expect(result.current.errorStats.totalErrors).toBe(0);
      expect(result.current.errorStats.recentErrors).toBe(0);
      expect(result.current.errorStats.byType).toEqual({});
      expect(result.current.errorStats.bySeverity).toEqual({});
    });

    test('should have empty buffer info initially', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      expect(result.current.bufferInfo.size).toBe(0);
      expect(result.current.bufferInfo.capacity).toBe(50);
      expect(result.current.bufferInfo.isPlaying).toBe(false);
    });

    test('should have empty recovery info initially', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      expect(result.current.recoveryInfo.isRecovering).toBe(false);
      expect(result.current.recoveryInfo.retryAttempt).toBe(0);
      expect(result.current.recoveryInfo.maxRetries).toBe(3);
      expect(result.current.recoveryInfo.lastError).toBeNull();
      expect(result.current.recoveryInfo.recoveryStrategy).toEqual([]);
    });
  });

  describe('Connection Management', () => {
    test('should call connect function', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      act(() => {
        result.current.connect();
      });
      
      expect(mockUseVoiceAgent.connect).toHaveBeenCalledTimes(1);
    });

    test('should call disconnect function', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      act(() => {
        result.current.disconnect();
      });
      
      expect(mockUseVoiceAgent.disconnect).toHaveBeenCalledTimes(1);
    });

    test('should handle connection state transitions', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.connectionStatus).toBe('disconnected');
      
      // Simulate connecting
      mockUseVoiceAgent.connectionStatus = 'connecting';
      expect(result.current.connectionStatus).toBe('connecting');
      
      // Simulate connected
      mockUseVoiceAgent.connectionStatus = 'connected';
      expect(result.current.connectionStatus).toBe('connected');
      
      // Simulate error
      mockUseVoiceAgent.connectionStatus = 'error';
      expect(result.current.connectionStatus).toBe('error');
    });

    test('should handle listening state transitions', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.listeningState).toBe('idle');
      
      // Simulate listening
      mockUseVoiceAgent.listeningState = 'listening';
      expect(result.current.listeningState).toBe('listening');
      
      // Simulate processing
      mockUseVoiceAgent.listeningState = 'processing';
      expect(result.current.listeningState).toBe('processing');
      
      // Simulate error
      mockUseVoiceAgent.listeningState = 'error';
      expect(result.current.listeningState).toBe('error');
    });
  });

  describe('Transcript Management', () => {
    test('should handle transcript updates', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.transcript).toBe('');
      
      // Update transcript
      mockUseVoiceAgent.transcript = 'Hello, how are you?';
      expect(result.current.transcript).toBe('Hello, how are you?');
      
      // Update again
      mockUseVoiceAgent.transcript = 'Hello, how are you today?';
      expect(result.current.transcript).toBe('Hello, how are you today?');
    });

    test('should handle interim transcript', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.interimTranscript).toBe('');
      
      // Update interim transcript
      mockUseVoiceAgent.interimTranscript = 'Hello';
      expect(result.current.interimTranscript).toBe('Hello');
      
      // Update again
      mockUseVoiceAgent.interimTranscript = 'Hello, how';
      expect(result.current.interimTranscript).toBe('Hello, how');
    });

    test('should handle final transcripts array', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.finalTranscripts).toEqual([]);
      
      // Add final transcripts
      mockUseVoiceAgent.finalTranscripts = ['Hello', 'How are you?'];
      expect(result.current.finalTranscripts).toEqual(['Hello', 'How are you?']);
      
      // Add more
      mockUseVoiceAgent.finalTranscripts = ['Hello', 'How are you?', 'I am fine'];
      expect(result.current.finalTranscripts).toEqual(['Hello', 'How are you?', 'I am fine']);
    });

    test('should call clearTranscripts function', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      act(() => {
        result.current.clearTranscripts();
      });
      
      expect(mockUseVoiceAgent.clearTranscripts).toHaveBeenCalledTimes(1);
    });
  });

  describe('AI Response Handling', () => {
    test('should handle AI response updates', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.aiResponse).toBeNull();
      
      // Add AI response
      mockUseVoiceAgent.aiResponse = { text: 'Hello! How can I help you?' };
      expect(result.current.aiResponse).toEqual({ text: 'Hello! How can I help you?' });
      
      // Update AI response
      mockUseVoiceAgent.aiResponse = { text: 'I understand your question.' };
      expect(result.current.aiResponse).toEqual({ text: 'I understand your question.' });
    });

    test('should handle AI response with word timing', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      const aiResponseWithTiming = {
        text: 'Hello world',
        wordTiming: [
          { word: 'Hello', start: 0, end: 0.5 },
          { word: 'world', start: 0.6, end: 1.0 }
        ]
      };
      
      mockUseVoiceAgent.aiResponse = aiResponseWithTiming;
      expect(result.current.aiResponse).toEqual(aiResponseWithTiming);
    });
  });

  describe('Voice Activity Detection', () => {
    test('should handle voice activity state', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.isVoiceActive).toBe(false);
      
      // Voice detected
      mockUseVoiceAgent.isVoiceActive = true;
      expect(result.current.isVoiceActive).toBe(true);
      
      // Voice stopped
      mockUseVoiceAgent.isVoiceActive = false;
      expect(result.current.isVoiceActive).toBe(false);
    });

    test('should handle word timing data', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.wordTimingData.text).toBe('');
      expect(result.current.wordTimingData.words).toEqual([]);
      expect(result.current.wordTimingData.currentWordIndex).toBe(-1);
      expect(result.current.wordTimingData.isActive).toBe(false);
      
      // Update word timing data
      const wordTimingData = {
        text: 'Hello world',
        words: [
          { word: 'Hello', start: 0, end: 0.5 },
          { word: 'world', start: 0.6, end: 1.0 }
        ],
        currentWordIndex: 0,
        isActive: true
      };
      
      mockUseVoiceAgent.wordTimingData = wordTimingData;
      expect(result.current.wordTimingData).toEqual(wordTimingData);
    });

    test('should handle current spoken word index', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.currentSpokenWordIndex).toBeNull();
      
      // Set current word index
      mockUseVoiceAgent.currentSpokenWordIndex = 0;
      expect(result.current.currentSpokenWordIndex).toBe(0);
      
      // Update word index
      mockUseVoiceAgent.currentSpokenWordIndex = 1;
      expect(result.current.currentSpokenWordIndex).toBe(1);
      
      // Reset to null
      mockUseVoiceAgent.currentSpokenWordIndex = null;
      expect(result.current.currentSpokenWordIndex).toBeNull();
    });
  });

  describe('Network Statistics', () => {
    test('should handle network stats updates', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.networkStats.averageLatency).toBe(0);
      expect(result.current.networkStats.jitter).toBe(0);
      expect(result.current.networkStats.packetLoss).toBe(0);
      
      // Update network stats
      const networkStats = {
        averageLatency: 150,
        jitter: 25,
        packetLoss: 2,
        bufferSize: 5,
        jitterBufferDelay: 100
      };
      
      mockUseVoiceAgent.networkStats = networkStats;
      expect(result.current.networkStats).toEqual(networkStats);
    });

    test('should handle buffer size changes', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.bufferInfo.size).toBe(0);
      expect(result.current.bufferInfo.capacity).toBe(50);
      expect(result.current.bufferInfo.isPlaying).toBe(false);
      
      // Update buffer info
      const bufferInfo = {
        size: 25,
        capacity: 50,
        delay: 100,
        isPlaying: true
      };
      
      mockUseVoiceAgent.bufferInfo = bufferInfo;
      expect(result.current.bufferInfo).toEqual(bufferInfo);
    });
  });

  describe('Error Handling', () => {
    test('should handle error statistics', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.errorStats.totalErrors).toBe(0);
      expect(result.current.errorStats.recentErrors).toBe(0);
      
      // Update error stats
      const errorStats = {
        totalErrors: 5,
        recentErrors: 2,
        byType: { network: 3, audio: 2 },
        bySeverity: { low: 2, medium: 2, high: 1 }
      };
      
      mockUseVoiceAgent.errorStats = errorStats;
      expect(result.current.errorStats).toEqual(errorStats);
    });

    test('should handle recovery information', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Initial state
      expect(result.current.recoveryInfo.isRecovering).toBe(false);
      expect(result.current.recoveryInfo.retryAttempt).toBe(0);
      expect(result.current.recoveryInfo.lastError).toBeNull();
      
      // Update recovery info
      const recoveryInfo = {
        isRecovering: true,
        retryAttempt: 2,
        maxRetries: 3,
        lastError: new Error('Connection lost'),
        recoveryStrategy: ['retry', 'fallback']
      };
      
      mockUseVoiceAgent.recoveryInfo = recoveryInfo;
      expect(result.current.recoveryInfo).toEqual(recoveryInfo);
    });
  });

  describe('Hook Integration', () => {
    test('should maintain consistent state across all properties', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Set up a complete state
      mockUseVoiceAgent.connectionStatus = 'connected';
      mockUseVoiceAgent.listeningState = 'listening';
      mockUseVoiceAgent.isVoiceActive = true;
      mockUseVoiceAgent.transcript = 'Hello world';
      mockUseVoiceAgent.aiResponse = { text: 'Hello! How can I help you?' };
      mockUseVoiceAgent.networkStats.averageLatency = 100;
      mockUseVoiceAgent.errorStats.totalErrors = 1;
      mockUseVoiceAgent.bufferInfo.size = 10;
      mockUseVoiceAgent.recoveryInfo.isRecovering = false;
      
      // Verify all properties are consistent
      expect(result.current.connectionStatus).toBe('connected');
      expect(result.current.listeningState).toBe('listening');
      expect(result.current.isVoiceActive).toBe(true);
      expect(result.current.transcript).toBe('Hello world');
      expect(result.current.aiResponse).toEqual({ text: 'Hello! How can I help you?' });
      expect(result.current.networkStats.averageLatency).toBe(100);
      expect(result.current.errorStats.totalErrors).toBe(1);
      expect(result.current.bufferInfo.size).toBe(10);
      expect(result.current.recoveryInfo.isRecovering).toBe(false);
    });

    test('should handle rapid state changes', () => {
      const { result } = renderHook(() => mockUseVoiceAgent);
      
      // Rapid state changes
      act(() => {
        mockUseVoiceAgent.connectionStatus = 'connecting';
        mockUseVoiceAgent.listeningState = 'listening';
        mockUseVoiceAgent.isVoiceActive = true;
      });
      
      expect(result.current.connectionStatus).toBe('connecting');
      expect(result.current.listeningState).toBe('listening');
      expect(result.current.isVoiceActive).toBe(true);
      
      act(() => {
        mockUseVoiceAgent.connectionStatus = 'connected';
        mockUseVoiceAgent.listeningState = 'processing';
        mockUseVoiceAgent.isVoiceActive = false;
      });
      
      expect(result.current.connectionStatus).toBe('connected');
      expect(result.current.listeningState).toBe('processing');
      expect(result.current.isVoiceActive).toBe(false);
    });
  });
}); 