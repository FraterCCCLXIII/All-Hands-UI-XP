import type { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';
import { CondensationSettings } from './CondensationSettings';

interface AdvancedLlmFormProps {
  model: string;
  baseUrl: string;
  onModelChange: (value: string) => void;
  onBaseUrlChange: (value: string) => void;
  isValidModelName: boolean;
  isValidBaseUrl: boolean;
  enableCondenser: boolean;
  onEnableCondenserChange: (value: boolean) => void;
  enableConfirmation: boolean;
  onEnableConfirmationChange: (value: boolean) => void;
  footerContent?: ReactNode;
  apiKeyPlaceholder?: string;
  showApiKeyCheck?: boolean;
  apiKeyValue?: string;
  onApiKeyChange?: (value: string) => void;
  apiKeyRightSlot?: ReactNode;
  apiKeyCheckOffsetClass?: string;
}

export function AdvancedLlmForm({
  model,
  baseUrl,
  onModelChange,
  onBaseUrlChange,
  isValidModelName,
  isValidBaseUrl,
  enableCondenser,
  onEnableCondenserChange,
  enableConfirmation,
  onEnableConfirmationChange,
  footerContent,
  apiKeyPlaceholder = '••••••••••',
  showApiKeyCheck = true,
  apiKeyValue,
  onApiKeyChange,
  apiKeyRightSlot,
  apiKeyCheckOffsetClass = 'right-3',
}: AdvancedLlmFormProps) {
  return (
    <>
      <label className="flex flex-col gap-2.5 w-full max-w-[680px]">
        <span className="text-sm text-foreground">Custom Model</span>
        <input
          placeholder="openhands/claude-opus-4-5-20251101"
          className="h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30"
          type="text"
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          aria-invalid={!isValidModelName}
        />
        {!isValidModelName && (
          <span className="text-xs text-destructive">
            Model names must be non-empty and not contain spaces. Invalid models typically return 404 model_not_found.
          </span>
        )}
      </label>

      <label className="flex flex-col gap-2.5 w-full max-w-[680px]">
        <span className="text-sm text-foreground">Base URL</span>
        <input
          placeholder="https://api.openai.com"
          className="h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30"
          type="text"
          value={baseUrl}
          onChange={(e) => onBaseUrlChange(e.target.value)}
          aria-invalid={!isValidBaseUrl}
        />
        {!isValidBaseUrl && (
          <span className="text-xs text-destructive">
            Use a valid http(s) URL. Incorrect base URLs typically return 404 Not Found for API requests.
          </span>
        )}
      </label>

      <label className="flex flex-col gap-2.5 w-full max-w-[680px]">
        <span className="text-sm text-foreground">API Key</span>
        <div className="relative w-full">
          <input
            placeholder={apiKeyPlaceholder}
            className="h-10 w-full rounded-md border border-border bg-muted/40 pl-3 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30"
            type="password"
            value={apiKeyValue}
            onChange={onApiKeyChange ? (event) => onApiKeyChange(event.target.value) : undefined}
          />
          {apiKeyRightSlot}
          {showApiKeyCheck && (
            <CheckCircle
              className={`absolute ${apiKeyCheckOffsetClass} top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none`}
              aria-hidden
            />
          )}
        </div>
      </label>

      <p className="text-xs text-muted-foreground">
        Don't know your API key?{' '}
        <a
          href="https://docs.all-hands.dev/usage/local-setup#getting-an-api-key"
          rel="noreferrer noopener"
          target="_blank"
          className="underline underline-offset-2 text-white hover:text-gray-300"
        >
          Click here for instructions
        </a>
      </p>

      {footerContent}

      <CondensationSettings
        enableCondenser={enableCondenser}
        onEnableCondenserChange={onEnableCondenserChange}
        enableConfirmation={enableConfirmation}
        onEnableConfirmationChange={onEnableConfirmationChange}
      />
    </>
  );
}
