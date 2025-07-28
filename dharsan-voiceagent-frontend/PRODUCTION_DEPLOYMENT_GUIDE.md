# Production Deployment Guide - Voice Agent Phase 2

## 🚀 **Production Deployment Overview**

This guide covers the complete deployment of the Voice Agent Phase 2 system to production Kubernetes infrastructure.

### **✅ System Components**
- **Frontend**: React application with WHIP client
- **Media Server**: Go-based WebRTC server with WHIP protocol
- **Orchestrator**: Go-based AI pipeline with Google AI services
- **Redpanda**: Kafka-compatible message bus
- **Monitoring**: Prometheus for metrics collection

---

## 📋 **Prerequisites**

### **Required Tools**
- ✅ **kubectl**: Kubernetes command-line tool
- ✅ **Docker**: Container runtime
- ✅ **Kubernetes Cluster**: Production-ready cluster
- ✅ **API Keys**: Google AI services credentials

### **Cluster Requirements**
- **CPU**: Minimum 4 cores, recommended 8+ cores
- **Memory**: Minimum 8GB, recommended 16GB+
- **Storage**: Minimum 20GB, recommended 50GB+
- **Network**: Stable internet connection for API calls

---

## 🏗️ **Deployment Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Media Server  │    │   Orchestrator  │
│   (React)       │◄──►│   (Go)          │◄──►│   (Go)          │
│   Port: 80      │    │   Port: 8080    │    │   Port: 8001    │
│   Nginx         │    │   WHIP Protocol │    │   AI Pipeline   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ingress       │    │   Redpanda      │    │   Prometheus    │
│   Controller    │    │   (Kafka)       │    │   Monitoring    │
│   SSL/TLS       │    │   Message Bus   │    │   Metrics       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🚀 **Quick Deployment**

### **Step 1: Prepare Environment**
```bash
# Navigate to frontend directory
cd Dharsan-VoiceAgent-Frontend/dharsan-voiceagent-frontend

# Ensure you're connected to Kubernetes cluster
kubectl cluster-info

# Check prerequisites
./deploy-production.sh --check
```

### **Step 2: Configure Secrets**
```bash
# Edit the secrets file
nano k8s-secrets.yaml

# Add your API keys (base64 encoded)
# GOOGLE_APPLICATION_CREDENTIALS: <base64-encoded-json>
# OPENAI_API_KEY: <base64-encoded-key>

# Apply secrets
kubectl apply -f k8s-secrets.yaml
```

### **Step 3: Deploy System**
```bash
# Run the deployment script
./deploy-production.sh
```

### **Step 4: Access Application**
```bash
# Add to /etc/hosts (or configure DNS)
echo "127.0.0.1 voice-agent.local" | sudo tee -a /etc/hosts

# Access the application
open http://voice-agent.local
```

---

## 📊 **Deployment Details**

### **Namespace Configuration**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: voice-agent-production
  labels:
    name: voice-agent-production
    phase: production
    version: v2
```

### **Resource Allocation**
| Service | CPU Request | CPU Limit | Memory Request | Memory Limit | Replicas |
|---------|-------------|-----------|----------------|--------------|----------|
| **Frontend** | 100m | 200m | 128Mi | 256Mi | 3-15 |
| **Media Server** | 250m | 500m | 256Mi | 512Mi | 2-10 |
| **Orchestrator** | 500m | 1000m | 512Mi | 1Gi | 2-10 |
| **Redpanda** | 250m | 500m | 512Mi | 1Gi | 1 |
| **Prometheus** | 100m | 200m | 256Mi | 512Mi | 1 |

### **Auto-scaling Configuration**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 🔧 **Configuration Management**

### **Environment Variables**
```bash
# Media Server
KAFKA_BROKERS=redpanda:9092
LOG_LEVEL=info

# Orchestrator
KAFKA_BROKERS=redpanda:9092
LOG_LEVEL=info
GOOGLE_APPLICATION_CREDENTIALS=/secrets/google-credentials.json
OPENAI_API_KEY=your-openai-key
```

### **Secrets Management**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: voice-agent-secrets
type: Opaque
data:
  GOOGLE_APPLICATION_CREDENTIALS: <base64-encoded>
  OPENAI_API_KEY: <base64-encoded>
  REDIS_PASSWORD: <base64-encoded>
```

---

## 🌐 **Network Configuration**

### **Ingress Rules**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
spec:
  rules:
  - host: voice-agent.local
    http:
      paths:
      - path: /
        backend:
          service:
            name: frontend
            port: 80
      - path: /api
        backend:
          service:
            name: orchestrator
            port: 8001
      - path: /ws
        backend:
          service:
            name: orchestrator
            port: 8001
      - path: /whip
        backend:
          service:
            name: media-server
            port: 8080
```

### **Service Configuration**
```yaml
apiVersion: v1
kind: Service
spec:
  ports:
  - port: 80
    targetPort: 80
    name: http
  selector:
    app: frontend
```

---

## 📈 **Monitoring & Observability**

### **Prometheus Configuration**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'voice-agent-services'
      static_configs:
      - targets: ['media-server:8080', 'orchestrator:8001', 'frontend:80']
      metrics_path: /metrics
```

### **Health Checks**
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 🔒 **Security Configuration**

### **Network Policies**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: voice-agent-network-policy
spec:
  podSelector:
    matchLabels:
      app: voice-agent
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: voice-agent-production
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 8080
    - protocol: TCP
      port: 8001
```

### **RBAC Configuration**
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: voice-agent-role
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch"]
```

---

## 🚀 **Deployment Scripts**

### **Main Deployment Script**
```bash
#!/bin/bash
# deploy-production.sh

# Check prerequisites
check_prerequisites() {
    # Verify kubectl, docker, cluster connection
}

# Build images
build_images() {
    # Build frontend and backend Docker images
}

# Deploy services
deploy_services() {
    # Deploy all services in order
}

# Monitor deployment
monitor_deployment() {
    # Wait for all pods to be ready
}
```

### **Rollback Script**
```bash
#!/bin/bash
# rollback.sh

kubectl rollout undo deployment/frontend -n voice-agent-production
kubectl rollout undo deployment/media-server -n voice-agent-production
kubectl rollout undo deployment/orchestrator -n voice-agent-production
```

---

## 📊 **Performance Optimization**

### **Resource Optimization**
- **CPU**: Request 70% of expected usage
- **Memory**: Request 80% of expected usage
- **Storage**: Use SSD for better I/O performance
- **Network**: Optimize for low latency

### **Scaling Strategy**
- **Horizontal Pod Autoscaler**: Based on CPU and memory usage
- **Vertical Pod Autoscaler**: For resource optimization
- **Cluster Autoscaler**: For node-level scaling

### **Caching Strategy**
- **Redis**: For session management and caching
- **CDN**: For static assets
- **Browser Caching**: For frontend resources

---

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. Pod Startup Issues**
```bash
# Check pod status
kubectl get pods -n voice-agent-production

# Check pod logs
kubectl logs <pod-name> -n voice-agent-production

# Check pod events
kubectl describe pod <pod-name> -n voice-agent-production
```

#### **2. Service Communication Issues**
```bash
# Check service endpoints
kubectl get endpoints -n voice-agent-production

# Test service connectivity
kubectl exec -it <pod-name> -n voice-agent-production -- curl <service-name>
```

#### **3. Resource Issues**
```bash
# Check resource usage
kubectl top pods -n voice-agent-production

# Check node resources
kubectl top nodes
```

### **Debug Commands**
```bash
# Get all resources
kubectl get all -n voice-agent-production

# Check ingress status
kubectl get ingress -n voice-agent-production

# Check events
kubectl get events -n voice-agent-production --sort-by='.lastTimestamp'
```

---

## 📈 **Monitoring & Alerts**

### **Key Metrics**
- **Response Time**: < 100ms target
- **Success Rate**: > 95% target
- **Error Rate**: < 5% target
- **Resource Usage**: < 80% target

### **Alert Rules**
```yaml
groups:
- name: voice-agent-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High error rate detected
```

---

## 🔄 **CI/CD Pipeline**

### **GitHub Actions Workflow**
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Build and Deploy
      run: |
        ./deploy-production.sh
```

### **Blue-Green Deployment**
```bash
# Deploy new version
kubectl apply -f new-version.yaml

# Switch traffic
kubectl patch service frontend -p '{"spec":{"selector":{"version":"v2"}}}'

# Rollback if needed
kubectl patch service frontend -p '{"spec":{"selector":{"version":"v1"}}}'
```

---

## 📋 **Post-Deployment Checklist**

### **✅ Verification Steps**
- [ ] All pods are running and healthy
- [ ] Services are accessible
- [ ] Ingress is configured correctly
- [ ] SSL certificates are valid
- [ ] Monitoring is working
- [ ] Alerts are configured
- [ ] Performance meets targets
- [ ] Security policies are enforced

### **✅ Testing Steps**
- [ ] Frontend loads correctly
- [ ] WHIP connection works
- [ ] AI conversation functions
- [ ] WebSocket communication works
- [ ] Audio streaming works
- [ ] Error handling works
- [ ] Auto-scaling works

### **✅ Documentation**
- [ ] Deployment guide updated
- [ ] Runbook created
- [ ] Monitoring dashboards configured
- [ ] Alert procedures documented
- [ ] Rollback procedures tested

---

## 🎯 **Success Metrics**

### **Performance Targets**
- **Latency**: < 100ms end-to-end
- **Throughput**: 100+ concurrent users
- **Availability**: 99.9% uptime
- **Error Rate**: < 1%

### **Business Metrics**
- **User Satisfaction**: > 4.5/5
- **Feature Adoption**: > 80%
- **Cost Efficiency**: < $100/month
- **Scalability**: 10x growth capacity

---

**🎉 Deployment Complete!**

Your Voice Agent system is now deployed to production and ready for use. Monitor the system using the provided dashboards and alerts to ensure optimal performance.

**Next Steps**:
1. Configure monitoring dashboards
2. Set up alerting
3. Test all functionality
4. Document procedures
5. Plan for scaling 