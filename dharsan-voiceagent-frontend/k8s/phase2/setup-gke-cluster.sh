#!/bin/bash

# Phase 2 GKE Cluster Setup Script
# This script creates and configures a GKE cluster for Phase 2 deployment

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
CLUSTER_NAME="voice-agent-cluster"
ZONE="asia-south1-a"

echo -e "${BLUE}🏗️  Starting Phase 2 GKE Cluster Setup${NC}"

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

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
    exit 1
fi

print_status "gcloud and kubectl are available"

# Step 1: Configure GCP project
echo -e "\n${BLUE}🔧 Configuring GCP project...${NC}"
gcloud config set project ${PROJECT_ID}
gcloud config set compute/region ${GCP_REGION}
gcloud config set compute/zone ${ZONE}
print_status "GCP project configured: ${PROJECT_ID}"

# Step 2: Enable required APIs
echo -e "\n${BLUE}🔌 Enabling required APIs...${NC}"
gcloud services enable container.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable compute.googleapis.com
print_status "Required APIs enabled"

# Step 3: Check if cluster already exists
echo -e "\n${BLUE}🔍 Checking existing clusters...${NC}"
if gcloud container clusters describe ${CLUSTER_NAME} --zone=${ZONE} &> /dev/null; then
    print_warning "Cluster ${CLUSTER_NAME} already exists"
    read -p "Do you want to delete and recreate the cluster? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "\n${BLUE}🗑️  Deleting existing cluster...${NC}"
        gcloud container clusters delete ${CLUSTER_NAME} --zone=${ZONE} --quiet
        print_status "Existing cluster deleted"
    else
        print_status "Using existing cluster"
        # Get credentials for existing cluster
        gcloud container clusters get-credentials ${CLUSTER_NAME} --zone=${ZONE}
        print_status "Connected to existing cluster"
        exit 0
    fi
fi

# Step 4: Create GKE cluster
echo -e "\n${BLUE}🏗️  Creating GKE cluster...${NC}"
gcloud container clusters create ${CLUSTER_NAME} \
    --zone=${ZONE} \
    --num-nodes=2 \
    --enable-autoscaling \
    --min-nodes=2 \
    --max-nodes=5 \
    --enable-network-policy \
    --machine-type="e2-standard-4" \
    --disk-size=50 \
    --disk-type="pd-standard" \
    --enable-ip-alias \
    --enable-autorepair \
    --enable-autoupgrade \
    --enable-stackdriver-kubernetes \
    --metadata disable-legacy-endpoints=true \
    --addons=HttpLoadBalancing,HorizontalPodAutoscaling \
    --workload-pool=${PROJECT_ID}.svc.id.goog

print_status "GKE cluster created: ${CLUSTER_NAME}"

# Step 5: Get cluster credentials
echo -e "\n${BLUE}🔐 Getting cluster credentials...${NC}"
gcloud container clusters get-credentials ${CLUSTER_NAME} --zone=${ZONE}
print_status "Cluster credentials configured"

# Step 6: Verify cluster connection
echo -e "\n${BLUE}🔍 Verifying cluster connection...${NC}"
kubectl cluster-info
kubectl get nodes
print_status "Cluster connection verified"

# Step 7: Install cert-manager
echo -e "\n${BLUE}📜 Installing cert-manager...${NC}"
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml

# Wait for cert-manager to be ready
echo -e "\n${BLUE}⏳ Waiting for cert-manager to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s
print_status "cert-manager installed and ready"

# Step 8: Create ClusterIssuer for Let's Encrypt
echo -e "\n${BLUE}🔐 Creating ClusterIssuer for SSL certificates...${NC}"
cat > cluster-issuer.yaml << 'EOF'
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@voice-agent.com  # Replace with your email
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

kubectl apply -f cluster-issuer.yaml
print_status "ClusterIssuer created for SSL certificates"

# Step 9: Install nginx-ingress controller
echo -e "\n${BLUE}🌐 Installing nginx-ingress controller...${NC}"
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Wait for nginx-ingress to be ready
echo -e "\n${BLUE}⏳ Waiting for nginx-ingress to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx --timeout=300s
print_status "nginx-ingress controller installed and ready"

# Step 10: Display cluster information
echo -e "\n${BLUE}📋 Cluster Information${NC}"
echo -e "${GREEN}Cluster Name:${NC} ${CLUSTER_NAME}"
echo -e "${GREEN}Zone:${NC} ${ZONE}"
echo -e "${GREEN}Project:${NC} ${PROJECT_ID}"
echo -e "${GREEN}Nodes:${NC} 2-5 (auto-scaling)"
echo -e "${GREEN}Machine Type:${NC} e2-standard-4"

# Get external IP for ingress
echo -e "\n${BLUE}🌍 Getting external IP for ingress...${NC}"
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

print_status "Phase 2 GKE cluster setup completed successfully!"

echo -e "\n${YELLOW}🚀 Next Steps:${NC}"
echo -e "1. Build and push Docker images: ./build-images-gke.sh"
echo -e "2. Configure secrets with actual API keys"
echo -e "3. Deploy application: ./deploy-gke.sh"
echo -e "4. Update DNS records with the external IP"
echo -e "5. Wait for SSL certificates to be provisioned"

echo -e "\n${GREEN}🎉 GKE cluster is ready for Phase 2 deployment!${NC}" 