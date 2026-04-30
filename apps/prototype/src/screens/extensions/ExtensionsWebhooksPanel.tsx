import { useMemo, useState } from 'react';
import { MoreVertical, Pencil, Trash2, Webhook } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { PluginToggle } from '../../components/ui/plugin-toggle';
import { Button } from '../../components/ui/button';
import {
  webhookCatalogEntries,
  webhooksCatalogEntryMatchesQuery,
} from '../../data/webhooksCatalog';
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
import { ExtensionsCatalogPageHeader } from './ExtensionsCatalogPageHeader';
import { ExtensionsShellSidebar, type ExtensionsBrowseControls } from './ExtensionsShellSidebar';
import { WebhookSetupModal } from './extensionsCatalogAddModals';

const webhooksPageDescription =
  'Receive external events from services and trigger OpenHands workflows, automations, or conversations.';

export type ExtensionsWebhooksPanelProps = {
  browseControls: ExtensionsBrowseControls;
};

export function ExtensionsWebhooksPanel({ browseControls }: ExtensionsWebhooksPanelProps) {
  const [webhookSwitchById, setWebhookSwitchById] = useState<Record<string, boolean>>({});
  const [removedWebhookIds, setRemovedWebhookIds] = useState<Set<string>>(() => new Set());
  const [webhookCommandById, setWebhookCommandById] = useState<Record<string, string>>({});
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [webhookEditingId, setWebhookEditingId] = useState<string | null>(null);
  const query = browseControls.searchQuery.trim().toLowerCase();

  const visible = useMemo(
    () =>
      webhookCatalogEntries.filter((entry) => {
        if (removedWebhookIds.has(entry.id)) return false;
        return webhooksCatalogEntryMatchesQuery(entry, query);
      }),
    [query, removedWebhookIds]
  );

  return (
    <div className={extensionsShellRowClassName}>
      <WebhookSetupModal
        open={webhookDialogOpen}
        onOpenChange={(open) => {
          setWebhookDialogOpen(open);
          if (!open) setWebhookEditingId(null);
        }}
        editingId={webhookEditingId}
        initialValues={
          webhookEditingId
            ? {
                name: webhookCatalogEntries.find((entry) => entry.id === webhookEditingId)?.name ?? 'Webhook',
                command: webhookCommandById[webhookEditingId],
              }
            : null
        }
        onSave={(id, payload) => {
          if (!id) return;
          setWebhookCommandById((prev) => ({ ...prev, [id]: payload.command }));
        }}
      />
      <ExtensionsShellSidebar browseControls={browseControls} />

      <ExtensionsAnimatedMain className={cn(extensionsMainScrollClassName, 'repo-dropdown-scroll')}>
        <div className={extensionsPageContentClassName}>
          <ExtensionsCatalogPageHeader
            title="Webhooks"
            description={webhooksPageDescription}
            actions={
              <Button
                type="button"
                variant="default"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  setWebhookEditingId(null);
                  setWebhookDialogOpen(true);
                }}
              >
                + Webhook
              </Button>
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visible.map((entry) => {
              const enabled = webhookSwitchById[entry.id] !== false;
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
                              setWebhookDialogOpen(true);
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
                      extensionsCatalogCardBodyPrWithControlCluster
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                        <Webhook className="h-5 w-5 text-muted-foreground" aria-hidden />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-base font-medium text-foreground">{entry.name}</span>
                        <p
                          className="mt-2 line-clamp-2 break-all text-sm text-muted-foreground"
                          title={entry.endpoint}
                        >
                          {entry.endpoint}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No webhooks match your search.</p>
          ) : null}
        </div>
      </ExtensionsAnimatedMain>
    </div>
  );
}
