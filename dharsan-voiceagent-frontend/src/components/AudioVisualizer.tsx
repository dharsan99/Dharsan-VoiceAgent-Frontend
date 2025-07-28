import React, { useEffect, useRef, useState } from 'react';
import { useVoiceAgentStore } from '../stores/voiceAgentStore';

interface AudioVisualizerProps {
  className?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { audioLevel } = useVoiceAgentStore();
  const [visualizationType, setVisualizationType] = useState<'waveform' | 'frequency'>('waveform');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawVisualization = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      if (visualizationType === 'waveform') {
        drawWaveform(ctx, width, height);
      } else {
        drawFrequency(ctx, width, height);
      }

      animationFrameRef.current = requestAnimationFrame(drawVisualization);
    };

    drawVisualization();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visualizationType, audioLevel]);

  const drawWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerY = height / 2;
    const amplitude = Math.min(audioLevel, height / 2); // audioLevel is already a percentage
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Draw waveform
    for (let x = 0; x < width; x++) {
      const normalizedX = x / width;
      const wave = Math.sin(normalizedX * Math.PI * 8) * amplitude;
      const y = centerY + wave;
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw center line
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
  };

  const drawFrequency = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const barWidth = width / 32;
    const maxHeight = height * 0.8;
    
    for (let i = 0; i < 32; i++) {
      const x = i * barWidth;
      const barHeight = (audioLevel / 100 * maxHeight) * (0.5 + Math.random() * 0.5);
      const y = height - barHeight;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, height);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#1d4ed8');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Audio Visualization</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setVisualizationType('waveform')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              visualizationType === 'waveform'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Waveform
          </button>
          <button
            onClick={() => setVisualizationType('frequency')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              visualizationType === 'frequency'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Frequency
          </button>
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-48 border border-gray-200 rounded-lg bg-gray-50"
        />
        
        {/* Audio level indicator */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          Level: {audioLevel.toFixed(1)}%
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        {visualizationType === 'waveform' 
          ? 'Real-time audio waveform visualization'
          : 'Frequency spectrum analysis'
        }
      </div>
    </div>
  );
};

export default AudioVisualizer; 