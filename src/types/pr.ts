export interface PRLabel {
  name: string;
  color: 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'muted';
}

export type AgentAvatar = 'search' | 'flask' | 'file-text' | 'shield';

export interface Skill {
  id: string;
  name: string;
  icon: AgentAvatar;
  description: string;
}

export interface PRCard {
  id: string;
  number: number;
  title: string;
  repo: string;
  author: {
    name: string;
    avatar: string;
  };
  labels: PRLabel[];
  additions: number;
  deletions: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  branch: string;
  baseBranch: string;
  status: 'open' | 'draft' | 'approved' | 'changes-requested' | 'merged';
  conversations?: Conversation[];
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  skillId?: string;
}

export interface Conversation {
  id: string;
  name: string;
  skillId?: string;
  activity?: string;
  messages: AgentMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: PRCard[];
}
