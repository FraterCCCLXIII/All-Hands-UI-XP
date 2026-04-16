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
import { OPENHANDS_HOOKS_DOCS_URL } from '../../data/hooksCatalog';
import { showAppToast } from '../../lib/appToast';

const inputLike =
  'flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50';

const textareaLike =
  'min-h-[120px] w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2';

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
          <DialogTitle>Add From Repository</DialogTitle>
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

export const MCP_SERVER_TYPES = [
  { value: 'stdio', label: 'stdio' },
  { value: 'http', label: 'HTTP' },
  { value: 'sse', label: 'SSE' },
  { value: 'websocket', label: 'WebSocket' },
] as const;

export function mcpServerTypeLabel(value: string): string {
  return MCP_SERVER_TYPES.find((t) => t.value === value)?.label ?? value;
}

export type AddMcpServerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Persist row in Settings (or elsewhere); when omitted, only the success toast runs (e.g. Extensions catalog). */
  onAdd?: (payload: { name: string; serverType: string; url: string; apiKey: string }) => void;
  /** When set with initialValues, modal is in edit mode and calls onEdit on save. */
  editingId?: string | null;
  initialValues?: { name: string; serverType: string; url: string; hasApiKey: boolean } | null;
  onEdit?: (id: string, payload: { name: string; serverType: string; url: string; apiKey: string }) => void;
};

export function AddMcpServerModal({
  open,
  onOpenChange,
  onAdd,
  editingId = null,
  initialValues = null,
  onEdit,
}: AddMcpServerModalProps) {
  const [name, setName] = useState('');
  const [serverType, setServerType] = useState<string>('http');
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  const isEdit = Boolean(editingId);

  useEffect(() => {
    if (!open) return;
    if (editingId && initialValues) {
      setName(initialValues.name);
      setServerType(initialValues.serverType);
      setUrl(initialValues.url);
      setApiKey('');
    } else if (!editingId) {
      setName('');
      setServerType('http');
      setUrl('');
      setApiKey('');
    }
    // Intentionally omit initialValues: avoid resetting the form when the row object updates (e.g. toggles) while open.
  }, [open, editingId]);

  const submit = () => {
    const trimmedName = name.trim();
    const trimmed = url.trim();
    if (!trimmedName || !trimmed) return;
    if (serverType !== 'stdio') {
      try {
        new URL(trimmed);
      } catch {
        showAppToast({ variant: 'error', message: 'Enter a valid server URL.' });
        return;
      }
    }
    const payload = { name: trimmedName, serverType, url: trimmed, apiKey: apiKey.trim() };
    onOpenChange(false);
    if (editingId) {
      onEdit?.(editingId, payload);
      showAppToast({ variant: 'success', message: 'MCP server updated.' });
    } else {
      onAdd?.(payload);
      showAppToast({ variant: 'success', message: 'MCP server added.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit MCP Server' : 'Add MCP Server'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update connection details. Leave API key blank to keep the existing key.'
              : 'Configure how to reach this Model Context Protocol server.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div>
            <label htmlFor="mcp-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Name
            </label>
            <Input
              id="mcp-name"
              placeholder="e.g. My MCP server"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>
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
              placeholder={
                isEdit && initialValues?.hasApiKey && !apiKey
                  ? 'Leave blank to keep existing'
                  : '••••••••'
              }
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
          <Button type="button" size="sm" disabled={!name.trim() || !url.trim()} onClick={submit}>
            {isEdit ? 'Save' : 'Add Server'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type AddHookModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, called with trimmed values after validation; use for persisting (e.g. org settings table). */
  onAdd?: (payload: { name: string; instructions: string }) => void;
  editingId?: string | null;
  initialValues?: { name: string; notes: string } | null;
  onEdit?: (id: string, payload: { name: string; instructions: string }) => void;
};

export function AddHookModal({
  open,
  onOpenChange,
  onAdd,
  editingId = null,
  initialValues = null,
  onEdit,
}: AddHookModalProps) {
  const [hookName, setHookName] = useState('');
  const [instructions, setInstructions] = useState('');

  const isEdit = Boolean(editingId);

  useEffect(() => {
    if (!open) return;
    if (editingId && initialValues) {
      setHookName(initialValues.name);
      setInstructions(initialValues.notes);
    } else if (!editingId) {
      setHookName('');
      setInstructions('');
    }
  }, [open, editingId]);

  const submit = () => {
    const name = hookName.trim();
    if (!name) return;
    const instr = instructions.trim();
    onOpenChange(false);
    if (editingId) {
      onEdit?.(editingId, { name, instructions: instr });
      showAppToast({ variant: 'success', message: 'Hook recipe updated.' });
    } else {
      onAdd?.({ name, instructions: instr });
      showAppToast({ variant: 'success', message: 'Hook recipe saved.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit hook recipe' : 'Add hook recipe'}</DialogTitle>
          <DialogDescription>
            OpenHands hooks are shell commands registered in{' '}
            <code className="rounded bg-muted px-1 py-px font-mono text-xs">.openhands/hooks.json</code> — they run
            at tool use, prompts, stop, or session boundaries (see{' '}
            <a
              href={OPENHANDS_HOOKS_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-2"
            >
              hooks documentation
            </a>
            ). Use this form to capture a workspace note; wire scripts in your repository.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div>
            <label htmlFor="hook-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Display name
            </label>
            <Input
              id="hook-name"
              placeholder="e.g. lint_on_stop"
              value={hookName}
              onChange={(e) => setHookName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="hook-instructions" className="mb-1.5 block text-sm font-medium text-foreground">
              Script path or notes
            </label>
            <textarea
              id="hook-instructions"
              className={textareaLike}
              placeholder=".openhands/hooks/lint_on_stop.sh — or notes for your team."
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
          <Button type="button" size="sm" disabled={!hookName.trim()} onClick={submit}>
            {isEdit ? 'Save changes' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
