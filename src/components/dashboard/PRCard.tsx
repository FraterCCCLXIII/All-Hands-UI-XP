import { PRCard as PRCardType } from '../../types/pr';
import { Bot, Clock, GitPullRequest, MessageSquare, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { AgentAvatarIcon } from './AgentAvatarIcon';
import { availableSkills } from '../../data/mockData';

interface PRCardProps {
  card: PRCardType;
  onClick: () => void;
  isDragging?: boolean;
}

const labelColorMap = {
  primary: 'bg-primary/20 text-primary border-primary/30',
  success: 'bg-success/20 text-success border-success/30',
  warning: 'bg-warning/20 text-warning border-warning/30',
  destructive: 'bg-destructive/20 text-destructive border-destructive/30',
  info: 'bg-info/20 text-info border-info/30',
  muted: 'bg-muted text-muted-foreground border-muted',
};

const statusColors = {
  open: 'text-success',
  draft: 'text-muted-foreground',
  approved: 'text-primary',
  'changes-requested': 'text-warning',
  merged: 'text-agent',
};

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
  const skillIcons = (card.conversations ?? [])
    .map((conversation) => availableSkills.find((skill) => skill.id === conversation.skillId)?.icon)
    .filter((icon): icon is NonNullable<typeof icon> => Boolean(icon))
    .slice(0, 3);

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
      {conversationCount > 0 && (
        <div
          className={cn(
            'absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
            'bg-secondary border border-border'
          )}
        >
          <span>
            {conversationCount} convo{conversationCount > 1 ? 's' : ''}
          </span>
          {skillIcons.map((icon, index) => (
            <AgentAvatarIcon key={`${card.id}-skill-${index}`} icon={icon} className="w-3 h-3" />
          ))}
        </div>
      )}

      <div className="flex items-start gap-2 mb-2">
        <GitPullRequest className={cn('w-4 h-4 mt-0.5 flex-shrink-0', statusColors[card.status])} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {card.title}
          </h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {card.repo} #{card.number}
          </p>
        </div>
      </div>

      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label) => (
            <span
              key={label.name}
              className={cn('px-1.5 py-0.5 text-[10px] font-medium rounded border', labelColorMap[label.color])}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {(card.conversations ?? []).some((conversation) => conversation.activity) && (
        <div className="mb-2 space-y-1">
          {(card.conversations ?? [])
            .filter((conversation) => conversation.activity)
            .map((conversation) => (
              <div key={`${card.id}-activity-${conversation.id}`} className="p-2 rounded bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground font-mono truncate">{conversation.activity}</p>
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
          <span className="flex items-center gap-1">
            <Plus className="w-3 h-3 text-success" />
            <span className="text-success">{card.additions}</span>
          </span>
          <span className="flex items-center gap-1">
            <Minus className="w-3 h-3 text-destructive" />
            <span className="text-destructive">{card.deletions}</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {card.comments}
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
