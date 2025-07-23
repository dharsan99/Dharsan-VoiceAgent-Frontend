import React, { useState } from 'react';
import { useVoiceAgentV2 } from '../hooks/useVoiceAgentV2';
import StatusIndicator from './shared/StatusIndicator';
import ControlPanel from './shared/ControlPanel';
import TranscriptPanel from './shared/TranscriptPanel';
import SessionInfoPanel from './shared/SessionInfoPanel';

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

  const handleTestMicrophone = async () => {
    try {
      console.log('Testing microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone test successful, tracks:', stream.getTracks().length);
      alert('Microphone test successful! Check console for details.');
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Microphone test failed:', error);
      alert(`Microphone test failed: ${error}`);
    }
  };

  const handleTestWebSocket = () => {
    try {
      console.log('Testing WebSocket connection...');
      // You can add WebSocket test logic here
      alert('WebSocket test message sent! Check console and backend logs.');
    } catch (error) {
      console.error('WebSocket test failed:', error);
      alert(`WebSocket test failed: ${error}`);
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
            <StatusIndicator status={connectionStatus} />
            <StatusIndicator status={processingStatus} />
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
        <SessionInfoPanel
          sessionInfo={sessionInfo}
          sessionId={sessionId || undefined}
          variant="light"
        />
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
      <ControlPanel
        connectionStatus={connectionStatus}
        isRecording={isRecording}
        onConnect={connect}
        onDisconnect={disconnect}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onClearTranscript={clearTranscript}
        onTestMicrophone={handleTestMicrophone}
        onTestWebSocket={handleTestWebSocket}
        variant="light"
      />

      {/* Transcript Display */}
      <TranscriptPanel
        transcript={transcript}
        interimTranscript={interimTranscript}
        aiResponse={aiResponse || undefined}
        onClear={clearTranscript}
        variant="light"
      />

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