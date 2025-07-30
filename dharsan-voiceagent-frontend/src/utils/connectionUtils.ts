// Connection utility functions
import { getServiceUrls } from '../config/production';

export interface ConnectionStatus {
  status: 'disconnected' | 'connecting' | 'connected';
  pipelineStatus: string;
  error?: string;
}

export const establishBackendConnection = async (isProduction: boolean = false): Promise<ConnectionStatus> => {
  const { orchestratorHttpUrl } = getServiceUrls();
  
  try {
    const orchestratorResponse = await fetch(`${orchestratorHttpUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (orchestratorResponse.ok) {
      return {
        status: 'connected',
        pipelineStatus: 'active'
      };
    } else {
      return {
        status: 'disconnected',
        pipelineStatus: 'idle',
        error: 'Orchestrator not responding'
      };
    }
  } catch (error) {
    return {
      status: 'disconnected',
      pipelineStatus: 'idle',
      error: 'Network error'
    };
  }
};

export const getEnvironmentUrl = (isProduction: boolean, useEventDriven: boolean = true): string => {
  const { orchestratorGrpcUrl, orchestratorWsUrl } = getServiceUrls();
  return useEventDriven ? orchestratorGrpcUrl : orchestratorWsUrl;
};

export const updateUrlWithProduction = (isProduction: boolean): void => {
  const url = new URL(window.location.href);
  if (isProduction) {
    url.searchParams.set('production', 'true');
  } else {
    url.searchParams.delete('production');
  }
  window.history.replaceState({}, '', url.toString());
}; 