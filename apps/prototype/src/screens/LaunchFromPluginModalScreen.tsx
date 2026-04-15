import { useState } from 'react';
import { Box, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { showAppToast } from '../lib/appToast';

/**
 * Prototype: “Launch from plugin” modal — matches product layout with app design tokens
 * (secondary surface, border-border, primary CTA).
 */
export function LaunchFromPluginModalScreen() {
  const [open, setOpen] = useState(true);
  const [trusted, setTrusted] = useState(false);

  const handleStart = () => {
    if (!trusted) return;
    showAppToast({
      variant: 'success',
      message: 'Conversation started from plugin (prototype).',
    });
    setOpen(false);
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-xl font-semibold text-foreground">Launch from plugin modal</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Prototype: modal shown when launching a conversation from a plugin bundle.
        </p>
        <button
          type="button"
          className="mt-4 rounded-md border border-border bg-muted/40 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
          onClick={() => setOpen(true)}
        >
          Open modal
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[80vh] w-[min(500px,90vw)] max-w-[min(500px,90vw)] gap-0 overflow-hidden border-0 bg-transparent p-0 shadow-none [&>button]:hidden"
          aria-describedby={undefined}
        >
          <div
            data-testid="plugin-launch-modal"
            className="flex max-h-[80vh] min-h-0 w-[500px] max-w-[90vw] flex-col gap-4 rounded-xl border border-border bg-secondary p-6 text-foreground"
          >
            <div className="flex w-full items-center justify-between gap-3">
              <DialogTitle className="-tracking-[0.02em] text-left text-xl font-semibold leading-6 text-foreground">
                Launch Plugin
              </DialogTitle>
              <button
                type="button"
                className="cursor-pointer rounded-md p-1 text-foreground transition-colors hover:bg-muted"
                aria-label="Close"
                data-testid="close-button"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="text-sm font-medium text-foreground">vulnerability-remediation</span>
                </div>
                <div className="mt-2 text-xs text-foreground">
                  OpenHands/extensions
                  <span className="ml-1">/ plugins/vulnerability-remediation</span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-start gap-3">
                <input
                  id="trust-checkbox"
                  data-testid="trust-checkbox"
                  className="mt-1 h-4 w-4 flex-shrink-0 rounded border-border bg-background accent-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  type="checkbox"
                  checked={trusted}
                  onChange={(e) => setTrusted(e.target.checked)}
                />
                <label htmlFor="trust-checkbox" className="text-sm text-foreground">
                  I trust this skill from OpenHands/extensions with the agent secrets defined in my account.
                </label>
              </div>
              <div className="mt-8 flex w-full justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  data-testid="cancel-button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  data-testid="start-conversation-button"
                  disabled={!trusted}
                  onClick={handleStart}
                >
                  Start Conversation
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
