/**
 * Shared toast / ephemeral notification styling.
 * Use with {@link AppToaster} (`showAppToast`) and keep static demos aligned.
 */
export const TOAST_VIEWPORT_CLASS =
  'pointer-events-none fixed bottom-6 right-6 z-[200] flex max-w-sm flex-col gap-2 sm:max-w-md';

export const toastVariantSurfaceClasses = {
  success: 'border border-success/40 bg-success/15 text-success-foreground',
  error: 'border border-destructive/40 bg-destructive/15 text-destructive-foreground',
  info: 'border border-blue-500/40 bg-blue-500/15 text-blue-100',
} as const;

export type ToastVariant = keyof typeof toastVariantSurfaceClasses;

/** Icon + message; supports multi-line copy (global {@link AppToaster}). */
export const TOAST_SURFACE_APP_CLASS =
  'pointer-events-auto flex w-full min-w-0 items-start gap-3 rounded-md px-4 py-3 shadow-lg';

export const toastIconAccentClasses: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-destructive',
  info: 'text-blue-300',
};
