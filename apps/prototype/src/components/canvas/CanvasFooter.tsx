import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeElement } from '../../types/theme';

interface CanvasFooterProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  isConsoleVisible: boolean;
  consoleHeight: number;
}

export const CanvasFooter: React.FC<CanvasFooterProps> = ({
  getThemeClasses,
  isConsoleVisible,
  consoleHeight,
}) => {
  return (
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
        Console {isConsoleVisible ? `(${consoleHeight}px)` : '(hidden)'}
      </div>
    </div>
  );
}; 