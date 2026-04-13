import * as React from 'react';
import { cn } from '../../lib/utils';

export type ScrollablePaneProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'main' | 'section' | 'aside' | 'article';
};

/** Scrollable region using the app scrollbar styling from `index.css` (`.custom-scrollbar`). */
export function ScrollablePane({ as: Comp = 'div', className, ...props }: ScrollablePaneProps) {
  return <Comp className={cn('min-h-0 overflow-y-auto custom-scrollbar', className)} {...props} />;
}
