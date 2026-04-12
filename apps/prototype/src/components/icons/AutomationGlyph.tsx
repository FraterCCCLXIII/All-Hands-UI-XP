import { useId } from 'react';
import { cn } from '../../lib/utils';

/** Automations nav-style glyph for chat context and lists. */
export function AutomationGlyph({ className }: { className?: string }) {
  const clipId = `automation-glyph-${useId().replace(/:/g, '')}`;
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={cn('block', className)}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={clipId}>
          <rect width="18" height="18" fill="white" transform="translate(1 1)" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path d="M10 18.1818V16.5454" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 1.81812V3.45448" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.81824 10H3.4546" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.1818 10H16.5454" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.93359 17.1019L6.74359 15.6782" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.0663 2.89819L13.2563 4.32183" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.89819 5.93359L4.32183 6.74359" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.1019 14.0663L15.6782 13.2563" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.92542 2.90625L6.7436 4.3217" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.0909 17.0854L13.2727 15.6699" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.0855 5.90918L15.67 6.72736" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.91455 14.0909L4.33001 13.2727" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M10 16.5455C13.615 16.5455 16.5455 13.615 16.5455 10C16.5455 6.38509 13.615 3.45459 10 3.45459C6.38509 3.45459 3.45459 6.38509 3.45459 10C3.45459 13.615 6.38509 16.5455 10 16.5455Z"
          stroke="currentColor"
          strokeWidth="1.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5854 9.77916L8.80545 7.59461C8.63363 7.49643 8.41272 7.61916 8.41272 7.81552V12.1846C8.41272 12.381 8.62545 12.5119 8.80545 12.4055L12.5854 10.221C12.7573 10.1228 12.7573 9.86916 12.5854 9.77098V9.77916Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
