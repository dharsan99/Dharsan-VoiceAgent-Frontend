#!/bin/bash

# Phase 2 GKE Secrets Setup Script
# This script creates GCP service accounts and configures secrets for Phase 2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# GCP Configuration
PROJECT_ID="speechtotext-466820"
SERVICE_ACCOUNT_NAME="orchestrator-sa"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo -e "${BLUE}🔐 Starting Phase 2 GKE Secrets Setup${NC}"

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
print_status "GCP project configured: ${PROJECT_ID}"

# Step 2: Create service account
echo -e "\n${BLUE}👤 Creating service account...${NC}"
if ! gcloud iam service-accounts describe ${SERVICE_ACCOUNT_EMAIL} &> /dev/null; then
    gcloud iam service-accounts create ${SERVICE_ACCOUNT_NAME} \
        --display-name="Orchestrator Service Account for Voice Agent Phase 2"
    print_status "Service account created: ${SERVICE_ACCOUNT_EMAIL}"
else
    print_status "Service account already exists: ${SERVICE_ACCOUNT_EMAIL}"
fi

# Step 3: Grant necessary permissions
echo -e "\n${BLUE}🔑 Granting permissions...${NC}"

# Grant basic permissions for AI services
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/aiplatform.user"

# Grant Cloud Storage permissions
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/storage.objectViewer"

# Grant basic editor role for development
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/editor"

print_status "Permissions granted to service account"

# Step 4: Create and download service account key
echo -e "\n${BLUE}📄 Creating service account key...${NC}"
if [ ! -f "gcp-credentials.json" ]; then
    gcloud iam service-accounts keys create gcp-credentials.json \
        --iam-account=${SERVICE_ACCOUNT_EMAIL}
    print_status "Service account key created: gcp-credentials.json"
else
    print_warning "Service account key already exists: gcp-credentials.json"
fi

# Step 5: Google AI services are configured via service account
echo -e "\n${BLUE}🔑 Google AI services configured via service account${NC}"
print_status "Google AI services (Speech-to-Text, Text-to-Speech, Gemini) are configured via the service account"

# Step 6: Create Kubernetes secrets
echo -e "\n${BLUE}🔐 Creating Kubernetes secrets...${NC}"

# Create namespace if it doesn't exist
kubectl create namespace voice-agent-phase2 --dry-run=client -o yaml | kubectl apply -f -

# Create Google AI secrets
echo -e "\n${BLUE}📝 Creating Google AI secrets...${NC}"
kubectl create secret generic google-ai-secrets \
    --namespace=voice-agent-phase2 \
    --from-file=google-credentials.json=gcp-credentials.json \
    --from-literal=project-id=${PROJECT_ID} \
    --dry-run=client -o yaml | kubectl apply -f -

# Note: OpenAI secrets not needed for Phase 2 (using Google AI services)
echo -e "\n${BLUE}📝 OpenAI secrets not required for Phase 2${NC}"
print_status "Phase 2 uses Google AI services exclusively"

print_status "Kubernetes secrets created"

# Step 7: Verify secrets
echo -e "\n${BLUE}🔍 Verifying secrets...${NC}"
kubectl get secrets -n voice-agent-phase2

# Step 8: Create secrets YAML file for reference
echo -e "\n${BLUE}📄 Creating secrets reference file...${NC}"
cat > secrets-reference.yaml << EOF
# Phase 2 GKE Secrets Reference
# This file shows the secrets that have been created

apiVersion: v1
kind: Secret
metadata:
  name: google-ai-secrets
  namespace: voice-agent-phase2
type: Opaque
data:
  # google-credentials.json: [base64 encoded service account key]
  project-id: $(echo -n "${PROJECT_ID}" | base64)

---
apiVersion: v1
kind: Secret
metadata:
  name: openai-secrets
  namespace: voice-agent-phase2
type: Opaque
data:
  # api-key: [base64 encoded OpenAI API key]
EOF

print_status "Secrets reference file created: secrets-reference.yaml"

# Step 9: Display configuration summary
echo -e "\n${BLUE}📋 Configuration Summary${NC}"
echo -e "${GREEN}Project ID:${NC} ${PROJECT_ID}"
echo -e "${GREEN}Service Account:${NC} ${SERVICE_ACCOUNT_EMAIL}"
echo -e "${GREEN}Service Account Key:${NC} gcp-credentials.json"
echo -e "${GREEN}Google AI Services:${NC} [configured via service account]"
echo -e "${GREEN}Kubernetes Namespace:${NC} voice-agent-phase2"
echo -e "${GREEN}Secrets Created:${NC}"
echo -e "  - google-ai-secrets"

# Step 10: Clean up sensitive files
echo -e "\n${BLUE}🧹 Cleaning up sensitive files...${NC}"
read -p "Do you want to remove the service account key file? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f gcp-credentials.json
    print_status "Service account key file removed"
else
    print_warning "Service account key file preserved. Keep it secure!"
fi

print_status "Phase 2 GKE secrets setup completed successfully!"

echo -e "\n${YELLOW}🚀 Next Steps:${NC}"
echo -e "1. Build and push Docker images: ./build-images-gke.sh"
echo -e "2. Deploy application: ./deploy-gke.sh"
echo -e "3. Verify secrets are working in the deployment"

echo -e "\n${GREEN}🎉 Secrets are configured and ready for Phase 2 deployment!${NC}" 