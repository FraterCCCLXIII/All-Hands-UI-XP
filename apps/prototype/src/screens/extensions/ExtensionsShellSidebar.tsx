import { BookOpen, Box, Cloud, Package, Sparkles, Webhook } from 'lucide-react';
import { SearchInput } from '../../components/ui/search-input';
import { navigateAppRoute } from '../../lib/captureNavigation';
import { EXTENSIONS_ALL_BASE } from '../../lib/extensionsRoutes';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

export type ExtensionsCatalogScope = 'all' | 'skills' | 'plugins' | 'mcp' | 'hooks';

export type ExtensionsBrowseControls = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  scope: ExtensionsCatalogScope;
  onScopeChange: (scope: ExtensionsCatalogScope) => void;
};

const SCOPE_ITEMS: { id: ExtensionsCatalogScope; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'All active', icon: Package },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'plugins', label: 'Plugins', icon: Box },
  { id: 'mcp', label: 'MCP servers', icon: Cloud },
  { id: 'hooks', label: 'Hooks', icon: Webhook },
];

export type ExtensionsShellSidebarProps = {
  /** When true, the user is on the mixed “All active” catalog (`#/extensions/all`). */
  isAllActive?: boolean;
  /** Search + scope filters for the mixed catalog (`#/extensions/all`). */
  browseControls?: ExtensionsBrowseControls;
};

export function ExtensionsShellSidebar({
  isAllActive = false,
  browseControls,
}: ExtensionsShellSidebarProps) {
  return (
    <aside className="flex w-64 flex-shrink-0 flex-col">
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold text-foreground">Extensions</h1>
          <a
            href="https://docs.openhands.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Extensions documentation"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
          </a>
        </div>
        {browseControls ? (
          <>
            <div className="mt-3">
              <SearchInput
                value={browseControls.searchQuery}
                onValueChange={browseControls.onSearchChange}
                placeholder="Search…"
                aria-label="Search extensions"
                size="sm"
              />
            </div>
            <nav className="mt-3 space-y-1" aria-label="Filter by type">
              {SCOPE_ITEMS.map(({ id, label, icon: Icon }) => {
                const isActive = browseControls.scope === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => browseControls.onScopeChange(id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                      isActive
                        ? 'bg-muted/80 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="min-w-0 truncate">{label}</span>
                  </button>
                );
              })}
            </nav>
          </>
        ) : (
          <nav className="mt-4" aria-label="Extensions scope">
            {isAllActive ? (
              <div
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm bg-muted/80 text-foreground"
                aria-current="page"
              >
                <Package className="h-4 w-4 shrink-0" aria-hidden />
                <span>All active</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigateAppRoute(`/${EXTENSIONS_ALL_BASE}`)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm bg-muted/80 text-foreground transition-colors hover:bg-muted/70"
              >
                <Package className="h-4 w-4 shrink-0" aria-hidden />
                <span>All active</span>
              </button>
            )}
          </nav>
        )}
      </div>
    </aside>
  );
}
