import { useCallback, useMemo, useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { McpIcon } from '../../components/icons/McpIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { PluginToggle } from '../../components/ui/plugin-toggle';
import {
  mcpCatalogEntries,
  mcpCatalogDisplayUrl,
  mcpModalInitialValuesFromCatalog,
  type McpConnectionOverride,
} from '../../data/mcpCatalog';
import { AddMcpServerModal } from './extensionsCatalogAddModals';
import {
  extensionsCatalogCardBodyPrWithControlCluster,
  extensionsCatalogCardControlClusterClassName,
  extensionsCatalogCardControlsClassName,
  extensionsCatalogCardMenuSlotClassName,
  extensionsCatalogCardOverflowMenuTriggerClassName,
  extensionsMainScrollClassName,
  extensionsPageContentClassName,
  extensionsShellRowClassName,
} from '../../lib/extensionsRoutes';
import { cn } from '../../lib/utils';
import { ExtensionsAnimatedMain } from './ExtensionsAnimatedMain';
import { ExtensionsCatalogAddButton } from './ExtensionsCatalogAddButton';
import { ExtensionsCatalogPageHeader } from './ExtensionsCatalogPageHeader';
import { ExtensionsShellSidebar, type ExtensionsBrowseControls } from './ExtensionsShellSidebar';

export type ExtensionsMcpPanelProps = {
  browseControls: ExtensionsBrowseControls;
};

export function ExtensionsMcpPanel({ browseControls }: ExtensionsMcpPanelProps) {
  const [mcpSwitchById, setMcpSwitchById] = useState<Record<string, boolean>>({});
  const [removedMcpIds, setRemovedMcpIds] = useState<Set<string>>(() => new Set());
  const [mcpOverridesById, setMcpOverridesById] = useState<Record<string, McpConnectionOverride>>({});
  const [mcpEditOpen, setMcpEditOpen] = useState(false);
  const [mcpEditingId, setMcpEditingId] = useState<string | null>(null);

  const closeMcpEdit = useCallback(() => {
    setMcpEditOpen(false);
    setMcpEditingId(null);
  }, []);

  const mcpEditingEntry = useMemo(
    () => (mcpEditingId ? mcpCatalogEntries.find((e) => e.id === mcpEditingId) ?? null : null),
    [mcpEditingId]
  );

  const visible = useMemo(
    () => mcpCatalogEntries.filter((e) => !removedMcpIds.has(e.id)),
    [removedMcpIds]
  );

  const description =
    'Browse recommended Model Context Protocol servers. Enable servers to expose tools and data to your agents.';

  return (
    <div className={extensionsShellRowClassName}>
      <AddMcpServerModal
        open={mcpEditOpen && mcpEditingId !== null && mcpEditingEntry !== null}
        onOpenChange={(open) => {
          if (!open) closeMcpEdit();
        }}
        editingId={mcpEditingId}
        initialValues={
          mcpEditingEntry
            ? mcpModalInitialValuesFromCatalog(
                mcpEditingEntry,
                mcpEditingId ? mcpOverridesById[mcpEditingId] ?? null : null
              )
            : null
        }
        onEdit={(id, payload) => {
          setMcpOverridesById((prev) => {
            const prior = prev[id];
            const hasApiKey =
              payload.apiKey.trim().length > 0 ? true : prior?.hasApiKey ?? false;
            return {
              ...prev,
              [id]: {
                name: payload.name,
                serverType: payload.serverType,
                url: payload.url,
                hasApiKey,
              },
            };
          });
        }}
      />
      <ExtensionsShellSidebar browseControls={browseControls} />

      <ExtensionsAnimatedMain className={cn(extensionsMainScrollClassName, 'repo-dropdown-scroll')}>
        <div className={extensionsPageContentClassName}>
        <ExtensionsCatalogPageHeader
          title="MCP servers"
          description={description}
          actions={<ExtensionsCatalogAddButton kind="mcp" />}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((entry) => {
            const displayName = mcpOverridesById[entry.id]?.name ?? entry.name;
            const displayUrl = mcpCatalogDisplayUrl(entry, mcpOverridesById[entry.id] ?? null);
            const enabled = mcpSwitchById[entry.id] !== false;
            return (
              <div
                key={entry.id}
                className="relative rounded-xl border border-border bg-card transition-colors hover:bg-muted/60"
              >
                <div
                  className={cn(
                    extensionsCatalogCardControlsClassName,
                    extensionsCatalogCardControlClusterClassName,
                  )}
                >
                  <PluginToggle
                    size="sm"
                    checked={enabled}
                    onCheckedChange={() =>
                      setMcpSwitchById((prev) => ({
                        ...prev,
                        [entry.id]: !(prev[entry.id] !== false),
                      }))
                    }
                    aria-label={enabled ? `Turn off ${displayName}` : `Turn on ${displayName}`}
                  />
                  <div className={extensionsCatalogCardMenuSlotClassName}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={extensionsCatalogCardOverflowMenuTriggerClassName}
                          aria-label={`${displayName} options`}
                        >
                          <MoreVertical className="h-4 w-4 shrink-0" aria-hidden />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2"
                          onSelect={() => {
                            setMcpEditingId(entry.id);
                            setMcpEditOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          onSelect={() =>
                            setRemovedMcpIds((prev) => new Set(prev).add(entry.id))
                          }
                        >
                          <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div
                  className={cn(
                    'w-full rounded-xl p-5 pt-5 text-left',
                    extensionsCatalogCardBodyPrWithControlCluster,
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                      <McpIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-base font-medium text-foreground">{displayName}</span>
                      <p className="mt-2 line-clamp-2 break-all text-sm text-muted-foreground" title={displayUrl}>
                        {displayUrl}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No servers match your search.</p>
        ) : null}
        </div>
      </ExtensionsAnimatedMain>
    </div>
  );
}
