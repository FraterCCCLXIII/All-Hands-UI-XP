import { useCallback, useMemo, useState } from 'react';
import { Grid2x2Plus, MoreVertical, Pencil, Trash2, Webhook } from 'lucide-react';
import { McpIcon } from '../../components/icons/McpIcon';
import { NutIcon } from '../../components/icons/NutIcon';
import { SkillIcon } from '../../components/icons/SkillIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { PluginToggle } from '../../components/ui/plugin-toggle';
import { marketplaceSkills } from '../../data/skillsPageData';
import {
  addOnCatalogEntries,
  addOnCatalogEntryMatchesQuery,
  type AddOnCatalogEntry,
} from '../../data/addOnsCatalog';
import {
  hooksCatalogCategories,
  hooksCatalogEntries,
  hooksCatalogDisplaySubtext,
  type HookRecipeOverride,
  type HooksCatalogEntry,
} from '../../data/hooksCatalog';
import {
  webhookCatalogEntries,
  webhooksCatalogEntryMatchesQuery,
  type WebhookCatalogEntry,
} from '../../data/webhooksCatalog';
import {
  mcpCatalogCategories,
  mcpCatalogEntries,
  mcpCatalogDisplayUrl,
  mcpModalInitialValuesFromCatalog,
  type McpCatalogEntry,
  type McpConnectionOverride,
} from '../../data/mcpCatalog';
import { navigateAppRoute } from '../../lib/captureNavigation';
import {
  EXTENSIONS_PLUGINS_BASE,
  EXTENSIONS_SKILLS_BASE,
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
import { AddHookModal, AddMcpServerModal, WebhookSetupModal } from './extensionsCatalogAddModals';
import { ExtensionsCatalogPageHeader } from './ExtensionsCatalogPageHeader';
import { getSkillSource, SkillSourceBadge } from './SkillSourceBadge';
import { ExtensionsAnimatedMain } from './ExtensionsAnimatedMain';
import { ExtensionsShellSidebar, type ExtensionsBrowseControls } from './ExtensionsShellSidebar';

function skillMatchesQuery(
  skill: (typeof marketplaceSkills)[number],
  q: string
): boolean {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const name = (skill.skillName ?? skill.title).toLowerCase();
  return name.includes(s) || skill.description.toLowerCase().includes(s);
}

function mcpMatchesQuery(entry: McpCatalogEntry, q: string): boolean {
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

function hooksMatchesQuery(entry: HooksCatalogEntry, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const categoryLabelMatch = entry.tags.some((tag) => {
    const label = hooksCatalogCategories.find((c) => c.slug === tag)?.name?.toLowerCase() ?? '';
    return label.includes(s);
  });
  const sub = hooksCatalogDisplaySubtext(entry, null).toLowerCase();
  return (
    entry.name.toLowerCase().includes(s) ||
    entry.description.toLowerCase().includes(s) ||
    sub.includes(s) ||
    entry.eventType.toLowerCase().includes(s) ||
    entry.configKey.toLowerCase().includes(s) ||
    entry.matcherHint.toLowerCase().includes(s) ||
    entry.tags.some((t) => t.toLowerCase().includes(s)) ||
    categoryLabelMatch
  );
}

export type ExtensionsAllMixedViewProps = {
  browseControls: ExtensionsBrowseControls;
};

export function ExtensionsAllMixedView({ browseControls }: ExtensionsAllMixedViewProps) {
  /** Enabled state for marketplace skills and plugins (toggle on cards). */
  const [marketplaceSwitchById, setMarketplaceSwitchById] = useState<Record<string, boolean>>({});
  const [mcpSwitchById, setMcpSwitchById] = useState<Record<string, boolean>>({});
  const [removedMcpIds, setRemovedMcpIds] = useState<Set<string>>(() => new Set());
  const [mcpOverridesById, setMcpOverridesById] = useState<Record<string, McpConnectionOverride>>({});
  const [mcpEditOpen, setMcpEditOpen] = useState(false);
  const [mcpEditingId, setMcpEditingId] = useState<string | null>(null);
  const [hookSwitchById, setHookSwitchById] = useState<Record<string, boolean>>({});
  const [removedHookIds, setRemovedHookIds] = useState<Set<string>>(() => new Set());
  const [hookOverridesById, setHookOverridesById] = useState<Record<string, HookRecipeOverride>>({});
  const [hookEditOpen, setHookEditOpen] = useState(false);
  const [hookEditingId, setHookEditingId] = useState<string | null>(null);
  const [webhookSwitchById, setWebhookSwitchById] = useState<Record<string, boolean>>({});
  const [removedWebhookIds, setRemovedWebhookIds] = useState<Set<string>>(() => new Set());
  const [webhookCommandById, setWebhookCommandById] = useState<Record<string, string>>({});
  const [webhookEditOpen, setWebhookEditOpen] = useState(false);
  const [webhookEditingId, setWebhookEditingId] = useState<string | null>(null);
  const [addOnSwitchById, setAddOnSwitchById] = useState<Record<string, boolean>>({});
  const [removedAddOnIds, setRemovedAddOnIds] = useState<Set<string>>(() => new Set());
  const { searchQuery, scope } = browseControls;

  const closeMcpEdit = useCallback(() => {
    setMcpEditOpen(false);
    setMcpEditingId(null);
  }, []);

  const closeHookEdit = useCallback(() => {
    setHookEditOpen(false);
    setHookEditingId(null);
  }, []);

  const mcpEditingEntry = useMemo(
    () => (mcpEditingId ? mcpCatalogEntries.find((e) => e.id === mcpEditingId) ?? null : null),
    [mcpEditingId]
  );

  const hookEditingEntry = useMemo(
    () => (hookEditingId ? hooksCatalogEntries.find((e) => e.id === hookEditingId) ?? null : null),
    [hookEditingId]
  );

  const webhookEditingEntry = useMemo(
    () => (webhookEditingId ? webhookCatalogEntries.find((entry) => entry.id === webhookEditingId) ?? null : null),
    [webhookEditingId]
  );

  const filteredSkills = useMemo(
    () => marketplaceSkills.filter((skill) => skillMatchesQuery(skill, searchQuery)),
    [searchQuery]
  );
  const filteredMcp = useMemo(
    () => mcpCatalogEntries.filter((e) => mcpMatchesQuery(e, searchQuery)),
    [searchQuery]
  );
  const visibleMcp = useMemo(
    () => filteredMcp.filter((e) => !removedMcpIds.has(e.id)),
    [filteredMcp, removedMcpIds]
  );
  const filteredHooks = useMemo(
    () => hooksCatalogEntries.filter((e) => hooksMatchesQuery(e, searchQuery)),
    [searchQuery]
  );
  const visibleHooks = useMemo(
    () => filteredHooks.filter((e) => !removedHookIds.has(e.id)),
    [filteredHooks, removedHookIds]
  );
  const filteredWebhooks = useMemo(
    () => webhookCatalogEntries.filter((entry) => webhooksCatalogEntryMatchesQuery(entry, searchQuery)),
    [searchQuery]
  );
  const visibleWebhooks = useMemo(
    () => filteredWebhooks.filter((entry) => !removedWebhookIds.has(entry.id)),
    [filteredWebhooks, removedWebhookIds]
  );
  const filteredAddOns = useMemo(
    () => addOnCatalogEntries.filter((entry) => addOnCatalogEntryMatchesQuery(entry, searchQuery)),
    [searchQuery]
  );
  const visibleAddOns = useMemo(
    () => filteredAddOns.filter((entry) => !removedAddOnIds.has(entry.id)),
    [filteredAddOns, removedAddOnIds]
  );

  /** Skills-only rows (non-plugin marketplace items). */
  const skillCatalogItems = useMemo(() => {
    if (scope === 'plugins' || scope === 'addons' || scope === 'hooks' || scope === 'webhooks') return [];
    return filteredSkills.filter((s) => s.isPlugin !== true);
  }, [filteredSkills, scope]);

  /** Plugin rows (`isPlugin`). */
  const pluginCatalogItems = useMemo(() => {
    if (scope === 'skills' || scope === 'addons' || scope === 'hooks' || scope === 'webhooks') return [];
    return filteredSkills.filter((s) => s.isPlugin === true);
  }, [filteredSkills, scope]);

  const showSkillsSection =
    scope === 'all' || scope === 'skills' || scope === 'plugins';
  const showAddOnsSection = scope === 'all' || scope === 'addons';
  const showMcpSection = scope === 'all' || scope === 'mcp';
  const showHooksSection = scope === 'all' || scope === 'hooks';
  const showWebhooksSection = scope === 'all' || scope === 'webhooks';

  const renderMarketplaceCard = (skill: (typeof marketplaceSkills)[number]) => {
    const label = skill.skillName ?? skill.title;
    const locked = skill.switchLocked === true;
    const enabled = locked ? true : marketplaceSwitchById[skill.id] !== false;
    const showPluginToggle =
      skill.isPlugin === true && (scope === 'all' || scope === 'plugins');
    const showSkillToggle =
      skill.isPlugin !== true && (scope === 'all' || scope === 'skills');
    const showToggle = showPluginToggle || showSkillToggle;
    const source = getSkillSource(skill);
    return (
      <div
        key={skill.id}
        className="relative rounded-xl border border-border bg-card transition-colors hover:bg-muted/60"
      >
        {showToggle ? (
          <div
            className={cn(
              extensionsCatalogCardControlsClassName,
              extensionsCatalogCardControlClusterClassName,
            )}
          >
            <PluginToggle
              size="sm"
              checked={enabled}
              locked={locked}
              onCheckedChange={() =>
                setMarketplaceSwitchById((prev) => ({
                  ...prev,
                  [skill.id]: !(prev[skill.id] !== false),
                }))
              }
              aria-label={
                locked
                  ? `${label} is on and locked by your organization`
                  : enabled
                    ? `Turn off ${label}`
                    : `Turn on ${label}`
              }
            />
            <div className={extensionsCatalogCardMenuSlotClassName} aria-hidden />
          </div>
        ) : null}
        <button
          type="button"
          onClick={() =>
            navigateAppRoute(
              skill.isPlugin === true
                ? `/${EXTENSIONS_PLUGINS_BASE}/plugin/${encodeURIComponent(skill.id)}`
                : `/${EXTENSIONS_SKILLS_BASE}/skill/${encodeURIComponent(skill.id)}`
            )
          }
          className={cn(
            'w-full rounded-xl p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
            showToggle && extensionsCatalogCardBodyPrWithControlCluster
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
              <SkillIcon className="h-5 text-muted-foreground" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-base font-medium text-foreground">{label}</span>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{skill.description}</p>
              <div className="mt-3 hidden" aria-hidden>
                <SkillSourceBadge source={source} />
              </div>
            </div>
          </div>
        </button>
      </div>
    );
  };

  const renderAddOnCard = (entry: AddOnCatalogEntry) => {
    const enabled = addOnSwitchById[entry.id] !== false;
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
              setAddOnSwitchById((prev) => ({
                ...prev,
                [entry.id]: !(prev[entry.id] !== false),
              }))
            }
            aria-label={enabled ? `Turn off ${entry.name}` : `Turn on ${entry.name}`}
          />
          <div className={extensionsCatalogCardMenuSlotClassName}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={extensionsCatalogCardOverflowMenuTriggerClassName}
                  aria-label={`${entry.name} options`}
                >
                  <MoreVertical className="h-4 w-4 shrink-0" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="gap-2"
                  onSelect={() => setRemovedAddOnIds((prev) => new Set(prev).add(entry.id))}
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
              <Grid2x2Plus className="h-5 w-5 text-muted-foreground" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-base font-medium text-foreground">{entry.name}</span>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{entry.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMcpCard = (entry: McpCatalogEntry) => {
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
            aria-label={
              enabled ? `Turn off ${displayName}` : `Turn on ${displayName}`
            }
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
  };

  const renderHooksCard = (entry: HooksCatalogEntry) => {
    const displayName = hookOverridesById[entry.id]?.name ?? entry.name;
    const subtext = hooksCatalogDisplaySubtext(entry, hookOverridesById[entry.id] ?? null);
    const enabled = hookSwitchById[entry.id] !== false;
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
              setHookSwitchById((prev) => ({
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
                    setHookEditingId(entry.id);
                    setHookEditOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2"
                  onSelect={() =>
                    setRemovedHookIds((prev) => new Set(prev).add(entry.id))
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
              <NutIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-base font-medium text-foreground">{displayName}</span>
              <p className="mt-2 line-clamp-2 break-all text-sm text-muted-foreground" title={subtext}>
                {subtext}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWebhookCard = (entry: WebhookCatalogEntry) => {
    const enabled = webhookSwitchById[entry.id] !== false;
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
              setWebhookSwitchById((prev) => ({
                ...prev,
                [entry.id]: !(prev[entry.id] !== false),
              }))
            }
            aria-label={enabled ? `Turn off ${entry.name}` : `Turn on ${entry.name}`}
          />
          <div className={extensionsCatalogCardMenuSlotClassName}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={extensionsCatalogCardOverflowMenuTriggerClassName}
                  aria-label={`${entry.name} options`}
                >
                  <MoreVertical className="h-4 w-4 shrink-0" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="gap-2"
                  onSelect={() => {
                    setWebhookEditingId(entry.id);
                    setWebhookEditOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2"
                  onSelect={() => setRemovedWebhookIds((prev) => new Set(prev).add(entry.id))}
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
              <Webhook className="h-5 w-5 text-muted-foreground" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-base font-medium text-foreground">{entry.name}</span>
              <p className="mt-2 line-clamp-2 break-all text-sm text-muted-foreground" title={entry.endpoint}>
                {entry.endpoint}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const mcpList = (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleMcp.map(renderMcpCard)}
      </div>
      {visibleMcp.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No MCP servers match your search.</p>
      ) : null}
    </>
  );

  const hooksList = (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleHooks.map(renderHooksCard)}
      </div>
      {visibleHooks.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No hook patterns match your search.</p>
      ) : null}
    </>
  );

  const webhooksList = (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleWebhooks.map(renderWebhookCard)}
      </div>
      {visibleWebhooks.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No webhooks match your search.</p>
      ) : null}
    </>
  );

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
      <AddHookModal
        open={hookEditOpen && hookEditingId !== null && hookEditingEntry !== null}
        onOpenChange={(open) => {
          if (!open) closeHookEdit();
        }}
        editingId={hookEditingId}
        initialValues={
          hookEditingEntry
            ? {
                name: hookOverridesById[hookEditingEntry.id]?.name ?? hookEditingEntry.name,
                notes:
                  hookOverridesById[hookEditingEntry.id]?.notes ??
                  hooksCatalogDisplaySubtext(hookEditingEntry, null),
              }
            : null
        }
        onEdit={(id, payload) => {
          setHookOverridesById((prev) => ({
            ...prev,
            [id]: { name: payload.name, notes: payload.instructions },
          }));
        }}
      />
      <WebhookSetupModal
        open={webhookEditOpen && webhookEditingId !== null && webhookEditingEntry !== null}
        onOpenChange={(open) => {
          setWebhookEditOpen(open);
          if (!open) setWebhookEditingId(null);
        }}
        editingId={webhookEditingId}
        initialValues={
          webhookEditingEntry
            ? {
                name: webhookEditingEntry.name,
                command: webhookCommandById[webhookEditingEntry.id],
              }
            : null
        }
        onSave={(id, payload) => {
          if (!id) return;
          setWebhookCommandById((prev) => ({ ...prev, [id]: payload.command }));
        }}
      />
      <ExtensionsShellSidebar browseControls={browseControls} />

      <ExtensionsAnimatedMain className={cn('repo-dropdown-scroll', extensionsMainScrollClassName)}>
        <div
          className={cn(
            extensionsPageContentClassName,
            /* Wider separation between extension groups on the combined catalog. */
            scope === 'all' && 'gap-12',
          )}
        >
        <>
            {showSkillsSection && (scope === 'all' || scope === 'skills') && (
              <section aria-labelledby="ext-skills-heading" className="flex flex-col gap-4">
                <ExtensionsCatalogPageHeader
                  titleId="ext-skills-heading"
                  title="Skills"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {skillCatalogItems.map(renderMarketplaceCard)}
                </div>
                {skillCatalogItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No skills match your search.</p>
                ) : null}
              </section>
            )}

            {showSkillsSection && (scope === 'all' || scope === 'plugins') && (
              <section aria-labelledby="ext-plugins-heading" className="flex flex-col gap-4">
                <ExtensionsCatalogPageHeader
                  titleId="ext-plugins-heading"
                  title="Plugins"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {pluginCatalogItems.map(renderMarketplaceCard)}
                </div>
                {pluginCatalogItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No plugins match your search.</p>
                ) : null}
              </section>
            )}

            {showAddOnsSection && (
              <section aria-labelledby="ext-add-ons-heading" className="flex flex-col gap-4">
                <ExtensionsCatalogPageHeader
                  titleId="ext-add-ons-heading"
                  title="Add-Ons"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {visibleAddOns.map(renderAddOnCard)}
                </div>
                {visibleAddOns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No add-ons match your search.</p>
                ) : null}
              </section>
            )}

            {showMcpSection && (
              <section aria-labelledby="ext-mcp-heading" className="flex flex-col gap-4">
                <ExtensionsCatalogPageHeader
                  titleId="ext-mcp-heading"
                  title="MCP servers"
                />
                <div>{mcpList}</div>
              </section>
            )}

            {showHooksSection && (
              <section aria-labelledby="ext-hooks-heading" className="flex flex-col gap-4">
                <ExtensionsCatalogPageHeader
                  titleId="ext-hooks-heading"
                  title="Hooks"
                />
                <div>{hooksList}</div>
              </section>
            )}
            {showWebhooksSection && (
              <section aria-labelledby="ext-webhooks-heading" className="flex flex-col gap-4">
                <ExtensionsCatalogPageHeader
                  titleId="ext-webhooks-heading"
                  title="Webhooks"
                />
                <div>{webhooksList}</div>
              </section>
            )}
        </>
        </div>
      </ExtensionsAnimatedMain>
    </div>
  );
}
