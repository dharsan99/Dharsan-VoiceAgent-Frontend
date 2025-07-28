#!/bin/bash

# Voice Agent Deployment Status Checker
# Provides real-time status of all deployed components

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

# Function to check if namespace exists
check_namespace() {
    print_header "Namespace Status"
    
    if kubectl get namespace ${NAMESPACE} &> /dev/null; then
        print_success "Namespace '${NAMESPACE}' exists"
        kubectl get namespace ${NAMESPACE}
    else
        print_error "Namespace '${NAMESPACE}' does not exist"
        return 1
    fi
}

# Function to check pod status
check_pods() {
    print_header "Pod Status"
    
    local pods=$(kubectl get pods -n ${NAMESPACE} --no-headers 2>/dev/null)
    
    if [ -z "$pods" ]; then
        print_warning "No pods found in namespace ${NAMESPACE}"
        return
    fi
    
    echo -e "${CYAN}Pod Status Summary:${NC}"
    kubectl get pods -n ${NAMESPACE}
    
    echo -e "\n${CYAN}Pod Details:${NC}"
    kubectl get pods -n ${NAMESPACE} -o wide
    
    # Check for failed pods
    local failed_pods=$(kubectl get pods -n ${NAMESPACE} --field-selector=status.phase=Failed --no-headers 2>/dev/null)
    if [ ! -z "$failed_pods" ]; then
        print_error "Failed pods detected:"
        echo "$failed_pods"
    fi
    
    # Check for pending pods
    local pending_pods=$(kubectl get pods -n ${NAMESPACE} --field-selector=status.phase=Pending --no-headers 2>/dev/null)
    if [ ! -z "$pending_pods" ]; then
        print_warning "Pending pods detected:"
        echo "$pending_pods"
    fi
}

# Function to check service status
check_services() {
    print_header "Service Status"
    
    local services=$(kubectl get services -n ${NAMESPACE} --no-headers 2>/dev/null)
    
    if [ -z "$services" ]; then
        print_warning "No services found in namespace ${NAMESPACE}"
        return
    fi
    
    echo -e "${CYAN}Services:${NC}"
    kubectl get services -n ${NAMESPACE}
    
    echo -e "\n${CYAN}Service Endpoints:${NC}"
    kubectl get endpoints -n ${NAMESPACE}
}

# Function to check deployment status
check_deployments() {
    print_header "Deployment Status"
    
    local deployments=$(kubectl get deployments -n ${NAMESPACE} --no-headers 2>/dev/null)
    
    if [ -z "$deployments" ]; then
        print_warning "No deployments found in namespace ${NAMESPACE}"
        return
    fi
    
    echo -e "${CYAN}Deployments:${NC}"
    kubectl get deployments -n ${NAMESPACE}
    
    echo -e "\n${CYAN}Deployment Details:${NC}"
    kubectl describe deployments -n ${NAMESPACE}
}

# Function to check ingress status
check_ingress() {
    print_header "Ingress Status"
    
    local ingress=$(kubectl get ingress -n ${NAMESPACE} --no-headers 2>/dev/null)
    
    if [ -z "$ingress" ]; then
        print_warning "No ingress found in namespace ${NAMESPACE}"
        return
    fi
    
    echo -e "${CYAN}Ingress:${NC}"
    kubectl get ingress -n ${NAMESPACE}
    
    echo -e "\n${CYAN}Ingress Details:${NC}"
    kubectl describe ingress -n ${NAMESPACE}
}

# Function to check resource usage
check_resources() {
    print_header "Resource Usage"
    
    echo -e "${CYAN}Pod Resource Usage:${NC}"
    if command -v kubectl top &> /dev/null; then
        kubectl top pods -n ${NAMESPACE} 2>/dev/null || print_warning "Metrics server not available"
    else
        print_warning "kubectl top not available"
    fi
    
    echo -e "\n${CYAN}Node Resource Usage:${NC}"
    if command -v kubectl top &> /dev/null; then
        kubectl top nodes 2>/dev/null || print_warning "Metrics server not available"
    else
        print_warning "kubectl top not available"
    fi
}

# Function to check logs
check_logs() {
    print_header "Recent Logs"
    
    local pods=$(kubectl get pods -n ${NAMESPACE} --no-headers -o custom-columns=":metadata.name" 2>/dev/null)
    
    if [ -z "$pods" ]; then
        print_warning "No pods found to check logs"
        return
    fi
    
    for pod in $pods; do
        echo -e "\n${CYAN}Logs for ${pod}:${NC}"
        kubectl logs --tail=10 -n ${NAMESPACE} ${pod} 2>/dev/null || print_warning "Could not get logs for ${pod}"
    done
}

# Function to check events
check_events() {
    print_header "Recent Events"
    
    echo -e "${CYAN}Events in namespace ${NAMESPACE}:${NC}"
    kubectl get events -n ${NAMESPACE} --sort-by='.lastTimestamp' --no-headers | tail -20 2>/dev/null || print_warning "Could not get events"
}

# Function to check connectivity
check_connectivity() {
    print_header "Service Connectivity"
    
    # Check if services are accessible
    local services=("frontend" "media-server" "orchestrator" "redpanda")
    
    for service in "${services[@]}"; do
        echo -e "\n${CYAN}Testing ${service}:${NC}"
        
        # Get service port
        local port=$(kubectl get service ${service} -n ${NAMESPACE} -o jsonpath='{.spec.ports[0].port}' 2>/dev/null)
        
        if [ ! -z "$port" ]; then
            # Test connectivity
            if kubectl exec -n ${NAMESPACE} $(kubectl get pods -n ${NAMESPACE} -l app=frontend -o jsonpath='{.items[0].metadata.name}') -- curl -s http://${service}:${port}/health &> /dev/null; then
                print_success "${service} is accessible"
            else
                print_warning "${service} connectivity test failed"
            fi
        else
            print_warning "Could not determine port for ${service}"
        fi
    done
}

# Function to check health endpoints
check_health() {
    print_header "Health Endpoints"
    
    local services=("frontend" "media-server" "orchestrator")
    
    for service in "${services[@]}"; do
        echo -e "\n${CYAN}Health check for ${service}:${NC}"
        
        # Get service port
        local port=$(kubectl get service ${service} -n ${NAMESPACE} -o jsonpath='{.spec.ports[0].port}' 2>/dev/null)
        
        if [ ! -z "$port" ]; then
            # Check health endpoint
            local health_response=$(kubectl exec -n ${NAMESPACE} $(kubectl get pods -n ${NAMESPACE} -l app=frontend -o jsonpath='{.items[0].metadata.name}') -- curl -s http://${service}:${port}/health 2>/dev/null)
            
            if [ ! -z "$health_response" ]; then
                print_success "${service} health: ${health_response}"
            else
                print_warning "${service} health check failed"
            fi
        else
            print_warning "Could not determine port for ${service}"
        fi
    done
}

# Function to check auto-scaling
check_autoscaling() {
    print_header "Auto-scaling Status"
    
    local hpas=$(kubectl get hpa -n ${NAMESPACE} --no-headers 2>/dev/null)
    
    if [ -z "$hpas" ]; then
        print_warning "No HorizontalPodAutoscalers found in namespace ${NAMESPACE}"
        return
    fi
    
    echo -e "${CYAN}Horizontal Pod Autoscalers:${NC}"
    kubectl get hpa -n ${NAMESPACE}
    
    echo -e "\n${CYAN}HPA Details:${NC}"
    kubectl describe hpa -n ${NAMESPACE}
}

# Function to check monitoring
check_monitoring() {
    print_header "Monitoring Status"
    
    # Check if Prometheus is running
    local prometheus_pod=$(kubectl get pods -n ${NAMESPACE} -l app=prometheus --no-headers -o custom-columns=":metadata.name" 2>/dev/null)
    
    if [ ! -z "$prometheus_pod" ]; then
        print_success "Prometheus pod found: ${prometheus_pod}"
        
        # Check Prometheus status
        local prometheus_status=$(kubectl exec -n ${NAMESPACE} ${prometheus_pod} -- curl -s http://localhost:9090/-/healthy 2>/dev/null)
        
        if [ "$prometheus_status" = "OK" ]; then
            print_success "Prometheus is healthy"
        else
            print_warning "Prometheus health check failed"
        fi
    else
        print_warning "Prometheus not found"
    fi
}

# Function to show access information
show_access_info() {
    print_header "Access Information"
    
    echo -e "${CYAN}Application URLs:${NC}"
    echo -e "Frontend: http://voice-agent.local"
    echo -e "Prometheus: http://voice-agent.local:9090"
    
    echo -e "\n${CYAN}Service Ports:${NC}"
    kubectl get services -n ${NAMESPACE} -o custom-columns="NAME:.metadata.name,PORT:.spec.ports[0].port,TARGET_PORT:.spec.ports[0].targetPort"
    
    echo -e "\n${CYAN}External IPs:${NC}"
    kubectl get services -n ${NAMESPACE} -o custom-columns="NAME:.metadata.name,EXTERNAL_IP:.status.loadBalancer.ingress[0].ip"
    
    print_warning "Add 'voice-agent.local' to your /etc/hosts file to access the application"
}

# Function to show summary
show_summary() {
    print_header "Deployment Summary"
    
    local total_pods=$(kubectl get pods -n ${NAMESPACE} --no-headers 2>/dev/null | wc -l)
    local running_pods=$(kubectl get pods -n ${NAMESPACE} --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)
    local failed_pods=$(kubectl get pods -n ${NAMESPACE} --field-selector=status.phase=Failed --no-headers 2>/dev/null | wc -l)
    local pending_pods=$(kubectl get pods -n ${NAMESPACE} --field-selector=status.phase=Pending --no-headers 2>/dev/null | wc -l)
    
    echo -e "${CYAN}Pod Summary:${NC}"
    echo -e "Total Pods: ${total_pods}"
    echo -e "Running: ${running_pods}"
    echo -e "Failed: ${failed_pods}"
    echo -e "Pending: ${pending_pods}"
    
    local total_services=$(kubectl get services -n ${NAMESPACE} --no-headers 2>/dev/null | wc -l)
    local total_deployments=$(kubectl get deployments -n ${NAMESPACE} --no-headers 2>/dev/null | wc -l)
    
    echo -e "\n${CYAN}Resource Summary:${NC}"
    echo -e "Services: ${total_services}"
    echo -e "Deployments: ${total_deployments}"
    
    # Overall status
    if [ $failed_pods -eq 0 ] && [ $pending_pods -eq 0 ] && [ $running_pods -gt 0 ]; then
        print_success "All systems operational"
    elif [ $failed_pods -gt 0 ]; then
        print_error "Some pods have failed"
    elif [ $pending_pods -gt 0 ]; then
        print_warning "Some pods are still pending"
    else
        print_warning "No pods are running"
    fi
}

# Main function
main() {
    print_header "Voice Agent Deployment Status Checker"
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if connected to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_status "Connected to cluster: $(kubectl config current-context)"
    
    # Run all checks
    check_namespace
    check_pods
    check_services
    check_deployments
    check_ingress
    check_resources
    check_logs
    check_events
    check_connectivity
    check_health
    check_autoscaling
    check_monitoring
    show_access_info
    show_summary
    
    print_header "Status Check Complete"
    print_success "Deployment status check completed"
}

# Run main function
main "$@" 