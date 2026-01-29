import { Lightbulb } from 'lucide-react';
import { ThemeElement } from '../../types/theme';
import { cn } from '../../lib/utils';

interface ProtipProps {
  getThemeClasses: (element: ThemeElement) => string;
}

export function Protip({ getThemeClasses }: ProtipProps) {
  return (
    <div
      className={cn(
        'max-w-2xl w-full rounded-xl border bg-muted/60 p-4 text-left shadow-sm',
        getThemeClasses('panel-bg'),
        getThemeClasses('border'),
        getThemeClasses('text')
      )}
      data-testid="canvas-protip"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Lightbulb className="h-4 w-4 text-muted-foreground" aria-hidden />
        <span>Protip</span>
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
    </div>
  );
}
