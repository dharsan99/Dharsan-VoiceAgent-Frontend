import React from 'react';
import { Icons } from '../components/ui/Icons';

const NotFound: React.FC = () => {
  const handleGoHome = () => {
    window.history.pushState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleGoHome();
    }
  };

  const navigateToPath = (path: string) => {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Visual */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-4">
            404
          </div>
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-40 animate-ping"></div>
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <Icons.AlertTriangle className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-4">
            Oops! Page Not Found
          </h1>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            The page you're looking for seems to have wandered off into the digital void. 
            Don't worry, even the best voice agents sometimes lose their way!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Icons.Home className="w-5 h-5" />
              Go Home
            </button>
            
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-gray-300 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <p className="text-sm text-gray-400 mb-4">
              Need help? Try these popular destinations:
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => navigateToPath('/v1/dashboard')}
                className="text-xs text-purple-400 hover:text-purple-300 bg-purple-900/30 hover:bg-purple-900/50 px-3 py-1 rounded-full transition-colors"
              >
                V1 Dashboard
              </button>
              <button
                onClick={() => navigateToPath('/v2/dashboard')}
                className="text-xs text-purple-400 hover:text-purple-300 bg-purple-900/30 hover:bg-purple-900/50 px-3 py-1 rounded-full transition-colors"
              >
                V2 Dashboard
              </button>
              <button
                onClick={() => navigateToPath('/v2/phase5')}
                className="text-xs text-purple-400 hover:text-purple-300 bg-purple-900/30 hover:bg-purple-900/50 px-3 py-1 rounded-full transition-colors"
              >
                Event-Driven Mode
              </button>
              <button
                onClick={() => navigateToPath('/unified-v2/dashboard')}
                className="text-xs text-purple-400 hover:text-purple-300 bg-purple-900/30 hover:bg-purple-900/50 px-3 py-1 rounded-full transition-colors"
              >
                Unified Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Fun Animation */}
        <div className="mt-6 text-gray-500 text-sm">
          <div className="flex items-center justify-center gap-1">
            <span>Lost in the voice matrix</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;