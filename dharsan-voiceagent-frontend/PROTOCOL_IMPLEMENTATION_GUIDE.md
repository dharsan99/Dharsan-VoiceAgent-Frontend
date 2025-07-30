# Protocol Implementation Guide

## Mode-Specific Protocol Differences

### Event-Driven Mode
- **Primary Protocol**: **gRPC WebSocket**
- **Endpoint**: `ws://34.47.230.178:8001/grpc` (Production)
- **Purpose**: Real-time bidirectional communication for event-driven pipeline
- **Features**: 
  - Structured message passing
  - Type-safe communication
  - Better error handling
  - Protocol buffer encoding

### WHIP WebRTC Mode
- **Primary Protocol**: **Regular WebSocket**
- **Endpoint**: `ws://34.47.230.178:8001/ws` (Production)
- **Purpose**: WebRTC signaling and control for WHIP protocol
- **Features**:
  - Standard WebSocket communication
  - WebRTC peer connection signaling
  - Audio stream handling
  - Session management

## Health Check Implementation

### Fixed Issues
1. **WebSocket Endpoint Testing**: Added proper WebSocket connection testing
2. **Mode-Specific Endpoints**: Correct endpoints for each mode
3. **Protocol Detection**: Automatic detection of WebSocket vs HTTP endpoints

### Health Check Logic
```typescript
// For WebSocket endpoints (gRPC and regular WS)
if (service.endpoint.startsWith('ws://') || service.endpoint.startsWith('wss://')) {
  // Establish WebSocket connection
  const ws = new WebSocket(service.endpoint);
  // Test connection with 5-second timeout
}

// For HTTP endpoints (health checks)
else {
  // Use fetch API for HTTP requests
  const response = await fetch(service.endpoint);
}
```

## Service Endpoints by Mode

### Event-Driven Mode (Production)
| Service | Endpoint | Protocol | Purpose |
|---------|----------|----------|---------|
| Orchestrator | `http://34.47.230.178:8001/health` | HTTP | Health check |
| gRPC WebSocket | `ws://34.47.230.178:8001/grpc` | WebSocket | Real-time communication |

### WHIP WebRTC Mode (Production)
| Service | Endpoint | Protocol | Purpose |
|---------|----------|----------|---------|
| Media Server | `http://35.244.8.62:8001/health` | HTTP | Health check |
| Orchestrator | `http://34.47.230.178:8001/health` | HTTP | Health check |
| WebSocket | `ws://34.47.230.178:8001/ws` | WebSocket | WebRTC signaling |
| WHIP Endpoint | `http://35.244.8.62:8001/whip` | HTTP | WHIP protocol |

## Connection Management

### Updated Connection Utilities
```typescript
export const getEnvironmentUrl = (isProduction: boolean, useEventDriven: boolean = true): string => {
  if (isProduction) {
    return useEventDriven ? 
      PRODUCTION_CONFIG.ORCHESTRATOR_GRPC_URL : 
      PRODUCTION_CONFIG.ORCHESTRATOR_WS_URL;
  } else {
    return useEventDriven ? 
      'ws://localhost:8001/grpc' : 
      'ws://localhost:8001/ws';
  }
};
```

### Hook Integration
```typescript
// Pass mode parameter to connection manager
const connectionManager = useConnectionManager(isProduction, useEventDriven);
```

## Testing Results

### WebSocket Endpoint Accessibility
- ✅ **gRPC WebSocket**: `ws://34.47.230.178:8001/grpc` - Accessible
- ✅ **Regular WebSocket**: `ws://34.47.230.178:8001/ws` - Accessible
- ✅ **HTTP Health**: `http://34.47.230.178:8001/health` - Healthy

### Expected Health Check Results

#### Event-Driven Mode
```
ORCH Orchestrator HEALTHY ✓
gRPC gRPC WebSocket Connection HEALTHY ✓
```

#### WHIP WebRTC Mode
```
MEDIA Media Server HEALTHY ✓
ORCH Orchestrator HEALTHY ✓
WS WebSocket Connection HEALTHY ✓
WHIP WHIP Endpoint HEALTHY ✓
```

## Implementation Notes

### Key Changes Made
1. **HealthCheckModal**: Added WebSocket connection testing
2. **Connection Utils**: Mode-specific endpoint selection
3. **Connection Manager**: Mode parameter integration
4. **Service Icons**: Added gRPC icon mapping

### Error Handling
- **WebSocket Timeout**: 5-second connection timeout
- **HTTP Timeout**: 10-second request timeout
- **Connection Errors**: Proper error categorization
- **Mode Switching**: Dynamic endpoint updates

### Performance Considerations
- **Parallel Health Checks**: All services checked simultaneously
- **Connection Reuse**: WebSocket connections closed after testing
- **Timeout Management**: Appropriate timeouts for different protocols
- **Error Recovery**: Graceful handling of connection failures

## Troubleshooting

### Common Issues
1. **WebSocket Connection Failed**: Check if endpoint is accessible
2. **gRPC Protocol Errors**: Verify gRPC service is running
3. **Mode Mismatch**: Ensure correct endpoints for selected mode
4. **Timeout Issues**: Adjust timeout values if needed

### Debug Commands
```bash
# Test gRPC WebSocket endpoint
curl -s http://34.47.230.178:8001/grpc

# Test regular WebSocket endpoint  
curl -s http://34.47.230.178:8001/ws

# Test health endpoints
curl -s http://34.47.230.178:8001/health
curl -s http://35.244.8.62:8001/health
```

## Conclusion

The health check system now properly handles both Event-Driven (gRPC WebSocket) and WHIP WebRTC (regular WebSocket) modes with:

- ✅ **Correct Protocol Detection**
- ✅ **Mode-Specific Endpoints**
- ✅ **Proper WebSocket Testing**
- ✅ **Comprehensive Error Handling**
- ✅ **Dynamic Mode Switching**

The implementation correctly distinguishes between the two communication protocols and provides accurate health status for each mode. 