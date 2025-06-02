import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CirclePause, PlayCircle, Paperclip } from 'lucide-react';
import { ThemeElement } from '../../types/theme';
import { ServerStatus } from '../common/ServerStatus';

interface MessageInputPanelProps {
  getThemeClasses: (element: ThemeElement) => string;
  onSendMessage: (message: string) => void;
  serverStatus: 'active' | 'stopped' | 'thinking' | 'connecting';
  onServerStatusChange: (status: 'active' | 'stopped' | 'thinking' | 'connecting') => void;
}

export const MessageInputPanel: React.FC<MessageInputPanelProps> = ({
  getThemeClasses,
  onSendMessage,
  serverStatus,
  onServerStatusChange,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);

  // Simulate initial server connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false);
      onServerStatusChange('active');
    }, 2000);

    return () => clearTimeout(timer);
  }, [onServerStatusChange]);

  const handleSendMessage = () => {
    if (newMessage.trim() && serverStatus === 'active') {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const isSendButtonDisabled = !newMessage.trim() || serverStatus !== 'active';

  return (
    <div className="mb-4">
      <div className="bg-stone-800 rounded-lg shadow-lg">
        {/* Message Input */}
        <div className="py-4 px-2 border-b border-stone-700">
          <div className="relative flex items-center">
            <motion.button
              className={`p-2 rounded-full flex items-center justify-center hover:bg-stone-700 focus:outline-none mr-2 transition-colors duration-150`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Paperclip className="w-4 h-4 text-stone-400 hover:text-white transition-colors duration-150" />
            </motion.button>
            <input
              type="text"
              className={`w-full ${getThemeClasses('input-bg')} ${getThemeClasses('text')} pl-3 pr-10 py-2 rounded-md focus:outline-none text-sm ${getThemeClasses('placeholder-text')}`}
              placeholder="What do you want to build?"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isSendButtonDisabled) handleSendMessage();
              }}
            />
            <motion.button
              className={`absolute right-2 top-1/2 p-2 rounded-full flex items-center justify-center ${getThemeClasses('button-bg')} focus:outline-none ${isSendButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
              onClick={handleSendMessage}
              whileHover={!isSendButtonDisabled ? { scale: 1.1 } : undefined}
              whileTap={!isSendButtonDisabled ? { scale: 0.9 } : undefined}
              style={{ y: '-50%' }}
              transformTemplate={({ scale, y }) => `translateY(${y}) scale(${scale || 1})`}
              disabled={isSendButtonDisabled}
            >
              <Send className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Server Status */}
        <div className={`py-2 px-2 flex items-center justify-between text-xs border-stone-700`}>
          <ServerStatus
            status={isConnecting ? 'connecting' : serverStatus}
            getThemeClasses={getThemeClasses}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-stone-700 text-white hover:opacity-90"
            style={{ transform: 'scale(0.95)' }}
            onClick={() => onServerStatusChange(serverStatus === 'active' ? 'stopped' : 'active')}
            disabled={isConnecting}
          >
            {serverStatus === 'active' ? (
              <>
                <CirclePause className="w-4 h-4" />
                <span>Pause Agent</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Continue</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}; 