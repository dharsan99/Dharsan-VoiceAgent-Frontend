import React, { useState, useEffect } from 'react';
import { 
  StorageUtils, 
  MetricsStorage, 
  ConversationStorage, 
  SessionStorage, 
  PreferencesStorage 
} from '../utils/storage';

interface StorageManagerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const StorageManager: React.FC<StorageManagerProps> = ({ isVisible, onClose }) => {
  const [usageStats, setUsageStats] = useState(StorageUtils.getUsageStats());
  const [preferences, setPreferences] = useState(PreferencesStorage.get());
  const [recentSessions, setRecentSessions] = useState(SessionStorage.getAll().slice(-5));
  const [recentConversations, setRecentConversations] = useState(ConversationStorage.getRecent(10));
  const [dataIntegrity, setDataIntegrity] = useState(StorageUtils.validateDataIntegrity());


  useEffect(() => {
    if (isVisible) {
      setUsageStats(StorageUtils.getUsageStats());
      setPreferences(PreferencesStorage.get());
      setRecentSessions(SessionStorage.getAll().slice(-5));
      setRecentConversations(ConversationStorage.getRecent(10));
      setDataIntegrity(StorageUtils.validateDataIntegrity());
    }
  }, [isVisible]);

  const refreshData = () => {
    setUsageStats(StorageUtils.getUsageStats());
    setPreferences(PreferencesStorage.get());
    setRecentSessions(SessionStorage.getAll().slice(-5));
    setRecentConversations(ConversationStorage.getRecent(10));
    setDataIntegrity(StorageUtils.validateDataIntegrity());
  };

  const handleExportData = () => {
    const data = StorageUtils.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-agent-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const success = StorageUtils.importData(content);
        if (success) {
          alert('Data imported successfully!');
          // Refresh the display
          setUsageStats(StorageUtils.getUsageStats());
          setRecentSessions(SessionStorage.getAll().slice(-5));
          setRecentConversations(ConversationStorage.getRecent(10));
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
      StorageUtils.clearAll();
      setUsageStats(StorageUtils.getUsageStats());
      setRecentSessions([]);
      setRecentConversations([]);
      alert('All data cleared successfully!');
    }
  };

  const handleClearSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to clear this session\'s data?')) {
      MetricsStorage.clearSession(sessionId);
      ConversationStorage.clearSession(sessionId);
      setUsageStats(StorageUtils.getUsageStats());
      setRecentSessions(SessionStorage.getAll().slice(-5));
      setRecentConversations(ConversationStorage.getRecent(10));
    }
  };

  const updatePreference = (key: keyof typeof preferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    PreferencesStorage.update(newPreferences);
    setPreferences(newPreferences);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">Storage Manager</h2>
              <p className="text-sm text-gray-400">Manage your voice agent data and preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Usage */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Storage Usage</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Metrics:</span>
                  <span className="text-white font-semibold">{usageStats.metricsCount} entries</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conversations:</span>
                  <span className="text-white font-semibold">{usageStats.conversationsCount} entries</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sessions:</span>
                  <span className="text-white font-semibold">{usageStats.sessionsCount} entries</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Size:</span>
                  <span className="text-white font-semibold">{(usageStats.totalSize / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>

            {/* Data Integrity Status */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Data Integrity</h3>
                <button
                  onClick={refreshData}
                  className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                >
                  Refresh
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${dataIntegrity.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${dataIntegrity.isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {dataIntegrity.isValid ? 'All Data Valid' : 'Issues Found'}
                  </span>
                </div>
                {!dataIntegrity.isValid && dataIntegrity.issues.length > 0 && (
                  <div className="bg-red-900/20 border border-red-700/50 rounded p-3">
                    <h4 className="text-red-400 text-sm font-medium mb-2">Issues:</h4>
                    <ul className="text-red-300 text-xs space-y-1">
                      {dataIntegrity.issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Last checked: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* User Preferences */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">User Preferences</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-sm">Theme:</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => updatePreference('theme', e.target.value)}
                    className="w-full mt-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Audio Level: {preferences.audioLevel}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={preferences.audioLevel}
                    onChange={(e) => updatePreference('audioLevel', parseFloat(e.target.value))}
                    className="w-full mt-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoConnect"
                    checked={preferences.autoConnect}
                    onChange={(e) => updatePreference('autoConnect', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="autoConnect" className="text-gray-400 text-sm">Auto-connect on load</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveHistory"
                    checked={preferences.saveHistory}
                    onChange={(e) => updatePreference('saveHistory', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="saveHistory" className="text-gray-400 text-sm">Save conversation history</label>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session) => (
                    <div key={session.sessionId} className="bg-gray-700/30 rounded p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm text-gray-300 truncate">{session.sessionId}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(session.startTime).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {session.totalExchanges} exchanges • {session.averageLatency.toFixed(0)}ms avg
                          </div>
                        </div>
                        <button
                          onClick={() => handleClearSession(session.sessionId)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No sessions found</div>
                )}
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Conversations</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentConversations.length > 0 ? (
                  recentConversations.map((conv) => (
                    <div key={conv.id} className="bg-gray-700/30 rounded p-3">
                      <div className="text-sm text-gray-300 mb-1 truncate">
                        <strong>You:</strong> {conv.userInput}
                      </div>
                      <div className="text-sm text-gray-400 mb-1 truncate">
                        <strong>AI:</strong> {conv.aiResponse}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(conv.timestamp).toLocaleString()} • {conv.processingTime.toFixed(1)}s
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No conversations found</div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-700/50">
            <button
              onClick={handleExportData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
            
            <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleClearAllData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 