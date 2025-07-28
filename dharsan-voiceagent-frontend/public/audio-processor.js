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

      // Echo the audio (for testing)
      if (output && output.length > 0) {
        const outputChannel = output[0];
        for (let i = 0; i < inputChannel.length; i++) {
          outputChannel[i] = inputChannel[i];
        }
      }
    }

    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor); 