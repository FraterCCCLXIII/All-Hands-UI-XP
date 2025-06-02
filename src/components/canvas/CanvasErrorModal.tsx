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
          key="canvas-error-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-xl shadow-xl"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 