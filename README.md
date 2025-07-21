# Dharsan-VoiceAgent-Frontend

A high-performance, real-time voice AI frontend built with React, TypeScript, and Web Audio API. This project demonstrates advanced real-time communication patterns and low-latency audio processing for conversational AI applications.

## 🚀 Features

- **Real-time Voice Communication**: Ultra-low latency audio streaming via WebSockets
- **Advanced Audio Processing**: AudioWorklet-based microphone capture for minimal latency
- **Seamless Audio Playback**: Web Audio API with queued streaming for continuous conversation
- **Modern React Architecture**: TypeScript, custom hooks, and functional components
- **Responsive Design**: Mobile-first approach with accessibility features
- **Production Ready**: Deployed on Vercel with environment management

## 🏗️ Architecture

### Technology Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Deployment**: Vercel
- **Audio Processing**: Web Audio API + AudioWorklet
- **Real-time Communication**: WebSocket
- **State Management**: React Hooks + Custom useVoiceAgent hook

### Core Components

```
src/
├── components/
│   ├── VoiceAgent.tsx          # Main voice agent component
│   ├── AudioVisualizer.tsx     # Audio level visualization
│   └── StatusIndicator.tsx     # Connection/recording status
├── hooks/
│   └── useVoiceAgent.ts        # Core real-time logic hook
├── utils/
│   ├── audioProcessor.js       # AudioWorklet processor
│   └── websocket.ts           # WebSocket utilities
└── types/
    └── voice.ts               # TypeScript definitions
```

## 📋 Prerequisites

- Node.js 18+ (recommended: v20.18.1)
- npm or yarn
- Modern browser with Web Audio API support
- Microphone access permissions

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd Dharsan-VoiceAgent-Frontend
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the project root:

```env
REACT_APP_WEBSOCKET_URL=wss://your-modal-backend-url.modal.run
```

### 3. Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🎯 Core Implementation Details

### Audio Capture with AudioWorklet

The application uses AudioWorklet for high-performance audio capture:

```typescript
// audioProcessor.js
class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      // Convert to 16kHz, 16-bit PCM
      const audioData = this.downsampleAndConvert(input[0]);
      this.port.postMessage(audioData);
    }
    return true;
  }
}
```

### Real-time Communication Hook

The `useVoiceAgent` hook encapsulates all real-time logic:

```typescript
const useVoiceAgent = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closed'>('closed');
  const [isRecording, setIsRecording] = useState(false);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startConversation = useCallback(() => {
    // Initialize WebSocket, audio capture, and playback
  }, []);

  const stopConversation = useCallback(() => {
    // Clean up connections and audio streams
  }, []);

  return {
    connectionStatus,
    isRecording,
    isAIResponding,
    transcript,
    startConversation,
    stopConversation
  };
};
```

### Audio Playback Queue System

Seamless audio streaming using Web Audio API:

```typescript
const playNextInQueue = async () => {
  if (isPlaying || audioQueue.length === 0) return;
  
  const chunk = audioQueue.shift();
  const audioBuffer = await audioContext.decodeAudioData(chunk);
  const source = audioContext.createBufferSource();
  
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.onended = () => {
    setIsPlaying(false);
    playNextInQueue(); // Chain to next chunk
  };
  
  source.start(0);
  setIsPlaying(true);
};
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add `REACT_APP_WEBSOCKET_URL` with your Modal backend URL

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_WEBSOCKET_URL` | WebSocket URL of Modal backend | `wss://app-name.modal.run` |

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Performance Testing
- Test audio latency: Target <300ms end-to-end
- Test WebSocket connection stability
- Test audio quality and interruption handling

## 🔧 Development

### Project Structure
```
├── public/
│   └── audio-processor.js    # AudioWorklet processor
├── src/
│   ├── components/           # React components
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript definitions
│   ├── App.tsx              # Main application
│   └── main.tsx             # Entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env.local
```

### Key Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^4.0.0",
  "@types/react": "^18.0.0",
  "@types/react-dom": "^18.0.0"
}
```

## 🎨 UI/UX Features

- **Real-time Status Indicators**: Connection, recording, and AI response states
- **Audio Visualization**: Live audio level display
- **Transcript Display**: Real-time conversation transcript
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## 🔒 Security Considerations

- HTTPS required for microphone access
- WebSocket connection over WSS
- No audio data stored locally
- Secure environment variable handling

## 🐛 Troubleshooting

### Common Issues

1. **Microphone Access Denied**
   - Ensure HTTPS/WSS connection
   - Check browser permissions
   - Verify microphone hardware

2. **Audio Latency Issues**
   - Check network connection quality
   - Verify backend service status
   - Monitor browser performance

3. **WebSocket Connection Failures**
   - Verify backend URL in environment variables
   - Check CORS configuration
   - Ensure backend is deployed and running

## 📈 Performance Metrics

- **Target Latency**: <300ms end-to-end
- **Audio Quality**: 16kHz, 16-bit PCM
- **Connection Stability**: 99.9% uptime
- **Browser Support**: Chrome 88+, Firefox 85+, Safari 14+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Related Projects

- [Dharsan-VoiceAgent-Backend](../Dharsan-VoiceAgent-Backend) - Python/FastAPI backend on Modal
- [Real-time AI Audio Demo Guide](./Real-time%20AI%20Audio%20Demo_.pdf) - Comprehensive implementation guide

---

**Built with ❤️ for demonstrating advanced real-time voice AI capabilities**