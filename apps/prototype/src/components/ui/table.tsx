import { cn } from '../../lib/utils';

/** Card-style frame around data tables (border, shadow, rounded). */
export const dataTableShellClassName =
  'overflow-hidden rounded-xl border border-border bg-card shadow-sm';

export const dataTableInnerClassName = 'min-w-0';

export const dataTableClassName = 'w-full table-fixed border-collapse text-sm';

export const dataTableHeadRowClassName = 'border-b border-border bg-muted/50';

export const dataTableBodyClassName = 'divide-y divide-border';

export const dataTableRowClassName = 'bg-card transition-colors hover:bg-muted/25';

/**
 * Base styles for data table header cells — sentence case labels, not uppercase.
 * Pair with padding + alignment, e.g. `cn(dataTableThClassName, 'px-4 text-left')`.
 */
export const dataTableThClassName = 'py-3.5 text-xs font-semibold text-muted-foreground';

export function dataTableTh(...parts: (string | undefined)[]) {
  return cn(dataTableThClassName, ...parts);
}
