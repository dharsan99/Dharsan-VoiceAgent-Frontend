import React from 'react';
import { Icons } from '../ui/Icons';
import { getStatusColor } from '../../utils/uiUtils';
import { navigateToHome } from '../../utils/navigation';

interface DashboardHeaderProps {
  isProduction: boolean;
  useEventDriven: boolean;
  pipelineStatus: string;
  stepStatus: string;
  onToggleProduction: () => void;
  onToggleMode: (useEventDriven: boolean) => void;
  getEnvironmentUrl: () => string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isProduction,
  useEventDriven,
  pipelineStatus,
  stepStatus,
  onToggleProduction,
  onToggleMode,
  getEnvironmentUrl
}) => {
  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <button
              onClick={navigateToHome}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
            >
              <Icons.Home className="w-5 h-5" />
              <span className="text-sm font-medium">Home</span>
            </button>
            
            <div className="h-6 w-px bg-gray-700"></div>
            
            <div className="flex items-center space-x-3">
              <Icons.Dashboard className="w-6 h-6 text-cyan-400" />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-white text-xs font-bold rounded ${isProduction ? 'bg-red-600' : 'bg-green-600'}`}>
                    {isProduction ? 'PROD' : 'DEV'}
                  </span>
                  <h1 className="text-lg font-bold text-white">Voice Agent V2 Phase 5</h1>
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">LOCAL</span>
                  <button
                    onClick={onToggleProduction}
                    className={`px-2 py-1 text-xs font-bold rounded border transition-colors ${
                      isProduction 
                        ? 'bg-red-600 text-white border-red-500 hover:bg-red-700' 
                        : 'bg-green-600 text-white border-green-500 hover:bg-green-700'
                    }`}
                  >
                    {isProduction ? 'Switch to Dev' : 'Switch to Prod'}
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  {useEventDriven ? 'Event-Driven WebSocket Pipeline' : 'WHIP WebRTC Pipeline'} • {getEnvironmentUrl()}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Metrics */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Pipeline</span>
              <span className={`font-medium ${getStatusColor(pipelineStatus.toUpperCase())}`}>
                {pipelineStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Step</span>
              <span className={`font-medium ${getStatusColor(stepStatus.toUpperCase())}`}>
                {stepStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Lat</span>
              <span className="font-medium text-green-400">45ms</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Qual</span>
              <span className="font-medium text-blue-400">95.8%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Succ</span>
              <span className="font-medium text-purple-400">98.5%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Up</span>
              <span className="font-medium text-green-400">99.7%</span>
            </div>
          </div>
        </div>

        {/* Mode Toggle Bar */}
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-400">Mode:</span>
            <div className="flex space-x-1">
              <button 
                onClick={() => onToggleMode(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                  useEventDriven 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icons.Wifi className="w-4 h-4" />
                <span>Event-Driven</span>
                {useEventDriven && <Icons.Status className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => onToggleMode(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                  !useEventDriven 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icons.Video className="w-4 h-4" />
                <span>WHIP WebRTC</span>
                {!useEventDriven && <Icons.Status className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 