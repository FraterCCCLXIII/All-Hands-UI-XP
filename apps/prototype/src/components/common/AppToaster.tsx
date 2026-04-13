import { useEffect, useState } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { APP_TOAST_EVENT, type AppToastPayload } from '../../lib/appToast';
import {
  TOAST_SURFACE_APP_CLASS,
  TOAST_VIEWPORT_CLASS,
  toastIconAccentClasses,
  toastVariantSurfaceClasses,
} from '../../lib/toastStyles';
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

  const variant = toast.variant;

  return (
    <div className={TOAST_VIEWPORT_CLASS} role="status" aria-live="polite">
      <div
        key={toast.id}
        className={cn(TOAST_SURFACE_APP_CLASS, toastVariantSurfaceClasses[variant])}
      >
        {variant === 'success' ? (
          <CheckCircle2 className={cn('h-5 w-5 shrink-0', toastIconAccentClasses.success)} aria-hidden />
        ) : variant === 'error' ? (
          <XCircle className={cn('h-5 w-5 shrink-0', toastIconAccentClasses.error)} aria-hidden />
        ) : (
          <Info className={cn('h-5 w-5 shrink-0', toastIconAccentClasses.info)} aria-hidden />
        )}
        <p className="min-w-0 flex-1 text-sm leading-snug">{toast.message}</p>
      </div>
    </div>
  );
}
