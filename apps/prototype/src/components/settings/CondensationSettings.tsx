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
      <label className="flex flex-col gap-2.5 w-full max-w-[680px]">
        <span className="text-sm text-foreground">Memory condenser max history size</span>
        <input
          min={20}
          step={1}
          className="h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30"
          type="number"
          defaultValue={defaultHistorySize}
        />
        <p className="text-xs text-muted-foreground mt-2">
          After this many events, the condenser will summarize history. Minimum 20.
        </p>
      </label>

      <label className="flex items-center gap-2 w-fit cursor-pointer">
        <input
          hidden
          type="checkbox"
          checked={enableCondenser}
          onChange={(e) => onEnableCondenserChange(e.target.checked)}
        />
        <div
          className={`relative w-12 h-6 rounded-xl cursor-pointer transition-colors duration-200 ease-in-out flex items-center p-1.5 justify-start ${
            enableCondenser ? 'bg-white' : 'bg-muted border border-border'
          }`}
        >
          <div
            className={`w-3 h-3 rounded-xl transition-all duration-200 ease-in-out ${
              enableCondenser ? 'translate-x-6 bg-black' : 'translate-x-0 bg-muted-foreground'
            }`}
          ></div>
        </div>
        <span className="text-sm text-foreground">Enable memory condensation</span>
      </label>

      <label className="flex items-center gap-2 w-fit cursor-pointer">
        <input
          hidden
          type="checkbox"
          checked={enableConfirmation}
          onChange={(e) => onEnableConfirmationChange(e.target.checked)}
        />
        <div
          className={`relative w-12 h-6 rounded-xl cursor-pointer transition-colors duration-200 ease-in-out flex items-center p-1.5 justify-start ${
            enableConfirmation ? 'bg-white' : 'bg-muted border border-border'
          }`}
        >
          <div
            className={`w-3 h-3 rounded-xl transition-all duration-200 ease-in-out ${
              enableConfirmation ? 'translate-x-6 bg-black' : 'translate-x-0 bg-muted-foreground'
            }`}
          ></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">Enable Confirmation Mode</span>
          <span className="text-[11px] leading-4 text-black font-medium tracking-tighter bg-white px-1 rounded-full">
            Beta
          </span>
        </div>
      </label>
    </div>
  );
}
