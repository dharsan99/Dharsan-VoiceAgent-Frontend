import React, { useState } from 'react';
import { navigateToHome } from '../utils/navigation';
import ProductionConfigTest from '../components/ProductionConfigTest';
import VoiceAgentEventDriven from '../components/VoiceAgentEventDriven';
import VoiceAgentWHIP from '../components/VoiceAgentWHIP';

// Icons component
interface IconProps {
  className?: string;
}

const Icons = {
  Home: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Network: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Settings: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  WHIP: ({ className = "w-5 h-5" }: IconProps) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
};

const V2Phase5: React.FC = () => {
  const [showConfigTest, setShowConfigTest] = useState(false);
  const [useEventDriven, setUseEventDriven] = useState(false); // Default to WHIP

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={navigateToHome}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Go Home"
              >
                <Icons.Home className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Voice Agent V2 Phase 5
                </h1>
                <p className="text-sm text-gray-500">
                  WHIP WebRTC with media server integration
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {useEventDriven ? (
                  <>
                    <Icons.Network className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Event-Driven</span>
                  </>
                ) : (
                  <>
                    <Icons.WHIP className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">WHIP WebRTC</span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Recommended</span>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setUseEventDriven(!useEventDriven)}
                className="px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
                title="Switch Implementation"
              >
                {useEventDriven ? 'Switch to WHIP WebRTC' : 'Switch to Event-Driven'}
              </button>
              
              <button
                onClick={() => setShowConfigTest(!showConfigTest)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Test Configuration"
              >
                <Icons.Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {useEventDriven ? (
          <VoiceAgentEventDriven />
        ) : (
          <VoiceAgentWHIP />
        )}
      </div>

      {/* Configuration Test Modal */}
      {showConfigTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Production Configuration Test</h2>
              <button
                onClick={() => setShowConfigTest(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ProductionConfigTest />
          </div>
        </div>
      )}
    </div>
  );
};

export default V2Phase5; 