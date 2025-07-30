import React from 'react';
import type { StatusIndicatorProps } from '../../types';
import { CONNECTION_STATUS, SERVICE_STATUS } from '../../constants';

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showLabel = true,
  className = '',
  children
}) => {
  const getStatusColor = (status: string) => {
    if (status === CONNECTION_STATUS.CONNECTED || status === SERVICE_STATUS.ACTIVE) {
      return 'bg-green-400';
    } else if (status === CONNECTION_STATUS.CONNECTING) {
      return 'bg-yellow-400';
    } else if (status === CONNECTION_STATUS.ERROR || status === SERVICE_STATUS.ERROR) {
      return 'bg-red-400';
    } else {
      return 'bg-gray-400';
    }
  };

  const getStatusTextColor = (status: string) => {
    if (status === CONNECTION_STATUS.CONNECTED || status === SERVICE_STATUS.ACTIVE) {
      return 'text-green-400';
    } else if (status === CONNECTION_STATUS.CONNECTING) {
      return 'text-yellow-400';
    } else if (status === CONNECTION_STATUS.ERROR || status === SERVICE_STATUS.ERROR) {
      return 'text-red-400';
    } else {
      return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    if (status === CONNECTION_STATUS.CONNECTED || status === SERVICE_STATUS.ACTIVE) {
      return 'ON';
    } else if (status === CONNECTION_STATUS.CONNECTING) {
      return 'CON';
    } else if (status === CONNECTION_STATUS.ERROR || status === SERVICE_STATUS.ERROR) {
      return 'ERR';
    } else {
      return 'OFF';
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(status)}`}></div>
      {showLabel && <span className="text-xs text-gray-400">{label}</span>}
      <span className={`text-xs font-bold ${getStatusTextColor(status)}`}>
        {getStatusText(status)}
      </span>
      {children}
    </div>
  );
};

export default StatusIndicator; 