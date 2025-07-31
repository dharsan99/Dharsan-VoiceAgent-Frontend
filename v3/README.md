# Dharsan Voice Agent - V3 Frontend

## Version 3 Frontend Overview

V3 Frontend represents a complete modernization of the voice agent interface with **ultra-low latency audio processing**, **real-time streaming**, and **advanced user experience** features. Built with React 18, TypeScript, and modern web technologies.

### Key Features

- **Sub-100ms Audio Latency**: Optimized for the ultra-fast backend pipeline
- **Real-time Audio Streaming**: HTTP chunked transfer encoding (no WebSockets)
- **Voice Cloning Interface**: Upload reference audio for personalized voice
- **Advanced Audio Visualization**: Real-time waveform and spectrogram display
- **Responsive Design**: Mobile-first approach with PWA capabilities
- **Offline Support**: Service worker for offline functionality
- **Accessibility**: WCAG 2.1 AA compliant

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND ARCHITECTURE                             │
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Audio     │    │   State     │    │   API       │    │   UI        │  │
│  │  Capture    │───►│ Management  │───►│  Client     │───►│ Components  │  │
│  │             │    │             │    │             │    │             │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                             │
│  Web Audio API     Zustand Store    HTTP Streaming    React 18 + TS        │
│  MediaRecorder      Context API     Chunked Transfer  Tailwind CSS         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. **Audio Processing Pipeline**
- **Web Audio API**: High-performance audio capture and playback
- **MediaRecorder**: Real-time audio streaming to backend
- **AudioContext**: Low-latency audio processing
- **WebRTC**: Direct audio device access

#### 2. **State Management**
- **Zustand**: Lightweight state management
- **Context API**: Global state sharing
- **Local Storage**: Persistent user preferences
- **Session Storage**: Temporary conversation state

#### 3. **API Integration**
- **HTTP Streaming**: Chunked transfer encoding for audio
- **Job-based Processing**: Asynchronous interaction management
- **Error Handling**: Graceful degradation and retry logic
- **Rate Limiting**: Client-side request throttling

#### 4. **User Interface**
- **React 18**: Concurrent features and Suspense
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions

### Directory Structure

```
v3/
├── README.md                           # This file
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── vite.config.ts                      # Vite build configuration
├── index.html                          # Entry HTML file
├── public/                             # Static assets
│   ├── favicon.ico                     # App icon
│   ├── manifest.json                   # PWA manifest
│   └── assets/                         # Images and static files
├── src/                                # Source code
│   ├── main.tsx                        # Application entry point
│   ├── App.tsx                         # Root component
│   ├── index.css                       # Global styles
│   ├── components/                     # React components
│   │   ├── audio/                      # Audio-related components
│   │   │   ├── AudioRecorder.tsx       # Audio capture component
│   │   │   ├── AudioPlayer.tsx         # Audio playback component
│   │   │   ├── AudioVisualizer.tsx     # Waveform visualization
│   │   │   └── VoiceCloner.tsx         # Voice cloning interface
│   │   ├── ui/                         # UI components
│   │   │   ├── Button.tsx              # Reusable button component
│   │   │   ├── Modal.tsx               # Modal dialog component
│   │   │   ├── Loading.tsx             # Loading indicators
│   │   │   └── ErrorBoundary.tsx       # Error handling
│   │   ├── layout/                     # Layout components
│   │   │   ├── Header.tsx              # App header
│   │   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   │   └── Footer.tsx              # App footer
│   │   └── features/                   # Feature components
│   │       ├── Conversation.tsx        # Main conversation interface
│   │       ├── Settings.tsx            # User settings
│   │       └── Analytics.tsx           # Usage analytics
│   ├── hooks/                          # Custom React hooks
│   │   ├── useAudioRecorder.ts         # Audio recording hook
│   │   ├── useAudioPlayer.ts           # Audio playback hook
│   │   ├── useVoiceAgent.ts            # Voice agent API hook
│   │   ├── useWebSocket.ts             # Real-time communication
│   │   └── useLocalStorage.ts          # Local storage management
│   ├── services/                       # API and external services
│   │   ├── api/                        # API client
│   │   │   ├── client.ts               # HTTP client configuration
│   │   │   ├── voiceAgent.ts           # Voice agent API
│   │   │   ├── audio.ts                # Audio streaming API
│   │   │   └── handoff.ts              # Human handoff API
│   │   ├── audio/                      # Audio processing services
│   │   │   ├── recorder.ts             # Audio recording service
│   │   │   ├── player.ts               # Audio playback service
│   │   │   ├── processor.ts            # Audio processing utilities
│   │   │   └── visualizer.ts           # Audio visualization
│   │   └── storage/                    # Storage services
│   │       ├── localStorage.ts         # Local storage utilities
│   │       └── sessionStorage.ts       # Session storage utilities
│   ├── store/                          # State management
│   │   ├── index.ts                    # Store configuration
│   │   ├── audioStore.ts               # Audio state management
│   │   ├── conversationStore.ts        # Conversation state
│   │   ├── settingsStore.ts            # User settings state
│   │   └── uiStore.ts                  # UI state management
│   ├── types/                          # TypeScript type definitions
│   │   ├── api.ts                      # API response types
│   │   ├── audio.ts                    # Audio-related types
│   │   ├── conversation.ts             # Conversation types
│   │   └── settings.ts                 # Settings types
│   ├── utils/                          # Utility functions
│   │   ├── audio.ts                    # Audio processing utilities
│   │   ├── format.ts                   # Data formatting utilities
│   │   ├── validation.ts               # Input validation
│   │   └── constants.ts                # Application constants
│   └── config/                         # Configuration files
│       ├── api.ts                      # API configuration
│       ├── audio.ts                    # Audio configuration
│       └── app.ts                      # App configuration
├── tests/                              # Test files
│   ├── unit/                           # Unit tests
│   ├── integration/                    # Integration tests
│   ├── e2e/                            # End-to-end tests
│   └── mocks/                          # Test mocks
├── docs/                               # Documentation
│   ├── api.md                          # API documentation
│   ├── components.md                   # Component documentation
│   ├── deployment.md                   # Deployment guide
│   └── troubleshooting.md              # Troubleshooting guide
└── scripts/                            # Build and deployment scripts
    ├── build.sh                        # Production build script
    ├── deploy.sh                       # Deployment script
    └── test.sh                         # Test runner script
```

### Quick Start

1. **Prerequisites**
   ```bash
   # Required tools
   - Node.js 20+
   - npm or yarn
   - Modern browser with Web Audio API support
   ```

2. **Installation**
   ```bash
   cd v3
   npm install
   ```

3. **Development**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm run preview
   ```

### Phased Development Roadmap

#### **Stage 1: 50% Completion (Basic Interface)**

**Core Components**:
```jsx
// App.jsx
function App() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  
  const handleRecord = async (blob) => {
    const response = await fetch("/process", { 
      method: "POST", 
      body: blob 
    });
    setAudioUrl(URL.createObjectURL(await response.blob()));
  }

  return (
    <div>
      <AudioRecorder onRecordingComplete={handleRecord} />
      <audio src={audioUrl} controls />
    </div>
  )
}
```

**UI/UX**: A minimal interface with a **record button**, a text area for the final transcript, and a standard HTML5 `<audio>` player.

**Audio Handling**: Use `MediaRecorder` to capture audio. The entire audio blob is sent to the backend upon completion.

**API Integration**: A basic `fetch` client to call the backend's synchronous endpoint and load the response into the audio player.

**State Management**: Simple `useState` hooks for managing the recording state.

**Goal**: Provide a basic tool to test and demonstrate the backend MVP pipeline.

#### **Stage 2: 85% Completion (Real-Time & Responsive UI)**

**Advanced Features**:
```jsx
// useRealTimeAudio.js
export default function useRealTimeAudio(jobId) {
  const [audioChunks, setAudioChunks] = useState([]);
  
  useEffect(() => {
    const eventSource = new EventSource(`/result/${jobId}`);
    eventSource.onmessage = (e) => {
      setAudioChunks(prev => [...prev, e.data]);
      
      // Web Audio API streaming
      const audioCtx = new AudioContext();
      const source = audioCtx.createBufferSource();
      audioCtx.decodeAudioData(e.data, buffer => {
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
      });
    };
  }, [jobId]);
}
```

**Audio Handling**:
- Implement client-side logic to consume the **HTTP streaming audio response** from the backend
- Use the **Web Audio API** for immediate, low-latency playback of incoming audio chunks as they arrive

**UI/UX**:
- Display the ASR transcript **in real-time** as it's being generated
- Integrate the **real-time waveform audio visualizer** (`AudioVisualizer.tsx`)
- Provide clear visual feedback for voice activity, processing status, and AI-to-human handoffs

**API Integration**: Refactor the API client to support the asynchronous job-based flow (`/start` and polling `/result`).

**State Management**: Use Zustand for more robust management of the complex real-time application state.

**Optimizations**:
- Audio chunk buffering with `RingBuffer` for gapless playback
- Web Workers for audio decoding
- Zustand state slicing for minimal re-renders

**Goal**: The user experience feels instantaneous, with visual and auditory feedback happening in real-time.

#### **Stage 3: 100% Completion (Advanced Features & Polish)**

**Key Components**:

1. **Voice Cloning UI**:
```jsx
<VoiceCloner 
  onUpload={(audio) => post("/clone_voice", audio)}
  voices={clonedVoices}
  onSelect={(voiceId) => setVoice(voiceId)}
/>
```

2. **Advanced UI**:
- Implement **intent visualization** to show what the AI is understanding
- Build out the **settings and analytics pages**

3. **PWA & Offline Support**:
```js
// service-worker.js
workbox.routing.registerRoute(
  '/result/',
  new workbox.strategies.NetworkFirst({
    cacheName: 'audio-cache',
    plugins: [new workbox.cacheableResponse.CacheableResponsePlugin({statuses: [200]})]
  })
);
```

4. **Accessibility Enhancements**:
```jsx
<AudioVisualizer 
  aria-label="Real-time voice waveform"
  role="img" 
  tabIndex={0}
/>
```

**Goal**: A polished, feature-complete, and fully accessible production application.

### Cross-Phase Dependencies

| Phase | Backend Dependency | Frontend Dependency |
|-------|---------------------|---------------------|
| 2→1   | Async API spec ready | Web Audio API polyfills |
| 3→2   | RL policy service running | Zustand store structure |
| 3→1   | Token-level metrics API | Dashboard framework setup |

### Performance Validation Plan

**Stage 2 Verification**:
- Audio streaming latency < 50ms
- Real-time transcript updates
- Smooth waveform visualization

**Stage 3 Validation**:
- WCAG 2.1 AA compliance audit
- Lighthouse PWA score > 90
- Voice cloning accuracy > 95%

### Key Technologies

#### **Core Framework**
- **React 18**: Latest React with concurrent features
- **TypeScript 5**: Type-safe development
- **Vite**: Fast build tool and dev server

#### **Styling & UI**
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Headless UI**: Accessible UI components
- **Lucide React**: Icon library

#### **State Management**
- **Zustand**: Lightweight state management
- **React Query**: Server state management
- **Immer**: Immutable state updates

#### **Audio Processing**
- **Web Audio API**: Native browser audio processing
- **MediaRecorder API**: Audio recording
- **AudioContext**: Low-latency audio manipulation

#### **Testing**
- **Vitest**: Fast unit testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Audio Latency**: < 50ms (client-side)
- **Bundle Size**: < 500KB (gzipped)
- **Lighthouse Score**: 95+ (all categories)

### UI/UX Features

#### **Audio Interface**
- **Real-time Waveform**: Live audio visualization
- **Voice Activity Detection**: Visual feedback for speech
- **Audio Level Meter**: Input/output level indicators
- **Voice Cloning**: Upload reference audio for personalized voice

#### **Conversation Interface**
- **Streaming Responses**: Real-time audio playback
- **Transcript Display**: Live conversation history
- **Intent Visualization**: Visual feedback for AI understanding
- **Handoff Indicators**: Clear human agent transition

#### **Accessibility**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and descriptions
- **High Contrast**: Dark/light theme support
- **Font Scaling**: Responsive text sizing

### Development Guidelines

1. **Code Standards**
   - Use TypeScript for all new code
   - Follow React best practices
   - Use functional components with hooks
   - Implement proper error boundaries

2. **Performance**
   - Optimize bundle size with code splitting
   - Use React.memo for expensive components
   - Implement proper dependency arrays
   - Lazy load non-critical components

3. **Audio Optimization**
   - Minimize audio processing latency
   - Use Web Workers for heavy computations
   - Implement proper audio buffer management
   - Handle audio device changes gracefully

4. **Testing**
   - Write unit tests for all utilities
   - Test components with React Testing Library
   - Implement E2E tests for critical flows
   - Mock external dependencies

### Troubleshooting

#### **Common Issues**
- **Audio Permissions**: Ensure microphone access is granted
- **Browser Compatibility**: Check Web Audio API support
- **Network Issues**: Verify API endpoint connectivity
- **Performance**: Monitor bundle size and loading times

#### **Debug Tools**
- **React DevTools**: Component inspection
- **Audio Context Inspector**: Audio processing debugging
- **Network Tab**: API request monitoring
- **Performance Tab**: Performance profiling

### Support

For issues and questions:
- Check the troubleshooting guide
- Review component documentation
- Create an issue in the repository
- Check browser compatibility matrix

---

**Version**: 3.0.0  
**Last Updated**: July 2025  
**Maintainer**: Dharsan Kumar 