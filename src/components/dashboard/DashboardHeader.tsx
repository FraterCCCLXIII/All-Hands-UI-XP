import { GitPullRequest, Search } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60 sticky top-0 z-50">
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight">Hyperdrive</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono px-2 py-0.5 bg-muted rounded">beta</span>
        </div>

        <div className="hidden md:flex flex-1 justify-center px-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search PRs, repos, or authors"
              className="w-full h-9 rounded-md bg-muted/50 border border-border pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm">
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
      <div className="border-b border-sidebar-border" />
    </header>
  );
}
