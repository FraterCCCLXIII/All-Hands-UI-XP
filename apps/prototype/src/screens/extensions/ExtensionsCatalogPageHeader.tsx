import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type ExtensionsCatalogPageHeaderProps = {
  title: string;
  /** Sets `id` on the `<h2>` for `aria-labelledby` on surrounding `<section>`. */
  titleId?: string;
  description?: ReactNode;
  /** Primary actions on the right (e.g. + Skill / + Plugin). */
  actions?: ReactNode;
  /** Extra controls below the description (e.g. search + filters). */
  children?: ReactNode;
  /** When true, add bottom padding after the title row (use when not wrapped in a parent with `gap-6`). */
  bordered?: boolean;
  className?: string;
};

export function ExtensionsCatalogPageHeader({
  title,
  titleId,
  description,
  actions,
  children,
  bordered = false,
  className,
}: ExtensionsCatalogPageHeaderProps) {
  return (
    <header
      className={cn(
        /* Parent sections typically use `gap-6` (see Settings); optional extra tail padding when standalone. */
        bordered && 'pb-6',
        className
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <h2 id={titleId} className="text-xl font-semibold leading-6 text-foreground">
            {title}
          </h2>
          {description ? <div className="max-w-2xl text-sm text-muted-foreground">{description}</div> : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end sm:pt-0.5">
            {actions}
          </div>
        ) : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </header>
  );
}
