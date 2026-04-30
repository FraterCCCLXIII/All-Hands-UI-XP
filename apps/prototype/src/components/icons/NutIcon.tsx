import type { SVGProps } from 'react';
import { cn } from '../../lib/utils';

type NutIconProps = SVGProps<SVGSVGElement>;

/** Hex nut glyph for Hooks, distinct from the Webhook icon. */
export function NutIcon({ className, ...props }: NutIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide h-4 w-4 shrink-0', className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M7 3h10l5 9-5 9H7l-5-9 5-9Z" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}
