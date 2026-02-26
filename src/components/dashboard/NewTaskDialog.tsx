import { FormEvent, useMemo, useState } from 'react';
import { ChevronDown, GitPullRequest, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { PRCard } from '../../types/pr';

interface NewTaskDialogProps {
  pullRequests: PRCard[];
  branches: string[];
  modelOptions: string[];
  onCreateTask: (payload: {
    prompt: string;
    model: string;
    branch: string;
    linkedPrIds: string[];
  }) => void;
}

export function NewTaskDialog({ pullRequests, branches, modelOptions, onCreateTask }: NewTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(modelOptions[0] ?? '');
  const [branch, setBranch] = useState(branches[0] ?? 'main');
  const [linkedPrIds, setLinkedPrIds] = useState<string[]>([]);

  const sortedPullRequests = useMemo(
    () =>
      [...pullRequests].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [pullRequests]
  );

  const canCreate =
    prompt.trim().length > 0 &&
    model.trim().length > 0 &&
    branch.trim().length > 0;
  const selectedPrLabel =
    linkedPrIds.length === 0
      ? 'Select one or more PRs'
      : linkedPrIds.length === 1
        ? '1 PR selected'
        : `${linkedPrIds.length} PRs selected`;

  const reset = () => {
    setPrompt('');
    setModel(modelOptions[0] ?? '');
    setBranch(branches[0] ?? 'main');
    setLinkedPrIds([]);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canCreate) return;

    onCreateTask({
      prompt: prompt.trim(),
      model,
      branch,
      linkedPrIds,
    });
    handleOpenChange(false);
  };

  const toggleLinkedPr = (prId: string) => {
    setLinkedPrIds((previous) =>
      previous.includes(prId) ? previous.filter((id) => id !== prId) : [...previous, prId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">New Task</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Start a new task and optionally link it to an existing pull request.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Associate PRs (optional)</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto w-full justify-between border-border bg-muted/30 px-3 py-2 text-xs font-normal text-muted-foreground hover:bg-muted/60"
                  aria-label="Select associated pull requests"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <GitPullRequest className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{selectedPrLabel}</span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-0">
                <DropdownMenuLabel className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                  Select one or more PRs
                </DropdownMenuLabel>
                {sortedPullRequests.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No PRs available in this workspace.</p>
                ) : (
                  <div className="max-h-40 space-y-1 overflow-y-auto p-2">
                    {sortedPullRequests.map((pr) => (
                      <DropdownMenuCheckboxItem
                        key={pr.id}
                        className="items-start text-xs"
                        checked={linkedPrIds.includes(pr.id)}
                        onCheckedChange={() => toggleLinkedPr(pr.id)}
                        onSelect={(event) => event.preventDefault()}
                      >
                        <span className="truncate">
                          {pr.repo} #{pr.number} - {pr.title}
                        </span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <label htmlFor="new-task-prompt" className="text-sm font-medium text-muted-foreground">
              Start prompt
            </label>
            <textarea
              id="new-task-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              className="w-full rounded-md border border-border bg-muted/40 p-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Describe what this task should accomplish..."
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="new-task-model" className="text-sm font-medium text-muted-foreground">
                Model
              </label>
              <div className="h-10 flex items-center rounded-md border border-border bg-muted/40 px-3 transition-colors hover:bg-muted/60">
                <Sparkles className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <select
                  id="new-task-model"
                  className="w-full bg-transparent text-sm text-foreground outline-none"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  required
                >
                  {modelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="new-task-branch" className="text-sm font-medium text-muted-foreground">
                Branch
              </label>
              <div className="h-10 flex items-center rounded-md border border-border bg-muted/40 px-3 transition-colors hover:bg-muted/60">
                <select
                  id="new-task-branch"
                  className="w-full bg-transparent text-sm text-foreground outline-none"
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                  required
                >
                  {branches.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2 flex items-center gap-3">
            <Button type="submit" className="flex-1" disabled={!canCreate}>
              Create Task
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
