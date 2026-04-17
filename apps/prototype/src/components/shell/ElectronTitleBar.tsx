import { useCallback, useEffect, useState } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const MAC_CHROME_GUTTER = 'w-[76px] min-w-[76px] shrink-0';

/** macOS traffic-light colors (close, minimize, zoom). */
function MacTrafficLights({
  isMaximized,
  onClose,
  onMinimize,
  onToggleMaximize,
}: {
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
}) {
  return (
    <div
      className={cn(
        'electron-app-region-no-drag flex items-center gap-2 py-1.5 pl-3',
        MAC_CHROME_GUTTER,
      )}
    >
      <button
        type="button"
        className="group relative flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-black/[0.12] bg-[#FF5F57] shadow-sm outline-none ring-offset-background transition-colors hover:bg-[#e04b44] focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Close"
        onClick={onClose}
      >
        <X
          className="h-2 w-2 text-neutral-950 opacity-0 transition-opacity group-hover:opacity-50"
          strokeWidth={2.5}
        />
      </button>
      <button
        type="button"
        className="group relative flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-black/[0.12] bg-[#FFBD2E] shadow-sm outline-none ring-offset-background transition-colors hover:bg-[#e6a820] focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Minimize"
        onClick={onMinimize}
      >
        <Minus
          className="h-2 w-2 text-neutral-950 opacity-0 transition-opacity group-hover:opacity-50"
          strokeWidth={2.5}
        />
      </button>
      <button
        type="button"
        className="group relative flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-black/[0.12] bg-[#28C840] shadow-sm outline-none ring-offset-background transition-colors hover:bg-[#23b438] focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={isMaximized ? 'Restore' : 'Zoom'}
        onClick={onToggleMaximize}
      >
        <Square
          className="h-1.5 w-1.5 text-neutral-950 opacity-0 transition-opacity group-hover:opacity-50"
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
}

function WindowsWindowControls({
  isMaximized,
  onClose,
  onMinimize,
  onToggleMaximize,
}: {
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
}) {
  return (
    <div className="electron-app-region-no-drag flex flex-shrink-0 items-center gap-0.5 py-1 pl-2 pr-4">
      <button
        type="button"
        className="inline-flex h-7 w-7 min-w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Minimize"
        onClick={onMinimize}
      >
        <Minus className="h-3 w-3 text-foreground opacity-50" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        className="inline-flex h-7 w-7 min-w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
        onClick={onToggleMaximize}
      >
        <Square className="h-2.5 w-2.5 text-foreground opacity-50" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        className="group inline-flex h-7 w-7 min-w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/90 hover:text-destructive-foreground"
        aria-label="Close"
        onClick={onClose}
      >
        <X
          className="h-3 w-3 text-foreground opacity-50 group-hover:text-destructive-foreground/50"
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
}

export function ElectronTitleBar() {
  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  const [isMaximized, setIsMaximized] = useState(false);

  const isMac = api?.platform === 'darwin';

  useEffect(() => {
    if (!api) return;
    let cancelled = false;
    void api.isMaximized().then((m) => {
      if (!cancelled) setIsMaximized(m);
    });
    const unsub = api.onMaximizedChange(setIsMaximized);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [api]);

  const onDragDoubleClick = useCallback(() => {
    void api?.toggleMaximize();
  }, [api]);

  const onClose = useCallback(() => void api?.close(), [api]);
  const onMinimize = useCallback(() => void api?.minimize(), [api]);
  const onToggleMaximize = useCallback(() => void api?.toggleMaximize(), [api]);

  if (!api) return null;

  const title = (
    <span className="truncate text-xs font-medium text-muted-foreground">All Hands UI XP</span>
  );

  if (isMac) {
    return (
      <header className="relative z-[60] flex h-9 flex-shrink-0 items-center border-b border-border bg-background">
        <MacTrafficLights
          isMaximized={isMaximized}
          onClose={onClose}
          onMinimize={onMinimize}
          onToggleMaximize={onToggleMaximize}
        />
        <div
          className="electron-app-region-drag flex min-h-0 min-w-0 flex-1 items-center justify-center px-3"
          onDoubleClick={onDragDoubleClick}
          role="presentation"
        >
          {title}
        </div>
        <div className={cn('electron-app-region-drag', MAC_CHROME_GUTTER)} aria-hidden="true" />
      </header>
    );
  }

  return (
    <header className="electron-app-region-drag relative z-[60] flex h-9 flex-shrink-0 items-center border-b border-border bg-background">
      <div
        className="flex min-w-0 flex-1 items-center gap-2 px-3"
        onDoubleClick={onDragDoubleClick}
        role="presentation"
      >
        {title}
      </div>
      <WindowsWindowControls
        isMaximized={isMaximized}
        onClose={onClose}
        onMinimize={onMinimize}
        onToggleMaximize={onToggleMaximize}
      />
    </header>
  );
}
