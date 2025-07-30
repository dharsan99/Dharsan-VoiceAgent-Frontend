import React from 'react';
import { Icons } from '../ui/Icons';
import { getConnectionButtonColor, getConnectionButtonText } from '../../utils/uiUtils';

interface ConnectionButtonProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  onConnect: () => void;
}

const ConnectionButton: React.FC<ConnectionButtonProps> = ({ 
  connectionStatus, 
  onConnect 
}) => {
  return (
    <button 
      onClick={onConnect}
      disabled={connectionStatus === 'connecting'}
      className={`w-full p-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${getConnectionButtonColor(connectionStatus)}`}
    >
      <Icons.Link className="w-5 h-5" />
      <span>{getConnectionButtonText(connectionStatus)}</span>
    </button>
  );
};

export default ConnectionButton; 