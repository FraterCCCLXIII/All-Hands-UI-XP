import React from 'react';
import { Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PrototypeControlsFabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export const PrototypeControlsFab = React.forwardRef<HTMLButtonElement, PrototypeControlsFabProps>(
  ({ isActive = false, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={isActive}
      aria-label="Prototype controls"
      title="Prototype controls"
      className={cn(
        'fixed bottom-4 right-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'bg-card text-foreground border-border hover:bg-muted',
        className
      )}
      data-testid="prototype-controls-fab"
      {...props}
    >
      <Settings className="h-5 w-5" aria-hidden />
    </button>
  )
);

PrototypeControlsFab.displayName = 'PrototypeControlsFab';
