import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2, X } from 'lucide-react';
import { ThemeElement } from '../../types/theme';

interface TerminalDrawerProps {
  getThemeClasses: (element: ThemeElement) => string;
  isVisible: boolean;
  height: number;
  onResize: (newHeight: number) => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const TerminalDrawer: React.FC<TerminalDrawerProps> = ({
  getThemeClasses,
  isVisible,
  height,
  onResize,
  onMinimize,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height }}
          exit={{ height: 0 }}
          transition={{ duration: 0.2 }}
          className={`border-t ${getThemeClasses('border')} ${getThemeClasses('panel-bg')} relative`}
        >
          {/* Gripper for resizing */}
          <div
            className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize group"
            onMouseDown={(e) => {
              const startY = e.clientY;
              const startHeight = height;
              
              const handleMouseMove = (e: MouseEvent) => {
                const deltaY = startY - e.clientY;
                onResize(Math.max(100, Math.min(startHeight + deltaY, window.innerHeight * 0.5)));
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Terminal header */}
          <div className={`flex items-center justify-between px-4 py-2 border-b ${getThemeClasses('border')}`}>
            <span className={`text-sm ${getThemeClasses('text')}`}>Terminal</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onMinimize}
                className={`p-1 rounded-md hover:${getThemeClasses('button-bg')} transition-colors`}
                title="Minimize Terminal"
              >
                <Minimize2 className={`w-4 h-4 ${getThemeClasses('icon-color')}`} />
              </button>
              <button
                onClick={onClose}
                className={`p-1 rounded-md hover:${getThemeClasses('button-bg')} transition-colors`}
                title="Close Terminal"
              >
                <X className={`w-4 h-4 ${getThemeClasses('icon-color')}`} />
              </button>
            </div>
          </div>

          {/* Terminal content */}
          <div className="p-4 font-mono text-sm">
            <div className={`${getThemeClasses('text')} opacity-75`}>
              $ npm run dev
            </div>
            <div className={`${getThemeClasses('text')} mt-2`}>
              {'>'} Ready in 123ms
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 