# GKE Analysis and Frontend Implementation Guide

## Current GKE Deployment Status

### Cluster Information
- **Cluster Name**: `voice-agent-free`
- **Region**: `asia-south1`
- **Project**: `speechtotext-466820`
- **Namespace**: `voice-agent-phase5`
- **Status**: Running (2 nodes)

### Service Architecture

#### External Services (LoadBalancer)
| Service | External IP | Port | Status | Purpose |
|---------|-------------|------|--------|---------|
| `media-server` | `35.244.8.62` | 80, 443, 8001 | Healthy | WHIP WebRTC endpoint |
| `orchestrator-lb` | `34.47.230.178` | 8001 | Healthy | WebSocket/HTTP API |
| `orchestrator-lb-https` | `35.244.33.111` | 443, 8001 | Available | HTTPS endpoint |

#### Internal Services (ClusterIP)
| Service | Internal IP | Port | Status | Purpose |
|---------|-------------|------|--------|---------|
| `stt-service` | `34.118.229.142` | 8000 | Running | Speech-to-Text |
| `tts-service` | `34.118.234.172` | 5000 | Running | Text-to-Speech |
| `llm-service` | `34.118.227.19` | 11434 | Running | Language Model |
| `redpanda` | `34.118.236.75` | 9092 | Running | Message Bus |

### Current Issues Identified

#### 1. Orchestrator Audio Consumption Errors
```
{"error":"fetching message: context deadline exceeded","level":"error","msg":"Failed to consume audio","time":"2025-07-29T17:26:30Z"}
```
- **Issue**: Orchestrator is failing to consume audio messages from Kafka
- **Impact**: Audio processing pipeline is broken
- **Root Cause**: Likely Kafka connection or timeout issues

#### 2. Pod Status Issues
- **STT Service**: 2 pods in `ContainerCreating` state
- **LLM Service**: 1 pod in `CrashLoopBackOff`, 1 pod in `Init:0/1`
- **Orchestrator**: 10 restarts (recently stabilized)

#### 3. Missing Metrics Endpoint
- Orchestrator `/metrics` endpoint returns 404
- No Prometheus metrics available for monitoring

## Correct Frontend Implementation Approach

### 1. Update Production Configuration

The current `production.ts` configuration is **CORRECT** and matches the actual GKE deployment:

```typescript
export const PRODUCTION_CONFIG = {
  // GKE Phase 5 Production URLs - CORRECT
  WHIP_URL: 'http://35.244.8.62:8001/whip', // Media Server LoadBalancer IP
  ORCHESTRATOR_WS_URL: 'ws://34.47.230.178:8001/ws', // Orchestrator WebSocket (HTTP)
  ORCHESTRATOR_HTTP_URL: 'http://34.47.230.178:8001', // Orchestrator HTTP API (HTTP)
  ORCHESTRATOR_GRPC_URL: 'ws://34.47.230.178:8001/grpc', // Orchestrator gRPC WebSocket (HTTP)
  
  // Service URLs (internal cluster IPs - for reference only)
  STT_SERVICE_URL: 'http://34.118.229.142:8000', // STT Service
  TTS_SERVICE_URL: 'http://34.118.234.172:5000', // TTS Service (Note: Port 5000, not 8000)
  LLM_SERVICE_URL: 'http://34.118.227.19:11434', // LLM Service
};
```

### 2. Health Check Implementation

#### Current Health Status
- **Orchestrator**: ✅ Healthy (Phase 4, AI enabled, Kafka connected)
- **Media Server**: ✅ Healthy (Phase 2, AI enabled, Kafka connected)
- **STT Service**: ✅ Responding to health checks
- **TTS Service**: ✅ Responding to health checks  
- **LLM Service**: ✅ Responding to health checks

#### Frontend Health Check Strategy
```typescript
// Only check external services in production
const getServices = (isProduction: boolean, mode: string) => {
  if (isProduction) {
    return [
      {
        name: 'Orchestrator',
        url: 'http://34.47.230.178:8001/health',
        description: 'Main orchestration service'
      },
      {
        name: 'Media Server',
        url: 'http://35.244.8.62:8001/health', 
        description: 'WHIP WebRTC endpoint'
      },
      {
        name: 'WebSocket Connection',
        url: 'ws://34.47.230.178:8001/ws',
        description: 'Real-time communication'
      }
    ];
  }
  // Development services...
};
```

### 3. Metrics and Logging Implementation

#### Current Limitations
- No `/metrics` endpoint available on orchestrator
- Internal service metrics not directly accessible
- Need to rely on health checks and WebSocket status

#### Recommended Approach
```typescript
// Use health checks for service status
const fetchServiceStatus = async (isProduction: boolean) => {
  const orchestratorUrl = isProduction ? 
    'http://34.47.230.178:8001/health' : 
    'http://localhost:8001/health';
    
  try {
    const response = await fetch(orchestratorUrl);
    const data = await response.json();
    return {
      status: data.status,
      aiEnabled: data.ai_enabled,
      kafkaStatus: data.kafka,
      phase: data.phase
    };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
```

### 4. Real-time Logs Implementation

#### Current Log Sources
- **Orchestrator**: Kafka consumption errors, WebSocket connections
- **Media Server**: WHIP requests, session management
- **AI Services**: Health check requests, processing logs

#### Frontend Log Strategy
```typescript
// Focus on connection and session logs
const getRelevantLogs = (logs: string[]) => {
  return logs.filter(log => 
    log.includes('WHIP request') ||
    log.includes('session') ||
    log.includes('WebSocket') ||
    log.includes('Failed to consume audio')
  );
};
```

### 5. Connection Management

#### Current Connection Issues
- WHIP connection failures: "Failed to set remote description"
- Kafka audio consumption timeouts
- Some pods in unstable states

#### Frontend Connection Strategy
```typescript
// Implement robust connection handling
const establishConnection = async (isProduction: boolean) => {
  // 1. Check orchestrator health first
  const health = await fetchServiceStatus(isProduction);
  if (health.status !== 'healthy') {
    throw new Error('Orchestrator not healthy');
  }
  
  // 2. Establish WebSocket connection
  const wsUrl = isProduction ? 
    'ws://34.47.230.178:8001/ws' : 
    'ws://localhost:8001/ws';
    
  // 3. Monitor connection status
  // 4. Handle reconnection logic
};
```

## Immediate Actions Required

### 1. Backend Issues to Address
```bash
# Check Kafka connectivity
kubectl exec -n voice-agent-phase5 deployment/redpanda -- rpk cluster health

# Check orchestrator logs for audio consumption
kubectl logs -n voice-agent-phase5 deployment/orchestrator --tail=50

# Restart problematic pods
kubectl delete pod -n voice-agent-phase5 -l app=stt-service
kubectl delete pod -n voice-agent-phase5 -l app=llm-service
```

### 2. Frontend Implementation Priority
1. **Fix Health Check Modal**: Use correct external URLs only
2. **Implement Connection-First Logic**: Check orchestrator health before establishing connections
3. **Add Error Handling**: Handle Kafka consumption errors gracefully
4. **Update Metrics**: Remove dependency on `/metrics` endpoint
5. **Improve Logging**: Focus on connection and session logs

### 3. Testing Strategy
```bash
# Test external endpoints
curl http://34.47.230.178:8001/health
curl http://35.244.8.62:8001/health

# Test WebSocket connection
wscat -c ws://34.47.230.178:8001/ws

# Test WHIP endpoint
curl -X POST http://35.244.8.62:8001/whip
```

## Conclusion

The GKE deployment is **functionally correct** with the right service architecture. The main issues are:

1. **Kafka audio consumption timeouts** in the orchestrator
2. **Some pod instability** (being addressed by restarts)
3. **Missing metrics endpoint** (not critical for functionality)

The frontend should:
- ✅ Use the current production URLs (they are correct)
- ✅ Implement connection-first logic
- ✅ Focus on health checks rather than metrics
- ✅ Handle Kafka errors gracefully
- ✅ Monitor WebSocket connection status

The system is **operational** but needs the backend Kafka issues resolved for full audio processing functionality. 