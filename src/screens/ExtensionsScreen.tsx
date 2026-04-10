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

export type ExtensionsScreenProps = {
  installedPluginRepos: string[];
};

function readShellMode(): ExtensionsShellMode {
  return getExtensionsShellMode(window.location.hash);
}

export function ExtensionsScreen({ installedPluginRepos }: ExtensionsScreenProps) {
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

  const footerExtra =
    installedPluginRepos.length > 0 ? (
      <p className="mt-3 text-xs text-muted-foreground">
        {installedPluginRepos.length} activated repo
        {installedPluginRepos.length === 1 ? '' : 's'} linked in Settings.
      </p>
    ) : null;

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
      <ExtensionsSkillsPanel browseControls={browseControls} footerExtra={footerExtra} />
    );
  }
  if (mode === 'plugins') {
    return (
      <ExtensionsPluginsPanel browseControls={browseControls} footerExtra={footerExtra} />
    );
  }
  return (
    <ExtensionsAllMixedView browseControls={browseControls} footerExtra={footerExtra} />
  );
}
