import React from 'react';

const DashboardFooter: React.FC = () => {
  return (
    <footer className="mt-2 text-center sticky bottom-0 z-40 flex-shrink-0">
      <div className="bg-gray-800/90 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <p className="text-xs text-gray-500">
              Built with React, TypeScript, Web Audio API, and WebSocket
            </p>
          </div>
          <div className="w-px h-4 bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-xs text-gray-600">
              Backend: FastAPI + Modal | Frontend: Vite + Tailwind CSS
            </p>
          </div>
        </div>
        <div className="mt-1 text-center">
          <p className="text-xs text-gray-700">
            Unified V2 Dashboard - All Phases Combined
          </p>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter; 