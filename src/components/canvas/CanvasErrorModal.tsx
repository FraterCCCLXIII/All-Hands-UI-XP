import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { ThemeElement } from '../../types/theme';

interface CanvasErrorModalProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  showError: boolean;
  onErrorClose: () => void;
  onShowConsole: () => void;
}

export const CanvasErrorModal: React.FC<CanvasErrorModalProps> = ({
  theme,
  getThemeClasses,
  showError,
  onErrorClose,
  onShowConsole,
}) => {
  return (
    <AnimatePresence>
      {showError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-lg shadow-xl w-80 text-center z-50"
          style={{ 
            backgroundColor: theme === 'dark' ? '#292524' : theme === 'light' ? '#f5f5f4' : 'rgb(235,225,210)',
            border: `1px solid ${theme === 'dark' ? '#57534e' : theme === 'light' ? '#a8a29e' : 'rgb(180,160,140)'}`
          }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`absolute top-2 right-2 p-1 rounded-full ${getThemeClasses('button-bg')} hover:opacity-90 focus:outline-none`}
            onClick={onErrorClose}
          >
            <X className={`w-5 h-5 ${getThemeClasses('icon-color')}`} />
          </motion.button>
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h3 className={`text-lg font-semibold ${getThemeClasses('text')}`}>
              Something went wrong
            </h3>
            <p className={`text-sm ${getThemeClasses('text')} opacity-80`}>
              There was a problem when running your code.
            </p>
            
            <div className="flex space-x-2 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-2 py-1 rounded-md text-xs border border-red-500 text-red-500 hover:opacity-80"
                onClick={() => {
                  console.log('Fix error clicked');
                  onErrorClose();
                }}
              >
                Fix error
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-2 py-1 rounded-md text-xs border ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')} hover:opacity-80`}
                onClick={() => {
                  console.log('Show console clicked');
                  onErrorClose();
                  onShowConsole();
                }}
              >
                Show console
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 