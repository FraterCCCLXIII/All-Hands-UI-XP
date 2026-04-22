import type { SVGProps } from 'react';

import { cn } from '../../lib/utils';

type RuntimeIconProps = SVGProps<SVGSVGElement>;

/**
 * Clock / refresh-style runtime mark — matches Lucide weight via `lucide` + `--lucide-icon-stroke` (see index.css).
 */
export function RuntimeIcon({ className, strokeWidth: _omitStroke, ...props }: RuntimeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      className={cn('lucide h-5 w-5 shrink-0', className)}
      aria-hidden="true"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19,10c0,4.97-4.03,9-9,9S1,14.97,1,10,5.03,1,10,1c2.52,0,4.93,1,6.74,2.74l2.26,2.26"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19,1v5h-5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10,4v6l4,2"
      />
    </svg>
  );
}
