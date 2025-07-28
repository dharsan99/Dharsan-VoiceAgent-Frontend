#!/bin/bash

# Phase 2 Docker Image Build Script
# This script builds all Docker images for Phase 2 services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="voice-agent"
TAG="phase2"
BACKEND_DIR="../../../Dharsan-VoiceAgent-Backend"

echo -e "${BLUE}🏗️  Starting Phase 2 Docker Image Build${NC}"

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

print_status "Docker is available and running"

# Step 1: Build Media Server Image
echo -e "\n${BLUE}🎤 Building Media Server image...${NC}"
cd ${BACKEND_DIR}/v2/media-server

# Create Dockerfile if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    cat > Dockerfile << 'EOF'
FROM golang:1.21-alpine AS builder

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

docker build -t ${REGISTRY}/media-server:${TAG} .
print_status "Media Server image built: ${REGISTRY}/media-server:${TAG}"

# Step 2: Build Orchestrator Image
echo -e "\n${BLUE}🤖 Building Orchestrator image...${NC}"
cd ${BACKEND_DIR}/v2/orchestrator

# Create Dockerfile if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    cat > Dockerfile << 'EOF'
FROM golang:1.21-alpine AS builder

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

docker build -t ${REGISTRY}/orchestrator:${TAG} .
print_status "Orchestrator image built: ${REGISTRY}/orchestrator:${TAG}"

# Step 3: Build Frontend Image
echo -e "\n${BLUE}🌐 Building Frontend image...${NC}"
cd ../../../Dharsan-VoiceAgent-Frontend/dharsan-voiceagent-frontend

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

docker build -t ${REGISTRY}/frontend:${TAG} .
print_status "Frontend image built: ${REGISTRY}/frontend:${TAG}"

# Step 4: Display built images
echo -e "\n${BLUE}📋 Built Images${NC}"
docker images | grep ${REGISTRY}

# Step 5: Optional: Push to registry
echo -e "\n${BLUE}📤 Push Images to Registry${NC}"
read -p "Do you want to push images to a registry? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter registry URL (e.g., docker.io/yourusername): " REGISTRY_URL
    
    # Tag images for registry
    docker tag ${REGISTRY}/media-server:${TAG} ${REGISTRY_URL}/media-server:${TAG}
    docker tag ${REGISTRY}/orchestrator:${TAG} ${REGISTRY_URL}/orchestrator:${TAG}
    docker tag ${REGISTRY}/frontend:${TAG} ${REGISTRY_URL}/frontend:${TAG}
    
    # Push images
    docker push ${REGISTRY_URL}/media-server:${TAG}
    docker push ${REGISTRY_URL}/orchestrator:${TAG}
    docker push ${REGISTRY_URL}/frontend:${TAG}
    
    print_status "Images pushed to registry: ${REGISTRY_URL}"
    
    # Update Kubernetes manifests with registry URL
    echo -e "\n${BLUE}📝 Updating Kubernetes manifests...${NC}"
    cd k8s/phase2/manifests
    
    # Update image references in manifests
    sed -i.bak "s|voice-agent/|${REGISTRY_URL}/|g" media-server-deployment.yaml
    sed -i.bak "s|voice-agent/|${REGISTRY_URL}/|g" orchestrator-deployment.yaml
    sed -i.bak "s|voice-agent/|${REGISTRY_URL}/|g" frontend-deployment.yaml
    
    print_status "Kubernetes manifests updated with registry URL"
fi

print_status "Phase 2 Docker image build completed successfully!"

echo -e "\n${YELLOW}📋 Image Summary:${NC}"
echo -e "${GREEN}Media Server:${NC} ${REGISTRY}/media-server:${TAG}"
echo -e "${GREEN}Orchestrator:${NC} ${REGISTRY}/orchestrator:${TAG}"
echo -e "${GREEN}Frontend:${NC} ${REGISTRY}/frontend:${TAG}"

echo -e "\n${YELLOW}🚀 Next Steps:${NC}"
echo -e "1. Run: ./k8s/phase2/deploy.sh to deploy to Kubernetes"
echo -e "2. Configure secrets with actual API keys"
echo -e "3. Set up DNS and SSL certificates"
echo -e "4. Run load tests to validate performance"

echo -e "\n${GREEN}🎉 All Phase 2 images are built and ready for deployment!${NC}" 