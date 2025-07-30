import React from 'react';
import { navigateToDashboard } from '../utils/navigation';

interface VersionCardProps {
  title: string;
  description: string;
  techStack: string[];
  version: string;
  status: 'stable' | 'experimental' | 'production';
  onClick: () => void;
}

const VersionCard: React.FC<VersionCardProps> = ({ 
  title, 
  description, 
  techStack,
  version, 
  status, 
  onClick 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'text-green-400 bg-green-400/10';
      case 'experimental': return 'text-yellow-400 bg-yellow-400/10';
      case 'production': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
            {version}
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(status)}`}>
            {status}
          </div>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
        {title}
      </h3>
      <p className="text-gray-300 text-sm leading-relaxed mb-4">
        {description}
      </p>
      
      {/* Tech Stack */}
      <div className="flex flex-wrap gap-2 mb-4">
        {techStack.map((tech, index) => (
          <span key={index} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded">
            {tech}
          </span>
        ))}
      </div>

      {/* Launch Button */}
      <div className="flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300 transition-colors">
        <span className="text-sm font-medium">Launch Demo</span>
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const handleNavigate = (version: 'v1' | 'v2' | 'v3') => {
    if (version === 'v2') {
      // V2 routes to Phase 5 (the most complete version)
      navigateToDashboard('v2phase5');
    } else {
      navigateToDashboard(version);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
        <nav className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Dharsan VoiceAgent</h1>
                <p className="text-xs text-gray-400">Technical Demo for Smallest.ai</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/dharsan99/Dharsan-VoiceAgent-Frontend" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content - Single Scroll Layout */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Voice AI
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> Expertise Demo</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Demonstrating advanced voice AI capabilities with WebRTC, real-time processing, and modern AI pipelines. 
            Built for showcasing technical expertise to Smallest.ai.
          </p>
        </div>

        {/* Version Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <VersionCard
            title="WebSocket Voice Agent"
            description="Production-ready voice assistant with WebSocket communication, comprehensive error handling, and real-time processing capabilities."
            techStack={["WebSocket", "Python", "React", "Real-time"]}
            version="V1"
            status="stable"
            onClick={() => handleNavigate('v1')}
          />
          
          <VersionCard
            title="Complete AI Pipeline"
            description="Full AI conversation pipeline with WebSocket, STT, LLM, and TTS. Features both Event-Driven and WHIP WebRTC modes for maximum flexibility."
            techStack={["WebSocket", "STT", "LLM", "TTS", "WebRTC WHIP"]}
            version="V2"
            status="production"
            onClick={() => handleNavigate('v2')}
          />
          
          <VersionCard
            title="Ultra-Low Latency System"
            description="WebRTC-powered voice agent with UDP transport for minimal latency. Showcases cutting-edge real-time communication expertise."
            techStack={["WebRTC", "UDP", "Real-time", "Optimization"]}
            version="V3"
            status="experimental"
            onClick={() => handleNavigate('v3')}
          />
        </div>

        {/* Technical Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">300ms</div>
            <div className="text-xs text-gray-300">Latency</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">99.9%</div>
            <div className="text-xs text-gray-300">Uptime</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">3</div>
            <div className="text-xs text-gray-300">AI Models</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">16</div>
            <div className="text-xs text-gray-300">Languages</div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Technical Stack</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span className="text-sm">React 19</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 3h4l1.68 14.39a1 1 0 001 1.61h9.72a1 1 0 001-1L23 6H6"/>
              </svg>
              <span className="text-sm">TypeScript</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-sm">Tailwind CSS</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-sm">WebSocket</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-sm">Python</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-sm">WebRTC</span>
            </div>
          </div>
        </div>

        {/* Demo Purpose */}
        <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Demo for Smallest.ai</h3>
          <p className="text-gray-300 text-sm">
            This demonstration showcases advanced voice AI development capabilities, 
            including real-time communication, AI pipeline integration, and modern web technologies. 
            Built to demonstrate technical expertise and innovation in voice AI solutions.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>&copy; 2024 Dharsan VoiceAgent - Technical Demo for Smallest.ai</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 