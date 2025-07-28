# Production Configuration for GKE Phase 4

## 🌐 Service URLs

### External Access (LoadBalancer)
- **Media Server**: `http://34.100.152.11`
- **WHIP Endpoint**: `http://34.100.152.11/whip`
- **Orchestrator WebSocket**: `ws://35.200.224.194:8001/ws`
- **Orchestrator HTTP**: `http://35.200.224.194:8001`

### Internal Service URLs (Cluster IPs)
- **STT Service**: `http://34.118.225.134:8000`
- **TTS Service**: `http://34.118.231.181:5000`
- **LLM Service**: `http://34.118.234.222:11434`

## 🔧 Configuration Updates

### Frontend Configuration
The frontend has been updated to automatically detect the environment and use the appropriate URLs:

1. **Production Environment**: Uses GKE LoadBalancer IPs
2. **Development Environment**: Uses localhost URLs

### Updated Files
- `src/config/production.ts` - Production configuration
- `src/hooks/useVoiceAgentWHIP_fixed.ts` - Updated to use production URLs
- `src/hooks/useVoiceAgentV2.ts` - Updated to use production URLs
- `src/hooks/useVoiceAgentWebRTC.ts` - Updated to use production URLs

### Environment Detection
The frontend automatically detects the environment based on the hostname:
- `localhost` or `127.0.0.1` → Development URLs
- Any other hostname → Production URLs

## 🚀 Deployment Instructions

### 1. Build for Production
```bash
npm run build
```

### 2. Deploy to Production
The frontend can be deployed to any static hosting service (Vercel, Netlify, etc.) or served from the GKE LoadBalancer.

### 3. DNS Configuration
Configure your domain to point to the LoadBalancer IP:
```
media.your-domain.com → 34.100.152.11
```

## 🔍 Testing

### Test WHIP Connection
```javascript
// Test WHIP endpoint
fetch('http://34.100.152.11/whip', {
  method: 'POST',
  headers: { 'Content-Type': 'application/sdp' },
  body: 'v=0\r\no=- 0 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n...'
});
```

### Test WebSocket Connection
```javascript
// Test orchestrator WebSocket
const ws = new WebSocket('ws://34.100.152.11:8001/ws');
ws.onopen = () => console.log('Connected to orchestrator');
```

## 📊 Status
- ✅ Media Server: Running (LoadBalancer IP: 34.100.152.11)
- ✅ Orchestrator: Running (LoadBalancer IP: 35.200.224.194)
- ✅ STT Service: Running
- ✅ TTS Service: Running
- ✅ Redpanda: Running
- ⚠️ LLM Service: Pending (resource constraints)

## 🔧 Troubleshooting

### Connection Issues
1. Check if the LoadBalancer IP is accessible
2. Verify firewall rules allow HTTP/HTTPS traffic
3. Check service logs in GKE

### WebSocket Issues
1. Ensure WebSocket connections are allowed through the LoadBalancer
2. Check if the orchestrator service is running
3. Verify the WebSocket URL format

### Audio Issues
1. Check if the WHIP endpoint is responding
2. Verify ICE server configuration
3. Check browser console for WebRTC errors 