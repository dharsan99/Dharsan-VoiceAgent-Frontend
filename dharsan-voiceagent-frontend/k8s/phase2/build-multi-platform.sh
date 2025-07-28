#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID="speechtotext-466820"
REGION="asia-south1"
REPOSITORY="voice-agent-repo"

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}🔧 Building multi-platform Docker images for Phase 2...${NC}"

# Step 1: Copy Media Server binary
echo -e "\n${BLUE}🎤 Copying Media Server binary...${NC}"
cp ../../../../Dharsan-VoiceAgent-Backend/v2/media-server/media-server ./media-server-binary

if [ ! -f "media-server-binary" ]; then
    print_error "Failed to copy Media Server binary"
    exit 1
fi

print_status "Media Server binary copied"

# Step 2: Copy Orchestrator binary
echo -e "\n${BLUE}🤖 Copying Orchestrator binary...${NC}"
cp ../../../../Dharsan-VoiceAgent-Backend/v2/orchestrator/orchestrator ./orchestrator-binary

if [ ! -f "orchestrator-binary" ]; then
    print_error "Failed to copy Orchestrator binary"
    exit 1
fi

print_status "Orchestrator binary copied"

# Step 3: Build Media Server image for multiple platforms
echo -e "\n${BLUE}🐳 Building Media Server image for multiple platforms...${NC}"
docker buildx build --platform linux/amd64,linux/arm64 \
    -f Dockerfile.media-server \
    -t asia-south1-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/media-server:phase2-v1.0.0 \
    --push .

if [ $? -eq 0 ]; then
    print_status "Media Server multi-platform image built and pushed"
else
    print_error "Failed to build Media Server multi-platform image"
    exit 1
fi

# Step 4: Build Orchestrator image for multiple platforms
echo -e "\n${BLUE}🐳 Building Orchestrator image for multiple platforms...${NC}"
docker buildx build --platform linux/amd64,linux/arm64 \
    -f Dockerfile.orchestrator \
    -t asia-south1-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/orchestrator:phase2-v1.0.0 \
    --push .

if [ $? -eq 0 ]; then
    print_status "Orchestrator multi-platform image built and pushed"
else
    print_error "Failed to build Orchestrator multi-platform image"
    exit 1
fi

# Step 5: Clean up
echo -e "\n${BLUE}🧹 Cleaning up...${NC}"
rm -f media-server-binary orchestrator-binary

print_status "Cleanup completed"

echo -e "\n${GREEN}🎉 Multi-platform Docker images built and pushed successfully!${NC}" 