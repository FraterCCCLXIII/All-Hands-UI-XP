import { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import type { KeyboardEvent, ReactNode, SyntheticEvent } from 'react';
import {
  Loader2,
  ArrowUp,
  ArrowDown,
  ArrowDownToLine,
  MoreHorizontal,
  Paperclip,
  Pin,
  PinOff,
  Square,
  Code2,
  Terminal,
  Monitor,
  Globe,
  Github,
  GitBranch,
  GitPullRequest,
  ExternalLink,
  Wrench,
  Webhook,
  ArrowUp as ArrowUpIcon,
  Bot,
  FileText,
  Sparkles,
  TestTube,
  Merge,
  Droplets,
  ChevronDown,
  ChevronUp,
  File,
  Folder,
  Copy,
  Check,
  ListTodo,
  Circle,
  CheckCircle2,
  Settings,
  Pencil,
  Download,
  DollarSign,
  X,
  Trash2,
  MessageCircleQuestion,
  RefreshCw,
  RotateCw,
  Box,
  ClipboardList,
  History,
  GitCompare,
  FileDiff,
  FilePlus,
  Image as ImageIcon,
  Share2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Theme, ThemeElement } from '../types/theme';
import { cn } from '../lib/utils';
import { navigateAppRoute } from '../lib/captureNavigation';
import { PrototypeControlsFab } from '../components/common/PrototypeControlsFab';
import { AutomationGlyph } from '../components/icons/AutomationGlyph';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Protip, type ProtipVariant } from '../components/canvas/Protip';
import { ChatStartScreen } from '../components/chat/ChatStartScreen';
import { RepositoryActionStrip } from '../components/chat/RepositoryActionStrip';
import { AvailableSkillsModal } from '../components/chat/AvailableSkillsModal';
import { AvailableHooksModal } from '../components/chat/AvailableHooksModal';
import { AgentToolsModal } from '../components/chat/AgentToolsModal';
import { ConversationMetricsModal } from '../components/chat/ConversationMetricsModal';
import { SkillIcon } from '../components/icons/SkillIcon';
import { showAppToast } from '../lib/appToast';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../components/ui/dropdown-menu';

export type StatusBadgeState = 'off' | 'running' | 'waiting' | 'finished' | 'error';

interface ActiveChatScreenProps {
  theme: Theme;
  getThemeClasses: (element: ThemeElement) => string;
  showRefreshNotification: boolean;
  onToggleRefreshNotification: () => void;
  showErrorNotification: boolean;
  onToggleErrorNotification: () => void;
  canvasTipVariant: 'none' | ProtipVariant;
  onCanvasTipVariantChange: (variant: 'none' | ProtipVariant) => void;
  showCanvasLoading: boolean;
  onToggleCanvasLoading: () => void;
  chatContentMode: 'skeleton' | 'conversation' | 'start';
  onChatContentModeChange: (mode: 'skeleton' | 'conversation' | 'start') => void;
  repositoryStatus: 'connected' | 'disconnected' | 'connect';
  onRepositoryStatusChange: (status: 'connected' | 'disconnected' | 'connect') => void;
  repositoryName?: string | null;
  branchName?: string | null;
  /** Rotating status pill above the chat input (loading phase + prototype state). */
  inputStatusBadgeState: StatusBadgeState;
  onInputStatusBadgeStateChange: (state: StatusBadgeState) => void;
  /** Label + icon badge next to model/tools in the composer row. */
  composerStatusBadgeState: StatusBadgeState;
  onComposerStatusBadgeStateChange: (state: StatusBadgeState) => void;
  /** When set, shows automation icon + title above the chat header. */
  automationContextTitle: string | null;
  onAutomationContextTitleChange: (title: string | null) => void;
  initialCanvasOpen?: boolean;
}

const DEFAULT_LEFT_PANEL_WIDTH = 42.8;
/** Chat column min/max width (% of the split row) — canvas gets the remainder. */
const MIN_LEFT_PANEL_PCT = 28;
const MAX_LEFT_PANEL_PCT = 78;

const CHAT_INPUT_MAX_LINES = 4;
const CHAT_INPUT_MIN_LINES = 1;

const STATUS_BADGE_LABELS: Record<Exclude<StatusBadgeState, 'off'>, string> = {
  running: 'Running',
  waiting: 'Waiting',
  finished: 'Done',
  error: 'Error',
};

const STATUS_BADGE_OPTIONS: { value: StatusBadgeState; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'running', label: 'Running' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'finished', label: 'Done' },
  { value: 'error', label: 'Error' },
];

type TabId = 'changes' | 'code' | 'terminal' | 'app' | 'browser' | 'planner' | 'tasks';

const CANVAS_TAB_ARIA: Record<TabId, string> = {
  changes: 'Changes',
  code: 'Code',
  terminal: 'Terminal',
  app: 'App',
  browser: 'Browser',
  planner: 'Planner',
  tasks: 'Tasks',
};

/** Opens in a new tab from the Code tab external-link control */
const CODE_EXTERNAL_REPO_URL = 'https://github.com/FraterCCCLXIII/All-Hands-UI-XP';

const PLAN_PROMPT_FROM_CANVAS = 'Create a plan for this repository.';

const DEFAULT_PINNED: Record<TabId, boolean> = {
  changes: true,
  code: true,
  terminal: true,
  app: true,
  browser: true,
  planner: true,
  tasks: true,
};

const CANVAS_TAB_ORDER: TabId[] = ['changes', 'code', 'terminal', 'app', 'browser', 'planner', 'tasks'];

const CONVERSATION_LOAD_DURATION_MS = 2000;
const DEFAULT_LLM_MODEL = 'Claude 3.5 Sonnet';
const LLM_MODELS = ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'GPT-4o', 'GPT-4o mini'] as const;
const CHAT_STATUS_MESSAGES = ['Starting', 'Connecting...', 'Loading...', 'Ready'] as const;
const CHAT_STATUS_CYCLE_MS = 500;
const COMMAND_LIST_ID = 'chat-command-list';
const CANVAS_TIP_OPTIONS: Array<{ id: 'none' | ProtipVariant; label: string }> = [
  { id: 'none', label: 'None' },
  { id: 'protip', label: 'Protip 1' },
  { id: 'cli', label: 'CLI' },
];

const AUTOMATION_CONTEXT_OPTIONS: Array<{ title: string | null; label: string }> = [
  { title: null, label: 'None' },
  { title: 'PR Triage Digest', label: 'PR Triage Digest' },
  { title: 'Cross-Repo Release Readiness', label: 'Cross-Repo Release Readiness' },
  { title: 'Nightly Security Pass', label: 'Nightly Security Pass' },
  { title: 'Docs Sync on Push', label: 'Docs Sync on Push' },
];

type CommandItem = {
  id: string;
  label: string;
  description: string;
  command: string;
};

type ConversationCapability = {
  id: string;
  name: string;
  type: 'skill' | 'plugin';
  description: string;
  repositoryUrl: string;
  source: string;
  pageUrl?: string;
  initialPrompt?: string;
  curlCommand?: string;
};

const CHAT_COMMANDS: CommandItem[] = [
  { id: 'summarize', label: 'Summarize thread', description: 'Recap the conversation so far.', command: '/summarize' },
  { id: 'explain', label: 'Explain selection', description: 'Explain highlighted code or output.', command: '/explain' },
  { id: 'tests', label: 'Generate tests', description: 'Add tests for recent changes.', command: '/tests' },
  { id: 'plan', label: 'Create a plan', description: 'Break the work into steps.', command: '/plan' },
  { id: 'optimize', label: 'Optimize performance', description: 'Identify and fix slow paths.', command: '/optimize' },
];

const LOADED_CONVERSATION_SKILLS: ConversationCapability[] = [
  {
    id: 'skill-pr-review',
    name: 'PR review',
    type: 'skill',
    description: 'Summarizes code changes, flags risky diffs, and prepares reviewer-ready notes.',
    repositoryUrl: 'https://github.com/FraterCCCLXIII/All-Hands-UI-XP',
    source: 'Loaded from the conversation skill registry.',
    pageUrl: '/extensions/all',
    initialPrompt: 'Review this pull request for risky changes, unclear logic, regressions, and missing test coverage.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "pr-review", "conversationId": "<conversation-id>"}'`,
  },
  {
    id: 'skill-release-notes',
    name: 'Release notes',
    type: 'skill',
    description: 'Builds concise release-note drafts from the current conversation and changes.',
    repositoryUrl: 'https://github.com/FraterCCCLXIII/All-Hands-UI-XP',
    source: 'Loaded from the conversation skill registry.',
    pageUrl: '/extensions/all',
    initialPrompt: 'Draft release notes from the current conversation, grouped by user-facing changes, fixes, and operational impact.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "release-notes", "conversationId": "<conversation-id>"}'`,
  },
];

const LOADED_CONVERSATION_PLUGINS: ConversationCapability[] = [
  {
    id: 'plugin-github',
    name: 'GitHub',
    type: 'plugin',
    description: 'Provides repository, pull request, branch, and issue context inside the conversation.',
    repositoryUrl: 'https://github.com/integrations/github',
    source: 'Connected plugin for this conversation.',
  },
  {
    id: 'plugin-figma',
    name: 'Figma',
    type: 'plugin',
    description: 'Provides design links, frame metadata, and export context for UI implementation work.',
    repositoryUrl: 'https://www.figma.com/developers',
    source: 'Connected plugin for this conversation.',
  },
];

function ModelChipIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 490.2 490.2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M469.15,265.9c11.5,0,20.9-9.4,20.9-20.9s-9.4-20.9-20.9-20.9h-59.4V195h59.4c11.5,0,20.9-9.4,20.9-20.9
        s-9.4-20.9-20.9-20.9h-59.4v-51.1c0-11.5-9.4-20.9-20.9-20.9h-52.1V20.9c0-11.5-9.4-20.9-20.9-20.9s-20.9,9.4-20.9,20.9v60.5h-29.2
        V20.9c0-11.5-9.4-20.9-20.9-20.9c-11.5,0-20.9,9.4-20.9,20.9v60.5h-28.9V20.9c0-11.5-9.4-20.9-20.9-20.9s-20.9,9.4-20.9,20.9v60.5
        h-49c-11.5,0-20.9,9.4-20.9,20.9v51.1h-62.4c-11.5,0-20.9,9.4-20.9,20.9s9.4,20.9,20.9,20.9h62.6v29.2h-62.6
        c-11.5,0-20.9,9.4-20.9,20.9c0,11.5,9.4,20.9,20.9,20.9h62.6V294h-62.6c-11.5,0-20.9,9.4-20.9,20.9s9.4,20.9,20.9,20.9h62.6v51.1
        c0,11.5,9.4,20.9,20.9,20.9h49v61.5c0,11.5,9.4,20.9,20.9,20.9s20.9-9.4,20.9-20.9v-61.5h29.2v61.5c0,11.5,9.4,20.9,20.9,20.9
        c11.5,0,20.9-9.4,20.9-20.9v-61.5h28.8v61.5c0,11.5,9.4,20.9,20.9,20.9c10.4,0,19.8-9.4,20.9-20.9v-61.5h52.1
        c11.5,0,20.9-8.3,20.9-20.9v-51.1h59.4c11.5,0,20.9-9.4,20.9-20.9s-9.4-20.9-20.9-20.9h-59.4v-28.1H469.15z M368.05,367h-244V123
        h244V367z"
        fill="currentColor"
      />
    </svg>
  );
}

function CodeModeIcon({ className }: { className?: string }) {
  return (
    <svg
      width="257"
      height="183"
      viewBox="0 0 257 183"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M151.663 5.36257C158.763 -1.73743 170.363 -1.83743 177.563 5.36257L250.663 78.4626C257.763 85.5626 257.863 97.1626 250.663 104.363L177.563 177.463C170.363 184.563 158.863 184.563 151.663 177.463C144.563 170.263 144.563 158.763 151.663 151.563L211.863 91.3626L151.663 31.1626C144.563 24.1626 144.563 12.5626 151.663 5.36257ZM104.463 5.36257C97.3626 -1.73743 85.7626 -1.83743 78.5626 5.36257L5.36257 78.4626C-1.73743 85.5626 -1.83743 97.1626 5.36257 104.363L78.4626 177.463C85.6626 184.563 97.1626 184.563 104.363 177.463C111.463 170.263 111.463 158.763 104.363 151.563L44.1626 91.4626L104.363 31.2626C111.563 24.1626 111.563 12.5626 104.463 5.36257Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PlanModeIcon({ className }: { className?: string }) {
  return (
    <svg
      width="109"
      height="109"
      viewBox="0 0 109 109"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M40.1979 21.8969L34.7311 17.832L25.2691 30.5574L20.2094 26.784L16.1367 32.2451L26.6653 40.0969L40.1979 21.8969Z" fill="currentColor" />
      <path d="M90.8342 35.1983H50.4639V28.3858H90.8342V35.1983Z" fill="currentColor" />
      <path d="M90.8342 57.9067H50.4638V51.0942H90.8342V57.9067Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M27.2508 63.5837C32.2674 63.5837 36.3342 59.517 36.3342 54.5004C36.3342 49.4838 32.2674 45.4171 27.2508 45.4171C22.2342 45.4171 18.1675 49.4838 18.1675 54.5004C18.1675 59.517 22.2342 63.5837 27.2508 63.5837ZM27.2508 59.0421C29.7591 59.0421 31.7925 57.0087 31.7925 54.5004C31.7925 51.9921 29.7591 49.9587 27.2508 49.9587C24.7425 49.9587 22.7092 51.9921 22.7092 54.5004C22.7092 57.0087 24.7425 59.0421 27.2508 59.0421Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M36.3342 77.2087C36.3342 82.2253 32.2674 86.2921 27.2508 86.2921C22.2342 86.2921 18.1675 82.2253 18.1675 77.2087C18.1675 72.1922 22.2342 68.1254 27.2508 68.1254C32.2674 68.1254 36.3342 72.1922 36.3342 77.2087ZM31.7925 77.2087C31.7925 79.717 29.7591 81.7504 27.2508 81.7504C24.7425 81.7504 22.7092 79.717 22.7092 77.2087C22.7092 74.7005 24.7425 72.6671 27.2508 72.6671C29.7591 72.6671 31.7925 74.7005 31.7925 77.2087Z" fill="currentColor" />
      <path d="M50.4637 80.615H90.834V73.8025H50.4637V80.615Z" fill="currentColor" />
    </svg>
  );
}

function CopyableBlock({
  title,
  value,
  onCopy,
  className,
}: {
  title: string;
  value: string;
  onCopy: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border border-border bg-card [&_textarea]:min-h-[100px]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <button
          type="button"
          onClick={onCopy}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Copy ${title}`}
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <textarea
        readOnly
        value={value}
        rows={4}
        className="repo-dropdown-scroll max-h-[180px] w-full resize-none overflow-y-auto border-0 bg-transparent p-4 font-mono text-sm text-foreground focus:ring-0 focus-visible:outline-none"
      />
    </div>
  );
}

const STATUS_BADGE_CONFIG: Record<
  Exclude<StatusBadgeState, 'off'>,
  { label: string; icon: ReactNode }
> = {
  running: {
    label: 'Running',
    icon: (
      <button
        type="button"
        data-testid="stop-button"
        className="cursor-pointer flex items-center justify-center"
        aria-label="Stop agent"
      >
        <Square className="w-3 h-3 text-foreground fill-foreground" />
      </button>
    ),
  },
  waiting: {
    label: 'Waiting',
    icon: <Clock className="w-4 h-4 text-foreground" />,
  },
  finished: {
    label: 'Done',
    icon: <CheckCircle2 className="w-4 h-4 text-foreground" />,
  },
  error: {
    label: 'Error',
    icon: (
      <div data-testid="agent-loading-spinner">
        <AlertCircle className="w-4 h-4 text-destructive" />
      </div>
    ),
  },
};

function AgentStatusBadge({ state }: { state: StatusBadgeState }) {
  if (state === 'off') return null;
  const { label, icon } = STATUS_BADGE_CONFIG[state];
  return (
    <div className="flex items-center gap-1 min-w-0 ml-2 md:ml-3">
      <span
        className="text-xs text-foreground font-normal leading-5 flex-1 min-w-0 max-w-full truncate"
        title={label}
      >
        {label}
      </span>
      <div
        className={cn(
          'bg-muted box-border flex flex-row gap-[3px] items-center justify-center overflow-clip px-0.5 py-1 rounded-full shrink-0 size-6',
          state === 'running' && 'cursor-pointer transition-colors hover:bg-muted/60 active:scale-[0.97]'
        )}
      >
        {icon}
      </div>
    </div>
  );
}

export function ActiveChatScreen({
  theme,
  getThemeClasses,
  showRefreshNotification,
  onToggleRefreshNotification,
  showErrorNotification,
  onToggleErrorNotification,
  canvasTipVariant,
  onCanvasTipVariantChange,
  showCanvasLoading,
  onToggleCanvasLoading,
  chatContentMode,
  onChatContentModeChange,
  repositoryStatus,
  onRepositoryStatusChange,
  repositoryName,
  branchName,
  inputStatusBadgeState,
  onInputStatusBadgeStateChange,
  composerStatusBadgeState,
  onComposerStatusBadgeStateChange,
  automationContextTitle,
  onAutomationContextTitleChange,
  initialCanvasOpen = true,
}: ActiveChatScreenProps) {
  const [leftPanelWidth, setLeftPanelWidth] = useState(DEFAULT_LEFT_PANEL_WIDTH);
  const splitRowRef = useRef<HTMLDivElement>(null);
  const canvasResizeDragRef = useRef<{ startX: number; startLeftPct: number } | null>(null);
  const [isCanvasResizeDragging, setIsCanvasResizeDragging] = useState(false);
  const [serverStatus, setServerStatus] = useState('Starting');
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('changes');
  /** When false, the right canvas column is hidden and chat uses full width. */
  const [canvasOpen, setCanvasOpen] = useState(initialCanvasOpen);
  const [pinnedTabs, setPinnedTabs] = useState<Record<TabId, boolean>>(() => ({ ...DEFAULT_PINNED }));
  /** Per-tab prototype: off = empty state, on = filled sample content (gear menu). */
  const [canvasTabFilled, setCanvasTabFilled] = useState<Record<TabId, boolean>>({
    changes: false,
    code: false,
    terminal: false,
    app: false,
    browser: false,
    planner: false,
    tasks: false,
  });
  const [chatInput, setChatInput] = useState('');
  const chatInputRef = useRef<HTMLDivElement>(null);
  /** User-dragged cap (px) between min and max line heights; null = use max lines. */
  const [chatInputMaxHeightPx, setChatInputMaxHeightPx] = useState<number | null>(null);
  const [chatInputHasMultipleLines, setChatInputHasMultipleLines] = useState(false);
  const chatInputGripResizeRef = useRef<{ startY: number; startMaxPx: number } | null>(null);
  const [isChatInputGripDragging, setIsChatInputGripDragging] = useState(false);
  const [conversationLoaded, setConversationLoaded] = useState(false);
  const [chatStatusIndex, setChatStatusIndex] = useState(0);
  const [statusIndicatorExiting, setStatusIndicatorExiting] = useState(false);
  const [drawersAnimatedIn, setDrawersAnimatedIn] = useState(false);
  const [taskListExpanded, setTaskListExpanded] = useState(false);
  const [changesExpanded, setChangesExpanded] = useState(false);
  const [taskListDrawerVisible, setTaskListDrawerVisible] = useState(false);
  const [changesDrawerVisible, setChangesDrawerVisible] = useState(false);
  const [selectedChangeFileId, setSelectedChangeFileId] = useState<ChangeFileId | null>(null);
  const [changeNavigationRequest, setChangeNavigationRequest] = useState(0);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_LLM_MODEL);
  const [chatMode, setChatMode] = useState<'build' | 'ask' | 'plan'>('build');
  const [projectReadExpanded, setProjectReadExpanded] = useState(false);
  const [packageJsonReadExpanded, setPackageJsonReadExpanded] = useState(false);
  const [ranCommandExpanded, setRanCommandExpanded] = useState(false);
  const [attachmentPreviewsEnabled, setAttachmentPreviewsEnabled] = useState(true);
  const [composerAttachments, setComposerAttachments] = useState<ComposerAttachmentPreview[]>([]);
  const shouldShowInputStatusBadge = inputStatusBadgeState !== 'off' || !conversationLoaded;
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [commandActiveIndex, setCommandActiveIndex] = useState(0);
  const [isCliCommandVisible, setIsCliCommandVisible] = useState(false);
  const [isCliCommandCopied, setIsCliCommandCopied] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<ConversationCapability | null>(null);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isHooksModalOpen, setIsHooksModalOpen] = useState(false);
  const [isAgentToolsModalOpen, setIsAgentToolsModalOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const commandListRef = useRef<HTMLDivElement | null>(null);
  const commandItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const showCanvasTip = canvasTipVariant !== 'none';
  const canvasTipLabel = CANVAS_TIP_OPTIONS.find((option) => option.id === canvasTipVariant)?.label ?? 'None';
  const automationContextLabel =
    AUTOMATION_CONTEXT_OPTIONS.find((o) => o.title === automationContextTitle)?.label ?? 'None';
  const connectedRepoName = repositoryName ?? 'FraterCCCLXIII/All-Hands-UI-XP';
  const connectedBranchName = branchName ?? 'feature/kanban-drawer';
  const connectedRepoUrl = `https://github.com/${connectedRepoName}`;
  const connectedBranchUrl = `${connectedRepoUrl}/tree/${encodeURIComponent(connectedBranchName)}`;

  useEffect(() => {
    const timer = window.setTimeout(() => setConversationLoaded(true), CONVERSATION_LOAD_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!conversationLoaded) return;
    setStatusIndicatorExiting(true);
    const id = window.setTimeout(() => setStatusIndicatorExiting(false), 300);
    return () => window.clearTimeout(id);
  }, [conversationLoaded]);

  useEffect(() => {
    if (!shouldShowInputStatusBadge) return;
    const id = window.setInterval(() => {
      setChatStatusIndex((i) => (i + 1) % CHAT_STATUS_MESSAGES.length);
    }, CHAT_STATUS_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [shouldShowInputStatusBadge]);

  useEffect(() => {
    if (!conversationLoaded) return;
    const id = window.setTimeout(() => setDrawersAnimatedIn(true), 50);
    return () => window.clearTimeout(id);
  }, [conversationLoaded]);

  useEffect(() => {
    setCanvasOpen(initialCanvasOpen);
  }, [initialCanvasOpen]);

  useEffect(() => {
    if (!isCanvasResizeDragging) return;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    return () => {
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = '';
    };
  }, [isCanvasResizeDragging]);

  useEffect(() => {
    if (!isChatInputGripDragging) return;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ns-resize';
    return () => {
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = '';
    };
  }, [isChatInputGripDragging]);

  useEffect(() => {
    if (!isChatInputGripDragging) return;

    const onMove = (e: MouseEvent) => {
      const el = chatInputRef.current;
      const ref = chatInputGripResizeRef.current;
      if (!el || !ref) return;
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
      const minPx = lh * CHAT_INPUT_MIN_LINES;
      const maxPx = lh * CHAT_INPUT_MAX_LINES;
      const delta = e.clientY - ref.startY;
      const next = Math.min(maxPx, Math.max(minPx, ref.startMaxPx + delta));
      setChatInputMaxHeightPx(next);
    };

    const onUp = () => {
      chatInputGripResizeRef.current = null;
      setIsChatInputGripDragging(false);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isChatInputGripDragging]);

  const adjustChatInputHeight = useCallback(() => {
    const el = chatInputRef.current;
    if (!el) return;
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const maxCap = chatInputMaxHeightPx ?? lh * CHAT_INPUT_MAX_LINES;
    el.style.maxHeight = `${maxCap}px`;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    const next = Math.min(Math.max(scrollH, lh), maxCap);
    el.style.height = `${next}px`;
    el.style.overflowY = scrollH > maxCap ? 'auto' : 'hidden';
    setChatInputHasMultipleLines(scrollH > lh + 1);
  }, [chatInputMaxHeightPx]);

  useLayoutEffect(() => {
    adjustChatInputHeight();
  }, [adjustChatInputHeight, chatInput]);

  useEffect(() => {
    if (!isCanvasResizeDragging) return;

    const onMove = (e: MouseEvent) => {
      const wrap = splitRowRef.current;
      const drag = canvasResizeDragRef.current;
      if (!wrap || !drag) return;
      const rowWidth = wrap.getBoundingClientRect().width;
      if (rowWidth <= 0) return;
      const deltaPct = ((e.clientX - drag.startX) / rowWidth) * 100;
      const next = Math.min(
        MAX_LEFT_PANEL_PCT,
        Math.max(MIN_LEFT_PANEL_PCT, drag.startLeftPct + deltaPct)
      );
      setLeftPanelWidth(next);
    };

    const onUp = () => {
      canvasResizeDragRef.current = null;
      setIsCanvasResizeDragging(false);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isCanvasResizeDragging]);

  const handleCanvasResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasOpen) return;
      e.preventDefault();
      canvasResizeDragRef.current = { startX: e.clientX, startLeftPct: leftPanelWidth };
      setIsCanvasResizeDragging(true);
    },
    [canvasOpen, leftPanelWidth]
  );

  const togglePinned = useCallback((id: TabId) => {
    setPinnedTabs((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const count = (Object.values(next) as boolean[]).filter(Boolean).length;
      if (count === 0) return prev;
      return next;
    });
  }, []);

  const rightPanelWidth = 100 - leftPanelWidth;
  const effectiveLeftWidth = canvasOpen ? leftPanelWidth : 100;
  const effectiveRightWidth = canvasOpen ? rightPanelWidth : 0;
  const hasInput = !!chatInput.trim();

  const handleCanvasTabClick = useCallback(
    (tab: TabId) => {
      if (tab === activeTab && canvasOpen) {
        setCanvasOpen(false);
        return;
      }
      setActiveTab(tab);
      setCanvasOpen(true);
    },
    [activeTab, canvasOpen]
  );

  const handleChangeDrawerItemSelect = useCallback((fileId: ChangeFileId) => {
    setSelectedChangeFileId(fileId);
    setChangeNavigationRequest((prev) => prev + 1);
    setCanvasTabFilled((prev) => ({ ...prev, changes: true }));
    setActiveTab('changes');
    setCanvasOpen(true);
  }, []);
  const handleAttachmentClick = useCallback(() => {
    if (!attachmentPreviewsEnabled) return;
    setComposerAttachments(COMPOSER_ATTACHMENT_ITEMS);
  }, [attachmentPreviewsEnabled]);
  const handleRemoveComposerAttachment = useCallback((attachmentId: string) => {
    setComposerAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId));
  }, []);

  useEffect(() => {
    if (attachmentPreviewsEnabled) return;
    setComposerAttachments([]);
  }, [attachmentPreviewsEnabled]);
  const conversationTitle = 'Run Code Request';
  const openConversationCliCommand = `openhands --open-conversation "${conversationTitle}"`;
  const filteredCommands = useMemo(() => {
    const query = commandQuery.trim().toLowerCase();
    if (!query) return CHAT_COMMANDS;

    const scored = CHAT_COMMANDS.map((command, index) => {
      const label = command.label.toLowerCase();
      const commandText = command.command.toLowerCase();
      const description = command.description.toLowerCase();
      const queryWithSlash = `/${query}`;

      let score = 6;
      if (commandText === queryWithSlash) score = 0;
      else if (commandText.startsWith(queryWithSlash)) score = 1;
      else if (label.startsWith(query)) score = 2;
      else if (label.includes(query)) score = 3;
      else if (commandText.includes(query)) score = 4;
      else if (description.includes(query)) score = 5;

      return { command, score, index };
    })
      .filter(({ score }) => score < 6)
      .sort((a, b) => (a.score !== b.score ? a.score - b.score : a.index - b.index));

    return scored.map(({ command }) => command);
  }, [commandQuery]);

  useEffect(() => {
    if (!isCommandMenuOpen) return;
    const activeItem = commandItemRefs.current[commandActiveIndex];
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    } else if (commandListRef.current) {
      commandListRef.current.scrollTop = 0;
    }
  }, [commandActiveIndex, isCommandMenuOpen, filteredCommands.length]);

  useEffect(() => {
    if (commandActiveIndex >= filteredCommands.length) {
      setCommandActiveIndex(0);
    }
  }, [commandActiveIndex, filteredCommands.length]);

  const handleSendMessage = useCallback(() => {
    const text = chatInputRef.current?.innerText?.trim() ?? chatInput.trim();
    if (text) {
      setChatInput('');
      setChatInputMaxHeightPx(null);
      if (chatInputRef.current) chatInputRef.current.innerText = '';
      setIsCommandMenuOpen(false);
      setCommandQuery('');
      requestAnimationFrame(() => adjustChatInputHeight());
      // Could wire to parent or local messages state here
    }
  }, [chatInput, adjustChatInputHeight]);

  const handleChatInputGripMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = chatInputRef.current;
    if (!el) return;
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const currentMax = chatInputMaxHeightPx ?? lh * CHAT_INPUT_MAX_LINES;
    chatInputGripResizeRef.current = { startY: e.clientY, startMaxPx: currentMax };
    setIsChatInputGripDragging(true);
  }, [chatInputMaxHeightPx]);

  const handleCopyCliCommand = useCallback(() => {
    void navigator.clipboard.writeText(openConversationCliCommand);
    setIsCliCommandCopied(true);
    window.setTimeout(() => setIsCliCommandCopied(false), 1500);
  }, [openConversationCliCommand]);

  const updateCommandMenuState = useCallback((value: string) => {
    const match = value.match(/(?:^|\s)\/([^\s]*)$/);
    if (!match) {
      setIsCommandMenuOpen(false);
      setCommandQuery('');
      return;
    }
    setCommandQuery(match[1] ?? '');
    setIsCommandMenuOpen(true);
    setCommandActiveIndex(0);
  }, []);

  const placeCaretAtEnd = useCallback((element: HTMLElement) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  const handleCreatePlanFromCanvas = useCallback(() => {
    setChatMode('plan');
    setChatInput(PLAN_PROMPT_FROM_CANVAS);
    const el = chatInputRef.current;
    if (el) {
      el.innerText = PLAN_PROMPT_FROM_CANVAS;
      placeCaretAtEnd(el);
      el.focus();
      requestAnimationFrame(() => adjustChatInputHeight());
    }
  }, [placeCaretAtEnd, adjustChatInputHeight]);

  const applyCommandChip = useCallback(
    (command: CommandItem) => {
      const input = chatInputRef.current;
      if (!input) return;

      const currentText = input.innerText;
      const match = currentText.match(/(?:^|\s)\/[^\s]*$/);
      if (!match) return;

      const matchIndex = match.index ?? 0;
      const matchedText = match[0];
      const leadingSpace = matchedText.startsWith(' ') ? ' ' : '';
      const prefixText = currentText.slice(0, matchIndex);
      const suffixText = currentText.slice(matchIndex + matchedText.length);

      input.innerHTML = '';

      if (prefixText) {
        input.appendChild(document.createTextNode(prefixText));
      }
      if (leadingSpace) {
        input.appendChild(document.createTextNode(leadingSpace));
      }

      const chip = document.createElement('span');
      chip.textContent = command.command;
      chip.setAttribute('data-command-chip', 'true');
      chip.setAttribute('contenteditable', 'false');
      chip.className =
        'inline-flex items-center rounded-full border border-border bg-muted/60 text-foreground px-2 py-0.5 text-xs font-medium align-middle';
      input.appendChild(chip);
      input.appendChild(document.createTextNode(' '));

      if (suffixText) {
        input.appendChild(document.createTextNode(suffixText));
      }

      placeCaretAtEnd(input);
      setChatInput(input.innerText);
      setIsCommandMenuOpen(false);
      setCommandQuery('');
      requestAnimationFrame(() => adjustChatInputHeight());
    },
    [placeCaretAtEnd, adjustChatInputHeight]
  );

  const handleCommandNavigation = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!isCommandMenuOpen) return false;

      if (event.key === 'Escape') {
        event.preventDefault();
        setIsCommandMenuOpen(false);
        setCommandQuery('');
        return true;
      }

      if (filteredCommands.length === 0) return false;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setCommandActiveIndex((index) => (index + 1) % filteredCommands.length);
        return true;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setCommandActiveIndex((index) => (index - 1 + filteredCommands.length) % filteredCommands.length);
        return true;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        applyCommandChip(filteredCommands[commandActiveIndex]);
        return true;
      }

      return false;
    },
    [applyCommandChip, commandActiveIndex, filteredCommands, isCommandMenuOpen]
  );

  return (
    <div className="flex flex-col w-full h-[calc(100%-50px)] md:h-full gap-3" data-theme={theme}>
      <div id="root-outlet" className={cn('flex-1 relative overflow-auto custom-scrollbar min-h-0', getThemeClasses('scrollbar'))}>
        <div data-testid="app-route" className="p-3 md:p-4 flex flex-col h-full gap-3 min-h-0">
          {automationContextTitle ? (
            <div
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 shrink-0"
              data-testid="automation-context-banner"
              role="status"
              aria-label={`Automation: ${automationContextTitle}`}
            >
              <AutomationGlyph className="h-5 w-5 shrink-0 text-success-foreground" />
              <span className="text-sm font-medium text-foreground truncate">{automationContextTitle}</span>
            </div>
          ) : null}
          {/* Header row: server status + conversation name | Changes/Code/Terminal/App/Browser */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4.5 pt-2 lg:pt-0">
            <div className="flex items-center">
              <div className="group relative">
                <button
                  type="button"
                  onClick={() => setShowServerMenu((v) => !v)}
                  className="ml-[3.5px] w-6 h-6 cursor-pointer flex items-center justify-center text-[#FFD600]"
                  aria-label="Server status"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFD600]" />
                </button>
                {showServerMenu && (
                  <ul
                    data-testid="server-status-context-menu"
                    className="absolute bg-popover text-popover-foreground border border-border rounded-lg overflow-hidden z-50 shadow-lg py-[6px] px-1 flex flex-col gap-2 top-full left-0 mt-1 w-fit min-w-[10.5rem]"
                  >
                    <div className="py-1" data-testid="server-status">
                      <div className="flex items-center px-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FFD600] shrink-0 mr-2" />
                        <span className="text-[13px] font-normal">{serverStatus}</span>
                      </div>
                    </div>
                    <div className="w-full h-[1px] bg-border" />
                    <button
                      type="button"
                      data-testid="stop-server-button"
                      className="flex items-center justify-between p-2 hover:bg-muted/60 rounded text-sm font-normal leading-5 cursor-pointer w-full"
                      onClick={() => setServerStatus('Stopped')}
                    >
                      Stop Runtime
                      <Square className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </ul>
                )}
              </div>
              <div className="flex items-center gap-2 h-[22px] text-base font-normal text-left pl-0 lg:pl-1" data-testid="conversation-name">
                <div className="text-foreground leading-5 w-fit max-w-fit truncate" data-testid="conversation-name-title" title={conversationTitle}>
                  {conversationTitle}
                </div>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded text-xs font-semibold shrink-0 cursor-help lowercase bg-muted text-muted-foreground">
                  V1
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      data-testid="ellipsis-button"
                      type="button"
                      className="inline-flex shrink-0 size-[22px] items-center justify-center rounded-md cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-[color,background-color] duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <MoreHorizontal className="h-4 w-4 shrink-0 text-inherit" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    data-testid="conversation-name-context-menu"
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    className="min-w-[11rem] rounded-lg py-[6px] px-1 z-[100]"
                  >
                    <DropdownMenuItem data-testid="rename-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60">
                      <Pencil className="w-4 h-4 shrink-0" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem data-testid="show-skills-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60" onSelect={() => setIsSkillsModalOpen(true)}>
                      <SkillIcon className="w-4 h-4 shrink-0" />
                      Show Available Skills
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="show-hooks-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60" onSelect={() => setIsHooksModalOpen(true)}>
                      <Webhook className="w-4 h-4 shrink-0" />
                      Show Available Hooks
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="show-agent-tools-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60" onSelect={() => setIsAgentToolsModalOpen(true)}>
                      <Bot className="w-4 h-4 shrink-0" />
                      Show Agent Tools &amp; Metadata
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="download-trajectory-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60">
                      <Download className="w-4 h-4 shrink-0" />
                      Export Conversation
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem data-testid="display-cost-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60" onSelect={() => setIsMetricsModalOpen(true)}>
                      <DollarSign className="w-4 h-4 shrink-0" />
                      Display Cost
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      data-testid="share-conversation-button"
                      className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60"
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => {
                        setSharingEnabled((prev) => {
                          showAppToast({ variant: 'success', message: 'Public sharing updated' });
                          return !prev;
                        });
                      }}
                    >
                      <Share2 className="w-4 h-4 shrink-0" />
                      <span className="flex-1">Share Conversation</span>
                      {sharingEnabled && (
                        <>
                          {/* Copy link — stops propagation so it doesn't toggle the share state */}
                          <div className="relative">
                            <button
                              type="button"
                              aria-label="Copy conversation link"
                              title="Copy conversation link"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard
                                  .writeText(`${window.location.origin}/share`)
                                  .catch(() => {});
                                if (copyTimeoutRef.current !== null) {
                                  window.clearTimeout(copyTimeoutRef.current);
                                }
                                setIsCopied(true);
                                copyTimeoutRef.current = window.setTimeout(() => {
                                  setIsCopied(false);
                                  copyTimeoutRef.current = null;
                                }, 2000);
                              }}
                              className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                            >
                              <Copy className="w-4 h-4 shrink-0" aria-hidden />
                            </button>
                            {isCopied && (
                              <div
                                role="tooltip"
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-muted text-foreground border border-border rounded-md shadow-md whitespace-nowrap z-[200] pointer-events-none"
                              >
                                Conversation address copied
                              </div>
                            )}
                          </div>
                          {/* Open public share page in new tab */}
                          <button
                            type="button"
                            aria-label="Open public share page"
                            title="Open public share page"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open('/share', '_blank', 'noopener,noreferrer');
                            }}
                            className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />
                          </button>
                        </>
                      )}
                      <div className={cn('relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200', sharingEnabled ? 'bg-primary' : 'bg-muted')}>
                        <span className={cn('inline-block h-3 w-3 rounded-full bg-background shadow transition-transform duration-200', sharingEnabled ? 'translate-x-3.5' : 'translate-x-0.5')} />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="stop-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60">
                      <X className="w-4 h-4 shrink-0" />
                      Close Conversation (Stop Runtime)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem data-testid="delete-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60">
                      <Trash2 className="w-4 h-4 shrink-0" />
                      Delete Conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="relative w-full flex flex-row justify-start lg:justify-end items-center gap-1">
              {pinnedTabs.changes && (
                <CanvasNavTooltip label={CANVAS_TAB_ARIA.changes}>
                  <span data-aria-label="Changes">
                    <button
                      type="button"
                      onClick={() => handleCanvasTabClick('changes')}
                      className={cn(
                        'flex items-center rounded-md cursor-pointer pl-1.5 py-1 text-sm font-medium transition-[color,background-color,padding-right] duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        activeTab === 'changes' && canvasOpen
                          ? 'gap-2 pr-2 bg-secondary text-foreground hover:bg-secondary/90'
                          : 'gap-0 pr-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      )}
                    >
                      <FileDiff className="w-4 h-4 flex-shrink-0 text-inherit" />
                      <span
                        className={cn(
                          'overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-200',
                          activeTab === 'changes' && canvasOpen ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'
                        )}
                      >
                        Changes
                      </span>
                    </button>
                  </span>
                </CanvasNavTooltip>
              )}
              {pinnedTabs.code && (
                <CanvasNavTooltip label={CANVAS_TAB_ARIA.code} externalRepoUrl={CODE_EXTERNAL_REPO_URL}>
                  <TabButton
                    label="Code"
                    active={activeTab === 'code' && canvasOpen}
                    onClick={() => handleCanvasTabClick('code')}
                    ariaLabel="Code"
                    icon={<Code2 className="w-4 h-4 flex-shrink-0" />}
                  />
                </CanvasNavTooltip>
              )}
              {pinnedTabs.terminal && (
                <span data-aria-label="Terminal (read-only)">
                  <TabButton
                    label="Terminal"
                    active={activeTab === 'terminal' && canvasOpen}
                    onClick={() => handleCanvasTabClick('terminal')}
                    ariaLabel="Terminal (read-only)"
                    icon={<Terminal className="w-4 h-4 flex-shrink-0" />}
                    tooltip={CANVAS_TAB_ARIA.terminal}
                  />
                </span>
              )}
              {pinnedTabs.app && (
                <TabButton
                  label="App"
                  active={activeTab === 'app' && canvasOpen}
                  onClick={() => handleCanvasTabClick('app')}
                  ariaLabel="App"
                  icon={<Monitor className="w-4 h-4 flex-shrink-0" />}
                  tooltip={CANVAS_TAB_ARIA.app}
                />
              )}
              {pinnedTabs.browser && (
                <TabButton
                  label="Browser"
                  active={activeTab === 'browser' && canvasOpen}
                  onClick={() => handleCanvasTabClick('browser')}
                  ariaLabel="Browser"
                  icon={<Globe className="w-4 h-4 flex-shrink-0" />}
                  tooltip={CANVAS_TAB_ARIA.browser}
                />
              )}
              {pinnedTabs.planner && (
                <TabButton
                  label="Planner"
                  active={activeTab === 'planner' && canvasOpen}
                  onClick={() => handleCanvasTabClick('planner')}
                  ariaLabel="Planner"
                  icon={<ClipboardList className="w-4 h-4 flex-shrink-0" strokeWidth={2} />}
                  tooltip={CANVAS_TAB_ARIA.planner}
                />
              )}
              {pinnedTabs.tasks && (
                <TabButton
                  label="Tasks"
                  active={activeTab === 'tasks' && canvasOpen}
                  onClick={() => handleCanvasTabClick('tasks')}
                  ariaLabel="Tasks"
                  icon={<ListTodo className="w-4 h-4 flex-shrink-0" strokeWidth={2} />}
                  tooltip={CANVAS_TAB_ARIA.tasks}
                />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex shrink-0 size-6 items-center justify-center rounded-md cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-[color,background-color] duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-4 w-4 shrink-0 text-inherit" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="min-w-[11rem] rounded-lg py-[6px] px-1"
                >
                  {(
                    [
                      { id: 'changes' as const, label: 'Changes', icon: <FileDiff className="w-4 h-4" /> },
                      { id: 'code' as const, label: 'Code', icon: <Code2 className="w-4 h-4" /> },
                      { id: 'terminal' as const, label: 'Terminal (read-only)', icon: <Terminal className="w-4 h-4" /> },
                      { id: 'app' as const, label: 'App', icon: <Monitor className="w-4 h-4" /> },
                      { id: 'browser' as const, label: 'Browser', icon: <Globe className="w-4 h-4" /> },
                      { id: 'planner' as const, label: 'Planner', icon: <ClipboardList className="w-4 h-4" /> },
                      { id: 'tasks' as const, label: 'Tasks', icon: <ListTodo className="w-4 h-4" /> },
                    ] as const
                  ).map(({ id, label, icon }) => {
                    const isPinned = pinnedTabs[id];
                    return (
                      <DropdownMenuItem
                        key={id}
                        data-testid="context-menu-list-item"
                        className="cursor-pointer gap-2"
                        onSelect={(event) => {
                          // Radix often sets target to the menu item, not the click origin — use composedPath
                          const native = (event as unknown as SyntheticEvent).nativeEvent as
                            | (Event & { composedPath?: () => EventTarget[] })
                            | undefined;
                          const path =
                            typeof native?.composedPath === 'function' ? native.composedPath() : [];
                          const pinHit =
                            path.some(
                              (node) => node instanceof HTMLElement && node.hasAttribute('data-pin-toggle')
                            ) ||
                            (event.target as HTMLElement | null)?.closest?.('[data-pin-toggle]');
                          if (pinHit) {
                            event.preventDefault();
                            togglePinned(id);
                            return;
                          }
                          handleCanvasTabClick(id);
                        }}
                      >
                        {icon}
                        <span className="flex-1 text-left">{label}</span>
                        <span
                          data-pin-toggle
                          data-pinned={isPinned ? 'true' : 'false'}
                          className={cn(
                            'inline-flex shrink-0 rounded p-0.5 -m-0.5 hover:bg-muted/60 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            isPinned &&
                              'bg-primary/15 [&_svg]:text-primary group-hover:[&_svg]:!text-primary'
                          )}
                          aria-label={isPinned ? 'Pinned to toolbar — click to unpin' : 'Not pinned — click to pin to toolbar'}
                          aria-pressed={isPinned}
                          title={isPinned ? 'Pinned to toolbar (click to unpin)' : 'Not pinned (click to pin)'}
                        >
                          {isPinned ? (
                            <PinOff className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                          ) : (
                            <Pin className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
                          )}
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main two-panel layout */}
          <div className="h-full flex flex-col overflow-hidden flex-1 min-h-0">
            <div
              ref={splitRowRef}
              className={cn(
                'relative flex flex-1 overflow-hidden min-h-0',
                !isCanvasResizeDragging && 'transition-all duration-300 ease-in-out'
              )}
              style={{ transitionProperty: isCanvasResizeDragging ? 'none' : 'all' }}
            >
              {/* Left panel: chat */}
              <div
                className={cn(
                  'flex flex-col bg-background overflow-hidden min-h-0',
                  !isCanvasResizeDragging && 'transition-all duration-300 ease-in-out'
                )}
                style={{
                  width: `${effectiveLeftWidth}%`,
                  transitionProperty: isCanvasResizeDragging ? 'none' : 'all',
                }}
              >
                <div className="flex justify-center w-full h-full min-h-0">
                  <div className="w-full transition-all duration-300 ease-in-out max-w-4xl h-full flex flex-col min-h-0">
                    <div className="h-full flex flex-col justify-between pr-0 md:pr-4 relative min-h-0">
                      <div className="scrollbar-on-hover flex flex-col grow overflow-y-auto overflow-x-hidden px-4 pt-4 gap-2 min-h-0 relative" style={{ marginLeft: 12 }}>
                        {/* Loading skeleton: visible for 2s then fades out */}
                        <div
                          className={cn(
                            'absolute inset-0 flex flex-col gap-6 p-4 px-4 pt-4 overflow-hidden transition-opacity duration-300 ease-out pointer-events-none',
                            chatContentMode === 'skeleton' ? 'opacity-100' : 'opacity-0'
                          )}
                          data-testid="chat-messages-skeleton"
                          aria-label="Loading conversation"
                          aria-hidden={chatContentMode !== 'skeleton'}
                        >
                          <div className="flex w-full justify-end">
                            <div className="rounded-md bg-foreground/5 animate-pulse w-[25%] h-4" />
                          </div>
                          <div className="flex w-full justify-start">
                            <div className="rounded-md bg-foreground/5 animate-pulse w-[60%] h-4" />
                          </div>
                          <div className="flex w-full justify-start">
                            <div className="rounded-md bg-foreground/5 animate-pulse w-[45%] h-4" />
                          </div>
                          <div className="flex w-full justify-start">
                            <div className="rounded-md bg-foreground/5 animate-pulse w-[65%] h-20" />
                          </div>
                          <div className="flex w-full justify-end">
                            <div className="rounded-md bg-foreground/5 animate-pulse w-[35%] h-4" />
                          </div>
                          <div className="flex w-full justify-start">
                            <div className="rounded-md bg-foreground/5 animate-pulse w-[50%] h-4" />
                          </div>
                          <div className="flex w-full justify-end">
                            <div className="rounded-md bg-foreground/5 animate-pulse w-[30%] h-4" />
                          </div>
                          <div className="flex w-full justify-start">
                            <div className="rounded-md bg-foreground/5 animate-pulse w-[75%] h-4" />
                          </div>
                          <div className="flex w-full justify-start">
                            <div className="rounded-md bg-foreground/5 animate-pulse w-[55%] h-4" />
                          </div>
                        </div>
                        {/* Conversation: fades in after loading */}
                        <div
                          className={cn(
                            'absolute inset-0 flex flex-col gap-2 overflow-y-auto overflow-x-hidden scrollbar-on-hover transition-opacity duration-300 ease-out',
                            chatContentMode === 'conversation' && conversationLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                          )}
                          data-testid="chat-conversation"
                          aria-hidden={chatContentMode !== 'conversation' || !conversationLoaded}
                        >
                          <article
                            data-testid="user-message"
                            className="rounded-md relative w-fit max-w-full last:mb-4 flex flex-col gap-2 p-3 bg-muted self-end"
                          >
                            <div className="text-sm" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              <p className="py-1.5 first:pt-0 last:pb-0">run this</p>
                            </div>
                          </article>
                          <article
                            data-testid="agent-message"
                            className="rounded-md relative last:mb-4 flex flex-col gap-2 mt-6 w-full max-w-full bg-transparent"
                          >
                            <div className="text-sm w-full" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              {/* File read block: project/ */}
                              <div className="flex flex-col gap-2 my-2 py-2 text-sm text-muted-foreground w-full font-sans">
                                <div className="flex items-center justify-between font-normal text-muted-foreground">
                                  <div>
                                    <span className="text-muted-foreground">Read</span>{' '}
                                    <span className="font-sans" title="/workspace/project">
                                      project/
                                    </span>
                                    <button
                                      type="button"
                                      className="cursor-pointer text-left"
                                      aria-label={projectReadExpanded ? 'Collapse' : 'Expand'}
                                      aria-expanded={projectReadExpanded}
                                      onClick={() => setProjectReadExpanded((e) => !e)}
                                    >
                                      {projectReadExpanded ? (
                                        <ChevronUp className="h-4 w-4 ml-2 inline text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 ml-2 inline text-muted-foreground" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                {projectReadExpanded && (
                                  <div data-testid="markdown-renderer" className="mt-1">
                                    <pre className="bg-card text-foreground p-4 rounded border border-border overflow-auto text-xs font-mono whitespace-pre">
                                      <code>
                                        {`Here's the files and directories up to 2 levels deep in /workspace/project, excluding hidden items:
/workspace/project/
/workspace/project/All-Hands-UI-XP/
/workspace/project/All-Hands-UI-XP/index.html
/workspace/project/All-Hands-UI-XP/index.ts
/workspace/project/All-Hands-UI-XP/node_modules/
/workspace/project/All-Hands-UI-XP/package-lock.json
/workspace/project/All-Hands-UI-XP/package.json
/workspace/project/All-Hands-UI-XP/postcss.config.js
/workspace/project/All-Hands-UI-XP/src/
/workspace/project/All-Hands-UI-XP/tailwind.config.js
/workspace/project/All-Hands-UI-XP/tsconfig.json
/workspace/project/All-Hands-UI-XP/tsconfig.node.json
/workspace/project/All-Hands-UI-XP/vite.config.ts

1 hidden files/directories in this directory are excluded. You can use 'ls -la /workspace/project' to see them.`}
                                      </code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                              <p className="py-1.5 first:pt-0 last:pb-0">
                                I see there&apos;s a Vite/TypeScript project. Let me check the package.json to see the available scripts and then run it:
                              </p>
                              {/* File read block: package.json */}
                              <div className="flex flex-col gap-2 my-2 py-2 text-sm text-muted-foreground w-full font-sans">
                                <div className="flex items-center justify-between font-normal text-muted-foreground">
                                  <div>
                                    <span className="text-muted-foreground">Read</span>{' '}
                                    <span className="font-sans" title="/workspace/project/All-Hands-UI-XP/package.json">
                                      package.json
                                    </span>
                                    <button
                                      type="button"
                                      className="cursor-pointer text-left"
                                      aria-label={packageJsonReadExpanded ? 'Collapse' : 'Expand'}
                                      aria-expanded={packageJsonReadExpanded}
                                      onClick={() => setPackageJsonReadExpanded((e) => !e)}
                                    >
                                      {packageJsonReadExpanded ? (
                                        <ChevronUp className="h-4 w-4 ml-2 inline text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 ml-2 inline text-muted-foreground" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                {packageJsonReadExpanded && (
                                  <div data-testid="markdown-renderer" className="mt-1">
                                    <pre className="bg-card text-foreground p-4 rounded border border-border overflow-auto text-xs font-mono whitespace-pre">
                                      <code>
                                        {`{
  "name": "all-hands-ui-xp",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    ...
  }
}`}
                                      </code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                              {/* Ran command block */}
                              <div className="flex flex-col gap-2 my-2 py-2 text-sm text-muted-foreground w-full font-sans">
                                <div className="flex items-center justify-between font-normal text-muted-foreground">
                                  <div>
                                    <span className="text-muted-foreground">Ran</span>{' '}
                                    <span className="font-sans" title="sleep 2 && cat /workspace/project/All-Hands-UI-XP/server.log">
                                      cat server.log
                                    </span>
                                    <button
                                      type="button"
                                      className="cursor-pointer text-left"
                                      aria-label={ranCommandExpanded ? 'Collapse' : 'Expand'}
                                      aria-expanded={ranCommandExpanded}
                                      onClick={() => setRanCommandExpanded((e) => !e)}
                                    >
                                      {ranCommandExpanded ? (
                                        <ChevronUp className="h-4 w-4 ml-2 inline text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 ml-2 inline text-muted-foreground" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                {ranCommandExpanded && (
                                  <div data-testid="markdown-renderer" className="mt-1 space-y-2">
                                    <p className="text-muted-foreground text-sm">
                                      Command:{' '}
                                      <code className="bg-card text-foreground px-1.5 py-0.5 rounded border border-border text-xs font-mono">
                                        sleep 2 &amp;&amp; cat /workspace/project/All-Hands-UI-XP/server.log
                                      </code>
                                    </p>
                                    <p className="text-muted-foreground text-sm">Output:</p>
                                    <pre className="bg-background text-foreground p-4 rounded-lg border border-border overflow-auto text-xs font-mono whitespace-pre">
                                      <code>
                                        {`[1]+  Exit 1                  cd /workspace/project/All-Hands-UI-XP && npm run dev -- --port 12000 --host 0.0.0.0 > server.log 2>&1

> all-hands-ui-xp@1.0.0 dev
> vite --port 12000 --host 0.0.0.0

/workspace/project/All-Hands-UI-XP/node_modules/rollup/dist/native.js:64
                throw new Error(
                      ^

Error: Cannot find module @rollup/rollup-linux-x64-gnu. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try \`npm i\` again after removing both package-lock.json and node_modules directory.
    at requireWithFriendlyError (/workspace/project/All-Hands-UI-XP/node_modules/rollup/dist/native.js:64:9)
    at Object.<anonymous> (/workspace/project/All-Hands-UI-XP/node_modules/rollup/dist/native.js:73:76)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    at Object..js (node:internal/modules/cjs/loader:1839:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:internal/modules/cjs/loader:1441:32)
    ...`}
                                      </code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                              <div data-testid="markdown-renderer">
                                <p className="py-2.5 first:pt-0 last:pb-0">
                                  The server is running! There are some warnings about missing files and CSS import order, but the server has started on port 12000.
                                </p>
                                <p className="py-2.5 first:pt-0 last:pb-0">
                                  ✅ <strong>The app is now running!</strong> You can access it at:
                                </p>
                                <p className="py-2.5 first:pt-0 last:pb-0">
                                  <a
                                    className="text-info hover:underline font-normal"
                                    href="https://work-1-vliuruphcuvxshgd.prod-runtime.all-hands.dev"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    https://work-1-vliuruphcuvxshgd.prod-runtime.all-hands.dev
                                  </a>
                                </p>
                                <p className="py-2.5 first:pt-0 last:pb-0">
                                  Note: There are a few development warnings:
                                </p>
                                <ol className="list-decimal ml-5 pl-2 whitespace-normal">
                                  <li>
                                    Missing import{' '}
                                    <code className="bg-card text-foreground px-1.5 py-0.5 rounded border border-border text-xs font-mono">
                                      ./components/chat/ConversationDrawer
                                    </code>{' '}
                                    in App.tsx
                                  </li>
                                  <li>
                                    Missing import{' '}
                                    <code className="bg-card text-foreground px-1.5 py-0.5 rounded border border-border text-xs font-mono">
                                      ../ui/popover
                                    </code>{' '}
                                    in LeftNav.tsx
                                  </li>
                                  <li>
                                    CSS{' '}
                                    <code className="bg-card text-foreground px-1.5 py-0.5 rounded border border-border text-xs font-mono">
                                      @import
                                    </code>{' '}
                                    should be placed before{' '}
                                    <code className="bg-card text-foreground px-1.5 py-0.5 rounded border border-border text-xs font-mono">
                                      @tailwind
                                    </code>{' '}
                                    directives
                                  </li>
                                  <li>
                                    Duplicate{' '}
                                    <code className="bg-card text-foreground px-1.5 py-0.5 rounded border border-border text-xs font-mono">
                                      style
                                    </code>{' '}
                                    attribute in WavingHand.tsx
                                  </li>
                                </ol>
                                <p className="py-2.5 first:pt-0 last:pb-0">
                                  The app should still load, though some features may be missing. Would you like me to fix these issues?
                                </p>
                              </div>
                              <p className="py-1.5 first:pt-0 last:pb-0">
                                I see many TypeScript errors that need to be fixed for the Vercel build. Let me create a task plan and fix them systematically.
                              </p>
                              {/* Tasks panel */}
                              <div className="flex flex-col overflow-clip bg-card border border-border rounded-md w-full mt-4">
                                <div className="flex gap-1 items-center border-b border-border h-[41px] px-2 shrink-0">
                                  <ListTodo className="shrink-0 w-4 h-4 text-muted-foreground" aria-hidden />
                                  <span className="text-xs text-nowrap text-foreground tracking-[0.11px] font-medium leading-[16px] whitespace-pre">
                                    Tasks
                                  </span>
                                </div>
                                <div>
                                  {[
                                    'Fix missing module imports (ConversationDrawer, conversations, popover)',
                                    'Fix TopBar and ChatArea props (activeChatWindowTab)',
                                    'Fix Canvas component props (theme not in types)',
                                    'Fix ChatThread.tsx (messagesEndRef, unused imports)',
                                    'Fix WavingHand.tsx duplicate style attribute',
                                    'Fix remaining unused variable warnings',
                                    'Test build to verify all errors are fixed',
                                  ].map((label, i) => (
                                    <div key={i} className="flex gap-[14px] items-center px-4 py-2 w-full" data-name="item">
                                      <Circle className="shrink-0 w-4 h-4 text-foreground" aria-hidden />
                                      <div className="flex flex-col items-start justify-center leading-[20px] text-nowrap whitespace-pre font-normal">
                                        <span className="font-normal text-xs text-foreground">{label}</span>
                                        <span className="font-normal text-xs text-muted-foreground">Notes: </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </article>
                        </div>
                        {chatContentMode === 'start' && <ChatStartScreen />}
                      </div>
                      <div className="flex flex-col gap-0 flex-shrink-0">
                        {conversationLoaded && (
                          <div
                            className={cn(
                              'relative z-0 w-full flex flex-col gap-0 shrink-0 overflow-visible transition-opacity duration-300 ease-out -mb-2 -mt-6',
                              drawersAnimatedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            )}
                            style={{ transform: 'translateY(-2px)' }}
                            aria-hidden={!drawersAnimatedIn}
                          >
                            {taskListDrawerVisible && (
                            <div
                              className={cn(
                                'relative flex flex-col border border-border border-b-0 bg-card rounded-t-xl overflow-hidden transition-transform duration-300 ease-out -mb-px',
                                changesDrawerVisible ? 'z-0' : 'z-[1]',
                                drawersAnimatedIn
                                  ? changesDrawerVisible
                                    ? 'translate-y-[1.45rem]'
                                    : 'translate-y-2'
                                  : 'translate-y-full'
                              )}
                              style={{ transitionDelay: changesDrawerVisible ? '100ms' : '0ms' }}
                              data-testid="drawer-task-list"
                            >
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => { setChangesExpanded(false); setTaskListExpanded((e) => !e); }}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setChangesExpanded(false); setTaskListExpanded((prev) => !prev); } }}
                                className={cn(
                                  'flex items-center justify-between w-full px-4 py-2 min-h-[32px] text-left rounded-t-xl bg-card cursor-pointer group hover:bg-muted/60 transition-colors duration-200',
                                  taskListExpanded ? 'pb-2' : 'pb-6'
                                )}
                                aria-expanded={taskListExpanded}
                                aria-controls="drawer-task-list-content"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-sm font-semibold text-foreground shrink-0">Task List</span>
                                  <span className="text-xs text-muted-foreground truncate">5/10 Tasks Completed.</span>
                                  {taskListExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto shrink-0" aria-hidden />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto shrink-0" aria-hidden />
                                  )}
                                </div>
                              </div>
                              <div
                                id="drawer-task-list-content"
                                className={cn(
                                  'grid transition-[grid-template-rows] duration-300 ease-out',
                                  taskListExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                )}
                                aria-hidden={!taskListExpanded}
                              >
                                <div className={cn('min-h-0 overflow-hidden', taskListExpanded && 'border-t border-border')}>
                                  <div className="space-y-1.5 bg-card px-4 py-3 pb-[1.45rem]">
                                    {TASK_LIST_DRAWER_ITEMS.map((task) => (
                                      <TaskListDrawerItem key={task.label} label={task.label} status={task.status} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            )}
                            {changesDrawerVisible && (
                            <div
                              className={cn(
                                'relative z-[1] flex flex-col border border-border border-b-0 bg-card rounded-t-xl overflow-hidden transition-transform duration-300 ease-out -mb-px',
                                drawersAnimatedIn ? 'translate-y-2' : 'translate-y-full'
                              )}
                              style={{ transitionDelay: '0ms' }}
                              data-testid="drawer-changes"
                            >
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => { setTaskListExpanded(false); setChangesExpanded((e) => !e); }}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTaskListExpanded(false); setChangesExpanded((prev) => !prev); } }}
                                className={cn(
                                  'flex items-center justify-between w-full px-4 py-2 min-h-[32px] text-left rounded-t-xl bg-card cursor-pointer group hover:bg-muted/60 transition-colors duration-200',
                                  changesExpanded ? 'pb-2' : 'pb-6'
                                )}
                                aria-expanded={changesExpanded}
                                aria-controls="drawer-changes-content"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-sm font-semibold text-foreground">Changes</span>
                                  <span className="text-xs text-success">+89</span>
                                  <span className="text-xs text-destructive">-23</span>
                                  <span className="text-xs text-muted-foreground">5 Files</span>
                                  {changesExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto shrink-0" aria-hidden />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto shrink-0" aria-hidden />
                                  )}
                                </div>
                              </div>
                              <div
                                id="drawer-changes-content"
                                className={cn(
                                  'grid transition-[grid-template-rows] duration-300 ease-out',
                                  changesExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                )}
                                aria-hidden={!changesExpanded}
                              >
                                <div className={cn('min-h-0 overflow-hidden', changesExpanded && 'border-t border-border')}>
                                  <div className="space-y-1.5 bg-card px-4 py-3 pb-[1.45rem]">
                                    {CHANGE_FILE_ITEMS.filter((file) => CHANGE_DRAWER_FILE_IDS.includes(file.id)).map((file) => (
                                      <button
                                        key={file.id}
                                        type="button"
                                        className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm text-foreground transition-colors hover:bg-muted/60"
                                        onClick={() => handleChangeDrawerItemSelect(file.id)}
                                      >
                                        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                                        <span className="min-w-0 flex-1 truncate">{file.path}</span>
                                        <span className="shrink-0 text-xs text-success">+{file.additions}</span>
                                        <span className="shrink-0 text-xs text-destructive">-{file.deletions}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            )}
                          </div>
                        )}
                        <div className="z-10 h-0 w-full shrink-0 bg-transparent" aria-hidden />
                        <div
                          data-testid="interactive-chat-box"
                          className="relative z-10 -mt-[1px]"
                        >
                          {shouldShowInputStatusBadge && (
                            <div className="absolute left-0 z-20 bottom-[calc(100%+6px)] flex items-end gap-1">
                              <div
                                data-testid="chat-status-indicator"
                                className={cn(
                                  'h-6 w-fit rounded-full py-1 px-2.5 bg-muted flex items-center gap-1.5 transition-opacity duration-300',
                                  statusIndicatorExiting && 'opacity-0'
                                )}
                              >
                                <span className={cn('opacity-100', chatStatusIndex < CHAT_STATUS_MESSAGES.length - 1 && 'animate-pulse')}>
                                  <span
                                    className={cn(
                                      'w-2 h-2 rounded-full block shrink-0',
                                      chatStatusIndex === CHAT_STATUS_MESSAGES.length - 1 ? 'bg-success' : 'bg-[#FFD600]'
                                    )}
                                  />
                                </span>
                                <span className="font-normal text-xs leading-4 normal-case">
                                  {CHAT_STATUS_MESSAGES[chatStatusIndex]}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="flex flex-col">
                          <div
                            role="status"
                            aria-live="polite"
                            aria-hidden={!showRefreshNotification}
                            className={cn(
                              'w-full rounded-lg bg-muted text-foreground px-3 flex items-center gap-2 overflow-hidden',
                              'transition-[max-height,opacity,margin,padding,border] duration-200',
                              showRefreshNotification
                                ? 'border border-muted-foreground/30 animate-in fade-in-0 slide-in-from-top-1 max-h-24 opacity-100 py-2 mb-2'
                                : 'border-0 animate-out fade-out-0 slide-out-to-top-1 max-h-0 opacity-0 py-0 mb-0 pointer-events-none'
                            )}
                            data-testid="reconnect-banner"
                          >
                            <RefreshCw className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
                            <span className="text-sm font-medium flex-1 text-left">Refresh the page to update session</span>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-md border border-muted-foreground/30 bg-transparent px-2 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted-hover hover:border-muted-foreground/50"
                              onClick={() => window.location.reload()}
                            >
                              Refresh
                            </button>
                          </div>
                          <div
                            role="status"
                            aria-live="polite"
                            aria-hidden={!showErrorNotification}
                            className={cn(
                              'w-full rounded-lg bg-muted text-foreground px-3 flex items-center gap-2 overflow-hidden',
                              'transition-[max-height,opacity,margin,padding,border] duration-200',
                              showErrorNotification
                                ? 'border border-muted-foreground/30 animate-in fade-in-0 slide-in-from-top-1 max-h-24 opacity-100 py-2 mb-2'
                                : 'border-0 animate-out fade-out-0 slide-out-to-top-1 max-h-0 opacity-0 py-0 mb-0 pointer-events-none'
                            )}
                            data-testid="error-banner"
                          >
                            <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
                            <span className="text-sm font-medium flex-1 text-left">An Unknown Error Occurred</span>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-md border border-muted-foreground/30 bg-transparent px-2 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted-hover hover:border-muted-foreground/50"
                              onClick={onToggleErrorNotification}
                            >
                              Dismiss
                            </button>
                          </div>
                            {(inputStatusBadgeState !== 'off' || composerStatusBadgeState !== 'off') && (
                              <div className="sr-only" />
                            )}
                            <div className="relative w-full">
                              {isCommandMenuOpen && (
                                <div className="absolute left-0 bottom-full mb-3 w-full max-w-[420px] z-30">
                                  <div className="rounded-lg border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden">
                                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border/60">
                                      Commands
                                    </div>
                                    <div
                                      role="listbox"
                                      id={COMMAND_LIST_ID}
                                      aria-label="Slash commands"
                                      className="max-h-56 overflow-auto p-1"
                                      ref={commandListRef}
                                    >
                                      {filteredCommands.length > 0 ? (
                                        filteredCommands.map((command, index) => {
                                          const isActive = index === commandActiveIndex;
                                          return (
                                            <button
                                              key={command.id}
                                              type="button"
                                              role="option"
                                              aria-selected={isActive}
                                              className={cn(
                                                'w-full text-left px-3 py-2 rounded-md flex items-start text-sm transition-colors',
                                                isActive
                                                  ? 'bg-muted text-foreground'
                                                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                              )}
                                              ref={(node) => {
                                                commandItemRefs.current[index] = node;
                                              }}
                                              onMouseDown={(event) => {
                                                event.preventDefault();
                                                applyCommandChip(command);
                                              }}
                                            >
                                              <span className="flex-1 min-w-0">
                                                <span className="flex items-center gap-2">
                                                  <span className="font-medium text-foreground">{command.label}</span>
                                                  <span className="text-xs text-muted-foreground">{command.command}</span>
                                                </span>
                                                <span className="block text-xs text-muted-foreground">{command.description}</span>
                                              </span>
                                            </button>
                                          );
                                        })
                                      ) : (
                                        <div className="px-3 py-2 text-xs text-muted-foreground">No matching commands.</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {isCliCommandVisible && (
                                <div className="absolute left-0 right-0 bottom-full mb-3 z-20" data-testid="cli-open-command-panel">
                                  <div className="w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg px-3 py-2">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-xs font-medium text-foreground">Open Conversation in CLI</p>
                                        <p className="mt-1 text-xs text-muted-foreground">Copy and run this command in your terminal.</p>
                                      </div>
                                      <button
                                        type="button"
                                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                                        aria-label="Close CLI command panel"
                                        data-testid="close-cli-command-panel"
                                        onClick={() => setIsCliCommandVisible(false)}
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-background/60 px-2 py-1.5">
                                      <code className="flex-1 min-w-0 truncate text-xs text-foreground">{openConversationCliCommand}</code>
                                      <button
                                        type="button"
                                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                                        aria-label="Copy CLI command"
                                        data-testid="copy-cli-command-button"
                                        onClick={handleCopyCliCommand}
                                      >
                                        {isCliCommandCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {chatInputHasMultipleLines && (
                                <div className="absolute -top-3 left-0 z-20 h-6 w-full lg:h-3" id="resize-grip">
                                  <div
                                    className={cn(
                                      'absolute top-1 left-0 z-10 h-px w-full bg-foreground cursor-ns-resize transition-opacity duration-200',
                                      isChatInputGripDragging ? 'opacity-100' : 'opacity-0'
                                    )}
                                    style={{ userSelect: 'none' }}
                                    role="separator"
                                    aria-orientation="horizontal"
                                    aria-label="Resize chat input height"
                                    onMouseDown={handleChatInputGripMouseDown}
                                  />
                                </div>
                              )}
                              <div className="border border-border box-border content-stretch flex flex-col items-start justify-center relative rounded-xl w-full bg-secondary" style={{ padding: '.75rem' }}>
                                {composerAttachments.length > 0 && (
                                  <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar pb-3">
                                    <div className="flex w-max min-w-full items-center gap-2">
                                      {composerAttachments.map((attachment) => (
                                        <ComposerAttachmentChip
                                          key={attachment.id}
                                          attachment={attachment}
                                          onRemove={handleRemoveComposerAttachment}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="box-border content-stretch flex flex-row items-end justify-between p-0 relative shrink-0 w-full pb-[18px] gap-2">
                                  <div className="relative min-w-0 flex-1 box-border content-stretch flex flex-row gap-4 items-end justify-start p-0">
                                    <button
                                      type="button"
                                      className={cn(
                                        'flex items-center justify-center rounded-full size-8 shrink-0 transition-all duration-200',
                                        attachmentPreviewsEnabled
                                          ? 'cursor-pointer text-muted-foreground hover:scale-105 hover:bg-muted hover:text-foreground active:scale-[0.97]'
                                          : 'cursor-not-allowed text-muted-foreground/60'
                                      )}
                                      data-testid="paperclip-icon"
                                      aria-label="Attach"
                                      aria-disabled={!attachmentPreviewsEnabled}
                                      onClick={handleAttachmentClick}
                                    >
                                      <Paperclip className="w-4 h-4" />
                                    </button>
                                    <div className="min-w-0 flex-1 box-border flex flex-row items-start justify-start min-h-6 p-0">
                                      <div
                                        ref={chatInputRef}
                                        contentEditable
                                        data-placeholder="What do you want to build?"
                                        data-testid="chat-input"
                                        className="chat-input min-w-0 max-w-full bg-transparent text-foreground text-base font-normal leading-5 outline-none resize-none custom-scrollbar min-h-5 w-full block break-words whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
                                        role="textbox"
                                        aria-multiline="true"
                                        aria-expanded={isCommandMenuOpen}
                                        aria-controls={COMMAND_LIST_ID}
                                        onInput={(e) => {
                                          const value = (e.target as HTMLDivElement).innerText;
                                          setChatInput(value);
                                          updateCommandMenuState(value);
                                          adjustChatInputHeight();
                                        }}
                                        onKeyDown={(e) => {
                                          const handled = handleCommandNavigation(e);
                                          if (handled) return;
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                          }
                                        }}
                                        onFocus={() => {
                                          if (blurTimeoutRef.current) {
                                            window.clearTimeout(blurTimeoutRef.current);
                                            blurTimeoutRef.current = null;
                                          }
                                        }}
                                        onBlur={() => {
                                          blurTimeoutRef.current = window.setTimeout(() => {
                                            setIsCommandMenuOpen(false);
                                            setCommandQuery('');
                                          }, 150);
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className={cn(
                                      'flex items-center justify-center rounded-full border size-[35px] transition-colors',
                                      hasInput
                                        ? 'bg-primary text-primary-foreground border-primary cursor-pointer hover:opacity-90'
                                        : 'border-[hsl(0,0%,24%)] text-[hsl(0,0%,70%)] cursor-not-allowed'
                                    )}
                                    data-testid="submit-button"
                                    disabled={!hasInput}
                                    aria-label="Send"
                                    onClick={hasInput ? handleSendMessage : undefined}
                                  >
                                    <ArrowUp className="w-6 h-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                  </button>
                                </div>
                                <div className="w-full flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-nowrap overflow-hidden">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className="flex items-center gap-1 cursor-pointer text-muted-foreground rounded-full border border-transparent bg-transparent px-2 py-0.5 transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground active:border-border active:bg-muted/60 active:text-foreground data-[state=open]:border-border data-[state=open]:bg-muted/50 data-[state=open]:text-foreground whitespace-nowrap shrink-0"
                                      aria-label="Tools"
                                      data-testid="tools-trigger"
                                    >
                                      <Wrench className="h-[13px] w-[13px] shrink-0" />
                                      <span className="text-xs font-normal leading-4">Tools</span>
                                      <ChevronDown className="h-[11px] w-[11px] shrink-0 opacity-50" />
                                    </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={8}
                                        className="min-w-[200px] rounded-lg py-[6px] px-1 z-[100]"
                                        data-testid="tools-context-menu"
                                      >
                                        <DropdownMenuSub>
                                          <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                                            <GitBranch className="h-4 w-4 shrink-0" />
                                            Git Tools
                                          </DropdownMenuSubTrigger>
                                          <DropdownMenuSubContent className="rounded-lg min-w-[8rem]">
                                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                              <ArrowDownToLine className="h-4 w-4" />
                                              Git Pull
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                              <ArrowUpIcon className="h-4 w-4" />
                                              Git Push
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                              <GitPullRequest className="h-4 w-4" />
                                              Create PR
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                              <GitBranch className="h-4 w-4" />
                                              Create New Branch
                                            </DropdownMenuItem>
                                          </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSub>
                                          <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                                            <Merge className="h-4 w-4 shrink-0" />
                                            Macros
                                          </DropdownMenuSubTrigger>
                                          <DropdownMenuSubContent className="rounded-lg min-w-[8rem]">
                                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                              <TestTube className="h-4 w-4" />
                                              Increase test coverage
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                              <FileText className="h-4 w-4" />
                                              Fix README
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                              <Merge className="h-4 w-4" />
                                              Auto-merge PRs
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                              <Droplets className="h-4 w-4" />
                                              Clean dependencies
                                            </DropdownMenuItem>
                                          </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="gap-2 cursor-pointer"
                                          onSelect={() => {
                                            setIsCliCommandVisible(true);
                                            setIsCliCommandCopied(false);
                                          }}
                                        >
                                          <Terminal className="h-4 w-4" />
                                          Open Conversation in CLI
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="gap-2 cursor-pointer"
                                          onSelect={() => setTaskListDrawerVisible((v) => !v)}
                                        >
                                          <ListTodo className="h-4 w-4" />
                                          {taskListDrawerVisible ? 'Hide Task List' : 'Show Task List'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="gap-2 cursor-pointer"
                                          onSelect={() => setChangesDrawerVisible((v) => !v)}
                                        >
                                          <Code2 className="h-4 w-4" />
                                          {changesDrawerVisible ? 'Hide Changes' : 'Show Changes'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuSub>
                                          <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                                            <Sparkles className="h-4 w-4" />
                                            Show Available Skills and Plugins
                                          </DropdownMenuSubTrigger>
                                          <DropdownMenuSubContent
                                            sideOffset={6}
                                            alignOffset={-136}
                                            className="min-w-[240px] rounded-lg"
                                          >
                                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                              Loaded Skills
                                            </DropdownMenuLabel>
                                            {LOADED_CONVERSATION_SKILLS.map((skill) => (
                                              <DropdownMenuItem
                                                key={skill.id}
                                                className="gap-2 cursor-pointer"
                                                onSelect={() => setSelectedCapability(skill)}
                                              >
                                                <Bot className="h-4 w-4 shrink-0" />
                                                {skill.name}
                                              </DropdownMenuItem>
                                            ))}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                              Loaded Plugins
                                            </DropdownMenuLabel>
                                            {LOADED_CONVERSATION_PLUGINS.map((plugin) => (
                                              <DropdownMenuItem
                                                key={plugin.id}
                                                className="gap-2 cursor-pointer"
                                                onSelect={() => setSelectedCapability(plugin)}
                                              >
                                                <Box className="h-4 w-4 shrink-0" />
                                                {plugin.name}
                                              </DropdownMenuItem>
                                            ))}
                                          </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuItem className="gap-2 cursor-pointer">
                                          <Wrench className="h-4 w-4" />
                                          Show Agent Tools &amp; Metadata
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          type="button"
                                          className={cn(
                                            'flex items-center gap-1 cursor-pointer rounded-full border px-2 py-0.5 transition-colors text-xs font-normal leading-4 whitespace-nowrap shrink-0',
                                            chatMode === 'build' && 'border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground data-[state=open]:border-border data-[state=open]:bg-muted/50 data-[state=open]:text-foreground',
                                            chatMode === 'ask' && 'border-info/50 bg-info/20 text-info hover:bg-info/30',
                                            chatMode === 'plan' && 'border-success/50 bg-success/20 text-success-foreground hover:bg-success/30'
                                          )}
                                          aria-label="Chat mode"
                                          data-testid="mode-pill"
                                        >
                                          {chatMode === 'build' && <CodeModeIcon className="h-[11px] w-[11px] shrink-0" />}
                                          {chatMode === 'ask' && <MessageCircleQuestion className="h-[13px] w-[13px] shrink-0" aria-hidden />}
                                          {chatMode === 'plan' && <PlanModeIcon className="h-[11px] w-[11px] shrink-0" />}
                                          <span>{chatMode === 'build' ? 'Code' : chatMode === 'ask' ? 'Ask' : 'Plan'}</span>
                                          <ChevronDown className="h-[11px] w-[11px] shrink-0 opacity-50" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={8}
                                        className="min-w-[195px] max-w-[195px] rounded-lg py-[6px] px-1 z-[100]"
                                        data-testid="mode-menu"
                                      >
                                        <DropdownMenuItem
                                          data-testid="code-option"
                                          className={cn(
                                            'rounded p-2 text-left data-[highlighted]:bg-muted/60',
                                            chatMode === 'build' && 'bg-muted/60'
                                          )}
                                          onSelect={() => setChatMode('build')}
                                        >
                                          <div className="flex w-full flex-col gap-1">
                                            <div className="flex items-center justify-between gap-3">
                                              <div className="flex items-center gap-3">
                                                <CodeModeIcon className="h-4 w-4 shrink-0" />
                                                <span className="text-sm text-foreground">Code</span>
                                              </div>
                                              {chatMode === 'build' ? <Check className="h-3.5 w-3.5 shrink-0 text-foreground" /> : null}
                                            </div>
                                            <span className="pl-7 text-xs font-normal leading-4 text-muted-foreground whitespace-pre-wrap break-words">
                                              Write, edit, and debug with AI assistance in real time.
                                            </span>
                                          </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          data-testid="ask-option"
                                          className={cn(
                                            'rounded p-2 text-left data-[highlighted]:bg-muted/60',
                                            chatMode === 'ask' && 'bg-info/10'
                                          )}
                                          onSelect={() => setChatMode('ask')}
                                        >
                                          <div className="flex w-full flex-col gap-1">
                                            <div className="flex items-center justify-between gap-3">
                                              <div className="flex items-center gap-3">
                                                <MessageCircleQuestion className="h-4 w-4 shrink-0" />
                                                <span className="text-sm text-foreground">Ask</span>
                                              </div>
                                              {chatMode === 'ask' ? <Check className="h-3.5 w-3.5 shrink-0 text-info" /> : null}
                                            </div>
                                            <span className="pl-7 text-xs font-normal leading-4 text-muted-foreground whitespace-pre-wrap break-words">
                                              Explore ideas, ask questions, and get guidance before making changes.
                                            </span>
                                          </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          data-testid="plan-option"
                                          className={cn(
                                            'rounded p-2 text-left data-[highlighted]:bg-muted/60',
                                            chatMode === 'plan' && 'bg-success/10'
                                          )}
                                          onSelect={() => setChatMode('plan')}
                                        >
                                          <div className="flex w-full flex-col gap-1">
                                            <div className="flex items-center justify-between gap-3">
                                              <div className="flex items-center gap-3">
                                                <PlanModeIcon className="h-4 w-4 shrink-0" />
                                                <span className="text-sm text-foreground">Plan</span>
                                              </div>
                                              {chatMode === 'plan' ? <Check className="h-3.5 w-3.5 shrink-0 text-success-foreground" /> : null}
                                            </div>
                                            <span className="pl-7 text-xs font-normal leading-4 text-muted-foreground whitespace-pre-wrap break-words">
                                              Outline goals, structure tasks, and map your next steps.
                                            </span>
                                          </div>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          type="button"
                                          className="flex min-w-0 items-center gap-1 cursor-pointer text-muted-foreground rounded-full border border-transparent bg-transparent px-2 py-0.5 transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground active:border-border active:bg-muted/60 active:text-foreground data-[state=open]:border-border data-[state=open]:bg-muted/50 data-[state=open]:text-foreground w-fit shrink-0 max-w-[160px]"
                                          aria-label="Select model"
                                          title={selectedModel}
                                          data-testid="model-trigger"
                                        >
                                          <span className="min-w-0 flex-1 truncate text-xs font-normal leading-4">
                                            {selectedModel}
                                          </span>
                                          <ChevronDown className="h-[11px] w-[11px] shrink-0 opacity-50" aria-hidden />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={8}
                                        className="min-w-[200px] rounded-lg py-[6px] px-1 z-[100]"
                                        data-testid="model-menu"
                                      >
                                        {LLM_MODELS.map((model) => (
                                          <DropdownMenuItem
                                            key={model}
                                            className="min-w-0 gap-2 cursor-pointer"
                                            onSelect={() => setSelectedModel(model)}
                                          >
                                            <ModelChipIcon className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">{model}</span>
                                          </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="gap-2 cursor-pointer"
                                          onSelect={() => {
                                            navigateAppRoute('/settings/llm');
                                          }}
                                        >
                                          <Settings className="h-4 w-4 shrink-0" />
                                          LLM Settings
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <AgentStatusBadge state={composerStatusBadgeState} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <RepositoryActionStrip
                            status={repositoryStatus}
                            repoName={connectedRepoName}
                            repoUrl={connectedRepoUrl}
                            branchName={connectedBranchName}
                            branchUrl={connectedBranchUrl}
                            onConnect={() => setIsConnectModalOpen(true)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right panel: canvas/loading */}
              <div
                className={cn(
                  'overflow-hidden flex-shrink-0 min-h-0',
                  !isCanvasResizeDragging && 'transition-all duration-300 ease-in-out',
                  canvasOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                style={{
                  width: `${effectiveRightWidth}%`,
                  transitionProperty: isCanvasResizeDragging ? 'none' : 'all',
                }}
                aria-hidden={!canvasOpen}
              >
                <div className={cn('flex flex-col flex-1 gap-3 h-full min-h-0', canvasOpen ? 'min-w-max' : 'min-w-0')}>
                  <div className="bg-muted/60 border border-border rounded-xl flex flex-col items-center justify-center h-full w-full min-h-[200px] relative">
                    {showCanvasLoading && (
                      <>
                        <div
                          aria-hidden={!showCanvasTip}
                          className={cn(
                            'absolute bottom-4 left-0 right-0 flex justify-center px-4 z-10',
                            'transition-[max-height,opacity,transform,margin] duration-200',
                            showCanvasTip
                              ? 'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 max-h-48 opacity-100'
                              : 'animate-out fade-out-0 zoom-out-95 slide-out-to-bottom-2 max-h-0 opacity-0 mb-0 pointer-events-none'
                          )}
                        >
                          {showCanvasTip && (
                            <div className="w-full max-w-2xl">
                              <Protip
                                variant={canvasTipVariant}
                                onDismiss={() => onCanvasTipVariantChange('none')}
                              />
                            </div>
                          )}
                        </div>
                        <Loader2 className="w-16 h-16 text-foreground animate-spin" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden />
                        <span className="text-sm font-normal leading-5 gradient-flow p-4">Loading...</span>
                      </>
                    )}
                    {!showCanvasLoading && (
                      <div
                        role="tabpanel"
                        aria-label={CANVAS_TAB_ARIA[activeTab]}
                        className="absolute inset-0 flex min-h-0 overflow-hidden"
                      >
                        <CanvasTabEmptyContent
                          activeTab={activeTab}
                          onCreatePlan={handleCreatePlanFromCanvas}
                          filled={canvasTabFilled[activeTab]}
                          selectedChangeFileId={selectedChangeFileId}
                          changeNavigationRequest={changeNavigationRequest}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Canvas split grip: white line on the boundary between chat and canvas */}
              {canvasOpen && (
                <div
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize canvas"
                  aria-valuemin={MIN_LEFT_PANEL_PCT}
                  aria-valuemax={MAX_LEFT_PANEL_PCT}
                  aria-valuenow={Math.round(leftPanelWidth)}
                  tabIndex={0}
                  onMouseDown={handleCanvasResizeMouseDown}
                  className="group absolute inset-y-0 z-20 flex w-3 -translate-x-1/2 cursor-col-resize items-center justify-center outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{ left: `${leftPanelWidth}%` }}
                >
                  <span
                    className={cn(
                      'h-full w-px bg-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.2)] transition-opacity duration-150',
                      isCanvasResizeDragging
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                    )}
                    aria-hidden
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <PrototypeControlsFab
            isActive={
              showRefreshNotification || showErrorNotification || showCanvasTip || showCanvasLoading || Boolean(automationContextTitle)
            }
          />
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-72 max-h-[min(28rem,75vh)] overflow-y-auto p-3 space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">Refresh Notification</div>
            <button
              type="button"
              role="switch"
              aria-checked={showRefreshNotification}
              onClick={onToggleRefreshNotification}
              className={cn(
                'h-6 w-10 rounded-full border border-border flex items-center px-0.5 transition-colors',
                showRefreshNotification ? 'bg-foreground/80' : 'bg-muted/60'
              )}
            >
              <span
                className={cn(
                  'h-4 w-4 rounded-full bg-background shadow transition-transform',
                  showRefreshNotification ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">Error Notification</div>
            <button
              type="button"
              role="switch"
              aria-checked={showErrorNotification}
              onClick={onToggleErrorNotification}
              className={cn(
                'h-6 w-10 rounded-full border border-border flex items-center px-0.5 transition-colors',
                showErrorNotification ? 'bg-foreground/80' : 'bg-muted/60'
              )}
            >
              <span
                className={cn(
                  'h-4 w-4 rounded-full bg-background shadow transition-transform',
                  showErrorNotification ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">Canvas Tip</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/60 whitespace-nowrap"
                  aria-label="Canvas tip"
                >
                  <span className="whitespace-nowrap">{canvasTipLabel}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px] rounded-lg py-[6px] px-1">
                {CANVAS_TIP_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    className="cursor-pointer"
                    onSelect={() => onCanvasTipVariantChange(option.id)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">Canvas Loading</div>
            <button
              type="button"
              role="switch"
              aria-checked={showCanvasLoading}
              onClick={onToggleCanvasLoading}
              className={cn(
                'h-6 w-10 rounded-full border border-border flex items-center px-0.5 transition-colors',
                showCanvasLoading ? 'bg-foreground/80' : 'bg-muted/60'
              )}
            >
              <span
                className={cn(
                  'h-4 w-4 rounded-full bg-background shadow transition-transform',
                  showCanvasLoading ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">Repository</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/60 whitespace-nowrap"
                  aria-label="Repository status"
                >
                  <span className="capitalize whitespace-nowrap">
                    {repositoryStatus === 'connected' ? 'Connected' : repositoryStatus === 'connect' ? 'Connect' : 'Disconnected'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px] rounded-lg py-[6px] px-1">
                {[
                  { id: 'connected', label: 'Connected' },
                  { id: 'disconnected', label: 'Disconnected' },
                  { id: 'connect', label: 'Connect' },
                ].map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    className="cursor-pointer"
                    onSelect={() => onRepositoryStatusChange(option.id as 'connected' | 'disconnected' | 'connect')}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">Chat Content</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/60 whitespace-nowrap"
                  aria-label="Chat content"
                >
                  <span className="capitalize whitespace-nowrap">
                    {chatContentMode === 'skeleton' ? 'Loading skeleton' : chatContentMode === 'start' ? 'Start screen' : 'Example content'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px] rounded-lg py-[6px] px-1">
                {[
                  { id: 'conversation', label: 'Example content' },
                  { id: 'skeleton', label: 'Loading skeleton' },
                  { id: 'start', label: 'Start screen' },
                ].map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    className="cursor-pointer"
                    onSelect={() => onChatContentModeChange(option.id as 'skeleton' | 'conversation' | 'start')}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">Automation</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/60 whitespace-nowrap max-w-[11rem]"
                  aria-label="Automation context"
                >
                  <span className="truncate whitespace-nowrap">{automationContextLabel}</span>
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px] rounded-lg py-[6px] px-1">
                {AUTOMATION_CONTEXT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.title ?? 'none'}
                    className="cursor-pointer"
                    onSelect={() => onAutomationContextTitleChange(option.title)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">Status pill (above input)</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/60 whitespace-nowrap"
                  aria-label="Input area status pill state"
                >
                  <span className="capitalize">
                    {inputStatusBadgeState === 'off' ? 'Off' : STATUS_BADGE_LABELS[inputStatusBadgeState]}
                  </span>
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px] rounded-lg py-[6px] px-1">
                {STATUS_BADGE_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className="cursor-pointer gap-2"
                    onSelect={() => onInputStatusBadgeStateChange(option.value)}
                  >
                    {option.label}
                    {inputStatusBadgeState === option.value && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-foreground" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">Status badge (composer)</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/60 whitespace-nowrap"
                  aria-label="Composer status badge state"
                >
                  <span className="capitalize">
                    {composerStatusBadgeState === 'off' ? 'Off' : STATUS_BADGE_LABELS[composerStatusBadgeState]}
                  </span>
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px] rounded-lg py-[6px] px-1">
                {STATUS_BADGE_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className="cursor-pointer gap-2"
                    onSelect={() => onComposerStatusBadgeStateChange(option.value)}
                  >
                    {option.label}
                    {composerStatusBadgeState === option.value && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-foreground" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">Attachment Previews</div>
            <button
              type="button"
              role="switch"
              aria-checked={attachmentPreviewsEnabled}
              onClick={() => setAttachmentPreviewsEnabled((prev) => !prev)}
              className={cn(
                'h-6 w-10 rounded-full border border-border flex items-center px-0.5 transition-colors',
                attachmentPreviewsEnabled ? 'bg-foreground/80' : 'bg-muted/60'
              )}
            >
              <span
                className={cn(
                  'h-4 w-4 rounded-full bg-background shadow transition-transform',
                  attachmentPreviewsEnabled ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </button>
          </div>
          <div className="border-t border-border pt-3 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Canvas tabs</div>
            <p className="text-xs leading-snug text-muted-foreground">Off = empty state, on = filled sample.</p>
            {CANVAS_TAB_ORDER.map((tabId) => (
              <div key={tabId} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">{CANVAS_TAB_ARIA[tabId]}</div>
                  <div className="text-xs text-muted-foreground">{canvasTabFilled[tabId] ? 'Filled' : 'Empty'}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-label={`${CANVAS_TAB_ARIA[tabId]} canvas: ${canvasTabFilled[tabId] ? 'filled' : 'empty'}`}
                  aria-checked={canvasTabFilled[tabId]}
                  onClick={() => setCanvasTabFilled((prev) => ({ ...prev, [tabId]: !prev[tabId] }))}
                  className={cn(
                    'h-6 w-10 shrink-0 rounded-full border border-border flex items-center px-0.5 transition-colors',
                    canvasTabFilled[tabId] ? 'bg-foreground/80' : 'bg-muted/60'
                  )}
                >
                  <span
                    className={cn(
                      'h-4 w-4 rounded-full bg-background shadow transition-transform',
                      canvasTabFilled[tabId] ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <AvailableSkillsModal open={isSkillsModalOpen} onOpenChange={setIsSkillsModalOpen} />
      <AvailableHooksModal open={isHooksModalOpen} onOpenChange={setIsHooksModalOpen} />
      <AgentToolsModal open={isAgentToolsModalOpen} onOpenChange={setIsAgentToolsModalOpen} />
      <ConversationMetricsModal open={isMetricsModalOpen} onOpenChange={setIsMetricsModalOpen} />
      <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
        <DialogContent className="max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle>Connect your project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-[10px] pb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Select or insert a URL</span>
              </div>
              <div className="relative max-w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="relative" role="button" tabIndex={0} aria-haspopup="listbox">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground">
                        <Github className="w-4 h-4" aria-hidden />
                      </div>
                      <input
                        placeholder="Select Repo"
                        className="w-full h-10 px-4 border border-border rounded-md shadow-none bg-muted/40 hover:bg-muted/60 transition-colors text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 pl-10 pr-10 text-sm cursor-pointer"
                        aria-autocomplete="list"
                        role="combobox"
                        readOnly
                        value={selectedRepository}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                        <button type="button" aria-label="Toggle menu" className="text-muted-foreground">
                          <ChevronDown className="w-4 h-4 transition-transform" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align="start" side="bottom" className="w-[var(--radix-popover-trigger-width)] p-0 border border-border bg-card rounded-lg shadow-md mt-1 z-[9999] max-h-60 flex flex-col overflow-hidden">
                    <ul role="listbox" className="w-full flex-1 min-h-0 overflow-y-auto p-1 repo-dropdown-scroll" data-testid="git-repo-dropdown-menu">
                      <div className="px-2 py-1.5">
                        <span className="text-xs font-semibold leading-4 text-muted-foreground">Most Recent</span>
                      </div>
                      {[
                        'FraterCCCLXIII/All-Hands-UI-XP',
                        'FraterCCCLXIII/pr-navigator',
                        'FraterCCCLXIII/All-Hands-UI',
                      ].map((repo) => (
                        <li
                          key={repo}
                          role="option"
                          className="px-2 py-2 cursor-pointer text-sm rounded-md my-0.5 text-foreground font-normal hover:bg-muted/60 focus:outline-none focus:bg-muted/60"
                          onClick={() => {
                            setSelectedRepository(repo);
                            setSelectedBranch('main');
                          }}
                        >
                          <span className="font-medium">{repo}</span>
                        </li>
                      ))}
                      <div className="border-t border-border my-1"></div>
                      {[
                        'FraterCCCLXIII/a1-hvac-local-leads',
                        'FraterCCCLXIII/acu-your-mobile-oasis',
                        'FraterCCCLXIII/ai-chat-insights',
                        'FraterCCCLXIII/ai-feed-notifications',
                        'FraterCCCLXIII/akash-sacred-scribe-ai',
                        'FraterCCCLXIII/alpha-omega',
                        'FraterCCCLXIII/amara-ai',
                        'FraterCCCLXIII/app-window-orchestrator',
                        'FraterCCCLXIII/app.cofounder',
                        'FraterCCCLXIII/ascii-demoscene',
                        'FraterCCCLXIII/beyond-one-mexico-retreat',
                        'FraterCCCLXIII/book-builder',
                        'FraterCCCLXIII/book-pay',
                        'FraterCCCLXIII/BreamStream',
                        'FraterCCCLXIII/brother',
                        'FraterCCCLXIII/brother-humbble',
                        'FraterCCCLXIII/brothers',
                        'FraterCCCLXIII/browser-use',
                        'FraterCCCLXIII/capcorp',
                        'FraterCCCLXIII/chatrtk',
                        'FraterCCCLXIII/chatrtk-revamp-refine-flow',
                        'FraterCCCLXIII/chronofy-flow-33',
                        'FraterCCCLXIII/cli-palette-builder',
                      ].map((repo) => (
                        <li
                          key={repo}
                          role="option"
                          className="px-2 py-2 cursor-pointer text-sm rounded-md my-0.5 text-foreground font-normal hover:bg-muted/60 focus:outline-none focus:bg-muted/60"
                          onClick={() => {
                            setSelectedRepository(repo);
                            setSelectedBranch('main');
                          }}
                        >
                          <span className="font-medium">{repo}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex-shrink-0 border-t border-border p-1 rounded-b-md bg-card">
                      <a
                        href="https://github.com/apps/openhands-ai/installations/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center w-full px-2 py-2 text-sm text-foreground hover:bg-muted/60 rounded-md transition-colors font-normal"
                      >
                        + Add GitHub Repos
                      </a>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="relative max-w-full">
                <Popover>
                  <PopoverTrigger asChild>
                    <div
                      className={cn('relative', !selectedRepository && 'pointer-events-none')}
                      role="button"
                      tabIndex={0}
                      aria-haspopup="listbox"
                      aria-disabled={!selectedRepository}
                    >
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground">
                        <GitBranch className="w-4 h-4" aria-hidden />
                      </div>
                      <input
                        placeholder="Select branch..."
                        disabled={!selectedRepository}
                        className="w-full h-10 px-4 border border-border rounded-md shadow-none bg-muted/40 hover:bg-muted/60 transition-colors text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 disabled:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60 pl-10 pr-10 text-sm cursor-pointer"
                        value={selectedRepository ? selectedBranch : ''}
                        readOnly
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                        <button
                          type="button"
                          aria-label="Toggle menu"
                          disabled={!selectedRepository}
                          className="text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <ChevronDown className="w-4 h-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align="start" side="bottom" className="w-[var(--radix-popover-trigger-width)] p-0 border border-border bg-card rounded-lg shadow-md mt-1 z-[9999] max-h-60 flex flex-col overflow-hidden">
                    <ul role="listbox" className="w-full flex-1 min-h-0 overflow-y-auto p-1 repo-dropdown-scroll">
                      {['main', 'develop', 'feature/kanban-drawer', 'bugfix/status-badge', 'release/v1.2.0'].map((branch) => (
                        <li
                          key={branch}
                          role="option"
                          className="px-2 py-2 cursor-pointer text-sm rounded-md my-0.5 text-foreground font-normal hover:bg-muted/60 focus:outline-none focus:bg-muted/60"
                          onClick={() => setSelectedBranch(branch)}
                        >
                          <span className="font-medium">{branch}</span>
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter className="sm:flex-row sm:justify-start sm:space-x-2 flex flex-row items-center justify-start">
              <Button
                className="h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/85"
                onClick={() => {
                  setIsConnectModalOpen(false);
                  onRepositoryStatusChange('connected');
                }}
              >
                Connect
              </Button>
              <Button
                className="h-10 px-4 py-2 rounded-md bg-muted/60 hover:bg-muted border border-border text-foreground"
                onClick={() => setIsConnectModalOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={selectedCapability !== null} onOpenChange={(open) => !open && setSelectedCapability(null)}>
        <DialogContent className="max-w-2xl text-foreground">
          {selectedCapability && (
            <div className="space-y-4">
              <DialogHeader className="space-y-3 text-left">
                <DialogTitle>{selectedCapability.name}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{selectedCapability.description}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                  {selectedCapability.type === 'skill' ? 'Skill' : 'Plugin'}
                </span>
                <a
                  href={selectedCapability.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <span className="font-mono">
                    {selectedCapability.repositoryUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              {selectedCapability.type === 'skill' && selectedCapability.initialPrompt && selectedCapability.curlCommand && (
                <div className="space-y-4 pt-2">
                  <CopyableBlock
                    title="Initial Prompt"
                    value={selectedCapability.initialPrompt}
                    onCopy={() => void navigator.clipboard.writeText(selectedCapability.initialPrompt ?? '')}
                  />
                  <CopyableBlock
                    title="Curl Command"
                    value={selectedCapability.curlCommand}
                    onCopy={() => void navigator.clipboard.writeText(selectedCapability.curlCommand ?? '')}
                    className="[&_textarea]:min-h-[100px]"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CanvasNavTooltip({
  label,
  children,
  externalRepoUrl,
}: {
  label: string;
  children: React.ReactNode;
  /** When set, shows an external-link control in the tooltip (e.g. Code → open repo). */
  externalRepoUrl?: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <span
      className="relative inline-flex group"
      onMouseLeave={() => setDismissed(false)}
      onPointerDownCapture={() => setDismissed(true)}
      onClickCapture={() => setDismissed(true)}
    >
      {children}
      {/* pt-1.5 bridges the gap so hover is not lost moving from trigger to tooltip; pointer-events follow group-hover */}
      <span
        className={cn(
          'pointer-events-none absolute left-1/2 top-full z-[60] flex -translate-x-1/2 flex-col items-center pt-1.5 opacity-0 transition-opacity duration-150',
          'group-hover:pointer-events-auto group-hover:opacity-100 group-hover:delay-75',
          dismissed &&
            '!pointer-events-none !opacity-0 group-hover:!pointer-events-none group-hover:!opacity-0'
        )}
      >
        <span
          role="tooltip"
          className="flex items-center gap-2 whitespace-nowrap rounded-md bg-muted px-2 py-1 text-xs text-foreground shadow-md"
        >
          <span>{label}</span>
          {externalRepoUrl ? (
            <a
              href={externalRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              aria-label="Open repository on GitHub"
              title="Open repository on GitHub"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
            </a>
          ) : null}
        </span>
      </span>
    </span>
  );
}

function TabButton({
  active,
  onClick,
  label,
  ariaLabel,
  icon,
  tooltip,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  ariaLabel?: string;
  icon: React.ReactNode;
  tooltip?: string;
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'flex items-center rounded-md cursor-pointer pl-1.5 py-1 text-sm font-medium transition-[color,background-color,padding-right] duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active ? 'gap-2 pr-2 bg-secondary text-foreground hover:bg-secondary/90' : 'gap-0 pr-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60'
      )}
    >
      <span className="[&>svg]:text-inherit">{icon}</span>
      <span
        className={cn(
          'overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-200',
          active ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'
        )}
      >
        {label}
      </span>
    </button>
  );
  if (tooltip) {
    return <CanvasNavTooltip label={tooltip}>{button}</CanvasNavTooltip>;
  }
  return button;
}

function CodeCanvasPlaceholder() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 text-left">
      <div className="flex w-[min(42%,280px)] shrink-0 flex-col overflow-y-auto border-r border-border">
        <div
          className={cn(
            CANVAS_PANEL_HEADER_CLASS,
            'sticky top-0 z-[1] text-xs font-medium uppercase tracking-wide text-muted-foreground'
          )}
        >
          Explorer
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-1 py-2 text-xs">
          <div className="flex items-center gap-1 rounded px-2 py-1 text-foreground hover:bg-muted/60">
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <Folder className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate">src</span>
          </div>
          <div className="mt-0.5 space-y-0.5 pl-3">
            <div className="flex items-center gap-1.5 rounded px-2 py-1 text-foreground bg-muted/50">
              <File className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="truncate">App.tsx</span>
            </div>
            <div className="flex items-center gap-1.5 rounded px-2 py-1 text-muted-foreground hover:bg-muted/60">
              <File className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">main.tsx</span>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-1.5 rounded px-2 py-1 text-muted-foreground hover:bg-muted/60">
            <File className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">package.json</span>
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className={cn(CANVAS_PANEL_HEADER_CLASS, 'text-xs')}>
          <span className="font-mono leading-none text-foreground">App.tsx</span>
        </div>
        <pre className="min-h-0 flex-1 overflow-auto p-3 text-left text-xs font-mono leading-relaxed text-muted-foreground whitespace-pre">
          {`import { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}`}
        </pre>
      </div>
    </div>
  );
}

/** Inline code tokens for planner / markdown-style previews (matches chat code chips). */
const plannerCodeClass =
  'rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground';

function PlannerFilledPlanSample() {
  return (
    <div data-testid="markdown-renderer" className="text-sm">
      <h1 className="mt-3 first:mt-0 mb-1.5 text-lg font-bold leading-6 text-foreground">1. OBJECTIVE</h1>
      <p className="py-2.5 text-muted-foreground first:pt-0 last:pb-0">
        Create a simple, clean, responsive HTML website with a modern design. The site will be a single-page layout with placeholder content, basic styling, and mobile-friendly design.
      </p>
      <h1 className="mt-3 first:mt-0 mb-1.5 text-lg font-bold leading-6 text-foreground">2. CONTEXT SUMMARY</h1>
      <ul className="ml-5 list-disc whitespace-normal pl-2 text-muted-foreground">
        <li>
          <strong className="font-semibold text-foreground">Project directory</strong>:{' '}
          <code className={plannerCodeClass}>/workspace/project</code> (currently empty)
        </li>
        <li>
          <strong className="font-semibold text-foreground">Output</strong>: A standalone HTML file with embedded CSS (no external dependencies)
        </li>
        <li>
          <strong className="font-semibold text-foreground">Hosting</strong>: Can be previewed at{' '}
          <code className={plannerCodeClass}>https://work-1-vfxjwippckczyquz.prod-runtime.all-hands.dev/</code> (port 12000)
        </li>
      </ul>
      <h1 className="mt-3 first:mt-0 mb-1.5 text-lg font-bold leading-6 text-foreground">3. APPROACH OVERVIEW</h1>
      <p className="py-2.5 text-muted-foreground first:pt-0 last:pb-0">
        Create a single <code className={plannerCodeClass}>index.html</code> file with:
      </p>
      <ul className="ml-5 list-disc whitespace-normal pl-2 text-muted-foreground">
        <li>Embedded CSS for styling (no external dependencies)</li>
        <li>Modern, clean design with a hero section, features section, and footer</li>
        <li>Responsive layout that works on desktop and mobile</li>
        <li>Placeholder text and content that can be easily customized</li>
      </ul>
      <p className="py-2.5 text-muted-foreground first:pt-0 last:pb-0">
        This approach is simple, self-contained, and requires no build tools or additional setup.
      </p>
      <h1 className="mt-3 first:mt-0 mb-1.5 text-lg font-bold leading-6 text-foreground">4. IMPLEMENTATION STEPS</h1>
      <h2 className="mt-2.5 first:mt-0 mb-1 text-base font-semibold leading-5 text-foreground">Step 1: Create the HTML file structure</h2>
      <ul className="ml-5 list-disc whitespace-normal pl-2 text-muted-foreground">
        <li>
          <strong className="font-semibold text-foreground">Goal</strong>: Set up the basic HTML5 document structure
        </li>
        <li>
          <strong className="font-semibold text-foreground">Method</strong>: Create <code className={plannerCodeClass}>index.html</code> with proper doctype, head, and body sections
        </li>
        <li>
          <strong className="font-semibold text-foreground">Reference</strong>: <code className={plannerCodeClass}>/workspace/project/index.html</code>
        </li>
      </ul>
      <h2 className="mt-2.5 first:mt-0 mb-1 text-base font-semibold leading-5 text-foreground">Step 2: Add embedded CSS styles</h2>
      <ul className="ml-5 list-disc whitespace-normal pl-2 text-muted-foreground">
        <li>
          <strong className="font-semibold text-foreground">Goal</strong>: Style the page with a modern, clean design
        </li>
        <li>
          <strong className="font-semibold text-foreground">Method</strong>: Add a <code className={plannerCodeClass}>&lt;style&gt;</code> block in the head with:
          <ul className="ml-5 mt-1 list-disc pl-2">
            <li>CSS reset/normalize basics</li>
            <li>Typography styles</li>
            <li>Color scheme (modern blues/grays)</li>
            <li>Responsive media queries</li>
          </ul>
        </li>
        <li>
          <strong className="font-semibold text-foreground">Reference</strong>: <code className={plannerCodeClass}>/workspace/project/index.html</code> (style section)
        </li>
      </ul>
      <h2 className="mt-2.5 first:mt-0 mb-1 text-base font-semibold leading-5 text-foreground">Step 3: Build the page content</h2>
      <ul className="ml-5 list-disc whitespace-normal pl-2 text-muted-foreground">
        <li>
          <strong className="font-semibold text-foreground">Goal</strong>: Create the visual sections of the page
        </li>
        <li>
          <strong className="font-semibold text-foreground">Method</strong>: Add HTML markup for:
          <ul className="ml-5 mt-1 list-disc pl-2">
            <li>Navigation header with site title</li>
            <li>Hero section with headline and call-to-action button</li>
            <li>Features/services section with 3 cards</li>
            <li>Footer with copyright</li>
          </ul>
        </li>
        <li>
          <strong className="font-semibold text-foreground">Reference</strong>: <code className={plannerCodeClass}>/workspace/project/index.html</code> (body section)
        </li>
      </ul>
      <h2 className="mt-2.5 first:mt-0 mb-1 text-base font-semibold leading-5 text-foreground">Step 4: Start a local server to serve the site</h2>
      <ul className="ml-5 list-disc whitespace-normal pl-2 text-muted-foreground">
        <li>
          <strong className="font-semibold text-foreground">Goal</strong>: Make the site accessible via the provided URL
        </li>
        <li>
          <strong className="font-semibold text-foreground">Method</strong>: Use Python&apos;s built-in HTTP server on port 12000
        </li>
        <li>
          <strong className="font-semibold text-foreground">Reference</strong>: Command: <code className={plannerCodeClass}>python -m http.server 12000</code>
        </li>
      </ul>
      <h1 className="mt-3 first:mt-0 mb-1.5 text-lg font-bold leading-6 text-foreground">5. TESTING AND VALIDATION</h1>
      <ul className="ml-5 list-disc whitespace-normal pl-2 text-muted-foreground">
        <li>
          <strong className="font-semibold text-foreground">Visual verification</strong>: Open{' '}
          <code className={plannerCodeClass}>https://work-1-vfxjwippckczyquz.prod-runtime.all-hands.dev/</code> in a browser
        </li>
        <li>
          <strong className="font-semibold text-foreground">Expected result</strong>: A clean, modern landing page should display with:
          <ul className="ml-5 mt-1 list-disc pl-2">
            <li>A navigation bar at the top</li>
            <li>A hero section with a headline and button</li>
            <li>Three feature cards in a row (stacking on mobile)</li>
            <li>A footer at the bottom</li>
          </ul>
        </li>
        <li>
          <strong className="font-semibold text-foreground">Responsive check</strong>: The layout should adapt gracefully when viewed on smaller screens
        </li>
      </ul>
    </div>
  );
}

type ChangesDiffViewMode = 'old' | 'diff' | 'new';

/** Sample PLAN.md body for the changes canvas diff preview (matches planner plan content). */
const CHANGES_PLAN_MD_SAMPLE = `# 1. OBJECTIVE

Create a simple, clean, responsive HTML website with a modern design. The site will be a single-page layout with placeholder content, basic styling, and mobile-friendly design.

# 2. CONTEXT SUMMARY

- **Project directory**: \`/workspace/project\` (currently empty)
- **Output**: A standalone HTML file with embedded CSS (no external dependencies)
- **Hosting**: Can be previewed at \`https://work-1-vfxjwippckczyquz.prod-runtime.all-hands.dev/\` (port 12000)

# 3. APPROACH OVERVIEW

Create a single \`index.html\` file with:
- Embedded CSS for styling (no external dependencies)
- Modern, clean design with a hero section, features section, and footer
- Responsive layout that works on desktop and mobile
- Placeholder text and content that can be easily customized

This approach is simple, self-contained, and requires no build tools or additional setup.

# 4. IMPLEMENTATION STEPS

## Step 1: Create the HTML file structure
- **Goal**: Set up the basic HTML5 document structure
- **Method**: Create \`index.html\` with proper doctype, head, and body sections
- **Reference**: \`/workspace/project/index.html\`

## Step 2: Add embedded CSS styles
- **Goal**: Style the page with a modern, clean design
- **Method**: Add a \`<style>\` block in the head with:
  - CSS reset/normalize basics
  - Typography styles
  - Color scheme (modern blues/grays)
  - Responsive media queries
- **Reference**: \`/workspace/project/index.html\` (style section)

## Step 3: Build the page content
- **Goal**: Create the visual sections of the page
- **Method**: Add HTML markup for:
  - Navigation header with site title
  - Hero section with headline and call-to-action button
  - Features/services section with 3 cards
  - Footer with copyright
- **Reference**: \`/workspace/project/index.html\` (body section)

## Step 4: Start a local server to serve the site
- **Goal**: Make the site accessible via the provided URL
- **Method**: Use Python's built-in HTTP server on port 12000
- **Reference**: Command: \`python -m http.server 12000\`

# 5. TESTING AND VALIDATION

- **Visual verification**: Open \`https://work-1-vfxjwippckczyquz.prod-runtime.all-hands.dev/\` in a browser
- **Expected result**: A clean, modern landing page should display with:
  - A navigation bar at the top
  - A hero section with a headline and button
  - Three feature cards in a row (stacking on mobile)
  - A footer at the bottom
- **Responsive check**: The layout should adapt gracefully when viewed on smaller screens
`;

/** VS Code–style dark editor surface (Monaco diff mock). */
const CHANGES_EDITOR_SURFACE_CLASS = 'bg-[#1e1e1e] text-[#d4d4d4]';

const CHANGES_EDITOR_HEIGHT_STYLE = {
  '--editor-height': 'min(520px, 55vh)',
} as React.CSSProperties;

type ChangeFileId = 'index' | 'app' | 'canvas' | 'active-chat';

interface ChangeFileDiffLine {
  kind: 'context' | 'add' | 'del';
  oldLine: number | null;
  newLine: number | null;
  text: string;
}

interface ChangeFileItem {
  id: ChangeFileId;
  path: string;
  additions: number;
  deletions: number;
  lines: ChangeFileDiffLine[];
}

interface ComposerAttachmentPreview {
  id: string;
  kind: 'file' | 'image';
  name: string;
  extensionLabel?: string;
}

const CHANGE_FILE_ITEMS: ChangeFileItem[] = [
  {
    id: 'index',
    path: 'index.html',
    additions: 23,
    deletions: 0,
    lines: [
      { kind: 'add', oldLine: null, newLine: 1, text: '<!doctype html>' },
      { kind: 'add', oldLine: null, newLine: 8, text: '<main class="page-shell">' },
      { kind: 'add', oldLine: null, newLine: 19, text: '  <section class="hero">...</section>' },
      { kind: 'add', oldLine: null, newLine: 37, text: '  <section class="features">...</section>' },
      { kind: 'add', oldLine: null, newLine: 58, text: '</main>' },
    ],
  },
  {
    id: 'app',
    path: 'src/App.tsx',
    additions: 10,
    deletions: 3,
    lines: [
      { kind: 'context', oldLine: 12, newLine: 12, text: 'return (' },
      { kind: 'del', oldLine: 13, newLine: null, text: '  <LegacySidebar />' },
      { kind: 'add', oldLine: null, newLine: 13, text: '  <ConversationDrawer />' },
      { kind: 'add', oldLine: null, newLine: 14, text: '  <StatusIndicator />' },
      { kind: 'context', oldLine: 15, newLine: 16, text: ');' },
    ],
  },
  {
    id: 'canvas',
    path: 'src/components/canvas/Canvas.tsx',
    additions: 18,
    deletions: 6,
    lines: [
      { kind: 'context', oldLine: 41, newLine: 41, text: 'export function Canvas(props: CanvasProps) {' },
      { kind: 'del', oldLine: 63, newLine: null, text: '  className="canvas-root p-6"' },
      { kind: 'add', oldLine: null, newLine: 63, text: '  className="canvas-root p-4 md:p-6"' },
      { kind: 'add', oldLine: null, newLine: 64, text: '  data-testid="canvas-shell"' },
      { kind: 'context', oldLine: 78, newLine: 79, text: '}' },
    ],
  },
  {
    id: 'active-chat',
    path: 'src/screens/ActiveChatScreen.tsx',
    additions: 26,
    deletions: 14,
    lines: [
      { kind: 'context', oldLine: 138, newLine: 138, text: '<div className="drawer-changes">' },
      { kind: 'del', oldLine: 143, newLine: null, text: '  <div>src/App.tsx</div>' },
      { kind: 'del', oldLine: 144, newLine: null, text: '  <div>src/components/canvas/Canvas.tsx</div>' },
      { kind: 'add', oldLine: null, newLine: 143, text: '  <button data-testid="changes-drawer-item-app">...</button>' },
      { kind: 'add', oldLine: null, newLine: 144, text: '  <button data-testid="changes-drawer-item-canvas">...</button>' },
      { kind: 'add', oldLine: null, newLine: 145, text: '  <button data-testid="changes-drawer-item-active-chat">...</button>' },
      { kind: 'context', oldLine: 151, newLine: 154, text: '</div>' },
    ],
  },
];

const CHANGE_DRAWER_FILE_IDS: ChangeFileId[] = ['app', 'canvas', 'active-chat'];

const COMPOSER_ATTACHMENT_ITEMS: ComposerAttachmentPreview[] = [
  { id: 'project-brief', kind: 'file', name: 'project-brief.md', extensionLabel: 'MD' },
  { id: 'design-export', kind: 'file', name: 'design-export.json', extensionLabel: 'JSON' },
  { id: 'sample-data', kind: 'file', name: 'sample-data.csv', extensionLabel: 'CSV' },
  { id: 'screenshot', kind: 'image', name: 'screenshot.png' },
];

/** Inline tokens: **bold**, `code` — rest is default foreground. */
function changesPlanHighlightInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(
        <span key={`${keyPrefix}-t-${i++}`}>{text.slice(last, m.index)}</span>
      );
    }
    const tok = m[0];
    if (tok.startsWith('**')) {
      nodes.push(
        <span key={`${keyPrefix}-b-${i++}`} className="font-semibold text-[#4ec9b0]">
          {tok.slice(2, -2)}
        </span>
      );
    } else {
      nodes.push(
        <span key={`${keyPrefix}-c-${i++}`} className="text-[#9cdcfe]">
          {tok.slice(1, -1)}
        </span>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) {
    nodes.push(<span key={`${keyPrefix}-t-${i++}`}>{text.slice(last)}</span>);
  }
  return nodes;
}

function changesPlanHighlightLine(line: string, keyPrefix: string): ReactNode {
  const header = /^(#{1,6}\s)/.test(line);
  const inner = changesPlanHighlightInline(line, keyPrefix);
  if (header) {
    return <span className="text-[#569cd6]">{inner}</span>;
  }
  return <span className="text-[#cccccc]">{inner}</span>;
}

function ChangesPlanDiffMock({ viewMode }: { viewMode: ChangesDiffViewMode }) {
  const diffRows = useMemo(() => {
    const lines = CHANGES_PLAN_MD_SAMPLE.split('\n');
    return ['', ...lines];
  }, []);

  if (viewMode === 'old') {
    return (
      <div
        className={cn(
          'flex min-h-[220px] items-center justify-center p-4 font-mono text-xs text-muted-foreground',
          CHANGES_EDITOR_SURFACE_CLASS
        )}
      >
        (empty file)
      </div>
    );
  }
  if (viewMode === 'new') {
    return (
      <div
        className={cn(
          'w-full overflow-auto',
          CHANGES_EDITOR_SURFACE_CLASS,
          'h-[var(--editor-height)] min-h-[220px]'
        )}
        style={CHANGES_EDITOR_HEIGHT_STYLE}
      >
        <div className="p-4 font-mono text-xs leading-[18px]">
          {CHANGES_PLAN_MD_SAMPLE.split('\n').map((line, i) => (
            <div key={i} className="min-h-[18px] whitespace-pre-wrap break-all">
              {changesPlanHighlightLine(line, `n-${i}`)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'monaco-diff-editor-mock flex w-full flex-col overflow-hidden',
        CHANGES_EDITOR_SURFACE_CLASS,
        'h-[var(--editor-height)] min-h-[220px] min-w-0'
      )}
      style={CHANGES_EDITOR_HEIGHT_STYLE}
    >
      <section
        className="flex min-h-0 flex-1 overflow-y-auto text-left"
        style={{ width: '100%', height: '100%' }}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-row items-stretch">
          {/* Original pane — 36px, delete strip + diagonal fill (Monaco “original”) */}
          <div
            className="flex w-9 shrink-0 flex-col border-r border-neutral-700"
            aria-hidden
          >
            <div className="h-[18px] shrink-0 border-b border-neutral-700/80 bg-[#542124]/90" />
            <div className="min-h-[18px] flex-1 bg-[repeating-linear-gradient(-45deg,rgba(255,80,80,0.07)_0px,rgba(255,80,80,0.07)_3px,transparent_3px,transparent_6px)]" />
          </div>

          {/* Modified pane: gutter (46px) + lines + overview ruler */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-row">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-auto">
              {diffRows.map((line, rowIdx) => {
                const isDeleteRow = rowIdx === 0;
                const lineNo = rowIdx + 1;
                return (
                  <div
                    key={rowIdx}
                    className={cn(
                      'flex min-h-[18px] w-full min-w-0 flex-row font-mono text-xs leading-[18px]',
                      isDeleteRow
                        ? 'bg-[#542124]/55'
                        : 'bg-[rgba(40,80,40,0.35)]'
                    )}
                  >
                    <div
                      className={cn(
                        'flex w-[46px] shrink-0 select-none items-center justify-end gap-1 border-r border-neutral-700/90 pr-1.5 tabular-nums',
                        isDeleteRow ? 'text-destructive' : 'text-success'
                      )}
                    >
                      <span className="w-2.5 text-center font-normal">
                        {isDeleteRow ? '−' : '+'}
                      </span>
                      <span className="text-xs text-[#858585]">{lineNo}</span>
                    </div>
                    <div className="min-w-0 flex-1 whitespace-pre-wrap break-all px-1.5 py-0">
                      {line ? changesPlanHighlightLine(line, `d-${rowIdx}`) : '\u00a0'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Diff overview ruler (minimap strip) */}
            <div
              className="w-3.5 shrink-0 border-l border-neutral-700 bg-[#252526]"
              aria-hidden
            >
              <div
                className="h-full w-full"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(220,80,80,0.65) 0%, rgba(220,80,80,0.65) 1.4%, rgba(45,160,90,0.45) 1.4%, rgba(45,160,90,0.45) 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ChangesCodeDiffMock({ lines }: { lines: ChangeFileDiffLine[] }) {
  return (
    <div
      className={cn(
        'monaco-diff-editor-mock flex w-full flex-col overflow-hidden',
        CHANGES_EDITOR_SURFACE_CLASS,
        'h-[var(--editor-height)] min-h-[220px] min-w-0'
      )}
      style={CHANGES_EDITOR_HEIGHT_STYLE}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
        {lines.map((line, rowIdx) => (
          <div
            key={rowIdx}
            className={cn(
              'flex min-h-[18px] w-full min-w-0 flex-row font-mono text-xs leading-[18px]',
              line.kind === 'add'
                ? 'bg-[rgba(40,80,40,0.35)]'
                : line.kind === 'del'
                  ? 'bg-[#542124]/55'
                  : 'bg-transparent'
            )}
          >
            <div className="flex w-[38px] shrink-0 items-center justify-end border-r border-neutral-700/90 pr-1.5 text-xs text-[#858585] tabular-nums">
              {line.oldLine ?? ''}
            </div>
            <div className="flex w-[38px] shrink-0 items-center justify-end border-r border-neutral-700/90 pr-1.5 text-xs text-[#858585] tabular-nums">
              {line.newLine ?? ''}
            </div>
            <div
              className={cn(
                'flex w-6 shrink-0 items-center justify-center border-r border-neutral-700/90',
                line.kind === 'add'
                  ? 'text-success'
                  : line.kind === 'del'
                    ? 'text-destructive'
                    : 'text-[#858585]'
              )}
            >
              {line.kind === 'add' ? '+' : line.kind === 'del' ? '-' : ''}
            </div>
            <div className="min-w-0 flex-1 whitespace-pre-wrap break-all px-2 py-0 text-[#cccccc]">{line.text || '\u00a0'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChangesCanvasFilled({
  selectedChangeFileId,
  changeNavigationRequest,
}: {
  selectedChangeFileId: ChangeFileId | null;
  changeNavigationRequest: number;
}) {
  const [viewMode, setViewMode] = useState<ChangesDiffViewMode>('diff');
  const [planExpanded, setPlanExpanded] = useState(true);
  const [expandedFiles, setExpandedFiles] = useState<Record<ChangeFileId, boolean>>({
    index: false,
    app: false,
    canvas: false,
    'active-chat': false,
  });
  const fileRefs = useRef<Partial<Record<ChangeFileId, HTMLDivElement | null>>>({});

  useEffect(() => {
    if (!selectedChangeFileId) return;
    setPlanExpanded(false);
    setViewMode('diff');
    setExpandedFiles((prev) => ({ ...prev, [selectedChangeFileId]: true }));
    window.requestAnimationFrame(() => {
      fileRefs.current[selectedChangeFileId]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }, [selectedChangeFileId, changeNavigationRequest]);

  const viewModeButton = (mode: ChangesDiffViewMode, testId: string, Icon: typeof History) => (
    <button
      type="button"
      data-testid={testId}
      className={cn(
        'rounded p-1 transition-colors',
        viewMode === mode
          ? 'bg-muted text-foreground'
          : 'cursor-pointer text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      )}
      aria-pressed={viewMode === mode}
      aria-label={mode === 'old' ? 'Previous version' : mode === 'diff' ? 'Diff view' : 'New file'}
      onClick={() => setViewMode(mode)}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
        <div className={cn(CANVAS_PANEL_HEADER_CLASS, 'justify-between gap-2')}>
          <span className="flex items-center gap-2 text-xs font-medium leading-none text-foreground">
            Changes
            <span className="text-success">+89</span>
            <span className="text-destructive">-23</span>
          </span>
          <button
            type="button"
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Refresh"
          >
            <RotateCw className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-b-md">
          <div className="absolute inset-0 flex flex-col">
            <main className="custom-scrollbar-always flex h-full min-h-0 flex-col items-stretch gap-3 overflow-y-auto p-4">
              <div data-testid="file-diff-viewer-outer" className="flex w-full min-w-0 flex-col">
                <div
                  role="button"
                  tabIndex={0}
                  data-testid="changes-file-row-plan"
                  className={cn(
                    'flex min-h-9 flex-wrap items-center justify-between gap-2 border border-border px-3 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    planExpanded ? 'rounded-t-md border-b-0' : 'rounded-md'
                  )}
                  aria-expanded={planExpanded}
                  aria-label={planExpanded ? 'Collapse plan' : 'Expand plan'}
                  onClick={() => setPlanExpanded((x) => !x)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPlanExpanded((x) => !x);
                    }
                  }}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-foreground">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    <strong className="min-w-0 truncate font-medium">.agents_tmp/PLAN.md</strong>
                    <span className="shrink-0 text-xs text-success">+12</span>
                    <span className="shrink-0 text-xs text-destructive">-0</span>
                  </span>
                  {planExpanded && (
                    <span
                      className="flex shrink-0 items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      {viewModeButton('old', 'view-mode-old', History)}
                      {viewModeButton('diff', 'view-mode-diff', GitCompare)}
                      {viewModeButton('new', 'view-mode-new', FilePlus)}
                    </span>
                  )}
                  <span className="pointer-events-none shrink-0 text-muted-foreground">
                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', planExpanded && 'rotate-180')} aria-hidden />
                  </span>
                </div>
                {planExpanded && (
                  <div
                    data-testid="editor-container"
                    className="w-full overflow-hidden rounded-b-md border border-t-0 border-border"
                  >
                    <ChangesPlanDiffMock viewMode={viewMode} />
                  </div>
                )}
              </div>

              {CHANGE_FILE_ITEMS.map((file) => {
                const isExpanded = expandedFiles[file.id];
                return (
                  <div
                    key={file.id}
                    data-testid="file-diff-viewer-outer"
                    className="flex w-full min-w-0 flex-col"
                    ref={(node) => {
                      fileRefs.current[file.id] = node;
                    }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      data-testid={`changes-file-row-${file.id}`}
                      className={cn(
                        'flex min-h-9 flex-wrap items-center justify-between gap-2 border border-border px-3 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        isExpanded ? 'rounded-t-md border-b-0' : 'rounded-md'
                      )}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? `Collapse ${file.path}` : `Expand ${file.path}`}
                      onClick={() => setExpandedFiles((prev) => ({ ...prev, [file.id]: !prev[file.id] }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpandedFiles((prev) => ({ ...prev, [file.id]: !prev[file.id] }));
                        }
                      }}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-foreground">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                        <strong className="min-w-0 truncate font-medium">{file.path}</strong>
                        <span className="shrink-0 text-xs text-success">+{file.additions}</span>
                        <span className="shrink-0 text-xs text-destructive">-{file.deletions}</span>
                      </span>
                      <span className="pointer-events-none shrink-0 text-muted-foreground">
                        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-180')} aria-hidden />
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="w-full overflow-hidden rounded-b-md border border-t-0 border-border">
                        <ChangesCodeDiffMock lines={file.lines} />
                      </div>
                    )}
                  </div>
                );
              })}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

const BROWSER_CANVAS_URL = 'https://github.com/OpenHands/OpenHands';
const APP_CANVAS_URL = 'http://localhost:5173/';

const TASK_LIST_DRAWER_ITEMS = [
  { label: 'Fix module imports', status: 'completed' as const },
  { label: 'Fix TopBar props', status: 'in_progress' as const },
  { label: 'Fix Canvas props', status: 'pending' as const },
  { label: 'Fix ChatThread', status: 'cancelled' as const },
  { label: 'Test build', status: 'pending' as const },
];

function TaskListDrawerItem({ label, status }: { label: string; status: 'completed' | 'in_progress' | 'pending' | 'cancelled' }) {
  const icon =
    status === 'completed' ? (
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
    ) : status === 'in_progress' ? (
      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
    ) : status === 'cancelled' ? (
      <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
    ) : (
      <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
    );

  return (
    <div className="flex items-center gap-2 rounded-md px-1 py-0.5 text-sm text-foreground">
      {icon}
      <span
        className={cn(
          'min-w-0 flex-1 truncate',
          status === 'completed' && 'text-muted-foreground line-through',
          status === 'cancelled' && 'text-muted-foreground/80 line-through'
        )}
      >
        {label}
      </span>
    </div>
  );
}

function ComposerAttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: ComposerAttachmentPreview;
  onRemove: (id: string) => void;
}) {
  if (attachment.kind === 'image') {
    return (
      <div className="group relative flex h-[54px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/60">
        <button
          type="button"
          onClick={() => onRemove(attachment.id)}
          className="absolute right-1 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 transition-opacity duration-200 hover:bg-muted hover:text-foreground group-hover:opacity-100"
          aria-label={`Remove ${attachment.name}`}
        >
          <X className="h-2.5 w-2.5" aria-hidden />
        </button>
        <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <div className="group relative flex h-[54px] max-w-[184px] shrink-0 flex-col justify-between rounded-lg border border-border bg-muted/60 px-3 py-2">
      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 transition-opacity duration-200 hover:bg-muted hover:text-foreground group-hover:opacity-100"
        aria-label={`Remove ${attachment.name}`}
      >
        <X className="h-2.5 w-2.5" aria-hidden />
      </button>
      <div className="min-w-0 pr-4">
        <span className="block min-w-0 truncate text-xs font-medium leading-4 text-foreground">{attachment.name}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <File className="h-3 w-3 shrink-0" aria-hidden />
        <span>{attachment.extensionLabel}</span>
      </div>
    </div>
  );
}

/** Shared height and padding for canvas panel top bars (browser, terminal, changes, planner). */
const CANVAS_PANEL_HEADER_CLASS = 'flex h-10 w-full shrink-0 items-center border-b border-border px-3';

function AppCanvasShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className={cn(CANVAS_PANEL_HEADER_CLASS, 'gap-2')}>
        <span
          className="min-w-0 flex-1 truncate font-sans text-xs font-medium leading-none text-foreground"
          title={APP_CANVAS_URL}
        >
          {APP_CANVAS_URL}
        </span>
        <button
          type="button"
          className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Refresh app preview"
        >
          <RotateCw className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}

function BrowserCanvasShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className={cn(CANVAS_PANEL_HEADER_CLASS, 'gap-2')}>
        <span
          className="min-w-0 flex-1 truncate font-sans text-xs font-medium leading-none text-foreground"
          title={BROWSER_CANVAS_URL}
        >
          {BROWSER_CANVAS_URL}
        </span>
        <button
          type="button"
          className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Refresh page"
        >
          <RotateCw className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}

function BrowserCanvasDemoApp() {
  return <div className="min-h-0 flex-1" />;
}

/** Sample transcript for the filled terminal canvas (xterm-style session). */
const TERMINAL_FILLED_SAMPLE = `$ cd /workspace/project && python -m http.server 12000 
> /tmp/server.log 2>&1 &
[1] 571
$ curl -s -o /dev/null -w "%{http_code}" http://localhost:12000/
200
$ ps aux | grep "http.server" | grep -v grep
openhan+     573  0.0  0.1 103164 20096 pts/1    S    04:57   0:00 python -m http.server 12000
$ curl -s http://localhost:12000/ | head -20
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Landing Page</title>
    <style>
        /* Reset and base styles */
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
$ pkill -f "http.server 12000" 2>/dev/null; cd /workspace/project && python -m http.server 12000
 `;

function highlightUrlsAndQuotes(text: string): ReactNode {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
    if (part.startsWith('http')) {
      return (
        <span key={i} className="text-[hsl(var(--info))]">
          {part}
        </span>
      );
    }
    return (
      <span key={i}>
        {part.split(/("[^"]*")/g).map((q, j) =>
          q.startsWith('"') ? (
            <span key={j} className="text-success">
              {q}
            </span>
          ) : (
            <span key={j}>{q}</span>
          )
        )}
      </span>
    );
  });
}

function highlightUrlsOnly(text: string): ReactNode {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    part.startsWith('http') ? (
      <span key={i} className="text-[hsl(var(--info))]">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function highlightPsLine(line: string): ReactNode {
  const idx = line.lastIndexOf(' python');
  if (idx === -1) {
    return <span className="text-muted-foreground">{line}</span>;
  }
  return (
    <>
      <span className="text-muted-foreground">{line.slice(0, idx)}</span>
      <span className="text-success">{line.slice(idx)}</span>
    </>
  );
}

function TerminalHighlightedLine({ line }: { line: string }) {
  const t = line.trim();
  const lead = line.trimStart();

  if (/^\d{3}$/.test(t)) {
    const code = parseInt(t, 10);
    if (code >= 200 && code < 300) return <span className="text-success">{line}</span>;
    if (code >= 400) return <span className="text-destructive">{line}</span>;
    return <span className="text-foreground">{line}</span>;
  }
  if (/^\[\d+\] \d+$/.test(t)) {
    return <span className="text-muted-foreground">{line}</span>;
  }
  if (line.startsWith('$ ')) {
    return (
      <>
        <span className="text-success">$ </span>
        {highlightUrlsAndQuotes(line.slice(2))}
      </>
    );
  }
  if (line.startsWith('>')) {
    return <span className="text-muted-foreground">{line}</span>;
  }
  if (lead.startsWith('<')) {
    return <span className="text-info">{line}</span>;
  }
  if (line.trim().startsWith('/*') || line.trim().startsWith('*/')) {
    return <span className="text-muted-foreground">{line}</span>;
  }
  const looksLikeCss =
    !lead.startsWith('<') &&
    (line.includes('{') ||
      line.includes('}') ||
      /[a-z-]+:\s*[^;]+;?\s*$/i.test(t) ||
      (lead.startsWith('*') && line.includes('::')) ||
      (lead.startsWith(',') && line.includes('::')));
  if (looksLikeCss) {
    return <span className="text-warning">{line}</span>;
  }
  if (line.includes('pts/') && line.includes('python')) {
    return highlightPsLine(line);
  }
  return <span>{highlightUrlsOnly(line)}</span>;
}

function TerminalCanvasShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-transparent">
      <div className={cn(CANVAS_PANEL_HEADER_CLASS, 'justify-between')}>
        <span className="text-xs font-medium leading-none text-foreground">Terminal (read-only)</span>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-b-md">
        <div className="absolute inset-0 flex min-h-0 flex-col">{children}</div>
      </div>
    </div>
  );
}

function TerminalCanvasFilledOutput() {
  const lines = TERMINAL_FILLED_SAMPLE.split('\n');
  return (
    <pre
      data-testid="terminal-viewport"
      className="custom-scrollbar-always min-h-0 min-w-0 flex-1 overflow-auto p-4 text-left font-mono text-[13px] leading-[1.25rem] text-foreground"
    >
      {lines.map((line, i) => (
        <span key={i} className="block whitespace-pre-wrap">
          <TerminalHighlightedLine line={line} />
        </span>
      ))}
    </pre>
  );
}

// ─── Tasks canvas ────────────────────────────────────────────────────────────

type CanvasTaskStatus = 'completed' | 'in_progress' | 'pending';

interface CanvasTask {
  id: string;
  title: string;
  status: CanvasTaskStatus;
}

const CANVAS_TASKS_SAMPLE: CanvasTask[] = [
  { id: 't1', title: 'Set up project repository', status: 'completed' },
  { id: 't2', title: 'Install dependencies', status: 'completed' },
  { id: 't3', title: 'Create database schema', status: 'completed' },
  { id: 't4', title: 'Build authentication system', status: 'in_progress' },
  { id: 't5', title: 'Implement API endpoints', status: 'pending' },
  { id: 't6', title: 'Create frontend components', status: 'pending' },
  { id: 't7', title: 'Write tests', status: 'pending' },
  { id: 't8', title: 'Deploy to production', status: 'pending' },
];

function TaskCompletedIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M14.72 8.79L10.43 13.09L8.78 11.44C8.69036 11.3353 8.58004 11.2503 8.45597 11.1903C8.33191 11.1303 8.19678 11.0965 8.05906 11.0912C7.92134 11.0859 7.78401 11.1091 7.65568 11.1594C7.52736 11.2096 7.41081 11.2859 7.31335 11.3833C7.2159 11.4808 7.13964 11.5974 7.08937 11.7257C7.03909 11.854 7.01589 11.9913 7.02121 12.1291C7.02653 12.2668 7.06026 12.4019 7.12028 12.526C7.1803 12.65 7.26532 12.7604 7.37 12.85L9.72 15.21C9.81344 15.3027 9.92426 15.376 10.0461 15.4258C10.1679 15.4755 10.2984 15.5008 10.43 15.5C10.6923 15.4989 10.9437 15.3947 11.13 15.21L16.13 10.21C16.2237 10.117 16.2981 10.0064 16.3489 9.88458C16.3997 9.76272 16.4258 9.63201 16.4258 9.5C16.4258 9.36799 16.3997 9.23728 16.3489 9.11542C16.2981 8.99356 16.2237 8.88296 16.13 8.79C15.9426 8.60375 15.6892 8.49921 15.425 8.49921C15.1608 8.49921 14.9074 8.60375 14.72 8.79ZM12 2C10.0222 2 8.08879 2.58649 6.4443 3.6853C4.79981 4.78412 3.51809 6.3459 2.76121 8.17317C2.00433 10.0004 1.8063 12.0111 2.19215 13.9509C2.578 15.8907 3.53041 17.6725 4.92894 19.0711C6.32746 20.4696 8.10929 21.422 10.0491 21.8079C11.9889 22.1937 13.9996 21.9957 15.8268 21.2388C17.6541 20.4819 19.2159 19.2002 20.3147 17.5557C21.4135 15.9112 22 13.9778 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7363 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM12 20C10.4178 20 8.87104 19.5308 7.55544 18.6518C6.23985 17.7727 5.21447 16.5233 4.60897 15.0615C4.00347 13.5997 3.84504 11.9911 4.15372 10.4393C4.4624 8.88743 5.22433 7.46197 6.34315 6.34315C7.46197 5.22433 8.88743 4.4624 10.4393 4.15372C11.9911 3.84504 13.5997 4.00346 15.0615 4.60896C16.5233 5.21447 17.7727 6.23984 18.6518 7.55544C19.5308 8.87103 20 10.4177 20 12C20 14.1217 19.1572 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20Z" fill="currentColor" />
    </svg>
  );
}

function TaskInProgressIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M5.79029 12.9507C5.69629 12.9042 5.59557 12.8843 5.50157 12.8843C5.25314 12.8843 5.01142 13.0238 4.89728 13.2562C4.72942 13.5883 4.87042 13.9868 5.20614 14.1462C5.30014 14.1927 5.40086 14.2127 5.50157 14.2127C5.75 14.2127 5.985 14.0732 6.10586 13.8407C6.15286 13.7477 6.17301 13.6481 6.17301 13.5551C6.17301 13.3027 6.03201 13.0636 5.79029 12.9507ZM13.3641 12.3463C13.3641 12.3463 13.3909 12.333 13.3977 12.3198C13.4178 12.2998 13.4312 12.2733 13.4447 12.2533C13.4245 12.2865 13.3977 12.3198 13.3641 12.3463ZM3.91698 11.463C3.7827 11.2969 3.58798 11.2106 3.39326 11.2106C3.24555 11.2106 3.09783 11.2637 2.97697 11.3567C2.68154 11.5892 2.63454 12.0076 2.86283 12.2932C2.99712 12.4592 3.19183 12.5456 3.39326 12.5456C3.54098 12.5456 3.68869 12.4924 3.80955 12.3995C3.97741 12.2666 4.0647 12.074 4.0647 11.8814C4.0647 11.7353 4.0177 11.5892 3.91698 11.463ZM2.88297 9.32433C2.80911 9.01881 2.53382 8.80627 2.23168 8.80627C2.18468 8.80627 2.13096 8.81291 2.07725 8.8262C1.71467 8.9059 1.48638 9.26455 1.56696 9.61657C1.64081 9.92873 1.9161 10.1346 2.22496 10.1346C2.27196 10.1346 2.32568 10.1346 2.37268 10.1213C2.68825 10.0549 2.8964 9.77597 2.8964 9.47045C2.8964 9.42395 2.8964 9.37082 2.88297 9.32433ZM2.37939 6.15621C2.33239 6.14293 2.27868 6.14293 2.23168 6.14293C1.92282 6.14293 1.64753 6.34218 1.57367 6.65434C1.4931 7.013 1.71467 7.36501 2.07725 7.45135C2.13096 7.46464 2.17796 7.47128 2.22496 7.47128C2.53382 7.47128 2.80911 7.25874 2.88297 6.95322C2.8964 6.90673 2.8964 6.8536 2.8964 6.8071C2.8964 6.50158 2.69497 6.22263 2.37939 6.15621ZM3.82298 3.87809C3.70212 3.78511 3.55441 3.73197 3.40669 3.73197C3.20526 3.73197 3.01054 3.81831 2.87626 3.98436C2.64797 4.26995 2.69497 4.68838 2.98369 4.92085C3.10454 5.01383 3.25226 5.06696 3.39998 5.06696C3.59469 5.06696 3.79612 4.98062 3.9237 4.81458C4.02441 4.69503 4.07141 4.54227 4.07141 4.39615C4.07141 4.20354 3.99084 4.01093 3.82298 3.87809ZM6.11929 2.45011C6.00515 2.21101 5.76343 2.07153 5.50829 2.07153C5.41428 2.07153 5.31357 2.09146 5.21957 2.13795C4.88385 2.29735 4.74956 2.69586 4.90399 3.0213C5.02485 3.26041 5.25985 3.39988 5.50829 3.39988C5.609 3.39988 5.70972 3.37996 5.80372 3.33347C6.04543 3.22056 6.17972 2.98145 6.17972 2.73571C6.17972 2.63608 6.15958 2.5431 6.11929 2.45011Z" fill="currentColor" />
      <path d="M14.8809 8.14215C14.8809 8.65356 14.8205 9.15834 14.7063 9.64983C14.5251 10.4269 14.2028 11.1708 13.7462 11.8482C13.6589 11.9811 13.5649 12.1073 13.4642 12.2268C13.4642 12.2401 13.4575 12.2468 13.444 12.2534C13.4239 12.2866 13.397 12.3198 13.3635 12.3464C12.7457 13.1102 11.9602 13.7212 11.0604 14.1529C11.047 14.1596 11.0269 14.1662 11.0134 14.1729C10.9194 14.2194 10.8187 14.2658 10.718 14.3057C9.90558 14.6378 9.01928 14.8105 8.1397 14.8105H8.11955C7.74355 14.8038 7.45483 14.5116 7.45483 14.1463C7.45483 13.781 7.75698 13.4821 8.12627 13.4821H8.14641C8.85142 13.4821 9.55643 13.3426 10.2077 13.077C11.047 12.7316 11.7789 12.187 12.3496 11.4896C12.4436 11.37 12.5443 11.2438 12.6316 11.111C12.9942 10.5664 13.256 9.97527 13.397 9.35095C13.397 9.33766 13.397 9.32438 13.397 9.31774C13.4843 8.93252 13.5313 8.54065 13.5313 8.14215C13.5313 7.43812 13.3903 6.75402 13.1218 6.10313C12.927 5.64485 12.6786 5.21978 12.3697 4.83455C12.2422 4.67515 12.1012 4.51575 11.9535 4.36963C11.4499 3.8715 10.859 3.47964 10.201 3.21397C9.55643 2.9483 8.86485 2.81546 8.16655 2.80882H8.13298C7.76369 2.80882 7.46155 2.50994 7.46155 2.14464C7.46155 1.77935 7.76369 1.48047 8.13298 1.48047H8.17327C9.05285 1.48711 9.90557 1.65315 10.7113 1.98524C10.8322 2.03838 10.953 2.08487 11.0672 2.14464C11.0806 2.15129 11.094 2.15793 11.1007 2.15793C11.7722 2.48337 12.3697 2.90845 12.9002 3.43314C13.0815 3.61247 13.256 3.80508 13.4172 4.00434C13.4239 4.01098 13.4239 4.01762 13.4306 4.02426C13.8133 4.49583 14.1222 5.02717 14.3639 5.59171C14.4982 5.91052 14.6056 6.24261 14.6795 6.57469C14.6929 6.62119 14.7063 6.66768 14.7131 6.71417C14.8205 7.17909 14.8742 7.6573 14.8742 8.14215H14.8809Z" fill="currentColor" />
    </svg>
  );
}

function TaskPendingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 2C10.0222 2 8.08879 2.58649 6.4443 3.6853C4.79981 4.78412 3.51809 6.3459 2.76121 8.17317C2.00433 10.0004 1.8063 12.0111 2.19215 13.9509C2.578 15.8907 3.53041 17.6725 4.92894 19.0711C6.32746 20.4696 8.10929 21.422 10.0491 21.8079C11.9889 22.1937 13.9996 21.9957 15.8268 21.2388C17.6541 20.4819 19.2159 19.2002 20.3147 17.5557C21.4135 15.9112 22 13.9778 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7363 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM12 20C10.4178 20 8.87104 19.5308 7.55544 18.6518C6.23985 17.7727 5.21447 16.5233 4.60897 15.0615C4.00347 13.5997 3.84504 11.9911 4.15372 10.4393C4.4624 8.88743 5.22433 7.46197 6.34315 6.34315C7.46197 5.22433 8.88743 4.4624 10.4393 4.15372C11.9911 3.84504 13.5997 4.00346 15.0615 4.60896C16.5233 5.21447 17.7727 6.23984 18.6518 7.55544C19.5308 8.87103 20 10.4177 20 12C20 14.1217 19.1572 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20Z" fill="currentColor" />
    </svg>
  );
}

function TasksCanvasFilled() {
  return (
    <main className="flex flex-col h-full overflow-y-auto">
      {CANVAS_TASKS_SAMPLE.map((task) => {
        const isInProgress = task.status === 'in_progress';
        const isCompleted = task.status === 'completed';
        return (
          <div
            key={task.id}
            className={cn('px-4 py-2', isInProgress && 'bg-muted/40')}
          >
            <div className="flex gap-2 items-center w-full">
              <div className="shrink-0">
                {isCompleted && (
                  <TaskCompletedIcon className="w-4 h-4 text-muted-foreground" />
                )}
                {isInProgress && (
                  <TaskInProgressIcon className="w-4 h-4 text-foreground" />
                )}
                {task.status === 'pending' && (
                  <TaskPendingIcon className="w-4 h-4 text-foreground" />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-normal leading-4',
                  isCompleted ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {task.title}
              </span>
            </div>
          </div>
        );
      })}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function CanvasTabEmptyContent({
  activeTab,
  onCreatePlan,
  filled,
  selectedChangeFileId,
  changeNavigationRequest,
}: {
  activeTab: TabId;
  onCreatePlan: () => void;
  /** When true, show sample “filled” content for the active tab; when false, empty state. */
  filled: boolean;
  selectedChangeFileId: ChangeFileId | null;
  changeNavigationRequest: number;
}) {
  const textBlock = (icon: React.ReactNode, body: React.ReactNode) => (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 text-muted-foreground [&_svg]:size-8 [&_svg]:shrink-0" aria-hidden>
        {icon}
      </div>
      <div className="max-w-md text-sm leading-relaxed text-muted-foreground">{body}</div>
    </div>
  );

  switch (activeTab) {
    case 'changes':
      if (!filled) {
        return textBlock(
          <FileDiff className="opacity-90" />,
          <>OpenHands hasn&apos;t made any changes yet</>
        );
      }
      return (
        <ChangesCanvasFilled
          selectedChangeFileId={selectedChangeFileId}
          changeNavigationRequest={changeNavigationRequest}
        />
      );
    case 'terminal':
      if (!filled) {
        return (
          <TerminalCanvasShell>
            <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 text-muted-foreground [&_svg]:size-8 [&_svg]:shrink-0" aria-hidden>
                <Terminal strokeWidth={1.75} />
              </div>
              <div className="max-w-md text-sm leading-relaxed text-muted-foreground">No terminal output yet.</div>
            </div>
          </TerminalCanvasShell>
        );
      }
      return (
        <TerminalCanvasShell>
          <TerminalCanvasFilledOutput />
        </TerminalCanvasShell>
      );
    case 'app':
      if (!filled) {
        return (
          <AppCanvasShell>
            <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 text-muted-foreground [&_svg]:size-8 [&_svg]:shrink-0" aria-hidden>
                <Monitor strokeWidth={1.75} />
              </div>
              <div className="max-w-md text-sm leading-relaxed text-muted-foreground">
                No web app running. Ask OpenHands to start your project&apos;s dev server (for example: npm run dev) to see your web application here.
              </div>
            </div>
          </AppCanvasShell>
        );
      }
      return (
        <AppCanvasShell>
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
            <BrowserCanvasDemoApp />
          </div>
        </AppCanvasShell>
      );
    case 'browser':
      if (!filled) {
        return (
          <BrowserCanvasShell>
            <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 text-muted-foreground [&_svg]:size-8 [&_svg]:shrink-0" aria-hidden>
                <Globe strokeWidth={1.75} />
              </div>
              <div className="max-w-md text-sm leading-relaxed text-muted-foreground">
                No page loaded yet. Ask OpenHands to open a URL. Example: &quot;Open https://example.com&quot;
              </div>
            </div>
          </BrowserCanvasShell>
        );
      }
      return (
        <BrowserCanvasShell>
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
            <BrowserCanvasDemoApp />
          </div>
        </BrowserCanvasShell>
      );
    case 'code':
      if (!filled) {
        return textBlock(
          <Code2 strokeWidth={1.75} />,
          <>No file open. Ask OpenHands to create or open a file in the repository.</>
        );
      }
      return <CodeCanvasPlaceholder />;
    case 'planner':
      if (!filled) {
        return (
          <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 text-muted-foreground [&_svg]:size-8 [&_svg]:shrink-0" aria-hidden>
              <ClipboardList strokeWidth={1.75} />
            </div>
            <p className="mb-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              There is currently no plan for this repo
            </p>
            <Button type="button" variant="secondary" onClick={onCreatePlan}>
              Create a plan
            </Button>
          </div>
        );
      }
      return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-transparent text-left">
          <div className={cn(CANVAS_PANEL_HEADER_CLASS, 'justify-between gap-2')}>
            <span className="text-xs font-medium leading-none text-foreground">Planner</span>
            <button
              type="button"
              className="flex h-7 min-w-[4.25rem] cursor-pointer items-center justify-center rounded-md bg-primary px-2 text-primary-foreground transition-opacity hover:opacity-90"
              data-testid="planner-tab-build-button"
              aria-label="Build plan"
              onClick={onCreatePlan}
            >
              <span className="text-xs font-medium leading-5">Build ⌘↩</span>
            </button>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-b-md">
            <div className="absolute inset-0 flex flex-col overflow-auto p-4">
              <PlannerFilledPlanSample />
            </div>
          </div>
        </div>
      );
    case 'tasks':
      if (!filled) {
        return (
          <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 text-muted-foreground [&_svg]:size-8 [&_svg]:shrink-0" aria-hidden>
              <ListTodo strokeWidth={1.75} />
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              No tasks yet. OpenHands will track progress here as it works on your request.
            </p>
          </div>
        );
      }
      return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-transparent text-left">
          <div className={cn(CANVAS_PANEL_HEADER_CLASS)}>
            <span className="text-xs font-medium leading-none text-foreground">Task List</span>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-b-md">
            <div className="absolute inset-0 flex flex-col overflow-y-auto">
              <TasksCanvasFilled />
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}
