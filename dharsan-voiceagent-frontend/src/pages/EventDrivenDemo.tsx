import React from 'react';
import VoiceAgentEventDriven from '../components/VoiceAgentEventDriven';

const EventDrivenDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Event-Driven Voice Agent Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This implementation follows the correct event sequence: greeting → start_listening → trigger_llm, 
            ensuring deterministic control and eliminating race conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Agent Component */}
          <div>
            <VoiceAgentEventDriven />
          </div>

          {/* Event Sequence Documentation */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Event Sequence Architecture</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-blue-800">1. Greeting Phase</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upon WebSocket connection, the client sends a <code>greeting_request</code> event. 
                  The server responds with a <code>greeting</code> event containing "how may i help you today".
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-green-800">2. Start Listening Phase</h3>
                <p className="text-sm text-gray-600 mt-1">
                  When the user clicks "Start Listening", the client sends a <code>start_listening</code> event. 
                  The server acknowledges with <code>listening_started</code> and begins processing audio.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-yellow-800">3. Live Transcription</h3>
                <p className="text-sm text-gray-600 mt-1">
                  As the user speaks, the server sends <code>interim_transcript</code> events for real-time feedback. 
                  These are displayed immediately in the UI.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-800">4. Trigger LLM Phase</h3>
                <p className="text-sm text-gray-600 mt-1">
                  When the user clicks "Get Answer", the client sends a <code>trigger_llm</code> event with the 
                  final transcript. This is the exclusive trigger for the AI pipeline.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-purple-800">5. AI Response</h3>
                <p className="text-sm text-gray-600 mt-1">
                  The server processes the transcript through LLM and TTS, sending <code>ai_response</code> and 
                  <code>tts_audio</code> events back to the client.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Key Benefits</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Deterministic Control:</strong> No race conditions or premature LLM activation</li>
                <li>• <strong>User Control:</strong> User explicitly controls when their turn ends</li>
                <li>• <strong>Clear State Management:</strong> Each event has a specific purpose and response</li>
                <li>• <strong>Robust Error Handling:</strong> Events can be retried and validated</li>
                <li>• <strong>Scalable Architecture:</strong> Event-driven design supports multiple clients</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Implementation Details */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Technical Implementation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Backend Changes</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Updated WebSocket handler to use event-driven architecture</li>
                <li>• Added <code>ProcessFinalTranscript</code> method to coordinator</li>
                <li>• Implemented proper greeting event handling</li>
                <li>• Added session management for event routing</li>
                <li>• Enhanced error handling and logging</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Frontend Changes</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• New React component with proper event sequence</li>
                <li>• Web Audio API for seamless TTS playback</li>
                <li>• Optimized audio constraints for STT accuracy</li>
                <li>• Real-time status updates and error handling</li>
                <li>• Clean MediaStream lifecycle management</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Event Schema</h3>
            <div className="text-xs font-mono text-blue-700 space-y-1">
              <div><strong>Client → Server:</strong></div>
              <div>• greeting_request: {'{}'}</div>
              <div>• start_listening: {'{"session_id": "..."}'}</div>
              <div>• trigger_llm: {'{"final_transcript": "...", "session_id": "..."}'}</div>
              <div><strong>Server → Client:</strong></div>
              <div>• greeting: {'{"text": "how may i help you today"}'}</div>
              <div>• listening_started: {'{"session_id": "..."}'}</div>
              <div>• interim_transcript: {'{"text": "..."}'}</div>
              <div>• ai_response: {'{"text": "..."}'}</div>
              <div>• tts_audio: {'{"audio_data": "base64_encoded_audio"}'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDrivenDemo; 