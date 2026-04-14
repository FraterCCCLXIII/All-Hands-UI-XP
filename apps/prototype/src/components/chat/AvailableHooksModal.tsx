import { useState, useEffect } from 'react';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';

interface Hook {
  name: string;
  trigger: string;
  description?: string;
}

const MOCK_HOOKS: Hook[] = [
  { name: 'Pull request opened', trigger: 'GitHub', description: 'Fires when a new pull request is opened in the connected repository. The agent receives the PR title, body, diff, and author metadata.' },
  { name: 'Pull request merged', trigger: 'GitHub', description: 'Fires when a pull request is successfully merged. Useful for triggering post-merge automation such as changelog generation or deployment steps.' },
  { name: 'Pull request closed', trigger: 'GitHub', description: 'Fires when a pull request is closed without merging. Can be used to clean up branches or notify stakeholders.' },
  { name: 'Issue labeled', trigger: 'GitHub', description: 'Fires when a label is added to an issue. Often used to route issues to specific agents or workflows based on the label applied.' },
  { name: 'Issue opened', trigger: 'GitHub', description: 'Fires when a new issue is created. The agent receives the issue title, body, labels, and author.' },
  { name: 'Issue closed', trigger: 'GitHub', description: 'Fires when an issue is closed. Can trigger follow-up actions such as linking the closing commit or notifying the reporter.' },
  { name: 'Push to main', trigger: 'GitHub', description: 'Fires on every push to the main branch. Commonly used to run tests, update documentation, or kick off a deployment pipeline.' },
  { name: 'Deployment succeeded', trigger: 'Deploy', description: 'Fires after a successful deployment. Can be used to run smoke tests, send notifications, or update a status dashboard.' },
  { name: 'Deployment failed', trigger: 'Deploy', description: 'Fires when a deployment fails. Triggers incident response workflows or notifies on-call engineers.' },
  { name: 'Slash command', trigger: 'Slack', description: 'Fires when a user invokes a registered slash command in a Slack workspace. The agent receives the command text and user context.' },
  { name: 'Message received', trigger: 'Slack', description: 'Fires when the bot receives a direct message or is mentioned in a channel. Allows the agent to respond conversationally.' },
  { name: 'Linear issue transition', trigger: 'Linear', description: 'Fires when a Linear issue moves between workflow states. Useful for triggering code generation or review when an issue enters "In Progress".' },
  { name: 'Linear issue created', trigger: 'Linear', description: 'Fires when a new issue is created in Linear. Can automatically assign agents, add labels, or generate an initial implementation plan.' },
  { name: 'Scheduled run', trigger: 'Cron', description: 'Fires on a configured cron schedule. Used for recurring tasks such as dependency updates, report generation, or health checks.' },
  { name: 'Nightly digest', trigger: 'Cron', description: 'Fires once per night to compile a summary of activity, open issues, and pending reviews for distribution to the team.' },
  { name: 'Agent start', trigger: 'Agent', description: 'Fires when a new agent session begins. Can be used to inject context, load memory, or greet the user.' },
  { name: 'Agent stop', trigger: 'Agent', description: 'Fires when an agent session ends. Useful for persisting state, writing summaries, or triggering post-session cleanup.' },
  { name: 'Conversation created', trigger: 'Agent', description: 'Fires when a new conversation is created in OpenHands. Can pre-populate context or load relevant skills automatically.' },
  { name: 'Task completed', trigger: 'Agent', description: 'Fires when the agent marks a task as complete. Can trigger downstream actions such as opening a pull request or sending a notification.' },
];

const SIMULATED_LOAD_MS = 1200;

function HookTableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <tr key={i} className="animate-pulse border-b border-border">
          <td className="py-3.5 pl-3 pr-2">
            <div className="h-3.5 w-40 rounded bg-muted" />
          </td>
          <td className="py-3.5 px-2">
            <div className="h-5 w-16 rounded-full bg-muted" />
          </td>
          <td className="py-3.5 pr-3 w-6" />
        </tr>
      ))}
    </>
  );
}

function HookTableRow({ hook }: { hook: Hook }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = Boolean(hook.description);

  return (
    <>
      <tr
        role="button"
        tabIndex={hasDetail ? 0 : -1}
        aria-expanded={hasDetail ? expanded : undefined}
        aria-label={hasDetail ? `Expand ${hook.name}` : undefined}
        onClick={() => hasDetail && setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (hasDetail && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        className={cn(
          'transition-colors',
          expanded ? 'border-b-0' : 'border-b border-border',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
          hasDetail ? 'hover:bg-muted/30 cursor-pointer' : 'cursor-default',
          expanded && 'bg-muted/20'
        )}
      >
        <td className="py-3.5 pl-3 pr-2 text-sm font-medium text-foreground">
          {hook.name}
        </td>
        <td className="py-3.5 px-2">
          <Badge variant="secondary" className="bg-muted text-muted-foreground border-transparent">
            {hook.trigger}
          </Badge>
        </td>
        <td className="py-3.5 pr-3 w-6 text-right text-muted-foreground">
          {hasDetail && (
            <ChevronRight
              className={cn('h-3.5 w-3.5 ml-auto transition-transform duration-200', expanded && 'rotate-90')}
              aria-hidden
            />
          )}
        </td>
      </tr>

      {expanded && hasDetail && (
        <tr className="border-b border-border bg-muted/10">
          <td colSpan={3} className="px-3 pb-4 pt-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{hook.description}</p>
          </td>
        </tr>
      )}
    </>
  );
}

interface AvailableHooksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvailableHooksModal({ open, onOpenChange }: AvailableHooksModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), SIMULATED_LOAD_MS);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsRefreshing(false);
    }, SIMULATED_LOAD_MS);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="hooks-modal"
        className="flex flex-col gap-4 w-[min(700px,95vw)] max-w-none h-[80vh]"
      >
        <div className="flex items-center gap-2">
          <DialogTitle className="text-xl font-semibold leading-6 -tracking-[0.01em]">
            Available Hooks
          </DialogTitle>
          <button
            data-testid="refresh-hooks"
            type="button"
            disabled={isRefreshing}
            onClick={handleRefresh}
            aria-label="Refresh hooks"
            title="Refresh hooks"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              'transition-colors cursor-pointer',
              'disabled:opacity-30 disabled:cursor-not-allowed',
            )}
          >
            <RefreshCw
              className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              aria-hidden
            />
          </button>
        </div>

        <p className="font-normal text-sm text-muted-foreground">
          Hooks are event-driven triggers that run agent actions automatically. Stop the
          conversation and click refresh after adding or removing hooks to see the latest state.
        </p>

        <div className="flex-1 min-h-0 overflow-auto rounded-md border border-border custom-scrollbar bg-muted/30">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {isLoading ? (
                <HookTableSkeleton />
              ) : (
                MOCK_HOOKS.map((hook) => (
                  <HookTableRow key={hook.name} hook={hook} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
