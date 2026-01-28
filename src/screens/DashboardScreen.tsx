import { useCallback, useMemo, useRef, useState } from 'react';
import { Bot, CheckCircle, Github, GitPullRequest, MessageSquare, Plus, XCircle } from 'lucide-react';
import { DashboardHeader, type DashboardTabId } from '../components/dashboard/DashboardHeader';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { RepositorySection } from '../components/dashboard/RepositorySection';
import { NewConversationDialog } from '../components/dashboard/NewConversationDialog';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { cn } from '../lib/utils';
import { insightsPullRequests, insightsRepositories, insightsRepoData } from '../data/insightsData';
import { initialColumns } from '../data/mockData';

export function DashboardScreen() {
  const [activeView, setActiveView] = useState<DashboardTabId>('kanban');
  const [activeRepo, setActiveRepo] = useState('all');
  const repositories = useMemo(() => {
    const repoSet = new Set<string>();
    initialColumns.forEach((column) => {
      column.cards.forEach((card) => repoSet.add(card.repo));
    });
    return ['View all', ...Array.from(repoSet), 'No Repository'];
  }, []);
  const [selectedInsightRepo, setSelectedInsightRepo] = useState<string | null>(insightsRepositories[0]?.id ?? null);
  const [reviewFilter, setReviewFilter] = useState<'open' | 'closed'>('open');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

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
                  'rounded-full px-3 py-1 text-[11px] font-normal transition-colors',
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
                className="rounded-full border border-border px-3 py-1 text-[11px] font-normal text-muted-foreground transition hover:border-foreground"
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
                    <GitPullRequest className="h-4 w-4 text-green-500 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-normal text-foreground truncate">{pr.title}</p>
                        {pr.status === 'Open' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="font-normal text-muted-foreground">{pr.id}</span>
                        <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px]">
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
                      <button className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:border hover:border-border hover:bg-muted/80 focus-visible:border focus-visible:border-border focus-visible:bg-muted/80">
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
                            className="w-full rounded-md border border-border px-3 py-2 text-left text-sm transition hover:border-foreground hover:bg-muted"
                            onClick={() => handleSelectPr(popoverPr.repoKey)}
                          >
                            <p className="font-medium text-foreground">{popoverPr.title}</p>
                            <p className="text-[11px] text-muted-foreground">{popoverPr.repoDisplay}</p>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <NewConversationDialog
                    repositoryName={pr.repoDisplay}
                    branches={['main']}
                    triggerClassName="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground bg-muted hover:bg-muted/80 transition-colors"
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
    );
  }, [reviewFilter, scrollToSection, setActiveView]);

  return (
    <div className="flex-1 min-w-0 bg-sidebar text-sidebar-foreground h-screen">
      <DashboardHeader activeTab={activeView} onSelectTab={setActiveView} />
      <div className="flex min-h-0 h-full">
        {activeView === 'kanban' ? (
          <>
            <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground h-full">
              <div className="flex-1 px-3 py-4 overflow-y-auto">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Active Repositories
                </h3>
                <nav className="space-y-1">
                  {repositories.map((repo) => {
                    const repoId = repo === 'View all' ? 'all' : repo;
                    const isActive = activeRepo === repoId;
                    return (
                      <button
                        key={repoId}
                        type="button"
                        onClick={() => setActiveRepo(repoId)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                        }`}
                        aria-pressed={isActive}
                      >
                        <Github className="w-4 h-4 shrink-0" />
                        <span className="truncate">{repo}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>
            <main className="flex-1 min-w-0 bg-sidebar text-sidebar-foreground h-full">
              <div className="px-4 mb-6" />
              <KanbanBoard activeRepo={activeRepo} />
            </main>
          </>
        ) : (
          <>
            {activeView === 'active' && (
              <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground h-full">
                <div className="flex-1 px-3 py-4 overflow-y-auto">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    Active Repositories
                  </h3>
                  <nav className="space-y-1">
                    {insightsRepositories.map((repo) => (
                      <button
                        key={repo.id}
                        type="button"
                        onClick={() => {
                          setSelectedInsightRepo(repo.id);
                          scrollToSection(repo.name);
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                          selectedInsightRepo === repo.id
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                        )}
                        aria-pressed={selectedInsightRepo === repo.id}
                      >
                        <Github className="w-4 h-4 shrink-0" />
                        <span className="truncate">{repo.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>
            )}
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
