import { Box, Layers3, Webhook } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DocIconLink } from '../../components/common/DocIconLink';
import { McpIcon } from '../../components/icons/McpIcon';
import { SkillIcon } from '../../components/icons/SkillIcon';
import { SearchInput } from '../../components/ui/search-input';
import { navigateAppRoute } from '../../lib/captureNavigation';
import { EXTENSIONS_ALL_BASE } from '../../lib/extensionsRoutes';
import { cn } from '../../lib/utils';
import { SidebarListNavItem, sidebarListNavRailClass } from '../../components/navigation/SidebarListNav';

export type ExtensionsCatalogScope = 'all' | 'skills' | 'plugins' | 'mcp' | 'hooks';

export type ExtensionsBrowseControls = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  scope: ExtensionsCatalogScope;
  onScopeChange: (scope: ExtensionsCatalogScope) => void;
};

const SCOPE_ITEMS: {
  id: ExtensionsCatalogScope;
  label: string;
  icon: LucideIcon | typeof SkillIcon | typeof McpIcon;
}[] = [
  { id: 'all', label: 'All active', icon: Layers3 },
  { id: 'skills', label: 'Skills', icon: SkillIcon },
  { id: 'plugins', label: 'Plugins', icon: Box },
  { id: 'mcp', label: 'MCP servers', icon: McpIcon },
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
    <aside className={cn(sidebarListNavRailClass, 'w-64 gap-4')}>
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
          <nav className="flex flex-col gap-0.5" aria-label="Filter by type">
            {SCOPE_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = browseControls.scope === id;
              return (
                <SidebarListNavItem
                  key={id}
                  icon={Icon}
                  active={isActive}
                  onClick={() => browseControls.onScopeChange(id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </SidebarListNavItem>
              );
            })}
          </nav>
        </>
      ) : (
        <nav aria-label="Extensions scope">
          {isAllActive ? (
            <div
              className="flex w-full min-w-0 items-center gap-2 rounded-md bg-muted/60 px-2 py-2 text-left text-xs text-white"
              aria-current="page"
            >
              <Layers3 className="h-4 w-4 shrink-0 text-white" aria-hidden />
              <span className="min-w-0 truncate font-normal">All active</span>
            </div>
          ) : (
            <SidebarListNavItem
              icon={Layers3}
              active={false}
              onClick={() => navigateAppRoute(`/${EXTENSIONS_ALL_BASE}`)}
            >
              All active
            </SidebarListNavItem>
          )}
        </nav>
      )}
    </aside>
  );
}
