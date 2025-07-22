# Voice Functionality Testing Guide

This document provides comprehensive testing instructions for the voice functionality in the Dharsan Voice Agent Frontend.

## 🎯 Overview

The voice functionality tests are designed to verify that all voice-related features work correctly and don't break during development. These tests cover:

- **WebSocket Connections**: Connection establishment, message handling, and error recovery
- **Audio Processing**: Voice activity detection, audio capture, and playback
- **Voice Agent Hook**: State management, transcript processing, and AI responses
- **Network Statistics**: Latency, jitter, and packet loss monitoring
- **Error Handling**: Graceful degradation and recovery mechanisms
- **Session Management**: Data persistence and analytics

## 🚀 Quick Start

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Make sure the backend server is running (for integration tests)

### Running Tests

#### 1. Quick API Check (No Dependencies)
```bash
node test-voice.js
```
This runs a basic check of all required browser APIs without requiring Jest setup.

#### 2. Comprehensive Jest Tests
```bash
# Run all tests
npm test

# Run only voice functionality tests
npm run test:voice

# Run tests in watch mode
npm run test:voice:watch

# Run tests with coverage report
npm run test:coverage
```

## 📋 Test Categories

### 1. useVoiceAgent Hook Tests

Tests the main voice agent hook functionality:

- **Initialization**: Default state verification
- **Connection Management**: WebSocket connection lifecycle
- **Voice Activity Detection**: Microphone input processing
- **Transcript Processing**: Interim and final transcript handling
- **AI Response Handling**: Response processing and typing animations
- **Audio Playback**: Continuous audio stream management
- **State Management**: Connection status and listening state transitions

### 2. Network Statistics Tests

Tests network performance monitoring:

- **Latency Calculation**: Average network latency measurement
- **Jitter Analysis**: Network jitter calculation and buffering
- **Packet Loss Detection**: Packet loss estimation and recovery
- **Buffer Management**: Dynamic buffer sizing based on network conditions

### 3. Error Handling Tests

Tests error scenarios and recovery:

- **WebSocket Failures**: Connection error handling and retry logic
- **Audio Context Failures**: Audio API error recovery
- **Network Issues**: Graceful degradation during poor connectivity
- **Resource Cleanup**: Proper cleanup on disconnection

### 4. Voice Activity Detection Tests

Tests voice detection algorithms:

- **Voice Detection**: Accurate voice activity detection
- **Silence Detection**: Proper silence timeout handling
- **Interruption Handling**: User interruption of AI speech
- **Energy Thresholds**: Dynamic energy level processing

### 5. Audio Processing Tests

Tests audio stream handling:

- **Continuous Playback**: Seamless audio chunk processing
- **Audio Interruption**: User interruption during AI speech
- **Buffer Management**: Audio chunk queuing and playback
- **Format Compatibility**: Audio format handling and conversion

### 6. Session Storage Tests

Tests data persistence:

- **Conversation History**: Chat history storage and retrieval
- **Network Statistics**: Performance data persistence
- **Session Analytics**: User interaction tracking

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

- **Environment**: jsdom for browser API simulation
- **TypeScript Support**: ts-jest for TypeScript compilation
- **Coverage**: HTML and LCOV coverage reports
- **Timeout**: 10 seconds per test
- **Setup**: Custom setup file for global mocks

### Test Setup (`src/tests/setup.ts`)

Comprehensive mocking of browser APIs:

- **WebSocket**: Mock WebSocket implementation
- **AudioContext**: Mock audio processing APIs
- **MediaDevices**: Mock microphone access
- **Storage APIs**: Mock sessionStorage and localStorage
- **Performance APIs**: Mock timing and performance measurement
- **DOM APIs**: Mock browser DOM interfaces

## 🧪 Writing New Tests

### Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup test environment
  });

  afterEach(() => {
    // Cleanup after each test
  });

  test('should perform expected behavior', async () => {
    // Test implementation
    const { result } = renderHook(() => useVoiceAgent());
    
    await act(async () => {
      // Perform actions
    });

    await waitFor(() => {
      // Assert expected outcomes
      expect(result.current.someProperty).toBe(expectedValue);
    });
  });
});
```

### Best Practices

1. **Use Descriptive Test Names**: Clear, specific test descriptions
2. **Test One Thing**: Each test should verify a single behavior
3. **Use Async/Await**: Handle asynchronous operations properly
4. **Mock External Dependencies**: Don't rely on external services
5. **Clean Up Resources**: Properly clean up after tests
6. **Use waitFor**: Wait for async state changes

### Mocking Guidelines

```typescript
// Mock WebSocket
const mockWebSocket = new MockWebSocket('ws://localhost:8000/ws');

// Mock Audio Context
const mockAudioContext = new MockAudioContext();

// Mock User Media
const mockGetUserMedia = jest.fn().mockResolvedValue({
  getTracks: () => [{ stop: jest.fn() }]
});
```

## 📊 Coverage Reports

After running tests with coverage:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory:

- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **Console Summary**: Terminal output

### Coverage Targets

- **Statements**: > 80%
- **Branches**: > 70%
- **Functions**: > 80%
- **Lines**: > 80%

## 🐛 Debugging Tests

### Common Issues

1. **Timeout Errors**: Increase test timeout or optimize async operations
2. **Mock Failures**: Ensure proper mock setup in beforeEach
3. **State Issues**: Use act() for state changes and waitFor() for assertions
4. **Cleanup Errors**: Ensure proper cleanup in afterEach

### Debug Mode

Run tests in debug mode:

```bash
# Debug specific test
npm test -- --testNamePattern="specific test name" --verbose

# Debug with console output
npm test -- --verbose --no-coverage
```

### Manual Testing

For manual testing without automated tests:

1. Start the development server: `npm run dev`
2. Open browser developer tools
3. Check console for errors
4. Test voice functionality manually
5. Monitor network tab for WebSocket connections

## 🔄 Continuous Integration

### GitHub Actions (Recommended)

```yaml
name: Voice Functionality Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

Install husky for pre-commit testing:

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npm run test:voice"
```

## 📈 Performance Testing

### Load Testing

For performance testing of voice functionality:

```bash
# Run performance tests
npm run test:performance

# Monitor memory usage
npm run test:memory
```

### Benchmarking

```bash
# Run benchmarks
npm run benchmark

# Compare performance
npm run benchmark:compare
```

## 🚨 Troubleshooting

### Test Failures

1. **Check Dependencies**: Ensure all dependencies are installed
2. **Clear Cache**: Clear Jest cache with `npm test -- --clearCache`
3. **Update Mocks**: Ensure mocks match current implementation
4. **Check Environment**: Verify test environment setup

### Common Error Messages

- **"Cannot read property of undefined"**: Missing mock setup
- **"Timeout of 5000ms exceeded"**: Increase timeout or optimize test
- **"WebSocket is not defined"**: Missing WebSocket mock
- **"AudioContext is not defined"**: Missing AudioContext mock

### Getting Help

1. Check the test logs for detailed error information
2. Review the mock implementations in `setup.ts`
3. Verify the test environment configuration
4. Consult the Jest documentation for advanced debugging

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TypeScript Testing](https://jestjs.io/docs/getting-started#using-typescript)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Note**: These tests are designed to catch regressions in voice functionality. Regular testing ensures that voice features remain stable and reliable across development iterations. 