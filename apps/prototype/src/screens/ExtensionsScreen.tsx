import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_ROUTE_EVENT, getEffectiveAppRouteSegment, navigateAppRoute } from '../lib/captureNavigation';
import {
  EXTENSIONS_ALL_BASE,
  EXTENSIONS_HOOKS_BASE,
  EXTENSIONS_MCP_BASE,
  EXTENSIONS_PLUGINS_BASE,
  EXTENSIONS_SKILLS_BASE,
  getExtensionsShellMode,
  type ExtensionsShellMode,
} from '../lib/extensionsRoutes';
import { ExtensionsAllMixedView } from './extensions/ExtensionsAllMixedView';
import { ExtensionsHooksPanel } from './extensions/ExtensionsHooksPanel';
import { ExtensionsMcpPanel } from './extensions/ExtensionsMcpPanel';
import { ExtensionsPluginsPanel } from './extensions/ExtensionsPluginsPanel';
import { ExtensionsSkillsPanel } from './extensions/ExtensionsSkillsPanel';
import type { ExtensionsBrowseControls, ExtensionsCatalogScope } from './extensions/ExtensionsShellSidebar';

/** Map URL to sidebar scope so the left list matches the address bar. */
function extensionsScopeFromPath(segment: string): ExtensionsCatalogScope {
  const p = (segment.split('?')[0] ?? '').replace(/^\/+/, '');
  if (p === EXTENSIONS_PLUGINS_BASE || p.startsWith(`${EXTENSIONS_PLUGINS_BASE}/`)) return 'plugins';
  if (p === EXTENSIONS_SKILLS_BASE || p.startsWith(`${EXTENSIONS_SKILLS_BASE}/`)) return 'skills';
  if (p === EXTENSIONS_MCP_BASE || p.startsWith(`${EXTENSIONS_MCP_BASE}/`)) return 'mcp';
  if (p === EXTENSIONS_HOOKS_BASE || p.startsWith(`${EXTENSIONS_HOOKS_BASE}/`)) return 'hooks';
  return 'all';
}

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
  const [extensionsScope, setExtensionsScope] = useState<ExtensionsCatalogScope>(() =>
    extensionsScopeFromPath(getEffectiveAppRouteSegment())
  );

  const navigateForScope = useCallback((next: ExtensionsCatalogScope) => {
    if (next === 'plugins') {
      navigateAppRoute(`/${EXTENSIONS_PLUGINS_BASE}`);
    } else if (next === 'skills') {
      navigateAppRoute(`/${EXTENSIONS_SKILLS_BASE}`);
    } else if (next === 'mcp') {
      navigateAppRoute(`/${EXTENSIONS_MCP_BASE}`);
    } else if (next === 'hooks') {
      navigateAppRoute(`/${EXTENSIONS_HOOKS_BASE}`);
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
    setExtensionsScope(extensionsScopeFromPath(routeSegment));
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
  if (mode === 'mcp') {
    return <ExtensionsMcpPanel browseControls={browseControls} />;
  }
  if (mode === 'hooks') {
    return <ExtensionsHooksPanel browseControls={browseControls} />;
  }
  return (
    <ExtensionsAllMixedView browseControls={browseControls} />
  );
}
