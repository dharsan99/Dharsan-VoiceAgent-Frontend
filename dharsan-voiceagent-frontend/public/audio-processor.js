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
      
      // Debug: Log first few samples occasionally
      if (Math.random() < 0.001) { // Log 0.1% of the time
        console.log('Audio processor receiving data:', inputChannel.length, 'samples, first sample:', inputChannel[0]);
      }
      
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
    
    // Debug: Log energy occasionally
    if (Math.random() < 0.01) { // Log 1% of the time
      console.log('Audio energy:', energy.toFixed(6));
    }
    
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
    
    // Convert to 16-bit PCM (no resampling needed since we're already at 16kHz)
    const audioData = this.convertToInt16(this.audioBuffer);
    
    // Send audio data and voice activity status
    this.port.postMessage({
      audioData: audioData,
      voiceActivity: this.isVoiceActive,
      energy: avgEnergy
    });
  }

  convertToInt16(float32Array) {
    // Convert float32 (-1 to 1) to int16 (-32768 to 32767) without resampling
    const int16Array = new Int16Array(float32Array.length);
    
    for (let i = 0; i < float32Array.length; i++) {
      // Convert float32 (-1 to 1) to int16 (-32768 to 32767)
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = sample * 32767;
    }
    
    return int16Array.buffer;
  }
}

registerProcessor('audio-processor', AudioProcessor); 