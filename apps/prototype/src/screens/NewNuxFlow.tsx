import { useEffect, useState } from 'react';
import { Check, ChevronLeft, Loader2, Settings } from 'lucide-react';

import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';

type NewNuxStep = 'agent-provider' | 'llm-key';

type AgentProviderId = 'openhands' | 'claude-code' | 'codex';

type LocalProviderState = 'connecting' | 'connected' | 'not-found';

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
  const [localProviderState, setLocalProviderState] = useState<LocalProviderState>('connecting');
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const llmKeyRequired = agentProvider === 'openhands';
  const localProviderRequired = agentProvider === 'claude-code' || agentProvider === 'codex';
  const hasSetupStep = llmKeyRequired || localProviderRequired;
  const steps: { id: NewNuxStep; label: string }[] = hasSetupStep
    ? [baseSteps[0], { id: 'llm-key', label: llmKeyRequired ? 'LLM Key' : 'Setup' }]
    : baseSteps;

  const activeStep = steps[activeStepIndex]?.id ?? 'agent-provider';
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === steps.length - 1;
  const isStepComplete =
    activeStep !== 'llm-key' ||
    (llmKeyRequired ? llmKey.trim().length > 0 : localProviderState === 'connected');
  const localProviderLabel = agentProvider === 'claude-code' ? 'Claude Code' : 'Codex';
  const showScenarioToggle = localProviderRequired && activeStep === 'llm-key';

  useEffect(() => {
    setActiveStepIndex((current) => Math.min(current, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    setShowScenarioMenu(false);
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
