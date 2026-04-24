import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '../../lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Trigger
    ref={ref}
    className={cn(
      'shrink-0 outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
      className,
    )}
    {...props}
  />
));
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    portalled?: boolean;
    /** When false, overflow is still scrollable but the scrollbar track is hidden (e.g. account menu). */
    showScrollbar?: boolean;
    /** Use shrink-wrapped width (w-max) instead of fixed w-72. */
    hugContent?: boolean;
  }
>(({ className, align = 'center', sideOffset = 4, portalled = true, showScrollbar = true, hugContent = false, ...props }, ref) => {
  const content = (
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        showScrollbar ? 'dropdown-scroll' : 'hide-scrollbar',
        'z-50 max-h-[min(24rem,calc(100dvh-2rem))] overflow-y-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none ring-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        hugContent ? 'w-max min-w-0' : 'w-72',
        className
      )}
      {...props}
    />
  );

  if (!portalled) {
    return content;
  }

  return <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal>;
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
