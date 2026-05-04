import React, { useMemo, useState } from 'react';
import {
  Bot,
  Check,
  Cloud,
  Github,
  Key,
  LockKeyhole,
  Play,
  Settings,
  Sparkles,
} from 'lucide-react';

import { cn } from '../lib/utils';

type OnboardingStepStatus = 'done' | 'current' | 'todo';

type OnboardingModule = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: OnboardingStepStatus;
  tasks: string[];
};

const onboardingModules: OnboardingModule[] = [
  {
    id: 'welcome',
    title: 'Welcome to OpenHands',
    description: 'Get familiar with the workspace, navigation, and where conversations live.',
    icon: Sparkles,
    status: 'done',
    tasks: ['Review the left navigation', 'Open the New conversation flow', 'Find recent conversations'],
  },
  {
    id: 'connect-git',
    title: 'Connect Git',
    description: 'Connect your repositories so OpenHands can work with code, branches, and pull requests.',
    icon: Github,
    status: 'current',
    tasks: ['Connect GitHub or GitLab', 'Choose a default organization', 'Confirm repository access'],
  },
  {
    id: 'configure-backend',
    title: 'Configure Backend Server',
    description: 'Select Local or Cloud execution and add any backend servers your team uses.',
    icon: Cloud,
    status: 'todo',
    tasks: ['Pick Local or Cloud', 'Add backend server URL', 'Validate API key access'],
  },
  {
    id: 'api-key',
    title: 'Get an API Key',
    description: 'Create an API key for SDK workflows, scripts, and external integrations.',
    icon: Key,
    status: 'todo',
    tasks: ['Open Settings', 'Create a named API key', 'Store the key securely'],
  },
  {
    id: 'secrets',
    title: 'Add Secrets',
    description: 'Store tokens and credentials that automations and conversations can use safely.',
    icon: LockKeyhole,
    status: 'todo',
    tasks: ['Add Git provider token', 'Add integration credentials', 'Review secret naming'],
  },
  {
    id: 'skills',
    title: 'Choose Skills',
    description: 'Enable skills that match your team workflows, like code review, docs, and testing.',
    icon: Bot,
    status: 'todo',
    tasks: ['Browse the skills library', 'Enable common team skills', 'Start a conversation with a skill'],
  },
  {
    id: 'automations',
    title: 'Create an Automation',
    description: 'Turn recurring work into scheduled or event-driven OpenHands automations.',
    icon: Play,
    status: 'todo',
    tasks: ['Review the automation library', 'Create a first automation', 'Run it once manually'],
  },
  {
    id: 'preferences',
    title: 'Review Preferences',
    description: 'Set app defaults, model preferences, notification behavior, and team settings.',
    icon: Settings,
    status: 'todo',
    tasks: ['Review app settings', 'Confirm model defaults', 'Invite teammates when ready'],
  },
];

const statusLabel: Record<OnboardingStepStatus, string> = {
  done: 'Done',
  current: 'Next',
  todo: 'Todo',
};

export function OnboardingScreen() {
  const [activeModuleId, setActiveModuleId] = useState(onboardingModules[0]?.id ?? 'welcome');

  const completionCount = useMemo(
    () => onboardingModules.filter((module) => module.status === 'done').length,
    []
  );

  const handleSelectModule = (moduleId: string) => {
    setActiveModuleId(moduleId);
    document.getElementById(moduleId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                  {module.status === 'done' ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto scroll-smooth px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          <header className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">OpenHands onboarding</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">Finish setting up your workspace</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Work through each module to connect your tools, configure execution, and prepare OpenHands for
              conversations, skills, and automations.
            </p>
          </header>

          <div className="flex flex-col gap-5">
            {onboardingModules.map((module, index) => {
              const Icon = module.icon;

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
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Step {index + 1}</span>
                        <span className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
                          {statusLabel[module.status]}
                        </span>
                      </div>
                      <h2 className="mt-2 text-lg font-semibold text-foreground">{module.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p>
                      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                        {module.tasks.map((task) => (
                          <li
                            key={task}
                            className="rounded-lg border border-border bg-background/40 px-3 py-3 text-sm text-foreground"
                          >
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
