import { ArrowDown, ArrowUp, ExternalLink, FolderOpen, GitBranch, GitPullRequest, Github } from 'lucide-react';

interface RepositoryActionStripProps {
  status: 'connected' | 'connect' | 'disconnected';
  repoName?: string | null;
  repoUrl?: string | null;
  branchName?: string | null;
  branchUrl?: string | null;
  onConnect?: () => void;
}

function ActionButton({
  icon: Icon,
  label,
  className,
}: {
  icon: typeof ArrowDown;
  label: string;
  className: string;
}) {
  return (
    <button
      type="button"
      aria-disabled="true"
      className={className}
    >
      <Icon className="w-3 h-3" />
      <div className="font-normal text-xs leading-4 truncate" title={label}>
        {label}
      </div>
    </button>
  );
}

export function RepositoryActionStrip({
  status,
  repoName,
  repoUrl,
  branchName,
  branchUrl,
  onConnect,
}: RepositoryActionStripProps) {
  const resolvedRepoName = repoName ?? 'No Repo Connected';
  const resolvedBranchName = branchName ?? 'main';

  return (
    <div className="flex w-full min-w-0 flex-row items-center">
      <div className="flex w-full min-w-0 flex-nowrap items-center justify-between gap-2.5 overflow-x-hidden">
        {status === 'connected' ? (
          <>
            <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2.5 overflow-hidden">
              <a
                href={repoUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-w-0 max-w-[340px] shrink-0 flex-row items-center justify-between gap-2 rounded-full border border-transparent bg-transparent py-1 pl-2.5 pr-2.5 relative truncate hover:border-muted-foreground/30 hover:text-foreground cursor-pointer"
              >
                <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                  <Github className="w-3 h-3 text-muted-foreground transition-colors group-hover:text-foreground" />
                </div>
                <div className="font-normal text-muted-foreground text-xs leading-4 truncate flex-1 min-w-0 transition-colors group-hover:text-foreground" title={resolvedRepoName}>
                  {resolvedRepoName}
                </div>
                <div className="absolute right-0 top-1/2 flex h-full w-12 -translate-y-1/2 items-center justify-end rounded-r-full bg-gradient-to-l from-background via-background/80 to-transparent pr-2.5 opacity-0 transition-opacity duration-0 group-hover:opacity-100">
                  <ExternalLink className="w-3 h-3 text-muted-foreground transition-colors group-hover:text-foreground" />
                </div>
              </a>
              <a
                href={branchUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-w-0 max-w-[220px] flex-row items-center justify-between gap-2 rounded-full border border-transparent bg-transparent py-1 pl-2.5 pr-2.5 relative truncate hover:border-muted-foreground/30 hover:text-foreground cursor-pointer"
              >
                <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                  <GitBranch className="w-3 h-3 text-muted-foreground transition-colors group-hover:text-foreground" />
                </div>
                <div className="font-normal text-muted-foreground text-xs leading-4 truncate transition-colors group-hover:text-foreground" title={resolvedBranchName}>
                  {resolvedBranchName}
                </div>
                <div className="absolute right-0 top-1/2 flex h-full w-12 -translate-y-1/2 items-center justify-end rounded-r-full bg-gradient-to-l from-background via-background/80 to-transparent pr-2.5 opacity-0 transition-opacity duration-0 group-hover:opacity-100">
                  <ExternalLink className="w-3 h-3 text-muted-foreground transition-colors group-hover:text-foreground" />
                </div>
              </a>
            </div>
            <div className="ml-auto flex shrink-0 flex-nowrap items-center justify-end gap-2.5">
              <ActionButton
                icon={ArrowDown}
                label="Pull"
                className="flex flex-row gap-1 items-center justify-center rounded-full border border-transparent bg-muted/50 px-0.5 py-1 text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground w-[76px] min-w-[76px]"
              />
              <ActionButton
                icon={ArrowUp}
                label="Push"
                className="flex flex-row gap-1 items-center justify-center rounded-full border border-transparent bg-muted/50 px-2 py-1 text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground w-[77px] min-w-[77px]"
              />
              <button
                type="button"
                aria-disabled="true"
                className="flex h-7 flex-row gap-1 items-center justify-center rounded-full border border-transparent bg-muted/50 px-2 py-1 text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground w-[126px] min-w-[126px]"
              >
                <GitPullRequest className="w-3 h-3" />
                <div className="font-normal text-xs leading-4 max-w-[126px] truncate" title="Pull Request">
                  Pull Request
                </div>
              </button>
            </div>
          </>
        ) : status === 'connect' ? (
          <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2.5 overflow-hidden">
            <button
              type="button"
              className="flex h-7 min-w-[140px] shrink-0 flex-row items-center justify-center gap-1 rounded-full border border-transparent bg-muted/50 px-2 py-1 text-xs font-normal leading-4 text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground"
              onClick={onConnect}
            >
              <FolderOpen className="w-3 h-3" />
              Open Repository
            </button>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2.5 overflow-hidden">
            <div className="group flex min-w-0 max-w-[340px] shrink-0 flex-row items-center gap-2 rounded-full border border-transparent bg-transparent py-1 pl-2.5 pr-2.5 relative truncate cursor-not-allowed">
              <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                <Github className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="font-normal text-muted-foreground text-xs leading-4 truncate flex-1 min-w-0" title="No Repo Connected">
                No Repo Connected
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
