import { useEffect, useMemo, useRef } from 'react';
import { Filter, Folder, FolderPlus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import { type ConversationSummary } from '../../data/conversations';
import { navigateAppRoute } from '../../lib/captureNavigation';

interface ConversationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: ConversationSummary[];
  highlightedConversationId?: string | null;
  onSelectConversation?: (conversation: ConversationSummary) => void;
  onRenameConversation?: (conversationId: string, name: string) => void;
}

interface ConversationFolder {
  id: string;
  label: string;
  conversations: ConversationSummary[];
}

function getConversationFolderName(conversation: ConversationSummary): string {
  if (conversation.repo === 'No Repository') return 'Personal';
  if (conversation.tag === 'Automation') return 'Sidekicks';

  return conversation.repo.split('/').at(-1) ?? conversation.repo;
}

function buildConversationFolders(conversations: ConversationSummary[]): ConversationFolder[] {
  const folders = conversations.reduce<Map<string, ConversationSummary[]>>((acc, conversation) => {
    const folderName = getConversationFolderName(conversation);
    acc.set(folderName, [...(acc.get(folderName) ?? []), conversation]);
    return acc;
  }, new Map());

  return Array.from(folders.entries()).map(([label, folderConversations]) => ({
    id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    label,
    conversations: folderConversations,
  }));
}

function getThreadRowLabel(conversation: ConversationSummary): string {
  if (conversation.archived) return `${conversation.name} (archived)`;
  return conversation.name;
}

export function ConversationDrawer({
  open,
  onOpenChange,
  conversations,
  highlightedConversationId = null,
  onSelectConversation,
}: ConversationDrawerProps) {
  const folders = useMemo(() => buildConversationFolders(conversations), [conversations]);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !highlightedConversationId || !panelRef.current) {
      return;
    }

    const target = panelRef.current.querySelector<HTMLElement>(
      `[data-conversation-id="${highlightedConversationId}"]`
    );

    target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [highlightedConversationId, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        overlayClassName="z-[40] bg-transparent pointer-events-none left-16 right-0"
        hideClose
        onPointerDownOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest('[data-conversation-toggle="true"]')) {
            // Let the nav toggle button control open/close state itself.
            event.preventDefault();
          }
        }}
        className="left-16 z-[49] flex h-full max-h-screen min-h-0 w-[320px] flex-col overflow-hidden border-r border-sidebar-border bg-sidebar p-0 text-sidebar-foreground shadow-none sm:max-w-none"
      >
        <SheetTitle className="sr-only">Threads</SheetTitle>
        <div
          ref={panelRef}
          data-testid="conversation-panel"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-4 custom-scrollbar"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-medium text-muted-foreground">Threads</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Create thread folder"
              >
                <FolderPlus className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Filter threads"
              >
                <Filter className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <nav aria-label="Conversation threads" className="space-y-3">
            {folders.map((folder) => (
              <section key={folder.id} aria-labelledby={`thread-folder-${folder.id}`}>
                <div
                  id={`thread-folder-${folder.id}`}
                  className="flex h-8 min-w-0 items-center gap-2 rounded-md px-1.5 text-sm font-medium text-muted-foreground"
                >
                  <Folder className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{folder.label}</span>
                </div>
                <div className="space-y-0.5">
                  {folder.conversations.map((conversation) => {
                    const isHighlighted = conversation.id === highlightedConversationId;
                    const openChatActive = () => {
                      onSelectConversation?.(conversation);
                      navigateAppRoute('/chat');
                    };

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        data-testid="conversation-card"
                        data-conversation-id={conversation.id}
                        data-archived={conversation.archived || undefined}
                        aria-label={`Open ${getThreadRowLabel(conversation)} in chat`}
                        onClick={openChatActive}
                        className={cn(
                          'group flex h-8 w-full min-w-0 items-center gap-2 rounded-lg pl-7 pr-2 text-left text-sm outline-none transition-colors',
                          'text-sidebar-foreground hover:bg-sidebar-accent focus-visible:bg-sidebar-accent focus-visible:ring-1 focus-visible:ring-ring',
                          isHighlighted && 'bg-sidebar-accent',
                          conversation.archived && 'text-muted-foreground',
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{conversation.name}</span>
                        <time className="shrink-0 text-xs text-muted-foreground">{conversation.time}</time>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
