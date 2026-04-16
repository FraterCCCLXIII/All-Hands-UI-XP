import { PRCard as PRCardType } from '../../types/pr';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { AutomationGlyph } from '../icons/AutomationGlyph';

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
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'group relative bg-card border border-border rounded-modal p-4 cursor-pointer',
        'hover:border-muted-foreground/30 transition-all duration-200',
        isDragging && 'shadow-lg shadow-black/50 rotate-2'
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      {card.sourceType === 'automation' ? (
        <span className="absolute right-4 top-4 inline-flex items-center justify-center text-muted-foreground">
          <AutomationGlyph className="h-4 w-4" />
        </span>
      ) : null}
      <div className="mb-3">
        <div className="flex items-start gap-2">
          <div
            className="flex h-6 w-2 shrink-0 items-center justify-center"
            aria-hidden
          >
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
          </div>
          <h3 className="text-sm font-medium text-foreground leading-6 line-clamp-2 group-hover:text-primary transition-colors">
            {card.title}
          </h3>
        </div>
      </div>

      {(() => {
        const firstActive = (card.conversations ?? []).find((c) => c.activity);
        return firstActive ? (
          <div className="mb-3" key={`${card.id}-activity-${firstActive.id}`}>
            <p className="text-xs text-muted-foreground truncate">
              <span className="gradient-flow">{firstActive.activity}</span>
            </p>
          </div>
        ) : null;
      })()}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="font-medium text-success">+{card.additions}</span>
          <span className="font-medium text-destructive">-{card.deletions}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {formatTimeAgo(card.updatedAt)}
        </div>
      </div>
    </motion.div>
  );
}
