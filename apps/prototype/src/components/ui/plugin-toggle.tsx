import { cn } from '../../lib/utils';

const LOCK_PATH =
  'M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z';

export type PluginToggleProps = {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Always on; cannot turn off; shows a lock on the track. */
  locked?: boolean;
  /** `sm` for compact placement (e.g. card corners); default matches Settings tables. */
  size?: 'default' | 'sm';
  'aria-label'?: string;
  className?: string;
};

/**
 * Pill toggle aligned with Settings → Org → Plugins (white track / black thumb when on).
 * Use `size="sm"` on dense card layouts; default matches org settings rows.
 */
export function PluginToggle({
  checked,
  onCheckedChange,
  disabled = false,
  locked = false,
  size = 'default',
  'aria-label': ariaLabel,
  className,
}: PluginToggleProps) {
  const isOn = locked ? true : checked;
  const isDisabled = disabled || locked;
  const isSm = size === 'sm';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={ariaLabel}
      disabled={isDisabled}
      title={locked ? 'This plugin is required and cannot be turned off' : undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (isDisabled) return;
        onCheckedChange?.(!checked);
      }}
      className={cn(
        'relative box-border inline-flex shrink-0 items-center justify-start rounded-full transition-colors duration-200 ease-in-out',
        isSm
          ? 'h-3 min-h-3 w-8 min-w-8 p-px'
          : 'h-5 min-h-5 w-12 min-w-12 p-0.5',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isOn ? 'bg-primary' : 'border border-border bg-muted',
        locked && 'cursor-not-allowed opacity-100',
        disabled && !locked && 'cursor-not-allowed',
        className,
      )}
    >
      {locked && isOn && (
        <span
          className={cn(
            'pointer-events-none absolute top-1/2 z-[1] -translate-y-1/2 text-black',
            isSm ? 'left-1.5 pl-1' : 'left-2 pl-1',
          )}
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            className={cn('fill-current', isSm ? 'h-2 w-2' : 'h-[9px] w-[9px]')}
            aria-hidden
          >
            <path fillRule="evenodd" d={LOCK_PATH} clipRule="evenodd" />
          </svg>
        </span>
      )}
      <span
        className={cn(
          'shrink-0 transition-all duration-200 ease-in-out',
          isSm ? 'h-2.5 w-2.5 rounded-full' : 'h-4 w-4 rounded-full',
          isOn
            ? isSm
              ? 'translate-x-5 bg-black'
              : 'translate-x-7 bg-black'
            : 'translate-x-0 bg-muted-foreground',
        )}
        aria-hidden
      />
    </button>
  );
}
