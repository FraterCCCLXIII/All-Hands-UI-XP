import { PRCard as PRCardType } from '../../types/pr';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

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

      {(() => {
        const firstActive = (card.conversations ?? []).find((c) => c.activity);
        return firstActive ? (
          <div className="mb-2 space-y-1">
            <div key={`${card.id}-activity-${firstActive.id}`} className="p-2 rounded bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground font-mono truncate">
                <span className="gradient-flow">{firstActive.activity}</span>
              </p>
            </div>
          </div>
        ) : null;
      })()}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTimeAgo(card.updatedAt)}
        </div>
      </div>
    </motion.div>
  );
}
