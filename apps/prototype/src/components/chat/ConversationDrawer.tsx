import { useEffect, useId, useMemo, useRef } from 'react';
import { Cpu, Download, GitBranch, Github, MoreVertical, Pencil, Trash } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent } from '../ui/sheet';
import { type ConversationSummary } from '../../data/conversations';
import { navigateAppRoute } from '../../lib/captureNavigation';

interface ConversationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: ConversationSummary[];
  highlightedConversationId?: string | null;
  onSelectConversation?: (conversation: ConversationSummary) => void;
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

export function ConversationDrawer({
  open,
  onOpenChange,
  conversations,
  highlightedConversationId = null,
  onSelectConversation,
}: ConversationDrawerProps) {
  const items = useMemo(() => conversations, [conversations]);
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
        overlayClassName="bg-transparent pointer-events-none left-16 right-0"
        hideClose
        onPointerDownOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest('[data-conversation-toggle="true"]')) {
            // Let the nav toggle button control open/close state itself.
            event.preventDefault();
          }
        }}
        className="p-0 w-full md:w-[400px] sm:max-w-none border-x border-border bg-card left-16 z-40"
      >
        <div
          ref={panelRef}
          data-testid="conversation-panel"
          className="flex-1 min-w-0 h-full bg-card overflow-y-auto hide-scrollbar"
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
                'relative h-auto w-full cursor-pointer border-b border-border p-3.5 outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                !isHighlighted && 'hover:bg-muted/60 focus-visible:bg-muted/60',
                isHighlighted &&
                  !isAutomation &&
                  'bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/40 hover:bg-emerald-500/[0.14] focus-visible:bg-emerald-500/[0.14]',
                isHighlighted &&
                  isAutomation &&
                  'bg-muted/40 ring-1 ring-inset ring-border hover:bg-muted/55 focus-visible:bg-muted/55',
              )}
              aria-label={`Open ${conversation.name} in chat`}
              onClick={openChatActive}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                if ((event.target as HTMLElement).closest('[data-conversation-menu-trigger="true"]')) return;
                event.preventDefault();
                openChatActive();
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden mr-2">
                  <div className="flex items-center">
                    <div className="inline-flex">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                    <p
                      data-testid="conversation-card-title"
                      className="min-w-0 truncate text-xs font-semibold leading-6 text-foreground"
                      title={conversation.name}
                    >
                      {conversation.name}
                    </p>
                    <span className="inline-flex shrink-0 cursor-help items-center rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-semibold lowercase text-muted-foreground">
                      {conversation.version}
                    </span>
                    {isAutomation ? (
                      <span
                        className="inline-flex shrink-0 items-center text-emerald-300"
                        role="img"
                        aria-label="Automation conversation"
                      >
                        <AutomationDrawerIcon className="h-4 w-4" />
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {conversation.tag && !isAutomation && (
                    <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                      {conversation.tag}
                    </span>
                  )}
                  <div className="group">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        data-testid="ellipsis-button"
                        data-conversation-menu-trigger="true"
                        type="button"
                        className="relative z-10 flex h-6 w-6 translate-x-2.5 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label="Conversation options"
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => event.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-muted border border-border text-foreground"
                    >
                      <DropdownMenuItem className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem className="gap-2">
                        <Download className="h-4 w-4" />
                        Export Conversation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash className="h-4 w-4" />
                        Delete Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                </div>
              </div>
              <div className="flex flex-row justify-between items-center mt-1">
                <div className="flex items-center gap-3 flex-1 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Github className="w-3 h-3" />
                    <span
                      data-testid="conversation-card-selected-repository"
                      className="text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-44"
                    >
                      {conversation.repo}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    <span
                      data-testid="conversation-card-selected-branch"
                      className="text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-24"
                    >
                      {conversation.branch ?? ''}
                    </span>
                  </div>
                  {conversation.model ? (
                    <div className="flex min-w-0 items-center gap-1">
                      <Cpu className="h-3 w-3 shrink-0" aria-hidden />
                      <span
                        data-testid="conversation-card-model"
                        className="max-w-32 truncate text-xs whitespace-nowrap text-muted-foreground"
                      >
                        {conversation.model}
                      </span>
                    </div>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground flex-1 text-right">
                  <time>{conversation.time}</time>
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
