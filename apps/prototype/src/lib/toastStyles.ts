/**
 * Shared toast / ephemeral notification styling.
 * Use with {@link AppToaster} (`showAppToast`) and keep static demos aligned.
 */
export const TOAST_VIEWPORT_CLASS =
  'pointer-events-none fixed bottom-6 right-6 z-[200] flex max-w-sm flex-col gap-2 sm:max-w-md';

export const toastVariantSurfaceClasses = {
  success: 'border border-success/40 bg-success/15 text-success-foreground',
  error: 'border border-destructive/40 bg-destructive/15 text-destructive-foreground',
  info: 'border border-info/40 bg-info/15 text-info',
} as const;

export type ToastVariant = keyof typeof toastVariantSurfaceClasses;

/** Icon + message; supports multi-line copy (global {@link AppToaster}). */
export const TOAST_SURFACE_APP_CLASS =
  'pointer-events-auto flex w-full min-w-0 items-start gap-3 rounded-md px-4 py-3 shadow-lg';

/** `!` overrides global `svg.lucide { color: muted }` in index.css so toast icons match the variant. */
export const toastIconAccentClasses: Record<ToastVariant, string> = {
  success: '!text-success',
  error: '!text-destructive',
  info: '!text-info',
};
