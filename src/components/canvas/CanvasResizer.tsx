import React, { useEffect, useState } from 'react';
import { ThemeElement } from '../../types/theme';

interface CanvasResizerProps {
  getThemeClasses: (element: ThemeElement) => string;
  currentWidth: number;
  onResize: (newWidth: number) => void;
  minWidth: number;
  maxWidth: number;
}

export const CanvasResizer: React.FC<CanvasResizerProps> = ({
  getThemeClasses,
  currentWidth,
  onResize,
  minWidth,
  maxWidth,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(currentWidth);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const newWidth = Math.min(Math.max(startWidth + deltaX, minWidth), maxWidth);
    onResize(newWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startX, startWidth, minWidth, maxWidth, onResize]);

  return (
    <div
      className={`w-1 ${getThemeClasses('border')} cursor-ew-resize ${getThemeClasses('hover-resizer-bg')} transition-colors duration-200 flex-shrink-0 self-stretch`}
      onMouseDown={handleMouseDown}
    />
  );
}; 