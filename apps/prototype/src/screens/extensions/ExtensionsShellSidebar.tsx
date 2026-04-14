import { Box, Cloud, Layers3, Webhook } from 'lucide-react';
import { DocIconLink } from '../../components/common/DocIconLink';
import { SkillIcon } from '../../components/icons/SkillIcon';
import { SearchInput } from '../../components/ui/search-input';
import { navigateAppRoute } from '../../lib/captureNavigation';
import { EXTENSIONS_ALL_BASE, extensionsSectionStackGap } from '../../lib/extensionsRoutes';
import { cn } from '../../lib/utils';
import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

export type ExtensionsCatalogScope = 'all' | 'skills' | 'plugins' | 'mcp' | 'hooks';

export type ExtensionsBrowseControls = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  scope: ExtensionsCatalogScope;
  onScopeChange: (scope: ExtensionsCatalogScope) => void;
};

const SCOPE_ITEMS: { id: ExtensionsCatalogScope; label: string; icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }> }[] = [
  { id: 'all', label: 'All active', icon: Layers3 },
  { id: 'skills', label: 'Skills', icon: SkillIcon },
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
    <aside
      className={cn(
        'relative z-10 flex w-64 shrink-0 flex-col pt-[var(--settings-nav-padding-top)] pb-[var(--settings-nav-padding-bottom)]',
        extensionsSectionStackGap,
      )}
    >
      <div className="flex items-center justify-between gap-2 ml-1">
        <h2 className="text-xl font-semibold leading-6 text-foreground">Extensions</h2>
        <DocIconLink aria-label="Extensions documentation" />
      </div>
      {browseControls ? (
        <>
          <SearchInput
            value={browseControls.searchQuery}
            onValueChange={browseControls.onSearchChange}
            placeholder="Search…"
            aria-label="Search extensions"
            size="sm"
          />
          <nav className="flex flex-col gap-2" aria-label="Filter by type">
            {SCOPE_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = browseControls.scope === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => browseControls.onScopeChange(id)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-md px-[14px] py-2 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-muted/60 text-foreground'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-white' : 'text-muted-foreground group-hover:text-white',
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 truncate font-normal">{label}</span>
                </button>
              );
            })}
          </nav>
        </>
      ) : (
        <nav aria-label="Extensions scope">
          {isAllActive ? (
            <div
              className="flex w-full items-center gap-3 rounded-md px-[14px] py-2 text-left text-sm bg-muted/60 text-foreground"
              aria-current="page"
            >
              <Layers3 className="h-5 w-5 shrink-0 text-white" aria-hidden />
              <span className="font-normal">All active</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigateAppRoute(`/${EXTENSIONS_ALL_BASE}`)}
              className="group flex w-full items-center gap-3 rounded-md px-[14px] py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <Layers3 className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-white" aria-hidden />
              <span className="font-normal group-hover:text-white">All active</span>
            </button>
          )}
        </nav>
      )}
    </aside>
  );
}
