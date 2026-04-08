import { useState } from 'react';
import { Bell, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center justify-center">
      {(
        <span
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          onFocus={() => setVisible(true)}
          onBlur={() => setVisible(false)}
          tabIndex={0}
          role="button"
          aria-label={label}
          className="outline-none"
        >
          {children}
        </span>
      )}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 px-3 py-1 bg-stone-800 text-white text-xs rounded-full shadow-lg z-50 pointer-events-none whitespace-nowrap"
            role="tooltip"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ClaimStatesScreen = () => {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold leading-6 text-foreground">Claim States & Notifications</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Reference screen for capture: claim button hover states, disconnect button states, and tooltip + toast
        notifications.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Claim Button Hover States</h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-md border border-border bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground">Default</div>
              <button
                type="button"
                className="mt-3 h-8 rounded-md border border-border bg-background px-3 text-xs text-foreground hover:bg-muted/60 transition-colors"
              >
                Claim
              </button>
            </div>
            <div className="rounded-md border border-border bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground">Hover</div>
              <button
                type="button"
                className="mt-3 h-8 rounded-md border border-border bg-muted/60 px-3 text-xs text-foreground"
              >
                Claim
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Disconnect Button States</h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-md border border-border bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground">Claimed (default)</div>
              <button
                type="button"
                className="mt-3 h-8 rounded-md border border-emerald-500/60 bg-emerald-500/20 px-3 text-xs font-medium text-emerald-300 transition-colors"
              >
                Claimed
              </button>
            </div>
            <div className="rounded-md border border-border bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground">Disconnect (hover)</div>
              <button
                type="button"
                className="mt-3 h-8 rounded-md border border-rose-500/60 bg-rose-500/15 px-3 text-xs font-medium text-rose-300"
              >
                Disconnect
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Tooltip Notifications</h3>
          <div className="mt-4 flex items-center gap-6">
            <Tooltip label="Notification: Slack digest scheduled">
              <div className="h-9 w-9 rounded-full border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
                <Bell className="h-4 w-4" />
              </div>
            </Tooltip>
            <Tooltip label="Success: Organization claimed">
              <div className="h-9 w-9 rounded-full border border-emerald-500/40 bg-emerald-500/15 flex items-center justify-center text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </Tooltip>
            <Tooltip label="Warning: Disconnecting removes org claims">
              <div className="h-9 w-9 rounded-full border border-amber-500/40 bg-amber-500/15 flex items-center justify-center text-amber-200">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </Tooltip>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Toast Notifications</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-md px-4 py-3 shadow-lg border border-blue-500/40 bg-blue-500/15 text-blue-100">
              <div className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Notification settings updated.
              </div>
            </div>
            <div className="rounded-md px-4 py-3 shadow-lg border border-emerald-500/40 bg-emerald-500/15 text-emerald-100">
              <div className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Organization claimed successfully.
              </div>
            </div>
            <div className="rounded-md px-4 py-3 shadow-lg border border-rose-500/40 bg-rose-500/15 text-rose-100">
              <div className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Disconnect failed. Try again.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
