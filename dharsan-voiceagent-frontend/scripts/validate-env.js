#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * This script validates that all required environment variables are set
 * and checks for potential security issues.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Required environment variables for production
const requiredVars = {
  // OIDC Configuration
  'VITE_OIDC_ISSUER': 'OIDC Issuer URL',
  'VITE_OIDC_AUDIENCE': 'OIDC Audience',
  'VITE_OIDC_SCOPE': 'OIDC Scope',
  
  // Backend URLs
  'VITE_BACKEND_URL': 'Backend API URL',
  'VITE_WEBSOCKET_URL': 'WebSocket URL',
  'VITE_WHIP_URL': 'WHIP URL',
  
  // TURN Server
  'VITE_TURN_USERNAME': 'TURN Server Username',
  'VITE_TURN_CREDENTIAL': 'TURN Server Credential',
  
  // Environment
  'NODE_ENV': 'Node Environment',
  'VITE_ENVIRONMENT': 'Vite Environment',
  'VITE_APP_VERSION': 'App Version'
};

// Security-sensitive patterns to check
const securityPatterns = [
  /password/i,
  /secret/i,
  /key/i,
  /token/i,
  /credential/i,
  /auth/i
];

// Check if running in production
const isProduction = process.env.NODE_ENV === 'production' || 
                    process.env.VITE_ENVIRONMENT === 'production';

function validateEnvironmentVariables() {
  log('\n🔍 Validating Environment Variables...', 'cyan');
  
  let missingVars = [];
  let securityIssues = [];
  
  // Check required variables
  for (const [varName, description] of Object.entries(requiredVars)) {
    const value = process.env[varName];
    
    if (!value) {
      missingVars.push({ name: varName, description });
    } else {
      logSuccess(`${varName}: ${description}`);
      
      // Check for security issues
      if (securityPatterns.some(pattern => pattern.test(varName))) {
        if (value.includes('your_') || value.includes('placeholder') || value.includes('example')) {
          securityIssues.push(`${varName}: Contains placeholder value`);
        }
      }
    }
  }
  
  // Report missing variables
  if (missingVars.length > 0) {
    logError(`\nMissing ${missingVars.length} required environment variables:`);
    missingVars.forEach(({ name, description }) => {
      logError(`  - ${name}: ${description}`);
    });
  } else {
    logSuccess('\nAll required environment variables are set!');
  }
  
  // Report security issues
  if (securityIssues.length > 0) {
    logWarning(`\nFound ${securityIssues.length} potential security issues:`);
    securityIssues.forEach(issue => {
      logWarning(`  - ${issue}`);
    });
  }
  
  return missingVars.length === 0 && securityIssues.length === 0;
}

function checkGitignore() {
  log('\n🔒 Checking .gitignore Security...', 'cyan');
  
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    logError('.gitignore file not found!');
    return false;
  }
  
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const requiredPatterns = [
    /\.env/,
    /\.env\./,
    /secrets/,
    /\*\.key/,
    /\*\.pem/,
    /\*\.crt/,
    /service-account/,
    /credentials\.json/
  ];
  
  let missingPatterns = [];
  
  requiredPatterns.forEach(pattern => {
    if (!pattern.test(gitignoreContent)) {
      missingPatterns.push(pattern.source);
    }
  });
  
  if (missingPatterns.length > 0) {
    logError(`\nMissing security patterns in .gitignore:`);
    missingPatterns.forEach(pattern => {
      logError(`  - ${pattern}`);
    });
    return false;
  } else {
    logSuccess('.gitignore contains all required security patterns!');
    return true;
  }
}

function checkEnvironmentFiles() {
  log('\n📁 Checking Environment Files...', 'cyan');
  
  const envFiles = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.development'
  ];
  
  let foundEnvFiles = [];
  
  envFiles.forEach(envFile => {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      foundEnvFiles.push(envFile);
    }
  });
  
  if (foundEnvFiles.length > 0) {
    logWarning(`\nFound environment files in repository:`);
    foundEnvFiles.forEach(file => {
      logWarning(`  - ${file}`);
    });
    logWarning('Make sure these files are in .gitignore!');
    return false;
  } else {
    logSuccess('No environment files found in repository (good for security)!');
    return true;
  }
}

function checkProductionSettings() {
  if (!isProduction) {
    return true;
  }
  
  log('\n🚀 Checking Production Settings...', 'cyan');
  
  const productionChecks = [
    {
      name: 'Debug Mode',
      value: process.env.VITE_ENABLE_DEBUG,
      expected: 'false',
      critical: true
    },
    {
      name: 'HTTPS URLs',
      value: process.env.VITE_BACKEND_URL,
      expected: 'https://',
      critical: true
    },
    {
      name: 'WSS URLs',
      value: process.env.VITE_WEBSOCKET_URL,
      expected: 'wss://',
      critical: true
    }
  ];
  
  let issues = [];
  
  productionChecks.forEach(check => {
    if (check.critical && check.value !== check.expected && !check.value?.startsWith(check.expected)) {
      issues.push(`${check.name}: Expected "${check.expected}", got "${check.value}"`);
    }
  });
  
  if (issues.length > 0) {
    logError(`\nProduction configuration issues:`);
    issues.forEach(issue => {
      logError(`  - ${issue}`);
    });
    return false;
  } else {
    logSuccess('Production settings are properly configured!');
    return true;
  }
}

function main() {
  log('🔐 Voice Agent Frontend - Environment Validation', 'magenta');
  log('================================================', 'magenta');
  
  const results = {
    envVars: validateEnvironmentVariables(),
    gitignore: checkGitignore(),
    envFiles: checkEnvironmentFiles(),
    production: checkProductionSettings()
  };
  
  log('\n📊 Validation Summary:', 'cyan');
  log('====================', 'cyan');
  
  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} ${check}`, color);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log('\n🎉 All checks passed! Environment is properly configured.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some checks failed. Please review the issues above.', 'yellow');
    process.exit(1);
  }
}

// Run the validation
main();

export {
  validateEnvironmentVariables,
  checkGitignore,
  checkEnvironmentFiles,
  checkProductionSettings
}; 