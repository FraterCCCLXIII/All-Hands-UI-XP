import React from 'react';

interface SpinnerProps {
  className?: string;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className, color = 'border-t-white' }) => (
  <div className={`animate-spin rounded-full border-2 border-solid border-transparent ${color} ${className}`}></div>
); 