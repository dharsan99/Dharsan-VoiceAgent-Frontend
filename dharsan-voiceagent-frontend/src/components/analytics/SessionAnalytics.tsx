import React, { useState, useEffect } from 'react';
import { KpiChart } from './KpiChart';
import BackendLogs from '../dashboard/BackendLogs';

interface ChatMessage {
  timestamp: string;
  user: string;
  ai: string;
}

interface KpiDataPoint {
  timestamp: string;
  averageLatency: number;
  jitter: number;
  packetLoss: number;
  bufferSize: number;
  jitterBufferDelay: number;
}

const getSessionData = (key: string): any[] => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Error reading from sessionStorage: ${key}`, error);
    return [];
  }
};

interface SessionAnalyticsProps {
  onClose: () => void;
}

export const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ onClose }) => {
  const [kpiHistory, setKpiHistory] = useState<KpiDataPoint[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'performance' | 'conversation' | 'backend-logs'>('performance');

  useEffect(() => {
    setKpiHistory(getSessionData('session_kpis'));
    setChatHistory(getSessionData('session_chat'));
  }, []);

  // Add keyboard support for closing modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const clearSessionData = () => {
    if (window.confirm('Clear all session data? This action cannot be undone.')) {
      sessionStorage.removeItem('session_kpis');
      sessionStorage.removeItem('session_chat');
      setKpiHistory([]);
      setChatHistory([]);
    }
  };

  const exportSessionData = () => {
    const sessionData = {
      timestamp: new Date().toISOString(),
      kpiHistory,
      chatHistory,
      summary: {
        totalMessages: chatHistory.length,
        totalKpiPoints: kpiHistory.length,
        averageLatency: kpiHistory.length > 0 
          ? kpiHistory.reduce((sum, kpi) => sum + kpi.averageLatency, 0) / kpiHistory.length 
          : 0,
        averageJitter: kpiHistory.length > 0 
          ? kpiHistory.reduce((sum, kpi) => sum + kpi.jitter, 0) / kpiHistory.length 
          : 0,
      }
    };

    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-agent-session-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden border border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-700/50 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-cyan-400 truncate">Session Analytics</h2>
              <p className="text-xs sm:text-sm text-gray-400 truncate">Real-time performance metrics & conversation history</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={exportSessionData}
              className="px-2 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-1 sm:gap-2"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>
            <button 
              onClick={clearSessionData}
              className="px-2 sm:px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-1 sm:gap-2"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700/50">
          <button
            onClick={() => setActiveTab('performance')}
            className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors duration-200 ${
              activeTab === 'performance'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/10'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Perf</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('conversation')}
            className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors duration-200 ${
              activeTab === 'conversation'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/10'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="hidden sm:inline">Conversation</span>
              <span className="sm:hidden">Chat</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('backend-logs')}
            className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors duration-200 ${
              activeTab === 'backend-logs'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/10'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden sm:inline">Backend Logs</span>
              <span className="sm:hidden">Logs</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          {activeTab === 'performance' ? (
            <div className="space-y-4 sm:space-y-6">
              <KpiChart kpiData={kpiHistory} />
              
              {/* Performance Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Avg Latency</h3>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-green-400">
                    {kpiHistory.length > 0 
                      ? (kpiHistory.reduce((sum, kpi) => sum + kpi.averageLatency, 0) / kpiHistory.length).toFixed(1)
                      : '0'}ms
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Avg Jitter</h3>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                    {kpiHistory.length > 0 
                      ? (kpiHistory.reduce((sum, kpi) => sum + kpi.jitter, 0) / kpiHistory.length).toFixed(1)
                      : '0'}ms
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Data Points</h3>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-400">
                    {kpiHistory.length}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'conversation' ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-gray-700/50">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Conversation Log</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Complete session transcript with timestamps</p>
                </div>
                
                <div className="max-h-64 sm:max-h-96 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {chatHistory.length > 0 ? (
                    chatHistory.map((chat, index) => (
                      <div key={index} className="bg-gray-700/30 rounded-lg p-3 sm:p-4 border-l-4 border-cyan-500/50">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0">
                            <span className="text-xs text-gray-500">
                              {new Date(chat.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex-1 space-y-2 min-w-0">
                            <div>
                              <span className="font-semibold text-cyan-300 text-xs sm:text-sm">You:</span>
                              <p className="text-gray-200 mt-1 text-sm sm:text-base break-words">{chat.user}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-blue-300 text-xs sm:text-sm">AI:</span>
                              <p className="text-gray-200 mt-1 text-sm sm:text-base break-words">{chat.ai}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12 text-gray-400">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No Conversation History</p>
                      <p className="text-xs sm:text-sm">Start a conversation to see the transcript here</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Conversation Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700/50">
                  <h3 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">Session Summary</h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Total Messages:</span>
                      <span className="font-semibold text-cyan-400">{chatHistory.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Session Duration:</span>
                      <span className="font-semibold text-cyan-400">
                        {chatHistory.length > 0 
                          ? `${Math.round((new Date().getTime() - new Date(chatHistory[0].timestamp).getTime()) / 1000 / 60)}m`
                          : '0m'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response Time:</span>
                      <span className="font-semibold text-cyan-400">
                        {kpiHistory.length > 0 
                          ? `${(kpiHistory.reduce((sum, kpi) => sum + kpi.averageLatency, 0) / kpiHistory.length).toFixed(0)}ms`
                          : '0ms'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700/50">
                  <h3 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">Data Export</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                    Export your session data for analysis or backup purposes.
                  </p>
                  <button 
                    onClick={exportSessionData}
                    className="w-full px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Session Data
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <BackendLogs />
          )}
        </div>
      </div>
    </div>
  );
}; 