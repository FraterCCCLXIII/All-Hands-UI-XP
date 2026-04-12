import { Lightbulb } from 'lucide-react';
import { Button } from '../ui/button';
import openHandsCliImage from '../../assets/OpenHandsCLI.png';

export type ProtipVariant = 'protip' | 'cli';

interface ProtipProps {
  variant?: ProtipVariant;
  onDismiss?: () => void;
}

export function Protip({ variant = 'protip', onDismiss }: ProtipProps) {
  const isCli = variant === 'cli';

  return (
    <div className="relative max-w-2xl w-full" data-testid="canvas-protip">
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-0 top-0 z-20 inline-flex h-7 w-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Dismiss pro tip"
        >
          ×
        </button>
      )}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card/70 p-4 text-left shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-card/50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.16),_transparent_60%)]" />
        <div className="relative z-10">
        {isCli ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lightbulb className="h-4 w-4 text-white" aria-hidden />
                <span>Protip!</span>
              </div>
              <p className="text-sm text-muted-foreground/90">
                Access the power of OpenHands directly in your terminal with OpenHands CLI.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" className="h-9 px-4">
                  Get it
                </Button>
                <Button type="button" variant="outline" className="h-9 px-4">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative -mb-4 sm:pl-4 sm:self-stretch">
              <div className="relative h-full w-[280px] overflow-hidden">
                <img
                  src={openHandsCliImage}
                  alt="OpenHands CLI preview"
                  className="absolute right-0 top-0 w-[260px] max-w-none rounded-lg shadow-sm"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-white" aria-hidden />
              <span>Protip!</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground/90">
              OpenHands Cloud offers a GitHub hook, so you can say &quot;@openhands fix the merge conflicts&quot; or
              &quot;@openhands fix the feedback on this PR&quot; right inside the GitHub UI.{' '}
              <a
                href="https://docs.all-hands.dev/usage/cloud/github-installation#working-on-github-issues-and-pull-requests-using-openhands"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-foreground hover:text-foreground/80"
              >
                Learn more
              </a>
            </p>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
