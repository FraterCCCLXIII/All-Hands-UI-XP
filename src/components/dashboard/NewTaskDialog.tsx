import { FormEvent, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
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

interface NewTaskDialogProps {
  branches: string[];
  modelOptions: string[];
  onCreateTask: (payload: {
    prompt: string;
    model: string;
    branch: string;
  }) => void;
}

export function NewTaskDialog({ branches, modelOptions, onCreateTask }: NewTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(modelOptions[0] ?? '');
  const [branch, setBranch] = useState(branches[0] ?? 'main');

  const canCreate =
    prompt.trim().length > 0 &&
    model.trim().length > 0 &&
    branch.trim().length > 0;

  const reset = () => {
    setPrompt('');
    setModel(modelOptions[0] ?? '');
    setBranch(branches[0] ?? 'main');
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
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-white text-black hover:bg-muted hover:text-black">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Start a new task with a prompt, model, and branch.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
