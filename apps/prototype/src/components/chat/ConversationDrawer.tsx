import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Download, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent } from '../ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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

/** Dropdown menu is portaled outside the Sheet; Sheet must ignore those interactions. */
function isDropdownMenuElement(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest('[data-conversation-dropdown-menu]') ||
      target.closest('[data-radix-dropdown-menu-content]') ||
      target.closest('[data-radix-dropdown-menu-sub-content]')
  );
}

/** Pointer/focus targets can be wrong for portaled menus; walk composedPath when available. */
function isDropdownMenuInteraction(event: {
  target: EventTarget | null;
  composedPath?: () => EventTarget[];
}): boolean {
  const path =
    typeof event.composedPath === 'function' ? event.composedPath() : [event.target as EventTarget];
  return path.some((node) => isDropdownMenuElement(node));
}

/** Matches left-nav Automations icon at drawer list size; unique clip id per instance. */
function AutomationDrawerIcon({ className }: { className?: string }) {
  const clipId = `automation-drawer-clip-${useId().replace(/:/g, '')}`;
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={cn('block', className)}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={clipId}>
          <rect width="18" height="18" fill="white" transform="translate(1 1)" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path d="M10 18.1818V16.5454" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 1.81812V3.45448" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.81824 10H3.4546" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.1818 10H16.5454" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.93359 17.1019L6.74359 15.6782" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.0663 2.89819L13.2563 4.32183" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.89819 5.93359L4.32183 6.74359" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.1019 14.0663L15.6782 13.2563" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.92542 2.90625L6.7436 4.3217" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.0909 17.0854L13.2727 15.6699" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.0855 5.90918L15.67 6.72736" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.91455 14.0909L4.33001 13.2727" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M10 16.5455C13.615 16.5455 16.5455 13.615 16.5455 10C16.5455 6.38509 13.615 3.45459 10 3.45459C6.38509 3.45459 3.45459 6.38509 3.45459 10C3.45459 13.615 6.38509 16.5455 10 16.5455Z"
          stroke="currentColor"
          strokeWidth="1.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5854 9.77916L8.80545 7.59461C8.63363 7.49643 8.41272 7.61916 8.41272 7.81552V12.1846C8.41272 12.381 8.62545 12.5119 8.80545 12.4055L12.5854 10.221C12.7573 10.1228 12.7573 9.86916 12.5854 9.77098V9.77916Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

const conversationMenuContentClass =
  'z-[110] min-w-[12rem] rounded-lg border border-border/70 bg-card p-1 text-foreground shadow-md overflow-hidden';

const conversationMenuItemClass =
  'gap-2 cursor-pointer rounded-md text-sm text-foreground [&_svg]:text-muted-foreground';

export function ConversationDrawer({
  open,
  onOpenChange,
  conversations,
  highlightedConversationId = null,
  onSelectConversation,
  onRenameConversation,
}: ConversationDrawerProps) {
  const items = useMemo(() => conversations, [conversations]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const menuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConversationSummary | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingNameDraft, setEditingNameDraft] = useState('');
  const ignoreRenameBlurOnceRef = useRef(false);
  const [openMenuConversationId, setOpenMenuConversationId] = useState<string | null>(null);

  const cancelInlineRename = () => {
    setEditingConversationId(null);
    setEditingNameDraft('');
  };

  const commitInlineRename = (conversationId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onRenameConversation?.(conversationId, trimmed);
    cancelInlineRename();
  };

  const cancelMenuCloseTimer = () => {
    if (menuCloseTimerRef.current) {
      clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
  };

  const scheduleMenuClose = () => {
    cancelMenuCloseTimer();
    menuCloseTimerRef.current = setTimeout(() => {
      setOpenMenuConversationId(null);
      menuCloseTimerRef.current = null;
    }, 220);
  };

  useEffect(() => {
    return () => cancelMenuCloseTimer();
  }, []);

  useEffect(() => {
    if (!open) {
      cancelMenuCloseTimer();
      setOpenMenuConversationId(null);
      setEditingConversationId(null);
      setEditingNameDraft('');
    }
  }, [open]);

  useEffect(() => {
    if (!editingConversationId) return;
    const id = requestAnimationFrame(() => {
      const el = document.querySelector<HTMLInputElement>(
        `[data-conversation-rename-input="${editingConversationId}"]`
      );
      el?.focus();
      el?.select();
    });
    return () => cancelAnimationFrame(id);
  }, [editingConversationId]);

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
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        overlayClassName="z-[40] bg-transparent pointer-events-none left-16 right-0"
        hideClose
        onInteractOutside={(event) => {
          // If a conversation menu is open, any "outside" interaction is a menu click — keep sheet open.
          if (openMenuConversationId !== null || isDropdownMenuInteraction(event)) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (openMenuConversationId !== null || isDropdownMenuInteraction(event)) {
            event.preventDefault();
            return;
          }
          const target = event.target as HTMLElement | null;
          if (target?.closest('[data-conversation-toggle="true"]')) {
            // Let the nav toggle button control open/close state itself.
            event.preventDefault();
          }
        }}
        onFocusOutside={(event) => {
          if (openMenuConversationId !== null) {
            event.preventDefault();
            return;
          }
          const related = (event as unknown as FocusEvent).relatedTarget;
          if (isDropdownMenuElement(related)) {
            event.preventDefault();
          }
        }}
        className="flex h-full max-h-screen min-h-0 flex-col overflow-hidden p-0 w-full md:w-[400px] sm:max-w-none border-r border-border bg-background left-16 z-[49]"
      >
        <div
          ref={panelRef}
          data-testid="conversation-panel"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain bg-background pr-2 py-1 custom-scrollbar"
        >
          {items.map((conversation) => {
            const isAutomation = conversation.tag === 'Automation';
            const isHighlighted = conversation.id === highlightedConversationId;
            const openChatActive = () => {
              onSelectConversation?.(conversation);
              navigateAppRoute('/chat');
            };

            return (
            <div
              key={conversation.id}
              data-testid="conversation-card"
              data-conversation-id={conversation.id}
              tabIndex={0}
              className={cn(
                'group relative h-auto w-full cursor-pointer rounded-lg p-3.5 outline-none transition-all duration-300',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                // Match ChatStartScreen suggestion tiles + WelcomeScreen list rows
                'hover:bg-muted/60 focus-visible:bg-muted/60',
                isHighlighted && 'bg-muted/40 ring-1 ring-inset ring-border/60',
              )}
              aria-label={`Open ${conversation.name} in chat`}
              onClick={() => {
                if (editingConversationId === conversation.id) return;
                if (editingConversationId && editingConversationId !== conversation.id) {
                  setEditingConversationId(null);
                  setEditingNameDraft('');
                }
                openChatActive();
              }}
              onKeyDown={(event) => {
                if (editingConversationId === conversation.id) return;
                if (event.key !== 'Enter' && event.key !== ' ') return;
                if ((event.target as HTMLElement).closest('[data-conversation-menu-trigger="true"]')) return;
                event.preventDefault();
                openChatActive();
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden mr-2">
                  <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                    {editingConversationId === conversation.id ? (
                      <Input
                        data-testid="conversation-card-title"
                        data-conversation-rename-input={conversation.id}
                        aria-label="Conversation name"
                        className="h-7 min-w-0 flex-1 border-border bg-background px-2 py-0 text-xs font-normal leading-6 text-foreground shadow-sm"
                        value={editingNameDraft}
                        onChange={(e) => setEditingNameDraft(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelInlineRename();
                            return;
                          }
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = editingNameDraft.trim();
                            if (trimmed) {
                              commitInlineRename(conversation.id, editingNameDraft);
                            } else {
                              cancelInlineRename();
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const next = e.relatedTarget as Node | null;
                          const card = (e.currentTarget as HTMLElement).closest('[data-conversation-id]');
                          if (next && card?.contains(next)) return;
                          if (ignoreRenameBlurOnceRef.current) {
                            ignoreRenameBlurOnceRef.current = false;
                            return;
                          }
                          cancelInlineRename();
                        }}
                      />
                    ) : (
                      <span className="flex min-w-0 items-center gap-1.5">
                        <p
                          data-testid="conversation-card-title"
                          className="min-w-0 truncate text-sm font-normal leading-6 text-foreground"
                          title={conversation.name}
                        >
                          {conversation.name}
                        </p>
                        <div className={cn(
                          'h-1.5 w-1.5 rounded-full shrink-0',
                          conversation.status === 'running' && 'bg-green-500',
                          conversation.status === 'awaiting' && 'bg-yellow-400',
                          conversation.status === 'error' && 'bg-red-500',
                          !conversation.status && 'bg-muted-foreground',
                        )} />
                      </span>
                    )}
                    <span className="inline-flex shrink-0 cursor-help items-center rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-semibold lowercase text-muted-foreground">
                      {conversation.version}
                    </span>
                    {isAutomation ? (
                      <span
                        className="inline-flex shrink-0 items-center text-success-foreground"
                        role="img"
                        aria-label="Automation conversation"
                      >
                        <AutomationDrawerIcon className="h-4 w-4" />
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <DropdownMenu
                    open={openMenuConversationId === conversation.id}
                    onOpenChange={(next) => {
                      cancelMenuCloseTimer();
                      setOpenMenuConversationId(next ? conversation.id : null);
                      if (!next) {
                        requestAnimationFrame(() => {
                          const active = document.activeElement;
                          if (active instanceof HTMLElement && active.closest('[data-conversation-menu-trigger="true"]')) {
                            active.blur();
                          }
                        });
                      }
                    }}
                    modal={false}
                  >
                    <div
                      className="inline-flex shrink-0"
                      onMouseEnter={() => {
                        cancelMenuCloseTimer();
                        setOpenMenuConversationId(conversation.id);
                      }}
                      onMouseLeave={() => {
                        scheduleMenuClose();
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <button
                          data-testid="ellipsis-button"
                          data-conversation-menu-trigger="true"
                          type="button"
                          className="relative z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-[opacity,color] duration-200 hover:text-foreground group-hover:opacity-100 data-[state=open]:text-foreground data-[state=open]:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                          aria-label="Conversation options"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </DropdownMenuTrigger>
                    </div>
                    <DropdownMenuContent
                      align="end"
                      data-conversation-dropdown-menu
                      className={conversationMenuContentClass}
                      onMouseEnter={cancelMenuCloseTimer}
                      onMouseLeave={scheduleMenuClose}
                    >
                      <DropdownMenuItem
                        className={conversationMenuItemClass}
                        onSelect={(event) => {
                          event.preventDefault();
                          setOpenMenuConversationId(null);
                          ignoreRenameBlurOnceRef.current = true;
                          setEditingConversationId(conversation.id);
                          setEditingNameDraft(conversation.name);
                        }}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={2} />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem className={conversationMenuItemClass}>
                        <Download className="h-4 w-4" strokeWidth={2} />
                        Export Conversation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        className={cn(conversationMenuItemClass)}
                        onSelect={(event) => {
                          event.preventDefault();
                          setDeleteTarget(conversation);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex flex-row items-center gap-2 mt-1 min-w-0 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-3 min-w-0 shrink overflow-hidden">
                  <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                    <span
                      data-testid="conversation-card-selected-repository"
                      className="whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      {conversation.repo}
                    </span>
                    {conversation.branch ? (
                      <span className="inline-flex shrink-0 items-center rounded bg-muted/50 px-1.5 py-0.5">
                        <span
                          data-testid="conversation-card-selected-branch"
                          className="whitespace-nowrap overflow-hidden text-ellipsis max-w-24"
                        >
                          {conversation.branch}
                        </span>
                      </span>
                    ) : null}
                  </div>
                  {conversation.model ? (
                    <span
                      data-testid="conversation-card-model"
                      className="shrink-0"
                    >
                      {conversation.model}
                    </span>
                  ) : null}
                </div>
                <p className="ml-auto shrink-0 whitespace-nowrap">
                  <time>{conversation.time}</time>
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>

    <Dialog open={deleteTarget !== null} onOpenChange={(dialogOpen) => { if (!dialogOpen) setDeleteTarget(null); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete conversation?</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{deleteTarget?.name}</span>
            {' '}will be permanently deleted. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteTarget(null)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
