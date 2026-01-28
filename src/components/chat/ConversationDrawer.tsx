import { useMemo } from 'react';
import { Download, GitBranch, Github, MoreVertical, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent } from '../ui/sheet';
import { type ConversationSummary } from '../../data/conversations';

interface ConversationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: ConversationSummary[];
}

export function ConversationDrawer({ open, onOpenChange, conversations }: ConversationDrawerProps) {
  const items = useMemo(() => conversations, [conversations]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        overlayClassName="bg-transparent pointer-events-none left-16 right-0"
        hideClose
        className="p-0 w-full md:w-[400px] sm:max-w-none border-x border-border bg-card left-16 z-40"
      >
        <div
          data-testid="conversation-panel"
          className="w-full h-full bg-card overflow-y-auto hide-scrollbar"
        >
          {items.map((conversation) => (
            <div
              key={conversation.id}
              data-testid="conversation-card"
              className="relative h-auto w-full p-3.5 border-b border-border cursor-pointer hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden mr-2">
                  <div className="flex items-center">
                    <div className="inline-flex">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 cursor-help lowercase bg-muted/50 text-muted-foreground">
                    {conversation.version}
                  </span>
                  <p
                    data-testid="conversation-card-title"
                    className="text-xs leading-6 font-semibold bg-transparent truncate overflow-hidden text-foreground"
                    title={conversation.name}
                  >
                    {conversation.name}
                  </p>
                </div>
                <div className="group">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        data-testid="ellipsis-button"
                        type="button"
                        className="cursor-pointer w-6 h-6 flex items-center justify-center translate-x-2.5 text-muted-foreground hover:text-foreground"
                        aria-label="Conversation options"
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
                </div>
                <p className="text-xs text-muted-foreground flex-1 text-right">
                  <time>{conversation.time}</time>
                </p>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
