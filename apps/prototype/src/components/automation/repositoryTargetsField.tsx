import { useEffect, useState } from 'react';
import { ChevronDown, Github, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

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

  const [repo, setRepo] = useState(() => resolvedRepoOptions[0] ?? 'acme/frontend-app');
  const [branch, setBranch] = useState(() => resolvedBranchOptions[0] ?? 'main');

  useEffect(() => {
    if (open) {
      setRepo(resolvedRepoOptions[0] ?? 'acme/frontend-app');
      setBranch(resolvedBranchOptions[0] ?? 'main');
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
            <div className="relative flex h-10 items-center rounded-md border border-border bg-muted/40 px-3 transition-colors hover:bg-muted/60">
              <Github className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="block min-w-0 flex-1 truncate text-sm text-foreground">
                {repo || 'Select repository'}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <select
                id="repo-target-select"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                value={repo}
                onChange={(event) => setRepo(event.target.value)}
              >
                {resolvedRepoOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="branch-target-select" className="text-sm font-medium text-muted-foreground">
              Branch
            </label>
            <div className="relative flex h-10 items-center rounded-md border border-border bg-muted/40 px-3 transition-colors hover:bg-muted/60">
              <span className="block min-w-0 flex-1 truncate text-sm text-foreground">
                {branch || 'Select branch'}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <select
                id="branch-target-select"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                value={branch}
                onChange={(event) => setBranch(event.target.value)}
              >
                {resolvedBranchOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
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
