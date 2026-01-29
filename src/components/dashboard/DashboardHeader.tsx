import { GitPullRequest, LayoutGrid, MessageCircle, Search } from 'lucide-react';

export type DashboardTabId = 'kanban' | 'active' | 'reviews';

interface DashboardHeaderProps {
  activeTab: DashboardTabId;
  onSelectTab: (tabId: DashboardTabId) => void;
}

const tabs = [
  { id: 'kanban' as const, label: 'Kanban', icon: LayoutGrid },
  { id: 'active' as const, label: 'Active Conversations', icon: MessageCircle },
  { id: 'reviews' as const, label: 'Review PRs', icon: GitPullRequest },
];

export function DashboardHeader({ activeTab, onSelectTab }: DashboardHeaderProps) {
  return (
    <header className="bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60 sticky top-0 z-50">
      <div className="relative h-14 px-4 flex items-center">
        <div className="flex flex-1 items-center gap-3 min-w-0 justify-start">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-semibold tracking-tight">Hyperboard</span>
          </div>
          <div
            data-slot="tabList"
            role="tablist"
            aria-label="Options"
            className="relative flex flex-row items-center gap-2 w-80 shrink-0"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-key={tab.id}
                  data-slot="tab"
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                  type="button"
                  aria-selected={isActive}
                  aria-label={tab.label}
                  onClick={() => onSelectTab(tab.id)}
                  className={`group inline-flex items-center rounded-md cursor-pointer pl-1.5 py-1 text-sm font-medium whitespace-nowrap transition-[color,padding-right] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar ${
                    isActive
                      ? 'gap-2 pr-2 bg-secondary text-foreground hover:bg-secondary/90'
                      : 'gap-0 pr-1.5 bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0 text-inherit" aria-hidden />
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-200 ${
                      isActive ? 'max-w-[180px] opacity-100' : 'max-w-0 opacity-0'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
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
