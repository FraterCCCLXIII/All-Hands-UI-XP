import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '../../lib/utils';

const nativeSelectClassName =
  'h-10 w-full appearance-none rounded-md border border-border bg-muted/40 py-2 pl-3 pr-10 text-sm text-foreground ring-offset-background hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted/30 disabled:opacity-50';

export type NativeSelectProps = React.ComponentPropsWithoutRef<'select'> & {
  wrapperClassName?: string;
};

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, wrapperClassName, children, ...props }, ref) => (
    <div className={cn('relative w-full', wrapperClassName)}>
      <select ref={ref} className={cn(nativeSelectClassName, className)} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  )
);
NativeSelect.displayName = 'NativeSelect';
