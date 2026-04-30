import { useMemo, useState } from 'react';
import { Grid2x2Plus, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { PluginToggle } from '../../components/ui/plugin-toggle';
import {
  addOnCatalogEntries,
  addOnCatalogEntryMatchesQuery,
} from '../../data/addOnsCatalog';
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
import { ExtensionsAddOnInstallDialog } from './ExtensionsAddOnInstallDialog';
import { ExtensionsAnimatedMain } from './ExtensionsAnimatedMain';
import { ExtensionsCatalogPageHeader } from './ExtensionsCatalogPageHeader';
import { ExtensionsShellSidebar, type ExtensionsBrowseControls } from './ExtensionsShellSidebar';

const addOnsPageDescription =
  'Install add-ons to extend OpenHands with new capabilities, integrations, and workflow experiences for your team.';

export type ExtensionsAddOnsPanelProps = {
  browseControls: ExtensionsBrowseControls;
};

export function ExtensionsAddOnsPanel({ browseControls }: ExtensionsAddOnsPanelProps) {
  const [addOnSwitchById, setAddOnSwitchById] = useState<Record<string, boolean>>({});
  const [removedAddOnIds, setRemovedAddOnIds] = useState<Set<string>>(() => new Set());
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const query = browseControls.searchQuery.trim().toLowerCase();

  const visible = useMemo(
    () =>
      addOnCatalogEntries.filter((entry) => {
        if (removedAddOnIds.has(entry.id)) return false;
        return addOnCatalogEntryMatchesQuery(entry, query);
      }),
    [query, removedAddOnIds]
  );

  return (
    <div className={extensionsShellRowClassName}>
      <ExtensionsShellSidebar browseControls={browseControls} />

      <ExtensionsAnimatedMain className={cn(extensionsMainScrollClassName, 'repo-dropdown-scroll')}>
        <div className={extensionsPageContentClassName}>
          <ExtensionsCatalogPageHeader
            title="Add-Ons"
            description={addOnsPageDescription}
            actions={
              <Button
                type="button"
                variant="default"
                size="sm"
                className="shrink-0"
                onClick={() => setInstallDialogOpen(true)}
              >
                Install Add-on
              </Button>
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visible.map((entry) => {
              const enabled = addOnSwitchById[entry.id] !== false;
              return (
                <div
                  key={entry.id}
                  className="relative rounded-xl border border-border bg-card transition-colors hover:bg-muted/60"
                >
                  <div
                    className={cn(
                      extensionsCatalogCardControlsClassName,
                      extensionsCatalogCardControlClusterClassName
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
                      extensionsCatalogCardBodyPrWithControlCluster
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
            })}
          </div>
          {visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No add-ons match your search.</p>
          ) : null}
        </div>
      </ExtensionsAnimatedMain>
      <ExtensionsAddOnInstallDialog open={installDialogOpen} onOpenChange={setInstallDialogOpen} />
    </div>
  );
}
