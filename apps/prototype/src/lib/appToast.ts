import type { ToastVariant } from './toastStyles';

/** Dispatched on `window` for global toasts (see `AppToaster`). */
export const APP_TOAST_EVENT = 'app-toast';

export type AppToastPayload = {
  variant: ToastVariant;
  message: string;
};

export function showAppToast(payload: AppToastPayload) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<AppToastPayload>(APP_TOAST_EVENT, { detail: payload }));
}
