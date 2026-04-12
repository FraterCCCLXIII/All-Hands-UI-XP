import React from 'react';
import { motion } from 'framer-motion';
import { ThemeElement, Theme } from '../../types/theme';

interface MessageProps {
  theme: Theme;
  getThemeClasses: (element: ThemeElement) => string;
  message: {
    role: 'user' | 'ai';
    text: string;
    headerText?: string;
    actions?: { label: string; action: string }[];
  };
  onAction?: (action: string) => void;
}

export const Message: React.FC<MessageProps> = ({ getThemeClasses, message, onAction }) => {
  const { role, text, headerText, actions } = message;
  const isUser = role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      {!isUser && headerText && (
        <div className={`flex items-start space-x-1 mb-1 ${getThemeClasses('text')} opacity-75 text-xs`}>
          <span>{headerText}</span>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-[80%] p-3 rounded-xl break-words
          ${isUser ? getThemeClasses('user-message-bg') : getThemeClasses('ai-message-bg')}
          ${isUser ? getThemeClasses('user-message-text') : getThemeClasses('text')}
          text-sm font-light`}
      >
        <div className="flex items-start space-x-2">
          <span className={isUser ? '' : 'font-normal'}>
            {text}
          </span>
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2 mt-2">
            {actions.map((action, actionIdx) => (
              <motion.button
                key={actionIdx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-2 py-1 rounded-md text-xs border ${getThemeClasses('border')} ${getThemeClasses('text')} hover:opacity-80`}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`Action: ${action.action}`);
                  onAction && onAction(action.action);
                }}
              >
                {action.label}
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}; 