import { useCallback, useMemo, useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { McpIcon } from '../../components/icons/McpIcon';
import { SearchInput } from '../../components/ui/search-input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { PluginToggle } from '../../components/ui/plugin-toggle';
import {
  mcpCatalogCategories,
  mcpCatalogEntries,
  mcpCatalogDisplayUrl,
  mcpModalInitialValuesFromCatalog,
  type McpCatalogEntry,
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
} from '../../lib/extensionsRoutes';
import { cn } from '../../lib/utils';
import { ExtensionsCatalogPageHeader } from './ExtensionsCatalogPageHeader';

function entryMatchesQuery(entry: McpCatalogEntry, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const categoryLabelMatch = entry.tags.some((tag) => {
    const label = mcpCatalogCategories.find((c) => c.slug === tag)?.name?.toLowerCase() ?? '';
    return label.includes(s);
  });
  const url = mcpCatalogDisplayUrl(entry, null).toLowerCase();
  return (
    entry.name.toLowerCase().includes(s) ||
    entry.description.toLowerCase().includes(s) ||
    url.includes(s) ||
    (entry.provider?.toLowerCase().includes(s) ?? false) ||
    entry.tags.some((t) => t.toLowerCase().includes(s)) ||
    categoryLabelMatch
  );
}

export function ExtensionsMcpPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
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

  const filtered = useMemo(() => {
    return mcpCatalogEntries.filter((entry) => {
      if (categorySlug && !entry.tags.includes(categorySlug)) return false;
      return entryMatchesQuery(entry, searchQuery);
    });
  }, [searchQuery, categorySlug]);

  const visible = useMemo(
    () => filtered.filter((e) => !removedMcpIds.has(e.id)),
    [filtered, removedMcpIds]
  );

  const description =
    'Browse recommended Model Context Protocol servers. Enable servers to expose tools and data to your agents.';

  return (
    <div className={cn(extensionsMainScrollClassName, 'h-full min-h-0 flex-1')}>
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
      <div className={extensionsPageContentClassName}>
        <ExtensionsCatalogPageHeader title="MCP servers" description={description}>
          <div className="max-w-lg">
            <SearchInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search by name, tag, or description"
              aria-label="Search MCP catalog"
              size="lg"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <button
              type="button"
              onClick={() => setCategorySlug(null)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                categorySlug === null
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted/60',
              )}
            >
              All
            </button>
            {mcpCatalogCategories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategorySlug(cat.slug === categorySlug ? null : cat.slug)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  categorySlug === cat.slug
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted/60',
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </ExtensionsCatalogPageHeader>

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
    </div>
  );
}
