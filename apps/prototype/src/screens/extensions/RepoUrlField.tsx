import { ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

type RepoUrlFieldProps = {
  href: string;
  className?: string;
};

/** Full-width repo URL row: Inter, truncated URL, external-link icon on the right. */
export function RepoUrlField({ href, className }: RepoUrlFieldProps) {
  const display = href.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex h-10 w-full min-w-0 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm transition-colors',
        'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        className,
      )}
      aria-label={`Open ${display} in a new tab`}
    >
      <span className="min-w-0 flex-1 truncate text-left font-sans">{display}</span>
      <ExternalLink
        className="h-4 w-4 shrink-0 text-muted-foreground opacity-70 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </a>
  );
}
