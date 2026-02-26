import { GitPullRequest, Search } from 'lucide-react';

export type DashboardTabId = 'kanban' | 'active' | 'reviews';

interface DashboardHeaderProps {
  activeTab?: DashboardTabId;
  onSelectTab?: (tabId: DashboardTabId) => void;
}

export function DashboardHeader(_: DashboardHeaderProps = {}) {
  return (
    <header className="bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60 sticky top-0 z-50">
      <div className="relative h-14 px-4 flex items-center">
        <div className="flex flex-1 items-center gap-3 min-w-0 justify-start">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-semibold tracking-tight">Hyperboard</span>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 hidden w-full max-w-md -translate-x-1/2 -translate-y-1/2 md:block md:max-w-[28rem]">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search PRs, repos, or authors"
              className="h-10 w-full rounded-md border border-border bg-muted/40 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar"
            />
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-6 text-sm md:flex">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">3 agents online</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GitPullRequest className="w-4 h-4" />
            <span>5 PRs assigned</span>
          </div>
        </div>
      </div>
      <div />
    </header>
  );
}
