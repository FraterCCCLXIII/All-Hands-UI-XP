import { PluginToggle } from '../ui/plugin-toggle';

interface CondensationSettingsProps {
  defaultHistorySize?: number;
  showHeading?: boolean;
  enableCondenser: boolean;
  onEnableCondenserChange: (value: boolean) => void;
  enableConfirmation: boolean;
  onEnableConfirmationChange: (value: boolean) => void;
}

export function CondensationSettings({
  defaultHistorySize = 240,
  showHeading = false,
  enableCondenser,
  onEnableCondenserChange,
  enableConfirmation,
  onEnableConfirmationChange,
}: CondensationSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      {showHeading && (
        <div className="text-lg font-semibold text-foreground">Condensation Settings</div>
      )}
      <label className="flex flex-col gap-2.5 w-full">
        <span className="text-sm text-foreground">Memory condenser max history size</span>
        <input
          min={20}
          step={1}
          className="h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30"
          type="number"
          defaultValue={defaultHistorySize}
        />
        <p className="text-xs text-muted-foreground mt-2">
          After this many events, the condenser will summarize history. Minimum 20.
        </p>
      </label>

      <label className="flex items-center gap-2 w-fit cursor-pointer">
        <PluginToggle
          checked={enableCondenser}
          onCheckedChange={onEnableCondenserChange}
          aria-label="Enable memory condensation"
        />
        <span className="text-sm text-foreground">Enable memory condensation</span>
      </label>

      <label className="flex items-center gap-2 w-fit cursor-pointer">
        <PluginToggle
          checked={enableConfirmation}
          onCheckedChange={onEnableConfirmationChange}
          aria-label="Enable confirmation mode"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">Enable Confirmation Mode</span>
          <span className="text-xs leading-4 text-primary-foreground font-medium tracking-tighter bg-primary px-1 rounded-full">
            Beta
          </span>
        </div>
      </label>
    </div>
  );
}
