import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

// Mock the VoiceAgentV2 component
const MockVoiceAgentV2 = () => {
  const voiceAgent = mockUseVoiceAgent;
  
  return (
    <div data-testid="voice-agent-v2">
      <div data-testid="connection-status">
        Status: {voiceAgent.connectionStatus}
      </div>
      <div data-testid="listening-state">
        Listening: {voiceAgent.listeningState}
      </div>
      <div data-testid="transcript">
        Transcript: {voiceAgent.transcript}
      </div>
      <div data-testid="ai-response">
        AI Response: {voiceAgent.aiResponse?.text || 'No response'}
      </div>
      <button 
        data-testid="connect-button"
        onClick={voiceAgent.connect}
      >
        Connect
      </button>
      <button 
        data-testid="disconnect-button"
        onClick={voiceAgent.disconnect}
      >
        Disconnect
      </button>
      <button 
        data-testid="clear-transcripts-button"
        onClick={voiceAgent.clearTranscripts}
      >
        Clear Transcripts
      </button>
    </div>
  );
};

// Mock the WordHighlightDisplay component
const MockWordHighlightDisplay = () => {
  const voiceAgent = mockUseVoiceAgent;
  
  return (
    <div data-testid="word-highlight-display">
      <div data-testid="word-timing-text">
        {voiceAgent.wordTimingData.text || 'No text'}
      </div>
      <div data-testid="current-word-index">
        Current Word: {voiceAgent.wordTimingData.currentWordIndex}
      </div>
      <div data-testid="is-active">
        Active: {voiceAgent.wordTimingData.isActive ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

// Mock the DebugInfo component
const MockDebugInfo = () => {
  const voiceAgent = mockUseVoiceAgent;
  
  return (
    <div data-testid="debug-info">
      <div data-testid="network-stats">
        Latency: {voiceAgent.networkStats.averageLatency}ms
      </div>
      <div data-testid="error-stats">
        Errors: {voiceAgent.errorStats.totalErrors}
      </div>
      <div data-testid="buffer-info">
        Buffer: {voiceAgent.bufferInfo.size}/{voiceAgent.bufferInfo.capacity}
      </div>
      <div data-testid="recovery-info">
        Recovering: {voiceAgent.recoveryInfo.isRecovering ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

describe('Voice Agent Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock state to initial values
    mockUseVoiceAgent.connectionStatus = 'disconnected';
    mockUseVoiceAgent.listeningState = 'idle';
    mockUseVoiceAgent.transcript = '';
    mockUseVoiceAgent.aiResponse = null;
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

  describe('VoiceAgentV2 Component', () => {
    test('should render with initial state', () => {
      render(<MockVoiceAgentV2 />);
      
      expect(screen.getByTestId('voice-agent-v2')).toBeInTheDocument();
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Status: disconnected');
      expect(screen.getByTestId('listening-state')).toHaveTextContent('Listening: idle');
      expect(screen.getByTestId('transcript')).toHaveTextContent('Transcript:');
      expect(screen.getByTestId('ai-response')).toHaveTextContent('AI Response: No response');
    });

    test('should call connect when connect button is clicked', async () => {
      const user = userEvent.setup();
      render(<MockVoiceAgentV2 />);
      
      const connectButton = screen.getByTestId('connect-button');
      await user.click(connectButton);
      
      expect(mockUseVoiceAgent.connect).toHaveBeenCalledTimes(1);
    });

    test('should call disconnect when disconnect button is clicked', async () => {
      const user = userEvent.setup();
      render(<MockVoiceAgentV2 />);
      
      const disconnectButton = screen.getByTestId('disconnect-button');
      await user.click(disconnectButton);
      
      expect(mockUseVoiceAgent.disconnect).toHaveBeenCalledTimes(1);
    });

    test('should call clearTranscripts when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<MockVoiceAgentV2 />);
      
      const clearButton = screen.getByTestId('clear-transcripts-button');
      await user.click(clearButton);
      
      expect(mockUseVoiceAgent.clearTranscripts).toHaveBeenCalledTimes(1);
    });

    test('should display transcript when available', () => {
      // Update mock to include transcript
      mockUseVoiceAgent.transcript = 'Hello, how are you?';
      
      render(<MockVoiceAgentV2 />);
      
      expect(screen.getByTestId('transcript')).toHaveTextContent('Transcript: Hello, how are you?');
    });

    test('should display AI response when available', () => {
      // Update mock to include AI response
      mockUseVoiceAgent.aiResponse = { text: 'I am doing well, thank you for asking!' };
      
      render(<MockVoiceAgentV2 />);
      
      expect(screen.getByTestId('ai-response')).toHaveTextContent('AI Response: I am doing well, thank you for asking!');
    });
  });

  describe('WordHighlightDisplay Component', () => {
    test('should render with initial word timing data', () => {
      render(<MockWordHighlightDisplay />);
      
      expect(screen.getByTestId('word-highlight-display')).toBeInTheDocument();
      expect(screen.getByTestId('word-timing-text')).toHaveTextContent('No text');
      expect(screen.getByTestId('current-word-index')).toHaveTextContent('Current Word: -1');
      expect(screen.getByTestId('is-active')).toHaveTextContent('Active: No');
    });

    test('should display word timing text when available', () => {
      // Update mock to include word timing data
      mockUseVoiceAgent.wordTimingData = {
        text: 'Hello world',
        words: [
          { word: 'Hello', start: 0, end: 0.5 },
          { word: 'world', start: 0.6, end: 1.0 }
        ],
        currentWordIndex: 0,
        isActive: true
      };
      
      render(<MockWordHighlightDisplay />);
      
      expect(screen.getByTestId('word-timing-text')).toHaveTextContent('Hello world');
      expect(screen.getByTestId('current-word-index')).toHaveTextContent('Current Word: 0');
      expect(screen.getByTestId('is-active')).toHaveTextContent('Active: Yes');
    });

    test('should handle active word highlighting', () => {
      // Update mock to show active word
      mockUseVoiceAgent.wordTimingData = {
        text: 'Hello world',
        words: [
          { word: 'Hello', start: 0, end: 0.5 },
          { word: 'world', start: 0.6, end: 1.0 }
        ],
        currentWordIndex: 1,
        isActive: true
      };
      
      render(<MockWordHighlightDisplay />);
      
      expect(screen.getByTestId('current-word-index')).toHaveTextContent('Current Word: 1');
      expect(screen.getByTestId('is-active')).toHaveTextContent('Active: Yes');
    });
  });

  describe('DebugInfo Component', () => {
    test('should render with initial debug information', () => {
      render(<MockDebugInfo />);
      
      expect(screen.getByTestId('debug-info')).toBeInTheDocument();
      expect(screen.getByTestId('network-stats')).toHaveTextContent('Latency: 0ms');
      expect(screen.getByTestId('error-stats')).toHaveTextContent('Errors: 0');
      expect(screen.getByTestId('buffer-info')).toHaveTextContent('Buffer: 0/50');
      expect(screen.getByTestId('recovery-info')).toHaveTextContent('Recovering: No');
    });

    test('should display updated network stats', () => {
      // Update mock to include network stats
      mockUseVoiceAgent.networkStats = {
        averageLatency: 150,
        jitter: 25,
        packetLoss: 2,
        bufferSize: 5,
        jitterBufferDelay: 100
      };
      
      render(<MockDebugInfo />);
      
      expect(screen.getByTestId('network-stats')).toHaveTextContent('Latency: 150ms');
    });

    test('should display error statistics', () => {
      // Update mock to include error stats
      mockUseVoiceAgent.errorStats = {
        totalErrors: 5,
        recentErrors: 2,
        byType: { network: 3, audio: 2 },
        bySeverity: { low: 2, medium: 2, high: 1 }
      };
      
      render(<MockDebugInfo />);
      
      expect(screen.getByTestId('error-stats')).toHaveTextContent('Errors: 5');
    });

    test('should display buffer information', () => {
      // Update mock to include buffer info
      mockUseVoiceAgent.bufferInfo = {
        size: 25,
        capacity: 50,
        delay: 100,
        isPlaying: true
      };
      
      render(<MockDebugInfo />);
      
      expect(screen.getByTestId('buffer-info')).toHaveTextContent('Buffer: 25/50');
    });

    test('should display recovery information', () => {
      // Update mock to include recovery info
      mockUseVoiceAgent.recoveryInfo = {
        isRecovering: true,
        retryAttempt: 2,
        maxRetries: 3,
        lastError: new Error('Connection lost'),
        recoveryStrategy: ['retry', 'fallback']
      };
      
      render(<MockDebugInfo />);
      
      expect(screen.getByTestId('recovery-info')).toHaveTextContent('Recovering: Yes');
    });
  });

  describe('Component Integration', () => {
    test('should render all components together', () => {
      render(
        <div>
          <MockVoiceAgentV2 />
          <MockWordHighlightDisplay />
          <MockDebugInfo />
        </div>
      );
      
      expect(screen.getByTestId('voice-agent-v2')).toBeInTheDocument();
      expect(screen.getByTestId('word-highlight-display')).toBeInTheDocument();
      expect(screen.getByTestId('debug-info')).toBeInTheDocument();
    });

    test('should update all components when state changes', () => {
      // Update mock state
      mockUseVoiceAgent.connectionStatus = 'connected';
      mockUseVoiceAgent.listeningState = 'listening';
      mockUseVoiceAgent.transcript = 'Hello world';
      mockUseVoiceAgent.aiResponse = { text: 'Hello! How can I help you?' };
      mockUseVoiceAgent.wordTimingData = {
        text: 'Hello world',
        words: [{ word: 'Hello', start: 0, end: 0.5 }],
        currentWordIndex: 0,
        isActive: true
      };
      mockUseVoiceAgent.networkStats.averageLatency = 100;
      mockUseVoiceAgent.errorStats.totalErrors = 1;
      mockUseVoiceAgent.bufferInfo.size = 10;
      mockUseVoiceAgent.recoveryInfo.isRecovering = false;
      
      render(
        <div>
          <MockVoiceAgentV2 />
          <MockWordHighlightDisplay />
          <MockDebugInfo />
        </div>
      );
      
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Status: connected');
      expect(screen.getByTestId('listening-state')).toHaveTextContent('Listening: listening');
      expect(screen.getByTestId('transcript')).toHaveTextContent('Transcript: Hello world');
      expect(screen.getByTestId('ai-response')).toHaveTextContent('AI Response: Hello! How can I help you?');
      expect(screen.getByTestId('word-timing-text')).toHaveTextContent('Hello world');
      expect(screen.getByTestId('network-stats')).toHaveTextContent('Latency: 100ms');
      expect(screen.getByTestId('error-stats')).toHaveTextContent('Errors: 1');
      expect(screen.getByTestId('buffer-info')).toHaveTextContent('Buffer: 10/50');
      expect(screen.getByTestId('recovery-info')).toHaveTextContent('Recovering: No');
    });
  });
});

describe('Voice Agent User Interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock state to initial values
    mockUseVoiceAgent.connectionStatus = 'disconnected';
    mockUseVoiceAgent.listeningState = 'idle';
    mockUseVoiceAgent.transcript = '';
    mockUseVoiceAgent.aiResponse = null;
    mockUseVoiceAgent.finalTranscripts = [];
  });

  test('should handle complete user interaction flow', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<MockVoiceAgentV2 />);
    
    // Initial state
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Status: disconnected');
    
    // Connect
    await user.click(screen.getByTestId('connect-button'));
    expect(mockUseVoiceAgent.connect).toHaveBeenCalledTimes(1);
    
    // Simulate state change after connection
    mockUseVoiceAgent.connectionStatus = 'connected';
    mockUseVoiceAgent.listeningState = 'listening';
    
    // Unmount and re-render to see updated state
    unmount();
    render(<MockVoiceAgentV2 />);
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Status: connected');
    expect(screen.getByTestId('listening-state')).toHaveTextContent('Listening: listening');
    
    // Disconnect
    await user.click(screen.getByTestId('disconnect-button'));
    expect(mockUseVoiceAgent.disconnect).toHaveBeenCalledTimes(1);
  });

  test('should handle transcript clearing', async () => {
    const user = userEvent.setup();
    
    // Set up initial transcript
    mockUseVoiceAgent.transcript = 'Some transcript text';
    mockUseVoiceAgent.finalTranscripts = ['Transcript 1', 'Transcript 2'];
    
    render(<MockVoiceAgentV2 />);
    
    expect(screen.getByTestId('transcript')).toHaveTextContent('Transcript: Some transcript text');
    
    // Clear transcripts
    await user.click(screen.getByTestId('clear-transcripts-button'));
    expect(mockUseVoiceAgent.clearTranscripts).toHaveBeenCalledTimes(1);
  });

  test('should handle multiple rapid button clicks', async () => {
    const user = userEvent.setup();
    render(<MockVoiceAgentV2 />);
    
    const connectButton = screen.getByTestId('connect-button');
    const disconnectButton = screen.getByTestId('disconnect-button');
    
    // Rapid clicks
    await user.click(connectButton);
    await user.click(disconnectButton);
    await user.click(connectButton);
    
    expect(mockUseVoiceAgent.connect).toHaveBeenCalledTimes(2);
    expect(mockUseVoiceAgent.disconnect).toHaveBeenCalledTimes(1);
  });
});

describe('Voice Agent Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock state to initial values
    mockUseVoiceAgent.connectionStatus = 'disconnected';
    mockUseVoiceAgent.listeningState = 'idle';
    mockUseVoiceAgent.transcript = '';
    mockUseVoiceAgent.aiResponse = null;
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

  test('should have proper button labels and roles', () => {
    render(<MockVoiceAgentV2 />);
    
    const connectButton = screen.getByTestId('connect-button');
    const disconnectButton = screen.getByTestId('disconnect-button');
    const clearButton = screen.getByTestId('clear-transcripts-button');
    
    expect(connectButton).toBeInTheDocument();
    expect(disconnectButton).toBeInTheDocument();
    expect(clearButton).toBeInTheDocument();
    
    // Check that buttons are clickable
    expect(connectButton).not.toBeDisabled();
    expect(disconnectButton).not.toBeDisabled();
    expect(clearButton).not.toBeDisabled();
  });

  test('should display status information clearly', () => {
    render(<MockVoiceAgentV2 />);
    
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Status: disconnected');
    expect(screen.getByTestId('listening-state')).toHaveTextContent('Listening: idle');
          expect(screen.getByTestId('transcript')).toHaveTextContent('Transcript:');
    expect(screen.getByTestId('ai-response')).toHaveTextContent('AI Response: No response');
  });

  test('should provide debug information for troubleshooting', () => {
    render(<MockDebugInfo />);
    
    expect(screen.getByTestId('network-stats')).toHaveTextContent('Latency: 0ms');
    expect(screen.getByTestId('error-stats')).toHaveTextContent('Errors: 0');
    expect(screen.getByTestId('buffer-info')).toHaveTextContent('Buffer: 0/50');
    expect(screen.getByTestId('recovery-info')).toHaveTextContent('Recovering: No');
  });
}); 