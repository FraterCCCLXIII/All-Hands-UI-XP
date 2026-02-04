import { useMemo, useState } from 'react';
import { PRCard } from '../../types/pr';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { ArrowDown, ArrowUp, Check, ChevronDown, Ellipsis, ExternalLink, GitBranch, GitPullRequest, MessageSquare, Minus, Pause, Plus } from 'lucide-react';
import { CommentsDialog } from './CommentsDialog';
import { CiChecksDialog } from './CiChecksDialog';
import { PrLabel, type PrLabelStatus } from './PrLabel';

interface AgentPanelProps {
  card: PRCard | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (cardId: string, skillId?: string, skillName?: string) => string;
  onSendMessage: (cardId: string, conversationId: string, message: string) => void;
  showConversationFooter?: boolean;
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

export function AgentPanel({
  card,
  isOpen,
  onClose,
  onCreateConversation,
  onSendMessage: _onSendMessage,
  showConversationFooter = true,
}: AgentPanelProps) {
  const [showInactive, setShowInactive] = useState(false);
  const conversations = card?.conversations ?? [];
  const activeConversations = useMemo(
    () => conversations.filter((conversation) => Boolean(conversation.activity)),
    [conversations]
  );
  const inactiveConversations = useMemo(
    () => conversations.filter((conversation) => !conversation.activity),
    [conversations]
  );

  const handleCreateConversation = () => {
    if (!card) return;
    onCreateConversation(card.id);
  };

  if (!card) return null;
  const labelStatus = getPrLabelStatus(card);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-background p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2">
          <div className="flex items-start gap-3 pr-10">
            <GitPullRequest className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="min-w-0">
              <SheetTitle className="text-left text-base font-medium leading-tight">{card.title}</SheetTitle>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {card.repo} #{card.number}
              </p>
              {labelStatus && (
                <div className="mt-2">
                  <PrLabel status={labelStatus} />
                </div>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="px-4 pb-4 pt-0">
          <div className="flex items-center justify-between">
            <Button size="sm" variant="outline" className="bg-background" onClick={handleCreateConversation}>
              Add New
            </Button>
            <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
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
                      <div className="w-2 h-2 rounded-full mt-0.5 self-start shrink-0 bg-green-500" />
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-foreground">{conversation.name}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="gradient-flow">{conversation.activity}</span>
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                  {showConversationFooter && (
                    <div className="border-t border-border pt-2 mt-3 flex flex-wrap items-center gap-2 text-muted-foreground">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                        aria-label="Pull"
                      >
                        <ArrowDown className="w-3 h-3" />
                        <span>Pull</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                        aria-label="Push"
                      >
                        <ArrowUp className="w-3 h-3" />
                        <span>Push</span>
                      </button>
                      <span className="flex items-center gap-1 text-xs">
                        <GitBranch className="w-3 h-3 text-muted-foreground" />
                        Up to date
                      </span>
                      <div className="flex items-center gap-3 shrink-0 ml-auto">
                        <span className="flex items-center gap-1 text-xs">
                          <Plus className="w-3 h-3 text-success" />
                          <span className="text-success">{card.additions}</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <Minus className="w-3 h-3 text-destructive" />
                          <span className="text-destructive">{card.deletions}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {inactiveConversations.length > 0 && (
              <div className="px-0 pb-3">
                <button
                  type="button"
                  onClick={() => setShowInactive((prev) => !prev)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 w-full"
                  aria-expanded={showInactive}
                  aria-label={showInactive ? 'Collapse inactive conversations' : 'Expand inactive conversations'}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform shrink-0 ${showInactive ? '' : '-rotate-90'}`}
                    aria-hidden
                  />
                  <span>Inactive Conversations</span>
                  <span className="flex items-center gap-1 text-xs">
                    <MessageSquare className="w-3 h-3" aria-hidden />
                    {inactiveConversations.length}
                  </span>
                </button>
                {showInactive && (
                  <div className="space-y-2">
                    {inactiveConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="bg-card border border-border rounded-lg p-4 hover:border-white/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full mt-0.5 self-start shrink-0 bg-muted-foreground" />
                            <div className="space-y-2">
                              <h4 className="text-xs font-medium text-foreground">{conversation.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatTimeAgo(conversation.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="p-1 hover:bg-muted/80 rounded transition-colors text-muted-foreground hover:text-foreground"
                              aria-label="Conversation options"
                            >
                              <Ellipsis className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function getPrLabelStatus(card: PRCard): PrLabelStatus | null {
  const labelMatch = card.labels.find((label) => {
    const normalized = label.name.trim().toLowerCase();
    return [
      'draft',
      'open',
      'ready for review',
      'changes requested',
      'approved',
      'merged',
      'closed',
    ].includes(normalized);
  });

  if (labelMatch) {
    return mapLabelNameToStatus(labelMatch.name);
  }

  switch (card.status) {
    case 'draft':
      return 'draft';
    case 'open':
      return 'open';
    case 'approved':
      return 'approved';
    case 'changes-requested':
      return 'changes_requested';
    case 'merged':
      return 'merged';
    default:
      return null;
  }
}

function mapLabelNameToStatus(labelName: string): PrLabelStatus {
  const normalized = labelName.trim().toLowerCase();
  switch (normalized) {
    case 'draft':
      return 'draft';
    case 'open':
      return 'open';
    case 'ready for review':
      return 'ready_for_review';
    case 'changes requested':
      return 'changes_requested';
    case 'approved':
      return 'approved';
    case 'merged':
      return 'merged';
    case 'closed':
      return 'closed';
    default:
      return 'open';
  }
}
