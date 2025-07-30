import React, { useState, useEffect, useMemo } from 'react';
import { getServiceUrls } from '../config/production';

interface TestResult {
  service: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  url: string;
}

const ProductionConfigTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  // Debug: Track component renders
  console.log('🔧 [CONFIG_TEST] Component rendered');

  // Memoize service URLs to prevent re-renders
  const serviceUrls = useMemo(() => {
    console.log('🔧 [CONFIG_TEST] Memoizing service URLs');
    return getServiceUrls();
  }, []);
  const isProduction = useMemo(() => serviceUrls.whipUrl.includes('localhost') ? false : true, [serviceUrls.whipUrl]);
  const forceProduction = useMemo(() => new URLSearchParams(window.location.search).get('production') === 'true', []);

  const runTests = async () => {
    setIsTesting(true);
    const results: TestResult[] = [];
    const { whipUrl, orchestratorHttpUrl, orchestratorWsUrl } = getServiceUrls();
    
    // Test 1: WHIP Endpoint
    results.push({
      service: 'WHIP Endpoint',
      status: 'pending',
      message: 'Testing...',
      url: whipUrl
    });
    
    try {
      const response = await fetch(whipUrl, {
        method: 'OPTIONS',
        headers: { 'Content-Type': 'application/sdp' }
      });
      
      if (response.status === 405 || response.status === 200) {
        results[0].status = 'success';
        results[0].message = 'WHIP endpoint is accessible';
      } else {
        results[0].status = 'error';
        results[0].message = `Unexpected status: ${response.status}`;
      }
    } catch (error) {
      results[0].status = 'error';
      results[0].message = `Connection failed: ${error}`;
    }

    // Test 2: Orchestrator HTTP
    results.push({
      service: 'Orchestrator HTTP',
      status: 'pending',
      message: 'Testing...',
      url: orchestratorHttpUrl
    });
    
    try {
      const response = await fetch(`${orchestratorHttpUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        results[1].status = 'success';
        results[1].message = `Orchestrator HTTP is accessible (${data.status})`;
      } else {
        results[1].status = 'error';
        results[1].message = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      results[1].status = 'error';
      results[1].message = `Connection failed: ${error}`;
    }

    // Test 3: WebSocket Connection
    results.push({
      service: 'Orchestrator WebSocket',
      status: 'pending',
      message: 'Testing...',
      url: orchestratorWsUrl
    });
    
    try {
      const ws = new WebSocket(orchestratorWsUrl);
      
      const wsPromise = new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 5000);
        
        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve(true);
        };
        
        ws.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };
      });
      
      const wsSuccess = await wsPromise;
      if (wsSuccess) {
        results[2].status = 'success';
        results[2].message = 'WebSocket connection successful';
      } else {
        results[2].status = 'error';
        results[2].message = 'WebSocket connection failed';
      }
    } catch (error) {
      results[2].status = 'error';
      results[2].message = `WebSocket error: ${error}`;
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Production Configuration Test
      </h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Environment Detection</h3>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Current Hostname:</strong> {window.location.hostname}</p>
          <p><strong>Force Production:</strong> {forceProduction ? 'Yes' : 'No'}</p>
          <p><strong>Environment:</strong> {isProduction ? 'Production' : 'Development'}</p>
          <p><strong>Configuration Source:</strong> {isProduction ? 'GKE Production URLs' : 'Localhost URLs'}</p>
          <p><strong>Test Production:</strong> <a href="?production=true" className="text-blue-600 hover:underline">Add ?production=true to URL</a></p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Service URLs</h3>
        <div className="bg-gray-100 p-4 rounded space-y-2">
          <p><strong>WHIP URL:</strong> {serviceUrls.whipUrl}</p>
          <p><strong>Orchestrator HTTP:</strong> {serviceUrls.orchestratorHttpUrl}</p>
          <p><strong>Orchestrator WebSocket:</strong> {serviceUrls.orchestratorWsUrl}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Connection Tests</h3>
          <button
            onClick={runTests}
            disabled={isTesting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Run Tests'}
          </button>
        </div>
        
        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">{result.service}</h4>
                  <p className="text-sm text-gray-600">{result.url}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg ${getStatusColor(result.status)}`}>
                    {getStatusIcon(result.status)}
                  </span>
                </div>
              </div>
              <p className={`mt-2 text-sm ${getStatusColor(result.status)}`}>
                {result.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">Next Steps</h3>
        <ul className="text-blue-700 space-y-1">
          <li>• Configure DNS to point your domain to the LoadBalancer IP</li>
          <li>• Deploy the frontend to a static hosting service</li>
          <li>• Test the complete voice pipeline with the production URLs</li>
          <li>• Monitor performance and costs</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductionConfigTest; 