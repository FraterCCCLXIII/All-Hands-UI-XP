import { useEffect, useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';

import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';

type NewNuxStep = 'agent-provider' | 'llm-key';

type AgentProviderId = 'openhands' | 'claude-code' | 'codex' | 'custom';

interface NewNuxFlowProps {
  onBack?: () => void;
  onComplete?: () => void;
}

const baseSteps: { id: NewNuxStep; label: string }[] = [
  { id: 'agent-provider', label: 'Agent Provider' },
];

const agentProviders: {
  id: AgentProviderId;
  title: string;
  description: string;
}[] = [
  {
    id: 'openhands',
    title: 'OpenHands',
    description: 'Use OpenHands with your own LLM key for model requests.',
  },
  {
    id: 'claude-code',
    title: 'Claude Code',
    description: 'Use your Claude Code setup for agent execution.',
  },
  {
    id: 'codex',
    title: 'Codex',
    description: 'Use your Codex setup for agent execution.',
  },
  {
    id: 'custom',
    title: 'Custom LLM',
    description: 'Use your own LLM provider configuration.',
  },
];

const customLlmProviderOptions = [
  { id: 'openai', label: 'OpenAI compatible' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'google', label: 'Google Gemini' },
  { id: 'azure-openai', label: 'Azure OpenAI' },
  { id: 'openrouter', label: 'OpenRouter' },
  { id: 'ollama', label: 'Ollama (local)' },
  { id: 'lm-studio', label: 'LM Studio (local)' },
  { id: 'litellm', label: 'LiteLLM proxy' },
  { id: 'groq', label: 'Groq' },
  { id: 'mistral', label: 'Mistral' },
  { id: 'other', label: 'Other' },
] as const;

export function NewNuxFlow({ onBack, onComplete }: NewNuxFlowProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [agentProvider, setAgentProvider] = useState<AgentProviderId>('openhands');
  const [llmKey, setLlmKey] = useState('');
  const [customLlmProvider, setCustomLlmProvider] = useState<(typeof customLlmProviderOptions)[number]['id'] | ''>('');
  const [customLlmBaseUrl, setCustomLlmBaseUrl] = useState('');
  const [customLlmApiKey, setCustomLlmApiKey] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [providerConnected, setProviderConnected] = useState(false);
  const [showMagicLinkSetupHelp, setShowMagicLinkSetupHelp] = useState(false);
  const llmKeyRequired = agentProvider === 'openhands';
  const customLlmKeyRequired = agentProvider === 'custom';
  const magicLinkRequired = agentProvider === 'claude-code' || agentProvider === 'codex';
  const hasSetupStep = llmKeyRequired || customLlmKeyRequired || magicLinkRequired;
  const steps: { id: NewNuxStep; label: string }[] = hasSetupStep
    ? [baseSteps[0], { id: 'llm-key', label: llmKeyRequired ? 'LLM Key' : 'Setup' }]
    : baseSteps;

  const activeStep = steps[activeStepIndex]?.id ?? 'agent-provider';
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === steps.length - 1;
  const isStepComplete =
    activeStep !== 'llm-key' ||
    (llmKeyRequired
      ? llmKey.trim().length > 0
      : customLlmKeyRequired
        ? customLlmProvider.length > 0 && customLlmBaseUrl.trim().length > 0 && customLlmApiKey.trim().length > 0
        : providerConnected);
  const magicLinkProviderLabel = agentProvider === 'claude-code' ? 'Claude Code' : 'Codex';

  useEffect(() => {
    setActiveStepIndex((current) => Math.min(current, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    setMagicLinkSent(false);
    setProviderConnected(false);
    setShowMagicLinkSetupHelp(false);
  }, [agentProvider]);

  const handleNext = () => {
    if (!isStepComplete) {
      return;
    }

    if (isLastStep) {
      onComplete?.();
      return;
    }

    setActiveStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    if (isFirstStep) {
      onBack?.();
      return;
    }

    setActiveStepIndex((current) => Math.max(current - 1, 0));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background px-6 py-8 text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <button
          type="button"
          onClick={handlePrevious}
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {isFirstStep ? 'Back' : 'Previous'}
        </button>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <Logo className="h-12 w-12 text-foreground" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Set up OpenHands</h1>
            </div>
          </div>

          <section className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm">
            {activeStep === 'agent-provider' ? (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Select your Agent Provider</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Pick how you want to run agents for this workspace.
                  </p>
                </div>
                <div className="grid gap-3">
                  {agentProviders.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => setAgentProvider(provider.id)}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                        agentProvider === provider.id
                          ? 'border-foreground bg-muted/50'
                          : 'border-border bg-background/40 hover:bg-muted/40'
                      )}
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border">
                        {agentProvider === provider.id ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-foreground">{provider.title}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {activeStep === 'llm-key' ? (
              <div className="flex flex-col gap-5">
                <div>
                  {llmKeyRequired ? (
                    <>
                      <h2 className="text-xl font-semibold text-foreground">Add your OpenHands LLM key</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Paste the API key OpenHands should use for model requests. You can update this later in settings.
                      </p>
                    </>
                  ) : customLlmKeyRequired ? (
                    <>
                      <h2 className="text-xl font-semibold text-foreground">Configure your custom LLM</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Select a provider, then add a base URL and API key. This supports local and remote endpoints.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold text-foreground">Connect {magicLinkProviderLabel}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Confirm access with a magic link, then continue when your account is connected.
                      </p>
                    </>
                  )}
                </div>
                {llmKeyRequired ? (
                  <div>
                    <label htmlFor="new-nux-llm-key" className="mb-1.5 block text-sm font-medium text-foreground">
                      LLM API Key
                    </label>
                    <Input
                      id="new-nux-llm-key"
                      type="password"
                      value={llmKey}
                      onChange={(event) => setLlmKey(event.target.value)}
                      placeholder="sk-..."
                      autoComplete="off"
                    />
                  </div>
                ) : customLlmKeyRequired ? (
                  <div className="grid gap-4">
                    <div>
                      <label htmlFor="new-nux-custom-llm-provider" className="mb-1.5 block text-sm font-medium text-foreground">
                        Provider
                      </label>
                      <select
                        id="new-nux-custom-llm-provider"
                        className="h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={customLlmProvider}
                        onChange={(event) => setCustomLlmProvider(event.target.value)}
                      >
                        <option value="">Select a provider</option>
                        {customLlmProviderOptions.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="new-nux-custom-llm-base-url" className="mb-1.5 block text-sm font-medium text-foreground">
                        Base URL
                      </label>
                      <Input
                        id="new-nux-custom-llm-base-url"
                        value={customLlmBaseUrl}
                        onChange={(event) => setCustomLlmBaseUrl(event.target.value)}
                        placeholder="https://api.openai.com/v1 or http://localhost:11434/v1"
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-nux-custom-llm-key" className="mb-1.5 block text-sm font-medium text-foreground">
                        API Key
                      </label>
                      <Input
                        id="new-nux-custom-llm-key"
                        type="password"
                        value={customLlmApiKey}
                        onChange={(event) => setCustomLlmApiKey(event.target.value)}
                        placeholder="Enter API key"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="rounded-lg border border-border bg-background/40 p-4">
                      <p className="text-sm text-foreground">
                        {providerConnected
                          ? `${magicLinkProviderLabel} is connected.`
                          : magicLinkSent
                            ? 'Magic link sent. Open it to approve this connection, then return here.'
                            : `Send a magic link to connect your ${magicLinkProviderLabel} account.`}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {!providerConnected ? (
                          <Button
                            type="button"
                            variant={magicLinkSent ? 'outline' : 'default'}
                            onClick={() => setMagicLinkSent(true)}
                          >
                            {magicLinkSent ? 'Resend magic link' : 'Send magic link'}
                          </Button>
                        ) : null}
                        {magicLinkSent && !providerConnected ? (
                          <Button type="button" variant="outline" onClick={() => setProviderConnected(true)}>
                            I connected my account
                          </Button>
                        ) : null}
                        {providerConnected ? (
                          <Button type="button" variant="outline" onClick={() => setProviderConnected(false)}>
                            Disconnect
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {!providerConnected ? (
                      <div className="rounded-lg border border-border bg-background/40 p-4">
                        <button
                          type="button"
                          className="text-sm font-medium text-foreground underline-offset-2 hover:underline"
                          onClick={() => setShowMagicLinkSetupHelp((current) => !current)}
                        >
                          {showMagicLinkSetupHelp
                            ? `Hide ${magicLinkProviderLabel} setup help`
                            : `${magicLinkProviderLabel} not set up yet?`}
                        </button>
                        {showMagicLinkSetupHelp ? (
                          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <p>1. Install and sign in to {magicLinkProviderLabel}.</p>
                            <p>2. Return here and send the magic link.</p>
                            <p>3. Approve the link, then click &ldquo;I connected my account&rdquo;.</p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-8 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={handlePrevious}>
                {isFirstStep ? 'Skip' : 'Back'}
              </Button>
              <Button type="button" className="flex-1" onClick={handleNext} disabled={!isStepComplete}>
                {isLastStep ? 'Complete' : 'Continue'}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
