import React, { useState } from 'react';
import {
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Package,
  Palette,
  Play,
  Search,
  ShieldAlert,
  Wrench,
  Zap,
} from 'lucide-react';
import { SkillIcon } from '../components/icons/SkillIcon';
import { SearchInput } from '../components/ui/search-input';
import { PluginToggle } from '../components/ui/plugin-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

type UseCaseActionState = 'available' | 'create' | 'none';

type UseCaseTask = {
  name: string;
  skillName: string;
  skillState: UseCaseActionState;
  automationState: UseCaseActionState;
};

type UseCaseGroup = {
  title: string;
  icon: React.ElementType;
  count: number;
  initiallyVisible: number;
  tasks: UseCaseTask[];
};

const useCaseGroups: UseCaseGroup[] = [
  {
    title: 'Code Review',
    icon: Search,
    count: 5,
    initiallyVisible: 2,
    tasks: [
      {
        name: 'Auto-approval',
        skillName: 'PR Auto-Approval',
        skillState: 'available',
        automationState: 'available',
      },
      {
        name: 'Code review',
        skillName: 'Code Review',
        skillState: 'available',
        automationState: 'available',
      },
      {
        name: 'Fix merge conflicts',
        skillName: 'Merge Conflict Resolver',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Fix failing CI',
        skillName: 'CI Failure Fixer',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Commit Message Polish',
        skillName: 'Commit Message Polish',
        skillState: 'create',
        automationState: 'create',
      },
    ],
  },
  {
    title: 'Code Quality',
    icon: Check,
    count: 4,
    initiallyVisible: 2,
    tasks: [
      {
        name: 'QA',
        skillName: 'QA Checklist',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Vuln discovery',
        skillName: 'Vulnerability Discovery',
        skillState: 'available',
        automationState: 'create',
      },
      {
        name: 'Architecture review',
        skillName: 'Architecture Review',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Pen testing',
        skillName: 'Pen Testing',
        skillState: 'create',
        automationState: 'create',
      },
    ],
  },
  {
    title: 'Optimization',
    icon: Zap,
    count: 2,
    initiallyVisible: 2,
    tasks: [
      {
        name: 'CPU/memory tuning',
        skillName: 'Performance Profiler',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Log cleanup',
        skillName: 'Log Cleanup',
        skillState: 'available',
        automationState: 'available',
      },
    ],
  },
  {
    title: 'Incident Response',
    icon: ShieldAlert,
    count: 2,
    initiallyVisible: 2,
    tasks: [
      {
        name: 'Incident response',
        skillName: 'Incident Commander',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Zero-day response',
        skillName: 'Zero-Day Response',
        skillState: 'create',
        automationState: 'create',
      },
    ],
  },
  {
    title: 'Maintenance',
    icon: Wrench,
    count: 6,
    initiallyVisible: 2,
    tasks: [
      {
        name: 'Dependency updates',
        skillName: 'Dependency Updates',
        skillState: 'available',
        automationState: 'available',
      },
      {
        name: 'Error log handling',
        skillName: 'Error Log Handler',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'CVE resolution',
        skillName: 'CVE Resolution',
        skillState: 'available',
        automationState: 'create',
      },
      {
        name: 'Java version upgrade',
        skillName: 'Java Upgrade Assistant',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Test cov expansion',
        skillName: 'Coverage Expansion',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Test optimization',
        skillName: 'Test Optimizer',
        skillState: 'create',
        automationState: 'create',
      },
    ],
  },
  {
    title: 'Reporting',
    icon: BarChart3,
    count: 6,
    initiallyVisible: 2,
    tasks: [
      {
        name: 'Repo change summary',
        skillName: 'Repo Change Summary',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Summarize open issues',
        skillName: 'Open Issue Summary',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Issue research',
        skillName: 'Issue Research',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Release notes',
        skillName: 'Release Notes',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Standup automator',
        skillName: 'Standup Automator',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Issue deduplicator',
        skillName: 'Issue Deduplicator',
        skillState: 'create',
        automationState: 'create',
      },
    ],
  },
  {
    title: 'Frontend',
    icon: Palette,
    count: 3,
    initiallyVisible: 2,
    tasks: [
      {
        name: 'I18n audit',
        skillName: 'I18n Audit',
        skillState: 'create',
        automationState: 'create',
      },
      {
        name: 'Accessibility audit',
        skillName: 'Accessibility Audit',
        skillState: 'available',
        automationState: 'create',
      },
      {
        name: 'SEO optimization',
        skillName: 'SEO Optimization',
        skillState: 'create',
        automationState: 'create',
      },
    ],
  },
  {
    title: 'Other',
    icon: Package,
    count: 2,
    initiallyVisible: 2,
    tasks: [
      {
        name: 'Tune AGENTS.md',
        skillName: 'AGENTS.md Tuning',
        skillState: 'available',
        automationState: 'create',
      },
      {
        name: 'Issue resolution',
        skillName: 'Issue Resolution',
        skillState: 'create',
        automationState: 'none',
      },
    ],
  },
];

function UseCaseGroupSection({ group }: { group: UseCaseGroup }) {
  const [isExpanded, setIsExpanded] = useState(group.tasks.length > group.initiallyVisible);
  const [enabledTasks, setEnabledTasks] = useState<Set<string>>(
    () => new Set(group.tasks.map((task) => task.name))
  );
  const hiddenCount = Math.max(group.tasks.length - group.initiallyVisible, 0);
  const visibleTasks = isExpanded ? group.tasks : group.tasks.slice(0, group.initiallyVisible);
  const Icon = group.icon;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground" aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-medium text-foreground">{group.title}</h3>
        <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
          {group.count}
        </span>
      </div>

      <div className="space-y-3">
        {visibleTasks.map((task) => (
          <div
            key={task.name}
            className="rounded-xl border border-border bg-card transition-colors hover:border-muted-foreground/20 hover:bg-muted/60"
          >
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="flex min-w-0 flex-1 flex-col text-left">
                <div className="flex items-center gap-3">
                  <h3 className="truncate text-base font-medium text-foreground">{task.name}</h3>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2.5 py-1">
                    <SkillIcon className="h-3.5 text-muted-foreground" />
                    {task.skillName}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-8 min-w-[7.25rem] items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/85"
                  aria-label={`Run ${task.name}`}
                >
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
                  Run
                </button>
                <PluginToggle
                  checked={enabledTasks.has(task.name)}
                  onCheckedChange={(checked) =>
                    setEnabledTasks((previous) => {
                      const next = new Set(previous);
                      if (checked) {
                        next.add(task.name);
                      } else {
                        next.delete(task.name);
                      }
                      return next;
                    })
                  }
                  aria-label={`${enabledTasks.has(task.name) ? 'Disable' : 'Enable'} ${task.name}`}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                      aria-label={`Open actions for ${task.name}`}
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem className="gap-2">
                      <Play className="h-4 w-4" />
                      Run
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2"
                      onClick={() =>
                        setEnabledTasks((previous) => {
                          const next = new Set(previous);
                          if (next.has(task.name)) {
                            next.delete(task.name);
                          } else {
                            next.add(task.name);
                          }
                          return next;
                        })
                      }
                    >
                      {enabledTasks.has(task.name) ? 'Disable module' : 'Enable module'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setIsExpanded((previous) => !previous)}
          className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
          {isExpanded ? 'Show less' : `Show ${hiddenCount} more`}
        </button>
      ) : null}
    </section>
  );
}

export const UseCasesScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const filteredGroups = useCaseGroups
    .map((group) => ({
      ...group,
      tasks: query
        ? group.tasks.filter((task) =>
            [group.title, task.name, task.skillName].join(' ').toLowerCase().includes(query)
          )
        : group.tasks,
    }))
    .filter((group) => group.tasks.length > 0);

  return (
    <main className="min-w-0 flex-1 overflow-auto px-8 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold leading-6 text-foreground">Use Cases</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Run common tasks once, package them as reusable skills, or turn them into automations.
            </p>
          </div>
        </div>

        <div className="mt-6 max-w-sm">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search use cases..."
            size="sm"
          />
        </div>

        <div className="mt-8 space-y-8">
          {filteredGroups.map((group) => (
            <UseCaseGroupSection key={group.title} group={group} />
          ))}
          {filteredGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-6 text-sm text-muted-foreground">
              No use cases match your search.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
};
