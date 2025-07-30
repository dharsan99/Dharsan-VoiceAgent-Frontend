import React from 'react';

interface TestStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'event-driven' | 'whip-webrtc';
}

interface TestStep {
  id: string;
  title: string;
  description: string;
  file: string;
  category: 'connection' | 'audio' | 'integration' | 'end-to-end';
  priority: 'high' | 'medium' | 'low';
}

const TestStepsModal: React.FC<TestStepsModalProps> = ({ isOpen, onClose, mode }) => {
  const eventDrivenTests: TestStep[] = [
    {
      id: 'websocket-connection',
      title: 'WebSocket Connection Test',
      description: 'Test WebSocket connection to orchestrator',
      file: 'tests/test-websocket-connection.html',
      category: 'connection',
      priority: 'high'
    },
    {
      id: 'voice-agent-local',
      title: 'Local Voice Agent Test',
      description: 'Test local voice agent functionality',
      file: 'tests/test-voice-agent-local.html',
      category: 'audio',
      priority: 'high'
    },
    {
      id: 'voice-processing',
      title: 'Voice Processing Test',
      description: 'Test voice processing pipeline',
      file: 'tests/test-voice-processing.html',
      category: 'audio',
      priority: 'high'
    },
    {
      id: 'phase2-integration',
      title: 'Phase 2 Integration Test',
      description: 'Test Phase 2 integration features',
      file: 'tests/test-phase2-integration.html',
      category: 'integration',
      priority: 'medium'
    },
    {
      id: 'phase2-end-to-end',
      title: 'Phase 2 End-to-End Test',
      description: 'Complete end-to-end workflow test',
      file: 'tests/test-phase2-end-to-end.html',
      category: 'end-to-end',
      priority: 'high'
    },
    {
      id: 'frontend-integration',
      title: 'Frontend Integration Test',
      description: 'Test frontend integration with backend',
      file: 'tests/test-frontend-integration.html',
      category: 'integration',
      priority: 'medium'
    },
    {
      id: 'voice-simple',
      title: 'Simple Voice Test',
      description: 'Basic voice functionality test',
      file: 'tests/test-voice-simple.html',
      category: 'audio',
      priority: 'low'
    },
    {
      id: 'debug-toggle',
      title: 'Debug Toggle Test',
      description: 'Test debug toggle functionality',
      file: 'tests/test-debug-toggle.html',
      category: 'integration',
      priority: 'low'
    }
  ];

  const whipWebRTCTests: TestStep[] = [
    {
      id: 'whip-connection',
      title: 'WHIP Connection Test',
      description: 'Test WHIP protocol connection',
      file: 'tests/test-whip-connection.html',
      category: 'connection',
      priority: 'high'
    },
    {
      id: 'whip-implementation',
      title: 'WHIP Implementation Test',
      description: 'Test WHIP implementation details',
      file: 'tests/test-whip-implementation.html',
      category: 'connection',
      priority: 'high'
    },
    {
      id: 'webrtc-basic',
      title: 'Basic WebRTC Test',
      description: 'Test basic WebRTC functionality',
      file: 'tests/test-webrtc-basic.html',
      category: 'connection',
      priority: 'high'
    },
    {
      id: 'voice-audio',
      title: 'Voice Audio Test',
      description: 'Test voice audio streaming',
      file: 'tests/test-voice-audio.html',
      category: 'audio',
      priority: 'high'
    },
    {
      id: 'phase2-comprehensive',
      title: 'Phase 2 Comprehensive Test',
      description: 'Comprehensive Phase 2 testing',
      file: 'tests/test-phase2-comprehensive.html',
      category: 'end-to-end',
      priority: 'high'
    },
    {
      id: 'phase2-cors-fixed',
      title: 'CORS Fixed Test',
      description: 'Test with CORS fixes applied',
      file: 'tests/test-phase2-cors-fixed.html',
      category: 'integration',
      priority: 'medium'
    },
    {
      id: 'backend-test',
      title: 'Backend Connection Test',
      description: 'Test backend connectivity',
      file: 'tests/test-backend.html',
      category: 'connection',
      priority: 'medium'
    }
  ];

  const tests = mode === 'event-driven' ? eventDrivenTests : whipWebRTCTests;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'connection': return 'CONN';
      case 'audio': return 'AUDIO';
      case 'integration': return 'INTEG';
      case 'end-to-end': return 'E2E';
      default: return 'TEST';
    }
  };

  const openTestFile = (file: string) => {
    window.open(file, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Test Steps for {mode === 'event-driven' ? 'Event-Driven' : 'WHIP WebRTC'} Mode
            </h2>
            <p className="text-gray-400 mt-1">
              Select and run the appropriate tests for your current mode
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50"
          >
            ✕
          </button>
        </div>

        {/* Mode Information */}
        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">
            {mode === 'event-driven' ? 'Event-Driven WebSocket Mode' : 'WHIP WebRTC Mode'}
          </h3>
          <p className="text-gray-300 text-sm">
            {mode === 'event-driven' 
              ? 'Uses WebSocket connections for real-time communication with the orchestrator. Tests focus on WebSocket connectivity, voice processing, and integration workflows.'
              : 'Uses WHIP protocol and WebRTC for direct audio streaming. Tests focus on WHIP connections, WebRTC functionality, and audio streaming capabilities.'
            }
          </p>
        </div>

        {/* Test Steps */}
        <div className="space-y-4">
          {tests.map((test) => (
            <div key={test.id} className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs font-mono rounded">{getCategoryIcon(test.category)}</span>
                    <h4 className="font-semibold text-white">{test.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(test.priority)}`}>
                      {test.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{test.description}</p>
                  <p className="text-gray-500 text-xs font-mono">{test.file}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openTestFile(test.file)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Open Test
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const highPriorityTests = tests.filter(t => t.priority === 'high');
                highPriorityTests.forEach(test => openTestFile(test.file));
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Run High Priority Tests
            </button>
            <button
              onClick={() => {
                const connectionTests = tests.filter(t => t.category === 'connection');
                connectionTests.forEach(test => openTestFile(test.file));
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Run Connection Tests
            </button>
            <button
              onClick={() => {
                tests.forEach(test => openTestFile(test.file));
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Run All Tests
            </button>
          </div>
        </div>

        {/* Testing Guidelines */}
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">Testing Guidelines</h3>
          <ul className="text-yellow-200 text-sm space-y-1">
            <li>• Start with High Priority tests first</li>
            <li>• Ensure backend services are running before testing</li>
            <li>• Check browser console for errors during tests</li>
            <li>• Monitor network tab for failed requests</li>
            <li>• Test in order: Connection → Audio → Integration → End-to-End</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestStepsModal; 