# 🔐 Environment Setup and Security Guide

This guide explains how to properly configure environment variables for the Voice Agent Frontend while maintaining security best practices.

## 📋 Overview

The Voice Agent Frontend uses environment variables for configuration, with different settings for development, staging, and production environments. All sensitive files are protected by `.gitignore` to prevent accidental commits.

## 🚨 Security First

### ❌ Never Commit These Files:
- `.env` (any environment file)
- `*.key`, `*.pem`, `*.crt` (SSL certificates)
- `service-account*.json` (Google Cloud credentials)
- `speechtotext-*.json` (STT credentials)
- `*.jwt`, `*.token` (authentication tokens)
- `secrets/` directory
- `k8s/secrets/` directory

### ✅ Safe to Commit:
- `.env.example` files
- `env.production.example`
- Configuration documentation
- Non-sensitive Kubernetes manifests

## 🔧 Environment Setup

### 1. Development Environment

```bash
# Copy the example file
cp env.production.example .env.local

# Edit with your development values
nano .env.local
```

### 2. Production Environment

```bash
# Copy the example file
cp env.production.example .env.production

# Edit with your production values
nano .env.production
```

### 3. Vercel Deployment

For Vercel deployments, set environment variables in the Vercel dashboard:

1. Go to your project in Vercel
2. Navigate to Settings → Environment Variables
3. Add each variable from `.env.production`

## 🔑 Required Environment Variables

### OIDC Configuration (Production)
```bash
VITE_OIDC_ISSUER=https://oidc.vercel.com/dharsan-kumars-projects
VITE_OIDC_AUDIENCE=https://vercel.com/dharsan-kumars-projects
VITE_OIDC_SCOPE=owner:dharsan-kumars-projects:project:dharsan-voice-agent-frontend:environment:production
```

### Backend URLs (Production)
```bash
VITE_BACKEND_URL=https://dharsan-voice-agent-frontend.vercel.app/api/backend
VITE_WEBSOCKET_URL=wss://dharsan-voice-agent-frontend.vercel.app/api/backend/ws
VITE_WHIP_URL=https://dharsan-voice-agent-frontend.vercel.app/api/backend/whip
```

### TURN Server (WebRTC)
```bash
VITE_TURN_USERNAME=your_turn_username_here
VITE_TURN_CREDENTIAL=your_turn_credential_here
```

### Environment Configuration
```bash
NODE_ENV=production
VITE_ENVIRONMENT=production
VITE_APP_VERSION=5.0.0
```

## 🛡️ Security Configuration

### Content Security Policy
```bash
VITE_CONTENT_SECURITY_POLICY=default-src 'self' https: data: blob: 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss: ws: http://34.70.216.41:8001 ws://34.70.216.41:8001;
```

### Strict Transport Security
```bash
VITE_STRICT_TRANSPORT_SECURITY=max-age=31536000; includeSubDomains
```

## 🎛️ Feature Flags

Control application features through environment variables:

```bash
VITE_ENABLE_DEBUG=false
VITE_ENABLE_METRICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_AUDIO_LEVEL_METER=true
VITE_ENABLE_PHASE_TIMINGS=true
```

## 🔊 Audio Configuration

```bash
VITE_AUDIO_SAMPLE_RATE=16000
VITE_AUDIO_CHANNELS=1
VITE_AUDIO_BIT_DEPTH=16
VITE_AUDIO_CHUNK_SIZE=4096
```

## 🔌 WebSocket Configuration

```bash
VITE_WEBSOCKET_RECONNECT_ATTEMPTS=5
VITE_WEBSOCKET_RECONNECT_DELAY=1000
VITE_WEBSOCKET_HEARTBEAT_INTERVAL=30000
```

## 🤖 AI Service Configuration

```bash
VITE_STT_MODEL=latest_long
VITE_LLM_MODEL=gemini-1.5-flash
VITE_TTS_VOICE=en-US-Neural2-A
VITE_TTS_LANGUAGE=en-US
```

## ⚡ Performance Configuration

```bash
VITE_MAX_AUDIO_CHUNKS=1000
VITE_AUDIO_BUFFER_SIZE=8192
VITE_PIPELINE_TIMEOUT=30000
```

## 🔄 Development Overrides

For testing production backend from localhost:

```bash
# Uncomment these lines in .env.local
VITE_FORCE_PRODUCTION=true
VITE_OVERRIDE_BACKEND_URL=https://dharsan-voice-agent-frontend.vercel.app/api/backend
VITE_OVERRIDE_WEBSOCKET_URL=wss://dharsan-voice-agent-frontend.vercel.app/api/backend/ws
```

## 🧪 Testing Environment Variables

### 1. Check Environment Loading
```javascript
// In your component
console.log('Environment:', import.meta.env.VITE_ENVIRONMENT);
console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
```

### 2. Validate Required Variables
```javascript
const requiredVars = [
  'VITE_BACKEND_URL',
  'VITE_WEBSOCKET_URL',
  'VITE_TURN_USERNAME',
  'VITE_TURN_CREDENTIAL'
];

requiredVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
  }
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure file is named correctly (`.env.local`, `.env.production`)
   - Restart development server after changes
   - Check Vite configuration

2. **CORS Errors**
   - Verify CSP configuration
   - Check backend URL format
   - Ensure HTTPS/WSS for production

3. **WebSocket Connection Failed**
   - Check WebSocket URL format
   - Verify backend availability
   - Check firewall settings

4. **OIDC Authentication Failed**
   - Verify OIDC configuration
   - Check token expiration
   - Validate issuer and audience

### Debug Commands

```bash
# Check environment variables
npm run dev -- --debug

# Validate configuration
npm run build

# Check for missing variables
grep -r "VITE_" src/ | grep -v "import.meta.env"
```

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OIDC Best Practices](https://openid.net/connect/)

## 🔒 Security Checklist

- [ ] No `.env` files committed to repository
- [ ] All secrets in `.gitignore`
- [ ] Environment variables set in Vercel
- [ ] CSP headers configured
- [ ] HTTPS/WSS used in production
- [ ] OIDC tokens properly configured
- [ ] TURN credentials secured
- [ ] Debug mode disabled in production

---

**Remember**: Security is everyone's responsibility. When in doubt, don't commit sensitive files! 🔐 