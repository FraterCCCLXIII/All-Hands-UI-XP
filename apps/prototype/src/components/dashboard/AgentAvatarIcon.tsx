import type { LucideIcon } from 'lucide-react';
import { FileText, FlaskConical, Search, ShieldCheck } from 'lucide-react';
import type { AgentAvatar } from '../../types/pr';

const agentAvatarIcons: Record<AgentAvatar, LucideIcon> = {
  search: Search,
  flask: FlaskConical,
  'file-text': FileText,
  shield: ShieldCheck,
};

interface AgentAvatarIconProps {
  icon: AgentAvatar;
  className?: string;
}

export function AgentAvatarIcon({ icon, className }: AgentAvatarIconProps) {
  const Icon = agentAvatarIcons[icon];

  return <Icon className={className} aria-hidden="true" />;
}
