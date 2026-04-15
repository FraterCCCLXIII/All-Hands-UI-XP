import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Bot,
  CheckCircle,
  ChevronDown,
  FolderX,
  Github,
  GitPullRequest,
  Layers3,
  PanelLeftOpen,
  MessageSquare,
  Plus,
  XCircle,
} from 'lucide-react';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { RepositorySection } from '../components/dashboard/RepositorySection';
import { NewConversationDialog } from '../components/dashboard/NewConversationDialog';
import { NewWorkspaceDialog } from '../components/dashboard/NewWorkspaceDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { cn } from '../lib/utils';
import { extensionsSectionStackGap } from '../lib/extensionsRoutes';
import { insightsPullRequests, insightsRepositories, insightsRepoData } from '../data/insightsData';
import { initialColumns } from '../data/mockData';

type DashboardTabId = 'kanban' | 'active' | 'reviews';

interface WorkspaceItem {
  id: string;
  label: string;
  repoKey: string;
}

const getWorkspaceIcon = (workspace: WorkspaceItem) => {
  if (workspace.repoKey === 'all') return Layers3;
  if (workspace.repoKey === 'No Repository') return FolderX;
  return Github;
};

export function DashboardScreen() {
  const [activeView, setActiveView] = useState<DashboardTabId>('kanban');
  const [activeRepo, setActiveRepo] = useState('all');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('all');
  const [isRepoListOpen, setIsRepoListOpen] = useState(true);
  const [customWorkspaces, setCustomWorkspaces] = useState<WorkspaceItem[]>([]);

  const repositoryOptions = useMemo(() => {
    const repoSet = new Set<string>();
    initialColumns.forEach((column) => {
      column.cards.forEach((card) => {
        if (card.repo !== 'No Repository') repoSet.add(card.repo);
      });
    });
    return Array.from(repoSet);
  }, []);

  const workspaceRepositoryOptions = useMemo(() => ['View all', ...repositoryOptions, 'No Repository'], [repositoryOptions]);
  const defaultWorkspaces = useMemo<WorkspaceItem[]>(
    () => [
      { id: 'all', label: 'View all', repoKey: 'all' },
      ...repositoryOptions.map((repo) => ({ id: repo, label: repo, repoKey: repo })),
      { id: 'no-repository', label: 'No Repository', repoKey: 'No Repository' },
    ],
    [repositoryOptions]
  );
  const workspaces = useMemo(() => [...defaultWorkspaces, ...customWorkspaces], [customWorkspaces, defaultWorkspaces]);

  const handleCreateWorkspace = useCallback((workspaceName: string, repositoryName: string) => {
    const workspaceId = `${workspaceName.trim().toLowerCase().replace(/[^\w-]/g, '-')}-${Date.now()}`;
    const repoKey = repositoryName === 'View all' ? 'all' : repositoryName;
    const newWorkspace = {
      id: workspaceId,
      label: workspaceName.trim(),
      repoKey,
    };

    setCustomWorkspaces((previous) => [...previous, newWorkspace]);
    setActiveWorkspaceId(workspaceId);
    setActiveRepo(repoKey);
  }, []);

  const [selectedInsightRepo, setSelectedInsightRepo] = useState<string | null>(insightsRepositories[0]?.id ?? null);
  const [reviewFilter, setReviewFilter] = useState<'open' | 'closed'>('open');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const RepositorySidebar = ({
    workspaceList,
    isOpen,
  }: {
    workspaceList: WorkspaceItem[];
    isOpen: boolean;
  }) => (
    <aside
      className={cn(
        'relative z-10 flex h-full min-h-0 shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground transition-[width] duration-200',
        'pt-[var(--settings-nav-padding-top)] pb-[var(--settings-nav-padding-bottom)]',
        extensionsSectionStackGap,
        isOpen ? 'w-64 px-3' : 'w-0 min-w-0 max-w-0 border-0 px-0 pointer-events-none',
      )}
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between gap-2 ml-1 shrink-0">
        <h2 className="text-xl font-semibold leading-6 text-foreground">Workspaces</h2>
        <NewWorkspaceDialog repositories={workspaceRepositoryOptions} onCreateWorkspace={handleCreateWorkspace} />
      </div>
      <nav
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden whitespace-nowrap"
        aria-label="Workspaces"
      >
        {workspaceList.map((workspace) => {
          const isActive = activeWorkspaceId === workspace.id;
          const WorkspaceIcon = getWorkspaceIcon(workspace);
          return (
            <button
              key={workspace.id}
              type="button"
              onClick={() => {
                setActiveWorkspaceId(workspace.id);
                setActiveRepo(workspace.repoKey);
              }}
              className={cn(
                'group flex w-full min-w-0 items-center gap-3 rounded-md px-[14px] py-2 text-left text-sm transition-colors',
                isActive
                  ? 'bg-muted/60 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <WorkspaceIcon
                className={cn(
                  'h-5 w-5 shrink-0',
                  isActive ? 'text-white' : 'text-muted-foreground group-hover:text-white',
                )}
                aria-hidden
              />
              <span className="min-w-0 truncate font-normal">{workspace.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );

  const createSectionKey = useCallback((name: string) => name.replace(/[^\w-]/g, '-').toLowerCase(), []);
  const scrollToSection = useCallback(
    (repoName: string) => {
      const key = createSectionKey(repoName);
      const element = sectionRefs.current[key];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [createSectionKey]
  );

  const reviewContent = useMemo(() => {
    const filteredPullRequests = insightsPullRequests.filter((pr) =>
      reviewFilter === 'open' ? pr.status !== 'Closed' : pr.status === 'Closed'
    );
    const handleSelectPr = (repoKey: string) => {
      setActiveView('active');
      scrollToSection(repoKey || '');
    };

    return (
      <>
        <div className="flex items-center justify-between px-4 pb-3 gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label="Show repository list"
              aria-expanded="false"
            >
              <PanelLeftOpen className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <h2 className="text-lg font-semibold tracking-tight text-foreground truncate">All</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 rounded-md px-3"
                  aria-label="Filter pull requests"
                  type="button"
                >
                  All PRs
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>All PRs</DropdownMenuItem>
                <DropdownMenuItem>PRs opened by me</DropdownMenuItem>
                <DropdownMenuItem>PRs assigned to me</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2" />
        </div>
        <div className="border border-border bg-card rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 rounded-t-xl">
          <div className="flex gap-2 text-xs text-muted-foreground">
            {(['open', 'closed'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setReviewFilter(option)}
                aria-pressed={reviewFilter === option}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-normal transition-colors',
                  reviewFilter === option
                    ? 'border border-border bg-muted text-foreground'
                    : 'border border-transparent text-muted-foreground hover:border-border'
                )}
              >
                {option === 'open' ? 'Open' : 'Closed'}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {['Author', 'Label', 'Projects', 'Milestones', 'Reviews', 'Assignees', 'Sort'].map((label) => (
              <button
                key={label}
                className="rounded-full border border-border px-3 py-1 text-xs font-normal text-muted-foreground transition hover:border-foreground"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-border divide-y">
          {filteredPullRequests.map((pr) => (
            <article key={pr.id} className="border-b border-transparent px-4 py-4 last:border-b-0">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <GitPullRequest className="h-4 w-4 text-success mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-normal text-foreground truncate">{pr.title}</p>
                        {pr.status === 'Open' ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="font-normal text-muted-foreground">{pr.id}</span>
                        <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
                          {pr.repoDisplay}
                        </span>
                        <span>{pr.time}</span>
                        <span>by {pr.author}</span>
                        {pr.tasks.split('·').map((segment, index) => (
                          <span key={index} className="flex items-center gap-1">
                            <span>•</span>
                            <span>{segment.trim()}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:border hover:border-border hover:bg-muted/60 focus-visible:border focus-visible:border-border focus-visible:bg-muted/80">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        {pr.comments}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="space-y-2">
                        {filteredPullRequests.map((popoverPr) => (
                          <button
                            key={popoverPr.id}
                            type="button"
                            className="w-full h-10 flex flex-col items-start justify-center gap-0 rounded-md border border-border px-4 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
                            onClick={() => handleSelectPr(popoverPr.repoKey)}
                          >
                            <p className="font-medium text-foreground text-xs leading-tight truncate w-full">{popoverPr.title}</p>
                            <p className="text-xs text-muted-foreground leading-tight truncate w-full">{popoverPr.repoDisplay}</p>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <NewConversationDialog
                    repositoryName={pr.repoDisplay}
                    branches={['main']}
                    triggerClassName="inline-flex items-center gap-2 h-10 rounded-md border border-border px-3 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/60 transition-colors"
                    triggerLabel={`New conversation for ${pr.id}`}
                    triggerContent={
                      <>
                        <Plus className="h-3 w-3" />
                        <MessageSquare className="h-3 w-3" />
                        <span className="sr-only">New conversation</span>
                      </>
                    }
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
        </div>
      </>
    );
  }, [reviewFilter, scrollToSection, setActiveView]);

  return (
    <div className="flex-1 min-w-0 bg-sidebar text-sidebar-foreground h-screen" data-tour-id="dashboard.root">
      <div className="flex min-h-0 h-full">
        {activeView === 'kanban' ? (
          <>
            <RepositorySidebar workspaceList={workspaces} isOpen={isRepoListOpen} />
            <main className="flex flex-col flex-1 min-w-0 min-h-0 bg-sidebar text-sidebar-foreground">
              <div className="px-4 mb-6 shrink-0" />
              <div className="flex flex-1 min-h-0 flex-col">
                <KanbanBoard
                activeRepo={activeRepo}
                isRepoListOpen={isRepoListOpen}
                onToggleRepoList={() => setIsRepoListOpen((prev) => !prev)}
              />
              </div>
            </main>
          </>
        ) : (
          <>
            {activeView === 'active' && (
              <aside
                className={cn(
                  'relative z-10 flex h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground',
                  'pt-[var(--settings-nav-padding-top)] pb-[var(--settings-nav-padding-bottom)]',
                  extensionsSectionStackGap,
                  'px-3',
                )}
              >
                <div className="flex items-center justify-between gap-2 ml-1 shrink-0">
                  <h2 className="text-xl font-semibold leading-6 text-foreground">Workspaces</h2>
                  <NewWorkspaceDialog
                    repositories={insightsRepositories.map((repo) => repo.name)}
                    onCreateWorkspace={(_, repositoryName) => {
                      const matchingRepository = insightsRepositories.find((repo) => repo.name === repositoryName);
                      if (!matchingRepository) {
                        return;
                      }

                      setSelectedInsightRepo(matchingRepository.id);
                      scrollToSection(matchingRepository.name);
                    }}
                  />
                </div>
                <nav
                  className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden"
                  aria-label="Workspaces"
                >
                  {insightsRepositories.map((repo) => {
                    const isActive = selectedInsightRepo === repo.id;
                    return (
                      <button
                        key={repo.id}
                        type="button"
                        onClick={() => {
                          setSelectedInsightRepo(repo.id);
                          scrollToSection(repo.name);
                        }}
                        className={cn(
                          'group flex w-full min-w-0 items-center gap-3 rounded-md px-[14px] py-2 text-left text-sm transition-colors',
                          isActive
                            ? 'bg-muted/60 text-foreground'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Github
                          className={cn(
                            'h-5 w-5 shrink-0',
                            isActive ? 'text-white' : 'text-muted-foreground group-hover:text-white',
                          )}
                          aria-hidden
                        />
                        <span className="min-w-0 truncate font-normal">{repo.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </aside>
            )}
            {activeView === 'reviews' && <RepositorySidebar workspaceList={workspaces} isOpen />}
            <main className="flex-1 min-w-0 bg-sidebar text-sidebar-foreground h-full overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <div className="space-y-6 mt-6 px-4 pb-6">
                  {activeView === 'active' ? (
                    <>
                      {insightsRepoData.map((repo) => {
                        const sectionKey = createSectionKey(repo.name);
                        return (
                          <section
                            key={repo.name}
                            id={sectionKey}
                            ref={(element) => {
                              sectionRefs.current[sectionKey] = element;
                            }}
                            className="space-y-6"
                          >
                            <RepositorySection name={repo.name} branches={repo.branches} stats={repo.stats} />
                          </section>
                        );
                      })}
                    </>
                  ) : (
                    <div className="w-full">{reviewContent}</div>
                  )}
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
