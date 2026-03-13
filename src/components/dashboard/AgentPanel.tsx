import { useMemo, useState } from 'react';
import { PRCard } from '../../types/pr';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import {
  ArrowDown, ArrowUp, ChevronDown, Circle, CircleCheckBig,
  ExternalLink, GitBranch, GitPullRequest, ListTodo,
  Minus, Plus, X,
} from 'lucide-react';
import { ChatInputBox } from '../common/ChatInputBox';

interface ToolStep {
  action: 'Read' | 'Ran' | 'Write' | 'Browse';
  target: string;
  done: boolean;
}

interface ThreadMessage {
  role: 'user' | 'agent';
  content?: string;
  steps?: ToolStep[];
  link?: string;
  warnings?: string[];
  tasks?: string[];
}

const MOCK_THREAD: ThreadMessage[] = [
  { role: 'user', content: 'run this' },
  {
    role: 'agent',
    steps: [
      { action: 'Read', target: 'project/', done: true },
      { action: 'Read', target: 'package.json', done: true },
      { action: 'Ran', target: 'cat server.log', done: true },
    ],
    content: 'The server is running! There are some warnings about missing files and CSS import order, but the server has started on port 12000.\n\n✅ **The app is now running!** You can access it at:',
    link: 'https://work-1-vliuruphcuvxshgd.prod-runtime.all-hands.dev',
    warnings: [
      'Missing import ./components/chat/ConversationDrawer in App.tsx',
      'Missing import ../ui/popover in LeftNav.tsx',
      'CSS @import should be placed before @tailwind directives',
      'Duplicate style attribute in WavingHand.tsx',
    ],
    tasks: [
      'Fix missing module imports (ConversationDrawer, conversations, popover)',
      'Fix TopBar and ChatArea props (activeChatWindowTab)',
      'Fix Canvas component props (theme not in types)',
      'Fix ChatThread.tsx (messagesEndRef, unused imports)',
      'Fix WavingHand.tsx duplicate style attribute',
      'Fix remaining unused variable warnings',
      'Test build to verify all errors are fixed',
    ],
  },
];

interface AgentPanelProps {
  card: PRCard | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (cardId: string, skillId?: string, skillName?: string) => string;
  onSendMessage: (cardId: string, conversationId: string, message: string) => void;
  showConversationFooter?: boolean;
  availablePullRequests?: PRCard[];
}

export function AgentPanel({
  card,
  isOpen,
  onClose,
  onCreateConversation: _onCreateConversation,
  onSendMessage: _onSendMessage,
  showConversationFooter: _showConversationFooter = true,
  availablePullRequests = [],
}: AgentPanelProps) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const isPrimaryPrCard = card?.sourceType !== 'task';
  const pullRequestById = useMemo(
    () => new Map(availablePullRequests.map((pr) => [pr.id, pr])),
    [availablePullRequests]
  );
  const prDetails = useMemo(() => {
    if (!card) return null;
    if (isPrimaryPrCard) return card;
    if (card.linkedPrId) {
      const linked = pullRequestById.get(card.linkedPrId);
      if (linked) return linked;
    }
    return card;
  }, [card, isPrimaryPrCard, pullRequestById]);

  const toggleStep = (key: string) =>
    setExpandedSteps((prev) => ({ ...prev, [key]: !prev[key] }));

  if (!card) return null;

  const repoUrl = `https://github.com/FraterCCCLXIII/${card.repo.split('/').pop() ?? 'repo'}`;
  const branchUrl = `${repoUrl}/tree/${prDetails?.branch ?? 'main'}`;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-background p-0 flex flex-col" hideClose>
        {/* Header */}
        <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
            <SheetTitle className="text-left text-base font-medium leading-tight truncate flex-1">{card.title}</SheetTitle>
            <button
              type="button"
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Open conversation in new window"
              onClick={() => window.open(window.location.href, '_blank')}
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </button>
            <SheetClose className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none">
              <X className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Stats row - only for non-task cards */}
        {isPrimaryPrCard && (
          <div className="px-4 pb-2 pt-0 shrink-0">
            <div className="flex items-center justify-end text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Plus className="w-3 h-3 text-success" aria-hidden="true" />
                  <span className="text-success">{card.additions}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Minus className="w-3 h-3 text-destructive" aria-hidden="true" />
                  <span className="text-destructive">{card.deletions}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Chat thread */}
        <div className="scrollbar-on-hover flex-1 overflow-y-auto px-4 pt-2 pb-2 flex flex-col gap-2 min-h-0">
          {MOCK_THREAD.map((msg, msgIdx) => {
            if (msg.role === 'user') {
              return (
                <article
                  key={msgIdx}
                  className="rounded-xl relative w-fit max-w-full last:mb-4 flex flex-col gap-2 p-3 bg-muted self-end"
                >
                  <p className="text-sm" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {msg.content}
                  </p>
                </article>
              );
            }

            return (
              <article
                key={msgIdx}
                className="rounded-xl relative last:mb-4 flex flex-col gap-2 mt-4 w-full max-w-full bg-transparent"
              >
                <div className="text-sm w-full flex flex-col gap-2" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  {/* Tool steps */}
                  {msg.steps?.map((step, stepIdx) => {
                    const key = `${msgIdx}-${stepIdx}`;
                    const isExpanded = expandedSteps[key];
                    return (
                      <div
                        key={stepIdx}
                        className="flex flex-col gap-1 py-2 text-sm text-muted-foreground font-sans"
                      >
                        <div className="flex items-center justify-between font-normal text-muted-foreground">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-muted-foreground/70 shrink-0">{step.action}</span>
                            <span className="font-mono text-xs truncate">{step.target}</span>
                            <button
                              type="button"
                              onClick={() => toggleStep(key)}
                              aria-label={isExpanded ? 'Collapse' : 'Expand'}
                              aria-expanded={isExpanded}
                              className="cursor-pointer text-left shrink-0"
                            >
                              <ChevronDown
                                className={`h-4 w-4 ml-1 inline text-muted-foreground/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                          {step.done && (
                            <CircleCheckBig className="h-4 w-4 ml-2 shrink-0 text-success" aria-hidden="true" />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Text content */}
                  {msg.content && (
                    <div className="flex flex-col gap-1.5">
                      {msg.content.split('\n\n').map((para, i) => (
                        <p
                          key={i}
                          className="py-1 first:pt-0 last:pb-0 text-sm text-foreground"
                          dangerouslySetInnerHTML={{
                            __html: para
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/`(.*?)`/g, '<code class="bg-muted text-foreground px-1.5 py-0.5 rounded border border-border text-xs font-mono">$1</code>'),
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Link */}
                  {msg.link && (
                    <a
                      href={msg.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm break-all"
                    >
                      {msg.link}
                    </a>
                  )}

                  {/* Warnings */}
                  {msg.warnings && msg.warnings.length > 0 && (
                    <div className="mt-1">
                      <p className="text-sm text-foreground mb-1">Note: There are a few development warnings:</p>
                      <ol className="list-decimal ml-5 pl-2 space-y-1">
                        {msg.warnings.map((w, i) => (
                          <li key={i} className="text-xs text-muted-foreground">{w}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Tasks card */}
                  {msg.tasks && msg.tasks.length > 0 && (
                    <div className="flex flex-col overflow-clip bg-card border border-border rounded-xl w-full mt-2">
                      <div className="flex gap-1.5 items-center border-b border-border h-[41px] px-3 shrink-0">
                        <ListTodo className="shrink-0 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] text-foreground tracking-[0.11px] font-medium leading-[16px]">Tasks</span>
                      </div>
                      <div>
                        {msg.tasks.map((task, taskIdx) => (
                          <div key={taskIdx} className="flex gap-3.5 items-center px-4 py-2 w-full">
                            <Circle className="shrink-0 w-4 h-4 text-foreground" aria-hidden="true" />
                            <span className="font-normal text-[12px] text-foreground leading-5">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Chat input + git actions (only for non-task cards) */}
        <div className="shrink-0 px-4 pb-4 pt-1 flex flex-col gap-3">
          <ChatInputBox />

          {isPrimaryPrCard && (
            <div className="flex flex-row gap-2 items-center overflow-x-auto flex-wrap">
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-row items-center justify-between gap-2 pl-2.5 pr-2.5 py-1 rounded-full flex-1 min-w-0 truncate relative border border-border bg-transparent hover:border-muted-foreground/30 cursor-pointer"
              >
                <GitBranch className="w-3 h-3 text-foreground shrink-0" aria-hidden="true" />
                <span className="font-normal text-foreground text-xs leading-5 truncate flex-1 min-w-0">
                  {card.repo}
                </span>
                <ExternalLink className="w-3 h-3 text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
              </a>
              <a
                href={branchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-row items-center gap-2 pl-2.5 pr-2.5 py-1 rounded-full flex-shrink-0 max-w-[160px] truncate relative border border-border bg-transparent hover:border-muted-foreground/30 cursor-pointer"
              >
                <GitBranch className="w-3 h-3 text-foreground shrink-0" aria-hidden="true" />
                <span className="font-normal text-foreground text-xs leading-5 truncate">{prDetails?.branch ?? 'main'}</span>
                <ExternalLink className="w-3 h-3 text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
              </a>
              <button
                type="button"
                disabled
                className="flex flex-row gap-1 items-center justify-center px-2 py-1 rounded-full bg-muted/50 text-muted-foreground cursor-not-allowed shrink-0"
              >
                <ArrowDown className="w-3 h-3" aria-hidden="true" />
                <span className="text-xs leading-5">Pull</span>
              </button>
              <button
                type="button"
                disabled
                className="flex flex-row gap-1 items-center justify-center px-2 py-1 rounded-full bg-muted/50 text-muted-foreground cursor-not-allowed shrink-0"
              >
                <ArrowUp className="w-3 h-3" aria-hidden="true" />
                <span className="text-xs leading-5">Push</span>
              </button>
              <button
                type="button"
                disabled
                className="flex flex-row gap-1 items-center justify-center px-2 py-1 rounded-full bg-muted/50 text-muted-foreground cursor-not-allowed shrink-0"
              >
                <GitPullRequest className="w-3 h-3" aria-hidden="true" />
                <span className="text-xs leading-5">Pull Request</span>
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

