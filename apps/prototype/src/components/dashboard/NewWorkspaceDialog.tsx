import { FormEvent, useMemo, useState } from 'react';
import { Check, ChevronDown, Github, Plus } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface NewWorkspaceDialogProps {
  repositories: string[];
  onCreateWorkspace: (workspaceName: string, repositoryName: string) => void;
}

const DEFAULT_REPO = 'all';

export function NewWorkspaceDialog({ repositories, onCreateWorkspace }: NewWorkspaceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRepositoryDropdownOpen, setIsRepositoryDropdownOpen] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState(DEFAULT_REPO);

  const repositoryOptions = useMemo(
    () =>
      repositories.filter((repo) => repo !== 'View all' && repo !== 'No Repository').map((repo) => ({ label: repo, value: repo })),
    [repositories]
  );
  const selectedRepositoryLabel = selectedRepository === DEFAULT_REPO
    ? 'View all'
    : repositoryOptions.find((repo) => repo.value === selectedRepository)?.label ?? selectedRepository;

  const canCreate = selectedRepository.trim().length > 0;

  const resetForm = () => {
    setSelectedRepository(DEFAULT_REPO);
    setIsRepositoryDropdownOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!canCreate) {
      return;
    }

    const workspaceName = selectedRepository === DEFAULT_REPO ? 'View all' : selectedRepository;
    onCreateWorkspace(workspaceName, selectedRepository);
    handleOpenChange(false);
  };

  const handleRepositorySelect = (value: string) => {
    setSelectedRepository(value);
    setIsRepositoryDropdownOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="xs" type="button" className="h-8 px-2.5 text-xs">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>Create a workspace view based on an existing repository.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="space-y-2">
            <label id="workspace-repo-label" className="text-sm font-medium text-muted-foreground">
              Base repository
            </label>
            <Popover open={isRepositoryDropdownOpen} onOpenChange={setIsRepositoryDropdownOpen}>
              <PopoverTrigger asChild>
                <button
                  id="workspace-repo"
                  type="button"
                  aria-labelledby="workspace-repo-label workspace-repo"
                  aria-expanded={isRepositoryDropdownOpen}
                  aria-haspopup="listbox"
                  className="relative flex h-10 w-full items-center rounded-md border border-border bg-muted/40 px-3 text-left transition-colors hover:bg-muted/60 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
                >
                  <Github className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="block flex-1 truncate text-sm text-foreground">{selectedRepositoryLabel}</span>
                  <ChevronDown
                    className={`ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isRepositoryDropdownOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="bottom"
                sideOffset={4}
                portalled={false}
                onOpenAutoFocus={(event) => event.preventDefault()}
                className="z-[9999] mt-1 max-h-60 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border border-border bg-card p-0 shadow-md"
              >
                <ul role="listbox" aria-labelledby="workspace-repo-label" className="repo-dropdown-scroll w-full overflow-y-auto p-1">
                  {[{ label: 'View all', value: DEFAULT_REPO }, ...repositoryOptions].map((repoOption) => {
                    const isSelected = repoOption.value === selectedRepository;
                    return (
                      <li
                        key={repoOption.value}
                        role="option"
                        aria-selected={isSelected}
                        tabIndex={-1}
                        className="my-0.5 flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm font-normal text-foreground hover:bg-muted/60 focus:bg-muted/60 focus:outline-none"
                        onClick={() => handleRepositorySelect(repoOption.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleRepositorySelect(repoOption.value);
                          }
                        }}
                      >
                        <span className="truncate font-medium">{repoOption.label}</span>
                        {isSelected ? <Check className="ml-2 h-4 w-4 shrink-0 text-foreground" aria-hidden="true" /> : null}
                      </li>
                    );
                  })}
                </ul>
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter className="mt-2 flex items-center gap-3">
            <Button type="submit" className="flex-1" disabled={!canCreate}>
              Create
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
