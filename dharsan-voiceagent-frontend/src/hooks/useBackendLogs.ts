import { useState, useEffect, useCallback } from 'react';
import { CONFIG, isProduction as getIsProduction } from '../config';

export interface BackendLogEntry {
  level: string;
  message: string;
  service: string;
  session_id: string | null;
  timestamp: string;
  [key: string]: any; // For additional fields like model_size, voice_size, etc.
}

export interface BackendLogsResponse {
  count: number;
  environment: string;
  logs: BackendLogEntry[];
  service: string;
  session_id: string;
  status: string;
  timestamp: string;
}

export const useBackendLogs = () => {
  const [logs, setLogs] = useState<BackendLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const getOrchestratorUrl = useCallback(() => {
    return CONFIG.ORCHESTRATOR.HTTP_URL;
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const orchestratorUrl = getOrchestratorUrl();
      console.log('Fetching logs from:', orchestratorUrl);
      
      const response = await fetch(`${orchestratorUrl}/logs?limit=50`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
      }
      
      const data: BackendLogsResponse = await response.json();
      console.log('Received logs response:', data);
      
      if (data.status === 'success' && data.logs) {
        setLogs(data.logs);
        setLastUpdate(new Date());
      } else {
        throw new Error('Invalid response format from orchestrator');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching backend logs:', err);
      
      // If configured URL fails, try with different protocol as fallback
      console.log('Primary URL failed, trying fallback...');
      try {
        // Try with alternative protocol or localhost fallback for dev
        const fallbackUrl = getIsProduction() ? CONFIG.ORCHESTRATOR.HTTP_URL : 'http://localhost:8004';
        const devResponse = await fetch(`${fallbackUrl}/logs?limit=50`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
          
        if (devResponse.ok) {
          const devData: BackendLogsResponse = await devResponse.json();
          if (devData.status === 'success' && devData.logs) {
            setLogs(devData.logs);
            setLastUpdate(new Date());
            setError(null); // Clear the error since fallback worked
            console.log('Successfully fetched logs from development URL');
            return;
          }
        }
      } catch (fallbackErr) {
        console.error('Fallback to development URL also failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getOrchestratorUrl]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setError(null);
    setLastUpdate(null);
  }, []);

  const formatLogEntry = useCallback((log: BackendLogEntry): string => {
    const timestamp = new Date(log.timestamp).toLocaleTimeString();
    const service = log.service.toUpperCase();
    const level = log.level.toUpperCase();
    
    // Format additional fields if present
    let additionalInfo = '';
    if (log.model_size) additionalInfo += ` | Model: ${log.model_size}`;
    if (log.voice_size) additionalInfo += ` | Voice: ${log.voice_size}`;
    if (log.voice_model) additionalInfo += ` | Voice Model: ${log.voice_model}`;
    if (log.model) additionalInfo += ` | Model: ${log.model}`;
    
    return `[${timestamp}] [${service}] [${level}] ${log.message}${additionalInfo}`;
  }, []);

  const getFormattedLogs = useCallback((): string[] => {
    return logs.map(formatLogEntry);
  }, [logs, formatLogEntry]);

  const getLogsByService = useCallback((service: string): BackendLogEntry[] => {
    return logs.filter(log => log.service === service);
  }, [logs]);

  const getLogsByLevel = useCallback((level: string): BackendLogEntry[] => {
    return logs.filter(log => log.level === level);
  }, [logs]);

  // Auto-refresh logs every 10 seconds when connected (less aggressive)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !error) {
        fetchLogs();
      }
    }, 10000); // Increased to 10 seconds to reduce load

    return () => clearInterval(interval);
  }, [fetchLogs, isLoading, error]);

  // Initial fetch with delay to allow services to start
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 2000); // Wait 2 seconds for services to be ready
    
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  return {
    logs,
    formattedLogs: getFormattedLogs(),
    isLoading,
    error,
    lastUpdate,
    fetchLogs,
    clearLogs,
    getLogsByService,
    getLogsByLevel,
    logCount: logs.length
  };
}; 