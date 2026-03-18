export const APP_ROUTE_EVENT = 'app-routechange';

export function isFigmaCaptureActive(): boolean {
  return typeof window !== 'undefined' && window.location.hash.startsWith('#figmacapture=');
}

export function normalizeAppRoute(route: string): string {
  return route.replace(/^#\/?/, '').replace(/^\/+/, '');
}

export function navigateAppRoute(route: string, options?: { replace?: boolean }) {
  const normalizedRoute = normalizeAppRoute(route);

  if (typeof window === 'undefined') {
    return;
  }

  if (isFigmaCaptureActive()) {
    const url = new URL(window.location.href);
    url.searchParams.set('captureRoute', normalizedRoute);
    const historyMethod = options?.replace ? 'replaceState' : 'pushState';
    window.history[historyMethod]({}, '', `${url.pathname}${url.search}${window.location.hash}`);
    window.dispatchEvent(new Event(APP_ROUTE_EVENT));
    return;
  }

  const normalizedHash = route.startsWith('#')
    ? route.startsWith('#/') ? route : `#/${route.replace(/^#+/, '')}`
    : `#/${normalizedRoute}`;

  window.location.hash = normalizedHash;
}
