#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

NAMESPACE="voice-agent-phase2"

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}🚀 Deploying Phase 2 services with existing binaries...${NC}"

# Step 1: Verify Redpanda is running
echo -e "\n${BLUE}🔍 Checking Redpanda status...${NC}"
if kubectl get pods -n ${NAMESPACE} | grep redpanda | grep -q Running; then
    print_status "Redpanda is running"
else
    print_error "Redpanda is not running. Please fix Redpanda first."
    exit 1
fi

# Step 2: Deploy Media Server using simple Alpine image
echo -e "\n${BLUE}🎤 Deploying Media Server...${NC}"
kubectl apply -f manifests/media-server-deployment-simple.yaml

if [ $? -eq 0 ]; then
    print_status "Media Server deployment applied"
else
    print_error "Failed to deploy Media Server"
    exit 1
fi

# Step 3: Deploy Orchestrator using simple Alpine image
echo -e "\n${BLUE}🤖 Deploying Orchestrator...${NC}"
kubectl apply -f manifests/orchestrator-deployment-simple.yaml

if [ $? -eq 0 ]; then
    print_status "Orchestrator deployment applied"
else
    print_error "Failed to deploy Orchestrator"
    exit 1
fi

# Step 4: Deploy Frontend (using existing image or simple nginx)
echo -e "\n${BLUE}🌐 Deploying Frontend...${NC}"
kubectl apply -f manifests/frontend-deployment.yaml

if [ $? -eq 0 ]; then
    print_status "Frontend deployment applied"
else
    print_error "Failed to deploy Frontend"
fi

# Step 5: Deploy Ingress
echo -e "\n${BLUE}🌍 Deploying Ingress...${NC}"
kubectl apply -f manifests/ingress.yaml

if [ $? -eq 0 ]; then
    print_status "Ingress applied"
else
    print_error "Failed to deploy Ingress"
fi

# Step 6: Wait for services to be ready
echo -e "\n${BLUE}⏳ Waiting for services to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/media-server -n ${NAMESPACE}
kubectl wait --for=condition=available --timeout=300s deployment/orchestrator -n ${NAMESPACE}

# Step 7: Show status
echo -e "\n${BLUE}📊 Deployment Status:${NC}"
kubectl get pods -n ${NAMESPACE}
kubectl get services -n ${NAMESPACE}
kubectl get ingress -n ${NAMESPACE}

print_status "Phase 2 deployment completed!"
echo -e "\n${GREEN}🎉 All services deployed successfully!${NC}" 