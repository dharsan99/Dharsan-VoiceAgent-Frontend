/**
 * Voice Agent Testing Utility
 * Comprehensive testing functions for the Voice AI system
 */

export interface VoiceAgentTestResults {
  timestamp: string;
  voiceAgentAvailable: boolean;
  connectionStatus: string;
  listeningState: string;
  microphoneAccess: boolean;
  websocketTest: 'success' | 'failed' | 'not_attempted';
  networkStats: {
    averageLatency: number;
    jitter: number;
    packetLoss: number;
    bufferSize: number;
    jitterBufferDelay: number;
  };
  errorStats: {
    totalErrors: number;
    recentErrors: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  bufferInfo: {
    size: number;
    capacity: number;
    delay: number;
    isPlaying: boolean;
  };
  recoveryInfo: {
    isRecovering: boolean;
    retryAttempt: number;
    maxRetries: number;
    lastError: Error | null;
    recoveryStrategy: string[];
  };
  browserCompatibility: {
    webSocket: boolean;
    audioContext: boolean;
    mediaDevices: boolean;
    audioWorklet: boolean;
  };
  errors: string[];
  warnings: string[];
  success: boolean;
}

export interface VoiceAgentTestOptions {
  testMicrophone?: boolean;
  testWebSocket?: boolean;
  testAudioContext?: boolean;
  testBrowserAPIs?: boolean;
  verbose?: boolean;
}

/**
 * Test browser API compatibility
 */
export async function testBrowserCompatibility(): Promise<{
  webSocket: boolean;
  audioContext: boolean;
  mediaDevices: boolean;
  audioWorklet: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  const results = {
    webSocket: false,
    audioContext: false,
    mediaDevices: false,
    audioWorklet: false
  };

  // Test WebSocket
  try {
    if (typeof WebSocket !== 'undefined') {
      results.webSocket = true;
    } else {
      errors.push('WebSocket API not available');
    }
  } catch (error) {
    errors.push(`WebSocket test failed: ${error}`);
  }

  // Test AudioContext
  try {
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      results.audioContext = true;
    } else {
      errors.push('AudioContext API not available');
    }
  } catch (error) {
    errors.push(`AudioContext test failed: ${error}`);
  }

  // Test MediaDevices
  try {
    if (navigator.mediaDevices?.getUserMedia && typeof navigator.mediaDevices.getUserMedia === 'function') {
      results.mediaDevices = true;
    } else {
      errors.push('MediaDevices API not available');
    }
  } catch (error) {
    errors.push(`MediaDevices test failed: ${error}`);
  }

  // Test AudioWorklet
  try {
    if (typeof AudioWorkletNode !== 'undefined') {
      results.audioWorklet = true;
    } else {
      errors.push('AudioWorklet API not available');
    }
  } catch (error) {
    errors.push(`AudioWorklet test failed: ${error}`);
  }

  return { ...results, errors };
}

/**
 * Test microphone access
 */
export async function testMicrophoneAccess(): Promise<{
  success: boolean;
  trackCount: number;
  error?: string;
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const trackCount = stream.getTracks().length;
    
    // Clean up
    stream.getTracks().forEach(track => track.stop());
    
    return {
      success: true,
      trackCount
    };
  } catch (error) {
    return {
      success: false,
      trackCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test WebSocket connection
 */
export async function testWebSocketConnection(url: string): Promise<{
  success: boolean;
  connectionTime: number;
  error?: string;
}> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    try {
      const socket = new WebSocket(url);
      
      const timeout = setTimeout(() => {
        socket.close();
        resolve({
          success: false,
          connectionTime: performance.now() - startTime,
          error: 'Connection timeout'
        });
      }, 5000);
      
      socket.onopen = () => {
        clearTimeout(timeout);
        const connectionTime = performance.now() - startTime;
        
        // Send a test message
        const testData = new Int16Array(1024).buffer;
        socket.send(testData);
        
        setTimeout(() => {
          socket.close();
          resolve({
            success: true,
            connectionTime
          });
        }, 1000);
      };
      
      socket.onerror = () => {
        clearTimeout(timeout);
        resolve({
          success: false,
          connectionTime: performance.now() - startTime,
          error: 'WebSocket connection failed'
        });
      };
      
    } catch (error) {
      resolve({
        success: false,
        connectionTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

/**
 * Comprehensive Voice Agent Test
 */
export async function runVoiceAgentTest(
  voiceAgent: any,
  testWebSocketConnectionFn?: () => void,
  options: VoiceAgentTestOptions = {}
): Promise<VoiceAgentTestResults> {
  const {
    testMicrophone = true,
    testWebSocket = true,
    testAudioContext = true,
    testBrowserAPIs = true,
    verbose = false
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];
  let success = true;

  if (verbose) {
    console.log('🚀 Starting comprehensive Voice Agent test...');
  }

  // Test 1: Check if voice agent is available
  if (!voiceAgent) {
    errors.push('Voice agent not available');
    success = false;
  }

  // Test 2: Browser API compatibility
  let browserCompatibility = {
    webSocket: false,
    audioContext: false,
    mediaDevices: false,
    audioWorklet: false
  };

  if (testBrowserAPIs) {
    if (verbose) console.log('🔧 Testing browser API compatibility...');
    const browserTest = await testBrowserCompatibility();
    browserCompatibility = browserTest;
    browserTest.errors.forEach(error => errors.push(error));
    
    if (browserTest.errors.length > 0) {
      success = false;
    }
  }

  // Test 3: Microphone access
  let microphoneAccess = false;
  if (testMicrophone) {
    if (verbose) console.log('🎤 Testing microphone access...');
    const micTest = await testMicrophoneAccess();
    microphoneAccess = micTest.success;
    
    if (!micTest.success) {
      errors.push(`Microphone access failed: ${micTest.error}`);
      success = false;
    }
  }

  // Test 4: WebSocket connection
  let websocketTest: 'success' | 'failed' | 'not_attempted' = 'not_attempted';
  if (testWebSocket) {
    if (verbose) console.log('🌐 Testing WebSocket connection...');
    
    if (testWebSocketConnectionFn) {
      try {
        testWebSocketConnectionFn();
        websocketTest = 'success';
      } catch (error) {
        websocketTest = 'failed';
        errors.push(`WebSocket test failed: ${error}`);
        success = false;
      }
    } else {
      warnings.push('WebSocket test function not provided');
    }
  }

  // Test 5: AudioContext
  if (testAudioContext) {
    if (verbose) console.log('🎵 Testing AudioContext...');
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        audioContext.close();
      } else {
        errors.push('AudioContext not available');
        success = false;
      }
    } catch (error) {
      errors.push(`AudioContext test failed: ${error}`);
      success = false;
    }
  }

  // Collect current state from voice agent
  const currentState = {
    connectionStatus: voiceAgent?.connectionStatus || 'unknown',
    listeningState: voiceAgent?.listeningState || 'unknown',
    networkStats: voiceAgent?.networkStats || {
      averageLatency: 0,
      jitter: 0,
      packetLoss: 0,
      bufferSize: 0,
      jitterBufferDelay: 0
    },
    errorStats: voiceAgent?.errorStats || {
      totalErrors: 0,
      recentErrors: 0,
      byType: {},
      bySeverity: {}
    },
    bufferInfo: voiceAgent?.bufferInfo || {
      size: 0,
      capacity: 0,
      delay: 0,
      isPlaying: false
    },
    recoveryInfo: voiceAgent?.recoveryInfo || {
      isRecovering: false,
      retryAttempt: 0,
      maxRetries: 0,
      lastError: null,
      recoveryStrategy: []
    }
  };

  // Generate warnings based on state
  if (currentState.errorStats.totalErrors > 0) {
    warnings.push(`Total errors detected: ${currentState.errorStats.totalErrors}`);
  }
  
  if (currentState.networkStats.averageLatency > 200) {
    warnings.push(`High latency detected: ${currentState.networkStats.averageLatency}ms`);
  }
  
  if (currentState.networkStats.packetLoss > 5) {
    warnings.push(`High packet loss detected: ${currentState.networkStats.packetLoss}%`);
  }

  const results: VoiceAgentTestResults = {
    timestamp: new Date().toISOString(),
    voiceAgentAvailable: !!voiceAgent,
    connectionStatus: currentState.connectionStatus,
    listeningState: currentState.listeningState,
    microphoneAccess,
    websocketTest,
    networkStats: currentState.networkStats,
    errorStats: currentState.errorStats,
    bufferInfo: currentState.bufferInfo,
    recoveryInfo: currentState.recoveryInfo,
    browserCompatibility,
    errors,
    warnings,
    success
  };

  if (verbose) {
    console.log('📊 Voice Agent Test Results:', results);
    
    if (results.success) {
      console.log('✅ Voice Agent test completed successfully!');
    } else {
      console.log('❌ Voice Agent test failed with errors:', results.errors);
    }
    
    if (results.warnings.length > 0) {
      console.log('⚠️ Warnings:', results.warnings);
    }
  }

  return results;
}

/**
 * Generate a human-readable test report
 */
export function generateTestReport(results: VoiceAgentTestResults): string {
  const lines = [
    '🎯 Voice Agent Test Report',
    '='.repeat(30),
    `📅 Timestamp: ${new Date(results.timestamp).toLocaleString()}`,
    '',
    '🔧 System Status:',
    `   Voice Agent: ${results.voiceAgentAvailable ? '✅ Available' : '❌ Not Available'}`,
    `   Connection: ${results.connectionStatus}`,
    `   Listening: ${results.listeningState}`,
    `   Microphone: ${results.microphoneAccess ? '✅ Accessible' : '❌ Not Accessible'}`,
    `   WebSocket: ${results.websocketTest === 'success' ? '✅ Connected' : results.websocketTest === 'failed' ? '❌ Failed' : '⚠️ Not Tested'}`,
    '',
    '🌐 Browser Compatibility:',
    `   WebSocket: ${results.browserCompatibility.webSocket ? '✅' : '❌'}`,
    `   AudioContext: ${results.browserCompatibility.audioContext ? '✅' : '❌'}`,
    `   MediaDevices: ${results.browserCompatibility.mediaDevices ? '✅' : '❌'}`,
    `   AudioWorklet: ${results.browserCompatibility.audioWorklet ? '✅' : '❌'}`,
    '',
    '📊 Performance Metrics:',
    `   Latency: ${results.networkStats.averageLatency}ms`,
    `   Jitter: ${results.networkStats.jitter}ms`,
    `   Packet Loss: ${results.networkStats.packetLoss}%`,
    `   Buffer: ${results.bufferInfo.size}/${results.bufferInfo.capacity}`,
    `   Errors: ${results.errorStats.totalErrors}`,
    '',
    '🔄 Recovery Status:',
    `   Recovering: ${results.recoveryInfo.isRecovering ? '🔄 Yes' : '✅ No'}`,
    `   Retry Attempt: ${results.recoveryInfo.retryAttempt}/${results.recoveryInfo.maxRetries}`,
  ];

  if (results.errors.length > 0) {
    lines.push('', '❌ Errors:', ...results.errors.map(error => `   • ${error}`));
  }

  if (results.warnings.length > 0) {
    lines.push('', '⚠️ Warnings:', ...results.warnings.map(warning => `   • ${warning}`));
  }

  lines.push('', `Overall Status: ${results.success ? '✅ PASSED' : '❌ FAILED'}`);

  return lines.join('\n');
}

/**
 * Quick test function for UI integration
 */
export async function quickVoiceAgentTest(
  voiceAgent: any,
  testWebSocketConnectionFn?: () => void
): Promise<string> {
  const results = await runVoiceAgentTest(voiceAgent, testWebSocketConnectionFn, {
    testMicrophone: true,
    testWebSocket: true,
    testAudioContext: true,
    testBrowserAPIs: true,
    verbose: false
  });

  return generateTestReport(results);
} 