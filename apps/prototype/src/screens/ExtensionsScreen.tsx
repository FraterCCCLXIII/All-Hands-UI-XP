import { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_ROUTE_EVENT, navigateAppRoute } from '../lib/captureNavigation';
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

function readShellMode(): ExtensionsShellMode {
  return getExtensionsShellMode(window.location.hash);
}

export function ExtensionsScreen() {
  const [mode, setMode] = useState<ExtensionsShellMode>(readShellMode);
  const [extensionsSearchQuery, setExtensionsSearchQuery] = useState('');
  const [extensionsScope, setExtensionsScope] = useState<ExtensionsCatalogScope>('all');

  /** Skills / All / MCP use the mixed catalog; Plugins uses the dedicated plugin marketplace panel. */
  const navigateForScope = useCallback((next: ExtensionsCatalogScope) => {
    if (next === 'plugins') {
      navigateAppRoute(`#/${EXTENSIONS_PLUGINS_BASE}`);
    } else {
      navigateAppRoute(`#/${EXTENSIONS_ALL_BASE}`);
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
    const sync = () => {
      setMode(readShellMode());
      const path = window.location.hash.replace(/^#\/?/, '').split('?')[0] ?? '';
      if (path === EXTENSIONS_PLUGINS_BASE || path.startsWith(`${EXTENSIONS_PLUGINS_BASE}/`)) {
        setExtensionsScope('plugins');
      } else if (/^extensions\/skills\/skill\//.test(path)) {
        setExtensionsScope('skills');
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    window.addEventListener(APP_ROUTE_EVENT, sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener(APP_ROUTE_EVENT, sync);
    };
  }, []);

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
