import { Plus, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface BubbleSelectProps {
  /** Label shown above the control */
  label?: string;
  /** Currently selected values */
  value: string[];
  /** Called when selection changes */
  onChange: (value: string[]) => void;
  /** Options to choose from in the dropdown */
  options: string[];
  /** Placeholder when no items selected */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Multi-select with add button, dropdown list, and removable bubbles.
 * Select from dropdown to add; click X on a bubble to remove.
 */
export function BubbleSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'None selected',
  disabled = false,
  className,
}: BubbleSelectProps) {
  const selectedSet = new Set(value);
  const availableOptions = options.filter((opt) => !selectedSet.has(opt));

  const handleAdd = (option: string) => {
    onChange([...value, option]);
  };

  const handleRemove = (option: string) => {
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="text-xs text-muted-foreground">{label}</label>
      )}
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 min-h-[2.5rem]">
        {value.length === 0 && (
          <span className="text-sm text-muted-foreground">{placeholder}</span>
        )}
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-sm"
          >
            {item}
            <button
              type="button"
              onClick={() => handleRemove(item)}
              disabled={disabled}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || availableOptions.length === 0}
              className="h-7 shrink-0 px-2 text-muted-foreground hover:text-foreground"
              aria-label="Add"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
            {availableOptions.length === 0 ? (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                All options selected
              </div>
            ) : (
              availableOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onSelect={() => handleAdd(opt)}
                >
                  {opt}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
