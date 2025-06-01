import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeElement } from '../../types/theme';
import { Power, RefreshCw, AlertCircle, MoreVertical, Server, XCircle } from 'lucide-react';

// Comprehensive server state taxonomy
export type ServerStatusType = 
  | 'active'           // Server is running and ready
  | 'idle'            // Server is running but inactive
  | 'thinking'        // Server is processing a request
  | 'connecting'      // Server is establishing connection
  | 'reconnecting'    // Server is attempting to reconnect after a failure
  | 'stopped'         // Server is intentionally stopped
  | 'error'           // Server encountered an error
  | 'error_network'   // Network connectivity error
  | 'error_auth'      // Authentication error
  | 'error_timeout'   // Request timeout error
  | 'error_rate_limit'// Rate limit exceeded
  | 'maintenance'     // Server is in maintenance mode
  | 'updating'        // Server is updating
  | 'initializing';   // Server is starting up

interface ServerStatusProps {
  status: ServerStatusType;
  getThemeClasses: (element: ThemeElement) => string;
  onStatusChange?: (status: ServerStatusType) => void;
  simulate?: boolean;
  onServerAction?: (action: 'stop' | 'restart' | 'reset') => void;
}

interface StatusConfig {
  text: string;
  dotColor: string;
  spinnerColor: string;
  showSpinner: boolean;
  nextState?: ServerStatusType;
  duration: number;
  icon?: React.ReactNode;
}

const STATUS_CONFIG: Record<ServerStatusType, StatusConfig> = {
  active: {
    text: 'Running',
    dotColor: 'bg-emerald-400',
    spinnerColor: 'border-emerald-400/20',
    showSpinner: false,
    nextState: 'thinking',
    duration: 4000,
    icon: <Server className="w-4 h-4" />,
  },
  idle: {
    text: 'Idle',
    dotColor: 'bg-emerald-400',
    spinnerColor: 'border-emerald-400/20',
    showSpinner: false,
    nextState: 'active',
    duration: 3000,
    icon: <Server className="w-4 h-4" />,
  },
  thinking: {
    text: 'Processing...',
    dotColor: 'bg-amber-400',
    spinnerColor: 'border-amber-400',
    showSpinner: true,
    nextState: 'active',
    duration: 3000,
    icon: <RefreshCw className="w-4 h-4 animate-spin" />,
  },
  connecting: {
    text: 'Connecting...',
    dotColor: 'bg-amber-400',
    spinnerColor: 'border-amber-400',
    showSpinner: true,
    nextState: 'active',
    duration: 2000,
    icon: <RefreshCw className="w-4 h-4 animate-spin" />,
  },
  reconnecting: {
    text: 'Reconnecting...',
    dotColor: 'bg-amber-400',
    spinnerColor: 'border-amber-400',
    showSpinner: true,
    nextState: 'active',
    duration: 3000,
    icon: <RefreshCw className="w-4 h-4 animate-spin" />,
  },
  stopped: {
    text: 'Stopped',
    dotColor: 'bg-rose-400',
    spinnerColor: 'border-rose-400/20',
    showSpinner: false,
    nextState: 'connecting',
    duration: 2000,
    icon: <Power className="w-4 h-4" />,
  },
  error: {
    text: 'Error',
    dotColor: 'bg-rose-400',
    spinnerColor: 'border-rose-400/20',
    showSpinner: false,
    nextState: 'reconnecting',
    duration: 2000,
    icon: <AlertCircle className="w-4 h-4" />,
  },
  error_network: {
    text: 'Network Error',
    dotColor: 'bg-rose-400',
    spinnerColor: 'border-rose-400/20',
    showSpinner: false,
    nextState: 'reconnecting',
    duration: 2000,
    icon: <AlertCircle className="w-4 h-4" />,
  },
  error_auth: {
    text: 'Auth Error',
    dotColor: 'bg-rose-400',
    spinnerColor: 'border-rose-400/20',
    showSpinner: false,
    nextState: 'stopped',
    duration: 2000,
    icon: <AlertCircle className="w-4 h-4" />,
  },
  error_timeout: {
    text: 'Timeout',
    dotColor: 'bg-rose-400',
    spinnerColor: 'border-rose-400/20',
    showSpinner: false,
    nextState: 'reconnecting',
    duration: 2000,
    icon: <AlertCircle className="w-4 h-4" />,
  },
  error_rate_limit: {
    text: 'Rate Limited',
    dotColor: 'bg-rose-400',
    spinnerColor: 'border-rose-400/20',
    showSpinner: false,
    nextState: 'reconnecting',
    duration: 2000,
    icon: <AlertCircle className="w-4 h-4" />,
  },
  maintenance: {
    text: 'Maintenance',
    dotColor: 'bg-amber-400',
    spinnerColor: 'border-amber-400',
    showSpinner: true,
    nextState: 'active',
    duration: 3000,
    icon: <Server className="w-4 h-4" />,
  },
  updating: {
    text: 'Updating...',
    dotColor: 'bg-amber-400',
    spinnerColor: 'border-amber-400',
    showSpinner: true,
    nextState: 'active',
    duration: 3000,
    icon: <RefreshCw className="w-4 h-4 animate-spin" />,
  },
  initializing: {
    text: 'Initializing...',
    dotColor: 'bg-amber-400',
    spinnerColor: 'border-amber-400',
    showSpinner: true,
    nextState: 'active',
    duration: 2000,
    icon: <RefreshCw className="w-4 h-4 animate-spin" />,
  },
};

// Define the simulation sequence
const SIMULATION_SEQUENCE: ServerStatusType[] = [
  'initializing',
  'active',
  'thinking',
  'active',
  'error_network',
  'reconnecting',
  'active',
  'error_rate_limit',
  'reconnecting',
  'active',
  'updating',
  'active',
  'stopped',
  'connecting',
  'active',
];

export const ServerStatus: React.FC<ServerStatusProps> = ({
  status,
  getThemeClasses,
  onStatusChange,
  simulate = false,
  onServerAction,
}) => {
  const [currentStatus, setCurrentStatus] = useState<ServerStatusType>(status);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const config = STATUS_CONFIG[currentStatus];

  // Handle simulation mode
  useEffect(() => {
    if (!simulate) return;

    const currentConfig = STATUS_CONFIG[SIMULATION_SEQUENCE[simulationIndex]];
    const timer = setTimeout(() => {
      const nextIndex = (simulationIndex + 1) % SIMULATION_SEQUENCE.length;
      const nextStatus = SIMULATION_SEQUENCE[nextIndex];
      setCurrentStatus(nextStatus);
      setSimulationIndex(nextIndex);
      onStatusChange?.(nextStatus);
    }, currentConfig.duration);

    return () => clearTimeout(timer);
  }, [simulate, simulationIndex, onStatusChange]);

  // Update current status when prop changes (only if not in simulation mode)
  useEffect(() => {
    if (!simulate) {
      setCurrentStatus(status);
    }
  }, [status, simulate]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleServerAction = (action: 'stop' | 'restart' | 'reset') => {
    onServerAction?.(action);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Server Control Dropdown - Now appears above */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-48 rounded-md shadow-lg bg-stone-800 ring-1 ring-black ring-opacity-5 z-50"
          >
            <div className="py-1" role="menu">
              <button
                onClick={() => handleServerAction('stop')}
                className="flex items-center w-full px-4 py-2 text-sm text-stone-300 hover:bg-stone-700/50"
                role="menuitem"
              >
                <Power className="w-4 h-4 mr-2" />
                Stop Server
              </button>
              <button
                onClick={() => handleServerAction('restart')}
                className="flex items-center w-full px-4 py-2 text-sm text-stone-300 hover:bg-stone-700/50"
                role="menuitem"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart Server
              </button>
              <button
                onClick={() => handleServerAction('reset')}
                className="flex items-center w-full px-4 py-2 text-sm text-stone-300 hover:bg-stone-700/50"
                role="menuitem"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reset Server
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Status Area */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors ${
          isDropdownOpen 
            ? `${getThemeClasses('active-button-bg')} ${getThemeClasses('active-button-text')}`
            : `${getThemeClasses('pill-button-text')} hover:${getThemeClasses('pill-button-bg')}`
        }`}
      >
        <div className="relative w-2 h-2">
          {/* Loading Spinner */}
          {config.showSpinner && (
            <div
              className="absolute -inset-1 rounded-full border-2 border-solid border-transparent border-t-amber-400 animate-spin"
            />
          )}
          
          {/* Main Status Dot */}
          <div className={`absolute inset-0 rounded-full ${config.dotColor}`} />
        </div>

        {/* Status Text */}
        <motion.span
          key={currentStatus}
          className={getThemeClasses('pill-button-text')}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          Server: {config.text}
        </motion.span>
      </button>
    </div>
  );
}; 