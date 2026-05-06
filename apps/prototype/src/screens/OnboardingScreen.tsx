import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  CalendarClock,
  Check,
  ChevronRight,
  Cpu,
  Github,
  MessageSquarePlus,
  Play,
  Sparkles,
  Zap,
} from 'lucide-react';

import { cn } from '../lib/utils';
import { navigateAppRoute } from '../lib/captureNavigation';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

type OnboardingPreset = {
  id: string;
  title: string;
  description: string;
  trigger: 'schedule' | 'event';
  triggerLabel: string;
  target?: string;
};

type OnboardingModule = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  primaryAction: {
    label: string;
    type: 'route' | 'external' | 'start-conversation';
    target?: string;
  };
  hidePrimaryAction?: boolean;
  presets?: OnboardingPreset[];
};

const onboardingModules: OnboardingModule[] = [
  {
    id: 'welcome',
    title: 'Welcome to OpenHands',
    description: 'Welcome to OpenHands. Review the documentation to learn how to set up your workspace and start building.',
    icon: Sparkles,
    primaryAction: {
      label: 'Read documentation',
      type: 'external',
      target: 'https://docs.openhands.dev/',
    },
  },
  {
    id: 'connect-git',
    title: 'Connect Git',
    description: 'Connect your repositories so OpenHands can work with code, branches, and pull requests.',
    icon: Github,
    primaryAction: {
      label: 'Connect Git',
      type: 'route',
      target: '/settings/integrations',
    },
  },
  {
    id: 'agent-llm',
    title: 'Add Your Agent and LLM',
    description: 'Finish agent and model setup if it was not completed in the first setup wizard.',
    icon: Cpu,
    primaryAction: {
      label: 'Configure agent and LLM',
      type: 'route',
      target: '/settings/llm',
    },
  },
  {
    id: 'first-conversation',
    title: 'Start Your First Conversation',
    description: 'Open a new conversation and ask OpenHands to help with a concrete task in your workspace.',
    icon: MessageSquarePlus,
    primaryAction: {
      label: 'Start conversation',
      type: 'start-conversation',
    },
  },
  {
    id: 'skills',
    title: 'Add and Create Skills',
    description: 'Enable existing skills or create new ones that match your team workflows.',
    icon: Bot,
    primaryAction: {
      label: 'Open skills',
      type: 'route',
      target: '/settings/skills',
    },
  },
  {
    id: 'automations',
    title: 'Create an Automation',
    description: 'Turn recurring work into scheduled or event-driven OpenHands automations.',
    icon: Play,
    primaryAction: {
      label: 'Create automation',
      type: 'route',
      target: '/automations',
    },
    hidePrimaryAction: true,
    presets: [
      {
        id: 'pr-triage-digest',
        title: 'PR Triage Digest',
        description: 'Summarize new pull requests and flag risky changes every weekday morning.',
        trigger: 'schedule',
        triggerLabel: 'Weekdays at 9:00 AM',
        target: '/automations',
      },
      {
        id: 'nightly-security-pass',
        title: 'Nightly Security Pass',
        description: 'Run a repository scan and create a remediation summary for critical findings.',
        trigger: 'schedule',
        triggerLabel: 'Daily at 1:30 AM UTC',
        target: '/automations',
      },
      {
        id: 'docs-sync-on-push',
        title: 'Docs Sync on Push',
        description: 'Watch the docs repository and prepare a changelog-ready summary when pushes land.',
        trigger: 'event',
        triggerLabel: 'On push to main',
        target: '/automations',
      },
    ],
  },
];

interface OnboardingScreenProps {
  onStartConversationClick?: () => void;
}

export function OnboardingScreen({ onStartConversationClick }: OnboardingScreenProps) {
  const location = useLocation();
  const [activeModuleId, setActiveModuleId] = useState(onboardingModules[0]?.id ?? 'welcome');
  const [completedModuleIds, setCompletedModuleIds] = useState(
    () => new Set(onboardingModules[0] ? [onboardingModules[0].id] : [])
  );
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsWelcomeModalOpen(params.get('welcome') === '1');
  }, [location.search]);

  const completionCount = useMemo(
    () => completedModuleIds.size,
    [completedModuleIds]
  );

  const handleSelectModule = (moduleId: string) => {
    setActiveModuleId(moduleId);
    document.getElementById(moduleId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePrimaryAction = (module: OnboardingModule) => {
    const { primaryAction } = module;

    if (primaryAction.type === 'external' && primaryAction.target) {
      window.open(primaryAction.target, '_blank', 'noreferrer');
      return;
    }

    if (primaryAction.type === 'route' && primaryAction.target) {
      navigateAppRoute(primaryAction.target);
      return;
    }

    if (primaryAction.type === 'start-conversation') {
      onStartConversationClick?.();
    }
  };

  const handlePresetClick = (preset: OnboardingPreset) => {
    if (preset.target) {
      navigateAppRoute(preset.target);
    }
  };

  const handleMarkComplete = (moduleId: string) => {
    setCompletedModuleIds((prev) => new Set(prev).add(moduleId));
  };

  const handleWelcomeModalOpenChange = (open: boolean) => {
    setIsWelcomeModalOpen(open);
    if (!open) {
      const params = new URLSearchParams(location.search);
      if (params.get('welcome') === '1') {
        navigateAppRoute('/onboarding');
      }
    }
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-background text-foreground">
      <aside className="hidden w-72 shrink-0 border-r border-border bg-sidebar px-4 py-6 text-sidebar-foreground lg:block">
        <div className="sticky top-6 flex flex-col gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Onboarding</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Setup checklist</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {completionCount} of {onboardingModules.length} complete
            </p>
          </div>
          <nav className="flex flex-col gap-1" aria-label="Onboarding sections">
            {onboardingModules.map((module) => {
              const Icon = module.icon;
              const isActive = module.id === activeModuleId;
              const isComplete = completedModuleIds.has(module.id);

              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => handleSelectModule(module.id)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{module.title}</span>
                  {isComplete ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto scroll-smooth px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          <div className="flex flex-col gap-5">
            {onboardingModules.map((module) => {
              const Icon = module.icon;
              const isComplete = completedModuleIds.has(module.id);

              return (
                <section
                  key={module.id}
                  id={module.id}
                  className="scroll-mt-8 rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold text-foreground">{module.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p>
                      {module.presets && module.presets.length > 0 ? (
                        <ul className="mt-5 flex flex-col gap-2" aria-label={`${module.title} presets`}>
                          {module.presets.map((preset) => {
                            const TriggerIcon = preset.trigger === 'schedule' ? CalendarClock : Zap;
                            return (
                              <li key={preset.id}>
                                <button
                                  type="button"
                                  onClick={() => handlePresetClick(preset)}
                                  className="group flex w-full items-start gap-3 rounded-md border border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                    <span className="truncate text-sm font-medium text-foreground">{preset.title}</span>
                                    <span className="text-xs leading-5 text-muted-foreground">{preset.description}</span>
                                    <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                      <TriggerIcon className="h-3 w-3 shrink-0" aria-hidden />
                                      <span className="truncate">{preset.triggerLabel}</span>
                                    </span>
                                  </div>
                                  <ChevronRight
                                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                                    aria-hidden
                                  />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        {module.hidePrimaryAction ? null : (
                          <button
                            type="button"
                            onClick={() => handlePrimaryAction(module)}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            {module.primaryAction.label}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleMarkComplete(module.id)}
                          disabled={isComplete}
                          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 disabled:cursor-default disabled:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          {isComplete ? 'Completed' : 'Mark as complete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>

      <Dialog open={isWelcomeModalOpen} onOpenChange={handleWelcomeModalOpenChange}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Welcome to OpenHands</DialogTitle>
            <DialogDescription>
              Your initial setup is complete. Continue with onboarding to connect key workflows and start your first task.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => handleWelcomeModalOpenChange(false)}>
              Get started
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
