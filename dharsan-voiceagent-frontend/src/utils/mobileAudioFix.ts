// Mobile Audio Fix Utility
// Handles mobile-specific audio issues and browser restrictions

export interface MobileAudioConfig {
  enableTouchAudioResume: boolean;
  enableAutoplayTest: boolean;
  audioFormat: 'wav' | 'mp3' | 'auto';
  volume: number;
  enableVibration: boolean;
}

export class MobileAudioFix {
  private audioContext: AudioContext | null = null;
  private isMobile: boolean;
  private hasUserInteraction: boolean = false;
  private config: MobileAudioConfig;

  constructor(config: Partial<MobileAudioConfig> = {}) {
    this.config = {
      enableTouchAudioResume: true,
      enableAutoplayTest: true,
      audioFormat: 'auto',
      volume: 0.9,
      enableVibration: true,
      ...config
    };

    this.isMobile = this.detectMobile();
    this.setupMobileAudioHandlers();
  }

  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0);
  }

  private setupMobileAudioHandlers(): void {
    if (!this.isMobile) return;

    // Handle touch events for audio context resume
    if (this.config.enableTouchAudioResume) {
      const touchEvents = ['touchstart', 'touchend', 'touchmove'];
      const resumeAudioContext = async () => {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          try {
            await this.audioContext.resume();
            console.log('🔧 Mobile: Audio context resumed via touch event');
            this.hasUserInteraction = true;
          } catch (error) {
            console.warn('🔧 Mobile: Failed to resume audio context:', error);
          }
        }
      };

      touchEvents.forEach(eventType => {
        document.addEventListener(eventType, resumeAudioContext, { once: true, passive: true });
      });
    }

    // Handle click events for audio context resume
    const clickEvents = ['click', 'mousedown', 'keydown'];
    const resumeAudioContextClick = async () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume();
          console.log('🔧 Mobile: Audio context resumed via click event');
          this.hasUserInteraction = true;
        } catch (error) {
          console.warn('🔧 Mobile: Failed to resume audio context:', error);
        }
      }
    };

    clickEvents.forEach(eventType => {
      document.addEventListener(eventType, resumeAudioContextClick, { once: true, passive: true });
    });
  }

  async ensureAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
    }

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('🔧 Mobile: Audio context resumed');
        this.hasUserInteraction = true;
      } catch (error) {
        console.warn('🔧 Mobile: Failed to resume audio context:', error);
        throw new Error('Audio context resume failed - user interaction required');
      }
    }

    return this.audioContext;
  }

  async testAudioOutput(): Promise<boolean> {
    if (!this.config.enableAutoplayTest) return true;

    try {
      const context = await this.ensureAudioContext();
      
      // Create a simple test tone
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.setValueAtTime(440, context.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.1, context.currentTime); // Low volume
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1); // 100ms beep
      
      console.log('🔧 Mobile: Audio output test completed');
      return true;
    } catch (error) {
      console.warn('🔧 Mobile: Audio output test failed:', error);
      return false;
    }
  }

  async playAudioFromBase64(base64Data: string, format: string = 'auto'): Promise<boolean> {
    try {
      // Ensure audio context is ready
      await this.ensureAudioContext();
      
      // Decode base64 audio data
      const audioBytes = atob(base64Data);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }

      // Determine audio format
      const audioFormat = format === 'auto' ? this.detectAudioFormat(audioArray) : format;
      const mimeType = this.getMimeType(audioFormat);
      
      // Create audio blob
      const audioBlob = new Blob([audioArray], { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create audio element with mobile-specific settings
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audio.volume = this.config.volume;
      
      // Mobile-specific audio settings
      if (this.isMobile) {
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
        audio.setAttribute('controls', 'false');
      }

      // Set up audio event handlers
      const playPromise = new Promise<boolean>((resolve, reject) => {
        audio.oncanplay = () => {
          console.log('🔧 Mobile: Audio can play, starting playback');
        };
        
        audio.onended = () => {
          console.log('🔧 Mobile: Audio playback completed');
          URL.revokeObjectURL(audioUrl);
          resolve(true);
        };
        
        audio.onerror = (error) => {
          console.error('🔧 Mobile: Audio playback error:', error);
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        // Start playback
        audio.play().then(() => {
          console.log('🔧 Mobile: Audio playback started successfully');
          
          // Enable vibration feedback if supported
          if (this.config.enableVibration && 'vibrate' in navigator) {
            navigator.vibrate(50); // Short vibration feedback
          }
        }).catch((error) => {
          console.error('🔧 Mobile: Failed to start audio playback:', error);
          URL.revokeObjectURL(audioUrl);
          reject(error);
        });
      });

      return await playPromise;
    } catch (error) {
      console.error('🔧 Mobile: Failed to play audio:', error);
      return false;
    }
  }

  private detectAudioFormat(array: Uint8Array): string {
    // Simple format detection based on file headers
    if (array.length >= 4) {
      // WAV header: RIFF
      if (array[0] === 0x52 && array[1] === 0x49 && array[2] === 0x46 && array[3] === 0x46) {
        return 'wav';
      }
      // MP3 header: ID3 or MPEG sync
      if ((array[0] === 0x49 && array[1] === 0x44 && array[2] === 0x33) ||
          (array[0] === 0xFF && (array[1] & 0xE0) === 0xE0)) {
        return 'mp3';
      }
    }
    return 'wav'; // Default to WAV
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'wav':
        return 'audio/wav';
      case 'mp3':
        return 'audio/mpeg';
      default:
        return 'audio/wav';
    }
  }

  async requestMicrophoneAccess(): Promise<MediaStream> {
    try {
      // Ensure audio context is ready first
      await this.ensureAudioContext();
      
      const constraints = {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 16000
        },
        video: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('🔧 Mobile: Microphone access granted');
      return stream;
    } catch (error) {
      console.error('🔧 Mobile: Failed to access microphone:', error);
      throw error;
    }
  }

  isMobileDevice(): boolean {
    return this.isMobile;
  }

  hasUserInteracted(): boolean {
    return this.hasUserInteraction;
  }

  // Force user interaction for testing
  async forceUserInteraction(): Promise<void> {
    if (!this.isMobile) return;

    console.log('🔧 Mobile: Requesting user interaction for audio...');
    
    // Show a notification to the user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Voice Agent', {
        body: 'Tap anywhere to enable audio playback',
        icon: '/favicon.ico'
      });
    }

    // Wait for any user interaction
    return new Promise((resolve) => {
      const handleInteraction = async () => {
        try {
          await this.ensureAudioContext();
          await this.testAudioOutput();
          this.hasUserInteraction = true;
          console.log('🔧 Mobile: User interaction completed, audio enabled');
          resolve();
        } catch (error) {
          console.warn('🔧 Mobile: User interaction failed:', error);
          resolve();
        }
        
        // Clean up event listeners
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };

      document.addEventListener('touchstart', handleInteraction, { once: true });
      document.addEventListener('click', handleInteraction, { once: true });
      document.addEventListener('keydown', handleInteraction, { once: true });
    });
  }
}

// Export singleton instance
export const mobileAudioFix = new MobileAudioFix();

// Export utility functions
export const isMobileDevice = () => mobileAudioFix.isMobileDevice();
export const ensureMobileAudio = () => mobileAudioFix.ensureAudioContext();
export const playMobileAudio = (base64Data: string, format?: string) => 
  mobileAudioFix.playAudioFromBase64(base64Data, format);
export const requestMobileMicrophone = () => mobileAudioFix.requestMicrophoneAccess(); 