// UI utility functions
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'connected': return 'text-green-500';
    case 'connecting': return 'text-yellow-500';
    case 'disconnected': return 'text-red-500';
    case 'listening': return 'text-blue-500';
    case 'processing': return 'text-purple-500';
    case 'speaking': return 'text-green-500';
    case 'active': return 'text-green-500';
    case 'idle': return 'text-gray-500';
    default: return 'text-gray-500';
  }
};

export const getButtonColor = (type: string, disabled: boolean = false): string => {
  if (disabled) return 'bg-gray-600 text-gray-400 cursor-not-allowed';
  switch (type) {
    case 'primary': return 'bg-green-600 hover:bg-green-700 text-white';
    case 'secondary': return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'danger': return 'bg-red-600 hover:bg-red-700 text-white';
    case 'warning': return 'bg-orange-600 hover:bg-orange-700 text-white';
    case 'purple': return 'bg-purple-600 hover:bg-purple-700 text-white';
    default: return 'bg-gray-600 hover:bg-gray-700 text-white';
  }
};

export const getConnectionButtonColor = (status: 'disconnected' | 'connecting' | 'connected'): string => {
  switch (status) {
    case 'connected': return 'bg-green-600 text-white';
    case 'connecting': return 'bg-yellow-600 text-white';
    case 'disconnected': return 'bg-blue-600 text-white hover:bg-blue-700';
  }
};

export const getConnectionButtonText = (status: 'disconnected' | 'connecting' | 'connected'): string => {
  switch (status) {
    case 'connected': return 'Connected';
    case 'connecting': return 'Connecting...';
    case 'disconnected': return 'Connect to Backend';
  }
};

export const scrollbarStyles = `
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.3);
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(75, 85, 99, 0.8);
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 0.9);
  }
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: rgba(75, 85, 99, 0.8) rgba(31, 41, 55, 0.3);
  }
`; 