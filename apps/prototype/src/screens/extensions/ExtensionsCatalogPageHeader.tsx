import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type ExtensionsCatalogPageHeaderProps = {
  title: string;
  /** Sets `id` on the `<h2>` for `aria-labelledby` on surrounding `<section>`. */
  titleId?: string;
  description: ReactNode;
  /** Primary actions on the right (e.g. + Skill / + Plugin). */
  actions?: ReactNode;
  /** Extra controls below the description (e.g. search + filters). */
  children?: ReactNode;
  /** When true, use page padding (standalone top). When false, spacing only (nested under a padded parent). */
  bordered?: boolean;
  className?: string;
};

export function ExtensionsCatalogPageHeader({
  title,
  titleId,
  description,
  actions,
  children,
  bordered = true,
  className,
}: ExtensionsCatalogPageHeaderProps) {
  return (
    <header
      className={cn(
        bordered ? 'px-6 py-6' : 'mb-6',
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-2xl font-semibold text-foreground">
            {title}
          </h2>
          <div className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end sm:pt-0.5">
            {actions}
          </div>
        ) : null}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </header>
  );
}
