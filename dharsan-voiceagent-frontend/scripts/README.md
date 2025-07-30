# Scripts Directory

This directory contains utility scripts for deployment, testing, and maintenance of the Voice Agent Frontend.

## 📋 Scripts Index

### 🚀 Deployment Scripts
- **[check-deployment.sh](./check-deployment.sh)** - Deployment status checking and validation
- **[deploy-production.sh](./deploy-production.sh)** - Production deployment automation
- **[deploy.sh](./deploy.sh)** - General deployment script

### 🔧 Utility Scripts
- **[quick-service-check.js](./quick-service-check.js)** - Quick service health check utility

## 📖 How to Use

### For Deployment
```bash
# Check deployment status
./scripts/check-deployment.sh

# Deploy to production
./scripts/deploy-production.sh

# General deployment
./scripts/deploy.sh
```

### For Service Monitoring
```bash
# Quick service health check
node scripts/quick-service-check.js
```

## ⚠️ Important Notes

- **Permissions**: Make sure scripts are executable (`chmod +x script.sh`)
- **Environment**: Ensure proper environment variables are set before running deployment scripts
- **Backup**: Always backup before running deployment scripts
- **Testing**: Test scripts in staging environment first

## 🔗 Related Documentation

- **[Deployment Documentation](../docs/deployment/)** - Detailed deployment guides
- **[Testing Documentation](../docs/testing/)** - Testing procedures
- **[Implementation Documentation](../docs/implementation/)** - Feature implementation details

## 🛡️ Security Considerations

- Scripts may contain sensitive information
- Review scripts before execution
- Use environment variables for secrets
- Follow security best practices
- Monitor script execution logs 