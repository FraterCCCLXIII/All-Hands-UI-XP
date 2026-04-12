import { cn } from '../../lib/utils';

type BadgeVariant = 'open' | 'error' | 'closed';

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  open: 'bg-primary/20 text-primary border-primary/30',
  error: 'bg-destructive/20 text-destructive border-destructive/30',
  closed: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', variantStyles[variant])}
    >
      {children}
    </span>
  );
}
