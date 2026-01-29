import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown, ExternalLink, Folder, GitBranch, Github, Plus } from 'lucide-react';
import { ThemeElement } from '../../types/theme';
import { conversationSummaries } from '../../data/conversations';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface WelcomeScreenProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  userName: string;
  onRepoSelect: (repo: string) => void;
  onBranchSelect: (branch: string) => void;
  onCreateNewRepo: () => void;
  onClose: () => void;
}

const RECENT_REPOS = ['FraterCCCLXIII/All-Hands-UI-XP', 'FraterCCCLXIII/pr-navigator', 'FraterCCCLXIII/All-Hands-UI'];
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

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  theme,
  getThemeClasses,
  userName,
  onRepoSelect,
  onBranchSelect,
  onCreateNewRepo,
  onClose,
}) => {
  const [repoInput, setRepoInput] = useState('');
  const [branchInput, setBranchInput] = useState('');
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);

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
    },
    []
  );

  const suggestedTasks = useMemo(
    () => [
      { id: '#5', title: 'Resolve merge conflicts', subtitle: 'Ai interact 2' },
      { id: '#1', title: 'Resolve merge conflicts', subtitle: 'Fix LM Studio CORS issues with proxy server' },
    ],
    []
  );

  const handleLaunch = () => {
    const repo = repoInput.trim();
    const branch = branchInput.trim();
    if (!repo || !branch) return;
    onRepoSelect(repo);
    onBranchSelect(branch);
    onClose();
  };

  const handleCreateNewRepo = () => {
    onCreateNewRepo();
    onClose();
  };

  return (
    <div className={`flex-1 relative overflow-visible min-h-screen ${getThemeClasses('bg')} ${getThemeClasses('scrollbar')}`}>
      <span className="sr-only">{userName}</span>
      <span className="sr-only">{theme}</span>
      <div className="px-0 pt-4 bg-transparent min-h-screen flex flex-col pt-[35px] rounded-xl lg:px-[42px] lg:pt-[42px] pb-8">
        <header className="flex flex-col items-center gap-12">
          <div className="w-fit flex flex-col md:flex-row items-start md:items-center justify-center gap-1 rounded-[12px] bg-muted text-foreground text-sm font-normal m-1 md:h-9.5 px-4 pb-1 md:px-[15px] md:py-0 border border-border">
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
          </div>
          <div className="h-[80px] flex items-center">
            <h1 className="text-[32px] text-foreground font-bold leading-5 tracking-[-1px]">Let&apos;s Start Building!</h1>
          </div>
        </header>

        <div className="pt-[25px] flex justify-center">
          <div className="flex flex-col gap-5 px-6 sm:max-w-full sm:min-w-full md:flex-row lg:px-0 lg:max-w-[960px] lg:min-w-[960px]">
            <section className="w-full flex flex-col gap-6 rounded-[12px] p-[24px] border border-border bg-card relative overflow-visible">
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
                            className="w-full h-10 px-4 border border-border rounded-md shadow-none bg-muted/40 hover:bg-muted/60 transition-colors text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pl-10 pr-10 text-sm"
                            value={repoInput}
                            onChange={(event) => setRepoInput(event.target.value)}
                            onFocus={() => setRepoDropdownOpen(true)}
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
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground">
                        <GitBranch className="w-4 h-4" />
                      </div>
                      <input
                        placeholder="Select branch..."
                        disabled={!repoInput}
                        className="w-full h-10 px-4 border border-border rounded-md shadow-none bg-muted/40 hover:bg-muted/60 transition-colors text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60 pl-10 pr-10 text-sm"
                        value={branchInput}
                        onChange={(event) => setBranchInput(event.target.value)}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                        <button
                          type="button"
                          aria-label="Toggle menu"
                          disabled={!repoInput}
                          className="text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLaunch}
                  disabled={!repoInput || !branchInput}
                  className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors w-full"
                >
                  Launch
                </button>
              </div>
            </section>

            <div className="w-full flex flex-col rounded-[12px] p-[24px] border border-border bg-card relative gap-[10px] overflow-visible">
              <div className="flex items-center gap-[10px] text-base font-bold text-foreground leading-5">
                <Plus className="w-4 h-4" />
                <span className="flex items-center">Start from Scratch</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Start a new conversation that is not connected to an existing repository.
              </span>
              <button
                type="button"
                onClick={handleCreateNewRepo}
                className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 cursor-pointer transition-colors w-auto absolute bottom-5 left-5 right-5"
              >
                New Conversation
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 flex sm:justify-start md:justify-center">
          <div className="flex flex-col gap-5 px-6 md:flex-row min-w-full md:max-w-full lg:px-0 lg:max-w-[960px] lg:min-w-[960px]">
            <section className="flex flex-1 min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-xs leading-4 text-foreground font-bold py-[14px] pl-4">Recent Conversations</h3>
              </div>
              <div className="flex flex-col">
                <div className="transition-all duration-300 ease-in-out overflow-y-auto hide-scrollbar">
                  <div className="flex flex-col">
                    {conversationSummaries.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => {
                          window.location.hash = '#/chat-active';
                          if (conversation.repo !== 'No Repository') {
                            onRepoSelect(conversation.repo);
                            if (conversation.branch) onBranchSelect(conversation.branch);
                          }
                          onClose();
                        }}
                        className="flex flex-col gap-1 p-[14px] cursor-pointer w-full rounded-lg hover:bg-muted/60 transition-all duration-300 text-left"
                      >
                        <div className="flex items-center gap-2 pl-1">
                          <div className="inline-flex">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                          </div>
                          <span className="text-xs text-foreground leading-6 font-normal">{conversation.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground leading-4 font-normal">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Github className="w-3 h-3" />
                              <span className="max-w-[160px] truncate">{conversation.repo}</span>
                            </div>
                            {conversation.branch ? (
                              <div className="flex items-center gap-1">
                                <GitBranch className="w-3 h-3" />
                                <span className="max-w-[124px] truncate">{conversation.branch}</span>
                              </div>
                            ) : null}
                          </div>
                          <span>{conversation.time}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-1 min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-xs leading-4 text-foreground font-semibold py-[14px] pl-[14px]">
                  Suggested Tasks
                </h3>
              </div>
              <div className="flex flex-col">
                <div className="transition-all duration-300 ease-in-out overflow-y-auto hide-scrollbar">
                  <div className="flex flex-col">
                    <div className="text-muted-foreground px-[14px]">
                      <div className="flex items-center gap-2 border-b border-border mb-2">
                        <Github className="w-3 h-3" />
                        <div className="py-3">
                          <h3 className="text-xs text-foreground leading-6 font-normal">FraterCCCLXIII/chatrtk</h3>
                        </div>
                      </div>
                      <ul className="w-full text-sm">
                        {suggestedTasks.map((task) => (
                          <li key={task.id} className="w-full">
                            <button
                              type="button"
                              className="w-full p-[14px] text-left flex items-center justify-between cursor-pointer hover:bg-muted/60 transition-all duration-300 rounded-lg"
                            >
                              <div className="flex items-center gap-3 min-w-0 w-full">
                                <span className="text-xs text-muted-foreground leading-4 font-normal">
                                  {task.id}
                                </span>
                                <div className="flex flex-col gap-1 min-w-0 flex-1">
                                  <span className="text-xs text-foreground leading-6 font-normal truncate">
                                    {task.title}
                                  </span>
                                  <span className="text-xs text-muted-foreground leading-4 font-normal max-w-70 truncate">
                                    {task.subtitle}
                                  </span>
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}; 