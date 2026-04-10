import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { showAppToast } from '../../lib/appToast';

const inputLike =
  'flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50';

const textareaLike =
  'min-h-[120px] w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export type AddRepoExtensionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddRepoExtensionModal({ open, onOpenChange }: AddRepoExtensionModalProps) {
  const [repoUrl, setRepoUrl] = useState('');

  useEffect(() => {
    if (open) {
      setRepoUrl('');
    }
  }, [open]);

  const submit = () => {
    const trimmed = repoUrl.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      showAppToast({ variant: 'error', message: 'Enter a valid repository URL.' });
      return;
    }
    onOpenChange(false);
    showAppToast({ variant: 'success', message: 'Repository added.' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add from repository</DialogTitle>
          <DialogDescription>Paste the Git repository URL to add it.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div>
            <label htmlFor="repo-url" className="mb-1.5 block text-sm font-medium text-foreground">
              Repository URL
            </label>
            <Input
              id="repo-url"
              type="url"
              placeholder="https://github.com/org/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={!repoUrl.trim()} onClick={submit}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const MCP_SERVER_TYPES = [
  { value: 'stdio', label: 'stdio' },
  { value: 'http', label: 'HTTP' },
  { value: 'sse', label: 'SSE' },
  { value: 'websocket', label: 'WebSocket' },
] as const;

export type AddMcpServerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddMcpServerModal({ open, onOpenChange }: AddMcpServerModalProps) {
  const [serverType, setServerType] = useState<string>('http');
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (open) {
      setServerType('http');
      setUrl('');
      setApiKey('');
    }
  }, [open]);

  const submit = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (serverType !== 'stdio') {
      try {
        new URL(trimmed);
      } catch {
        showAppToast({ variant: 'error', message: 'Enter a valid server URL.' });
        return;
      }
    }
    onOpenChange(false);
    showAppToast({ variant: 'success', message: 'MCP server added.' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add MCP server</DialogTitle>
          <DialogDescription>Configure how to reach this Model Context Protocol server.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div>
            <label htmlFor="mcp-type" className="mb-1.5 block text-sm font-medium text-foreground">
              Server type
            </label>
            <select
              id="mcp-type"
              value={serverType}
              onChange={(e) => setServerType(e.target.value)}
              className={inputLike}
            >
              {MCP_SERVER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="mcp-url" className="mb-1.5 block text-sm font-medium text-foreground">
              URL
            </label>
            <Input
              id="mcp-url"
              type="url"
              placeholder="https://example.com/mcp"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="mcp-key" className="mb-1.5 block text-sm font-medium text-foreground">
              API key <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="mcp-key"
              type="password"
              placeholder="••••••••"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={!url.trim()} onClick={submit}>
            Add server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type AddHookModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddHookModal({ open, onOpenChange }: AddHookModalProps) {
  const [hookName, setHookName] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (open) {
      setHookName('');
      setInstructions('');
    }
  }, [open]);

  const submit = () => {
    if (!hookName.trim() || !instructions.trim()) return;
    onOpenChange(false);
    showAppToast({ variant: 'success', message: 'Hook added.' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add hook</DialogTitle>
          <DialogDescription>
            Name this automation hook and describe what should run when it fires.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div>
            <label htmlFor="hook-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Hook name
            </label>
            <Input
              id="hook-name"
              placeholder="e.g. deployment-success"
              value={hookName}
              onChange={(e) => setHookName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="hook-instructions" className="mb-1.5 block text-sm font-medium text-foreground">
              Instructions to run
            </label>
            <textarea
              id="hook-instructions"
              className={textareaLike}
              placeholder="Steps, commands, or prompts for the agent when this hook runs."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!hookName.trim() || !instructions.trim()}
            onClick={submit}
          >
            Add hook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
