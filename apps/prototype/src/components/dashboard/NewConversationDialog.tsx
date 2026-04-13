import { ReactNode, useCallback, useState } from 'react';
import { Github } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { cn } from '../../lib/utils';

interface NewConversationDialogProps {
  repositoryName: string;
  branches: string[];
  triggerClassName?: string;
  triggerContent?: ReactNode;
  triggerLabel?: string;
}

export function NewConversationDialog({
  repositoryName,
  branches,
  triggerClassName,
  triggerContent,
  triggerLabel = 'Start new conversation',
}: NewConversationDialogProps) {
  const [selectedBranch, setSelectedBranch] = useState(branches[0] ?? '');
  const [prompt, setPrompt] = useState('');

  const handleLaunch = useCallback(() => {
    console.log('Launch conversation', { selectedBranch, prompt });
  }, [selectedBranch, prompt]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-2 h-7 rounded-full border border-transparent px-2.5 text-[11px] text-foreground bg-muted/40 hover:bg-muted/60 transition-colors',
            triggerClassName
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {triggerContent ? (
            triggerContent
          ) : (
            <>
              <span className="sr-only">{triggerLabel}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="text-2xl text-foreground">New Conversation</DialogTitle>
          <p className="inline-flex items-center gap-2 w-fit whitespace-nowrap rounded-full border border-border px-2 py-[6px] text-sm text-muted-foreground">
            <Github className="h-4 w-4 text-muted-foreground" />
            {repositoryName}
          </p>
        </DialogHeader>
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="new-conversation-branch">
            Select a Branch
          </label>
          <div className="h-10 flex items-center rounded-md border border-border bg-muted/40 hover:bg-muted/60 transition-colors px-3">
            <select
              id="new-conversation-branch"
              className="w-full bg-transparent text-sm text-foreground outline-none"
              value={selectedBranch}
              onChange={(event) => setSelectedBranch(event.target.value)}
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="new-conversation-prompt">
              Start the conversation with a prompt (Required)
            </label>
            <textarea
              id="new-conversation-prompt"
              rows={5}
              className="w-full rounded-md border border-border bg-muted/40 hover:bg-muted/60 transition-colors p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Describe what you want the agents to do..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex items-center gap-3">
          <button
            type="button"
            className="flex-1 h-10 flex items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background"
            onClick={handleLaunch}
          >
            Launch
          </button>
          <DialogClose asChild>
            <button className="flex-1 h-10 flex items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground">
              Cancel
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
