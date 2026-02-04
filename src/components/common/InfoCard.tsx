import * as React from 'react';
import { cn } from '../../lib/utils';

type IconPosition = 'top' | 'left';

export type InfoCardProps<T extends React.ElementType = 'div'> = {
  as?: T;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  interactive?: boolean;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'title' | 'description'>;

export function InfoCard<T extends React.ElementType = 'div'>({
  as,
  title,
  description,
  icon,
  iconPosition = 'top',
  interactive = false,
  className,
  ...props
}: InfoCardProps<T>) {
  const Component = as ?? 'div';
  const showIconTop = icon && iconPosition === 'top';
  const showIconLeft = icon && iconPosition === 'left';

  return (
    <Component
      className={cn(
        'flex h-full min-h-[120px] flex-col rounded-xl border border-border bg-card text-left',
        interactive &&
          'transition-colors hover:bg-muted/50 hover:border-muted-foreground/20',
        className
      )}
      {...props}
    >
      <div className="flex flex-1 flex-col p-6">
        {showIconTop && (
          <div className="mb-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
            {icon}
          </div>
        )}
        <div className={cn(showIconLeft && 'flex items-start gap-3')}>
          {showIconLeft && (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <span className="text-base font-medium text-foreground">{title}</span>
            {description && (
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </div>
    </Component>
  );
}
