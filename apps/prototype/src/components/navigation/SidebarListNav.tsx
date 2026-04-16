import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * Shared left “list” rails: Settings, Extensions, workspace pickers, component library browse.
 * Small type + compact horizontal padding; icons at 16px.
 */
export const sidebarListNavRailClass = cn(
  'relative z-10 flex shrink-0 flex-col',
  'pt-[var(--settings-nav-padding-top)] pb-[var(--settings-nav-padding-bottom)]',
);

export const sidebarListNavSectionLabelClass =
  'text-[10px] font-semibold uppercase tracking-wider text-muted-foreground';

/** Text-only group heading (e.g. component library Browse groups). */
export const sidebarListNavGroupHeadingClass =
  'text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary';

/** Mid-level section title in a text-only rail. */
export const sidebarListNavSubsectionHeadingClass =
  'text-left text-xs font-semibold text-foreground transition-colors hover:text-primary';

/** Leaf link in a text-only rail. */
export const sidebarListNavLeafClass =
  'text-left text-xs text-muted-foreground transition-colors hover:text-foreground';

const itemBase = cn(
  'group flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors',
);

export type SidebarListNavItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Lucide icons, SkillIcon, McpIcon, etc. */
  icon: ElementType<{ className?: string }>;
  active?: boolean;
  children: ReactNode;
};

/**
 * Single row: icon + label. Matches settings/extensions/workspace list styling.
 */
export function SidebarListNavItem({
  icon: Icon,
  active,
  children,
  className,
  ...props
}: SidebarListNavItemProps) {
  return (
    <button
      type="button"
      className={cn(
        itemBase,
        active ? 'bg-muted/60' : 'hover:bg-muted/60',
        className,
      )}
      {...props}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0',
          active ? '!text-white' : '!text-muted-foreground group-hover:!text-white',
        )}
        aria-hidden
      />
      <span
        className={cn(
          'min-w-0 flex-1 truncate font-normal',
          active ? 'text-white' : 'text-muted-foreground group-hover:!text-white',
        )}
      >
        {children}
      </span>
    </button>
  );
}
