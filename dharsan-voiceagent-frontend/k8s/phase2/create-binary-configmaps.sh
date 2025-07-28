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

echo -e "${BLUE}🔧 Creating binary ConfigMaps for Phase 2 deployment...${NC}"

# Step 1: Copy Media Server binary
echo -e "\n${BLUE}🎤 Copying Media Server binary...${NC}"
cd ../../../../Dharsan-VoiceAgent-Backend/v2/media-server

if [ ! -f "media-server" ]; then
    print_error "Media Server binary not found. Please compile it first."
    exit 1
fi

# Create ConfigMap from binary
kubectl create configmap media-server-binary \
    --namespace=${NAMESPACE} \
    --from-file=media-server=./media-server \
    --dry-run=client -o yaml | kubectl apply -f -

print_status "Media Server binary ConfigMap created"

# Step 2: Copy Orchestrator binary
echo -e "\n${BLUE}🤖 Copying Orchestrator binary...${NC}"
cd ../orchestrator

if [ ! -f "orchestrator" ]; then
    print_error "Orchestrator binary not found. Please compile it first."
    exit 1
fi

# Create ConfigMap from binary
kubectl create configmap orchestrator-binary \
    --namespace=${NAMESPACE} \
    --from-file=orchestrator=./orchestrator \
    --dry-run=client -o yaml | kubectl apply -f -

print_status "Orchestrator binary ConfigMap created"

# Step 3: Verify ConfigMaps
echo -e "\n${BLUE}🔍 Verifying ConfigMaps...${NC}"
kubectl get configmaps -n ${NAMESPACE} | grep -E "(media-server-binary|orchestrator-binary)"

print_status "Binary ConfigMaps created successfully"
echo -e "\n${GREEN}🎉 Ready to deploy services using binary ConfigMaps!${NC}" 