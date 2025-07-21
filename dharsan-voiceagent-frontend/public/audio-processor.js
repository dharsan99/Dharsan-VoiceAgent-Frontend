class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.sampleRate = 16000;
    this.bufferSize = 1024;
    this.audioBuffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    
    // Voice Activity Detection parameters
    this.energyThreshold = 0.01;
    this.silenceThreshold = 0.005;
    this.voiceActivityBuffer = new Float32Array(10); // Keep last 10 energy values
    this.voiceActivityIndex = 0;
    this.isVoiceActive = false;
    this.silenceCounter = 0;
    this.voiceCounter = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const inputChannel = input[0];
      
      // Fill audio buffer
      for (let i = 0; i < inputChannel.length; i++) {
        this.audioBuffer[this.bufferIndex] = inputChannel[i];
        this.bufferIndex++;
        
        if (this.bufferIndex >= this.bufferSize) {
          // Process complete buffer
          this.processAudioBuffer();
          this.bufferIndex = 0;
        }
      }
    }
    return true;
  }

  processAudioBuffer() {
    // Calculate RMS energy
    let energy = 0;
    for (let i = 0; i < this.bufferSize; i++) {
      energy += this.audioBuffer[i] * this.audioBuffer[i];
    }
    energy = Math.sqrt(energy / this.bufferSize);
    
    // Update voice activity buffer
    this.voiceActivityBuffer[this.voiceActivityIndex] = energy;
    this.voiceActivityIndex = (this.voiceActivityIndex + 1) % this.voiceActivityBuffer.length;
    
    // Calculate average energy over the buffer
    let avgEnergy = 0;
    for (let i = 0; i < this.voiceActivityBuffer.length; i++) {
      avgEnergy += this.voiceActivityBuffer[i];
    }
    avgEnergy /= this.voiceActivityBuffer.length;
    
    // Voice Activity Detection logic
    const wasVoiceActive = this.isVoiceActive;
    
    if (avgEnergy > this.energyThreshold) {
      this.voiceCounter++;
      this.silenceCounter = 0;
      
      if (this.voiceCounter > 3) { // Require 3 consecutive high-energy frames
        this.isVoiceActive = true;
      }
    } else if (avgEnergy < this.silenceThreshold) {
      this.silenceCounter++;
      this.voiceCounter = 0;
      
      if (this.silenceCounter > 5) { // Require 5 consecutive low-energy frames
        this.isVoiceActive = false;
      }
    }
    
    // Convert to 16-bit PCM and downsample if needed
    const audioData = this.downsampleAndConvert(this.audioBuffer);
    
    // Send audio data and voice activity status
    this.port.postMessage({
      audioData: audioData,
      voiceActivity: this.isVoiceActive,
      energy: avgEnergy
    });
  }

  downsampleAndConvert(float32Array) {
    // Simple downsampling: take every nth sample
    const downsampleFactor = 44100 / this.sampleRate; // Use 44.1kHz as source rate
    const downsampledLength = Math.floor(float32Array.length / downsampleFactor);
    const downsampled = new Int16Array(downsampledLength);
    
    for (let i = 0; i < downsampledLength; i++) {
      const sourceIndex = Math.floor(i * downsampleFactor);
      // Convert float32 (-1 to 1) to int16 (-32768 to 32767)
      const sample = Math.max(-1, Math.min(1, float32Array[sourceIndex]));
      downsampled[i] = sample * 32767;
    }
    
    return downsampled.buffer;
  }
}

registerProcessor('audio-processor', AudioProcessor); 