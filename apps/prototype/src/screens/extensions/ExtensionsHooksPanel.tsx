import { useCallback, useMemo, useState } from 'react';
import { MoreVertical, Pencil, Trash2, Webhook } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { PluginToggle } from '../../components/ui/plugin-toggle';
import {
  hooksCatalogEntries,
  hooksCatalogDisplaySubtext,
  type HookRecipeOverride,
} from '../../data/hooksCatalog';
import { AddHookModal } from './extensionsCatalogAddModals';
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

const hooksPageDescription = (
  <>
    Lifecycle hooks run shell scripts registered in{' '}
    <code className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
      .openhands/hooks.json
    </code>{' '}
    in your repository. Enable patterns below to opt into them for your workspace; edit labels and script paths as
    needed.
  </>
);

export type ExtensionsHooksPanelProps = {
  browseControls: ExtensionsBrowseControls;
};

export function ExtensionsHooksPanel({ browseControls }: ExtensionsHooksPanelProps) {
  const [hookSwitchById, setHookSwitchById] = useState<Record<string, boolean>>({});
  const [removedHookIds, setRemovedHookIds] = useState<Set<string>>(() => new Set());
  const [hookOverridesById, setHookOverridesById] = useState<Record<string, HookRecipeOverride>>({});
  const [hookEditOpen, setHookEditOpen] = useState(false);
  const [hookEditingId, setHookEditingId] = useState<string | null>(null);

  const closeHookEdit = useCallback(() => {
    setHookEditOpen(false);
    setHookEditingId(null);
  }, []);

  const hookEditingEntry = useMemo(
    () => (hookEditingId ? hooksCatalogEntries.find((e) => e.id === hookEditingId) ?? null : null),
    [hookEditingId]
  );

  const visible = useMemo(
    () => hooksCatalogEntries.filter((e) => !removedHookIds.has(e.id)),
    [removedHookIds]
  );

  return (
    <div className={extensionsShellRowClassName}>
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
                notes: hookOverridesById[hookEditingEntry.id]?.notes ?? hooksCatalogDisplaySubtext(hookEditingEntry, null),
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
      <ExtensionsShellSidebar browseControls={browseControls} />

      <ExtensionsAnimatedMain className={cn(extensionsMainScrollClassName, 'repo-dropdown-scroll')}>
        <div className={extensionsPageContentClassName}>
          <ExtensionsCatalogPageHeader
            title="Hooks"
            description={hooksPageDescription}
            actions={<ExtensionsCatalogAddButton kind="hook" />}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visible.map((entry) => {
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
                        <Webhook className="h-5 w-5 text-muted-foreground" aria-hidden />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-base font-medium text-foreground">{displayName}</span>
                        <p
                          className="mt-2 line-clamp-2 break-all text-sm text-muted-foreground"
                          title={subtext}
                        >
                          {subtext}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No hook patterns match your search.</p>
          ) : null}
        </div>
      </ExtensionsAnimatedMain>
    </div>
  );
}
