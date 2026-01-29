import { useMemo } from 'react';
import { PRCard } from '../../types/pr';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Check, Ellipsis, ExternalLink, GitBranch, GitPullRequest, MessageSquare, Minus, Pause, Plus } from 'lucide-react';
import { CommentsDialog } from './CommentsDialog';
import { CiChecksDialog } from './CiChecksDialog';

interface AgentPanelProps {
  card: PRCard | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (cardId: string, skillId?: string, skillName?: string) => string;
  onSendMessage: (cardId: string, conversationId: string, message: string) => void;
}

const formatTimeAgo = (dateString?: string) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export function AgentPanel({ card, isOpen, onClose, onCreateConversation, onSendMessage: _onSendMessage }: AgentPanelProps) {
  const conversations = card?.conversations ?? [];
  const activeConversations = useMemo(
    () => conversations.filter((conversation) => Boolean(conversation.activity)),
    [conversations]
  );

  const handleCreateConversation = () => {
    if (!card) return;
    onCreateConversation(card.id);
  };

  if (!card) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-background border-l border-border p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <GitPullRequest className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <SheetTitle className="text-left text-base font-medium leading-tight">{card.title}</SheetTitle>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  {card.repo} #{card.number}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-mono">
              <GitBranch className="w-3 h-3" />
              {card.branch} → {card.baseBranch}
            </span>
            <span className="flex items-center gap-1">
              <Plus className="w-3 h-3 text-success" />
              <span className="text-success">{card.additions}</span>
            </span>
            <span className="flex items-center gap-1">
              <Minus className="w-3 h-3 text-destructive" />
              <span className="text-destructive">{card.deletions}</span>
            </span>
          </div>
        </SheetHeader>

        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <CommentsDialog
                count={card.comments}
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="View comments"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{card.comments}</span>
                  </button>
                }
              />
              <CiChecksDialog
                count={4}
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="View CI check results"
                  >
                    <Check className="w-4 h-4" />
                    <span>4</span>
                  </button>
                }
              />
            </div>
            <Button size="sm" variant="outline" className="bg-background" onClick={handleCreateConversation}>
              Add New
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {activeConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <p className="text-sm text-muted-foreground">No active conversations</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Start a new thread to see activity here.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={handleCreateConversation}>
                  Add New
                </Button>
              </div>
            ) : (
              activeConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="bg-card border border-border rounded-lg p-4 hover:border-white/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 bg-primary" />
                      <div>
                        <h4 className="font-medium text-foreground">{conversation.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="gradient-flow">{conversation.activity}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{formatTimeAgo(conversation.updatedAt)}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <span className="uppercase tracking-wide text-[10px] text-muted-foreground">
                              Agent Status
                            </span>
                            <button
                              type="button"
                              className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-foreground hover:text-foreground"
                              aria-label="Pause agent"
                            >
                              <Pause className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
                        aria-label="Open conversation"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1 hover:bg-muted/80 rounded transition-colors text-muted-foreground hover:text-foreground"
                        aria-label="Conversation options"
                      >
                        <Ellipsis className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-border pt-2 mt-3 flex flex-wrap items-center gap-2 text-muted-foreground">
                    <span className="text-xs">Up to date</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
