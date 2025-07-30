// Metrics utility functions
import { CONFIG } from '../config';

export interface PhaseTimings {
  [key: string]: number;
}

export interface ServiceMetrics {
  stt?: number;
  tts?: number;
  llm?: number;
}

export const fetchPipelineStatus = async (isProduction: boolean = false): Promise<{
  pipelineStatus: string;
  phaseTimings: PhaseTimings;
  activeSessions?: number;
}> => {
  const orchestratorHttpUrl = CONFIG.ORCHESTRATOR.HTTP_URL;
  
  try {
    // Use health endpoint instead of metrics (which doesn't exist)
    const orchestratorResponse = await fetch(`${orchestratorHttpUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (orchestratorResponse.ok) {
      const data = await orchestratorResponse.json();
      
      // Determine pipeline status based on health response
      const pipelineStatus = data.status === 'healthy' ? 'idle' : 'error';
      const phaseTimings: PhaseTimings = {};
      
      // Extract basic timing info if available
      if (data.uptime) {
        phaseTimings.uptime = data.uptime;
      }
      
      return {
        pipelineStatus,
        phaseTimings,
        activeSessions: 0 // Not available from health endpoint
      };
    } else {
      throw new Error(`HTTP ${orchestratorResponse.status}`);
    }
  } catch (error) {
    throw new Error('Orchestrator connection failed');
  }
};

// Helper function to retry fetch with exponential backoff
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait with exponential backoff
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Failed to fetch after ${maxRetries} attempts`);
};

export const fetchServiceMetrics = async (isProduction: boolean = false): Promise<ServiceMetrics> => {
  const metrics: ServiceMetrics = {};
  
  if (isProduction) {
    // In production, internal services are not directly accessible
    // Their status is reported by the orchestrator health endpoint
    try {
      const { orchestratorHttpUrl } = getServiceUrls();
      const orchestratorResponse = await fetchWithRetry(`${orchestratorHttpUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (orchestratorResponse.ok) {
        const data = await orchestratorResponse.json();
        
        // Extract service status from orchestrator health response
        if (data.ai_enabled) {
          // If AI is enabled, assume services are working
          metrics.stt = 0; // Placeholder - actual metrics not available
          metrics.tts = 0; // Placeholder - actual metrics not available
          metrics.llm = 0; // Placeholder - actual metrics not available
        }
      }
    } catch (error) {
      console.log('Production orchestrator unavailable:', error);
    }
  } else {
    // Development - fetch from individual services
    const sttUrl = CONFIG.STT_SERVICE.HTTP_URL;
    const ttsUrl = CONFIG.TTS_SERVICE.HTTP_URL;
    
    try {
      // STT Service Metrics (Prometheus format)
      try {
        const sttResponse = await fetchWithRetry(`${sttUrl}/metrics`, {
          method: 'GET',
          headers: { 'Accept': 'text/plain' } // Prometheus format
        });
        
        if (sttResponse.ok) {
          const prometheusData = await sttResponse.text();
          // Parse Prometheus metrics to extract STT timing
          const sttMatch = prometheusData.match(/stt_transcription_duration_seconds\s+([0-9.]+)/);
          if (sttMatch) {
            metrics.stt = parseFloat(sttMatch[1]) * 1000; // Convert to milliseconds
          }
        }
      } catch (error) {
        // STT service unavailable
        console.log('STT metrics unavailable:', error);
      }

      // TTS Service Metrics (Prometheus format)
      try {
        const ttsResponse = await fetchWithRetry(`${ttsUrl}/metrics`, {
          method: 'GET',
          headers: { 'Accept': 'text/plain' } // Prometheus format
        });
        
        if (ttsResponse.ok) {
          const prometheusData = await ttsResponse.text();
          // Parse Prometheus metrics to extract TTS timing
          const ttsMatch = prometheusData.match(/tts_synthesis_duration_seconds\s+([0-9.]+)/);
          if (ttsMatch) {
            metrics.tts = parseFloat(ttsMatch[1]) * 1000; // Convert to milliseconds
          }
        }
      } catch (error) {
        // TTS service unavailable
        console.log('TTS metrics unavailable:', error);
      }

      // LLM Service - No metrics endpoint available, skip
      // Ollama doesn't provide a /metrics endpoint
      metrics.llm = 0; // Placeholder
    } catch (error) {
      console.log('Service metrics unavailable:', error);
    }
  }

  return metrics;
}; 