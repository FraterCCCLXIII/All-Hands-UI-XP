import { useId } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const OpenHandsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 188 188" fill="none" aria-hidden>
    <rect width="188" height="188" rx="16" fill="#333333" />
    <path d="M94 36.2002L144 65.0595V122.778L94 151.637L44 122.778V65.0595L94 36.2002Z" fill="#fff" />
    <path d="M144 65.0595L94 36.2002L44 65.0595M144 65.0595V122.778L94 151.637M144 65.0595L135.195 70.1417M94 151.637L44 122.778V65.0595M94 151.637V139.295M44 65.0595L52.805 70.1417M94 93.9188L83.5605 87.8933M94 93.9188L104.44 87.8933M94 93.9188V104.809M94 47.4535L52.805 70.1417M94 47.4535L135.195 70.1417M94 47.4535V59.0698M52.805 70.1417V116.425M135.195 70.1417V116.425M94 59.0698L62.7722 75.8946M94 59.0698L125.228 75.8946M62.7722 75.8946L73.121 81.8677M62.7722 75.8946V110.254M125.228 75.8946L114.879 81.8677M125.228 75.8946V110.254M94 70.1417L73.121 81.8677M94 70.1417L114.879 81.8677M94 70.1417V82.0302M73.121 81.8677V104.809M114.879 81.8677V104.809M94 82.0302L83.5605 87.8933M94 82.0302L104.44 87.8933M83.5605 87.8933V98.4565M104.44 87.8933V98.4565M94 139.295L135.195 116.425M94 139.295L52.805 116.425M135.195 116.425L125.228 110.254M94 127.497L125.228 110.254M94 127.497V116.425M94 127.497L62.7722 110.254M94 116.425L114.879 104.809M94 116.425L73.121 104.809M114.879 104.809L104.44 98.4565M73.121 104.809L83.5605 98.4565M62.7722 110.254L52.805 116.425M83.5605 98.4565L94 104.809M104.44 98.4565L94 104.809" stroke="#000" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface EnterpriseCtaCardProps {
  title?: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  onDismiss?: () => void;
  showIcon?: boolean;
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
  showIcon = false,
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
        {showIcon && (
          <div className="flex justify-start">
            <OpenHandsIcon />
          </div>
        )}
        <div className="space-y-2">
          <h2 id={titleId} className="text-xl font-semibold text-foreground">
            {title}
          </h2>
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex flex-nowrap items-center gap-3">
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
