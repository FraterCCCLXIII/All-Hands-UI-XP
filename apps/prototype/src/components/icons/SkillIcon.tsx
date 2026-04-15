import type { SVGProps } from 'react';
import { cn } from '../../lib/utils';

type SkillIconProps = SVGProps<SVGSVGElement>;

/** Default stroke matches global `--lucide-icon-stroke` / Lucide nav weight (1.5). */
export function SkillIcon({ className, strokeWidth = 1.5, ...props }: SkillIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 19.13 24.62"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4 w-auto shrink-0', className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M.86,7.26l5.74,3.3,11.68-6.6" />
      <path d="M6.6,17.15v-6.6" />
      <path d="M1.32,14.34l4.62,2.64c.41.24.91.24,1.32,0l10.56-5.94" />
      <path d="M.66,20c0,.47.25.91.66,1.14l4.62,2.64c.41.24.91.24,1.32,0l10.56-5.94c.41-.24.66-.67.66-1.14V4.62c0-.47-.25-.91-.66-1.14L13.2.84c-.41-.24-.91-.24-1.32,0L1.32,6.78c-.41.24-.66.67-.66,1.14v12.08Z" />
      <path d="M.86,14.06l5.74,3.3,11.68-6.6" />
      <path d="M6.6,23.96v-6.6" />
    </svg>
  );
}
