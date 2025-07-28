#!/bin/bash

# Phase 2 GKE Docker Image Build Script
# This script builds and pushes Docker images to Google Artifact Registry

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# GCP Configuration
GCP_REGION="asia-south1"
PROJECT_ID="speechtotext-466820"
REPO_NAME="voice-agent-repo"
TAG="phase2-v1.0.0"

REGISTRY_PATH="${GCP_REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}"

echo -e "${BLUE}🏗️  Starting Phase 2 GKE Docker Image Build${NC}"

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

# Check if gcloud is available
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud is not installed or not in PATH"
    exit 1
fi

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    exit 1
fi

print_status "gcloud and Docker are available"

# Step 1: Configure GCP project
echo -e "\n${BLUE}🔧 Configuring GCP project...${NC}"
gcloud config set project ${PROJECT_ID}
gcloud config set compute/region ${GCP_REGION}
print_status "GCP project configured: ${PROJECT_ID}"

# Step 2: Enable required APIs
echo -e "\n${BLUE}🔌 Enabling required APIs...${NC}"
gcloud services enable container.googleapis.com
gcloud services enable artifactregistry.googleapis.com
print_status "Required APIs enabled"

# Step 3: Create Artifact Registry repository
echo -e "\n${BLUE}📦 Creating Artifact Registry repository...${NC}"
if ! gcloud artifacts repositories describe ${REPO_NAME} --location=${GCP_REGION} &> /dev/null; then
    gcloud artifacts repositories create ${REPO_NAME} \
        --repository-format=docker \
        --location=${GCP_REGION} \
        --description="Docker repository for Voice Agent Phase 2 services"
    print_status "Artifact Registry repository created"
else
    print_status "Artifact Registry repository already exists"
fi

# Step 4: Configure Docker authentication
echo -e "\n${BLUE}🔐 Configuring Docker authentication...${NC}"
gcloud auth configure-docker ${GCP_REGION}-docker.pkg.dev
print_status "Docker authentication configured"

# Step 5: Build and push Media Server image
echo -e "\n${BLUE}🎤 Building and pushing Media Server image...${NC}"
cd ../../../../Dharsan-VoiceAgent-Backend/v2/media-server

# Create Dockerfile if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    cat > Dockerfile << 'EOF'
FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o media-server .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/media-server .
EXPOSE 8080
CMD ["./media-server"]
EOF
    print_status "Created Media Server Dockerfile"
fi

docker build -t ${REGISTRY_PATH}/media-server:${TAG} .
docker push ${REGISTRY_PATH}/media-server:${TAG}
print_status "Media Server image built and pushed: ${REGISTRY_PATH}/media-server:${TAG}"

# Step 6: Build and push Orchestrator image
echo -e "\n${BLUE}🤖 Building and pushing Orchestrator image...${NC}"
cd ../orchestrator

# Create Dockerfile if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    cat > Dockerfile << 'EOF'
FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o orchestrator .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/orchestrator .
EXPOSE 8001
CMD ["./orchestrator"]
EOF
    print_status "Created Orchestrator Dockerfile"
fi

docker build -t ${REGISTRY_PATH}/orchestrator:${TAG} .
docker push ${REGISTRY_PATH}/orchestrator:${TAG}
print_status "Orchestrator image built and pushed: ${REGISTRY_PATH}/orchestrator:${TAG}"

# Step 7: Build and push Frontend image
echo -e "\n${BLUE}🌐 Building and pushing Frontend image...${NC}"
cd ../../../

# Create Dockerfile if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    cat > Dockerfile << 'EOF'
# Build stage
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
    print_status "Created Frontend Dockerfile"
fi

# Create nginx.conf if it doesn't exist
if [ ! -f "nginx.conf" ]; then
    cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;
        root   /usr/share/nginx/html;
        index  index.html index.htm;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /config/ {
            alias /usr/share/nginx/html/config/;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF
    print_status "Created nginx.conf"
fi

docker build -t ${REGISTRY_PATH}/frontend:${TAG} .
docker push ${REGISTRY_PATH}/frontend:${TAG}
print_status "Frontend image built and pushed: ${REGISTRY_PATH}/frontend:${TAG}"

# Step 8: Update Kubernetes manifests with GKE registry paths
echo -e "\n${BLUE}📝 Updating Kubernetes manifests...${NC}"
cd k8s/phase2/manifests

# Update image references in manifests
sed -i.bak "s|voice-agent/|${REGISTRY_PATH}/|g" media-server-deployment.yaml
sed -i.bak "s|voice-agent/|${REGISTRY_PATH}/|g" orchestrator-deployment.yaml
sed -i.bak "s|voice-agent/|${REGISTRY_PATH}/|g" frontend-deployment.yaml

# Update image tags
sed -i.bak "s|:phase2|:${TAG}|g" media-server-deployment.yaml
sed -i.bak "s|:phase2|:${TAG}|g" orchestrator-deployment.yaml
sed -i.bak "s|:phase2|:${TAG}|g" frontend-deployment.yaml

print_status "Kubernetes manifests updated with GKE registry paths"

# Step 9: Display built images
echo -e "\n${BLUE}📋 Built and Pushed Images${NC}"
echo -e "${GREEN}Media Server:${NC} ${REGISTRY_PATH}/media-server:${TAG}"
echo -e "${GREEN}Orchestrator:${NC} ${REGISTRY_PATH}/orchestrator:${TAG}"
echo -e "${GREEN}Frontend:${NC} ${REGISTRY_PATH}/frontend:${TAG}"

print_status "Phase 2 GKE Docker image build completed successfully!"

echo -e "\n${YELLOW}🚀 Next Steps:${NC}"
echo -e "1. Create GKE cluster: gcloud container clusters create voice-agent-cluster"
echo -e "2. Configure secrets with actual API keys"
echo -e "3. Run: ./deploy-gke.sh to deploy to GKE"
echo -e "4. Set up DNS and SSL certificates"

echo -e "\n${GREEN}🎉 All Phase 2 images are built and pushed to Google Artifact Registry!${NC}" 