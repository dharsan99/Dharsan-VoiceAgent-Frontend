import React from 'react';
import { navigateToDashboard } from '../utils/navigation';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  version: string;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, version, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl active:scale-95"
  >
    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
        <span className="text-xs sm:text-sm text-cyan-400 font-medium">{version}</span>
      </div>
    </div>
    <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{description}</p>
    <div className="mt-3 sm:mt-4 flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300 transition-colors">
      <span className="text-xs sm:text-sm font-medium">Launch Dashboard</span>
      <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  const handleNavigate = (version: 'v1' | 'v2' | 'v3' | 'v2phase1' | 'v2phase2' | 'v2phase5') => {
    navigateToDashboard(version);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">Dharsan VoiceAgent</h1>
                <p className="text-xs sm:text-sm text-gray-400">Advanced AI Voice Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <a 
                href="https://github.com/dharsan99/Dharsan-VoiceAgent-Frontend" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Next-Generation
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent block sm:inline"> Voice AI</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Experience the future of conversational AI with our advanced voice assistant platform. 
              Choose from multiple versions optimized for different use cases and performance requirements.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <FeatureCard
              title="Stable Voice Agent"
              description="Production-ready voice assistant with proven reliability and comprehensive error handling. Perfect for stable, long-running conversations."
              version="V1"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              onClick={() => handleNavigate('v1')}
            />
            

            
            <FeatureCard
              title="WebRTC Echo Test"
              description="Test the new WebRTC WHIP protocol with ultra-low latency audio echo. Validate the media pipeline before AI integration."
              version="V2 Phase 1"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              }
              onClick={() => handleNavigate('v2phase1')}
            />
            
            <FeatureCard
              title="AI Conversation Pipeline"
              description="Full AI conversation with Google STT → LLM → TTS pipeline. Experience real-time AI responses with WebRTC WHIP protocol."
              version="V2 Phase 2"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              onClick={() => handleNavigate('v2phase2')}
            />
            
            <FeatureCard
              title="Cost-Free Production"
              description="GKE Autopilot deployment with qwen3:0.6b LLM. Full production-ready voice agent running on Google Cloud Free Tier."
              version="V2 Phase 5"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              onClick={() => handleNavigate('v2phase5')}
            />
            
            <FeatureCard
              title="Ultra-Low Latency"
              description="WebRTC-powered voice agent with UDP transport for minimal latency. Ideal for real-time applications requiring instant responses."
              version="V3"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              onClick={() => handleNavigate('v3')}
            />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700/50 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-1 sm:mb-2">300ms</div>
              <div className="text-sm sm:text-base text-gray-300">Average Latency</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700/50 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-1 sm:mb-2">99.9%</div>
              <div className="text-sm sm:text-base text-gray-300">Uptime</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700/50 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-1 sm:mb-2">3</div>
              <div className="text-sm sm:text-base text-gray-300">AI Models</div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Built with Modern Technology</h2>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span>React 19</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 3h4l1.68 14.39a1 1 0 001 1.61h9.72a1 1 0 001-1L23 6H6"/>
                </svg>
                <span>TypeScript</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-6 h-6 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Tailwind CSS</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>WebSocket</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Dharsan VoiceAgent. Built with ❤️ for demonstrating advanced voice AI capabilities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 