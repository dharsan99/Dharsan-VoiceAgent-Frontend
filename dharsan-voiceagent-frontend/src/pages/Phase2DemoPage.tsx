import React from 'react';
import VoiceAgentPhase2 from '../components/VoiceAgentPhase2';

// PHASE 2: Demo Page for Frontend Audio & Control Flow Improvements
// Showcases raw audio capture, seamless TTS playback, and deterministic control

const Phase2DemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Voice Agent - Phase 2 Demo
              </h1>
              <p className="text-blue-200 text-sm">
                Frontend Audio & Control Flow Improvements
              </p>
            </div>
            <div className="text-right">
              <div className="text-green-400 text-sm font-medium">✅ Phase 2 Active</div>
              <div className="text-gray-400 text-xs">Optimized Audio Pipeline</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Phase 2 Overview */}
        <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">
            Phase 2 Implementation Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h3 className="text-blue-300 font-semibold mb-2">🎤 Raw Audio Capture</h3>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Disabled echoCancellation</li>
                <li>• Disabled noiseSuppression</li>
                <li>• Disabled autoGainControl</li>
                <li>• Native sample rate capture</li>
                <li>• Better STT accuracy</li>
              </ul>
            </div>
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <h3 className="text-green-300 font-semibold mb-2">🔊 Seamless TTS Playback</h3>
              <ul className="text-green-200 text-sm space-y-1">
                <li>• Web Audio API integration</li>
                <li>• decodeAudioData processing</li>
                <li>• AudioBufferSourceNode scheduling</li>
                <li>• Gapless audio stitching</li>
                <li>• Sequential timing control</li>
              </ul>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <h3 className="text-purple-300 font-semibold mb-2">🎯 Deterministic Control</h3>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>• Proper MediaStream lifecycle</li>
                <li>• useRef for stream management</li>
                <li>• track.stop() for cleanup</li>
                <li>• Event-driven control flow</li>
                <li>• Resource leak prevention</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="mb-8 bg-yellow-500/10 rounded-2xl p-6 border border-yellow-500/20">
          <h3 className="text-yellow-300 font-semibold mb-3">
            🧪 Testing Instructions
          </h3>
          <div className="text-yellow-200 text-sm space-y-3">
            <div>
              <strong>1. Microphone Test:</strong> Click "Test Microphone" to verify raw audio capture with optimized constraints.
            </div>
            <div>
              <strong>2. TTS Audio Test:</strong> Click "Test TTS Audio" to verify Web Audio API functionality with a test tone.
            </div>
            <div>
              <strong>3. Connection Test:</strong> Click "Connect" to establish WebSocket connection with the backend.
            </div>
            <div>
              <strong>4. Voice Test:</strong> Click "Start Listening" to test the complete audio pipeline with raw capture.
            </div>
            <div>
              <strong>5. Control Test:</strong> Click "Get Answer" to test the deterministic control flow and TTS playback.
            </div>
          </div>
        </div>

        {/* Voice Agent Component */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <VoiceAgentPhase2 />
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-white font-semibold mb-4">
            🔧 Technical Implementation Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-blue-300 font-medium mb-2">Audio Constraints Configuration</h4>
              <pre className="bg-gray-900 rounded p-3 text-green-300 overflow-x-auto">
{`AUDIO_CONFIG: {
  echoCancellation: false,  // Raw audio
  noiseSuppression: false,  // Raw audio
  autoGainControl: false,   // Raw audio
  channelCount: 1          // Mono
}`}
              </pre>
            </div>
            <div>
              <h4 className="text-green-300 font-medium mb-2">Web Audio API Implementation</h4>
              <pre className="bg-gray-900 rounded p-3 text-green-300 overflow-x-auto">
{`// Seamless TTS playback
const audioBuffer = await audioContext
  .decodeAudioData(audioData);
const source = audioContext
  .createBufferSource();
source.buffer = audioBuffer;
source.start(nextStartTime);`}
              </pre>
            </div>
          </div>
        </div>

        {/* Expected Results */}
        <div className="mt-8 bg-green-500/10 rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-green-300 font-semibold mb-3">
            📈 Expected Results from Phase 2
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-green-200 font-medium mb-2">STT Accuracy Improvements</h4>
              <ul className="text-green-100 text-sm space-y-1">
                <li>• Better recognition of subtle phonetic details</li>
                <li>• Reduced interference from browser processing</li>
                <li>• More accurate transcription in noisy environments</li>
                <li>• Improved handling of different speech patterns</li>
              </ul>
            </div>
            <div>
              <h4 className="text-green-200 font-medium mb-2">TTS Playback Improvements</h4>
              <ul className="text-green-100 text-sm space-y-1">
                <li>• Seamless audio without gaps or clicks</li>
                <li>• Reduced latency in audio playback</li>
                <li>• Better audio quality and synchronization</li>
                <li>• Improved user experience during conversations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20">
          <h3 className="text-blue-300 font-semibold mb-3">
            🚀 Next Steps - Phase 3
          </h3>
          <div className="text-blue-200 text-sm space-y-2">
            <div>
              <strong>Backend Architecture Simplification:</strong> Remove Kafka hop between Media Server and Orchestrator
            </div>
            <div>
              <strong>Direct Communication:</strong> Implement gRPC streaming for lower latency
            </div>
            <div>
              <strong>Streaming LLM/TTS:</strong> Chain LLM output directly to TTS sentence-by-sentence
            </div>
            <div>
              <strong>Deterministic Control:</strong> Implement explicit event-driven pipeline triggers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase2DemoPage; 