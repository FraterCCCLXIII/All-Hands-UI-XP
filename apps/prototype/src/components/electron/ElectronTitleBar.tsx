import React, { useEffect, useMemo, useState } from 'react';
import { Maximize2, Minus, Square, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WindowControlButtonProps {
  label: string;
  onClick: () => void;
  children?: React.ReactNode;
  variant?: 'default' | 'danger' | 'mac-close' | 'mac-minimize' | 'mac-maximize';
}

interface WindowControl {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

function WindowControlButton({ label, onClick, children, variant = 'default' }: WindowControlButtonProps) {
  const isMacControl = variant.startsWith('mac-');

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'electron-no-drag flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        isMacControl
          ? 'h-3 w-3 rounded-full border border-black/20 shadow-sm'
          : 'h-8 w-10 rounded-md text-muted-foreground',
        variant === 'danger' && 'hover:bg-destructive hover:text-destructive-foreground',
        variant === 'default' && 'hover:bg-muted hover:text-foreground',
        variant === 'mac-close' && 'bg-[#ff5f57] hover:bg-[#ff6b64]',
        variant === 'mac-minimize' && 'bg-[#febc2e] hover:bg-[#ffc642]',
        variant === 'mac-maximize' && 'bg-[#28c840] hover:bg-[#32d74b]'
      )}
    >
      {children}
    </button>
  );
}

export function ElectronTitleBar() {
  const windowControls = typeof window === 'undefined' ? undefined : window.openHandsWindowControls;
  const [isMaximized, setIsMaximized] = useState(false);

  const isMac = windowControls?.platform === 'darwin';
  const controls = useMemo<WindowControl[]>(
    () => [
      {
        label: 'Minimize window',
        icon: <Minus className="h-4 w-4" aria-hidden="true" />,
        onClick: () => {
          void windowControls?.minimize();
        },
      },
      {
        label: isMaximized ? 'Restore window' : 'Maximize window',
        icon: isMaximized ? (
          <Square className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
        ),
        onClick: () => {
          void windowControls?.toggleMaximize().then(() => {
            void windowControls?.isMaximized().then(setIsMaximized);
          });
        },
      },
      {
        label: 'Close window',
        icon: <X className="h-4 w-4" aria-hidden="true" />,
        onClick: () => {
          void windowControls?.close();
        },
        variant: 'danger' as const,
      },
    ],
    [isMaximized, windowControls]
  );

  useEffect(() => {
    void windowControls?.isMaximized().then(setIsMaximized);
  }, [windowControls]);

  if (!windowControls) {
    return null;
  }

  const macControlButtons = (
    <div className="flex items-center gap-2 pl-1">
      <WindowControlButton
        label="Close window"
        variant="mac-close"
        onClick={() => {
          void windowControls.close();
        }}
      />
      <WindowControlButton
        label="Minimize window"
        variant="mac-minimize"
        onClick={() => {
          void windowControls.minimize();
        }}
      />
      <WindowControlButton
        label={isMaximized ? 'Restore window' : 'Maximize window'}
        variant="mac-maximize"
        onClick={() => {
          void windowControls.toggleMaximize().then(() => {
            void windowControls.isMaximized().then(setIsMaximized);
          });
        }}
      />
    </div>
  );

  const defaultControlButtons = (
    <div className="flex items-center gap-1 pr-1">
      {controls.map((control) => (
        <WindowControlButton
          key={control.label}
          label={control.label}
          onClick={control.onClick}
          variant={control.variant}
        >
          {control.icon}
        </WindowControlButton>
      ))}
    </div>
  );

  return (
    <header className="electron-drag-region fixed inset-x-0 top-0 z-[80] flex h-9 flex-shrink-0 items-center border-b border-border bg-background/95 px-3 text-foreground">
      {isMac && macControlButtons}
      <div className="min-w-0 flex-1" />
      {!isMac && defaultControlButtons}
    </header>
  );
}
