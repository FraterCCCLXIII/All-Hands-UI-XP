import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, GitBranch, Github, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export type RepositoryTarget = {
  repository: string;
  branch: string;
};

export function repositoryTargetKey(target: RepositoryTarget): string {
  return `${target.repository}\u0000${target.branch}`;
}

export function AddRepositoryTargetDialog({
  open,
  onOpenChange,
  existingTargets,
  onAdd,
  repoOptions,
  branchOptions,
  title = 'Add repository',
  description = 'Choose a repository and branch. You can add more than one target.',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingTargets: RepositoryTarget[];
  onAdd: (target: RepositoryTarget) => void;
  repoOptions: string[];
  branchOptions: string[];
  title?: string;
  description?: string;
}) {
  const resolvedRepoOptions = repoOptions.length > 0 ? repoOptions : ['acme/frontend-app'];
  const resolvedBranchOptions = branchOptions.length > 0 ? branchOptions : ['main'];

  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('');
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  const recentRepoOptions = useMemo(() => resolvedRepoOptions.slice(0, 2), [resolvedRepoOptions]);
  const filteredRecentRepos = useMemo(
    () =>
      recentRepoOptions.filter((option) =>
        option.toLowerCase().includes(repo.trim().toLowerCase())
      ),
    [recentRepoOptions, repo]
  );
  const filteredAllRepos = useMemo(
    () =>
      resolvedRepoOptions.filter(
        (option) =>
          !recentRepoOptions.includes(option) &&
          option.toLowerCase().includes(repo.trim().toLowerCase())
      ),
    [recentRepoOptions, repo, resolvedRepoOptions]
  );
  const hasRepoMatches = filteredRecentRepos.length > 0 || filteredAllRepos.length > 0;

  useEffect(() => {
    if (open) {
      setRepo('');
      setBranch('');
      setRepoDropdownOpen(false);
      setBranchDropdownOpen(false);
    }
  }, [open]);

  const trimmedRepo = repo.trim();
  const trimmedBranch = branch.trim();
  const isDuplicate =
    Boolean(trimmedRepo && trimmedBranch) &&
    existingTargets.some(
      (t) => t.repository === trimmedRepo && t.branch === trimmedBranch
    );
  const canAdd = Boolean(trimmedRepo && trimmedBranch) && !isDuplicate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border text-foreground sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="repo-target-select" className="text-sm font-medium text-muted-foreground">
              Repository
            </label>
            <Popover open={repoDropdownOpen} onOpenChange={setRepoDropdownOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Github className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="repo-target-select"
                    placeholder="user/repo"
                    className="h-10 w-full rounded-md border border-border bg-muted/40 px-4 pl-10 pr-10 text-sm text-foreground shadow-none ring-offset-background transition-colors placeholder:text-muted-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
                    value={repo}
                    onChange={(event) => {
                      setRepo(event.target.value);
                      setBranch('');
                      setRepoDropdownOpen(true);
                    }}
                    aria-expanded={repoDropdownOpen}
                    aria-haspopup="listbox"
                    role="combobox"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        repoDropdownOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent
                portalled={false}
                align="start"
                sideOffset={4}
                onOpenAutoFocus={(event) => event.preventDefault()}
                className="z-[140] flex max-h-72 w-[var(--radix-popover-trigger-width)] flex-col overflow-hidden rounded-lg border border-border bg-card p-0 shadow-md"
              >
                {hasRepoMatches ? (
                  <ul role="listbox" className="min-h-0 flex-1 overflow-y-auto p-1 repo-dropdown-scroll">
                    {filteredRecentRepos.length > 0 ? (
                      <>
                        <li className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Most Recent</li>
                        {filteredRecentRepos.map((option) => (
                          <li
                            key={option}
                            role="option"
                            aria-selected={option === repo}
                            className="cursor-pointer rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted/60"
                            onClick={() => {
                              setRepo(option);
                              setBranch(resolvedBranchOptions[0] ?? 'main');
                              setRepoDropdownOpen(false);
                            }}
                          >
                            <span className="font-medium">{option}</span>
                          </li>
                        ))}
                        {filteredAllRepos.length > 0 ? <li className="my-1 border-t border-border" /> : null}
                      </>
                    ) : null}
                    {filteredAllRepos.length > 0 ? (
                      <>
                        {filteredRecentRepos.length === 0 ? (
                          <li className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">All Repositories</li>
                        ) : null}
                        {filteredAllRepos.map((option) => (
                          <li
                            key={option}
                            role="option"
                            aria-selected={option === repo}
                            className="cursor-pointer rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted/60"
                            onClick={() => {
                              setRepo(option);
                              setBranch(resolvedBranchOptions[0] ?? 'main');
                              setRepoDropdownOpen(false);
                            }}
                          >
                            <span className="font-medium">{option}</span>
                          </li>
                        ))}
                      </>
                    ) : null}
                  </ul>
                ) : (
                  <div className="px-3 py-4 text-sm text-muted-foreground">No repositories found</div>
                )}
                <div className="border-t border-border p-1">
                  <a
                    href="https://github.com/apps/openhands-ai/installations/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted/60"
                  >
                    + Add GitHub Repos
                  </a>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label htmlFor="branch-target-select" className="text-sm font-medium text-muted-foreground">
              Branch
            </label>
            <Popover
              open={Boolean(trimmedRepo) && branchDropdownOpen}
              onOpenChange={(nextOpen) => setBranchDropdownOpen(Boolean(trimmedRepo) && nextOpen)}
            >
              <PopoverTrigger asChild>
                <div className="relative">
                  <GitBranch className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="branch-target-select"
                    placeholder="Select branch..."
                    disabled={!trimmedRepo}
                    readOnly
                    className="h-10 w-full cursor-pointer rounded-md border border-border bg-muted/40 px-4 pl-10 pr-10 text-sm text-foreground shadow-none ring-offset-background transition-colors placeholder:text-muted-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 disabled:cursor-not-allowed disabled:bg-muted/30 disabled:opacity-60"
                    value={branch}
                    aria-expanded={Boolean(trimmedRepo) && branchDropdownOpen}
                    aria-haspopup="listbox"
                    role="combobox"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        branchDropdownOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent
                portalled={false}
                align="start"
                sideOffset={4}
                onOpenAutoFocus={(event) => event.preventDefault()}
                className="z-[140] max-h-60 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border border-border bg-card p-1 shadow-md"
              >
                <ul role="listbox" className="max-h-56 overflow-y-auto repo-dropdown-scroll">
                  {resolvedBranchOptions.map((option) => (
                    <li
                      key={option}
                      role="option"
                      aria-selected={option === branch}
                      className="cursor-pointer rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted/60"
                      onClick={() => {
                        setBranch(option);
                        setBranchDropdownOpen(false);
                      }}
                    >
                      <span className="font-medium">{option}</span>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          </div>
          {isDuplicate && (
            <p className="text-xs text-muted-foreground">This repository and branch are already added.</p>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canAdd}
            onClick={() => {
              if (!canAdd) return;
              onAdd({ repository: trimmedRepo, branch: trimmedBranch });
              onOpenChange(false);
            }}
          >
            Add repository
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RepositoryTargetsBubbleField({
  targets,
  onRemove,
  onRequestAdd,
  label = 'Repositories',
}: {
  targets: RepositoryTarget[];
  onRemove: (target: RepositoryTarget) => void;
  onRequestAdd: () => void;
  label?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-border bg-muted/20 p-2">
        {targets.map((target) => (
          <span
            key={repositoryTargetKey(target)}
            className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs text-foreground"
          >
            <Github className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="min-w-0 truncate">
              {target.repository} · {target.branch}
            </span>
            <button
              type="button"
              onClick={() => onRemove(target)}
              className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Remove ${target.repository} ${target.branch}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="group h-7 shrink-0 gap-1.5 px-2 text-muted-foreground hover:!bg-primary hover:!text-primary-foreground"
          aria-label="Add repository"
          onClick={onRequestAdd}
        >
          <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-black" />
          <span className="text-xs font-medium text-muted-foreground transition-colors duration-200 group-hover:text-black">
            Add repository
          </span>
        </Button>
      </div>
    </div>
  );
}
