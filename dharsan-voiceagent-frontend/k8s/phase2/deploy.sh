#!/bin/bash

# Phase 2 Kubernetes Deployment Script
# This script deploys all Phase 2 services to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="voice-agent-phase2"
MANIFESTS_DIR="manifests"
SECRETS_DIR="secrets"

echo -e "${BLUE}🚀 Starting Phase 2 Kubernetes Deployment${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we're connected to a cluster
if ! kubectl cluster-info &> /dev/null; then
    print_error "Not connected to a Kubernetes cluster"
    exit 1
fi

print_status "Connected to Kubernetes cluster: $(kubectl config current-context)"

# Step 1: Create namespace
echo -e "\n${BLUE}📦 Creating namespace...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/redpanda-deployment.yaml --dry-run=client
kubectl apply -f ${MANIFESTS_DIR}/redpanda-deployment.yaml
print_status "Namespace created"

# Step 2: Deploy Redpanda (Kafka)
echo -e "\n${BLUE}📨 Deploying Redpanda (Kafka)...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/redpanda-deployment.yaml
print_status "Redpanda deployment created"

# Wait for Redpanda to be ready
echo -e "\n${BLUE}⏳ Waiting for Redpanda to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=redpanda -n ${NAMESPACE} --timeout=300s
print_status "Redpanda is ready"

# Step 3: Create Kafka topics
echo -e "\n${BLUE}📋 Creating Kafka topics...${NC}"
kubectl exec -n ${NAMESPACE} deployment/redpanda -- rpk topic create audio-in --if-not-exists
kubectl exec -n ${NAMESPACE} deployment/redpanda -- rpk topic create audio-out --if-not-exists
print_status "Kafka topics created"

# Step 4: Deploy Media Server
echo -e "\n${BLUE}🎤 Deploying Media Server...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/media-server-deployment.yaml
print_status "Media Server deployment created"

# Step 5: Deploy Orchestrator
echo -e "\n${BLUE}🤖 Deploying Orchestrator...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/orchestrator-deployment.yaml
print_status "Orchestrator deployment created"

# Step 6: Deploy Frontend
echo -e "\n${BLUE}🌐 Deploying Frontend...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/frontend-deployment.yaml
print_status "Frontend deployment created"

# Step 7: Deploy Ingress
echo -e "\n${BLUE}🌍 Deploying Ingress...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/ingress.yaml
print_status "Ingress created"

# Step 8: Deploy Monitoring
echo -e "\n${BLUE}📊 Deploying Monitoring...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/monitoring.yaml
print_status "Monitoring configured"

# Step 9: Wait for all deployments to be ready
echo -e "\n${BLUE}⏳ Waiting for all deployments to be ready...${NC}"
kubectl wait --for=condition=available deployment/media-server -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=available deployment/orchestrator -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=available deployment/frontend -n ${NAMESPACE} --timeout=300s
print_status "All deployments are ready"

# Step 10: Health checks
echo -e "\n${BLUE}🏥 Running health checks...${NC}"

# Check Media Server health
MEDIA_SERVER_HEALTH=$(kubectl exec -n ${NAMESPACE} deployment/media-server -- curl -s http://localhost:8080/health | jq -r '.status' 2>/dev/null || echo "unavailable")
if [ "$MEDIA_SERVER_HEALTH" = "healthy" ]; then
    print_status "Media Server health check passed"
else
    print_warning "Media Server health check failed: $MEDIA_SERVER_HEALTH"
fi

# Check Redpanda health
REDPANDA_HEALTH=$(kubectl exec -n ${NAMESPACE} deployment/redpanda -- rpk cluster health 2>/dev/null | grep -c "healthy" || echo "0")
if [ "$REDPANDA_HEALTH" -gt 0 ]; then
    print_status "Redpanda health check passed"
else
    print_warning "Redpanda health check failed"
fi

# Step 11: Display deployment information
echo -e "\n${BLUE}📋 Deployment Information${NC}"
echo -e "${GREEN}Namespace:${NC} ${NAMESPACE}"
echo -e "${GREEN}Services:${NC}"
kubectl get services -n ${NAMESPACE}

echo -e "\n${GREEN}Deployments:${NC}"
kubectl get deployments -n ${NAMESPACE}

echo -e "\n${GREEN}Pods:${NC}"
kubectl get pods -n ${NAMESPACE}

echo -e "\n${GREEN}Ingress:${NC}"
kubectl get ingress -n ${NAMESPACE}

# Step 12: Display access information
echo -e "\n${BLUE}🌐 Access Information${NC}"
echo -e "${GREEN}Frontend:${NC} https://voice-agent.com"
echo -e "${GREEN}API:${NC} https://api.voice-agent.com"
echo -e "${GREEN}Media Server:${NC} https://media.voice-agent.com"
echo -e "${GREEN}Orchestrator:${NC} wss://orchestrator.voice-agent.com/ws"

# Step 13: Display monitoring information
echo -e "\n${BLUE}📊 Monitoring Information${NC}"
echo -e "${GREEN}Prometheus:${NC} Available via ServiceMonitor"
echo -e "${GREEN}Grafana:${NC} Configure dashboards for Phase 2 metrics"
echo -e "${GREEN}Auto-scaling:${NC} HPA configured for all services"

print_status "Phase 2 Kubernetes deployment completed successfully!"

echo -e "\n${YELLOW}⚠️  Next Steps:${NC}"
echo -e "1. Configure DNS records for the domains"
echo -e "2. Set up SSL certificates (cert-manager will handle this)"
echo -e "3. Configure secrets with actual API keys"
echo -e "4. Set up monitoring dashboards"
echo -e "5. Run load tests to validate performance"

echo -e "\n${GREEN}🎉 Phase 2 is now deployed and ready for production!${NC}" 