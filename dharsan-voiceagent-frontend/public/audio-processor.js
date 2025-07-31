class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.audioLevel = 0;
    this.smoothingFactor = 0.8;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (input && input.length > 0) {
      const inputChannel = input[0];
      
      // Calculate audio level (RMS)
      let sum = 0;
      for (let i = 0; i < inputChannel.length; i++) {
        sum += inputChannel[i] * inputChannel[i];
      }
      const rms = Math.sqrt(sum / inputChannel.length);
      
      // Scale the RMS value for better visualization
      const scaledLevel = Math.min(1, rms * 5); // Scale factor for microphone input
      
      // Smooth the audio level
      this.audioLevel = this.smoothingFactor * this.audioLevel + (1 - this.smoothingFactor) * scaledLevel;
      
      // Send audio level to main thread
      this.port.postMessage({
        type: 'audioLevel',
        level: this.audioLevel
      });

      // Convert Float32 to Int16 PCM for proper audio format
      const int16Data = new Int16Array(inputChannel.length);
      for (let i = 0; i < inputChannel.length; i++) {
        // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
        int16Data[i] = Math.max(-32768, Math.min(32767, Math.round(inputChannel[i] * 32767)));
      }
      
      // Send converted audio data for WebSocket transmission
      this.port.postMessage({
        type: 'audioData',
        audioData: int16Data.buffer
      });

      // REMOVED: Audio echo - don't send input back to output
      // This was causing the voice echo issue
    }

    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor); 