import { useEffect, useState } from 'react';
import { Check, ChevronLeft, Loader2, Settings } from 'lucide-react';

import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { NativeSelect } from '../components/ui/native-select';
import { cn } from '../lib/utils';

type NewNuxStep = 'agent-provider' | 'llm-key';

type AgentProviderId = 'openhands' | 'claude-code' | 'codex';

type LocalProviderState = 'connecting' | 'connected' | 'not-found';
type OpenHandsLlmProvider = 'openai' | 'anthropic' | 'litellm';

const localProviderStateOptions: { id: LocalProviderState; label: string }[] = [
  { id: 'connecting', label: 'Connecting' },
  { id: 'connected', label: 'Connected' },
  { id: 'not-found', label: 'Not found' },
];

interface NewNuxFlowProps {
  onBack?: () => void;
  onComplete?: () => void;
}

const baseSteps: { id: NewNuxStep; label: string }[] = [
  { id: 'agent-provider', label: 'Agent Provider' },
];

const openHandsLlmProviderOptions: { id: OpenHandsLlmProvider; label: string }[] = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'litellm', label: 'LiteLLM' },
];

const openHandsLlmModelOptions: Record<OpenHandsLlmProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4.1', 'gpt-5'],
  anthropic: ['claude-sonnet-4', 'claude-opus-4.1', 'claude-3.7-sonnet'],
  litellm: ['litellm_proxy/prod/claude-opus-4-5-20251101', 'litellm_proxy/prod/gpt-4o'],
};

const CodexLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    fillRule="evenodd"
    viewBox="0 0 24 24"
    className={className}
    aria-hidden
  >
    <path
      clipRule="evenodd"
      d="M8.086.457a6.105 6.105 0 013.046-.415c1.333.153 2.521.72 3.564 1.7a.117.117 0 00.107.029c1.408-.346 2.762-.224 4.061.366l.063.03.154.076c1.357.703 2.33 1.77 2.918 3.198.278.679.418 1.388.421 2.126a5.655 5.655 0 01-.18 1.631.167.167 0 00.04.155 5.982 5.982 0 011.578 2.891c.385 1.901-.01 3.615-1.183 5.14l-.182.22a6.063 6.063 0 01-2.934 1.851.162.162 0 00-.108.102c-.255.736-.511 1.364-.987 1.992-1.199 1.582-2.962 2.462-4.948 2.451-1.583-.008-2.986-.587-4.21-1.736a.145.145 0 00-.14-.032c-.518.167-1.04.191-1.604.185a5.924 5.924 0 01-2.595-.622 6.058 6.058 0 01-2.146-1.781c-.203-.269-.404-.522-.551-.821a7.74 7.74 0 01-.495-1.283 6.11 6.11 0 01-.017-3.064.166.166 0 00.008-.074.115.115 0 00-.037-.064 5.958 5.958 0 01-1.38-2.202 5.196 5.196 0 01-.333-1.589 6.915 6.915 0 01.188-2.132c.45-1.484 1.309-2.648 2.577-3.493.282-.188.55-.334.802-.438.286-.12.573-.22.861-.304a.129.129 0 00.087-.087A6.016 6.016 0 015.635 2.31C6.315 1.464 7.132.846 8.086.457zm-.804 7.85a.848.848 0 00-1.473.842l1.694 2.965-1.688 2.848a.849.849 0 001.46.864l1.94-3.272a.849.849 0 00.007-.854l-1.94-3.393zm5.446 6.24a.849.849 0 000 1.695h4.848a.849.849 0 000-1.696h-4.848z"
    />
  </svg>
);

const ClaudeCodeLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 -.01 39.5 39.53" className={className} aria-hidden>
    <path
      d="m7.75 26.27 7.77-4.36.13-.38-.13-.21h-.38l-1.3-.08-4.44-.12-3.85-.16-3.73-.2-.94-.2-.88-1.16.09-.58.79-.53 1.13.1 2.5.17 3.75.26 2.72.16 4.03.42h.64l.09-.26-.22-.16-.17-.16-3.88-2.63-4.2-2.78-2.2-1.6-1.19-.81-.6-.76-.26-1.66 1.08-1.19 1.45.1.37.1 1.47 1.13 3.14 2.43 4.1 3.02.6.5.24-.17.03-.12-.27-.45-2.23-4.03-2.38-4.1-1.06-1.7-.28-1.02c-.1-.42-.17-.77-.17-1.2l1.23-1.67.68-.22 1.64.22.69.6 1.02 2.33 1.65 3.67 2.56 4.99.75 1.48.4 1.37.15.42h.26v-.24l.21-2.81.39-3.45.38-4.44.13-1.25.62-1.5 1.23-.81.96.46.79 1.13-.11.73-.47 3.05-.92 4.78-.6 3.2h.35l.4-.4 1.62-2.15 2.72-3.4 1.2-1.35 1.4-1.49.9-.71h1.7l1.25 1.86-.56 1.92-1.75 2.22-1.45 1.88-2.08 2.8-1.3 2.24.12.18.31-.03 4.7-1 2.54-.46 3.03-.52 1.37.64.15.65-.54 1.33-3.24.8-3.8.76-5.66 1.34-.07.05.08.1 2.55.24 1.09.06h2.67l4.97.37 1.3.86.78 1.05-.13.8-2 1.02-2.7-.64-6.3-1.5-2.16-.54h-.3v.18l1.8 1.76 3.3 2.98 4.13 3.84.21.95-.53.75-.56-.08-3.63-2.73-1.4-1.23-3.17-2.67h-.21v.28l.73 1.07 3.86 5.8.2 1.78-.28.58-1 .35-1.1-.2-2.26-3.17-2.33-3.57-1.88-3.2-.23.13-1.11 11.95-.52.61-1.2.46-1-.76-.53-1.23.53-2.43.64-3.17.52-2.52.47-3.13.28-1.04-.02-.07-.23.03-2.36 3.24-3.59 4.85-2.84 3.04-.68.27-1.18-.61.11-1.09.66-.97 3.93-5 2.37-3.1 1.53-1.79-.01-.26h-.09l-10.44 6.78-1.86.24-.8-.75.1-1.23.38-.4 3.14-2.16z"
      fill="currentColor"
    />
  </svg>
);

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
];

export function NewNuxFlow({ onBack, onComplete }: NewNuxFlowProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [agentProvider, setAgentProvider] = useState<AgentProviderId>('openhands');
  const [llmKey, setLlmKey] = useState('');
  const [openHandsProvider, setOpenHandsProvider] = useState<OpenHandsLlmProvider | ''>('');
  const [openHandsModel, setOpenHandsModel] = useState('');
  const [localProviderState, setLocalProviderState] = useState<LocalProviderState>('connecting');
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const llmKeyRequired = agentProvider === 'openhands';
  const localProviderRequired = agentProvider === 'claude-code' || agentProvider === 'codex';
  const hasSetupStep = llmKeyRequired || localProviderRequired;
  const steps: { id: NewNuxStep; label: string }[] = hasSetupStep
    ? [baseSteps[0], { id: 'llm-key', label: llmKeyRequired ? 'LLM Key' : 'Setup' }]
    : baseSteps;

  const activeStep = steps[activeStepIndex]?.id ?? 'agent-provider';
  const openHandsModelChoices = openHandsProvider ? openHandsLlmModelOptions[openHandsProvider] : [];
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === steps.length - 1;
  const isStepComplete =
    activeStep !== 'llm-key' ||
    (llmKeyRequired
      ? llmKey.trim().length > 0 && openHandsProvider.length > 0 && openHandsModel.trim().length > 0
      : localProviderState === 'connected');
  const localProviderLabel = agentProvider === 'claude-code' ? 'Claude Code' : 'Codex';
  const showScenarioToggle = localProviderRequired && activeStep === 'llm-key';

  useEffect(() => {
    setActiveStepIndex((current) => Math.min(current, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    setShowScenarioMenu(false);
  }, [agentProvider]);

  useEffect(() => {
    if (!openHandsProvider) {
      setOpenHandsModel('');
      return;
    }
    if (!openHandsLlmModelOptions[openHandsProvider].includes(openHandsModel)) {
      setOpenHandsModel('');
    }
  }, [openHandsProvider, openHandsModel]);

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
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        {provider.id === 'openhands' ? (
                          <Logo className="h-[1.375rem] w-[1.375rem] shrink-0 text-foreground" />
                        ) : provider.id === 'codex' ? (
                          <CodexLogo className="h-4 w-4 shrink-0 text-foreground" />
                        ) : (
                          <ClaudeCodeLogo className="h-4 w-4 shrink-0 text-foreground" />
                        )}
                        <span className="block text-sm font-medium text-foreground">{provider.title}</span>
                      </span>
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border">
                        {agentProvider === provider.id ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
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
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold text-foreground">Connect {localProviderLabel}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        OpenHands will detect {localProviderLabel} once it&rsquo;s running on your machine.
                      </p>
                    </>
                  )}
                </div>
                {llmKeyRequired ? (
                  <div className="flex flex-col gap-6" data-testid="llm-settings-form-basic">
                    <div className="flex w-full max-w-[680px] flex-col gap-6 md:flex-row md:justify-between md:gap-[46px]">
                      <fieldset className="flex w-full flex-col gap-2.5">
                        <label htmlFor="new-nux-llm-provider" className="text-sm text-foreground">
                          LLM Provider
                        </label>
                        <NativeSelect
                          id="new-nux-llm-provider"
                          data-testid="llm-provider-input"
                          aria-label="LLM Provider"
                          value={openHandsProvider}
                          onChange={(event) => setOpenHandsProvider(event.target.value as OpenHandsLlmProvider | '')}
                        >
                          <option value="">Select a provider</option>
                          {openHandsLlmProviderOptions.map((providerOption) => (
                            <option key={providerOption.id} value={providerOption.id}>
                              {providerOption.label}
                            </option>
                          ))}
                        </NativeSelect>
                      </fieldset>
                      <fieldset className="flex w-full flex-col gap-2.5">
                        <label htmlFor="new-nux-llm-model" className="text-sm text-foreground">
                          LLM Model
                        </label>
                        <NativeSelect
                          id="new-nux-llm-model"
                          data-testid="llm-model-input"
                          aria-label="LLM Model"
                          value={openHandsModel}
                          onChange={(event) => setOpenHandsModel(event.target.value)}
                          disabled={!openHandsProvider}
                        >
                          <option value="">Select a model</option>
                          {openHandsModelChoices.map((modelOption) => (
                            <option key={modelOption} value={modelOption}>
                              {modelOption}
                            </option>
                          ))}
                        </NativeSelect>
                      </fieldset>
                    </div>
                    <label className="flex w-full flex-col gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground">API Key</span>
                      </div>
                      <Input
                        id="new-nux-llm-key"
                        data-testid="llm-api-key-input"
                        type="password"
                        value={llmKey}
                        onChange={(event) => setLlmKey(event.target.value)}
                        placeholder=""
                        autoComplete="off"
                        className="max-w-[680px]"
                      />
                    </label>
                    <p data-testid="llm-api-key-help-anchor" className="text-xs text-muted-foreground">
                      Don&apos;t know your API key?{' '}
                      <a
                        href="https://docs.openhands.dev/usage/local-setup#getting-an-api-key"
                        rel="noreferrer noopener"
                        target="_blank"
                        className="underline underline-offset-2"
                      >
                        Click here for instructions
                      </a>
                    </p>
                  </div>
                ) : localProviderState === 'connected' ? (
                  <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background/40 p-6 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white">
                      <Check className="h-5 w-5 text-white" aria-hidden />
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      {localProviderLabel} is connected and ready to use with OpenHands.
                    </p>
                  </div>
                ) : localProviderState === 'connecting' ? (
                  <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background/40 p-6 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
                    <p className="text-sm text-muted-foreground">
                      Detecting {localProviderLabel} on your machine&hellip;
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-6 text-center">
                    <p className="text-sm font-medium text-foreground">
                      Activate {localProviderLabel} locally to make it available to OpenHands.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Install and sign in to {localProviderLabel} on this machine. OpenHands will detect it
                      automatically once it&rsquo;s running.
                    </p>
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

      {showScenarioToggle ? (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
          {showScenarioMenu ? (
            <div
              role="menu"
              className="mb-2 flex min-w-[10rem] flex-col gap-0.5 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
            >
              {localProviderStateOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={localProviderState === option.id}
                  className={cn(
                    'rounded-sm px-3 py-1.5 text-left text-xs transition-colors',
                    localProviderState === option.id
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                  onClick={() => {
                    setLocalProviderState(option.id);
                    setShowScenarioMenu(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            aria-label="Toggle prototype scenario"
            aria-expanded={showScenarioMenu}
            onClick={() => setShowScenarioMenu((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <Settings className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
