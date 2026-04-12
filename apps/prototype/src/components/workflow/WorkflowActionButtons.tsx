import React from 'react';
import { Settings2 } from 'lucide-react';

export interface WorkflowActionButtonsProps {
  onInspectorClick?: () => void;
}

export const WorkflowActionButtons: React.FC<WorkflowActionButtonsProps> = ({
  onInspectorClick,
}) => {
  const buttonClass =
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/95 backdrop-blur hover:bg-accent hover:text-accent-foreground';

  return (
    <div className="pointer-events-auto flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={onInspectorClick}
        className={buttonClass}
        aria-label="Show node inspector"
        title="Show inspector"
      >
        <Settings2 className="h-4 w-4" />
      </button>
    </div>
  );
};
