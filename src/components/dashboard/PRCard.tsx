import { PRCard as PRCardType } from '../../types/pr';
import { Bot, Check, Clock, GitPullRequest, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { CommentsDialog } from './CommentsDialog';
import { CiChecksDialog } from './CiChecksDialog';
import { PrLabel, type PrLabelStatus } from './PrLabel';

interface PRCardProps {
  card: PRCardType;
  onClick: () => void;
  isDragging?: boolean;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'just now';
}

export function PRCardComponent({ card, onClick, isDragging }: PRCardProps) {
  const conversationCount = card.conversations?.length ?? 0;
  const linkedPrIds = card.linkedPrIds ?? (card.linkedPrId ? [card.linkedPrId] : []);
  const hasAssociatedPr = card.sourceType !== 'task' || linkedPrIds.length > 0;
  const labelStatus = hasAssociatedPr ? getPrLabelStatus(card) : null;
  const isTaskCard =
    card.sourceType === 'task' ||
    card.linkedPrId === null ||
    card.labels.some((label) => label.name.trim().toLowerCase() === 'task');
  const cardMetaText = isTaskCard
    ? linkedPrIds.length > 0
      ? `${card.repo} - ${linkedPrIds.length} linked PR${linkedPrIds.length > 1 ? 's' : ''}`
      : `${card.repo} - No linked PR`
    : `${card.repo} #${card.number}`;

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'group relative bg-card border border-border rounded-md p-3 cursor-pointer',
        'hover:border-muted-foreground/30 transition-all duration-200',
        isDragging && 'shadow-lg shadow-black/50 rotate-2'
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <div className="mb-2">
        <h3 className="text-sm font-medium text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {card.title}
        </h3>
      </div>

      <div className="mb-2 rounded-md border border-border bg-muted/30 px-2.5 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <GitPullRequest
            className={cn(
              'w-4 h-4 flex-shrink-0',
              hasAssociatedPr ? 'text-green-500' : 'text-muted-foreground'
            )}
          />
          <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground font-mono">{cardMetaText}</p>
          {labelStatus && <PrLabel status={labelStatus} />}
        </div>
      </div>

      {(card.conversations ?? []).some((conversation) => conversation.activity) && (
        <div className="mb-2 space-y-1">
          {(card.conversations ?? [])
            .filter((conversation) => conversation.activity)
            .map((conversation) => (
              <div key={`${card.id}-activity-${conversation.id}`} className="p-2 rounded bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground font-mono truncate">
                  <span className="gradient-flow">{conversation.activity}</span>
                </p>
              </div>
            ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Bot className="w-3 h-3" />
            {conversationCount}
          </span>
          <CommentsDialog
            count={card.comments}
            trigger={
              <button
                type="button"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="View comments"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageSquare className="w-3 h-3" />
                <span>{card.comments}</span>
              </button>
            }
          />
          <CiChecksDialog
            count={4}
            trigger={
              <button
                type="button"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="View CI check results"
                onClick={(e) => e.stopPropagation()}
              >
                <Check className="w-3 h-3" />
                <span>4</span>
              </button>
            }
          />
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTimeAgo(card.updatedAt)}
        </div>
      </div>
    </motion.div>
  );
}

function getPrLabelStatus(card: PRCardType): PrLabelStatus | null {
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
