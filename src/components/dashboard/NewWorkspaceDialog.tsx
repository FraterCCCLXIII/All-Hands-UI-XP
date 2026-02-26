import { FormEvent, useMemo, useState } from 'react';
import { Github, Plus } from 'lucide-react';
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
import { Input } from '../ui/input';

interface NewWorkspaceDialogProps {
  repositories: string[];
  onCreateWorkspace: (workspaceName: string, repositoryName: string) => void;
}

const DEFAULT_REPO = 'all';

export function NewWorkspaceDialog({ repositories, onCreateWorkspace }: NewWorkspaceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedRepository, setSelectedRepository] = useState(DEFAULT_REPO);

  const repositoryOptions = useMemo(
    () =>
      repositories.filter((repo) => repo !== 'View all' && repo !== 'No Repository').map((repo) => ({ label: repo, value: repo })),
    [repositories]
  );

  const canCreate = workspaceName.trim().length > 0 && selectedRepository.trim().length > 0;

  const resetForm = () => {
    setWorkspaceName('');
    setSelectedRepository(DEFAULT_REPO);
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

    onCreateWorkspace(workspaceName.trim(), selectedRepository);
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="xs" type="button" className="h-8 px-2.5 text-[11px]">
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
            <label htmlFor="workspace-name" className="text-sm font-medium text-muted-foreground">
              Workspace name
            </label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="ex. Payments Team"
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="workspace-repo" className="text-sm font-medium text-muted-foreground">
              Base repository
            </label>
            <div className="h-10 flex items-center rounded-md border border-border bg-muted/40 px-3 transition-colors hover:bg-muted/60">
              <Github className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <select
                id="workspace-repo"
                className="w-full bg-transparent text-sm text-foreground outline-none"
                value={selectedRepository}
                onChange={(event) => setSelectedRepository(event.target.value)}
                required
              >
                <option value={DEFAULT_REPO}>View all</option>
                {repositoryOptions.map((repoOption) => (
                  <option key={repoOption.value} value={repoOption.value}>
                    {repoOption.label}
                  </option>
                ))}
              </select>
            </div>
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
