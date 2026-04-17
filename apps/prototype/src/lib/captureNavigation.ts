import type { NavigateFunction } from 'react-router-dom';

export const APP_ROUTE_EVENT = 'app-routechange';

let navigateRef: NavigateFunction | null = null;

/** Registers React Router's navigate for use outside React components (e.g. flowcharts, utilities). */
export function registerAppNavigate(nav: NavigateFunction) {
  navigateRef = nav;
}

/**
 * Converts legacy or loose route input to a pathname (`/chat`, `/settings/llm`).
 * Accepts `#/chat`, `chat`, `/chat`, `settings/llm`.
 */
export function routeToPath(route: string): string {
  let r = route.trim();
  if (r.startsWith('#')) {
    r = r.slice(1);
  }
  r = r.replace(/^\/+/, '');
  if (!r) return '/';
  return `/${r}`;
}

/** Slash-free path for captureRoute / comparisons (e.g. `chat`, `settings/llm`). */
export function normalizeAppRoute(route: string): string {
  return routeToPath(route).replace(/^\/+/, '') || '';
}

/**
 * Same route segment logic as `App` sync: `captureRoute` query (Figma capture), else pathname,
 * else legacy `#/…` hash (excluding figmacapture).
 */
export function getEffectiveAppRouteSegment(): string {
  if (typeof window === 'undefined') return '';
  const pathname =
    window.location.protocol === 'file:'
      ? ''
      : window.location.pathname.replace(/^\/+/, '') || '';
  const legacyHash =
    window.location.hash.startsWith('#/') && !window.location.hash.startsWith('#figmacapture=')
      ? window.location.hash.slice(2).split(/[?&]/)[0] ?? ''
      : '';
  const captureRoute = new URLSearchParams(window.location.search).get('captureRoute');
  const normalizedCaptureRoute = captureRoute?.replace(/^\/+/, '') ?? '';
  const route = normalizedCaptureRoute ? normalizedCaptureRoute : pathname || legacyHash;
  return route.split('?')[0];
}

export function isFigmaCaptureActive(): boolean {
  return typeof window !== 'undefined' && window.location.hash.startsWith('#figmacapture=');
}

export function navigateAppRoute(route: string, options?: { replace?: boolean }) {
  const path = routeToPath(route);
  const normalizedForCapture = normalizeAppRoute(route);

  if (typeof window === 'undefined') {
    return;
  }

  if (isFigmaCaptureActive()) {
    const url = new URL(window.location.href);
    url.searchParams.set('captureRoute', normalizedForCapture);
    const historyMethod = options?.replace ? 'replaceState' : 'pushState';
    window.history[historyMethod]({}, '', `${url.pathname}${url.search}${window.location.hash}`);
    window.dispatchEvent(new Event(APP_ROUTE_EVENT));
    return;
  }

  if (navigateRef) {
    navigateRef(path, { replace: options?.replace });
  } else {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event(APP_ROUTE_EVENT));
  }
}

/** One-time migration from `#/…` bookmarks to path-based URLs (skips figma capture hashes). */
export function migrateHashRouteToPath(): void {
  if (typeof window === 'undefined') return;
  const { hash, pathname } = window.location;
  if (!hash.startsWith('#/') || hash.startsWith('#figmacapture=')) return;
  if (pathname !== '/' && pathname !== '') return;
  const inner = hash.slice(2).split('?')[0] ?? '';
  if (!inner) return;
  const next = routeToPath(inner);
  window.history.replaceState({}, '', `${next}${window.location.search}`);
}
