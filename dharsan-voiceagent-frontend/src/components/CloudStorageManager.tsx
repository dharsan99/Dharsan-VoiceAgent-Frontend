import React, { useState, useEffect } from 'react';
import { getServiceUrls } from '../config/production';

interface CloudStorageStats {
  sessions: number;
  conversations: number;
  metrics_files: number;
  queue_items: string;
  storage_type: string;
  last_updated: string;
  version: string;
}

interface CloudSession {
  session_id: string;
  created_at: string;
  updated_at: string;
  data: any;
  status: string;
  version: string;
}

interface CloudConversation {
  conversation_id: string;
  session_id: string;
  timestamp: string;
  data: {
    user_input: string;
    ai_response: string;
    processing_time: number;
    response_length: number;
    word_count: number;
  };
  version: string;
}

interface CloudMetrics {
  session_id: string;
  timestamp: string;
  data: any;
  version: string;
}

interface QueueStatus {
  queue_name: string;
  estimated_items: string;
  status: string;
  last_updated: string;
}

interface CloudStorageManagerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const CloudStorageManager: React.FC<CloudStorageManagerProps> = ({ isVisible, onClose }) => {
  const [stats, setStats] = useState<CloudStorageStats | null>(null);
  const [sessions, setSessions] = useState<CloudSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [conversations, setConversations] = useState<CloudConversation[]>([]);
  const [metrics, setMetrics] = useState<CloudMetrics | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { orchestratorHttpUrl } = getServiceUrls();
  const backendUrl = orchestratorHttpUrl;

  useEffect(() => {
    if (isVisible) {
      loadCloudStorageData();
    }
  }, [isVisible]);

  const loadCloudStorageData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load storage stats
      const statsResponse = await fetch(`${backendUrl}/cloud/storage/status`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.status === 'available') {
          setStats(statsData.storage_stats);
        } else {
          setError('Cloud storage not available');
        }
      }

      // Load sessions
      const sessionsResponse = await fetch(`${backendUrl}/cloud/sessions`);
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions || []);
      }

      // Load queue status
      const queueResponse = await fetch(`${backendUrl}/cloud/queue/status`);
      if (queueResponse.ok) {
        const queueData = await queueResponse.json();
        setQueueStatus(queueData);
      }

    } catch (err) {
      setError(`Failed to load cloud storage data: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionConversations = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${backendUrl}/cloud/conversations/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
        setSelectedSession(sessionId);
      } else {
        setError(`Failed to load conversations for session ${sessionId}`);
      }
    } catch (err) {
      setError(`Failed to load conversations: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionMetrics = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${backendUrl}/cloud/metrics/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        setError(`Failed to load metrics for session ${sessionId}`);
      }
    } catch (err) {
      setError(`Failed to load metrics: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const processQueuedTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${backendUrl}/cloud/queue/process`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.processed) {
          // Reload queue status
          const queueResponse = await fetch(`${backendUrl}/cloud/queue/status`);
          if (queueResponse.ok) {
            const queueData = await queueResponse.json();
            setQueueStatus(queueData);
          }
        }
      } else {
        setError('Failed to process queued tasks');
      }
    } catch (err) {
      setError(`Failed to process queue: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // Try parsing as ISO string or other formats
        const parsed = Date.parse(timestamp);
        if (isNaN(parsed)) {
          return 'Invalid Date';
        }
        return new Date(parsed).toLocaleString();
      }
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Cloud Storage Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Storage Statistics */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Storage Statistics</h3>
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : stats ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Sessions:</span>
                  <span className="text-white font-mono">{stats.sessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Conversations:</span>
                  <span className="text-white font-mono">{stats.conversations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Metrics Files:</span>
                  <span className="text-white font-mono">{stats.metrics_files}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Queue Items:</span>
                  <span className="text-white font-mono">{stats.queue_items}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Last Updated:</span>
                  <span className="text-white text-sm">{formatTimestamp(stats.last_updated)}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">No data available</div>
            )}
          </div>

          {/* Queue Status */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Processing Queue</h3>
              <button
                onClick={processQueuedTasks}
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Process Tasks
              </button>
            </div>
            {queueStatus ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Status:</span>
                  <span className="text-green-400">{queueStatus.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Items:</span>
                  <span className="text-white font-mono">{queueStatus.estimated_items}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Last Updated:</span>
                  <span className="text-white text-sm">{formatTimestamp(queueStatus.last_updated)}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">Queue status unavailable</div>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="mt-6 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Cloud Sessions</h3>
          {sessions.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`bg-gray-700/30 rounded p-3 cursor-pointer transition-colors ${
                    selectedSession === session.session_id ? 'border border-cyan-500' : ''
                  }`}
                  onClick={() => {
                    loadSessionConversations(session.session_id);
                    loadSessionMetrics(session.session_id);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm text-gray-300 mb-1 truncate">
                        <strong>Session:</strong> {session.session_id}
                      </div>
                      <div className="text-xs text-gray-400">
                        <strong>Status:</strong> {session.status} | 
                        <strong> Created:</strong> {formatTimestamp(session.created_at)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      v{session.version}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400">No sessions found</div>
          )}
        </div>

        {/* Selected Session Details */}
        {selectedSession && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversations */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">
                Conversations ({conversations.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {conversations.map((conv) => (
                  <div key={conv.conversation_id} className="bg-gray-700/30 rounded p-3">
                    <div className="text-sm text-gray-300 mb-1">
                      <strong>You:</strong> {conv.data.user_input}
                    </div>
                    <div className="text-sm text-gray-400 mb-1">
                      <strong>AI:</strong> {conv.data.ai_response}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(conv.timestamp)} | 
                      {conv.data.processing_time.toFixed(2)}s | 
                      {conv.data.word_count} words
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Session Metrics</h3>
              {metrics ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-300">
                    <strong>Session ID:</strong> {metrics.session_id}
                  </div>
                  <div className="text-sm text-gray-300">
                    <strong>Timestamp:</strong> {formatTimestamp(metrics.timestamp)}
                  </div>
                  <div className="text-sm text-gray-300">
                    <strong>Version:</strong> {metrics.version}
                  </div>
                  <div className="text-xs text-gray-400 mt-4">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(metrics.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">No metrics available</div>
              )}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadCloudStorageData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  );
}; 