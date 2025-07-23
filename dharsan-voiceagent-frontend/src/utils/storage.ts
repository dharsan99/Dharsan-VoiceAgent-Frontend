// Storage utility for persistent data across page refreshes
// Handles metrics, conversation history, session data, and user preferences

export interface StoredMetrics {
  timestamp: string;
  averageLatency: number;
  jitter: number;
  packetLoss: number;
  processingTime: number;
  sessionId: string;
}

export interface StoredConversation {
  id: string;
  timestamp: string;
  userInput: string;
  aiResponse: string;
  confidence: number;
  processingTime: number;
  sessionId: string;
}

export interface StoredSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  totalExchanges: number;
  averageLatency: number;
  totalErrors: number;
  status: 'active' | 'completed' | 'error';
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  audioLevel: number;
  autoConnect: boolean;
  saveHistory: boolean;
  maxHistorySize: number;
}

// Storage keys
const STORAGE_KEYS = {
  METRICS: 'voice_agent_metrics',
  CONVERSATIONS: 'voice_agent_conversations',
  SESSIONS: 'voice_agent_sessions',
  PREFERENCES: 'voice_agent_preferences',
  CURRENT_SESSION: 'voice_agent_current_session',
  NETWORK_STATS: 'voice_agent_network_stats',
  ERROR_STATS: 'voice_agent_error_stats',
} as const;

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  audioLevel: 0.7,
  autoConnect: false,
  saveHistory: true,
  maxHistorySize: 100,
};

// Helper functions
const getStorageData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
};

const setStorageData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
};

const getSessionData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from sessionStorage: ${key}`, error);
    return defaultValue;
  }
};

const setSessionData = <T>(key: string, data: T): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to sessionStorage: ${key}`, error);
  }
};

// Metrics storage
export const MetricsStorage = {
  // Get all stored metrics
  getAll: (): StoredMetrics[] => {
    return getStorageData(STORAGE_KEYS.METRICS, []);
  },

  // Add a new metrics entry
  add: (metrics: Omit<StoredMetrics, 'timestamp'>): void => {
    const allMetrics = MetricsStorage.getAll();
    const newMetric: StoredMetrics = {
      ...metrics,
      timestamp: new Date().toISOString(),
    };
    
    allMetrics.push(newMetric);
    
    // Keep only recent metrics (last 1000 entries)
    if (allMetrics.length > 1000) {
      allMetrics.splice(0, allMetrics.length - 1000);
    }
    
    setStorageData(STORAGE_KEYS.METRICS, allMetrics);
  },

  // Get metrics for a specific session
  getBySession: (sessionId: string): StoredMetrics[] => {
    const allMetrics = MetricsStorage.getAll();
    return allMetrics.filter(metric => metric.sessionId === sessionId);
  },

  // Get recent metrics (last N entries)
  getRecent: (count: number = 50): StoredMetrics[] => {
    const allMetrics = MetricsStorage.getAll();
    return allMetrics.slice(-count);
  },

  // Clear all metrics
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.METRICS);
  },

  // Clear metrics for a specific session
  clearSession: (sessionId: string): void => {
    const allMetrics = MetricsStorage.getAll();
    const filteredMetrics = allMetrics.filter(metric => metric.sessionId !== sessionId);
    setStorageData(STORAGE_KEYS.METRICS, filteredMetrics);
  },
};

// Conversation storage
export const ConversationStorage = {
  // Get all stored conversations
  getAll: (): StoredConversation[] => {
    const conversations = getStorageData(STORAGE_KEYS.CONVERSATIONS, []);
    
    // Handle backward compatibility: add IDs to conversations that don't have them
    const conversationsWithIds = conversations.map((conv: any, index) => {
      if (!conv.id) {
        return {
          ...conv,
          id: `legacy_${conv.timestamp}_${index}`,
        } as StoredConversation;
      }
      return conv as StoredConversation;
    });
    
    // If we had to add IDs, update the storage
    if (conversationsWithIds.length !== conversations.length || 
        conversationsWithIds.some((conv, index) => conv.id !== (conversations[index] as any)?.id)) {
      setStorageData(STORAGE_KEYS.CONVERSATIONS, conversationsWithIds);
    }
    
    return conversationsWithIds;
  },

  // Add a new conversation entry
  add: (conversation: Omit<StoredConversation, 'timestamp' | 'id'>): void => {
    const allConversations = ConversationStorage.getAll();
    const newConversation: StoredConversation = {
      ...conversation,
      id: StorageUtils.generateConversationId(),
      timestamp: new Date().toISOString(),
    };
    
    allConversations.push(newConversation);
    
    // Keep only recent conversations (last 500 entries)
    if (allConversations.length > 500) {
      allConversations.splice(0, allConversations.length - 500);
    }
    
    setStorageData(STORAGE_KEYS.CONVERSATIONS, allConversations);
  },

  // Get conversations for a specific session
  getBySession: (sessionId: string): StoredConversation[] => {
    const allConversations = ConversationStorage.getAll();
    return allConversations.filter(conv => conv.sessionId === sessionId);
  },

  // Get recent conversations (last N entries)
  getRecent: (count: number = 50): StoredConversation[] => {
    const allConversations = ConversationStorage.getAll();
    return allConversations.slice(-count);
  },

  // Clear all conversations
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
  },

  // Clear conversations for a specific session
  clearSession: (sessionId: string): void => {
    const allConversations = ConversationStorage.getAll();
    const filteredConversations = allConversations.filter(conv => conv.sessionId !== sessionId);
    setStorageData(STORAGE_KEYS.CONVERSATIONS, filteredConversations);
  },
};

// Session storage
export const SessionStorage = {
  // Get all stored sessions
  getAll: (): StoredSession[] => {
    const sessions = getStorageData(STORAGE_KEYS.SESSIONS, []);
    
    // Handle backward compatibility: ensure all sessions have valid sessionIds
    const sessionsWithValidIds = sessions.map((session: any) => {
      if (!session.sessionId || typeof session.sessionId !== 'string') {
        return {
          ...session,
          sessionId: StorageUtils.generateSessionId(),
        } as StoredSession;
      }
      return session as StoredSession;
    });
    
    // If we had to fix sessionIds, update the storage
    if (sessionsWithValidIds.length !== sessions.length || 
        sessionsWithValidIds.some((session, index) => session.sessionId !== (sessions[index] as any)?.sessionId)) {
      setStorageData(STORAGE_KEYS.SESSIONS, sessionsWithValidIds);
    }
    
    return sessionsWithValidIds;
  },

  // Add a new session
  add: (session: Omit<StoredSession, 'startTime'>): void => {
    const allSessions = SessionStorage.getAll();
    const newSession: StoredSession = {
      ...session,
      startTime: new Date().toISOString(),
    };
    
    allSessions.push(newSession);
    
    // Keep only recent sessions (last 100 entries)
    if (allSessions.length > 100) {
      allSessions.splice(0, allSessions.length - 100);
    }
    
    setStorageData(STORAGE_KEYS.SESSIONS, allSessions);
  },

  // Update session end time
  endSession: (sessionId: string): void => {
    const allSessions = SessionStorage.getAll();
    const sessionIndex = allSessions.findIndex(session => session.sessionId === sessionId);
    
    if (sessionIndex !== -1) {
      allSessions[sessionIndex].endTime = new Date().toISOString();
      allSessions[sessionIndex].status = 'completed';
      setStorageData(STORAGE_KEYS.SESSIONS, allSessions);
    }
  },

  // Get current active session
  getCurrent: (): StoredSession | null => {
    return getSessionData(STORAGE_KEYS.CURRENT_SESSION, null);
  },

  // Set current session
  setCurrent: (session: StoredSession | null): void => {
    setSessionData(STORAGE_KEYS.CURRENT_SESSION, session);
  },

  // Clear all sessions
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  },
};

// User preferences storage
export const PreferencesStorage = {
  // Get user preferences
  get: (): UserPreferences => {
    return getStorageData(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  },

  // Update user preferences
  update: (updates: Partial<UserPreferences>): void => {
    const current = PreferencesStorage.get();
    const updated = { ...current, ...updates };
    setStorageData(STORAGE_KEYS.PREFERENCES, updated);
  },

  // Reset to default preferences
  reset: (): void => {
    setStorageData(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  },
};

// Network stats storage (session-based)
export const NetworkStatsStorage = {
  // Get current network stats
  get: () => {
    return getSessionData(STORAGE_KEYS.NETWORK_STATS, {
      averageLatency: 0,
      jitter: 0,
      packetLoss: 0,
      bufferSize: 3,
      jitterBufferDelay: 100,
    });
  },

  // Update network stats
  update: (stats: any): void => {
    setSessionData(STORAGE_KEYS.NETWORK_STATS, stats);
  },

  // Clear network stats
  clear: (): void => {
    sessionStorage.removeItem(STORAGE_KEYS.NETWORK_STATS);
  },
};

// Error stats storage (session-based)
export const ErrorStatsStorage = {
  // Get current error stats
  get: () => {
    return getSessionData(STORAGE_KEYS.ERROR_STATS, {
      totalErrors: 0,
      recentErrors: 0,
      byType: {},
      bySeverity: {},
    });
  },

  // Update error stats
  update: (stats: any): void => {
    setSessionData(STORAGE_KEYS.ERROR_STATS, stats);
  },

  // Clear error stats
  clear: (): void => {
    sessionStorage.removeItem(STORAGE_KEYS.ERROR_STATS);
  },
};

// Utility functions
export const StorageUtils = {
  // Generate a unique session ID with enhanced uniqueness
  generateSessionId: (): string => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 12);
    const performancePart = performance.now().toString(36).substr(2, 8);
    return `session_${timestamp}_${randomPart}_${performancePart}`;
  },

  // Generate a unique conversation ID
  generateConversationId: (): string => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 12);
    const performancePart = performance.now().toString(36).substr(2, 8);
    return `conv_${timestamp}_${randomPart}_${performancePart}`;
  },

  // Generate a unique ID with custom prefix
  generateUniqueId: (prefix: string = 'id'): string => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 12);
    const performancePart = performance.now().toString(36).substr(2, 8);
    return `${prefix}_${timestamp}_${randomPart}_${performancePart}`;
  },

  // Validate if an ID is unique across all stored data
  isIdUnique: (id: string): boolean => {
    const conversations = ConversationStorage.getAll();
    const sessions = SessionStorage.getAll();
    
    // Check conversations
    const conversationExists = conversations.some(conv => conv.id === id);
    if (conversationExists) return false;
    
    // Check sessions
    const sessionExists = sessions.some(session => session.sessionId === id);
    if (sessionExists) return false;
    
    return true;
  },

  // Generate a guaranteed unique ID
  generateGuaranteedUniqueId: (prefix: string = 'id'): string => {
    let id: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      id = StorageUtils.generateUniqueId(prefix);
      attempts++;
    } while (!StorageUtils.isIdUnique(id) && attempts < maxAttempts);
    
    return id;
  },

  // Validate all stored data for ID uniqueness
  validateDataIntegrity: (): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];
    const conversations = ConversationStorage.getAll();
    const sessions = SessionStorage.getAll();
    
    // Check for duplicate conversation IDs
    const conversationIds = conversations.map(conv => conv.id);
    const duplicateConversationIds = conversationIds.filter((id, index) => conversationIds.indexOf(id) !== index);
    if (duplicateConversationIds.length > 0) {
      issues.push(`Duplicate conversation IDs found: ${duplicateConversationIds.join(', ')}`);
    }
    
    // Check for duplicate session IDs
    const sessionIds = sessions.map(session => session.sessionId);
    const duplicateSessionIds = sessionIds.filter((id, index) => sessionIds.indexOf(id) !== index);
    if (duplicateSessionIds.length > 0) {
      issues.push(`Duplicate session IDs found: ${duplicateSessionIds.join(', ')}`);
    }
    
    // Check for missing IDs
    const conversationsWithoutIds = conversations.filter(conv => !conv.id);
    if (conversationsWithoutIds.length > 0) {
      issues.push(`${conversationsWithoutIds.length} conversations missing IDs`);
    }
    
    const sessionsWithoutIds = sessions.filter(session => !session.sessionId);
    if (sessionsWithoutIds.length > 0) {
      issues.push(`${sessionsWithoutIds.length} sessions missing IDs`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  },

  // Export all data as JSON
  exportData: (): string => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: MetricsStorage.getAll(),
      conversations: ConversationStorage.getAll(),
      sessions: SessionStorage.getAll(),
      preferences: PreferencesStorage.get(),
    };
    
    return JSON.stringify(data, null, 2);
  },

  // Import data from JSON
  importData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.metrics) MetricsStorage.clear();
      if (data.conversations) ConversationStorage.clear();
      if (data.sessions) SessionStorage.clear();
      
      if (data.metrics) {
        data.metrics.forEach((metric: StoredMetrics) => {
          MetricsStorage.add(metric);
        });
      }
      
      if (data.conversations) {
        data.conversations.forEach((conv: StoredConversation) => {
          // For import, we need to preserve the existing ID
          const allConversations = ConversationStorage.getAll();
          allConversations.push(conv);
          setStorageData(STORAGE_KEYS.CONVERSATIONS, allConversations);
        });
      }
      
      if (data.sessions) {
        data.sessions.forEach((session: StoredSession) => {
          SessionStorage.add(session);
        });
      }
      
      if (data.preferences) {
        PreferencesStorage.update(data.preferences);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  // Clear all stored data
  clearAll: (): void => {
    localStorage.clear();
    sessionStorage.clear();
  },

  // Get storage usage statistics
  getUsageStats: () => {
    const metrics = MetricsStorage.getAll();
    const conversations = ConversationStorage.getAll();
    const sessions = SessionStorage.getAll();
    
    return {
      metricsCount: metrics.length,
      conversationsCount: conversations.length,
      sessionsCount: sessions.length,
      totalSize: new Blob([JSON.stringify({ metrics, conversations, sessions })]).size,
    };
  },
}; 