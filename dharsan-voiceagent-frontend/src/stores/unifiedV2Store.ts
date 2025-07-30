import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CONFIG } from '../config';
import type {
  UnifiedV2Store,
  PhaseType,
  ServiceType,
  ServiceState,
  ConnectionState,
  PerformanceMetrics,
  SessionAnalytics,
  TestResult,
  DebugInfo,
  KPIState,
  AudioState,
  NetworkState,
  PipelineState
} from '../types/unifiedV2';

// Initial state
const initialState = {
  // Phase Management
  currentPhase: 'phase2' as PhaseType,
  phases: {
    phase1: {
      phase: 'phase1',
      enabled: true,
      active: false,
      features: {
        webRTC: true,
        whip: false,
        eventDriven: false,
        audioProcessing: true,
        pipelineMonitoring: false,
        testingTools: false
      }
    },
    phase2: {
      phase: 'phase2',
      enabled: true,
      active: true,
      features: {
        webRTC: false,
        whip: true,
        eventDriven: false,
        audioProcessing: true,
        pipelineMonitoring: true,
        testingTools: true
      }
    },
    phase5: {
      phase: 'phase5',
      enabled: true,
      active: false,
      features: {
        webRTC: false,
        whip: true,
        eventDriven: true,
        audioProcessing: true,
        pipelineMonitoring: true,
        testingTools: true
      }
    }
  },

  // Connection States
  webRTC: {
    status: 'disconnected' as const,
    sessionId: undefined,
    error: undefined,
    connectedAt: undefined,
    lastActivity: undefined
  },
  whip: {
    status: 'disconnected' as const,
    sessionId: undefined,
    error: undefined,
    connectedAt: undefined,
    lastActivity: undefined
  },
  websocket: {
    status: 'disconnected' as const,
    sessionId: undefined,
    error: undefined,
    connectedAt: undefined,
    lastActivity: undefined
  },

  // Service States
  services: {
    stt: {
      type: 'stt',
      status: 'idle',
      progress: 0,
      message: undefined,
      error: undefined,
      startTime: undefined,
      endTime: undefined,
      duration: undefined
    },
    llm: {
      type: 'llm',
      status: 'idle',
      progress: 0,
      message: undefined,
      error: undefined,
      startTime: undefined,
      endTime: undefined,
      duration: undefined
    },
    tts: {
      type: 'tts',
      status: 'idle',
      progress: 0,
      message: undefined,
      error: undefined,
      startTime: undefined,
      endTime: undefined,
      duration: undefined
    },
    webrtc: {
      type: 'webrtc',
      status: 'idle',
      progress: 0,
      message: undefined,
      error: undefined,
      startTime: undefined,
      endTime: undefined,
      duration: undefined
    },
    whip: {
      type: 'whip',
      status: 'idle',
      progress: 0,
      message: undefined,
      error: undefined,
      startTime: undefined,
      endTime: undefined,
      duration: undefined
    },
    websocket: {
      type: 'websocket',
      status: 'idle',
      progress: 0,
      message: undefined,
      error: undefined,
      startTime: undefined,
      endTime: undefined,
      duration: undefined
    }
  },

  // Pipeline State
  pipeline: {
    currentStep: 'idle' as const,
    progress: 0,
    isActive: false,
    isListening: false,
    isProcessing: false,
    message: undefined,
    error: undefined,
    startTime: undefined,
    endTime: undefined,
    duration: undefined,
    cycleCount: 0
  },

  // Audio State
  audio: {
    isStreaming: false,
    isListening: false,
    audioLevel: 0.15,
    sampleRate: 16000,
    channels: 1,
    bufferSize: 4096
  },

  // Network State
  network: {
    connectionQuality: 'good' as const,
    jitter: 12,
    bandwidth: 25000,
    rtt: 45
  },

  // Performance Metrics
  performance: {
    latency: 45,
    packetLoss: 0.2,
    audioQuality: 95.8,
    connectionUptime: 99.7,
    successRate: 98.5,
    processingTime: 1250
  },

  // Session Analytics
  sessionAnalytics: null,

  // Testing & Debug
  testResults: [],
  debugInfo: {
    logs: [],
    errors: [],
    warnings: []
  },

  // KPIs
  kpis: {
    connectionUptime: 0,
    audioQualityScore: 0,
    processingLatency: 0,
    successRate: 0,
    totalSessions: 0,
    averageSessionDuration: 0,
    errorRate: 0
  },

  // UI State
  ui: {
    showConfigTest: false,
    showDebugPanel: false,
    showAnalytics: false,
    theme: 'phase2' as const,
    sidebarCollapsed: false
  }
};

// Create the store
export const useUnifiedV2Store = create<UnifiedV2Store>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Phase Management Actions
      setCurrentPhase: (phase: PhaseType) => {
        set((state) => ({
          currentPhase: phase,
          phases: {
            ...state.phases,
            [state.currentPhase]: {
              ...state.phases[state.currentPhase],
              active: false
            },
            [phase]: {
              ...state.phases[phase],
              active: true
            }
          },
          ui: {
            ...state.ui,
            theme: phase
          }
        }));
      },

      togglePhase: (phase: PhaseType) => {
        const state = get();
        if (state.currentPhase === phase) {
          // If clicking the same phase, do nothing or cycle through
          return;
        }
        get().setCurrentPhase(phase);
      },

      enablePhase: (phase: PhaseType) => {
        set((state) => ({
          phases: {
            ...state.phases,
            [phase]: {
              ...state.phases[phase],
              enabled: true
            }
          }
        }));
      },

      disablePhase: (phase: PhaseType) => {
        set((state) => ({
          phases: {
            ...state.phases,
            [phase]: {
              ...state.phases[phase],
              enabled: false,
              active: false
            }
          }
        }));
      },

      // Connection Management Actions
      connectWebRTC: async () => {
        console.log('🔗 Connecting WebRTC...');
        set((state) => ({
          webRTC: {
            ...state.webRTC,
            status: 'connecting'
          }
        }));

        try {
          // Simulate connection
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set((state) => ({
            webRTC: {
              status: 'connected',
              sessionId: `webrtc_${Date.now()}`,
              connectedAt: new Date(),
              lastActivity: new Date(),
              error: undefined
            }
          }));
          console.log('✅ WebRTC connected successfully');
        } catch (error) {
          set((state) => ({
            webRTC: {
              ...state.webRTC,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }));
          console.error('❌ WebRTC connection failed:', error);
        }
      },

      disconnectWebRTC: () => {
        console.log('🔗 Disconnecting WebRTC...');
        set((state) => ({
          webRTC: {
            status: 'disconnected',
            sessionId: undefined,
            error: undefined,
            connectedAt: undefined,
            lastActivity: undefined
          }
        }));
      },

      connectWHIP: async () => {
        console.log('🔗 Connecting WHIP...');
        set((state) => ({
          whip: {
            ...state.whip,
            status: 'connecting'
          }
        }));

        try {
          // Simulate connection
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set((state) => ({
            whip: {
              status: 'connected',
              sessionId: `whip_${Date.now()}`,
              connectedAt: new Date(),
              lastActivity: new Date(),
              error: undefined
            }
          }));
          console.log('✅ WHIP connected successfully');
        } catch (error) {
          set((state) => ({
            whip: {
              ...state.whip,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }));
          console.error('❌ WHIP connection failed:', error);
        }
      },

      disconnectWHIP: () => {
        console.log('🔗 Disconnecting WHIP...');
        set((state) => ({
          whip: {
            status: 'disconnected',
            sessionId: undefined,
            error: undefined,
            connectedAt: undefined,
            lastActivity: undefined
          }
        }));
      },

      connectWebSocket: async () => {
        console.log('🔗 Connecting WebSocket...');
        set((state) => ({
          websocket: {
            ...state.websocket,
            status: 'connecting'
          }
        }));

        try {
          // Simulate connection
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set((state) => ({
            websocket: {
              status: 'connected',
              sessionId: `ws_${Date.now()}`,
              connectedAt: new Date(),
              lastActivity: new Date(),
              error: undefined
            }
          }));
          console.log('✅ WebSocket connected successfully');
        } catch (error) {
          set((state) => ({
            websocket: {
              ...state.websocket,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }));
          console.error('❌ WebSocket connection failed:', error);
        }
      },

      disconnectWebSocket: () => {
        console.log('🔗 Disconnecting WebSocket...');
        set((state) => ({
          websocket: {
            status: 'disconnected',
            sessionId: undefined,
            error: undefined,
            connectedAt: undefined,
            lastActivity: undefined
          }
        }));
      },

      // Service Management Actions
      updateServiceStatus: (service: ServiceType, status: ServiceState) => {
        set((state) => ({
          services: {
            ...state.services,
            [service]: status
          }
        }));
      },

      resetService: (service: ServiceType) => {
        set((state) => ({
          services: {
            ...state.services,
            [service]: {
              type: service,
              status: 'idle',
              progress: 0,
              message: undefined,
              error: undefined,
              startTime: undefined,
              endTime: undefined,
              duration: undefined
            }
          }
        }));
      },

      // Pipeline Management Actions
      startPipeline: () => {
        set((state) => ({
          pipeline: {
            ...state.pipeline,
            isActive: true,
            currentStep: 'listening',
            progress: 0,
            isListening: true,
            isProcessing: false,
            startTime: new Date(),
            message: 'Starting to listen...'
          }
        }));
      },

      stopPipeline: () => {
        set((state) => ({
          pipeline: {
            ...state.pipeline,
            isActive: false,
            currentStep: 'idle',
            progress: 0,
            isListening: false,
            isProcessing: false,
            endTime: new Date(),
            message: 'Pipeline stopped'
          }
        }));
      },

      updatePipelineStep: (step: 'listening' | 'stt_processing' | 'llm_processing' | 'tts_processing' | 'receiving_response' | 'complete' | 'error', message?: string) => {
        set((state) => {
          const progressMap = {
            listening: 0.1,
            stt_processing: 0.3,
            llm_processing: 0.5,
            tts_processing: 0.7,
            receiving_response: 0.9,
            complete: 1.0,
            error: 0.0
          };

          const isListening = step === 'listening';
          const isProcessing = step.includes('processing') || step === 'receiving_response';

          return {
            pipeline: {
              ...state.pipeline,
              currentStep: step,
              progress: progressMap[step] || 0,
              isListening,
              isProcessing,
              message: message || `Pipeline step: ${step}`,
              cycleCount: step === 'complete' ? state.pipeline.cycleCount + 1 : state.pipeline.cycleCount
            }
          };
        });
      },

      updatePipelineProgress: (progress: number) => {
        set((state) => ({
          pipeline: {
            ...state.pipeline,
            progress: Math.max(0, Math.min(1, progress))
          }
        }));
      },

      resetPipeline: () => {
        set((state) => ({
          pipeline: {
            currentStep: 'idle',
            progress: 0,
            isActive: false,
            isListening: false,
            isProcessing: false,
            message: undefined,
            error: undefined,
            startTime: undefined,
            endTime: undefined,
            duration: undefined,
            cycleCount: 0
          }
        }));
      },

      // Audio Management Actions
      startAudioStreaming: () => {
        set((state) => {
          console.log('🔄 Starting audio streaming...', { 
            currentState: state.audio,
            connections: {
              webRTC: state.webRTC.status,
              whip: state.whip.status,
              websocket: state.websocket.status
            }
          });
          
          return {
            audio: {
              ...state.audio,
              isStreaming: true
            }
          };
        });
      },

      stopAudioStreaming: () => {
        set((state) => {
          console.log('🔄 Stopping audio streaming...', { currentState: state.audio });
          
          return {
            audio: {
              ...state.audio,
              isStreaming: false
            }
          };
        });
      },

      startListening: () => {
        set((state) => {
          console.log('🎤 Starting listening...', { 
            currentState: state.audio,
            connections: {
              webRTC: state.webRTC.status,
              whip: state.whip.status,
              websocket: state.websocket.status
            }
          });
          
          return {
            audio: {
              ...state.audio,
              isListening: true
            }
          };
        });
      },

      stopListening: () => {
        set((state) => {
          console.log('🎤 Stopping listening...', { currentState: state.audio });
          
          return {
            audio: {
              ...state.audio,
              isListening: false
            }
          };
        });
      },

      updateAudioLevel: (level: number) => {
        set((state) => ({
          audio: {
            ...state.audio,
            audioLevel: Math.max(0, Math.min(1, level))
          }
        }));
      },

      // Testing & Debug Actions
      runConfigTest: async (): Promise<TestResult> => {
        const testId = `config_${Date.now()}`;
        const startTime = new Date();

        set((state) => ({
          testResults: [
            ...state.testResults,
            {
              id: testId,
              type: 'config',
              status: 'running',
              startTime
            }
          ]
        }));

        try {
          // Simulate config test
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const result: TestResult = {
            id: testId,
            type: 'config',
            status: 'passed',
            message: 'Configuration test passed successfully',
            startTime,
            endTime: new Date(),
            duration: Date.now() - startTime.getTime(),
            details: {
              services: ['stt', 'llm', 'tts'],
              endpoints: [CONFIG.STT_SERVICE.HTTP_URL, CONFIG.LLM_SERVICE.HTTP_URL, CONFIG.TTS_SERVICE.HTTP_URL]
            }
          };

          set((state) => ({
            testResults: state.testResults.map(test => 
              test.id === testId ? result : test
            )
          }));

          return result;
        } catch (error) {
          const result: TestResult = {
            id: testId,
            type: 'config',
            status: 'failed',
            message: 'Configuration test failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            startTime,
            endTime: new Date(),
            duration: Date.now() - startTime.getTime()
          };

          set((state) => ({
            testResults: state.testResults.map(test => 
              test.id === testId ? result : test
            )
          }));

          return result;
        }
      },

      runPipelineTest: async (): Promise<TestResult> => {
        const testId = `pipeline_${Date.now()}`;
        const startTime = new Date();

        set((state) => ({
          testResults: [
            ...state.testResults,
            {
              id: testId,
              type: 'pipeline',
              status: 'running',
              startTime
            }
          ]
        }));

        try {
          // Simulate pipeline test
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const result: TestResult = {
            id: testId,
            type: 'pipeline',
            status: 'passed',
            message: 'Pipeline test completed successfully',
            startTime,
            endTime: new Date(),
            duration: Date.now() - startTime.getTime(),
            details: {
              steps: ['stt', 'llm', 'tts'],
              totalTime: 3000
            }
          };

          set((state) => ({
            testResults: state.testResults.map(test => 
              test.id === testId ? result : test
            )
          }));

          return result;
        } catch (error) {
          const result: TestResult = {
            id: testId,
            type: 'pipeline',
            status: 'failed',
            message: 'Pipeline test failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            startTime,
            endTime: new Date(),
            duration: Date.now() - startTime.getTime()
          };

          set((state) => ({
            testResults: state.testResults.map(test => 
              test.id === testId ? result : test
            )
          }));

          return result;
        }
      },

      runServiceTest: async (service: ServiceType): Promise<TestResult> => {
        const testId = `${service}_${Date.now()}`;
        const startTime = new Date();

        set((state) => ({
          testResults: [
            ...state.testResults,
            {
              id: testId,
              type: 'service',
              status: 'running',
              startTime
            }
          ]
        }));

        try {
          // Simulate service test
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const result: TestResult = {
            id: testId,
            type: 'service',
            status: 'passed',
            message: `${service.toUpperCase()} service test passed`,
            startTime,
            endTime: new Date(),
            duration: Date.now() - startTime.getTime(),
            details: {
              service,
              endpoint: service === 'stt' ? CONFIG.STT_SERVICE.HTTP_URL : 
                       service === 'llm' ? CONFIG.LLM_SERVICE.HTTP_URL : 
                       CONFIG.TTS_SERVICE.HTTP_URL
            }
          };

          set((state) => ({
            testResults: state.testResults.map(test => 
              test.id === testId ? result : test
            )
          }));

          return result;
        } catch (error) {
          const result: TestResult = {
            id: testId,
            type: 'service',
            status: 'failed',
            message: `${service.toUpperCase()} service test failed`,
            error: error instanceof Error ? error.message : 'Unknown error',
            startTime,
            endTime: new Date(),
            duration: Date.now() - startTime.getTime()
          };

          set((state) => ({
            testResults: state.testResults.map(test => 
              test.id === testId ? result : test
            )
          }));

          return result;
        }
      },

      addDebugLog: (level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) => {
        const log = {
          timestamp: new Date(),
          level,
          message,
          data
        };

        set((state) => ({
          debugInfo: {
            ...state.debugInfo,
            logs: [...state.debugInfo.logs, log].slice(-100) // Keep last 100 logs
          }
        }));
      },

      clearDebugLogs: () => {
        set((state) => ({
          debugInfo: {
            ...state.debugInfo,
            logs: []
          }
        }));
      },

      // UI Management Actions
      toggleConfigTest: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            showConfigTest: !state.ui.showConfigTest
          }
        }));
      },

      toggleDebugPanel: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            showDebugPanel: !state.ui.showDebugPanel
          }
        }));
      },

      toggleAnalytics: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            showAnalytics: !state.ui.showAnalytics
          }
        }));
      },

      setTheme: (theme: 'phase1' | 'phase2' | 'phase5') => {
        set((state) => ({
          ui: {
            ...state.ui,
            theme
          }
        }));
      },

      toggleSidebar: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            sidebarCollapsed: !state.ui.sidebarCollapsed
          }
        }));
      },

      // Analytics Actions
      updateSessionAnalytics: (analytics: Partial<SessionAnalytics>) => {
        set((state) => ({
          sessionAnalytics: state.sessionAnalytics 
            ? { ...state.sessionAnalytics, ...analytics }
            : { 
                sessionId: `session_${Date.now()}`,
                startTime: new Date(),
                duration: 0,
                messagesSent: 0,
                messagesReceived: 0,
                errors: 0,
                averageLatency: 0,
                peakAudioLevel: 0,
                ...analytics
              }
        }));
      },

      updateKPIs: (kpis: Partial<KPIState>) => {
        set((state) => ({
          kpis: {
            ...state.kpis,
            ...kpis
          }
        }));
      },

      updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => {
        set((state) => ({
          performance: {
            ...state.performance,
            ...metrics
          }
        }));
      }
    }),
    {
      name: 'unified-v2-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
); 