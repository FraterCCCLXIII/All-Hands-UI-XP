import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CanvasHeader } from './CanvasHeader';
import { CanvasContent } from './CanvasContent';
import { CanvasErrorModal } from './CanvasErrorModal';
import { CanvasResizer } from './CanvasResizer';
import { ThemeElement } from '../../types/theme';
import { MessageType } from '../../types/message';

// Separate interfaces for different responsibilities
interface CanvasBaseProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  isVisible: boolean;
  onClose: () => void;
}

interface CanvasLayoutProps extends CanvasBaseProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
  messageColumnWidth: number;
  onResize: (newWidth: number) => void;
  minWidth: number;
  maxWidth: number;
}

interface CanvasContentProps extends CanvasBaseProps {
  content: {
    type: MessageType;
    text: string;
    headerText?: string;
  } | null;
}

interface CanvasErrorProps extends CanvasBaseProps {
  showError: boolean;
  onErrorClose: () => void;
  onShowConsole: () => void;
}

// Main Canvas component that composes other components
export const Canvas: React.FC<CanvasLayoutProps & CanvasContentProps & CanvasErrorProps> = ({
  theme,
  getThemeClasses,
  isVisible,
  onClose,
  isMaximized,
  onToggleMaximize,
  content,
  messageColumnWidth,
  onResize,
  minWidth,
  maxWidth,
  showError,
  onErrorClose,
  onShowConsole,
}) => {
  return (
    <div className={`h-full flex flex-col rounded-lg ${getThemeClasses('canvas-bg')} ${getThemeClasses('border')} border shadow-lg overflow-hidden`}>
      <CanvasHeader
        theme={theme}
        getThemeClasses={getThemeClasses}
        onClose={onClose}
        onMaximize={onToggleMaximize}
        isMaximized={isMaximized}
        headerText={content?.headerText}
      />
      <div className="flex-1 overflow-y-auto">
        <CanvasContent
          theme={theme}
          getThemeClasses={getThemeClasses}
          content={content}
        />
      </div>
      <CanvasErrorModal
        theme={theme}
        getThemeClasses={getThemeClasses}
        showError={showError}
        onErrorClose={onErrorClose}
        onShowConsole={onShowConsole}
      />
    </div>
  );
}; 