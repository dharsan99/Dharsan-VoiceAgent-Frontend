# Cloudflare SSL Solution for Voice Agent Backend

## Problem Summary
The frontend was experiencing SSL certificate errors (`ERR_CERT_AUTHORITY_INVALID`) due to self-signed certificates. We need to use proper SSL certificates for production.

## Solution: Cloudflare Proxy with SSL Termination

### **Architecture Overview**
```
Frontend (Vercel) → Cloudflare (SSL) → LoadBalancer (HTTP) → Backend (HTTP)
```

### **Benefits of This Approach**
- ✅ **No Certificate Management**: Cloudflare handles SSL certificates
- ✅ **Free SSL**: Cloudflare provides free SSL certificates
- ✅ **Better Performance**: Cloudflare CDN and caching
- ✅ **DDoS Protection**: Built-in Cloudflare protection
- ✅ **Simple Setup**: No need to manage certificates on backend

## Step-by-Step Setup

### **Step 1: Backend Configuration (Complete)**
- ✅ Backend running HTTP internally
- ✅ LoadBalancer IP: `34.67.60.98:80`
- ✅ CORS configured for Cloudflare domains
- ✅ Health check working: `curl http://34.67.60.98:80/health`

### **Step 2: Cloudflare DNS Configuration**

1. **Go to Cloudflare Dashboard**
   - Navigate to your domain: `groundedai.in`
   - Go to **DNS** section

2. **Add DNS Records**
   ```
   Type: A
   Name: api
   Content: 34.67.60.98
   Proxy status: Proxied (Orange Cloud)
   TTL: Auto
   ```

3. **Add WebSocket Subdomain (Optional)**
   ```
   Type: A
   Name: ws
   Content: 34.67.60.98
   Proxy status: Proxied (Orange Cloud)
   TTL: Auto
   ```

### **Step 3: Cloudflare SSL/TLS Configuration**

1. **Go to SSL/TLS Settings**
   - Set **Encryption mode** to: `Full (strict)`
   - Enable **Always Use HTTPS**
   - Enable **Minimum TLS Version**: `1.2`

2. **Edge Certificates**
   - Your existing Cloudflare SSL certificates will be used
   - No additional configuration needed

### **Step 4: Update Frontend Environment Variables**

Set these environment variables in your Vercel deployment:

```bash
# Backend Service URLs (HTTPS via Cloudflare)
VITE_WEBSOCKET_URL=wss://api.groundedai.in/ws
VITE_BACKEND_URL=https://api.groundedai.in
VITE_WHIP_URL=https://api.groundedai.in/whip

# Service URLs
VITE_STT_SERVICE_URL=https://api.groundedai.in/stt
VITE_TTS_SERVICE_URL=https://api.groundedai.in/tts
VITE_LLM_SERVICE_URL=https://api.groundedai.in/llm

# Environment
VITE_ENVIRONMENT=production

# TURN Server Credentials
VITE_TURN_USERNAME=10f1dfa42670d72b3a31482a
VITE_TURN_CREDENTIAL=FvFd4gNrt9+OZk4r
```

### **Step 5: Cloudflare Page Rules (Optional)**

Create page rules for better performance:

1. **WebSocket Optimization**
   ```
   URL: api.groundedai.in/ws*
   Settings:
   - Cache Level: Bypass
   - SSL: Full (strict)
   ```

2. **API Caching**
   ```
   URL: api.groundedai.in/*
   Settings:
   - Cache Level: Standard
   - Edge Cache TTL: 2 hours
   ```

## Testing the Setup

### **1. Test HTTP Backend (Direct)**
```bash
curl http://34.67.60.98:80/health
```

### **2. Test HTTPS via Cloudflare**
```bash
curl https://api.groundedai.in/health
```

### **3. Test WebSocket Connection**
```javascript
const ws = new WebSocket('wss://api.groundedai.in/ws');
ws.onopen = () => console.log('Connected!');
ws.onerror = (error) => console.error('Error:', error);
```

## Current Status

- ✅ **Backend**: HTTP running on `34.67.60.98:80`
- ✅ **LoadBalancer**: External access configured
- ✅ **Health Check**: Backend responding correctly
- 🔄 **Cloudflare DNS**: Needs to be configured
- 🔄 **Frontend Config**: Needs environment variable update

## Next Steps

1. **Configure Cloudflare DNS** with the new LoadBalancer IP
2. **Update Vercel environment variables** with Cloudflare URLs
3. **Deploy frontend** with new configuration
4. **Test WebSocket connections** via Cloudflare

## Troubleshooting

### **DNS Not Resolving**
1. Check Cloudflare DNS records are correct
2. Verify proxy status is enabled (orange cloud)
3. Wait for DNS propagation (up to 24 hours)

### **SSL Certificate Errors**
1. Ensure Cloudflare proxy is enabled
2. Check SSL/TLS mode is set to "Full (strict)"
3. Verify domain is using Cloudflare nameservers

### **WebSocket Connection Fails**
1. Check Cloudflare WebSocket support is enabled
2. Verify CORS headers are properly configured
3. Test direct HTTP connection first

### **Performance Issues**
1. Enable Cloudflare caching for static resources
2. Configure appropriate page rules
3. Monitor Cloudflare analytics

## Security Considerations

- **CORS**: Properly configured for Cloudflare domains
- **SSL**: Cloudflare handles certificate management
- **DDoS Protection**: Built-in Cloudflare protection
- **Rate Limiting**: Can be configured in Cloudflare

## Cost Optimization

- **Free SSL**: Cloudflare provides free SSL certificates
- **CDN**: Free Cloudflare CDN included
- **DDoS Protection**: Free tier includes basic protection
- **Analytics**: Basic analytics included in free tier 