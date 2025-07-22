import '@testing-library/jest-dom';

// Mock import.meta.env for Vite environment variables
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_WEBSOCKET_URL: 'ws://localhost:8000/ws'
      }
    }
  },
  writable: true
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => {
  setTimeout(callback, 0);
  return 1;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = jest.fn();

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock window.navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    cookieEnabled: true,
    doNotTrack: null,
    maxTouchPoints: 0,
    hardwareConcurrency: 8,
    deviceMemory: 8,
    platform: 'MacIntel',
    vendor: 'Google Inc.',
    vendorSub: '',
    product: 'Gecko',
    productSub: '20030107',
  },
  writable: true,
});

// Mock window.screen
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    pixelDepth: 24,
    orientation: {
      type: 'landscape-primary',
      angle: 0,
    },
  },
  writable: true,
});

// Mock window.innerWidth and innerHeight
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1920,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 1080,
});

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock window.getComputedStyle
window.getComputedStyle = jest.fn().mockReturnValue({
  getPropertyValue: jest.fn().mockReturnValue(''),
});

// Mock window.getSelection
window.getSelection = jest.fn().mockReturnValue({
  removeAllRanges: jest.fn(),
  addRange: jest.fn(),
  toString: jest.fn().mockReturnValue(''),
});

// Mock window.fetch
global.fetch = jest.fn();

// Mock window.URL.createObjectURL and revokeObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn().mockReturnValue('blob:mock-url'),
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock window.AudioContext
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    state: 'suspended',
    sampleRate: 44100,
    currentTime: 0,
    destination: {},
    createMediaStreamSource: jest.fn().mockReturnValue({
      connect: jest.fn(),
    }),
    createOscillator: jest.fn().mockReturnValue({
      connect: jest.fn(),
      frequency: {
        setValueAtTime: jest.fn(),
      },
      start: jest.fn(),
      stop: jest.fn(),
    }),
    createGain: jest.fn().mockReturnValue({
      connect: jest.fn(),
      gain: {
        setValueAtTime: jest.fn(),
      },
    }),
    createMediaElementSource: jest.fn().mockReturnValue({
      connect: jest.fn(),
    }),
    resume: jest.fn().mockResolvedValue(undefined),
    audioWorklet: {
      addModule: jest.fn().mockResolvedValue(undefined),
    },
  })),
});

// Mock window.AudioWorkletNode
Object.defineProperty(window, 'AudioWorkletNode', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    port: {
      onmessage: null,
      postMessage: jest.fn(),
    },
    disconnect: jest.fn(),
  })),
});

// Mock window.Audio
Object.defineProperty(window, 'Audio', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    preload: 'auto',
    playbackRate: 1.0,
    volume: 0.8,
    duration: 2.5,
    oncanplaythrough: null,
    onended: null,
    onerror: null,
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
  })),
});

// Mock window.WebSocket
Object.defineProperty(window, 'WebSocket', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    readyState: 1, // OPEN
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
    send: jest.fn(),
    close: jest.fn(),
  })),
});

// Mock window.navigator.mediaDevices
Object.defineProperty(window.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  },
});

// Mock window.sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
});

// Mock window.performance
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn().mockReturnValue(1000),
  },
}); 