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
} from 'lucide-react';
import { AutomationGlyph } from '../icons/AutomationGlyph';
import { SkillIcon } from '../icons/SkillIcon';
import { ThemeElement } from '../../types/theme';
import { conversationSummaries } from '../../data/conversations';
import { marketplaceSkills } from '../../data/skillsPageData';
import { navigateAppRoute } from '../../lib/captureNavigation';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
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
  variant?: 'default' | 'chat-start' | 'new-chat-start';
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
const HOMEPAGE_COLUMN_LIST_CLASSNAME =
  'h-[360px] max-h-[calc(100vh-420px)] overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out';
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

type HomeColumnId = 'skills' | 'conversations' | 'tasks';
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
        <div key={i} className="flex flex-col gap-2 p-[14px] animate-pulse">
          <div className="flex items-center gap-2 pl-1">
            <div className="h-1.5 w-1.5 rounded-full bg-muted" />
            <div className="h-4 flex-1 rounded bg-muted" />
          </div>
          <div className="flex items-center justify-between gap-3 pl-1">
            <div className="h-3 w-32 rounded bg-muted/70" />
            <div className="h-3 w-10 rounded bg-muted/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksColumnSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: COLUMN_DEMO_ROWS }).map((_, i) => (
        <div key={i} className="p-[14px] animate-pulse">
          <div className="flex gap-2">
            <div className="h-3 w-8 rounded bg-muted/70" />
            <div className="h-4 flex-1 rounded bg-muted" />
          </div>
          <div className="mt-2 flex items-center gap-2 pl-10">
            <div className="h-3 w-3 rounded bg-muted/70" />
            <div className="h-3 w-48 max-w-full rounded bg-muted/60" />
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
}) => {
  const [repoInput, setRepoInput] = useState('');
  const [branchInput, setBranchInput] = useState('');
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [openRepoModalOpen, setOpenRepoModalOpen] = useState(false);
  const [openSkillLaunchModalOpen, setOpenSkillLaunchModalOpen] = useState(false);
  const [selectedHomepageSkill, setSelectedHomepageSkill] = useState<(typeof marketplaceSkills)[number] | null>(null);
  const [homeColumnModes, setHomeColumnModes] = useState<Record<HomeColumnId, HomeColumnDemoMode>>({
    skills: 'content',
    conversations: 'content',
    tasks: 'content',
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

  const suggestedTasks = useMemo(
    () => [
      {
        id: '#5',
        title: 'Resolve merge conflicts',
        subtitle: 'Ai interact 2',
        repo: 'FraterCCCLXIII/chatrtk',
      },
      {
        id: '#1',
        title: 'Resolve merge conflicts',
        subtitle: 'Fix LM Studio CORS issues with proxy server',
        repo: 'FraterCCCLXIII/chatrtk',
      },
      {
        id: '#7',
        title: 'Audit auth edge cases',
        subtitle: 'Harden the session expiry and refresh flow',
        repo: 'acme/web-app',
      },
      {
        id: '#12',
        title: 'Polish token usage in nav shell',
        subtitle: 'Replace hardcoded values with semantic tokens',
        repo: 'acme/design-system',
      },
      {
        id: '#19',
        title: 'Stabilize flaky onboarding checks',
        subtitle: 'Triage test instability in CI before release',
        repo: 'FraterCCCLXIII/pr-navigator',
      },
    ],
    []
  );

  const featuredSkills = useMemo(() => marketplaceSkills.slice(0, HOMEPAGE_COLUMN_VISIBLE_ITEMS), []);
  const recentConversationPreview = useMemo(
    () => conversationSummaries.slice(0, RECENT_CONVERSATIONS_PREVIEW_COUNT),
    []
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
          <div className="h-[80px] flex items-center">
            <h1 className="text-[32px] text-foreground font-bold leading-5 tracking-[-1px]">Let&apos;s Start Building!</h1>
          </div>
        </header>

        <div className="pt-[25px] flex justify-center">
          <div className="flex flex-col gap-5 px-6 sm:max-w-full sm:min-w-full md:flex-row lg:px-0 lg:max-w-[960px] lg:min-w-[960px]">
            {variant === 'chat-start' || variant === 'new-chat-start' ? (
              <>
                {variant === 'chat-start' ? (
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
                  onClick={() => setOpenRepoModalOpen(true)}
                  className="w-full flex flex-col rounded-xl p-[24px] border border-border bg-secondary/80 relative gap-[10px] overflow-visible hover:bg-muted/60 transition-colors text-left"
                >
                  <Folder className="w-5 h-5 text-foreground shrink-0" />
                  <span className="text-base font-bold text-foreground leading-5">Open Repository</span>
                  <span className="text-sm text-muted-foreground">
                    Select or insert a URL to open an existing repository.
                  </span>
                </button>

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

                {variant === 'new-chat-start' ? (
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
                      {recentConversationPreview.map((conversation) => (
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
                          className="flex flex-col gap-1 p-[14px] cursor-pointer w-full rounded-lg hover:bg-muted/60 transition-all duration-300 text-left"
                        >
                          <div className="flex items-center gap-2 pl-1">
                            <div className="inline-flex">
                              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            </div>
                            <span className="min-w-0 whitespace-nowrap text-xs text-foreground leading-6 font-normal truncate">
                              {conversation.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground leading-4 font-normal">
                            <div className="flex min-w-0 flex-nowrap items-center gap-3 overflow-hidden">
                              <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden">
                                <Github className="w-3 h-3" />
                                <span className="min-w-0 whitespace-nowrap truncate">{conversation.repo}</span>
                              </div>
                              {conversation.branch ? (
                                <div className="flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
                                  <GitBranch className="w-3 h-3" />
                                  <span className="min-w-0 whitespace-nowrap truncate">{conversation.branch}</span>
                                </div>
                              ) : null}
                            </div>
                            <span className="shrink-0 whitespace-nowrap">{conversation.time}</span>
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
                <h3 className="text-xs leading-4 text-foreground font-bold py-[14px] pl-4">
                  Suggested Tasks
                </h3>
              </div>
              <div className="flex flex-col min-h-0">
                <div className={HOMEPAGE_COLUMN_LIST_CLASSNAME}>
                  {homeColumnModes.tasks === 'loading' ? (
                    <TasksColumnSkeleton />
                  ) : homeColumnModes.tasks === 'empty' ? (
                    <ColumnEmptyState
                      title="No suggested tasks"
                      description="When your agent has follow-ups, they will appear here."
                    />
                  ) : (
                    <div className="flex flex-col">
                      {suggestedTasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          className="w-full p-[14px] text-left flex items-center justify-between cursor-pointer rounded-lg transition-all duration-300 hover:bg-muted/60"
                        >
                          <div className="flex items-start gap-3 min-w-0 w-full">
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground leading-4 font-normal">
                                  {task.id}
                                </span>
                                <span className="min-w-0 whitespace-nowrap text-xs text-foreground leading-6 font-normal truncate">
                                  {task.title}
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden text-xs text-muted-foreground leading-4 font-normal">
                                <Github className="w-3 h-3 shrink-0" />
                                <span className="min-w-0 whitespace-nowrap truncate">
                                  {task.repo} / {task.subtitle}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {variant === 'chat-start' ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="fixed bottom-6 right-6 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Column list demo states"
              data-testid="chat-start-column-demo"
            >
              <Settings className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" sideOffset={8} className="w-80 border-border bg-card p-3">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-muted-foreground">Home columns (prototype)</p>
              {(
                [
                  { id: 'skills' as const, label: 'Recent Skills' },
                  { id: 'conversations' as const, label: 'Recent Conversations' },
                  { id: 'tasks' as const, label: 'Suggested Tasks' },
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
      ) : null}
    </div>
  );
}; 
