import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { APP_TOAST_EVENT, type AppToastPayload } from '../../lib/appToast';
import { cn } from '../../lib/utils';

type ToastItem = AppToastPayload & { id: number };

export function AppToaster() {
  const [toast, setToast] = useState<ToastItem | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<AppToastPayload>;
      if (ce.detail?.message) {
        setToast({ ...ce.detail, id: Date.now() });
      }
    };
    window.addEventListener(APP_TOAST_EVENT, handler);
    return () => window.removeEventListener(APP_TOAST_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[200] flex max-w-sm flex-col gap-2 sm:max-w-md"
      role="status"
      aria-live="polite"
    >
      <div
        key={toast.id}
        className={cn(
          'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm',
          toast.variant === 'success'
            ? 'border-emerald-500/35 bg-card text-foreground'
            : 'border-destructive/50 bg-card text-foreground'
        )}
      >
        {toast.variant === 'success' ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
        ) : (
          <XCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
        )}
        <p className="text-sm leading-snug">{toast.message}</p>
      </div>
    </div>
  );
}
