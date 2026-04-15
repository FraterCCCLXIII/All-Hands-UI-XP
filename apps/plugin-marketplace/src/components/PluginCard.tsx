import { Link } from 'react-router-dom';
import { Box } from 'lucide-react';
import { cn } from '@all-hands/ui';
import type { MarketplacePlugin } from '../data/plugins';
import { StarRating } from './StarRating';

type PluginCardProps = {
  plugin: MarketplacePlugin;
  className?: string;
};

export function PluginCard({ plugin, className }: PluginCardProps) {
  const version = plugin.version ?? '1.0.0';

  return (
    <Link
      to={`/plugins/${plugin.id}`}
      className={cn(
        'block w-full rounded-xl border border-border bg-card p-5 text-left shadow-[var(--shadow-card)] transition-colors',
        'hover:border-muted-foreground/25 hover:bg-muted/30',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
          <Box className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <span className="min-w-0 text-base font-medium text-foreground">{plugin.name}</span>
            <span className="shrink-0 tabular-nums text-xs text-muted-foreground" aria-label={`Version ${version}`}>
              v{version}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{plugin.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {plugin.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex max-w-full shrink-0 items-center rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium leading-tight tracking-wide text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center">
            <StarRating value={plugin.rating} aria-label={`${plugin.name} rating`} />
          </div>
        </div>
      </div>
    </Link>
  );
}
