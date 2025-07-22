import React, { useState } from 'react';
import { useVoiceAgentV2 } from '../hooks/useVoiceAgentV2';

const VoiceAgentV2: React.FC = () => {
  const {
    connectionStatus,
    processingStatus,
    sessionId,
    transcript,
    interimTranscript,
    aiResponse,
    error,
    version,
    isRecording,
    sessionInfo,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    clearTranscript,
    clearError
  } = useVoiceAgentV2();

  const [showSessionInfo, setShowSessionInfo] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProcessingColor = (status: string) => {
    switch (status) {
      case 'listening': return 'text-blue-600';
      case 'processing': return 'text-yellow-600';
      case 'speaking': return 'text-purple-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'connecting':
        return (
          <svg className="w-5 h-5 text-yellow-600 animate-spin" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Voice AI v2.0</h1>
            <p className="text-gray-600">Advanced voice interaction with modular architecture</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(connectionStatus)}
              <span className={`text-sm font-medium ${getStatusColor(connectionStatus)}`}>
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                processingStatus === 'listening' ? 'bg-blue-500 animate-pulse' :
                processingStatus === 'processing' ? 'bg-yellow-500 animate-pulse' :
                processingStatus === 'speaking' ? 'bg-purple-500 animate-pulse' :
                processingStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
              <span className={`text-sm font-medium ${getProcessingColor(processingStatus)}`}>
                {processingStatus.charAt(0).toUpperCase() + processingStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        {sessionId && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Session: <span className="font-mono">{sessionId}</span>
            </div>
            <button
              onClick={() => setShowSessionInfo(!showSessionInfo)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showSessionInfo ? 'Hide' : 'Show'} Session Info
            </button>
          </div>
        )}
      </div>

      {/* Session Info */}
      {showSessionInfo && sessionInfo && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Session Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Start Time</p>
              <p className="font-medium">{new Date(sessionInfo.startTime).toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Messages</p>
              <p className="font-medium">{sessionInfo.messagesProcessed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Errors</p>
              <p className="font-medium">{sessionInfo.errorsCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium">{Math.round(sessionInfo.duration)}s</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={connect}
            disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect
          </button>
          
          <button
            onClick={disconnect}
            disabled={connectionStatus === 'disconnected'}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Disconnect
          </button>
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={connectionStatus !== 'connected'}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isRecording
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          
          <button
            onClick={clearTranscript}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Transcript Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Speech</h3>
          <div className="space-y-3">
            {interimTranscript && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 font-medium">Interim:</p>
                <p className="text-blue-900">{interimTranscript}</p>
              </div>
            )}
            {transcript && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800 font-medium">Final:</p>
                <p className="text-green-900">{transcript}</p>
              </div>
            )}
            {!transcript && !interimTranscript && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-500 text-center">Start speaking to see your transcript here...</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Response */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Response</h3>
          <div className="space-y-3">
            {aiResponse && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                <p className="text-sm text-purple-800 font-medium">Response:</p>
                <p className="text-purple-900">{aiResponse}</p>
              </div>
            )}
            {!aiResponse && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-500 text-center">AI response will appear here...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Version: <span className="font-mono">{version}</span>
          </div>
          <div className="text-sm text-gray-600">
            Status: <span className="font-medium">{connectionStatus}</span> | <span className="font-medium">{processingStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentV2; 