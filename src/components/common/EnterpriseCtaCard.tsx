import { useId } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface EnterpriseCtaCardProps {
  title?: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function EnterpriseCtaCard({
  title = 'Get OpenHands for Enterprise',
  description = 'Cloud allows you to access OpenHands anywhere and coordinate with your team like never before',
  primaryLabel = 'Sign Up',
  secondaryLabel = 'Learn More',
  onPrimaryClick,
  onSecondaryClick,
  onDismiss,
  className,
}: EnterpriseCtaCardProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl px-6 py-5 shadow-lg supports-[backdrop-filter]:bg-card/50',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_55%)]" />
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-3 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow hover:text-foreground hover:bg-muted/60 transition-colors pointer-events-auto"
          aria-label="Dismiss enterprise CTA"
        >
          ×
        </button>
      )}
      <div className="relative z-10 space-y-4 text-left">
        <div className="space-y-2">
          <h2 id={titleId} className="text-xl font-semibold text-foreground">
            {title}
          </h2>
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={onPrimaryClick} className="h-10">
            {primaryLabel}
          </Button>
          <Button type="button" variant="outline" onClick={onSecondaryClick} className="h-10">
            {secondaryLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
