import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { MessageType } from '../../types/message';
import { ThemeElement } from '../../types/theme';

interface CanvasProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  isVisible: boolean;
  onClose: () => void;
  onToggleMaximize: () => void;
  isMaximized: boolean;
  content: {
    type: MessageType;
    text: string;
    headerText?: string;
  } | null;
}

export const Canvas: React.FC<CanvasProps> = ({
  theme,
  getThemeClasses,
  isVisible,
  onClose,
  onToggleMaximize,
  isMaximized,
  content,
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible && !isTransitioning) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`fixed top-0 right-0 h-full ${isMaximized ? 'w-full' : 'w-1/2'} ${getThemeClasses('canvas-bg')} shadow-lg z-50 flex flex-col`}
        >
          {/* Canvas Header */}
          <div className={`flex items-center justify-between p-4 border-b ${getThemeClasses('border')}`}>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className={`p-1 rounded-full hover:bg-opacity-20 ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')}`}
              >
                <X className="w-4 h-4" />
              </button>
              {content?.headerText && (
                <span className={`text-sm ${getThemeClasses('text')}`}>{content.headerText}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleMaximize}
                className={`p-1 rounded-full hover:bg-opacity-20 ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')}`}
              >
                {isMaximized ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Canvas Content */}
          <div className="flex-grow overflow-auto p-4">
            {content && (
              <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none`}>
                {content.type === 'code' ? (
                  <pre className={`w-full overflow-auto rounded-md p-4 whitespace-pre-wrap ${theme === 'dark' ? 'bg-stone-800 text-stone-200' : theme === 'light' ? 'bg-stone-200 text-stone-800' : 'bg-[rgb(215,205,190)] text-[rgb(100,80,60)]'}`}>
                    <code>{content.text}</code>
                  </pre>
                ) : (
                  <div className={getThemeClasses('text')}>
                    {content.text}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Canvas Footer */}
          <div className={`p-2 border-t ${getThemeClasses('border')} flex justify-between items-center`}>
            <div className="flex items-center space-x-2">
              <button
                className={`p-1 rounded-full hover:bg-opacity-20 ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className={`p-1 rounded-full hover:bg-opacity-20 ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className={`text-xs ${getThemeClasses('text')} opacity-75`}>
              {content?.type === 'code' ? 'Code View' : 'Canvas View'}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 