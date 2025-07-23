# Voice Agent Frontend Testing Documentation

## Overview

This document provides comprehensive information about the testing suite for the Voice Agent Frontend application. The test suite covers React components, custom hooks, voice functionality, and integration testing.

## Test Suite Structure

### 1. Basic Tests (`basic.test.ts`)
- **Purpose**: Verify basic environment setup and browser API availability
- **Tests**: 5 tests
- **Coverage**: WebSocket, AudioContext, AudioWorkletNode, MediaDevices availability

### 2. Component Tests (`componentTests.test.tsx`)
- **Purpose**: Test React component rendering, user interactions, and accessibility
- **Tests**: 22 tests
- **Coverage**: 
  - VoiceAgentV2 component functionality
  - WordHighlightDisplay component
  - DebugInfo component
  - User interaction flows
  - Accessibility features

### 3. Hook Tests (`hookTests.test.tsx`)
- **Purpose**: Test custom React hooks, especially useVoiceAgent
- **Tests**: 24 tests
- **Coverage**:
  - Initial state validation
  - Connection management
  - Transcript handling
  - AI response processing
  - Voice activity detection
  - Network statistics
  - Error handling and recovery

### 4. Voice Functionality Tests (`voiceFunctionality.test.ts`)
- **Purpose**: Test core voice processing and WebSocket communication
- **Tests**: 47 tests (currently has TypeScript issues)
- **Coverage**:
  - Audio context initialization
  - Microphone access
  - AudioWorkletNode communication
  - WebSocket connection and messaging
  - Audio playback
  - Voice activity detection
  - Error handling and recovery
  - Performance monitoring

### 5. Integration Tests (`voiceIntegration.test.ts`)
- **Purpose**: End-to-end testing with real backend (when available)
- **Tests**: 6 tests (conditional on backend availability)
- **Coverage**:
  - Real backend connection
  - Live audio input processing
  - WebSocket message handling
  - Network latency simulation
  - Connection interruption handling
  - Audio playback interruption

## Running Tests

### Available Test Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test categories
npm run test:basic          # Basic environment tests
npm run test:components     # React component tests
npm run test:hooks          # Custom hook tests
npm run test:voice          # Voice functionality tests
npm run test:integration    # Integration tests

# Run tests for CI/CD
npm run test:ci             # Optimized for CI environments
```

### Test Commands Explained

- `npm test`: Runs all tests once
- `npm run test:watch`: Runs tests in watch mode for development
- `npm run test:coverage`: Generates coverage reports
- `npm run test:voice`: Runs voice-specific functionality tests
- `npm run test:ci`: Runs tests optimized for continuous integration

## Test Configuration

### Jest Configuration (`jest.config.js`)
- **Environment**: jsdom (simulates browser environment)
- **Preset**: ts-jest (TypeScript support)
- **Setup**: `src/tests/setup.ts` (global mocks and configuration)
- **Coverage**: HTML, LCOV, and text reports
- **Timeout**: 10 seconds per test

### TypeScript Configuration (`tsconfig.test.json`)
- **Module**: ESNext
- **Target**: ES2022
- **Types**: Jest, Node
- **JSX**: React-JSX

## Mocking Strategy

### Browser APIs Mocked
- **WebSocket**: Simulated connection, messaging, and error handling
- **AudioContext**: Mocked audio processing context
- **AudioWorkletNode**: Simulated audio worklet communication
- **MediaDevices**: Mocked microphone access
- **Audio**: Simulated audio playback
- **SessionStorage**: Mocked storage for test data
- **Performance**: Mocked timing functions

### React Testing Library
- **render**: Component rendering
- **screen**: Element queries
- **fireEvent**: User interaction simulation
- **waitFor**: Asynchronous test assertions
- **userEvent**: Advanced user interaction simulation

## Test Coverage Goals

### Current Coverage
- **Basic Tests**: 100% (5/5 passing)
- **Component Tests**: 100% (22/22 passing)
- **Hook Tests**: 100% (24/24 passing)
- **Voice Functionality**: 0% (TypeScript compilation issues)
- **Integration Tests**: Conditional (requires backend)

### Target Coverage
- **Overall**: >90%
- **Components**: >95%
- **Hooks**: >95%
- **Utilities**: >90%
- **Integration**: >80% (when backend available)

## Debugging Tests

### Common Issues

1. **TypeScript Errors**: Some tests have strict typing issues
2. **Mock Configuration**: Ensure mocks are properly set up
3. **Async Operations**: Use `waitFor` for asynchronous assertions
4. **Component State**: Reset state between tests

### Debugging Commands

```bash
# Run specific test file with verbose output
npm test -- --verbose src/tests/componentTests.test.tsx

# Run single test
npm test -- --testNamePattern="should render with initial state"

# Debug with console output
npm test -- --verbose --no-coverage
```

## Integration Testing

### Backend Requirements
- Backend server running on configured WebSocket URL
- Health endpoint available at `/health`
- WebSocket endpoint at `/ws`

### Environment Variables
```bash
INTEGRATION_TEST_ENABLED=true
VITE_WEBSOCKET_URL=ws://localhost:8000/ws
```

### Running Integration Tests
```bash
# Check backend availability
npm run test:integration

# Run with backend check
INTEGRATION_TEST_ENABLED=true npm test
```

## Test Utilities

### Custom Test Helpers
- **Mock Classes**: Enhanced mock implementations for browser APIs
- **Test Data**: Predefined test data for consistent testing
- **Assertion Helpers**: Custom assertion functions for voice-specific tests

### Mock Classes Available
- `MockWebSocket`: Enhanced WebSocket with simulation methods
- `MockAudioContext`: Audio context with mock methods
- `MockAudioWorkletNode`: Audio worklet with message simulation
- `MockAudio`: Audio element with event simulation

## Best Practices

### Writing Tests
1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear test descriptions
3. **Isolation**: Each test should be independent
4. **Mocking**: Mock external dependencies
5. **Async Handling**: Properly handle asynchronous operations

### Test Organization
1. **Group Related Tests**: Use describe blocks for organization
2. **Setup/Teardown**: Use beforeEach/afterEach for cleanup
3. **Shared State**: Avoid shared state between tests
4. **Error Boundaries**: Test error scenarios

## Continuous Integration

### CI/CD Pipeline
- **Pre-commit**: Run basic tests
- **Pull Request**: Run full test suite with coverage
- **Deploy**: Run integration tests (if backend available)

### Coverage Reports
- **HTML**: Detailed coverage report in `coverage/` directory
- **LCOV**: Coverage data for CI tools
- **Console**: Summary output in terminal

## Troubleshooting

### Common Problems

1. **TypeScript Compilation Errors**
   - Check `tsconfig.test.json` configuration
   - Ensure proper type imports
   - Use proper type assertions

2. **Mock Not Working**
   - Verify mock setup in `setup.ts`
   - Check mock implementation
   - Ensure mocks are reset between tests

3. **Async Test Failures**
   - Use `waitFor` for async assertions
   - Increase timeout if needed
   - Check for proper cleanup

4. **Component Test Issues**
   - Verify component imports
   - Check for missing dependencies
   - Ensure proper mock setup

### Getting Help
- Check test output for specific error messages
- Review mock implementations
- Consult Jest and React Testing Library documentation
- Check TypeScript configuration

## Future Improvements

### Planned Enhancements
1. **Fix TypeScript Issues**: Resolve compilation errors in voice functionality tests
2. **Enhanced Mocking**: Improve mock implementations
3. **Performance Testing**: Add performance benchmarks
4. **Visual Testing**: Add visual regression tests
5. **E2E Testing**: Add end-to-end test scenarios

### Test Expansion
1. **More Component Tests**: Additional component scenarios
2. **Edge Cases**: Test error conditions and edge cases
3. **Accessibility**: Enhanced accessibility testing
4. **Performance**: Performance regression testing
5. **Security**: Security-focused test scenarios 