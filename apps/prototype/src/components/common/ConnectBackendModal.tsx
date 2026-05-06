import { useEffect, useState } from 'react';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { EnvironmentColorPicker } from './EnvironmentColorPicker';

export interface ConnectBackendValues {
  nickname: string;
  url: string;
  apiKey: string;
  color: string;
}

export interface ConnectBackendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When `'edit'`, swaps title/submit copy and the API-key placeholder. Defaults to `'create'`. */
  mode?: 'create' | 'edit';
  /** Pre-fills the form when opened. Re-applied on each open. */
  initialValues?: Partial<ConnectBackendValues>;
  /** Submit handler; receives trimmed values. The modal closes itself afterwards. */
  onSubmit: (values: ConnectBackendValues) => void;
}

const DEFAULT_COLOR = '#3b82f6';

/**
 * Shared modal for connecting/editing an OpenHands backend.
 * Used from the LeftNav environment selector and the Backend Server settings tab.
 */
export function ConnectBackendModal({
  open,
  onOpenChange,
  mode = 'create',
  initialValues,
  onSubmit,
}: ConnectBackendModalProps) {
  const [nickname, setNickname] = useState(initialValues?.nickname ?? '');
  const [url, setUrl] = useState(initialValues?.url ?? '');
  const [apiKey, setApiKey] = useState(initialValues?.apiKey ?? '');
  const [color, setColor] = useState(initialValues?.color ?? DEFAULT_COLOR);

  useEffect(() => {
    if (!open) return;
    setNickname(initialValues?.nickname ?? '');
    setUrl(initialValues?.url ?? '');
    setApiKey(initialValues?.apiKey ?? '');
    setColor(initialValues?.color ?? DEFAULT_COLOR);
  }, [open, initialValues?.nickname, initialValues?.url, initialValues?.apiKey, initialValues?.color]);

  const isEdit = mode === 'edit';
  const submitDisabled = !nickname.trim() || !url.trim();

  const handleSubmit = () => {
    if (submitDisabled) return;
    onSubmit({
      nickname: nickname.trim(),
      url: url.trim(),
      apiKey: apiKey.trim(),
      color,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit backend' : 'Connect a new backend'}</DialogTitle>
          <DialogDescription>
            Add a local or self-hosted OpenHands backend by URL and API key.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="connect-backend-nickname" className="text-sm font-medium text-foreground">
              Nickname
            </label>
            <Input
              id="connect-backend-nickname"
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="Production"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="connect-backend-url" className="text-sm font-medium text-foreground">
              Backend URL
            </label>
            <Input
              id="connect-backend-url"
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://your-instance.example.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="connect-backend-api-key" className="text-sm font-medium text-foreground">
              API Key
            </label>
            <Input
              id="connect-backend-api-key"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={isEdit ? 'Leave blank to keep existing key' : 'Enter your API key...'}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="connect-backend-color" className="text-sm font-medium text-foreground">
              Environment color
            </label>
            <EnvironmentColorPicker
              swatchId="connect-backend-color"
              value={color}
              onChange={setColor}
              fallbackHex={DEFAULT_COLOR}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitDisabled}>
            {isEdit ? 'Save changes' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
