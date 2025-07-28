# Pipeline State Management Components

This directory contains React components for real-time pipeline state management in the Voice Agent application.

## 🎯 Overview

The pipeline state management system provides real-time feedback on the AI processing pipeline (STT → LLM → TTS) with WebSocket integration for live updates.

## 📦 Components

### Core Components

#### `PipelineStatusIndicator`
Shows the current pipeline state with visual indicators and animations.

```tsx
import { PipelineStatusIndicator } from './pipeline';

<PipelineStatusIndicator 
  showLabel={true} 
  showAnimation={true} 
/>
```

**Props:**
- `showLabel`: Show/hide status text (default: true)
- `showAnimation`: Enable/disable animations (default: true)
- `className`: Additional CSS classes

#### `ServiceStatusCard`
Individual service status cards for STT, LLM, and TTS.

```tsx
import { ServiceStatusCard } from './pipeline';

<ServiceStatusCard 
  service="stt" 
  showProgress={true} 
  showDetails={true} 
/>
```

**Props:**
- `service`: Service name ('stt', 'llm', 'tts')
- `showProgress`: Show progress bar (default: true)
- `showDetails`: Show metadata details (default: true)
- `className`: Additional CSS classes

#### `ServiceStatusGrid`
Grid layout of all service status cards.

```tsx
import { ServiceStatusGrid } from './pipeline';

<ServiceStatusGrid />
```

#### `ConversationControls`
Start, stop, and pause conversation controls.

```tsx
import { ConversationControls } from './pipeline';

<ConversationControls 
  variant="default" 
  size="md" 
  showLabels={true} 
/>
```

**Props:**
- `variant`: 'default' | 'minimal' | 'floating'
- `size`: 'sm' | 'md' | 'lg'
- `showLabels`: Show/hide button labels (default: true)
- `className`: Additional CSS classes

#### `PipelineDashboard`
Comprehensive dashboard combining all pipeline components.

```tsx
import { PipelineDashboard } from './pipeline';

<PipelineDashboard 
  variant="full" 
  showMetadata={true} 
  showTimestamps={true} 
  collapsible={false} 
/>
```

**Props:**
- `variant`: 'full' | 'compact' | 'minimal'
- `showMetadata`: Show metadata section (default: true)
- `showTimestamps`: Show timeline section (default: true)
- `collapsible`: Enable collapsible sections (default: false)
- `className`: Additional CSS classes

### Compact Components

#### `CompactPipelineStatusIndicator`
Minimal pipeline status indicator for small spaces.

#### `CompactServiceStatusCard`
Compact service status for limited space.

#### `CompactConversationControls`
Single toggle button for start/stop.

### Layout Components

#### `FloatingPipelineDashboard`
Fixed position dashboard overlay.

#### `SidebarPipelineDashboard`
Sidebar layout dashboard.

## 🔧 Context & Hooks

### `PipelineStateProvider`
React context provider for pipeline state management.

```tsx
import { PipelineStateProvider } from './pipeline';

<PipelineStateProvider>
  <YourApp />
</PipelineStateProvider>
```

### `usePipelineState`
Hook to access pipeline state and actions.

```tsx
import { usePipelineState } from './pipeline';

const { state, actions } = usePipelineState();

// Access state
const { pipelineState, serviceStates, isConnected } = state;

// Use actions
const { startListening, stopConversation, updatePipelineState } = actions;
```

## 📊 State Management

### Pipeline States
- `idle`: No activity
- `listening`: Listening for audio input
- `processing`: Processing through AI pipeline
- `complete`: Pipeline completed successfully
- `error`: Error occurred

### Service States
- `idle`: Service not active
- `waiting`: Waiting for input
- `executing`: Currently processing
- `complete`: Processing completed
- `error`: Error occurred

### Conversation States
- `stopped`: Conversation stopped
- `active`: Conversation active
- `paused`: Conversation paused

## 🌐 WebSocket Integration

The system automatically connects to the orchestrator WebSocket endpoint and handles:

- **Connection Management**: Auto-reconnect on disconnection
- **Message Handling**: Pipeline state updates, service status, errors
- **Session Management**: Session ID tracking and management
- **Real-time Updates**: Live state synchronization

### WebSocket Messages

```typescript
// Pipeline state update
{
  type: 'pipeline_state_update',
  session_id: 'session_123',
  state: 'processing',
  services: {
    stt: 'executing',
    llm: 'waiting',
    tts: 'idle'
  },
  metadata: {
    buffer_size: 8192,
    audio_quality: 0.75
  }
}

// Conversation control
{
  type: 'conversation_control',
  action: 'start' | 'stop' | 'pause',
  session_id: 'session_123'
}
```

## 🎨 Styling

All components use Tailwind CSS classes and support:

- **Responsive Design**: Mobile-first responsive layouts
- **Dark Mode**: Compatible with dark mode themes
- **Customization**: Extensive className prop support
- **Animations**: Smooth transitions and loading states

## 📱 Usage Examples

### Basic Implementation

```tsx
import { 
  PipelineStateProvider, 
  PipelineDashboard 
} from './pipeline';

function App() {
  return (
    <PipelineStateProvider>
      <div className="p-6">
        <PipelineDashboard variant="full" />
      </div>
    </PipelineStateProvider>
  );
}
```

### Custom Layout

```tsx
import { 
  usePipelineState,
  PipelineStatusIndicator,
  ServiceStatusGrid,
  ConversationControls 
} from './pipeline';

function CustomLayout() {
  const { state } = usePipelineState();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ServiceStatusGrid />
      </div>
      <div>
        <PipelineStatusIndicator />
        <ConversationControls />
      </div>
    </div>
  );
}
```

### Floating Controls

```tsx
import { FloatingPipelineDashboard } from './pipeline';

function App() {
  return (
    <div>
      <YourMainContent />
      <FloatingPipelineDashboard />
    </div>
  );
}
```

## 🔍 Debugging

### Console Logging
The system provides detailed console logging for debugging:

```javascript
// WebSocket connection status
🔌 WebSocket connected to pipeline state manager

// State updates
Pipeline state: listening → processing → complete

// Error handling
❌ Pipeline error: Service unavailable
```

### State Inspection
Use the `usePipelineState` hook to inspect current state:

```tsx
const { state } = usePipelineState();
console.log('Current pipeline state:', state);
```

## 🚀 Performance

- **Optimized Re-renders**: Uses React.memo and useCallback for performance
- **Lazy Loading**: Components load only when needed
- **Memory Management**: Proper cleanup of WebSocket connections
- **Efficient Updates**: Minimal re-renders on state changes

## 🔧 Configuration

### WebSocket URL
Configure the WebSocket endpoint in `PipelineStateContext.tsx`:

```typescript
// Development
const wsUrl = 'ws://localhost:8001/ws';

// Production
const wsUrl = 'wss://your-domain.com/ws';
```

### Service Configuration
Customize service information in `pipeline.ts`:

```typescript
export const SERVICE_CONFIG: Record<string, ServiceInfo> = {
  stt: {
    name: 'stt',
    displayName: 'Speech-to-Text',
    icon: '🎤',
    description: 'Converting speech to text',
    color: 'blue'
  },
  // ... other services
};
```

## 📋 Requirements

- React 18+
- TypeScript 4.5+
- Tailwind CSS
- WebSocket support

## 🎯 Next Steps

1. **Integration**: Add to existing voice agent components
2. **Testing**: Unit tests for all components
3. **Customization**: Theme and styling customization
4. **Analytics**: Add usage analytics and metrics
5. **Accessibility**: Improve accessibility features 