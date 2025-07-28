#!/bin/bash

# Voice Agent Production Deployment Script
# Deploys complete Phase 2 system to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="voice-agent-production"
FRONTEND_DIR="$(pwd)"
BACKEND_DIR="../../Dharsan-VoiceAgent-Backend/v2"
K8S_DIR="k8s/phase2"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${PURPLE}================================${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}================================${NC}\n"
}

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if connected to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check docker
    if ! command -v docker &> /dev/null; then
        print_error "docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    
    print_success "All prerequisites are satisfied"
    print_status "Connected to cluster: $(kubectl config current-context)"
}

# Function to create namespace
create_namespace() {
    print_header "Creating Namespace"
    
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: ${NAMESPACE}
  labels:
    name: voice-agent-production
    phase: production
    version: v2
EOF
    
    print_success "Namespace '${NAMESPACE}' created"
}

# Function to build backend images
build_backend_images() {
    print_header "Building Backend Images"
    
    cd "${BACKEND_DIR}"
    
    # Build Media Server
    print_status "Building Media Server..."
    cd media-server
    docker build -t voice-agent/media-server:latest .
    print_success "Media Server image built"
    cd ..
    
    # Build Orchestrator
    print_status "Building Orchestrator..."
    cd orchestrator
    docker build -t voice-agent/orchestrator:latest .
    print_success "Orchestrator image built"
    cd ..
    
    cd "${FRONTEND_DIR}"
}

# Function to build frontend image
build_frontend_image() {
    print_header "Building Frontend Image"
    
    # Build the React app
    print_status "Building React application..."
    npm run build
    
    # Create Dockerfile for production
    cat <<EOF > Dockerfile.production
FROM nginx:alpine

# Copy built React app
COPY dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF
    
    # Create nginx configuration
    cat <<EOF > nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Handle React routing
        location / {
            try_files \$uri \$uri/ /index.html;
        }
        
        # API proxy
        location /api/ {
            proxy_pass http://orchestrator:8001/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
        
        # WebSocket proxy
        location /ws {
            proxy_pass http://orchestrator:8001/ws;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # WHIP proxy
        location /whip {
            proxy_pass http://media-server:8080/whip;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF
    
    # Build Docker image
    print_status "Building Docker image..."
    docker build -f Dockerfile.production -t voice-agent/frontend:latest .
    print_success "Frontend image built"
}

# Function to create secrets
create_secrets() {
    print_header "Creating Secrets"
    
    # Create secrets template
    cat <<EOF > k8s-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: voice-agent-secrets
  namespace: ${NAMESPACE}
type: Opaque
data:
  # Add your base64 encoded secrets here
  # GOOGLE_APPLICATION_CREDENTIALS: <base64-encoded-json>
  # OPENAI_API_KEY: <base64-encoded-key>
  # REDIS_PASSWORD: <base64-encoded-password>
EOF
    
    print_warning "Please edit k8s-secrets.yaml and add your actual secrets"
    print_status "Then run: kubectl apply -f k8s-secrets.yaml"
    
    # Create a placeholder secret for now
    kubectl create secret generic voice-agent-secrets \
        --from-literal=placeholder=placeholder \
        --namespace=${NAMESPACE} \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "Secrets placeholder created"
}

# Function to deploy Redpanda (Kafka)
deploy_redpanda() {
    print_header "Deploying Redpanda (Kafka)"
    
    cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redpanda
  namespace: ${NAMESPACE}
  labels:
    app: redpanda
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redpanda
  template:
    metadata:
      labels:
        app: redpanda
    spec:
      containers:
      - name: redpanda
        image: redpandadata/redpanda:latest
        ports:
        - containerPort: 9092
        - containerPort: 8081
        - containerPort: 8082
        env:
        - name: REDPANDA_BROKERS
          value: "0"
        - name: REDPANDA_ADVERTISE_KAFKA_ADDR
          value: "redpanda:9092"
        - name: REDPANDA_ADVERTISE_RPC_ADDR
          value: "redpanda:33145"
        - name: REDPANDA_CHECK_QUORUM
          value: "false"
        - name: REDPANDA_ENABLE_TRANSACTIONS
          value: "true"
        - name: REDPANDA_ENABLE_IDEMPOTENCE
          value: "true"
        - name: REDPANDA_ENABLE_RACK_AWARENESS
          value: "true"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8081
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8081
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: redpanda
  namespace: ${NAMESPACE}
  labels:
    app: redpanda
spec:
  ports:
  - port: 9092
    targetPort: 9092
    name: kafka
  - port: 8081
    targetPort: 8081
    name: admin
  - port: 8082
    targetPort: 8082
    name: schema-registry
  selector:
    app: redpanda
EOF
    
    print_success "Redpanda deployment created"
    
    # Wait for Redpanda to be ready
    print_status "Waiting for Redpanda to be ready..."
    kubectl wait --for=condition=ready pod -l app=redpanda -n ${NAMESPACE} --timeout=300s
    
    # Create Kafka topics
    print_status "Creating Kafka topics..."
    kubectl exec -n ${NAMESPACE} deployment/redpanda -- rpk topic create audio-in --if-not-exists
    kubectl exec -n ${NAMESPACE} deployment/redpanda -- rpk topic create audio-out --if-not-exists
    print_success "Kafka topics created"
}

# Function to deploy Media Server
deploy_media_server() {
    print_header "Deploying Media Server"
    
    cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: media-server
  namespace: ${NAMESPACE}
  labels:
    app: media-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: media-server
  template:
    metadata:
      labels:
        app: media-server
    spec:
      containers:
      - name: media-server
        image: voice-agent/media-server:latest
        ports:
        - containerPort: 8080
        env:
        - name: KAFKA_BROKERS
          value: "redpanda:9092"
        - name: LOG_LEVEL
          value: "info"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: media-server
  namespace: ${NAMESPACE}
  labels:
    app: media-server
spec:
  ports:
  - port: 8080
    targetPort: 8080
    name: http
  selector:
    app: media-server
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: media-server-hpa
  namespace: ${NAMESPACE}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: media-server
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF
    
    print_success "Media Server deployment created"
}

# Function to deploy Orchestrator
deploy_orchestrator() {
    print_header "Deploying Orchestrator"
    
    cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orchestrator
  namespace: ${NAMESPACE}
  labels:
    app: orchestrator
spec:
  replicas: 2
  selector:
    matchLabels:
      app: orchestrator
  template:
    metadata:
      labels:
        app: orchestrator
    spec:
      containers:
      - name: orchestrator
        image: voice-agent/orchestrator:latest
        ports:
        - containerPort: 8001
        env:
        - name: KAFKA_BROKERS
          value: "redpanda:9092"
        - name: LOG_LEVEL
          value: "info"
        envFrom:
        - secretRef:
            name: voice-agent-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: orchestrator
  namespace: ${NAMESPACE}
  labels:
    app: orchestrator
spec:
  ports:
  - port: 8001
    targetPort: 8001
    name: http
  selector:
    app: orchestrator
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: orchestrator-hpa
  namespace: ${NAMESPACE}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: orchestrator
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF
    
    print_success "Orchestrator deployment created"
}

# Function to deploy Frontend
deploy_frontend() {
    print_header "Deploying Frontend"
    
    cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: ${NAMESPACE}
  labels:
    app: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: voice-agent/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: ${NAMESPACE}
  labels:
    app: frontend
spec:
  ports:
  - port: 80
    targetPort: 80
    name: http
  selector:
    app: frontend
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
  namespace: ${NAMESPACE}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 3
  maxReplicas: 15
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF
    
    print_success "Frontend deployment created"
}

# Function to deploy Ingress
deploy_ingress() {
    print_header "Deploying Ingress"
    
    cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: voice-agent-ingress
  namespace: ${NAMESPACE}
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/websocket-services: "orchestrator"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
spec:
  rules:
  - host: voice-agent.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: orchestrator
            port:
              number: 8001
      - path: /ws
        pathType: Prefix
        backend:
          service:
            name: orchestrator
            port:
              number: 8001
      - path: /whip
        pathType: Prefix
        backend:
          service:
            name: media-server
            port:
              number: 8080
EOF
    
    print_success "Ingress created"
}

# Function to deploy monitoring
deploy_monitoring() {
    print_header "Deploying Monitoring"
    
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: ${NAMESPACE}
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'voice-agent-services'
      static_configs:
      - targets: ['media-server:8080', 'orchestrator:8001', 'frontend:80']
      metrics_path: /metrics
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: ${NAMESPACE}
  labels:
    app: prometheus
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        args:
        - '--config.file=/etc/prometheus/prometheus.yml'
        - '--storage.tsdb.path=/prometheus'
        - '--web.console.libraries=/etc/prometheus/console_libraries'
        - '--web.console.templates=/etc/prometheus/consoles'
        - '--storage.tsdb.retention.time=200h'
        - '--web.enable-lifecycle'
      volumes:
      - name: config
        configMap:
          name: prometheus-config
---
apiVersion: v1
kind: Service
metadata:
  name: prometheus
  namespace: ${NAMESPACE}
  labels:
    app: prometheus
spec:
  ports:
  - port: 9090
    targetPort: 9090
    name: http
  selector:
    app: prometheus
EOF
    
    print_success "Monitoring deployed"
}

# Function to wait for deployments
wait_for_deployments() {
    print_header "Waiting for Deployments"
    
    print_status "Waiting for Media Server..."
    kubectl wait --for=condition=available deployment/media-server -n ${NAMESPACE} --timeout=300s
    
    print_status "Waiting for Orchestrator..."
    kubectl wait --for=condition=available deployment/orchestrator -n ${NAMESPACE} --timeout=300s
    
    print_status "Waiting for Frontend..."
    kubectl wait --for=condition=available deployment/frontend -n ${NAMESPACE} --timeout=300s
    
    print_success "All deployments are ready"
}

# Function to show deployment status
show_status() {
    print_header "Deployment Status"
    
    echo -e "${CYAN}Namespace:${NC} ${NAMESPACE}"
    echo -e "${CYAN}Cluster:${NC} $(kubectl config current-context)"
    echo -e "\n${CYAN}Services:${NC}"
    kubectl get services -n ${NAMESPACE}
    
    echo -e "\n${CYAN}Deployments:${NC}"
    kubectl get deployments -n ${NAMESPACE}
    
    echo -e "\n${CYAN}Pods:${NC}"
    kubectl get pods -n ${NAMESPACE}
    
    echo -e "\n${CYAN}Ingress:${NC}"
    kubectl get ingress -n ${NAMESPACE}
    
    echo -e "\n${CYAN}Access URLs:${NC}"
    echo -e "Frontend: http://voice-agent.local"
    echo -e "Prometheus: http://voice-agent.local:9090"
    
    print_warning "Add 'voice-agent.local' to your /etc/hosts file to access the application"
}

# Main deployment function
main() {
    print_header "Voice Agent Production Deployment"
    print_status "Starting deployment to Kubernetes cluster"
    
    # Check prerequisites
    check_prerequisites
    
    # Create namespace
    create_namespace
    
    # Build images
    build_backend_images
    build_frontend_image
    
    # Create secrets
    create_secrets
    
    # Deploy services
    deploy_redpanda
    deploy_media_server
    deploy_orchestrator
    deploy_frontend
    deploy_ingress
    deploy_monitoring
    
    # Wait for deployments
    wait_for_deployments
    
    # Show status
    show_status
    
    print_header "Deployment Complete!"
    print_success "Voice Agent is now deployed to production"
    print_status "Access the application at: http://voice-agent.local"
}

# Run main function
main "$@" 