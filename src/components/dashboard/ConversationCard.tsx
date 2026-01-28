import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  GitBranch,
  GitPullRequest,
  MessageSquare,
  MoreHorizontal,
  Pause,
  Play,
  StopCircle,
  Trash,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface Conversation {
  id: string;
  name: string;
  description: string;
  timestamp: string;
  agentStatus: 'active' | 'idle' | 'error';
  isActive: boolean;
  commitStatus?: string;
}

interface ConversationCardProps {
  conversation: Conversation;
  isCompact?: boolean;
  showBranchActions?: boolean;
}

export function ConversationCard({ conversation, isCompact = false, showBranchActions = true }: ConversationCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-white/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full mt-1.5 shrink-0',
              conversation.isActive ? 'bg-primary' : 'bg-muted-foreground'
            )}
          />
          <div>
            <h4 className="font-medium text-foreground">{conversation.name}</h4>
            {!isCompact ? (
              <>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="gradient-flow">{conversation.description}</span>
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{conversation.timestamp}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span className="uppercase tracking-wide text-[10px] text-muted-foreground">Agent Status</span>
                    <button className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-foreground hover:text-foreground">
                      {conversation.agentStatus === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </button>
                    {conversation.agentStatus === 'error' && <StatusBadge variant="error">Error</StatusBadge>}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{conversation.timestamp}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isCompact && (
            <>
              <button className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground">
                <ExternalLink className="w-4 h-4" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-muted/80 rounded transition-colors text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-muted border border-border">
                  <DropdownMenuItem className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View in New Tab
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <StopCircle className="h-4 w-4" />
                    Stop Conversation (Close Runtime)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem className="gap-2 text-white">
                    <Trash className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {isCompact && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-muted/80 rounded transition-colors text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-muted border border-border">
                <DropdownMenuItem className="gap-2">
                  <Play className="h-4 w-4" />
                  Activate (Start Runtime)
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="gap-2 text-white">
                  <Trash className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {!isCompact && (
        <div className="border-t border-border pt-2 mt-3 flex flex-wrap items-center gap-2 text-muted-foreground">
          <Button variant="muted" size="xs">
            <ArrowDown className="w-3 h-3 mr-1" />
            Pull
          </Button>
          <Button variant="muted" size="xs">
            <ArrowUp className="w-3 h-3 mr-1" />
            Push
          </Button>
          {showBranchActions && (
            <Button variant="muted" size="xs">
              <GitPullRequest className="w-3 h-3 mr-1" />
              Pull Request
            </Button>
          )}
          <span className="flex items-center gap-1 text-xs">
            <GitBranch className="w-3 h-3 text-muted-foreground" />
            {conversation.commitStatus ?? 'Up to date'}
          </span>
        </div>
      )}
    </div>
  );
}

interface ConversationListProps {
  conversations: Conversation[];
  title?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function ConversationList({
  conversations,
  title,
  collapsible = false,
  defaultCollapsed = false,
}: ConversationListProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className="space-y-2">
      {title && (
        <button
          onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsible && (
            <svg
              className={cn('w-4 h-4 transition-transform', isCollapsed ? '-rotate-90' : '')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          <span>{title}</span>
          <span className="flex items-center gap-1 text-xs">
            <MessageSquare className="w-3 h-3" />
            {conversations.length}
          </span>
        </button>
      )}
      {!isCollapsed && (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <ConversationCard key={conv.id} conversation={conv} />
          ))}
        </div>
      )}
    </div>
  );
}
