# Phase 2 Kubernetes Deployment Guide

## 🏗️ **Architecture Overview**

Phase 2 implements a production-ready microservices architecture with the following components:

### **Core Services**
- **Redpanda (Kafka)**: Message bus for audio streaming
- **Media Server (Go)**: WHIP protocol & WebRTC handling
- **Orchestrator (Go)**: AI pipeline with Google AI services
- **Frontend (React)**: V2Phase2 interface with real-time features

### **Infrastructure**
- **Kubernetes**: Container orchestration
- **Ingress**: External access with SSL termination
- **Monitoring**: Prometheus + Grafana
- **Auto-scaling**: Horizontal Pod Autoscalers
- **Persistent Storage**: PVC for Redpanda data

---

## 📋 **Prerequisites**

### **Required Tools**
- `kubectl` - Kubernetes CLI
- `docker` - Container runtime
- `helm` - Package manager (optional)

### **Required Infrastructure**
- Kubernetes cluster (v1.24+)
- Ingress controller (nginx-ingress)
- Cert-manager (for SSL certificates)
- Prometheus Operator (for monitoring)

### **Required Secrets**
- Google Cloud credentials
- OpenAI API key
- Domain SSL certificates

---

## 🚀 **Quick Start Deployment**

### **Step 1: Build Docker Images**
```bash
cd k8s/phase2
chmod +x build-images.sh
./build-images.sh
```

### **Step 2: Configure Secrets**
```bash
# Edit secrets template
cp secrets/secrets-template.yaml secrets/secrets.yaml
# Add your actual API keys and credentials
kubectl apply -f secrets/secrets.yaml
```

### **Step 3: Deploy to Kubernetes**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📁 **File Structure**

```
k8s/phase2/
├── manifests/
│   ├── redpanda-deployment.yaml      # Kafka message bus
│   ├── media-server-deployment.yaml  # WHIP protocol server
│   ├── orchestrator-deployment.yaml  # AI pipeline
│   ├── frontend-deployment.yaml      # React frontend
│   ├── ingress.yaml                  # External access
│   └── monitoring.yaml               # Observability
├── secrets/
│   └── secrets-template.yaml         # API keys template
├── build-images.sh                   # Docker build script
├── deploy.sh                         # Deployment script
└── README.md                         # This file
```

---

## 🔧 **Configuration**

### **Environment Variables**

#### **Media Server**
- `KAFKA_BROKERS`: Redpanda service URL
- `KAFKA_TOPIC_AUDIO_IN`: Input audio topic
- `KAFKA_TOPIC_AUDIO_OUT`: Output audio topic
- `SERVER_PORT`: HTTP server port (8080)
- `PHASE`: Deployment phase ("2")
- `AI_ENABLED`: AI features enabled (true)

#### **Orchestrator**
- `KAFKA_BROKERS`: Redpanda service URL
- `GOOGLE_APPLICATION_CREDENTIALS`: Google Cloud credentials path
- `GOOGLE_PROJECT_ID`: Google Cloud project ID
- `OPENAI_API_KEY`: OpenAI API key
- `SERVER_PORT`: WebSocket server port (8001)

#### **Frontend**
- `VITE_API_BASE_URL`: API base URL
- `VITE_MEDIA_SERVER_URL`: Media server URL
- `VITE_ORCHESTRATOR_URL`: Orchestrator WebSocket URL
- `VITE_APP_VERSION`: Application version
- `VITE_PHASE`: Deployment phase

### **Resource Limits**

| Service | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---------|-------------|-----------|----------------|--------------|
| **Redpanda** | 250m | 500m | 512Mi | 1Gi |
| **Media Server** | 200m | 500m | 256Mi | 512Mi |
| **Orchestrator** | 300m | 1000m | 512Mi | 1Gi |
| **Frontend** | 100m | 200m | 128Mi | 256Mi |

---

## 🌐 **Network Architecture**

### **Internal Services**
- **Redpanda**: `redpanda.voice-agent-phase2.svc.cluster.local:9092`
- **Media Server**: `media-server.voice-agent-phase2.svc.cluster.local:8080`
- **Orchestrator**: `orchestrator.voice-agent-phase2.svc.cluster.local:8001`
- **Frontend**: `frontend.voice-agent-phase2.svc.cluster.local:80`

### **External Access**
- **Frontend**: `https://voice-agent.com`
- **API**: `https://api.voice-agent.com`
- **Media Server**: `https://media.voice-agent.com`
- **Orchestrator**: `wss://orchestrator.voice-agent.com/ws`

---

## 📊 **Monitoring & Observability**

### **Prometheus Metrics**
- **Service Health**: `/health` endpoints
- **Custom Metrics**: Application-specific metrics
- **Resource Usage**: CPU, memory, network

### **Grafana Dashboards**
- **Service Overview**: All services status
- **Performance Metrics**: Response times, throughput
- **Error Rates**: Error tracking and alerting
- **Resource Utilization**: Cluster resource usage

### **Auto-scaling**
- **Media Server**: 2-10 replicas (CPU/Memory based)
- **Orchestrator**: 2-10 replicas (CPU/Memory based)
- **Frontend**: 3-15 replicas (CPU/Memory based)

---

## 🔒 **Security**

### **Secrets Management**
- **Google AI**: Service account credentials
- **OpenAI**: API key
- **TLS**: SSL certificates (managed by cert-manager)

### **Network Security**
- **Ingress**: SSL termination and routing
- **Internal**: Service-to-service communication
- **External**: HTTPS/WSS only

### **Pod Security**
- **Non-root**: Containers run as non-root users
- **Read-only**: ConfigMaps mounted read-only
- **Resource limits**: CPU and memory constraints

---

## 🧪 **Testing**

### **Health Checks**
```bash
# Check all services
kubectl get pods -n voice-agent-phase2

# Check Media Server health
kubectl exec -n voice-agent-phase2 deployment/media-server -- curl http://localhost:8080/health

# Check Redpanda health
kubectl exec -n voice-agent-phase2 deployment/redpanda -- rpk cluster health
```

### **Load Testing**
```bash
# Run load tests against the deployed services
# Use the test scripts in the root directory
python test-phase2-backend.py
```

---

## 🔄 **Scaling & Maintenance**

### **Scaling Services**
```bash
# Scale Media Server
kubectl scale deployment media-server --replicas=5 -n voice-agent-phase2

# Scale Orchestrator
kubectl scale deployment orchestrator --replicas=5 -n voice-agent-phase2

# Scale Frontend
kubectl scale deployment frontend --replicas=10 -n voice-agent-phase2
```

### **Updates & Rollbacks**
```bash
# Update to new image
kubectl set image deployment/media-server media-server=voice-agent/media-server:phase2-v2 -n voice-agent-phase2

# Rollback if needed
kubectl rollout undo deployment/media-server -n voice-agent-phase2
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Pods Not Starting**
```bash
# Check pod events
kubectl describe pod <pod-name> -n voice-agent-phase2

# Check logs
kubectl logs <pod-name> -n voice-agent-phase2
```

#### **Services Not Accessible**
```bash
# Check service endpoints
kubectl get endpoints -n voice-agent-phase2

# Check ingress status
kubectl get ingress -n voice-agent-phase2
```

#### **Kafka Connection Issues**
```bash
# Check Redpanda status
kubectl exec -n voice-agent-phase2 deployment/redpanda -- rpk cluster health

# Check topics
kubectl exec -n voice-agent-phase2 deployment/redpanda -- rpk topic list
```

### **Logs & Debugging**
```bash
# Follow logs for all services
kubectl logs -f deployment/media-server -n voice-agent-phase2
kubectl logs -f deployment/orchestrator -n voice-agent-phase2
kubectl logs -f deployment/frontend -n voice-agent-phase2
```

---

## 📈 **Performance Optimization**

### **Resource Tuning**
- **CPU**: Monitor usage and adjust limits
- **Memory**: Optimize for application needs
- **Network**: Configure appropriate timeouts

### **Scaling Strategies**
- **Horizontal**: Add more replicas
- **Vertical**: Increase resource limits
- **Auto-scaling**: Based on metrics

---

## 🔮 **Future Enhancements**

### **Planned Features**
- **Service Mesh**: Istio for advanced traffic management
- **Multi-region**: Geographic distribution
- **Backup & Recovery**: Automated backup strategies
- **Advanced Monitoring**: Distributed tracing

### **Integration Points**
- **CI/CD**: Automated deployment pipelines
- **GitOps**: Infrastructure as code
- **Security Scanning**: Container vulnerability scanning

---

## 📞 **Support**

### **Documentation**
- **Architecture**: See architecture diagrams
- **API Reference**: Service API documentation
- **Troubleshooting**: Common issues and solutions

### **Monitoring**
- **Grafana**: Real-time dashboards
- **Alerts**: Automated alerting
- **Logs**: Centralized logging

---

**Status**: Phase 2 Kubernetes deployment is **production-ready** 🎉

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Phase**: 2 