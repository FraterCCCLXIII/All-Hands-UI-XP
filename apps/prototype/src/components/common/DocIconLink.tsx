import { BookOpen } from 'lucide-react';

interface DocIconLinkProps {
  href?: string;
  'aria-label'?: string;
}

export function DocIconLink({
  href = 'https://docs.openhands.dev/',
  'aria-label': ariaLabel = 'View documentation',
}: DocIconLinkProps) {
  return (
    <span className="group relative inline-flex">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={ariaLabel}
      >
        <BookOpen className="h-4 w-4" aria-hidden />
      </a>
      {/* pt-1.5 bridges the gap so hover isn't lost moving to the tooltip */}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 flex -translate-x-1/2 flex-col items-center pt-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:delay-75">
        <span
          role="tooltip"
          className="whitespace-nowrap rounded-md bg-muted px-2 py-1 text-xs text-foreground shadow-md"
        >
          View Documentation
        </span>
      </span>
    </span>
  );
}
