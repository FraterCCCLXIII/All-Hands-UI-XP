import { PRCard as PRCardType } from '../../types/pr';
import { Bot, Check, Clock, GitPullRequest, MessageSquare, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { CommentsDialog } from './CommentsDialog';
import { CiChecksDialog } from './CiChecksDialog';

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

  return (
    <motion.div
      layoutId={card.id}
      onClick={onClick}
      className={cn(
        'group relative bg-card border border-border rounded-md p-3 cursor-pointer',
        'hover:border-muted-foreground/30 transition-all duration-200',
        isDragging && 'shadow-lg shadow-black/50 rotate-2'
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start gap-2 mb-2">
        <GitPullRequest className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {card.title}
          </h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {card.repo} #{card.number}
          </p>
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
          <span className="flex items-center gap-1">
            <Plus className="w-3 h-3 text-success" />
            <span className="text-success">{card.additions}</span>
          </span>
          <span className="flex items-center gap-1">
            <Minus className="w-3 h-3 text-destructive" />
            <span className="text-destructive">{card.deletions}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTimeAgo(card.updatedAt)}
        </div>
      </div>
    </motion.div>
  );
}
