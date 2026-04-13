import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_ROUTE_EVENT, getEffectiveAppRouteSegment, navigateAppRoute } from '../lib/captureNavigation';
import {
  EXTENSIONS_ALL_BASE,
  EXTENSIONS_PLUGINS_BASE,
  getExtensionsShellMode,
  type ExtensionsShellMode,
} from '../lib/extensionsRoutes';
import { ExtensionsAllMixedView } from './extensions/ExtensionsAllMixedView';
import { ExtensionsPluginsPanel } from './extensions/ExtensionsPluginsPanel';
import { ExtensionsSkillsPanel } from './extensions/ExtensionsSkillsPanel';
import type { ExtensionsBrowseControls, ExtensionsCatalogScope } from './extensions/ExtensionsShellSidebar';

export function ExtensionsScreen() {
  const location = useLocation();
  const [routeSegment, setRouteSegment] = useState(() => getEffectiveAppRouteSegment());

  useEffect(() => {
    const sync = () => setRouteSegment(getEffectiveAppRouteSegment());
    sync();
    window.addEventListener(APP_ROUTE_EVENT, sync);
    return () => window.removeEventListener(APP_ROUTE_EVENT, sync);
  }, [location.pathname, location.search]);

  const mode: ExtensionsShellMode = useMemo(() => getExtensionsShellMode(routeSegment), [routeSegment]);
  const [extensionsSearchQuery, setExtensionsSearchQuery] = useState('');
  const [extensionsScope, setExtensionsScope] = useState<ExtensionsCatalogScope>('all');

  /** Skills / All / MCP use the mixed catalog; Plugins uses the dedicated plugin marketplace panel. */
  const navigateForScope = useCallback((next: ExtensionsCatalogScope) => {
    if (next === 'plugins') {
      navigateAppRoute(`/${EXTENSIONS_PLUGINS_BASE}`);
    } else {
      navigateAppRoute(`/${EXTENSIONS_ALL_BASE}`);
    }
  }, []);

  const browseControls: ExtensionsBrowseControls = useMemo(
    () => ({
      searchQuery: extensionsSearchQuery,
      onSearchChange: setExtensionsSearchQuery,
      scope: extensionsScope,
      onScopeChange: (next) => {
        setExtensionsScope(next);
        navigateForScope(next);
      },
    }),
    [extensionsSearchQuery, extensionsScope, navigateForScope]
  );

  useEffect(() => {
    const path = routeSegment;
    if (path === EXTENSIONS_PLUGINS_BASE || path.startsWith(`${EXTENSIONS_PLUGINS_BASE}/`)) {
      setExtensionsScope('plugins');
    } else if (/^extensions\/skills\/skill\//.test(path)) {
      setExtensionsScope('skills');
    }
  }, [routeSegment]);

  if (mode === 'skills') {
    return (
      <ExtensionsSkillsPanel browseControls={browseControls} />
    );
  }
  if (mode === 'plugins') {
    return (
      <ExtensionsPluginsPanel browseControls={browseControls} />
    );
  }
  return (
    <ExtensionsAllMixedView browseControls={browseControls} />
  );
}
