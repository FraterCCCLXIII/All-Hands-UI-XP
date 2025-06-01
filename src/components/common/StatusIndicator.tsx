import React from 'react';

export interface StatusIndicatorProps {
  serverStatus: string;
  onServerStatusChange: (status: string) => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  serverStatus,
  onServerStatusChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className={`w-2 h-2 rounded-full ${serverStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
      <span className="text-sm text-stone-400">
        Server: {serverStatus === 'active' ? 'Running' : serverStatus === 'stopped' ? 'Stopped' : 'Thinking'}
      </span>
      <button
        onClick={() => onServerStatusChange(serverStatus === 'active' ? 'stopped' : 'active')}
        className={`px-2 py-1 rounded text-xs ${serverStatus === 'active' ? 'bg-red-500' : 'bg-green-500'} text-white hover:opacity-90`}
      >
        {serverStatus === 'active' ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}; 