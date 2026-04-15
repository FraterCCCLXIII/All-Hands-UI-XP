import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  CircleArrowRight,
  ListTodo,
  Code2,
  Copy,
  Check,
  FileText,
  ImageIcon,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ─── Shared layout primitives ────────────────────────────────────────────────

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-10 mb-4">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── User bubble ─────────────────────────────────────────────────────────────

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <article className="rounded-xl relative w-fit max-w-full flex flex-col gap-2 p-3 bg-muted self-end text-sm">
      {children}
    </article>
  );
}

// ─── Agent message wrapper ────────────────────────────────────────────────────

function AgentMessage({ children }: { children: React.ReactNode }) {
  return (
    <article className="rounded-xl relative last:mb-4 flex flex-col gap-2 mt-2 w-full max-w-full bg-transparent text-sm">
      {children}
    </article>
  );
}

// ─── Tool disclosure ──────────────────────────────────────────────────────────

interface DisclosureProps {
  verb: string;
  target: string;
  fullPath: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ToolDisclosure({ verb, target, fullPath, children, defaultOpen = false }: DisclosureProps) {
  const [expanded, setExpanded] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-2 my-2 py-2 text-sm text-muted-foreground w-full font-sans">
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
              <ChevronUp className="h-4 w-4 ml-2 inline text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2 inline text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
      {expanded && children}
    </div>
  );
}

// ─── Skill ready ─────────────────────────────────────────────────────────────

interface SkillKnowledgeItem {
  title: string;
  matchKeyword: string;
  path: string;
  body: string;
  defaultOpen?: boolean;
}

function SkillKnowledgeRow({ item }: { item: SkillKnowledgeItem }) {
  const [open, setOpen] = useState(item.defaultOpen ?? false);
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-semibold text-foreground bg-muted/20 hover:bg-muted/60 transition-colors text-left"
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
        <div className="p-4 text-sm border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            The following information has been included based on a keyword match for &quot;{item.matchKeyword}&quot;.<br />
            Path: {item.path}
          </p>
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{item.body}</p>
        </div>
      )}
    </div>
  );
}

function SkillReady({ skills }: { skills: SkillKnowledgeItem[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="my-2 text-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-foreground font-medium mb-2"
        aria-expanded={open}
      >
        Skill Ready
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground mb-1">Triggered Skill Knowledge:</p>
          {skills.map((s) => (
            <SkillKnowledgeRow key={s.path} item={s} />
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

function CodeBlock({ language, code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden my-2">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[hsl(var(--card))] border-b border-border">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-muted-foreground" aria-hidden />
          {filename && <span className="text-xs font-mono text-muted-foreground">{filename}</span>}
          {!filename && <span className="text-xs text-muted-foreground">{language}</span>}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-success" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      <pre className="p-4 overflow-auto text-xs font-mono text-foreground bg-[hsl(var(--card))] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Diff block ───────────────────────────────────────────────────────────────

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
}

function DiffBlock({ filename, lines }: { filename: string; lines: DiffLine[] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden my-2">
      <div className="flex items-center px-3 py-1.5 bg-[hsl(var(--card))] border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{filename}</span>
      </div>
      <pre className="p-0 overflow-auto text-xs font-mono leading-relaxed bg-[hsl(var(--card))]">
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
            <span className="select-none mr-2 opacity-50">
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

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-auto rounded-xl border border-border my-2">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {headers.map((h) => (
              <th key={h} className="px-4 h-9 py-0 text-left font-semibold text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 bg-muted/20">
              {row.map((cell, j) => (
                <td key={j} className="px-4 h-9 py-0 text-foreground/80 font-mono">
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

interface Task {
  label: string;
  status: TaskStatus;
  note?: string;
}

function TaskStatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'completed') {
    return <CheckCircle2 className="shrink-0 w-4 h-4 text-foreground" aria-label="Completed" />;
  }
  if (status === 'in_progress') {
    return <CircleArrowRight className="shrink-0 w-4 h-4 text-foreground" aria-label="In progress" />;
  }
  return <Circle className="shrink-0 w-4 h-4 text-muted-foreground" aria-label="Pending" />;
}

function TaskTracker({ tasks }: { tasks: Task[] }) {
  return (
    <div className="flex flex-col overflow-clip bg-card border border-border rounded-xl w-full my-2">
      <div className="flex gap-1 items-center border-b border-border h-[41px] px-2 shrink-0">
        <ListTodo className="shrink-0 w-4 h-4 text-muted-foreground" aria-hidden />
        <span className="text-xs text-nowrap text-foreground tracking-[0.11px] font-medium leading-[16px]">
          Tasks
        </span>
      </div>
      <div>
        {tasks.map((task, i) => (
          <div key={i} className="flex gap-[14px] items-start px-4 py-2 w-full">
            <div className="mt-0.5">
              <TaskStatusIcon status={task.status} />
            </div>
            <div className="flex flex-col items-start justify-center leading-[20px] whitespace-normal font-normal">
              <span
                className={cn(
                  'font-normal text-xs',
                  task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                )}
              >
                {task.label}
              </span>
              {task.note && (
                <span className="font-normal text-xs text-muted-foreground">{task.note}</span>
              )}
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

function DiffSummary({ files, onUndo }: DiffSummaryProps) {
  const totalAdded = files.reduce((s, f) => s + f.added, 0);
  const totalRemoved = files.reduce((s, f) => s + f.removed, 0);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-2 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-foreground font-medium">
          {files.length} file{files.length !== 1 ? 's' : ''} changed{' '}
          <span className="text-success">+{totalAdded}</span>{' '}
          <span className="text-destructive">-{totalRemoved}</span>
        </span>
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Undo
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="lucide" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 14 4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
            </svg>
          </button>
        )}
      </div>
      {/* File rows */}
      {files.map((file) => (
        <div key={file.path} className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 last:border-0">
          <span className="text-xs font-mono text-foreground/80">{file.path}</span>
          <span className="text-xs shrink-0 ml-4">
            <span className="text-success">+{file.added}</span>{' '}
            <span className="text-destructive">-{file.removed}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── File tree ────────────────────────────────────────────────────────────────

function FileTree({ lines }: { lines: string[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2 rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy"
        className="absolute right-3 top-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-success" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
      <pre className="p-4 overflow-auto text-xs font-mono text-foreground/80 leading-relaxed pr-8">
        {lines.join('\n')}
      </pre>
    </div>
  );
}

// ─── Inline prose helpers ─────────────────────────────────────────────────────

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('py-1.5 first:pt-0 last:pb-0 leading-relaxed', className)}>{children}</p>;
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-muted text-foreground px-1.5 py-0.5 rounded border border-border text-[0.8em] font-mono">
      {children}
    </code>
  );
}

// ─── Plan preview ─────────────────────────────────────────────────────────────

const PLAN_PREVIEW_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 109 109" fill="none" className="text-muted-foreground shrink-0" aria-hidden>
    <path d="M40.1979 21.8969L34.7311 17.832L25.2691 30.5574L20.2094 26.784L16.1367 32.2451L26.6653 40.0969L40.1979 21.8969Z" fill="currentColor" />
    <path d="M90.8342 35.1983H50.4639V28.3858H90.8342V35.1983Z" fill="currentColor" />
    <path d="M90.8342 57.9067H50.4638V51.0942H90.8342V57.9067Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M27.2508 63.5837C32.2674 63.5837 36.3342 59.517 36.3342 54.5004C36.3342 49.4838 32.2674 45.4171 27.2508 45.4171C22.2342 45.4171 18.1675 49.4838 18.1675 54.5004C18.1675 59.517 22.2342 63.5837 27.2508 63.5837ZM27.2508 59.0421C29.7591 59.0421 31.7925 57.0087 31.7925 54.5004C31.7925 51.9921 29.7591 49.9587 27.2508 49.9587C24.7425 49.9587 22.7092 51.9921 22.7092 54.5004C22.7092 57.0087 24.7425 59.0421 27.2508 59.0421Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M36.3342 77.2087C36.3342 82.2253 32.2674 86.2921 27.2508 86.2921C22.2342 86.2921 18.1675 82.2253 18.1675 77.2087C18.1675 72.1922 22.2342 68.1254 27.2508 68.1254C32.2674 68.1254 36.3342 72.1922 36.3342 77.2087ZM31.7925 77.2087C31.7925 79.717 29.7591 81.7504 27.2508 81.7504C24.7425 81.7504 22.7092 79.717 22.7092 77.2087C22.7092 74.7005 24.7425 72.6671 27.2508 72.6671C29.7591 72.6671 31.7925 74.7005 31.7925 77.2087Z" fill="currentColor" />
    <path d="M50.4637 80.615H90.834V73.8025H50.4637V80.615Z" fill="currentColor" />
  </svg>
);

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="gradient-flow"
      style={{ display: 'block' }}
    >
      {children}
    </span>
  );
}

type PlanPreviewVariant = 'building' | 'active';

interface PlanPreviewProps {
  variant: PlanPreviewVariant;
}

function PlanPreview({ variant }: PlanPreviewProps) {
  const isBuilding = variant === 'building';

  return (
    <div className="bg-card border border-[hsl(var(--info))] rounded-xl w-full my-2 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border flex h-[41px] items-center px-2 gap-1">
        {PLAN_PREVIEW_ICON}
        <span className="font-medium text-xs text-foreground tracking-[0.11px] leading-4">Plan.md</span>
        <div className="flex-1" />
        <button
          type="button"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          data-testid="plan-preview-view-button"
        >
          <span className="font-medium text-xs tracking-[0.11px] leading-4">View</span>
          <ArrowUpRight className="w-[18px] h-[18px]" aria-hidden />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2.5 p-4 text-sm text-foreground leading-relaxed" data-testid="plan-preview-content">
        <div data-testid="markdown-renderer">
          {isBuilding ? (
            <>
              <GradientText>
                <strong className="text-lg font-bold leading-6 mb-1.5 mt-0 block">1. OBJECTIVE</strong>
              </GradientText>
              <GradientText>
                <span className="block py-2.5 first:pt-0 last:pb-0">
                  Build a simple HTML showcase page that demonstrates all the different types of content and formatting that the OpenHands agent can generate in the user chat interface. This serves as a visual reference/catalog of all supported content types.
                </span>
              </GradientText>
              <GradientText>
                <strong className="text-lg font-bold leading-6 mb-1.5 mt-3 block">2. CONTEXT SUMMARY</strong>
              </GradientText>
              <GradientText>
                <span className="block py-2.5 first:pt-0 last:pb-0">Content Types to ...</span>
              </GradientText>
            </>
          ) : (
            <>
              <h1 className="text-lg text-foreground font-bold leading-6 mb-1.5 mt-0">1. OBJECTIVE</h1>
              <p className="py-2.5 first:pt-0 last:pb-0">
                Build a simple HTML showcase page that demonstrates all the different types of content and formatting that the OpenHands agent can generate in the user chat interface. This serves as a visual reference/catalog of all supported content types.
              </p>
              <h1 className="text-lg text-foreground font-bold leading-6 mb-1.5 mt-3">2. CONTEXT SUMMARY</h1>
              <p className="py-2.5 first:pt-0 last:pb-0">Content Types to ...</p>
            </>
          )}
        </div>
        <button
          type="button"
          className="text-[hsl(var(--info))] cursor-pointer hover:underline text-left text-sm"
          data-testid="plan-preview-read-more-button"
        >
          Read more
        </button>
      </div>

      {/* Footer — only shown when active */}
      {!isBuilding && (
        <div className="border-t border-border flex h-[41px] items-center justify-start px-4">
          <button
            type="button"
            className="flex h-5 min-w-[4.25rem] cursor-pointer items-center justify-center rounded-md bg-primary px-2 text-primary-foreground transition-opacity hover:opacity-90"
            data-testid="plan-preview-build-button"
            aria-label="Build plan"
          >
            <span className="text-xs font-medium leading-5">Build ⌘↩</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const TASKS_ALL_STATES: Task[] = [
  { label: 'Scaffold project structure', status: 'completed' },
  { label: 'Install dependencies', status: 'completed', note: 'npm install completed' },
  { label: 'Configure Vite + TypeScript', status: 'in_progress', note: 'Fixing tsconfig paths' },
  { label: 'Write unit tests', status: 'pending' },
  { label: 'Set up CI pipeline', status: 'pending' },
];

const SKILL_READY_ITEMS: SkillKnowledgeItem[] = [
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

const DIFF_SUMMARY_FILES = [
  { path: 'apps/flowcharts/src/App.tsx',   added: 1, removed: 1 },
  { path: 'apps/flowcharts/src/main.tsx',  added: 1, removed: 1 },
  { path: 'apps/prototype/package.json',   added: 1, removed: 1 },
  { path: 'packages/ui/src/index.ts',      added: 4, removed: 4 },
];

const DIFF_LINES: DiffLine[] = [
  { type: 'context', content: 'import { useState } from "react";' },
  { type: 'context', content: '' },
  { type: 'remove', content: 'export function Counter() {' },
  { type: 'add',    content: 'export function Counter({ initialCount = 0 }: { initialCount?: number }) {' },
  { type: 'remove', content: '  const [count, setCount] = useState(0);' },
  { type: 'add',    content: '  const [count, setCount] = useState(initialCount);' },
  { type: 'context', content: '' },
  { type: 'context', content: '  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;' },
  { type: 'context', content: '}' },
];

const TABLE_HEADERS = ['Model', 'Context', 'Speed', 'Cost/1M tokens'];
const TABLE_ROWS = [
  ['claude-4-opus',    '200k', '~40 tok/s',  '$15 / $75'],
  ['claude-4-sonnet',  '200k', '~90 tok/s',  '$3 / $15'],
  ['gpt-4o',          '128k', '~100 tok/s', '$5 / $15'],
  ['gemini-1.5-pro',  '1M',   '~80 tok/s',  '$3.5 / $10.5'],
];

// ─── Main screen ─────────────────────────────────────────────────────────────

function ConversationSample() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 flex flex-col gap-2">
      <UserMessage>
        <p>Can you add dark mode support to our React app? We use Tailwind CSS.</p>
      </UserMessage>

      <AgentMessage>
        <SkillReady skills={SKILL_READY_ITEMS.slice(0, 2)} />
        <P>Sure! I&apos;ll add dark mode support using Tailwind&apos;s <InlineCode>class</InlineCode> strategy so it can be toggled programmatically. Here&apos;s my plan:</P>
        <div className="flex flex-col gap-0 my-2 border border-border rounded-xl overflow-hidden bg-muted/20">
          {[
            { n: 1, title: 'Audit existing color usage', detail: 'Find all hardcoded hex/rgb values across the codebase.' },
            { n: 2, title: 'Define CSS custom properties', detail: 'Create a :root { } block with semantic tokens for each color role.' },
            { n: 3, title: 'Add a [data-theme="dark"] selector', detail: 'Override the token values for the dark palette.' },
            { n: 4, title: 'Wire the toggle', detail: 'Persist preference to localStorage and apply the attribute on the <html> element.' },
            { n: 5, title: 'Update Tailwind config', detail: 'Point Tailwind darkMode to "class" and map utilities to the new tokens.' },
          ].map(({ n, title, detail }) => (
            <div key={n} className="flex gap-4 px-4 py-3 border-b border-border last:border-0 items-start">
              <span className="shrink-0 w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center mt-0.5">{n}</span>
              <div>
                <div className="text-sm font-medium text-foreground">{title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>
              </div>
            </div>
          ))}
        </div>
        <P>Let me start by reading the current Tailwind config:</P>
        <ToolDisclosure verb="Read" target="tailwind.config.ts" fullPath="/workspace/tailwind.config.ts" defaultOpen>
          <CodeBlock language="ts" filename="tailwind.config.ts" code={`import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;`} />
        </ToolDisclosure>
      </AgentMessage>

      <AgentMessage>
        <P>Now I&apos;ll update the config and add the CSS tokens:</P>
        <DiffBlock filename="tailwind.config.ts" lines={[
          { type: 'context',  content: "import type { Config } from 'tailwindcss';" },
          { type: 'context',  content: '' },
          { type: 'context',  content: 'export default {' },
          { type: 'context',  content: "  content: ['./src/**/*.{ts,tsx}']," },
          { type: 'remove',   content: '  theme: { extend: {} },' },
          { type: 'add',      content: "  darkMode: 'class'," },
          { type: 'add',      content: '  theme: { extend: { colors: { background: "hsl(var(--background))", foreground: "hsl(var(--foreground))" } } },' },
          { type: 'context',  content: '  plugins: [],' },
          { type: 'context',  content: '} satisfies Config;' },
        ]} />
        <DiffSummary files={[
          { path: 'tailwind.config.ts',   added: 2, removed: 1 },
          { path: 'src/index.css',        added: 14, removed: 0 },
          { path: 'src/components/ThemeToggle.tsx', added: 28, removed: 0 },
        ]} onUndo={() => {}} />
      </AgentMessage>

      <AgentMessage>
        <P>Here&apos;s the toggle component I created:</P>
        <CodeBlock language="tsx" filename="ThemeToggle.tsx" code={`import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button onClick={() => setDark((d) => !d)}>
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}`} />
        <TaskTracker tasks={TASKS_ALL_STATES} />
      </AgentMessage>

      <UserMessage>
        <p>Looks good. Can you also update the file tree to show what changed?</p>
      </UserMessage>

      <AgentMessage>
        <FileTree lines={[
          'src/',
          '├── components/',
          '│   ├── ThemeToggle.tsx      ← new',
          '│   └── Counter.tsx',
          '├── index.css                ← updated',
          '├── App.tsx                  ← updated',
          'tailwind.config.ts           ← updated',
          'package.json',
        ]} />
        <P>All changes are ready. The toggle persists across page reloads via <InlineCode>localStorage</InlineCode>.</P>
      </AgentMessage>

      <div className="h-16" aria-hidden />
    </div>
  );
}

export function ChatComponentsScreen() {
  const [tab, setTab] = useState<'components' | 'conversation'>('components');

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Tab toggle */}
      <div className="flex items-center justify-center gap-1 px-4 pt-4 pb-0 shrink-0">
        {(['components', 'conversation'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize',
              tab === t
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            {t === 'components' ? 'Components' : 'Conversation Sample'}
          </button>
        ))}
      </div>

      {tab === 'conversation' ? (
        <main className="flex-1 overflow-y-auto" aria-label="Conversation sample">
          <ConversationSample />
        </main>
      ) : (
      <main className="flex-1 overflow-y-auto" aria-label="Chat component library">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 flex flex-col">

          {/* ── User messages ─────────────────────────────────── */}
          <SectionLabel label="User messages" />
          <div className="flex flex-col gap-3">

            {/* Plain text */}
            <UserMessage>
              <p>Can you refactor the Counter component to accept an initialCount prop?</p>
            </UserMessage>

            {/* Text + inline code */}
            <UserMessage>
              <p>
                Here&apos;s the current file:{' '}
                <InlineCode>src/components/Counter.tsx</InlineCode>
              </p>
            </UserMessage>

            {/* Image attachment */}
            <UserMessage>
              <p>Here&apos;s a screenshot of the bug:</p>
              <div className="mt-1 flex h-[54px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-foreground/5">
                <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
              </div>
            </UserMessage>

            {/* File attachment */}
            <UserMessage>
              <p>Can you review this file?</p>
              <div className="mt-1 flex h-[54px] max-w-[184px] shrink-0 flex-col justify-between rounded-lg bg-foreground/5 px-3 py-2">
                <div className="min-w-0 pr-4">
                  <span className="block min-w-0 truncate text-xs font-medium leading-4 text-foreground">Counter.tsx</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <FileText className="h-3 w-3 shrink-0" aria-hidden />
                  <span>TSX</span>
                </div>
              </div>
            </UserMessage>

            {/* Multiple files */}
            <UserMessage>
              <p>Here are the files I need you to update:</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {[
                  { name: 'Counter.tsx',      ext: 'TSX' },
                  { name: 'Counter.test.tsx', ext: 'TSX' },
                  { name: 'design-spec.pdf',  ext: 'PDF' },
                ].map((f) => (
                  <div key={f.name} className="flex h-[54px] max-w-[184px] shrink-0 flex-col justify-between rounded-lg bg-foreground/5 px-3 py-2">
                    <div className="min-w-0 pr-4">
                      <span className="block min-w-0 truncate text-xs font-medium leading-4 text-foreground">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <FileText className="h-3 w-3 shrink-0" aria-hidden />
                      <span>{f.ext}</span>
                    </div>
                  </div>
                ))}
              </div>
            </UserMessage>

          </div>

          {/* ── Text & prose ──────────────────────────────────── */}
          <SectionLabel label="Agent text responses" />
          <AgentMessage>
            <P>
              Sure! I&apos;ll update <InlineCode>Counter.tsx</InlineCode> to accept an optional{' '}
              <InlineCode>initialCount</InlineCode> prop that defaults to <InlineCode>0</InlineCode>.
            </P>
            <P>
              This is a <strong>non-breaking change</strong> — existing callers that omit the prop
              will continue to work exactly as before.
            </P>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              <li>Update the function signature to accept a typed prop object</li>
              <li>Thread <InlineCode>initialCount</InlineCode> into <InlineCode>useState</InlineCode></li>
              <li>Add a JSDoc comment for discoverability</li>
            </ul>
          </AgentMessage>

          {/* ── Skill ready ───────────────────────────────────── */}
          <SectionLabel label="Skill ready" />
          <AgentMessage>
            <SkillReady skills={SKILL_READY_ITEMS} />
          </AgentMessage>

          {/* ── Tool disclosures ──────────────────────────────── */}
          <SectionLabel label="Tool disclosures" />
          <AgentMessage>
            <ToolDisclosure
              verb="Read"
              target="src/components/Counter.tsx"
              fullPath="/workspace/project/src/components/Counter.tsx"
              defaultOpen
            >
              <CodeBlock
                language="tsx"
                filename="Counter.tsx"
                code={`import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  );
}`}
              />
            </ToolDisclosure>

            <ToolDisclosure
              verb="Ran"
              target="npm test"
              fullPath="npm test --watchAll=false"
            >
              <pre className="bg-card text-foreground p-4 rounded-xl border border-border overflow-auto text-xs font-mono whitespace-pre my-1">
{`PASS  src/components/Counter.test.tsx
  Counter
    ✓ renders with default count (12 ms)
    ✓ increments on click (8 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total`}
              </pre>
            </ToolDisclosure>
          </AgentMessage>

          {/* ── Code blocks ───────────────────────────────────── */}
          <SectionLabel label="Code blocks" />

          <AgentMessage>
            <P>Here are examples of code blocks in common languages:</P>

            <CodeBlock
              language="tsx"
              filename="Counter.tsx"
              code={`import { useState } from "react";

/** Incrementing counter with configurable start value. */
export function Counter({ initialCount = 0 }: { initialCount?: number }) {
  const [count, setCount] = useState(initialCount);

  return (
    <button
      onClick={() => setCount((c) => c + 1)}
      className="rounded-xl px-3 py-1.5 bg-primary text-primary-foreground text-sm"
    >
      Count: {count}
    </button>
  );
}`}
            />

            <CodeBlock
              language="python"
              filename="main.py"
              code={`from dataclasses import dataclass, field
from typing import Optional

@dataclass
class Counter:
    initial_count: int = 0
    _count: int = field(init=False)

    def __post_init__(self) -> None:
        self._count = self.initial_count

    def increment(self, by: int = 1) -> None:
        self._count += by

    @property
    def value(self) -> int:
        return self._count`}
            />

            <CodeBlock
              language="bash"
              code={`# Install deps, run tests, then build
npm install --frozen-lockfile
npm test -- --watchAll=false
npm run build`}
            />

            <CodeBlock
              language="sql"
              code={`SELECT
  u.id,
  u.email,
  COUNT(c.id)  AS conversation_count,
  MAX(c.created_at) AS last_active
FROM users u
LEFT JOIN conversations c ON c.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email
ORDER BY last_active DESC
LIMIT 50;`}
            />
          </AgentMessage>

          {/* ── Diff ──────────────────────────────────────────── */}
          <SectionLabel label="Diffs" />
          <AgentMessage>
            <P>Here&apos;s the change I&apos;m making to <InlineCode>Counter.tsx</InlineCode>:</P>
            <DiffBlock filename="src/components/Counter.tsx" lines={DIFF_LINES} />
          </AgentMessage>

          {/* ── Diff summary ──────────────────────────────────── */}
          <SectionLabel label="Diff summary" />
          <AgentMessage>
            <DiffSummary files={DIFF_SUMMARY_FILES} onUndo={() => {}} />
          </AgentMessage>

          {/* ── Tables ────────────────────────────────────────── */}
          <SectionLabel label="Tables" />
          <AgentMessage>
            <P>Here&apos;s a comparison of the models available:</P>
            <SimpleTable headers={TABLE_HEADERS} rows={TABLE_ROWS} />
          </AgentMessage>

          {/* ── Lists ─────────────────────────────────────────── */}
          <SectionLabel label="Lists" />
          <AgentMessage>
            <P>
              <strong>Ordered list</strong>
            </P>
            <ol className="list-decimal ml-5 space-y-1 text-sm">
              <li>Clone the repository</li>
              <li>
                Run <InlineCode>npm install</InlineCode>
              </li>
              <li>
                Copy <InlineCode>.env.example</InlineCode> to <InlineCode>.env</InlineCode>
              </li>
              <li>
                Start the dev server with <InlineCode>npm run dev</InlineCode>
              </li>
            </ol>

            <P className="mt-3">
              <strong>Unordered list</strong>
            </P>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              <li>React 18 with concurrent features</li>
              <li>TypeScript strict mode enabled</li>
              <li>Tailwind CSS with custom design tokens</li>
              <li>Vitest + Testing Library for unit tests</li>
            </ul>

            <P className="mt-3">
              <strong>Checklist</strong>
            </P>
            <ul className="space-y-1 text-sm">
              {[
                { done: true,  label: 'Update function signature' },
                { done: true,  label: 'Thread prop into useState' },
                { done: false, label: 'Update snapshot tests' },
                { done: false, label: 'Update Storybook story' },
              ].map(({ done, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    readOnly
                    checked={done}
                    className="accent-primary"
                  />
                  <span className={done ? 'line-through text-muted-foreground' : ''}>{label}</span>
                </li>
              ))}
            </ul>
          </AgentMessage>

          {/* ── Task tracker ──────────────────────────────────── */}
          <SectionLabel label="Task tracker" />
          <AgentMessage>
            <P>Here&apos;s the current task list for this project:</P>
            <TaskTracker tasks={TASKS_ALL_STATES} />
          </AgentMessage>

          {/* ── Plan preview ──────────────────────────────────── */}
          <SectionLabel label="Plan preview" />
          <AgentMessage>
            <P>Building state — text animates while the plan is being generated:</P>
            <PlanPreview variant="building" />
          </AgentMessage>
          <AgentMessage>
            <P>Active state — plan is ready, Build button is shown:</P>
            <PlanPreview variant="active" />
          </AgentMessage>

          {/* ── File tree ─────────────────────────────────────── */}
          <SectionLabel label="File tree" />
          <AgentMessage>
            <P>Here&apos;s the project structure:</P>
            <FileTree
              lines={[
                'src/',
                '├── components/',
                '│   ├── Counter.tsx          ← updated',
                '│   ├── Counter.test.tsx',
                '│   └── Counter.stories.tsx',
                '├── hooks/',
                '│   └── useCounter.ts',
                '├── App.tsx',
                '└── main.tsx',
              ]}
            />
          </AgentMessage>

          {/* ── Plan ──────────────────────────────────────────── */}
          <SectionLabel label="Plan / step list" />
          <AgentMessage>
            <P>Here&apos;s my plan to add dark mode support:</P>
            <div className="flex flex-col gap-0 my-2 border border-border rounded-xl overflow-hidden bg-muted/20">
              {[
                { n: 1, title: 'Audit existing color usage', detail: 'Find all hardcoded hex/rgb values across the codebase.' },
                { n: 2, title: 'Define CSS custom properties', detail: 'Create a :root { } block with semantic tokens for each color role.' },
                { n: 3, title: 'Add a [data-theme="dark"] selector', detail: 'Override the token values for the dark palette.' },
                { n: 4, title: 'Wire the toggle', detail: 'Persist preference to localStorage and apply the attribute on the <html> element.' },
                { n: 5, title: 'Update Tailwind config', detail: 'Point Tailwind darkMode to "class" and map utilities to the new tokens.' },
              ].map(({ n, title, detail }) => (
                <div key={n} className="flex gap-4 px-4 py-3 border-b border-border last:border-0 items-start">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center mt-0.5">
                    {n}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-foreground">{title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </AgentMessage>

          <div className="h-16" aria-hidden />
        </div>
      </main>
      )}
    </div>
  );
}
