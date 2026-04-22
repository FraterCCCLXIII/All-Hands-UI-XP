import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  CircleArrowRight,
  Code2,
  Copy,
  ListTodo,
} from 'lucide-react';

import { cn } from '../../lib/utils';
import { ConversationAgentBubble, ConversationUserBubble } from './conversationBubbles';

export { ConversationAgentBubble as AgentMessage, ConversationUserBubble as UserMessage };

// ─── Tool disclosure ──────────────────────────────────────────────────────────

interface DisclosureProps {
  verb: string;
  target: string;
  fullPath: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ToolDisclosure({
  verb,
  target,
  fullPath,
  children,
  defaultOpen = false,
}: DisclosureProps) {
  const [expanded, setExpanded] = useState(defaultOpen);
  return (
    <div className="my-2 flex w-full flex-col gap-2 py-2 font-sans text-sm text-muted-foreground">
      <div className="flex items-center justify-between font-normal text-muted-foreground">
        <div>
          <span className="text-muted-foreground">{verb}</span>{' '}
          <span className="font-sans" title={fullPath}>
            {target}
          </span>
          <button
            type="button"
            className="cursor-pointer text-left"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            aria-expanded={expanded}
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? (
              <ChevronUp className="ml-2 inline h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="ml-2 inline h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
      {expanded && children}
    </div>
  );
}

// ─── Skill ready ─────────────────────────────────────────────────────────────

export interface SkillKnowledgeItem {
  title: string;
  matchKeyword: string;
  path: string;
  body: string;
  defaultOpen?: boolean;
}

function SkillKnowledgeRow({ item }: { item: SkillKnowledgeItem }) {
  const [open, setOpen] = useState(item.defaultOpen ?? false);
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 bg-muted/20 px-3 py-1.5 text-left text-xs font-semibold text-foreground transition-colors hover:bg-muted/60"
        aria-expanded={open}
      >
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
        {item.title}
      </button>
      {open && (
        <div className="border-t border-border bg-muted/20 p-4 text-sm">
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            The following information has been included based on a keyword match for &quot;{item.matchKeyword}&quot;.
            <br />
            Path: {item.path}
          </p>
          <p className="whitespace-pre-wrap leading-relaxed text-foreground">{item.body}</p>
        </div>
      )}
    </div>
  );
}

export function SkillReady({ skills }: { skills: SkillKnowledgeItem[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="my-2 text-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-2 flex items-center gap-1.5 font-medium text-foreground"
        aria-expanded={open}
      >
        Skill Ready
        <ChevronDown
          className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open && (
        <div className="flex flex-col gap-2">
          <p className="mb-1 text-xs text-muted-foreground">Triggered Skill Knowledge:</p>
          {skills.map((s, i) => (
            <SkillKnowledgeRow key={`${s.path}-${i}`} item={s} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Code block ───────────────────────────────────────────────────────────────

interface CodeBlockProps {
  language: string;
  code: string;
  filename?: string;
}

export function CodeBlock({ language, code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border bg-[hsl(var(--card))] px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          {filename && <span className="font-mono text-xs text-muted-foreground">{filename}</span>}
          {!filename && <span className="text-xs text-muted-foreground">{language}</span>}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="overflow-auto bg-[hsl(var(--card))] p-4 font-mono text-xs leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Diff block ───────────────────────────────────────────────────────────────

export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
}

export function DiffBlock({ filename, lines }: { filename: string; lines: DiffLine[] }) {
  return (
    <div className="my-2 overflow-hidden rounded-xl border border-border">
      <div className="border-b border-border bg-[hsl(var(--card))] px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">{filename}</span>
      </div>
      <pre className="overflow-auto bg-[hsl(var(--card))] p-0 font-mono text-xs leading-relaxed">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              'px-4 py-0.5',
              line.type === 'add' && 'bg-success/10 text-success-foreground',
              line.type === 'remove' && 'bg-destructive/10 text-destructive-foreground',
              line.type === 'context' && 'text-muted-foreground'
            )}
          >
            <span className="mr-2 select-none opacity-50">
              {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
            </span>
            {line.content}
          </div>
        ))}
      </pre>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-2 overflow-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {headers.map((h) => (
              <th key={h} className="h-9 px-4 py-0 text-left font-semibold text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border bg-muted/20 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="h-9 px-4 py-0 font-mono text-foreground/80">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Task tracker ─────────────────────────────────────────────────────────────

type TaskStatus = 'completed' | 'in_progress' | 'pending';

export interface Task {
  label: string;
  status: TaskStatus;
  note?: string;
}

function TaskStatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'completed') {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground" aria-label="Completed" />;
  }
  if (status === 'in_progress') {
    return <CircleArrowRight className="h-4 w-4 shrink-0 text-foreground" aria-label="In progress" />;
  }
  return <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-label="Pending" />;
}

export function TaskTracker({ tasks }: { tasks: Task[] }) {
  return (
    <div className="my-2 flex w-full flex-col overflow-clip rounded-xl border border-border bg-card">
      <div className="flex h-[41px] shrink-0 items-center gap-1 border-b border-border px-2">
        <ListTodo className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-nowrap text-xs font-medium leading-[16px] tracking-[0.11px] text-foreground">
          Tasks
        </span>
      </div>
      <div>
        {tasks.map((task, i) => (
          <div key={i} className="flex w-full items-start gap-[14px] px-4 py-2">
            <div className="mt-0.5">
              <TaskStatusIcon status={task.status} />
            </div>
            <div className="flex flex-col items-start justify-center whitespace-normal font-normal leading-[20px]">
              <span
                className={cn(
                  'text-xs font-normal',
                  task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'
                )}
              >
                {task.label}
              </span>
              {task.note && <span className="text-xs font-normal text-muted-foreground">{task.note}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Diff summary ─────────────────────────────────────────────────────────────

interface DiffSummaryFile {
  path: string;
  added: number;
  removed: number;
}

interface DiffSummaryProps {
  files: DiffSummaryFile[];
  onUndo?: () => void;
}

export function DiffSummary({ files, onUndo }: DiffSummaryProps) {
  const totalAdded = files.reduce((s, f) => s + f.added, 0);
  const totalRemoved = files.reduce((s, f) => s + f.removed, 0);

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-border bg-card text-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-medium text-foreground">
          {files.length} file{files.length !== 1 ? 's' : ''} changed{' '}
          <span className="text-success">+{totalAdded}</span> <span className="text-destructive">-{totalRemoved}</span>
        </span>
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Undo
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="lucide"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 14 4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
            </svg>
          </button>
        )}
      </div>
      {files.map((file) => (
        <div
          key={file.path}
          className="flex items-center justify-between border-b border-border/50 px-4 py-2.5 last:border-0"
        >
          <span className="font-mono text-xs text-foreground/80">{file.path}</span>
          <span className="ml-4 shrink-0 text-xs">
            <span className="text-success">+{file.added}</span> <span className="text-destructive">-{file.removed}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── File tree ────────────────────────────────────────────────────────────────

export function FileTree({ lines }: { lines: string[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2 overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy"
        className="absolute right-3 top-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre className="overflow-auto p-4 pr-8 font-mono text-xs leading-relaxed text-foreground/80">
        {lines.join('\n')}
      </pre>
    </div>
  );
}

// ─── Inline prose helpers ─────────────────────────────────────────────────────

export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('py-1.5 first:pt-0 last:pb-0 leading-relaxed', className)}>{children}</p>;
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.8em] text-foreground">
      {children}
    </code>
  );
}

// ─── Sample data (conversation demo) ──────────────────────────────────────────

export const TASKS_ALL_STATES: Task[] = [
  { label: 'Scaffold project structure', status: 'completed' },
  { label: 'Install dependencies', status: 'completed', note: 'npm install completed' },
  { label: 'Configure Vite + TypeScript', status: 'in_progress', note: 'Fixing tsconfig paths' },
  { label: 'Write unit tests', status: 'pending' },
  { label: 'Set up CI pipeline', status: 'pending' },
];

export const SKILL_READY_ITEMS: SkillKnowledgeItem[] = [
  {
    title: 'GitHub',
    matchKeyword: 'github',
    path: '/home/openhands/.openhands/cache/skills/public-skills/skills/github/SKILL.md',
    body: 'You have access to an environment variable, GITHUB_TOKEN, which allows you to interact with the GitHub API.\nALWAYS use the GitHub API for operations instead of a web browser. Use the create_pr tool to open a pull request.',
  },
  {
    title: 'GitHub',
    matchKeyword: 'github',
    path: '/home/openhands/.openhands/cache/skills/public-skills/skills/github/SKILL.md',
    body: 'You have access to an environment variable, GITHUB_TOKEN, which allows you to interact with the GitHub API.\nALWAYS use the GitHub API for operations instead of a web browser. Use the create_pr tool to open a pull request.',
  },
  {
    title: 'GitHub',
    matchKeyword: 'github',
    path: '/home/openhands/.openhands/cache/skills/public-skills/skills/github/SKILL.md',
    body: 'You have access to an environment variable, GITHUB_TOKEN, which allows you to interact with the GitHub API.\nALWAYS use the GitHub API for operations instead of a web browser. Use the create_pr tool to open a pull request.',
    defaultOpen: true,
  },
];
