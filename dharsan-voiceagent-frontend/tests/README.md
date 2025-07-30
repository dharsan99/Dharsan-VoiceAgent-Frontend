# Tests Directory

This directory contains all test files, test scripts, and test data for the Voice Agent Frontend.

## 📋 Test Files Index

### 🧪 HTML Test Files
- **[test-debug-toggle.html](./test-debug-toggle.html)** - Debug toggle functionality testing
- **[test-websocket-connection.html](./test-websocket-connection.html)** - WebSocket connection testing
- **[test-voice-agent-local.html](./test-voice-agent-local.html)** - Local voice agent testing
- **[test-whip-implementation.html](./test-whip-implementation.html)** - WHIP implementation testing
- **[test-phase2-end-to-end.html](./test-phase2-end-to-end.html)** - Phase 2 end-to-end testing
- **[test-phase2-cors-fixed.html](./test-phase2-cors-fixed.html)** - CORS-fixed Phase 2 testing
- **[test-phase2-comprehensive.html](./test-phase2-comprehensive.html)** - Comprehensive Phase 2 testing
- **[test-phase2-integration.html](./test-phase2-integration.html)** - Phase 2 integration testing
- **[test-v2phase2.html](./test-v2phase2.html)** - V2 Phase 2 testing
- **[test-whip-connection.html](./test-whip-connection.html)** - WHIP connection testing
- **[test-webrtc-basic.html](./test-webrtc-basic.html)** - Basic WebRTC testing
- **[test-frontend-integration.html](./test-frontend-integration.html)** - Frontend integration testing
- **[test-voice-audio.html](./test-voice-audio.html)** - Voice audio functionality testing
- **[test-voice-processing.html](./test-voice-processing.html)** - Voice processing testing
- **[test-voice-simple.html](./test-voice-simple.html)** - Simple voice testing
- **[test-backend.html](./test-backend.html)** - Backend connection testing

### 🔧 JavaScript Test Files
- **[test-voice.js](./test-voice.js)** - Voice functionality JavaScript testing

### 🐍 Python Test Files
- **[test-phase2-backend.py](./test-phase2-backend.py)** - Phase 2 backend testing

### 📊 Test Data
- **[phase2-backend-test-results.json](./phase2-backend-test-results.json)** - Phase 2 backend test results

## 📖 How to Use

### For HTML Tests
```bash
# Open HTML test files in browser
open tests/test-debug-toggle.html
open tests/test-websocket-connection.html
# ... etc
```

### For JavaScript Tests
```bash
# Run JavaScript tests
node tests/test-voice.js
```

### For Python Tests
```bash
# Run Python tests
python tests/test-phase2-backend.py
```

## 🧪 Test Categories

### Unit Tests
- Component functionality tests
- Utility function tests
- Hook tests

### Integration Tests
- API integration tests
- Component interaction tests
- Pipeline integration tests

### End-to-End Tests
- User workflow tests
- Cross-browser tests
- Performance tests

### Manual Tests
- UI/UX validation
- Accessibility testing
- Cross-device testing

## ⚠️ Testing Guidelines

### Before Running Tests
1. Ensure all dependencies are installed
2. Set up proper environment variables
3. Start required services (backend, databases)
4. Check network connectivity

### During Testing
1. Monitor browser console for errors
2. Check network tab for failed requests
3. Validate test results against expected outcomes
4. Document any issues or failures

### After Testing
1. Clean up test data
2. Reset environment if needed
3. Document test results
4. Report any critical issues

## 🔗 Related Resources

- **[Testing Documentation](../docs/testing/)** - Testing strategies and procedures
- **[Implementation Documentation](../docs/implementation/)** - Feature implementation details
- **[Scripts Directory](../scripts/)** - Testing utility scripts

## 🛡️ Security Notes

- Test files may contain sensitive endpoints
- Use test environment for all testing
- Don't commit test credentials
- Follow security best practices during testing 