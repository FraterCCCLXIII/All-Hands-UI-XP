import React, { useState, useEffect } from 'react';
import { ThemeElement } from '../../types/theme';

interface GripperProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  onResize: (width: number) => void;
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
}

export const Gripper: React.FC<GripperProps> = ({
  theme,
  getThemeClasses,
  onResize,
  initialWidth,
  minWidth,
  maxWidth,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(initialWidth);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const container = document.querySelector('.flex-1.flex.justify-center');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const deltaX = startX - e.clientX;
      const deltaPercentage = (deltaX / containerRect.width) * 100;
      const newWidth = Math.min(Math.max(startWidth + deltaPercentage, minWidth), maxWidth);
      
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, startWidth, minWidth, maxWidth, onResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setStartWidth(initialWidth);
  };

  return (
    <div
      className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize ${getThemeClasses('hover-resizer-bg')} transition-colors duration-150`}
      onMouseDown={handleMouseDown}
    />
  );
}; 