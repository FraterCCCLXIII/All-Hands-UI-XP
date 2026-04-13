import React from 'react';
import { Plus } from 'lucide-react';

export interface WorkflowNodePaletteButtonProps {
  onClick?: () => void;
  ariaLabel?: string;
  title?: string;
}

export const WorkflowNodePaletteButton: React.FC<WorkflowNodePaletteButtonProps> = ({
  onClick,
  ariaLabel = 'Open node palette',
  title = 'Open node palette',
}) => (
  <div className="pointer-events-auto flex flex-col items-start gap-2">
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/95 backdrop-blur hover:bg-accent hover:text-accent-foreground"
      aria-label={ariaLabel}
      title={title}
    >
      <Plus className="h-4 w-4" />
    </button>
  </div>
);
