import { useMemo, useState } from 'react';
import { Github } from 'lucide-react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { initialColumns } from '../data/mockData';

export function DashboardScreen() {
  const [activeRepo, setActiveRepo] = useState('all');
  const repositories = useMemo(() => {
    const repoSet = new Set<string>();
    initialColumns.forEach((column) => {
      column.cards.forEach((card) => repoSet.add(card.repo));
    });
    return ['View all', ...Array.from(repoSet), 'No Repository'];
  }, []);

  return (
    <div className="flex-1 min-w-0 bg-sidebar text-sidebar-foreground h-screen">
      <DashboardHeader />
      <div className="flex min-h-0 h-full">
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
      </div>
    </div>
  );
}
