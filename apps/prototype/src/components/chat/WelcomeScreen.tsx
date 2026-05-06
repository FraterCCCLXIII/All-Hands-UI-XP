import React, { useCallback, useMemo, useState } from 'react';
import {
  Bot,
  ChevronDown,
  ExternalLink,
  Folder,
  GitBranch,
  Github,
  Key,
  Plus,
  Settings,
  Sparkles,
} from 'lucide-react';
import { AutomationGlyph } from '../icons/AutomationGlyph';
import { SkillIcon } from '../icons/SkillIcon';
import { ThemeElement } from '../../types/theme';
import { conversationSummaries } from '../../data/conversations';
import { marketplaceSkills } from '../../data/skillsPageData';
import { navigateAppRoute } from '../../lib/captureNavigation';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { StartNewConversationDialog } from './StartNewConversationDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface WelcomeScreenProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  userName: string;
  variant?: 'default' | 'chat-start' | 'new-chat-start' | 'old-chat-start';
  isInspectorEnabled?: boolean;
  onInspectorToggle?: () => void;
  onStartUxTour?: (tourId: string) => void;
  uxTourLinks?: Array<{ id: string; label: string }>;
  isUxFlowMenuOpen?: boolean;
  onUxFlowMenuOpenChange?: (open: boolean) => void;
  onPrototypeNavItemClick?: (action: string) => void;
}

function buildChatRoute(options: {
  repository: 'connected' | 'disconnected';
  skillName?: string | null;
  repo?: string | null;
  branch?: string | null;
  canvas?: 'closed' | null;
}) {
  const params = new URLSearchParams({
    content: 'start',
    repository: options.repository,
  });
  if (options.canvas) {
    params.set('canvas', options.canvas);
  }
  if (options.skillName) {
    params.set('skill', options.skillName);
  }
  if (options.repo) {
    params.set('repo', options.repo);
  }
  if (options.branch) {
    params.set('branch', options.branch);
  }
  return `/chat?${params.toString()}`;
}

const RECENT_REPOS = ['FraterCCCLXIII/All-Hands-UI-XP', 'FraterCCCLXIII/pr-navigator', 'FraterCCCLXIII/All-Hands-UI'];
const BRANCH_OPTIONS = ['main', 'develop', 'feature/kanban-drawer', 'bugfix/status-badge', 'release/v1.2.0'];
const HOMEPAGE_COLUMN_VISIBLE_ITEMS = 5;
/** Grow with list content; avoid a fixed-height scroll box for short preview lists. */
const HOMEPAGE_COLUMN_LIST_CLASSNAME =
  'transition-all duration-300 ease-in-out';
const RECENT_CONVERSATIONS_PREVIEW_COUNT = HOMEPAGE_COLUMN_VISIBLE_ITEMS;
const ALL_REPOS = [
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
  ...RECENT_REPOS,
];

const prototypeMenuEntries = [
  { id: 'old-chat-start', label: 'Old Chat Start', navAction: 'old-chat-start' },
  {
    id: 'launch-from-plugin-modal',
    label: 'Launch from plugin modal',
    navAction: 'launch-from-plugin-modal',
  },
  {
    id: 'start-new-conversation-modal',
    label: 'Start New Conversation Modal',
    navAction: 'start-new-conversation-modal',
  },
  { id: 'new-chat-start', label: 'New Chat Start', navAction: 'new-chat-start' },
  { id: 'chat-components', label: 'All Chat Components', navAction: 'chat-components' },
  { id: 'sign-in-with-ad', label: 'Sign in with ad', navAction: 'sign-in-with-ad' },
  { id: 'new-user-experience', label: 'New User Experience', navAction: 'new-user-experience' },
  { id: 'new-nux', label: 'New NUX', navAction: 'new-nux' },
  { id: 'saas-credit-card', label: 'SaaS - Require Credit Card for Free Credits', navAction: 'saas-credit-card' },
  {
    id: 'user-journey-cta',
    label: 'User Journey - Create in-app call-to-actions (CTAs)',
    navAction: 'code',
  },
  { id: 'new-llm-switcher', label: 'New LLM Switcher', navAction: 'new-llm-switcher' },
  { id: 'new-llm-switcher-2', label: 'New LLM Switcher 2', navAction: 'new-llm-switcher-2' },
  { id: 'loading-screen', label: 'Loading Screen', navAction: 'loading-screen' },
];

type HomeColumnId = 'skills' | 'conversations' | 'automations';
type HomeColumnDemoMode = 'content' | 'loading' | 'empty';

const COLUMN_DEMO_ROWS = 5;
const COLUMN_DEMO_MODES: { id: HomeColumnDemoMode; label: string }[] = [
  { id: 'content', label: 'Content' },
  { id: 'loading', label: 'Skeleton' },
  { id: 'empty', label: 'Empty' },
];

function SkillsColumnSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: COLUMN_DEMO_ROWS }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 p-[14px] animate-pulse">
          <div className="flex items-center gap-2 pl-1">
            <div className="h-3 w-3 rounded bg-muted" />
            <div className="h-4 max-w-[200px] flex-1 rounded bg-muted" />
          </div>
          <div className="ml-5 h-3 w-[85%] max-w-[220px] rounded bg-muted/70" />
        </div>
      ))}
    </div>
  );
}

function ConversationsColumnSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: COLUMN_DEMO_ROWS }).map((_, i) => (
        <div key={i} className="p-[14px] animate-pulse">
          <div className="flex items-start gap-2 pl-1">
            <div className="flex h-6 w-2 shrink-0 items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-muted" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="h-6 w-[85%] rounded bg-muted" />
              <div className="flex items-center gap-1">
                <div className="h-3 w-32 max-w-[55%] rounded bg-muted/70" />
                <div className="h-4 w-14 shrink-0 rounded bg-muted/20" />
                <div className="ml-auto h-3 w-10 shrink-0 rounded bg-muted/70" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AutomationsColumnSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: COLUMN_DEMO_ROWS }).map((_, i) => (
        <div key={i} className="p-[14px] animate-pulse">
          <div className="flex items-start gap-1.5 pl-1">
            <div className="h-4 w-7 shrink-0 rounded bg-muted/70" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="h-4 w-[90%] rounded bg-muted" />
              <div className="h-3 w-full max-w-[95%] rounded bg-muted/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ColumnEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-1 px-4 py-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  theme,
  getThemeClasses,
  userName,
  variant = 'default',
  isInspectorEnabled = false,
  onInspectorToggle,
  onStartUxTour,
  uxTourLinks = [],
  isUxFlowMenuOpen,
  onUxFlowMenuOpenChange,
  onPrototypeNavItemClick,
}) => {
  const [repoInput, setRepoInput] = useState('');
  const [branchInput, setBranchInput] = useState('');
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [openRepoModalOpen, setOpenRepoModalOpen] = useState(false);
  const [startConversationModalOpen, setStartConversationModalOpen] = useState(false);
  const [openSkillLaunchModalOpen, setOpenSkillLaunchModalOpen] = useState(false);
  const [selectedHomepageSkill, setSelectedHomepageSkill] = useState<(typeof marketplaceSkills)[number] | null>(null);
  const [homeColumnModes, setHomeColumnModes] = useState<Record<HomeColumnId, HomeColumnDemoMode>>({
    skills: 'content',
    conversations: 'content',
    automations: 'content',
  });

  const filteredRecentRepos = useMemo(
    () =>
      RECENT_REPOS.filter((repo) =>
        repo.toLowerCase().includes(repoInput.trim().toLowerCase())
      ),
    [repoInput]
  );
  const filteredAllRepos = useMemo(
    () =>
      ALL_REPOS.filter(
        (repo) =>
          !RECENT_REPOS.includes(repo) &&
          repo.toLowerCase().includes(repoInput.trim().toLowerCase())
      ),
    [repoInput]
  );
  const hasRepos = filteredRecentRepos.length > 0 || filteredAllRepos.length > 0;

  const handleRepoSelect = useCallback(
    (repo: string) => {
      setRepoInput(repo);
      setBranchInput('main');
      setRepoDropdownOpen(false);
      setBranchDropdownOpen(false);
    },
    []
  );

  const handleBranchSelect = useCallback((branch: string) => {
    setBranchInput(branch);
    setBranchDropdownOpen(false);
  }, []);

  const recommendedAutomations = useMemo(
    () =>
      [
        {
          id: 'automation-1',
          automationId: 'auto-cross-repo-release-readiness',
          title: 'Daily dependency health check',
          description: 'Scan package updates and open a conversation when risk is detected.',
          repo: 'FraterCCCLXIII/pr-navigator',
        },
        {
          id: 'automation-2',
          automationId: 'auto-security-pass',
          title: 'Nightly flaky test triage',
          description: 'Review failing CI runs and summarize the likely root cause.',
          repo: 'acme/web-app',
        },
        {
          id: 'automation-3',
          automationId: 'auto-weekly-release',
          title: 'Release notes draft',
          description: 'Generate a changelog from merged PRs every Friday.',
          repo: 'acme/web-app',
        },
        {
          id: 'automation-4',
          automationId: 'auto-docs-sync',
          title: 'Design token drift audit',
          description: 'Flag hardcoded styles and token mismatches before review.',
          repo: 'acme/design-system',
        },
        {
          id: 'automation-5',
          automationId: 'auto-webhook-ops',
          title: 'Backlog grooming summary',
          description: 'Collect stale issues and suggest the next automation candidates.',
          repo: 'FraterCCCLXIII/chatrtk',
        },
      ] as const,
    []
  );

  const featuredSkills = useMemo(() => marketplaceSkills.slice(0, HOMEPAGE_COLUMN_VISIBLE_ITEMS), []);
  const recentConversationPreview = useMemo(
    () => conversationSummaries.slice(0, RECENT_CONVERSATIONS_PREVIEW_COUNT),
    []
  );
  const firstRunningPreviewIndex = useMemo(
    () => recentConversationPreview.findIndex((c) => c.status === 'running'),
    [recentConversationPreview]
  );

  const handleNavigateToSkills = useCallback(() => {
    navigateAppRoute('/extensions/all');
  }, []);

  const handleGoAutomations = useCallback(() => {
    navigateAppRoute('/automations');
  }, []);

  const handleGoApiKeys = useCallback(() => {
    navigateAppRoute('/settings/api-keys');
  }, []);

  const handleLaunch = useCallback(() => {
    const repo = repoInput.trim();
    const branch = branchInput.trim();
    if (!repo || !branch) return;
    setOpenRepoModalOpen(false);
    navigateAppRoute(
      buildChatRoute({
        repository: 'connected',
        repo,
        branch,
      })
    );
  }, [branchInput, repoInput]);

  const handleStartNewConversation = useCallback(() => {
    navigateAppRoute(buildChatRoute({ repository: 'disconnected', canvas: 'closed' }));
  }, []);

  const handleOpenSkillLaunchModal = useCallback((skill: (typeof marketplaceSkills)[number]) => {
    setSelectedHomepageSkill(skill);
    setOpenSkillLaunchModalOpen(true);
  }, []);

  const handleLaunchSkillWithRepository = useCallback(() => {
    if (!selectedHomepageSkill) return;
    const repo = repoInput.trim();
    const branch = branchInput.trim();
    if (!repo || !branch) return;
    setOpenSkillLaunchModalOpen(false);
    navigateAppRoute(
      buildChatRoute({
        repository: 'connected',
        skillName: selectedHomepageSkill.skillName ?? selectedHomepageSkill.title,
        repo,
        branch,
      })
    );
  }, [branchInput, repoInput, selectedHomepageSkill]);

  const handleLaunchSkillWithoutRepository = useCallback(() => {
    if (!selectedHomepageSkill) return;
    setOpenSkillLaunchModalOpen(false);
    navigateAppRoute(
      buildChatRoute({
        repository: 'disconnected',
        skillName: selectedHomepageSkill.skillName ?? selectedHomepageSkill.title,
        canvas: 'closed',
      })
    );
  }, [selectedHomepageSkill]);

  return (
    <div className={`flex-1 relative overflow-visible min-h-screen ${getThemeClasses('bg')} ${getThemeClasses('scrollbar')}`}>
      <span className="sr-only">{userName}</span>
      <span className="sr-only">{theme}</span>
      <div className="px-0 pt-4 bg-transparent min-h-screen flex flex-col pt-[35px] rounded-xl lg:px-[42px] lg:pt-[42px] pb-8">
        <header className="flex flex-col items-center gap-12">
          <div
            className={`relative w-fit flex flex-col md:flex-row items-start md:items-center justify-center gap-1 rounded-lg border border-border bg-card px-4 py-3 text-foreground text-sm font-normal shadow-lg pr-10 transition-opacity duration-200 ease-out ${
              showGettingStarted ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden={!showGettingStarted}
          >
            <span>New around here? Not sure where to start?</span>
            <a
              href="https://docs.all-hands.dev/usage/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-foreground inline-flex items-center gap-1"
            >
              Click here
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => setShowGettingStarted(false)}
              data-tour-id="welcome.dismiss-getting-started"
              className="absolute right-0 top-0 inline-flex h-7 w-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Dismiss getting started prompt"
            >
              ×
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center">
        <div className="pt-[25px] flex justify-center">
          <div className="flex flex-col gap-5 px-6 sm:max-w-full sm:min-w-full md:flex-row lg:px-0 lg:max-w-[960px] lg:min-w-[960px]">
            {variant === 'chat-start' || variant === 'new-chat-start' || variant === 'old-chat-start' ? (
              <>
                {variant === 'old-chat-start' ? (
                  <button
                    type="button"
                    onClick={handleNavigateToSkills}
                    className="w-full flex flex-col rounded-xl p-[24px] border border-border bg-secondary/80 relative gap-[10px] overflow-visible hover:bg-muted/60 transition-colors text-left"
                  >
                    <Bot className="w-5 h-5 text-foreground shrink-0" />
                    <span className="text-base font-bold text-foreground leading-5">Start a conversation with a skill</span>
                    <span className="text-sm text-muted-foreground">
                      Use specialized skills to accelerate your workflow.
                    </span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    if (variant === 'chat-start') {
                      setStartConversationModalOpen(true);
                    } else {
                      setOpenRepoModalOpen(true);
                    }
                  }}
                  className="w-full flex flex-col rounded-xl p-[24px] border border-border bg-secondary/80 relative gap-[10px] overflow-visible hover:bg-muted/60 transition-colors text-left"
                >
                  {variant === 'chat-start' ? (
                    <Plus className="w-5 h-5 text-foreground shrink-0" />
                  ) : (
                    <Folder className="w-5 h-5 text-foreground shrink-0" />
                  )}
                  <span className="text-base font-bold text-foreground leading-5">
                    {variant === 'chat-start' ? 'Start Conversation' : 'Open Repository'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {variant === 'chat-start'
                      ? 'Start a new conversation with an optional prompt and linked repositories.'
                      : 'Select or insert a URL to open an existing repository.'}
                  </span>
                </button>

                {variant !== 'chat-start' ? (
                  <button
                    type="button"
                    onClick={handleStartNewConversation}
                    className="w-full flex flex-col rounded-xl p-[24px] border border-border bg-secondary/80 relative gap-[10px] overflow-visible hover:bg-muted/60 transition-colors text-left"
                  >
                    <Plus className="w-5 h-5 text-foreground shrink-0" />
                    <span className="text-base font-bold text-foreground leading-5">Start from Scratch</span>
                    <span className="text-sm text-muted-foreground">
                      Start a new conversation that is not connected to an existing repository.
                    </span>
                  </button>
                ) : null}

                {variant === 'chat-start' || variant === 'new-chat-start' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleGoAutomations}
                      className="w-full flex flex-col rounded-xl p-[24px] border border-border bg-secondary/80 relative gap-[10px] overflow-visible hover:bg-muted/60 transition-colors text-left"
                    >
                      <AutomationGlyph className="h-5 w-5 text-foreground shrink-0" />
                      <span className="text-base font-bold text-foreground leading-5">Create an Automation</span>
                      <span className="text-sm text-muted-foreground">
                        Setup a scheduled or trigger-based workflow in minutes.
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGoApiKeys}
                      className="w-full flex flex-col rounded-xl p-[24px] border border-border bg-secondary/80 relative gap-[10px] overflow-visible hover:bg-muted/60 transition-colors text-left"
                    >
                      <Key className="w-5 h-5 text-foreground shrink-0" />
                      <span className="text-base font-bold text-foreground leading-5">Get an API Key</span>
                      <span className="text-sm text-muted-foreground">
                        Run your SDK-based agents in OpenHands Cloud sandboxes.
                      </span>
                    </button>
                  </>
                ) : null}

                <Dialog open={openRepoModalOpen} onOpenChange={setOpenRepoModalOpen}>
                  <DialogContent className="border-border sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Folder className="w-5 h-5" />
                        Open Repository
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 pt-2">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-foreground">Select or insert a URL</span>
                        <div className="relative">
                          <Popover open={repoDropdownOpen} onOpenChange={setRepoDropdownOpen}>
                            <PopoverTrigger asChild>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground">
                                  <Github className="w-4 h-4" />
                                </div>
                                <input
                                  placeholder="user/repo"
                                  className="w-full h-10 px-4 border border-border rounded-md shadow-none bg-muted/40 hover:bg-muted/60 transition-colors text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 pl-10 pr-10 text-sm"
                                  value={repoInput}
                                  onChange={(e) => setRepoInput(e.target.value)}
                                  aria-expanded={repoDropdownOpen}
                                  aria-haspopup="listbox"
                                  role="combobox"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                  <ChevronDown
                                    className={`w-4 h-4 text-muted-foreground transition-transform ${repoDropdownOpen ? 'rotate-180' : ''}`}
                                  />
                                </div>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent
                              portalled={false}
                              className="w-[var(--radix-popover-trigger-width)] p-0 border border-border bg-card rounded-lg shadow-md mt-1 z-[99999] max-h-60 flex flex-col overflow-hidden"
                              align="start"
                              sideOffset={4}
                              onOpenAutoFocus={(e) => e.preventDefault()}
                            >
                              {hasRepos ? (
                                <ul
                                  role="listbox"
                                  className="w-full flex-1 min-h-0 overflow-y-auto p-1 repo-dropdown-scroll"
                                >
                                  {filteredRecentRepos.length > 0 && (
                                    <>
                                      <div className="px-2 py-1.5">
                                        <span className="text-xs font-semibold text-muted-foreground">Most Recent</span>
                                      </div>
                                      {filteredRecentRepos.map((repo) => (
                                        <li
                                          key={repo}
                                          role="option"
                                          tabIndex={-1}
                                          className="px-2 py-2 cursor-pointer text-sm rounded-md my-0.5 text-foreground hover:bg-muted/60"
                                          onClick={() => handleRepoSelect(repo)}
                                        >
                                          <span className="font-medium">{repo}</span>
                                        </li>
                                      ))}
                                      {filteredAllRepos.length > 0 && <div className="border-t border-border my-1" />}
                                    </>
                                  )}
                                  {filteredAllRepos.length > 0 && (
                                    <>
                                      {filteredRecentRepos.length === 0 && (
                                        <div className="px-2 py-1.5">
                                          <span className="text-xs font-semibold text-muted-foreground">All Repositories</span>
                                        </div>
                                      )}
                                      {filteredAllRepos.map((repo) => (
                                        <li
                                          key={repo}
                                          role="option"
                                          tabIndex={-1}
                                          className="px-2 py-2 cursor-pointer text-sm rounded-md my-0.5 text-foreground hover:bg-muted/60"
                                          onClick={() => handleRepoSelect(repo)}
                                        >
                                          <span className="font-medium">{repo}</span>
                                        </li>
                                      ))}
                                    </>
                                  )}
                                </ul>
                              ) : (
                                <div className="px-2 py-3 text-sm text-muted-foreground">No repositories found</div>
                              )}
                              <div className="flex-shrink-0 border-t border-border p-1">
                                <a
                                  href="https://github.com/apps/openhands-ai/installations/new"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center w-full px-2 py-2 text-sm text-foreground hover:bg-muted/60 rounded-md"
                                >
                                  + Add GitHub Repos
                                </a>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="relative">
                        <Popover open={branchDropdownOpen} onOpenChange={setBranchDropdownOpen}>
                          <PopoverTrigger asChild>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground">
                                <GitBranch className="w-4 h-4" />
                              </div>
                              <input
                                placeholder="Select branch..."
                                disabled={!repoInput}
                                readOnly
                                className="w-full h-10 cursor-pointer px-4 border border-border rounded-md shadow-none bg-muted/40 hover:bg-muted/60 transition-colors text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 disabled:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60 pl-10 pr-10 text-sm"
                                value={branchInput}
                                aria-expanded={branchDropdownOpen}
                                aria-haspopup="listbox"
                                role="combobox"
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <ChevronDown
                                  className={`w-4 h-4 text-muted-foreground transition-transform ${branchDropdownOpen ? 'rotate-180' : ''}`}
                                />
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent
                            portalled={false}
                            className="w-[var(--radix-popover-trigger-width)] p-1 border border-border bg-card rounded-lg shadow-md mt-1 z-[99999] max-h-60 flex flex-col overflow-hidden"
                            align="start"
                            sideOffset={4}
                            onOpenAutoFocus={(e) => e.preventDefault()}
                          >
                            <ul role="listbox" className="w-full overflow-y-auto repo-dropdown-scroll">
                              {BRANCH_OPTIONS.map((branch) => (
                                <li
                                  key={branch}
                                  role="option"
                                  tabIndex={-1}
                                  className="px-2 py-2 cursor-pointer text-sm rounded-md my-0.5 text-foreground hover:bg-muted/60"
                                  onClick={() => handleBranchSelect(branch)}
                                >
                                  <span className="font-medium">{branch}</span>
                                </li>
                              ))}
                            </ul>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleLaunch();
                          setOpenRepoModalOpen(false);
                        }}
                        disabled={!repoInput || !branchInput}
                        className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/85 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors w-full"
                      >
                        Launch
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
                <StartNewConversationDialog
                  open={startConversationModalOpen}
                  onOpenChange={setStartConversationModalOpen}
                />
                {variant === 'chat-start' ? (
                  <Dialog open={openSkillLaunchModalOpen} onOpenChange={setOpenSkillLaunchModalOpen}>
                    <DialogContent className="border-border sm:max-w-[480px]">
                      <DialogHeader>
                        <DialogTitle>Launch Skill</DialogTitle>
                      </DialogHeader>
                      {selectedHomepageSkill ? (
                        <div className="flex flex-col gap-4 pt-2">
                          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <SkillIcon className="h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">
                                {selectedHomepageSkill.skillName ?? selectedHomepageSkill.title}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{selectedHomepageSkill.description}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-sm text-foreground">Select an existing repository</span>
                            <div className="relative">
                              <Popover open={repoDropdownOpen} onOpenChange={setRepoDropdownOpen}>
                                <PopoverTrigger asChild>
                                  <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground">
                                      <Github className="w-4 h-4" />
                                    </div>
                                    <input
                                      placeholder="user/repo"
                                      className="w-full h-10 px-4 border border-border rounded-md shadow-none bg-muted/40 hover:bg-muted/60 transition-colors text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 pl-10 pr-10 text-sm"
                                      value={repoInput}
                                      onChange={(e) => setRepoInput(e.target.value)}
                                      aria-expanded={repoDropdownOpen}
                                      aria-haspopup="listbox"
                                      role="combobox"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                      <ChevronDown
                                        className={`w-4 h-4 text-muted-foreground transition-transform ${repoDropdownOpen ? 'rotate-180' : ''}`}
                                      />
                                    </div>
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent
                                  portalled={false}
                                  className="w-[var(--radix-popover-trigger-width)] p-0 border border-border bg-card rounded-lg shadow-md mt-1 z-[99999] max-h-60 flex flex-col overflow-hidden"
                                  align="start"
                                  sideOffset={4}
                                  onOpenAutoFocus={(e) => e.preventDefault()}
                                >
                                  {hasRepos ? (
                                    <ul
                                      role="listbox"
                                      className="w-full flex-1 min-h-0 overflow-y-auto p-1 repo-dropdown-scroll"
                                    >
                                      {filteredRecentRepos.length > 0 && (
                                        <>
                                          <div className="px-2 py-1.5">
                                            <span className="text-xs font-semibold text-muted-foreground">Most Recent</span>
                                          </div>
                                          {filteredRecentRepos.map((repo) => (
                                            <li
                                              key={repo}
                                              role="option"
                                              tabIndex={-1}
                                              className="px-2 py-2 cursor-pointer text-sm rounded-md my-0.5 text-foreground hover:bg-muted/60"
                                              onClick={() => handleRepoSelect(repo)}
                                            >
                                              <span className="font-medium">{repo}</span>
                                            </li>
                                          ))}
                                          {filteredAllRepos.length > 0 && <div className="border-t border-border my-1" />}
                                        </>
                                      )}
                                      {filteredAllRepos.length > 0 && (
                                        <>
                                          {filteredRecentRepos.length === 0 && (
                                            <div className="px-2 py-1.5">
                                              <span className="text-xs font-semibold text-muted-foreground">All Repositories</span>
                                            </div>
                                          )}
                                          {filteredAllRepos.map((repo) => (
                                            <li
                                              key={repo}
                                              role="option"
                                              tabIndex={-1}
                                              className="px-2 py-2 cursor-pointer text-sm rounded-md my-0.5 text-foreground hover:bg-muted/60"
                                              onClick={() => handleRepoSelect(repo)}
                                            >
                                              <span className="font-medium">{repo}</span>
                                            </li>
                                          ))}
                                        </>
                                      )}
                                    </ul>
                                  ) : (
                                    <div className="px-2 py-3 text-sm text-muted-foreground">No repositories found</div>
                                  )}
                                  <div className="flex-shrink-0 border-t border-border p-1">
                                    <a
                                      href="https://github.com/apps/openhands-ai/installations/new"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center w-full px-2 py-2 text-sm text-foreground hover:bg-muted/60 rounded-md"
                                    >
                                      + Add GitHub Repos
                                    </a>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          <div className="relative">
                            <Popover open={branchDropdownOpen} onOpenChange={setBranchDropdownOpen}>
                              <PopoverTrigger asChild>
                                <div className="relative">
                                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground">
                                    <GitBranch className="w-4 h-4" />
                                  </div>
                                  <input
                                    placeholder="Select branch..."
                                    disabled={!repoInput}
                                    readOnly
                                    className="w-full h-10 cursor-pointer px-4 border border-border rounded-md shadow-none bg-muted/40 hover:bg-muted/60 transition-colors text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 disabled:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60 pl-10 pr-10 text-sm"
                                    value={branchInput}
                                    aria-expanded={branchDropdownOpen}
                                    aria-haspopup="listbox"
                                    role="combobox"
                                  />
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <ChevronDown
                                      className={`w-4 h-4 text-muted-foreground transition-transform ${branchDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                  </div>
                                </div>
                              </PopoverTrigger>
                              <PopoverContent
                                portalled={false}
                                className="w-[var(--radix-popover-trigger-width)] p-1 border border-border bg-card rounded-lg shadow-md mt-1 z-[99999] max-h-60 flex flex-col overflow-hidden"
                                align="start"
                                sideOffset={4}
                                onOpenAutoFocus={(e) => e.preventDefault()}
                              >
                                <ul role="listbox" className="w-full overflow-y-auto repo-dropdown-scroll">
                                  {BRANCH_OPTIONS.map((branch) => (
                                    <li
                                      key={branch}
                                      role="option"
                                      tabIndex={-1}
                                      className="px-2 py-2 cursor-pointer text-sm rounded-md my-0.5 text-foreground hover:bg-muted/60"
                                      onClick={() => handleBranchSelect(branch)}
                                    >
                                      <span className="font-medium">{branch}</span>
                                    </li>
                                  ))}
                                </ul>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <button
                            type="button"
                            onClick={handleLaunchSkillWithRepository}
                            disabled={!repoInput || !branchInput}
                            className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/85 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors w-full"
                          >
                            Launch with Repository
                          </button>
                          <div className="relative flex items-center justify-center py-1">
                            <div className="absolute inset-x-0 h-px bg-border" />
                            <span className="relative bg-card px-3 text-xs uppercase tracking-wide text-muted-foreground">or</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleLaunchSkillWithoutRepository}
                            className="h-10 flex items-center justify-center px-4 text-sm rounded-md border border-border bg-transparent text-foreground hover:bg-muted/60 cursor-pointer transition-colors w-full"
                          >
                            Start New Conversation Without Repo
                          </button>
                        </div>
                      ) : null}
                    </DialogContent>
                  </Dialog>
                ) : null}
              </>
            ) : (
              <>
                <div className="w-full flex flex-col rounded-xl p-[24px] border border-border bg-secondary/80 relative gap-[10px] overflow-visible">
                  <div className="flex items-center gap-[10px] text-base font-bold text-foreground leading-5">
                    <Bot className="w-4 h-4" />
                    <span className="flex items-center">Start a conversation with a skill</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Use specialized skills to accelerate your workflow.
                  </span>
                  <button
                    type="button"
                    onClick={handleNavigateToSkills}
                    className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/85 cursor-pointer transition-colors w-auto absolute bottom-5 left-5 right-5"
                  >
                    Browse all
                  </button>
                </div>

                <section className="w-full flex flex-col gap-6 rounded-xl p-[24px] border border-border bg-secondary/80 relative overflow-visible">
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[10px] pb-4">
                    <Folder className="w-5 h-5 text-foreground" />
                    <span className="leading-5 font-bold text-base text-foreground">Open Repository</span>
                  </div>
                </div>
                <div className="flex flex-col gap-[10px] pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Select or insert a URL</span>
                  </div>
                  <div className="relative max-w-auto">
                    <Popover open={repoDropdownOpen} onOpenChange={setRepoDropdownOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground">
                            <Github className="w-4 h-4" />
                          </div>
                          <input
                            placeholder="user/repo"
                            className="w-full h-10 px-4 border border-border rounded-md shadow-none bg-muted/40 hover:bg-muted/60 transition-colors text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 pl-10 pr-10 text-sm"
                            value={repoInput}
                            onChange={(event) => setRepoInput(event.target.value)}
                            aria-expanded={repoDropdownOpen}
                            aria-haspopup="listbox"
                            aria-autocomplete="list"
                            role="combobox"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                            <button
                              type="button"
                              aria-label="Toggle menu"
                              onClick={(e) => {
                              e.stopPropagation();
                              setRepoDropdownOpen((prev) => !prev);
                            }}
                              className="text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${repoDropdownOpen ? 'rotate-180' : ''}`}
                              />
                            </button>
                          </div>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0 border border-border bg-card rounded-lg shadow-md mt-1 z-[9999] max-h-60 flex flex-col overflow-hidden"
                        align="start"
                        sideOffset={4}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        {hasRepos ? (
                          <ul
                            role="listbox"
                            className="w-full flex-1 min-h-0 overflow-y-auto p-1 repo-dropdown-scroll"
                            data-testid="git-repo-dropdown-menu"
                          >
                            {filteredRecentRepos.length > 0 && (
                              <>
                                <div className="px-2 py-1.5">
                                  <span className="text-xs font-semibold leading-4 text-muted-foreground">
                                    Most Recent
                                  </span>
                                </div>
                                {filteredRecentRepos.map((repo) => (
                                  <li
                                    key={repo}
                                    role="option"
                                    tabIndex={-1}
                                    className="px-2 py-2 cursor-pointer text-sm rounded-md my-0.5 text-foreground font-normal hover:bg-muted/60 focus:outline-none focus:bg-muted/60"
                                    onClick={() => handleRepoSelect(repo)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleRepoSelect(repo);
                                      }
                                    }}
                                  >
                                    <span className="font-medium">{repo}</span>
                                  </li>
                                ))}
                                {filteredAllRepos.length > 0 && (
                                  <div className="border-t border-border my-1" />
                                )}
                              </>
                            )}
                            {filteredAllRepos.length > 0 && (
                              <>
                                {filteredRecentRepos.length === 0 && (
                                  <div className="px-2 py-1.5">
                                    <span className="text-xs font-semibold leading-4 text-muted-foreground">
                                      All Repositories
                                    </span>
                                  </div>
                                )}
                                {filteredAllRepos.map((repo) => (
                                  <li
                                    key={repo}
                                    role="option"
                                    tabIndex={-1}
                                    className="px-2 py-2 cursor-pointer text-sm rounded-md my-0.5 text-foreground font-normal hover:bg-muted/60 focus:outline-none focus:bg-muted/60"
                                    onClick={() => handleRepoSelect(repo)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleRepoSelect(repo);
                                      }
                                    }}
                                  >
                                    <span className="font-medium">{repo}</span>
                                  </li>
                                ))}
                              </>
                            )}
                          </ul>
                        ) : (
                          <div className="px-2 py-3 text-sm text-muted-foreground">
                            No repositories found
                          </div>
                        )}
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
                    <Popover open={branchDropdownOpen} onOpenChange={setBranchDropdownOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground">
                            <GitBranch className="w-4 h-4" />
                          </div>
                          <input
                            placeholder="Select branch..."
                            disabled={!repoInput}
                            readOnly
                            className="w-full h-10 cursor-pointer px-4 border border-border rounded-md shadow-none bg-muted/40 hover:bg-muted/60 transition-colors text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 disabled:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60 pl-10 pr-10 text-sm"
                            value={branchInput}
                            aria-expanded={branchDropdownOpen}
                            aria-haspopup="listbox"
                            role="combobox"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                            <button
                              type="button"
                              aria-label="Toggle menu"
                              disabled={!repoInput}
                              className="text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${branchDropdownOpen ? 'rotate-180' : ''}`}
                              />
                            </button>
                          </div>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-1 border border-border bg-card rounded-lg shadow-md mt-1 z-[9999] max-h-60 flex flex-col overflow-hidden"
                        align="start"
                        sideOffset={4}
                        onOpenAutoFocus={(event) => event.preventDefault()}
                      >
                        <ul role="listbox" className="w-full overflow-y-auto repo-dropdown-scroll">
                          {BRANCH_OPTIONS.map((branch) => (
                            <li
                              key={branch}
                              role="option"
                              tabIndex={-1}
                              className="px-2 py-2 cursor-pointer text-sm rounded-md my-0.5 text-foreground hover:bg-muted/60"
                              onClick={() => handleBranchSelect(branch)}
                            >
                              <span className="font-medium">{branch}</span>
                            </li>
                          ))}
                        </ul>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLaunch}
                  disabled={!repoInput || !branchInput}
                  className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/85 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors w-full"
                >
                  Launch
                </button>
              </div>
            </section>

            <div className="w-full flex flex-col rounded-xl p-[24px] border border-border bg-secondary/80 relative gap-[10px] overflow-visible">
              <div className="flex items-center gap-[10px] text-base font-bold text-foreground leading-5">
                <Plus className="w-4 h-4" />
                <span className="flex items-center">Start from Scratch</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Start a new conversation that is not connected to an existing repository.
              </span>
              <button
                type="button"
                onClick={handleStartNewConversation}
                className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/85 cursor-pointer transition-colors w-auto absolute bottom-5 left-5 right-5"
              >
                New Conversation
              </button>
            </div>
              </>
            )}
          </div>
        </div>

        <div className="pt-4 flex sm:justify-start md:justify-center">
          <div className="flex flex-col gap-5 px-6 md:flex-row min-w-full md:max-w-full lg:px-0 lg:max-w-[960px] lg:min-w-[960px]">
            <section className="flex flex-1 min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-xs leading-4 text-foreground font-bold py-[14px] pl-4">Recent Conversations</h3>
              </div>
              <div className="flex flex-col min-h-0">
                <div className={HOMEPAGE_COLUMN_LIST_CLASSNAME}>
                  {homeColumnModes.conversations === 'loading' ? (
                    <ConversationsColumnSkeleton />
                  ) : homeColumnModes.conversations === 'empty' ? (
                    <ColumnEmptyState
                      title="No conversations yet"
                      description="Start a conversation to see it listed here."
                    />
                  ) : (
                    <div className="flex flex-col">
                      {recentConversationPreview.map((conversation, index) => {
                        const showRunningSpinner =
                          conversation.status === 'running' && index === firstRunningPreviewIndex;
                        return (
                          <button
                            key={conversation.id}
                            type="button"
                            onClick={() => {
                              navigateAppRoute(
                                buildChatRoute({
                                  repository: conversation.repo === 'No Repository' ? 'disconnected' : 'connected',
                                  repo: conversation.repo === 'No Repository' ? null : conversation.repo,
                                  branch: conversation.branch ?? null,
                                })
                              );
                            }}
                            className="p-[14px] cursor-pointer w-full rounded-lg hover:bg-muted/60 transition-all duration-300 text-left"
                          >
                            <div className="flex items-start gap-2 pl-1">
                              <div
                                className="relative flex h-6 w-2 shrink-0 items-center justify-center"
                                aria-hidden
                              >
                                {showRunningSpinner ? (
                                  <>
                                    <span
                                      className="pointer-events-none absolute h-3 w-3 animate-spin rounded-full border-2 border-solid border-transparent border-t-muted-foreground border-r-muted-foreground border-b-muted-foreground"
                                      aria-hidden
                                    />
                                    <span className="relative h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                                  </>
                                ) : (
                                  <div
                                    className={cn(
                                      'h-1.5 w-1.5 shrink-0 rounded-full',
                                      conversation.status === 'running' && 'bg-success',
                                      conversation.status === 'awaiting' && 'bg-warning',
                                      conversation.status === 'error' && 'bg-destructive',
                                      !conversation.status && 'bg-muted-foreground',
                                    )}
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1 flex flex-col gap-1">
                                <span className="min-w-0 whitespace-nowrap text-xs text-foreground leading-6 font-normal truncate">
                                  {conversation.name}
                                </span>
                                <div className="flex flex-row items-center gap-2 text-xs leading-4 text-muted-foreground">
                                  <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                                    <span className="min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
                                      {conversation.repo}
                                    </span>
                                    {conversation.branch ? (
                                      <span className="inline-flex shrink-0 items-center rounded bg-muted/20 px-1.5 py-px leading-none">
                                        <span className="max-w-24 whitespace-nowrap overflow-hidden text-ellipsis text-[11px] leading-none">
                                          {conversation.branch}
                                        </span>
                                      </span>
                                    ) : null}
                                  </div>
                                  <span className="ml-auto shrink-0 whitespace-nowrap">{conversation.time}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="flex flex-1 min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-xs leading-4 text-foreground font-bold py-[14px] pl-4">
                  Recommended Automations
                </h3>
              </div>
              <div className="flex flex-col min-h-0">
                <div className={HOMEPAGE_COLUMN_LIST_CLASSNAME}>
                  {homeColumnModes.automations === 'loading' ? (
                    <AutomationsColumnSkeleton />
                  ) : homeColumnModes.automations === 'empty' ? (
                    <ColumnEmptyState
                      title="No recommended automations"
                      description="Recommended automations will appear here as your workspace grows."
                    />
                  ) : (
                    <div className="flex flex-col">
                      {recommendedAutomations.map((automation) => (
                        <button
                          key={automation.id}
                          type="button"
                          onClick={() => navigateAppRoute(`/automations?automation=${automation.automationId}`)}
                          className="flex flex-col gap-1 p-[14px] cursor-pointer w-full rounded-lg hover:bg-muted/60 transition-all duration-300 text-left"
                        >
                          <div className="flex items-center gap-2 pl-1">
                            <AutomationGlyph className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="min-w-0 whitespace-nowrap text-xs text-foreground leading-6 font-normal truncate">
                              {automation.title}
                            </span>
                          </div>
                          <div className="flex w-full min-w-0 flex-nowrap items-center gap-1 overflow-hidden pl-5 text-xs leading-4 text-muted-foreground font-normal">
                            <span className="min-w-0 shrink truncate">{automation.description}</span>
                            <span className="shrink-0 text-muted-foreground/50" aria-hidden>
                              ·
                            </span>
                            <span className="min-w-0 shrink truncate">{automation.repo}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="flex flex-1 min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-xs leading-4 text-foreground font-bold py-[14px] pl-4">Recent Skills</h3>
              </div>
              <div className="flex flex-col min-h-0">
                <div className={HOMEPAGE_COLUMN_LIST_CLASSNAME}>
                  {homeColumnModes.skills === 'loading' ? (
                    <SkillsColumnSkeleton />
                  ) : homeColumnModes.skills === 'empty' ? (
                    <ColumnEmptyState
                      title="No skills yet"
                      description="Browse extensions to add skills to your workspace."
                    />
                  ) : (
                    <div className="flex flex-col">
                      {featuredSkills.map((skill) => {
                        return (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => handleOpenSkillLaunchModal(skill)}
                            className="flex flex-col gap-1 p-[14px] cursor-pointer w-full rounded-lg hover:bg-muted/60 transition-all duration-300 text-left"
                          >
                            <div className="flex items-center gap-2 pl-1">
                              <SkillIcon className="h-3 text-muted-foreground" />
                              <span className="min-w-0 whitespace-nowrap text-xs text-foreground leading-6 font-normal truncate">
                                {skill.skillName ?? skill.title}
                              </span>
                            </div>
                            <span className="block min-w-0 whitespace-nowrap text-xs text-muted-foreground leading-4 font-normal pl-5 truncate">
                              {skill.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>
            {/* Suggested Tasks column intentionally removed from the home layout. */}
          </div>
        </div>
        </main>
      </div>

      {variant === 'chat-start' ? (
        <>
          <Popover open={isUxFlowMenuOpen} onOpenChange={onUxFlowMenuOpenChange}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="fixed bottom-20 right-7 z-[60] shrink-0 outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-8 h-8 rounded-lg flex items-center justify-center bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent transition-colors border border-transparent hover:border-border"
                aria-label="UX flow tutorials"
                data-tour-id="left-nav.ux-flow-icon"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="left"
              align="end"
              sideOffset={8}
              className="bg-sidebar text-sidebar-foreground border border-border rounded-xl w-56 p-3"
            >
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                UX Flows
              </div>
              {uxTourLinks.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  No UX tours available yet.
                </div>
              ) : (
                uxTourLinks.map((tour) => (
                  <button
                    key={tour.id}
                    type="button"
                    onClick={() => {
                      onUxFlowMenuOpenChange?.(false);
                      onStartUxTour?.(tour.id);
                    }}
                    className="inline-flex items-center gap-2 text-sm text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-2 transition-colors text-left"
                  >
                    {tour.label}
                  </button>
                ))
              )}
              <div className="mt-3 border-t border-border pt-2">
                <div className="px-1 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Prototypes
                </div>
                {prototypeMenuEntries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      onUxFlowMenuOpenChange?.(false);
                      onPrototypeNavItemClick?.(entry.navAction);
                    }}
                    className="inline-flex items-center gap-2 text-sm text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-2 transition-colors text-left"
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Inspector mode
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Click any element to view code.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isInspectorEnabled}
                    data-testid="inspector-toggle"
                    data-tour-id="left-nav.inspector-toggle"
                    onClick={onInspectorToggle}
                    className={`h-6 w-10 rounded-full border border-border flex items-center px-0.5 transition-colors ${
                      isInspectorEnabled ? 'bg-foreground/80' : 'bg-muted/60'
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-background shadow transition-transform ${
                        isInspectorEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="fixed bottom-6 right-6 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Column list demo states"
                data-testid="chat-start-column-demo"
              >
                <Settings className="h-5 w-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" sideOffset={8} className="w-80 border-border bg-card p-3">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-muted-foreground">Home columns (prototype)</p>
              {(
                [
                  { id: 'skills' as const, label: 'Recent Skills' },
                  { id: 'conversations' as const, label: 'Recent Conversations' },
                  { id: 'automations' as const, label: 'Recommended Automations' },
                ] as const
              ).map(({ id, label }) => (
                <div key={id} className="space-y-1.5">
                  <div className="text-xs font-medium text-foreground">{label}</div>
                  <div className="flex gap-1">
                    {COLUMN_DEMO_MODES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setHomeColumnModes((prev) => ({ ...prev, [id]: m.id }))}
                        className={cn(
                          'flex-1 rounded-md px-2 py-1.5 text-xs transition-colors',
                          homeColumnModes[id] === m.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            </PopoverContent>
          </Popover>
        </>
      ) : null}
    </div>
  );
}; 
