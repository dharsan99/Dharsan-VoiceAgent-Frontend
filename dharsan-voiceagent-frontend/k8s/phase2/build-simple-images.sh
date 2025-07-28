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

echo -e "${BLUE}🔧 Building simple Docker images for Phase 2...${NC}"

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

# Step 3: Build Media Server image
echo -e "\n${BLUE}🐳 Building Media Server image...${NC}"
docker build -f Dockerfile.media-server -t asia-south1-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/media-server:phase2-v1.0.0 .

if [ $? -eq 0 ]; then
    print_status "Media Server image built successfully"
else
    print_error "Failed to build Media Server image"
    exit 1
fi

# Step 4: Build Orchestrator image
echo -e "\n${BLUE}🐳 Building Orchestrator image...${NC}"
docker build -f Dockerfile.orchestrator -t asia-south1-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/orchestrator:phase2-v1.0.0 .

if [ $? -eq 0 ]; then
    print_status "Orchestrator image built successfully"
else
    print_error "Failed to build Orchestrator image"
    exit 1
fi

# Step 5: Push images
echo -e "\n${BLUE}📤 Pushing images to Artifact Registry...${NC}"
docker push asia-south1-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/media-server:phase2-v1.0.0
docker push asia-south1-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/orchestrator:phase2-v1.0.0

if [ $? -eq 0 ]; then
    print_status "Images pushed successfully"
else
    print_error "Failed to push images"
    exit 1
fi

# Step 6: Clean up
echo -e "\n${BLUE}🧹 Cleaning up...${NC}"
rm -f media-server-binary orchestrator-binary

print_status "Cleanup completed"

echo -e "\n${GREEN}🎉 Simple Docker images built and pushed successfully!${NC}" 