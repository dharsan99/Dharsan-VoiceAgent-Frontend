#!/bin/bash

# Phase 2 GKE Deployment Script
# This script deploys all Phase 2 services to Google Kubernetes Engine

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
GCP_REGION="asia-south1"
PROJECT_ID="speechtotext-466820"

echo -e "${BLUE}🚀 Starting Phase 2 GKE Deployment${NC}"

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

# Step 1: Verify secrets exist
echo -e "\n${BLUE}🔐 Verifying secrets...${NC}"
if ! kubectl get secret google-ai-secrets -n ${NAMESPACE} &> /dev/null; then
    print_error "Google AI secrets not found. Run ./secrets/gke-secrets-setup.sh first"
    exit 1
fi

# OpenAI secrets not needed for Phase 2 (using Google AI services)

print_status "Secrets verified"

# Step 2: Create namespace
echo -e "\n${BLUE}📦 Creating namespace...${NC}"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
print_status "Namespace created: ${NAMESPACE}"

# Step 3: Deploy Redpanda (Kafka)
echo -e "\n${BLUE}📨 Deploying Redpanda (Kafka)...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/redpanda-deployment.yaml
print_status "Redpanda deployment created"

# Wait for Redpanda to be ready
echo -e "\n${BLUE}⏳ Waiting for Redpanda to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=redpanda -n ${NAMESPACE} --timeout=300s
print_status "Redpanda is ready"

# Step 4: Create Kafka topics
echo -e "\n${BLUE}📋 Creating Kafka topics...${NC}"
kubectl exec -n ${NAMESPACE} deployment/redpanda -- rpk topic create audio-in --if-not-exists
kubectl exec -n ${NAMESPACE} deployment/redpanda -- rpk topic create audio-out --if-not-exists
print_status "Kafka topics created"

# Step 5: Deploy Media Server
echo -e "\n${BLUE}🎤 Deploying Media Server...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/media-server-deployment.yaml
print_status "Media Server deployment created"

# Step 6: Deploy Orchestrator
echo -e "\n${BLUE}🤖 Deploying Orchestrator...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/orchestrator-deployment.yaml
print_status "Orchestrator deployment created"

# Step 7: Deploy Frontend
echo -e "\n${BLUE}🌐 Deploying Frontend...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/frontend-deployment.yaml
print_status "Frontend deployment created"

# Step 8: Deploy Ingress
echo -e "\n${BLUE}🌍 Deploying Ingress...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/ingress.yaml
print_status "Ingress created"

# Step 9: Deploy Monitoring
echo -e "\n${BLUE}📊 Deploying Monitoring...${NC}"
kubectl apply -f ${MANIFESTS_DIR}/monitoring.yaml
print_status "Monitoring configured"

# Step 10: Wait for all deployments to be ready
echo -e "\n${BLUE}⏳ Waiting for all deployments to be ready...${NC}"
kubectl wait --for=condition=available deployment/media-server -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=available deployment/orchestrator -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=available deployment/frontend -n ${NAMESPACE} --timeout=300s
print_status "All deployments are ready"

# Step 11: Health checks
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

# Step 12: Get external IP
echo -e "\n${BLUE}🌍 Getting external IP...${NC}"
EXTERNAL_IP=$(kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending")

if [ "$EXTERNAL_IP" != "Pending" ] && [ "$EXTERNAL_IP" != "" ]; then
    echo -e "${GREEN}External IP:${NC} ${EXTERNAL_IP}"
    echo -e "${YELLOW}⚠️  Update your DNS records to point to this IP:${NC}"
    echo -e "  voice-agent.com -> ${EXTERNAL_IP}"
    echo -e "  api.voice-agent.com -> ${EXTERNAL_IP}"
    echo -e "  media.voice-agent.com -> ${EXTERNAL_IP}"
    echo -e "  orchestrator.voice-agent.com -> ${EXTERNAL_IP}"
else
    echo -e "${YELLOW}⚠️  External IP is still being provisioned. Check again in a few minutes:${NC}"
    echo -e "  kubectl get service ingress-nginx-controller -n ingress-nginx"
fi

# Step 13: Display deployment information
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

# Step 14: Display access information
echo -e "\n${BLUE}🌐 Access Information${NC}"
echo -e "${GREEN}Frontend:${NC} https://voice-agent.com"
echo -e "${GREEN}API:${NC} https://api.voice-agent.com"
echo -e "${GREEN}Media Server:${NC} https://media.voice-agent.com"
echo -e "${GREEN}Orchestrator:${NC} wss://orchestrator.voice-agent.com/ws"

# Step 15: Display monitoring information
echo -e "\n${BLUE}📊 Monitoring Information${NC}"
echo -e "${GREEN}Prometheus:${NC} Available via ServiceMonitor"
echo -e "${GREEN}Grafana:${NC} Configure dashboards for Phase 2 metrics"
echo -e "${GREEN}Auto-scaling:${NC} HPA configured for all services"

# Step 16: Check SSL certificate status
echo -e "\n${BLUE}🔐 Checking SSL certificate status...${NC}"
kubectl get certificates -n ${NAMESPACE} 2>/dev/null || echo "No certificates found yet"

print_status "Phase 2 GKE deployment completed successfully!"

echo -e "\n${YELLOW}⚠️  Next Steps:${NC}"
echo -e "1. Update DNS records with the external IP"
echo -e "2. Wait for SSL certificates to be provisioned (5-10 minutes)"
echo -e "3. Test the application endpoints"
echo -e "4. Set up monitoring dashboards"
echo -e "5. Run load tests to validate performance"

echo -e "\n${GREEN}🎉 Phase 2 is now deployed on Google Kubernetes Engine!${NC}"

# Step 17: Display useful commands
echo -e "\n${BLUE}🔧 Useful Commands${NC}"
echo -e "${GREEN}Check pods:${NC} kubectl get pods -n ${NAMESPACE}"
echo -e "${GREEN}View logs:${NC} kubectl logs -f deployment/media-server -n ${NAMESPACE}"
echo -e "${GREEN}Check ingress:${NC} kubectl get ingress -n ${NAMESPACE}"
echo -e "${GREEN}Check certificates:${NC} kubectl get certificates -n ${NAMESPACE}"
echo -e "${GREEN}Scale services:${NC} kubectl scale deployment media-server --replicas=5 -n ${NAMESPACE}" 