import React, { useState, useEffect } from 'react';
import { getServiceUrls } from '../config/production';

interface VersionInfo {
  name: string;
  description: string;
  status: string;
  endpoints: {
    websocket: string;
    health: string;
    [key: string]: string;
  };
}

interface VersionConfig {
  v1: VersionInfo;
  v2: VersionInfo;
  webrtc?: VersionInfo;
}

interface VersionSwitcherProps {
  onVersionChange: (version: 'v1' | 'v2' | 'webrtc') => void;
  currentVersion: 'v1' | 'v2' | 'webrtc';
}

const VersionSwitcher: React.FC<VersionSwitcherProps> = ({ 
  onVersionChange, 
  currentVersion 
}) => {
  const [versions, setVersions] = useState<VersionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      console.log('Fetching versions from backend...');
      // Use the unified config system
      const { orchestratorHttpUrl } = getServiceUrls();
      const baseUrl = orchestratorHttpUrl;
      console.log('Base URL:', baseUrl);
      const response = await fetch(`${baseUrl}/versions`);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch version information: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Versions data:', data);
      setVersions(data.versions);
    } catch (err) {
      console.error('Error fetching versions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleVersionChange = (version: 'v1' | 'v2' | 'webrtc') => {
    onVersionChange(version);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading versions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading versions</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!versions) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Voice AI Version</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Current:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            currentVersion === 'v1' 
              ? 'bg-green-100 text-green-800' 
              : currentVersion === 'v2'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          }`}>
            {currentVersion.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* V1 Card */}
        <div className={`border-2 rounded-lg p-4 transition-all duration-200 ${
          currentVersion === 'v1' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">{versions.v1.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              versions.v1.status === 'stable' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {versions.v1.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{versions.v1.description}</p>
          <button
            onClick={() => handleVersionChange('v1')}
            className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentVersion === 'v1'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {currentVersion === 'v1' ? 'Currently Active' : 'Switch to V1'}
          </button>
        </div>

        {/* V2 Card */}
        <div className={`border-2 rounded-lg p-4 transition-all duration-200 ${
          currentVersion === 'v2' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">{versions.v2.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              versions.v2.status === 'stable' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {versions.v2.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{versions.v2.description}</p>
          <button
            onClick={() => handleVersionChange('v2')}
            className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentVersion === 'v2'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {currentVersion === 'v2' ? 'Currently Active' : 'Switch to V2'}
          </button>
        </div>

        {/* WebRTC Card */}
        <div className={`border-2 rounded-lg p-4 transition-all duration-200 ${
          currentVersion === 'webrtc' 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">WebRTC Version</h3>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
              experimental
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">Ultra-low latency audio transport using WebRTC and UDP</p>
          <button
            onClick={() => handleVersionChange('webrtc')}
            className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentVersion === 'webrtc'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {currentVersion === 'webrtc' ? 'Currently Active' : 'Switch to WebRTC'}
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Version Features</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            <span>V1: Stable, tested implementation</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            <span>V2: New features, modular architecture</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
            <span>WebRTC: Ultra-low latency UDP transport</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionSwitcher; 