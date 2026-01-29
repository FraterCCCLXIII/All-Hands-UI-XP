import { useState } from 'react';
import { Bot, ChevronDown, GitBranch, GitPullRequest, Github, MessageSquare, Minus } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { CiChecksDialog } from './CiChecksDialog';
import { CommentsDialog } from './CommentsDialog';
import { ConversationCard } from './ConversationCard';
import { NewConversationDialog } from './NewConversationDialog';
import { cn } from '../../lib/utils';

interface Conversation {
  id: string;
  name: string;
  description: string;
  timestamp: string;
  agentStatus: 'active' | 'idle' | 'error';
  isActive: boolean;
  commitStatus?: string;
}

interface Branch {
  name: string;
  status: 'open' | 'error' | 'closed' | 'draft';
  conversations: Conversation[];
  prNumber?: number;
  prTitle?: string;
  commitStatus?: string;
}

interface RepositorySectionProps {
  name: string;
  branches: Branch[];
  stats?: {
    prs: number;
    commits: number;
    messages: number;
    agents: number;
  };
}

export function RepositorySection({ name, branches, stats }: RepositorySectionProps) {
  const [expandedBranches, setExpandedBranches] = useState<string[]>([branches[0]?.name]);
  const [expandedInactiveBranches, setExpandedInactiveBranches] = useState<string[]>([]);

  const HeaderIcon = name === 'No Repository' ? Minus : Github;

  const toggleBranch = (branchName: string) => {
    setExpandedBranches((prev) =>
      prev.includes(branchName) ? prev.filter((b) => b !== branchName) : [...prev, branchName]
    );
  };

  const toggleInactiveBranch = (branchName: string) => {
    setExpandedInactiveBranches((prev) =>
      prev.includes(branchName) ? prev.filter((b) => b !== branchName) : [...prev, branchName]
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/70 border-b-[1px] border-border">
        <div className="flex items-center gap-2">
          <HeaderIcon className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{name}</span>
        </div>
        <NewConversationDialog repositoryName={name} branches={branches.map((branch) => branch.name)} />
      </div>

      <div className="divide-y divide-border">
        {branches.map((branch) => {
          const isExpanded = expandedBranches.includes(branch.name);
          const isInactiveExpanded = expandedInactiveBranches.includes(branch.name);
          const activeConversations = branch.conversations.filter((c) => c.isActive);
          const inactiveConversations = branch.conversations.filter((c) => !c.isActive);
          const branchId = `${name}-${branch.name}`.replace(/\s+/g, '-').toLowerCase();
          const branchContentId = `${branchId}-content`;

          return (
            <div key={branch.name}>
              <button
                type="button"
                onClick={() => toggleBranch(branch.name)}
                aria-expanded={isExpanded}
                aria-controls={branchContentId}
                className="w-full px-4 py-3 flex items-center justify-between bg-secondary/50 text-left hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  {branch.prNumber ? (
                    <GitPullRequest className="w-4 h-4 text-green-500" />
                  ) : (
                    <GitBranch className="w-4 h-4 text-sky-400" />
                  )}
                  <div className="flex items-center gap-2 min-w-0">
                    {branch.prNumber && (
                      <span className="text-muted-foreground whitespace-nowrap">PR #{branch.prNumber}</span>
                    )}
                    <span className="text-foreground whitespace-nowrap">{branch.prTitle || branch.name}</span>
                    {['open', 'error', 'closed'].includes(branch.status) && (
                      <StatusBadge variant={branch.status as 'open' | 'error' | 'closed'}>
                        {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
                      </StatusBadge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Toggle branch"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleBranch(branch.name);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:bg-muted/80"
                    >
                      <Bot className="w-3 h-3" />
                      {activeConversations.length}
                    </button>
                    <CiChecksDialog count={stats?.commits ?? 0} />
                    <CommentsDialog count={branch.conversations.length} />
                  </div>
                  <NewConversationDialog repositoryName={name} branches={branches.map((branch) => branch.name)} />
                </div>
              </button>

              {isExpanded && (
                <div id={branchContentId}>
                  {activeConversations.length > 0 && (
                    <div className="px-4 pb-3 space-y-3">
                      {activeConversations.map((conv) => (
                        <ConversationCard key={conv.id} conversation={conv} showBranchActions={!branch.prNumber} />
                      ))}
                    </div>
                  )}

                  {inactiveConversations.length > 0 && (
                    <div className="px-4 pb-3">
                      <button
                        type="button"
                        onClick={() => toggleInactiveBranch(branch.name)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                      >
                        <ChevronDown
                          className={cn('w-4 h-4 transition-transform', !isInactiveExpanded && '-rotate-90')}
                        />
                        <span>Inactive Conversations</span>
                        <span className="flex items-center gap-1 text-xs">
                          <MessageSquare className="w-3 h-3" />
                          {inactiveConversations.length}
                        </span>
                      </button>
                      {isInactiveExpanded && (
                        <div className="space-y-2">
                          {inactiveConversations.map((conv) => (
                            <ConversationCard
                              key={conv.id}
                              conversation={conv}
                              isCompact
                              showBranchActions={!branch.prNumber}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
