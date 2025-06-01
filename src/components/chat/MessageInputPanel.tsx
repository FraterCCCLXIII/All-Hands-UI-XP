import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CirclePause, PlayCircle } from 'lucide-react';
import { ThemeElement } from '../../types/theme';

interface MessageInputPanelProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  onSendMessage: (message: string) => void;
  serverStatus: 'active' | 'stopped' | 'thinking';
  onServerStatusChange: (status: 'active' | 'stopped' | 'thinking') => void;
}

export const MessageInputPanel: React.FC<MessageInputPanelProps> = ({
  theme,
  getThemeClasses,
  onSendMessage,
  serverStatus,
  onServerStatusChange,
}) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="mb-4">
      <div className="bg-stone-800 rounded-lg shadow-lg">
        {/* Message Input */}
        <div className="p-4 border-b border-stone-700">
          <div className="relative">
            <input
              type="text"
              className={`w-full ${getThemeClasses('input-bg')} ${getThemeClasses('text')} pl-3 pr-10 py-2 rounded-md focus:outline-none text-sm ${getThemeClasses('placeholder-text')}`}
              placeholder="What do you want to build?"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
            <motion.button
              className={`absolute right-2 top-1/2 p-2 rounded-full flex items-center justify-center ${getThemeClasses('button-bg')} hover:opacity-90 focus:outline-none`}
              onClick={handleSendMessage}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ y: '-50%' }}
              transformTemplate={({ scale, y }) => `translateY(${y}) scale(${scale || 1})`}
            >
              <Send className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Server Status */}
        <div className={`p-2 flex items-center justify-between text-xs border-stone-700`}>
          <div className="flex items-center space-x-2 relative group cursor-pointer">
            <span className={`w-2 h-2 rounded-full ${serverStatus === 'active' ? getThemeClasses('status-dot-running') : getThemeClasses('status-dot-stopped')}`}></span>
            <span className={getThemeClasses('status-text')}>
              Server: {serverStatus === 'active' ? 'Running' : serverStatus === 'stopped' ? 'Stopped' : 'Thinking'}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-stone-700 text-white hover:opacity-90"
            style={{ transform: 'scale(0.95)' }}
            onClick={() => onServerStatusChange(serverStatus === 'active' ? 'stopped' : 'active')}
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