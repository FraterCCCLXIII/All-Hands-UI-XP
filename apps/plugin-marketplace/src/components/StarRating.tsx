import { Star } from 'lucide-react';
import { cn } from '@all-hands/ui';

type StarRatingProps = {
  value: number;
  max?: number;
  className?: string;
  /** When set, stars are buttons and call onChange with 1-based index */
  onChange?: (value: number) => void;
  'aria-label'?: string;
};

export function StarRating({
  value,
  max = 5,
  className,
  onChange,
  'aria-label': ariaLabel = 'Rating',
}: StarRatingProps) {
  const interactive = Boolean(onChange);

  return (
    <div
      role={interactive ? 'radiogroup' : undefined}
      aria-label={ariaLabel}
      className={cn('flex items-center gap-0.5', className)}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(value);
        const star = (
          <Star
            className={cn(
              'h-4 w-4 shrink-0',
              filled ? 'fill-foreground text-foreground' : 'fill-transparent text-muted-foreground'
            )}
            strokeWidth={filled ? 0 : 1.5}
            aria-hidden
          />
        );

        if (!interactive) {
          return <span key={i}>{star}</span>;
        }

        const score = i + 1;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={score === Math.round(value)}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={() => onChange?.(score)}
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}
