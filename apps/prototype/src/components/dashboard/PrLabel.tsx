import { cn } from '../../lib/utils';

export type PrLabelStatus =
  | 'draft'
  | 'open'
  | 'ready_for_review'
  | 'changes_requested'
  | 'approved'
  | 'merged'
  | 'closed';

const LABEL_STYLES: Record<PrLabelStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground border-border',
  },
  open: {
    label: 'Open',
    className: 'bg-info/15 text-info border-info/30',
  },
  ready_for_review: {
    label: 'Ready for Review',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  changes_requested: {
    label: 'Changes Requested',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  approved: {
    label: 'Approved',
    className: 'bg-success/15 text-success border-success/30',
  },
  merged: {
    label: 'Merged',
    className: 'bg-primary/15 text-primary border-primary/30',
  },
  closed: {
    label: 'Closed',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

interface PrLabelProps {
  status: PrLabelStatus;
  className?: string;
}

export function PrLabel({ status, className }: PrLabelProps) {
  const { label, className: statusClass } = LABEL_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        statusClass,
        className
      )}
    >
      {label}
    </span>
  );
}
