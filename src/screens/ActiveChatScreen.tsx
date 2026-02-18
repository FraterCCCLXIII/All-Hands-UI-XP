import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Loader2,
  ArrowUp,
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
  ArrowUp as ArrowUpIcon,
  FileText,
  Sparkles,
  TestTube,
  Microchip,
  Merge,
  Package,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Copy,
  Check,
  ListTodo,
  Circle,
  Settings,
  Pencil,
  Download,
  DollarSign,
  X,
  Trash2,
  Hammer,
  MessageCircleQuestion,
  ListChecks,
  RefreshCw,
} from 'lucide-react';
import { Theme, ThemeElement } from '../types/theme';
import { cn } from '../lib/utils';
import { PrototypeControlsFab } from '../components/common/PrototypeControlsFab';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Protip, type ProtipVariant } from '../components/canvas/Protip';
import { ChatStartScreen } from '../components/chat/ChatStartScreen';
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
} from '../components/ui/dropdown-menu';

interface ActiveChatScreenProps {
  theme: Theme;
  getThemeClasses: (element: ThemeElement) => string;
  showRefreshNotification: boolean;
  onToggleRefreshNotification: () => void;
  canvasTipVariant: 'none' | ProtipVariant;
  onCanvasTipVariantChange: (variant: 'none' | ProtipVariant) => void;
  showCanvasLoading: boolean;
  onToggleCanvasLoading: () => void;
  chatContentMode: 'skeleton' | 'conversation' | 'start';
  onChatContentModeChange: (mode: 'skeleton' | 'conversation' | 'start') => void;
  repositoryStatus: 'connected' | 'disconnected' | 'connect';
  onRepositoryStatusChange: (status: 'connected' | 'disconnected' | 'connect') => void;
  showStatusBadge: boolean;
  onToggleStatusBadge: () => void;
}

const DEFAULT_LEFT_PANEL_WIDTH = 42.8;

type TabId = 'changes' | 'code' | 'terminal' | 'app' | 'browser';

const DEFAULT_PINNED: Record<TabId, boolean> = {
  changes: true,
  code: true,
  terminal: true,
  app: true,
  browser: true,
};

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

type CommandItem = {
  id: string;
  label: string;
  description: string;
  command: string;
};

const CHAT_COMMANDS: CommandItem[] = [
  { id: 'summarize', label: 'Summarize thread', description: 'Recap the conversation so far.', command: '/summarize' },
  { id: 'explain', label: 'Explain selection', description: 'Explain highlighted code or output.', command: '/explain' },
  { id: 'tests', label: 'Generate tests', description: 'Add tests for recent changes.', command: '/tests' },
  { id: 'plan', label: 'Create a plan', description: 'Break the work into steps.', command: '/plan' },
  { id: 'optimize', label: 'Optimize performance', description: 'Identify and fix slow paths.', command: '/optimize' },
];

export function ActiveChatScreen({
  theme,
  getThemeClasses,
  showRefreshNotification,
  onToggleRefreshNotification,
  canvasTipVariant,
  onCanvasTipVariantChange,
  showCanvasLoading,
  onToggleCanvasLoading,
  chatContentMode,
  onChatContentModeChange,
  repositoryStatus,
  onRepositoryStatusChange,
  showStatusBadge,
  onToggleStatusBadge,
}: ActiveChatScreenProps) {
  const [leftPanelWidth] = useState(DEFAULT_LEFT_PANEL_WIDTH);
  const [serverStatus, setServerStatus] = useState('Starting');
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('changes');
  const [pinnedTabs, setPinnedTabs] = useState<Record<TabId, boolean>>(() => ({ ...DEFAULT_PINNED }));
  const [chatInput, setChatInput] = useState('');
  const chatInputRef = useRef<HTMLDivElement>(null);
  const [conversationLoaded, setConversationLoaded] = useState(false);
  const [chatStatusIndex, setChatStatusIndex] = useState(0);
  const [statusIndicatorExiting, setStatusIndicatorExiting] = useState(false);
  const [drawersAnimatedIn, setDrawersAnimatedIn] = useState(false);
  const [taskListExpanded, setTaskListExpanded] = useState(false);
  const [changesExpanded, setChangesExpanded] = useState(false);
  const [taskListDrawerVisible, setTaskListDrawerVisible] = useState(false);
  const [changesDrawerVisible, setChangesDrawerVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_LLM_MODEL);
  const [chatMode, setChatMode] = useState<'build' | 'ask' | 'plan'>('build');
  const [projectReadExpanded, setProjectReadExpanded] = useState(false);
  const [packageJsonReadExpanded, setPackageJsonReadExpanded] = useState(false);
  const [ranCommandExpanded, setRanCommandExpanded] = useState(false);
  const shouldShowStatusBadge = showStatusBadge || !conversationLoaded;
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [commandActiveIndex, setCommandActiveIndex] = useState(0);
  const [isCliCommandVisible, setIsCliCommandVisible] = useState(false);
  const [isCliCommandCopied, setIsCliCommandCopied] = useState(false);
  const blurTimeoutRef = useRef<number | null>(null);
  const commandListRef = useRef<HTMLDivElement | null>(null);
  const commandItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const showCanvasTip = canvasTipVariant !== 'none';
  const canvasTipLabel = CANVAS_TIP_OPTIONS.find((option) => option.id === canvasTipVariant)?.label ?? 'None';

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
    if (!shouldShowStatusBadge) return;
    const id = window.setInterval(() => {
      setChatStatusIndex((i) => (i + 1) % CHAT_STATUS_MESSAGES.length);
    }, CHAT_STATUS_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [shouldShowStatusBadge]);

  useEffect(() => {
    if (!conversationLoaded) return;
    const id = window.setTimeout(() => setDrawersAnimatedIn(true), 50);
    return () => window.clearTimeout(id);
  }, [conversationLoaded]);

  const togglePinned = useCallback((id: TabId) => {
    setPinnedTabs((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const count = (Object.values(next) as boolean[]).filter(Boolean).length;
      if (count === 0) return prev;
      return next;
    });
  }, []);

  const rightPanelWidth = 100 - leftPanelWidth;
  const hasInput = !!chatInput.trim();
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
      if (chatInputRef.current) chatInputRef.current.innerText = '';
      setIsCommandMenuOpen(false);
      setCommandQuery('');
      // Could wire to parent or local messages state here
    }
  }, [chatInput]);

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
    },
    [placeCaretAtEnd]
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
                    className="absolute bg-popover text-popover-foreground border border-border rounded-[6px] overflow-hidden z-50 shadow-lg py-[6px] px-1 flex flex-col gap-2 top-full left-0 mt-1 w-fit min-w-[10.5rem]"
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
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 cursor-help lowercase bg-muted text-muted-foreground">
                  V1
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button data-testid="ellipsis-button" type="button" className="cursor-pointer p-0.5 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-6 h-6" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    data-testid="conversation-name-context-menu"
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    className="min-w-[11rem] rounded-[6px] py-[6px] px-1 z-[100]"
                  >
                    <DropdownMenuItem data-testid="rename-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60">
                      <Pencil className="w-4 h-4 shrink-0" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem data-testid="show-skills-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      Show Available Skills
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="show-agent-tools-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60">
                      <Wrench className="w-4 h-4 shrink-0" />
                      Show Agent Tools &amp; Metadata
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="download-trajectory-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60">
                      <Download className="w-4 h-4 shrink-0" />
                      Export Conversation
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem data-testid="display-cost-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60">
                      <DollarSign className="w-4 h-4 shrink-0" />
                      Display Cost
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="stop-button" className="gap-2 cursor-pointer p-2 h-[30px] rounded hover:bg-muted/60">
                      <X className="w-4 h-4 shrink-0" />
                      Close Conversation (Stop Runtime)
                    </DropdownMenuItem>
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
                <span data-aria-label="Changes">
                  <button
                    type="button"
                    onClick={() => setActiveTab('changes')}
                    className={cn(
                      'flex items-center rounded-md cursor-pointer pl-1.5 py-1 text-sm font-medium transition-[color,background-color,padding-right] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      activeTab === 'changes'
                        ? 'gap-2 pr-2 bg-secondary text-foreground hover:bg-secondary/90'
: 'gap-0 pr-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  <ChangesIcon className="w-4 h-4 flex-shrink-0 text-inherit" />
                    <span
                      className={cn(
                        'overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-200',
                        activeTab === 'changes' ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'
                      )}
                    >
                      Changes
                    </span>
                  </button>
                </span>
              )}
              {pinnedTabs.code && (
                <TabButton label="Code" active={activeTab === 'code'} onClick={() => setActiveTab('code')} ariaLabel="Code" icon={<Code2 className="w-4 h-4 flex-shrink-0" />} />
              )}
              {pinnedTabs.terminal && (
                <span data-aria-label="Terminal (read-only)">
                  <TabButton label="Terminal" active={activeTab === 'terminal'} onClick={() => setActiveTab('terminal')} ariaLabel="Terminal (read-only)" icon={<Terminal className="w-4 h-4 flex-shrink-0" />} />
                </span>
              )}
              {pinnedTabs.app && (
                <TabButton label="App" active={activeTab === 'app'} onClick={() => setActiveTab('app')} ariaLabel="App" icon={<Monitor className="w-4 h-4 flex-shrink-0" />} />
              )}
              {pinnedTabs.browser && (
                <TabButton label="Browser" active={activeTab === 'browser'} onClick={() => setActiveTab('browser')} ariaLabel="Browser" icon={<Globe className="w-4 h-4 flex-shrink-0" />} />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-md cursor-pointer p-1 pl-0 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-[color,background-color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="min-w-[11rem] rounded-[6px] py-[6px] px-1"
                >
                  {(
                    [
                      { id: 'changes' as const, label: 'Changes', icon: <ChangesIcon className="w-4 h-4" /> },
                      { id: 'code' as const, label: 'Code', icon: <Code2 className="w-4 h-4" /> },
                      { id: 'terminal' as const, label: 'Terminal (read-only)', icon: <Terminal className="w-4 h-4" /> },
                      { id: 'app' as const, label: 'App', icon: <Monitor className="w-4 h-4" /> },
                      { id: 'browser' as const, label: 'Browser', icon: <Globe className="w-4 h-4" /> },
                    ] as const
                  ).map(({ id, label, icon }) => {
                    const isPinned = pinnedTabs[id];
                    return (
                      <DropdownMenuItem
                        key={id}
                        data-testid="context-menu-list-item"
                        onClick={(e) => {
                          e.preventDefault();
                          togglePinned(id);
                        }}
                        className="cursor-pointer gap-2"
                      >
                        {icon}
                        <span className="flex-1 text-left">{label}</span>
                        {isPinned ? (
                          <PinOff className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
                        ) : (
                          <Pin className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main two-panel layout */}
          <div className="h-full flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="flex flex-1 transition-all duration-300 ease-in-out overflow-hidden min-h-0" style={{ transitionProperty: 'all' }}>
              {/* Left panel: chat */}
              <div
                className="flex flex-col bg-base overflow-hidden transition-all duration-300 ease-in-out min-h-0"
                style={{ width: `${leftPanelWidth}%`, transitionProperty: 'all' }}
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
                            className="rounded-xl relative w-fit max-w-full last:mb-4 flex flex-col gap-2 p-3 bg-muted self-end"
                          >
                            <div className="text-sm" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              <p className="py-1.5 first:pt-0 last:pb-0">run this</p>
                            </div>
                          </article>
                          <article
                            data-testid="agent-message"
                            className="rounded-xl relative last:mb-4 flex flex-col gap-2 mt-6 w-full max-w-full bg-transparent"
                          >
                            <div className="text-sm w-full" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              {/* File read block: project/ */}
                              <div className="flex flex-col gap-2 my-2 py-2 text-sm text-neutral-500 w-full font-sans">
                                <div className="flex items-center justify-between font-normal text-neutral-500">
                                  <div>
                                    <span className="text-neutral-400">Read</span>{' '}
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
                                        <ChevronUp className="h-4 w-4 ml-2 inline text-neutral-500" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 ml-2 inline text-neutral-500" />
                                      )}
                                    </button>
                                  </div>
                                  <span className="flex-shrink-0">
                                    <CheckCircle className="h-4 w-4 ml-2 inline text-success" data-testid="status-icon" />
                                  </span>
                                </div>
                                {projectReadExpanded && (
                                  <div data-testid="markdown-renderer" className="mt-1">
                                    <pre className="bg-neutral-800 text-neutral-200 p-4 rounded border border-neutral-600 overflow-auto text-xs font-mono whitespace-pre">
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
                              <div className="flex flex-col gap-2 my-2 py-2 text-sm text-neutral-500 w-full font-sans">
                                <div className="flex items-center justify-between font-normal text-neutral-500">
                                  <div>
                                    <span className="text-neutral-400">Read</span>{' '}
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
                                        <ChevronUp className="h-4 w-4 ml-2 inline text-neutral-500" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 ml-2 inline text-neutral-500" />
                                      )}
                                    </button>
                                  </div>
                                  <span className="flex-shrink-0">
                                    <CheckCircle className="h-4 w-4 ml-2 inline text-success" data-testid="status-icon" />
                                  </span>
                                </div>
                                {packageJsonReadExpanded && (
                                  <div data-testid="markdown-renderer" className="mt-1">
                                    <pre className="bg-neutral-800 text-neutral-200 p-4 rounded border border-neutral-600 overflow-auto text-xs font-mono whitespace-pre">
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
                              <div className="flex flex-col gap-2 my-2 py-2 text-sm text-neutral-500 w-full font-sans">
                                <div className="flex items-center justify-between font-normal text-neutral-500">
                                  <div>
                                    <span className="text-neutral-400">Ran</span>{' '}
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
                                        <ChevronUp className="h-4 w-4 ml-2 inline text-neutral-500" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 ml-2 inline text-neutral-500" />
                                      )}
                                    </button>
                                  </div>
                                  <span className="flex-shrink-0">
                                    <CheckCircle className="h-4 w-4 ml-2 inline text-success" data-testid="status-icon" />
                                  </span>
                                </div>
                                {ranCommandExpanded && (
                                  <div data-testid="markdown-renderer" className="mt-1 space-y-2">
                                    <p className="text-neutral-400 text-sm">
                                      Command:{' '}
                                      <code className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded border border-neutral-600 text-xs font-mono">
                                        sleep 2 &amp;&amp; cat /workspace/project/All-Hands-UI-XP/server.log
                                      </code>
                                    </p>
                                    <p className="text-neutral-400 text-sm">Output:</p>
                                    <pre className="bg-neutral-900 text-neutral-300 p-4 rounded-lg border border-neutral-600 overflow-auto text-xs font-mono whitespace-pre">
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
                                    className="text-blue-500 hover:underline font-normal"
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
                                    <code className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded border border-neutral-600 text-xs font-mono">
                                      ./components/chat/ConversationDrawer
                                    </code>{' '}
                                    in App.tsx
                                  </li>
                                  <li>
                                    Missing import{' '}
                                    <code className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded border border-neutral-600 text-xs font-mono">
                                      ../ui/popover
                                    </code>{' '}
                                    in LeftNav.tsx
                                  </li>
                                  <li>
                                    CSS{' '}
                                    <code className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded border border-neutral-600 text-xs font-mono">
                                      @import
                                    </code>{' '}
                                    should be placed before{' '}
                                    <code className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded border border-neutral-600 text-xs font-mono">
                                      @tailwind
                                    </code>{' '}
                                    directives
                                  </li>
                                  <li>
                                    Duplicate{' '}
                                    <code className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded border border-neutral-600 text-xs font-mono">
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
                              <div className="flex flex-col overflow-clip bg-card border border-border rounded-xl w-full mt-4">
                                <div className="flex gap-1 items-center border-b border-border h-[41px] px-2 shrink-0">
                                  <ListTodo className="shrink-0 w-4 h-4 text-muted-foreground" aria-hidden />
                                  <span className="text-[11px] text-nowrap text-foreground tracking-[0.11px] font-medium leading-[16px] whitespace-pre">
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
                                        <span className="font-normal text-[12px] text-foreground">{label}</span>
                                        <span className="font-normal text-[10px] text-muted-foreground">Notes: </span>
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
                            style={{ transform: 'translateY(16px)' }}
                            aria-hidden={!drawersAnimatedIn}
                          >
                            {taskListDrawerVisible && (
                            <div
                              className={cn(
                                'relative z-0 flex flex-col border border-border border-b-0 bg-card rounded-t-xl overflow-hidden transition-transform duration-300 ease-out -mb-px',
                                drawersAnimatedIn ? 'translate-y-[1.45rem]' : 'translate-y-full'
                              )}
                              style={{ transitionDelay: '100ms' }}
                              data-testid="drawer-task-list"
                            >
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => { setChangesExpanded(false); setTaskListExpanded((e) => !e); }}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setChangesExpanded(false); setTaskListExpanded((prev) => !prev); } }}
                                className={cn(
                                  'flex items-center justify-between w-full px-4 py-2 min-h-[32px] text-left rounded-t-xl bg-card cursor-pointer group hover:bg-muted/50 transition-colors duration-200',
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
                                  <div className="px-4 py-3 pb-[1.45rem] space-y-2 bg-card">
                                  {['Fix module imports', 'Fix TopBar props', 'Fix Canvas props', 'Fix ChatThread', 'Test build'].map((label, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                                      <Circle className="w-3 h-3 shrink-0 text-muted-foreground" />
                                      <span>{label}</span>
                                    </div>
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
                                  'flex items-center justify-between w-full px-4 py-2 min-h-[32px] text-left rounded-t-xl bg-card cursor-pointer group hover:bg-muted/50 transition-colors duration-200',
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
                                  <div className="px-4 py-3 pb-[1.45rem] space-y-2 bg-card text-sm text-foreground">
                                    <div>src/App.tsx</div>
                                    <div>src/components/canvas/Canvas.tsx</div>
                                    <div>src/screens/ActiveChatScreen.tsx</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            )}
                          </div>
                        )}
                        <div className="z-10 h-0 w-full bg-base shrink-0" aria-hidden />
                        <div data-testid="interactive-chat-box" className="relative z-10 -mt-[1px]">
                          {shouldShowStatusBadge && (
                            <div className="absolute left-0 bottom-[calc(100%-8px)] flex items-end gap-1">
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
                                <span className="font-normal text-[10px] leading-4 normal-case">
                                  {CHAT_STATUS_MESSAGES[chatStatusIndex]}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="w-full">
                          <div
                            role="status"
                            aria-live="polite"
                            aria-hidden={!showRefreshNotification}
                            className={cn(
                              'w-full rounded-lg border border-teal-300 bg-teal-200 text-teal-950 px-3 py-2 mb-2 flex items-center gap-2 overflow-hidden',
                              'transition-[max-height,opacity,margin] duration-200',
                              showRefreshNotification
                                ? 'animate-in fade-in-0 slide-in-from-top-1 max-h-24 opacity-100'
                                : 'animate-out fade-out-0 slide-out-to-top-1 max-h-0 opacity-0 mb-0 pointer-events-none'
                            )}
                            data-testid="reconnect-banner"
                          >
                            <RefreshCw className="w-4 h-4 text-teal-900 shrink-0" aria-hidden />
                            <span className="text-sm font-medium flex-1 text-left">Refresh the page to update session</span>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-md bg-teal-300/70 px-2 py-1 text-xs font-semibold text-teal-950 hover:bg-teal-300"
                              onClick={() => window.location.reload()}
                            >
                              Refresh
                            </button>
                          </div>
                            {showStatusBadge && (
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
                                                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
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
                                  <div className="w-full rounded-xl border border-border bg-popover text-popover-foreground shadow-lg px-3 py-2">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-xs font-medium text-foreground">Open Conversation in CLI</p>
                                        <p className="mt-1 text-xs text-muted-foreground">Copy and run this command in your terminal.</p>
                                      </div>
                                      <button
                                        type="button"
                                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
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
                                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
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
                              <div className="absolute -top-3 left-0 w-full h-6 lg:h-3 z-20 group" id="resize-grip">
                                <div className="absolute top-1 left-0 w-full h-[3px] bg-white cursor-ns-resize z-10 transition-opacity duration-200 opacity-0 group-hover:opacity-100" style={{ userSelect: 'none' }} />
                              </div>
                              <div className="border border-border box-border content-stretch flex flex-col items-start justify-center relative rounded-[15px] w-full bg-[#141414]" style={{ padding: '.75rem' }}>
                                <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full pb-[18px] gap-2">
                                  <div className="basis-0 box-border content-stretch flex flex-row gap-4 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0">
                                    <button
                                      type="button"
                                      className="flex items-center justify-center rounded-full size-8 shrink-0 transition-all duration-200 hover:scale-105 hover:bg-muted active:scale-95 cursor-not-allowed text-muted-foreground"
                                      data-testid="paperclip-icon"
                                      aria-label="Attach"
                                    >
                                      <Paperclip className="w-4 h-4" />
                                    </button>
                                    <div className="box-border content-stretch flex flex-row items-center justify-start min-h-6 p-0 relative shrink-0 flex-1">
                                      <div
                                        ref={chatInputRef}
                                        contentEditable
                                        data-placeholder="What do you want to build?"
                                        data-testid="chat-input"
                                        className="chat-input bg-transparent text-foreground text-base font-normal leading-5 outline-none resize-none custom-scrollbar min-h-5 max-h-[400px] w-full block whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
                                        style={{ height: 20, overflowY: 'hidden' }}
                                        role="textbox"
                                        aria-multiline="true"
                                        aria-expanded={isCommandMenuOpen}
                                        aria-controls={COMMAND_LIST_ID}
                                        onInput={(e) => {
                                          const value = (e.target as HTMLDivElement).innerText;
                                          setChatInput(value);
                                          updateCommandMenuState(value);
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
                                          className="flex items-center gap-1 cursor-pointer text-muted-foreground rounded-[100px] border border-border bg-muted/30 px-2 py-0.5 transition-colors hover:bg-muted/50 hover:text-foreground active:bg-muted/60 active:text-foreground data-[state=open]:bg-muted/50 data-[state=open]:text-foreground whitespace-nowrap shrink-0"
                                          aria-label="Tools"
                                          data-testid="tools-trigger"
                                        >
                                          <Wrench className="w-4 h-4 shrink-0" />
                                          <span className="text-xs font-normal leading-4">Tools</span>
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={8}
                                        className="min-w-[200px] rounded-[6px] py-[6px] px-1 z-[100]"
                                        data-testid="tools-context-menu"
                                      >
                                        <DropdownMenuSub>
                                          <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                                            <GitBranch className="h-4 w-4 shrink-0" />
                                            Git Tools
                                          </DropdownMenuSubTrigger>
                                          <DropdownMenuSubContent className="rounded-[6px] min-w-[8rem]">
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
                                          <DropdownMenuSubContent className="rounded-[6px] min-w-[8rem]">
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
                                              <Package className="h-4 w-4" />
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
                                        <DropdownMenuItem className="gap-2 cursor-pointer">
                                          <Sparkles className="h-4 w-4" />
                                          Show Available Skills
                                        </DropdownMenuItem>
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
                                            'flex items-center gap-1 cursor-pointer rounded-[100px] border px-2 py-0.5 transition-colors text-xs font-normal leading-4 hover:opacity-90 data-[state=open]:opacity-90 whitespace-nowrap shrink-0',
                                            chatMode === 'build' && 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                                            chatMode === 'ask' && 'border-blue-500/50 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30',
                                            chatMode === 'plan' && 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                                          )}
                                          aria-label="Chat mode"
                                          data-testid="mode-pill"
                                        >
                                          {chatMode === 'build' && <Hammer className="w-4 h-4 shrink-0" aria-hidden />}
                                          {chatMode === 'ask' && <MessageCircleQuestion className="w-4 h-4 shrink-0" aria-hidden />}
                                          {chatMode === 'plan' && <ListChecks className="w-4 h-4 shrink-0" aria-hidden />}
                                          <span>{chatMode === 'build' ? 'Build' : chatMode === 'ask' ? 'Ask' : 'Plan'}</span>
                                          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={8}
                                        className="min-w-[8rem] rounded-[6px] py-[6px] px-1 z-[100]"
                                        data-testid="mode-menu"
                                      >
                                        <DropdownMenuItem className="gap-2 cursor-pointer" onSelect={() => setChatMode('build')}>
                                          <Hammer className="h-4 w-4 shrink-0" />
                                          Build
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2 cursor-pointer" onSelect={() => setChatMode('ask')}>
                                          <MessageCircleQuestion className="h-4 w-4 shrink-0" />
                                          Ask
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2 cursor-pointer" onSelect={() => setChatMode('plan')}>
                                          <ListChecks className="h-4 w-4 shrink-0" />
                                          Plan
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          type="button"
                                          className="flex items-center gap-1 cursor-pointer text-muted-foreground rounded-[100px] border border-border bg-muted/30 px-2 py-0.5 transition-colors hover:bg-muted/50 hover:text-foreground active:bg-muted/60 active:text-foreground data-[state=open]:bg-muted/50 data-[state=open]:text-foreground w-fit shrink-0 max-w-[160px]"
                                          aria-label="Select model"
                                          title={selectedModel}
                                          data-testid="model-trigger"
                                        >
                                          <Microchip className="w-4 h-4 shrink-0" aria-hidden />
                                          <span className="text-xs font-normal leading-4 truncate">
                                            {selectedModel}
                                          </span>
                                          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" aria-hidden />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={8}
                                        className="min-w-[200px] rounded-[6px] py-[6px] px-1 z-[100]"
                                        data-testid="model-menu"
                                      >
                                        {LLM_MODELS.map((model) => (
                                          <DropdownMenuItem
                                            key={model}
                                            className="gap-2 cursor-pointer"
                                            onSelect={() => setSelectedModel(model)}
                                          >
                                            <Microchip className="h-4 w-4 shrink-0" />
                                            {model}
                                          </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="gap-2 cursor-pointer"
                                          onSelect={() => { window.location.hash = '#/settings/llm'; }}
                                        >
                                          <Settings className="h-4 w-4" />
                                          LLM Settings
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div className="flex items-center gap-1 min-w-0 ml-2 md:ml-3">
                                    <span className="text-[11px] text-foreground font-normal leading-5 flex-1 min-w-0 max-w-full truncate" title="An error occurred. Please try again.">
                                      An error occurred. Please try again.
                                    </span>
                                    <div className="bg-muted box-border flex flex-row gap-[3px] items-center justify-center overflow-clip px-0.5 py-1 rounded-[100px] shrink-0 size-6">
                                      <div data-testid="agent-loading-spinner">
                                        <Loader2 className="w-4 h-4 text-foreground animate-spin" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex flex-row items-center">
                            <div className="flex flex-row gap-2.5 items-center overflow-x-auto flex-wrap md:flex-nowrap relative scrollbar-hide">
                              {repositoryStatus === 'connected' ? (
                                <>
                                  <a
                                    href="https://github.com/FraterCCCLXIII/All-Hands-UI-XP"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-row items-center justify-between gap-2 pl-2.5 pr-2.5 py-1 rounded-[100px] flex-1 truncate relative border border-border bg-transparent hover:border-muted-foreground/30 cursor-pointer"
                                  >
                                    <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                                      <Github className="w-3 h-3 text-foreground" />
                                    </div>
                                    <div className="font-normal text-foreground text-sm leading-5 truncate flex-1 min-w-0" title="FraterCCCLXIII/All-Hands-UI-XP">
                                      FraterCCCLXIII/All-Hands-UI-XP
                                    </div>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute right-0 top-1/2 -translate-y-1/2 h-full w-10.5 pr-2.5 justify-end">
                                      <ExternalLink className="w-3 h-3 text-foreground" />
                                    </div>
                                  </a>
                                  <a
                                    href="https://github.com/FraterCCCLXIII/All-Hands-UI-XP/tree/feature/kanban-drawer"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-row items-center justify-between gap-2 pl-2.5 pr-2.5 py-1 rounded-[100px] w-fit flex-shrink-0 max-w-[200px] truncate relative border border-border bg-transparent hover:border-muted-foreground/30 cursor-pointer"
                                  >
                                    <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                                      <GitBranch className="w-3 h-3 text-foreground" />
                                    </div>
                                    <div className="font-normal text-foreground text-sm leading-5 truncate" title="feature/kanban-drawer">
                                      feature/kanban-drawer
                                    </div>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute right-0 top-1/2 -translate-y-1/2 h-full w-10.5 pr-2.5 justify-end">
                                      <ExternalLink className="w-3 h-3 text-foreground" />
                                    </div>
                                  </a>
                                  <button type="button" disabled className="flex flex-row gap-1 items-center justify-center px-0.5 py-1 rounded-[100px] w-[76px] min-w-[76px] bg-[rgba(71,74,84,0.50)] cursor-not-allowed">
                                    <ArrowDownToLine className="w-3 h-3 text-foreground" />
                                    <div className="font-normal text-foreground text-sm leading-5 max-w-[76px] truncate" title="Pull">Pull</div>
                                  </button>
                                  <button type="button" disabled className="flex flex-row gap-1 items-center justify-center px-2 py-1 rounded-[100px] w-[77px] min-w-[77px] bg-[rgba(71,74,84,0.50)] cursor-not-allowed">
                                    <ArrowUp className="w-3 h-3 text-foreground" />
                                    <div className="font-normal text-foreground text-sm leading-5 max-w-[77px] truncate" title="Push">Push</div>
                                  </button>
                                  <button type="button" disabled className="flex flex-row gap-1 items-center justify-center px-2 py-1 rounded-[100px] w-[126px] min-w-[126px] h-7 bg-[rgba(71,74,84,0.50)] cursor-not-allowed">
                                    <GitPullRequest className="w-3 h-3 text-foreground" />
                                    <div className="font-normal text-foreground text-sm leading-5 max-w-[126px] truncate" title="Pull Request">Pull Request</div>
                                  </button>
                                </>
                              ) : repositoryStatus === 'connect' ? (
                                <>
                                  <div className="flex flex-row items-center">
                                    <div className="flex flex-row gap-2.5 items-center overflow-x-auto flex-wrap md:flex-nowrap relative scrollbar-hide">
                                      <div className="group flex flex-row items-center justify-between gap-2 pl-2.5 pr-2.5 py-1 rounded-[100px] flex-1 truncate relative border border-border/60 bg-transparent cursor-not-allowed min-w-[170px]">
                                        <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                                          <Github className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                        <div className="font-normal text-muted-foreground text-sm leading-5 truncate flex-1 min-w-0" title="No Repo Connected">
                                          No Repo Connected
                                        </div>
                                      </div>
                                      <div className="group flex flex-row items-center justify-between gap-2 pl-2.5 pr-2.5 py-1 rounded-[100px] w-fit flex-shrink-0 max-w-[200px] truncate relative border border-border/60 bg-transparent cursor-not-allowed min-w-[108px]">
                                        <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                                          <GitBranch className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                        <div className="font-normal text-muted-foreground text-sm leading-5 truncate" title="No Branch">
                                          No Branch
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="flex flex-row gap-1 items-center justify-center px-2 py-1 rounded-[100px] text-sm font-normal leading-5 h-7 min-w-[76px] bg-[#9E28B0] hover:bg-[#8a2399] text-white border-0"
                                    onClick={() => setIsConnectModalOpen(true)}
                                  >
                                    <span className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                                      <Github className="w-3 h-3 text-white" />
                                    </span>
                                    Connect
                                  </button>
                                </>
                              ) : (
                                <>
                                  <div className="group flex flex-row items-center justify-between gap-2 pl-2.5 pr-2.5 py-1 rounded-[100px] flex-1 truncate relative border border-border/60 bg-transparent cursor-not-allowed min-w-[170px]">
                                    <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                                      <Github className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                    <div className="font-normal text-muted-foreground text-sm leading-5 truncate flex-1 min-w-0" title="No Repo Connected">
                                      No Repo Connected
                                    </div>
                                  </div>
                                  <div className="group flex flex-row items-center justify-between gap-2 pl-2.5 pr-2.5 py-1 rounded-[100px] w-fit flex-shrink-0 max-w-[200px] truncate relative border border-border/60 bg-transparent cursor-not-allowed min-w-[108px]">
                                    <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                                      <GitBranch className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                    <div className="font-normal text-muted-foreground text-sm leading-5 truncate" title="No Branch">
                                      No Branch
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resizer */}
              <div className="relative w-1 bg-transparent cursor-ew-resize flex-shrink-0" aria-hidden>
                <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-transparent" />
                <div className="absolute inset-y-0 -left-1 -right-1" />
              </div>

              {/* Right panel: canvas/loading */}
              <div
                className="transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 opacity-100 min-h-0"
                style={{ width: `${rightPanelWidth}%`, transitionProperty: 'all' }}
              >
                <div className="flex flex-col flex-1 gap-3 min-w-max h-full min-h-0">
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
                                variant={canvasTipVariant === 'none' ? 'protip' : canvasTipVariant}
                                onDismiss={() => onCanvasTipVariantChange('none')}
                              />
                            </div>
                          )}
                        </div>
                        <Loader2 className="w-16 h-16 text-foreground animate-spin" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden />
                        <span className="text-sm font-normal leading-5 gradient-flow p-4">Loading...</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <PrototypeControlsFab isActive={showRefreshNotification || showCanvasTip || showCanvasLoading} />
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-64 p-3 space-y-3">
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
              <DropdownMenuContent align="end" className="min-w-[180px] rounded-[6px] py-[6px] px-1">
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
              <DropdownMenuContent align="end" className="min-w-[180px] rounded-[6px] py-[6px] px-1">
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
              <DropdownMenuContent align="end" className="min-w-[180px] rounded-[6px] py-[6px] px-1">
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
            <div className="text-sm font-medium text-foreground">Status Badge</div>
            <button
              type="button"
              role="switch"
              aria-checked={showStatusBadge}
              onClick={onToggleStatusBadge}
              className={cn(
                'h-6 w-10 rounded-full border border-border flex items-center px-0.5 transition-colors',
                showStatusBadge ? 'bg-foreground/80' : 'bg-muted/60'
              )}
            >
              <span
                className={cn(
                  'h-4 w-4 rounded-full bg-background shadow transition-transform',
                  showStatusBadge ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
        <DialogContent className="max-w-md bg-popover text-popover-foreground">
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
                        className="w-full h-10 px-4 border border-border rounded-md shadow-none bg-muted/40 hover:bg-muted/60 transition-colors text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pl-10 pr-10 text-sm cursor-pointer"
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
                    <div className="flex-shrink-0 border-t border-border p-1 rounded-b-lg bg-card">
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
                        className="w-full h-10 px-4 border border-border rounded-md shadow-none bg-muted/40 hover:bg-muted/60 transition-colors text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60 pl-10 pr-10 text-sm cursor-pointer"
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
                className="h-10 px-4 py-2 bg-white text-black hover:bg-white/90"
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
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  ariaLabel,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  ariaLabel?: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'flex items-center rounded-md cursor-pointer pl-1.5 py-1 text-sm font-medium transition-[color,background-color,padding-right] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
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
}

function ChangesIcon({ className }: { className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g transform="scale(1.3) translate(-3, -3)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.21875 9.04H7.42L6.25 7.85875L7.04875 7.07125L7.825 7.83625L9.41125 6.25L10.21 7.04875L8.21875 9.04ZM11.8637 7.375H20.8637V8.5H11.8637V7.375ZM11.8637 10.75H20.8637V11.875H11.8637V10.75ZM20.8637 14.125H11.8637V15.25H20.8637V14.125ZM11.8637 17.5H20.8637V18.625H11.8637V17.5ZM7.42 12.415H8.21875L10.21 10.4237L9.41125 9.63625L7.825 11.2225L7.04875 10.4462L6.25 11.245L7.42 12.415ZM8.21875 15.8012H7.42L6.25 14.6312L7.04875 13.8325L7.825 14.6088L9.41125 13.0113L10.21 13.81L8.21875 15.8012ZM7.42 19.1875H8.21875L10.21 17.1962L9.41125 16.3975L7.825 17.995L7.04875 17.2188L6.25 18.0062L7.42 19.1875Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
