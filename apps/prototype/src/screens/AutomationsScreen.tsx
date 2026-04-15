import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Bell,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Github,
  History,
  Info,
  MessageSquare,
  Box,
  Plus,
  Play,
  Zap,
  MoreVertical,
  Power,
  Settings2,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { SearchInput } from '../components/ui/search-input';
import { NativeSelect } from '../components/ui/native-select';
import { PluginToggle } from '../components/ui/plugin-toggle';
import { Spinner } from '../components/common/Spinner';
import { DocIconLink } from '../components/common/DocIconLink';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { DeleteWorkflowDialog } from '../components/workflow/DeleteWorkflowDialog';
import { PrototypeControlsFab } from '../components/common/PrototypeControlsFab';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { cn } from '../lib/utils';
import {
  AddRepositoryTargetDialog,
  repositoryTargetKey,
  RepositoryTargetsBubbleField,
  type RepositoryTarget,
} from '../components/automation/repositoryTargetsField';

/** Placeholder; replace with real docs URL when available. */
const AUTOMATIONS_DOCUMENTATION_HREF = '#';

type AutomationStatus = 'active' | 'inactive';
type AutomationRunStatus = 'success' | 'failed' | 'running';
type AutomationTrigger = 'schedule' | 'event';

type AutomationRunLogEntry = {
  id: string;
  ranAtIso: string;
  status: AutomationRunStatus;
  conversationId?: string;
  /** Shown in the activity log; should match drawer name when linked. */
  conversationName?: string;
};

type AutomationItem = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  status: AutomationStatus;
  repository: string;
  branch: string;
  trigger: AutomationTrigger;
  schedule?: string;
  timezone?: string;
  event?: string;
  model: string;
  notification: string;
  owner: string;
  createdAt: string;
  lastRun: string;
  nextRun: string;
  runsThisWeek: number;
  plugins: string[];
  skills: string[];
  mcpServers: string[];
  secrets: string[];
  runHistory: AutomationRunLogEntry[];
  repositoryTargets?: RepositoryTarget[];
};

const initialAutomations: AutomationItem[] = [
  {
    id: 'auto-pr-triage',
    title: 'PR Triage Digest',
    description: 'Summarize new pull requests and flag risky changes every weekday morning.',
    prompt:
      'Review newly opened pull requests in acme/frontend-app, identify risky changes, summarize likely impact, and prepare a concise digest with priority ordering for the engineering review channel.',
    status: 'active',
    repository: 'acme/frontend-app',
    branch: 'main',
    trigger: 'schedule',
    schedule: 'Weekdays at 09:00',
    timezone: 'America/Los_Angeles',
    model: 'Claude Opus',
    notification: 'Slack digest to #eng-reviews',
    owner: 'Paul Bloch',
    createdAt: 'Jan 10, 2026',
    lastRun: 'Today, 9:00 AM',
    nextRun: 'Tomorrow, 9:00 AM',
    runsThisWeek: 5,
    plugins: ['GitHub', 'Slack', 'Linear'],
    skills: ['PR review', 'Risk analysis', 'Release notes'],
    mcpServers: ['GitHub MCP', 'Slack MCP', 'Linear MCP'],
    secrets: ['GITHUB_TOKEN', 'SLACK_BOT_TOKEN', 'LINEAR_API_KEY'],
    runHistory: [
      {
        id: 'run-pr-triage-1',
        ranAtIso: '2026-03-23T09:00:00-07:00',
        status: 'success',
        conversationId: 'auto-activity-pr-triage',
        conversationName: 'PR triage — risky changes & reviewer queue',
      },
      {
        id: 'run-pr-triage-2',
        ranAtIso: '2026-03-20T09:00:00-07:00',
        status: 'success',
        conversationId: 'auto-activity-pr-triage',
        conversationName: 'PR triage — risky changes & reviewer queue',
      },
      {
        id: 'run-pr-triage-3',
        ranAtIso: '2026-03-19T09:00:00-07:00',
        status: 'failed',
        conversationId: 'auto-activity-pr-triage',
        conversationName: 'PR triage — risky changes & reviewer queue',
      },
      {
        id: 'run-pr-triage-4',
        ranAtIso: '2026-03-18T09:00:00-07:00',
        status: 'success',
        conversationId: 'auto-activity-pr-triage',
        conversationName: 'PR triage — risky changes & reviewer queue',
      },
      {
        id: 'run-pr-triage-5',
        ranAtIso: '2026-03-17T09:00:00-07:00',
        status: 'success',
        conversationId: 'auto-activity-pr-triage',
        conversationName: 'PR triage — risky changes & reviewer queue',
      },
    ],
  },
  {
    id: 'auto-cross-repo-release-readiness',
    title: 'Cross-Repo Release Readiness',
    description:
      'Aggregate release risk across frontend, design system, and shared UI tokens before each production cut.',
    prompt:
      'Review open PRs, recent merges, and unresolved checks across acme/frontend-app, acme/design-system, and acme/ui-tokens. Generate a single release-readiness report with cross-repo dependency risks and recommended blockers.',
    status: 'active',
    repository: 'acme/frontend-app, acme/design-system, acme/ui-tokens',
    branch: 'multiple',
    trigger: 'schedule',
    schedule: 'Weekdays at 08:30',
    timezone: 'America/Los_Angeles',
    model: 'GPT-5',
    notification: 'Slack digest to #release-readiness',
    owner: 'Release Engineering',
    createdAt: 'Mar 2, 2026',
    lastRun: 'Today, 8:30 AM',
    nextRun: 'Tomorrow, 8:30 AM',
    runsThisWeek: 5,
    plugins: ['GitHub', 'Slack', 'Linear'],
    skills: ['Risk analysis', 'Dependency mapping', 'Release checklist'],
    mcpServers: ['GitHub MCP', 'Slack MCP', 'Linear MCP'],
    secrets: ['GITHUB_TOKEN', 'SLACK_BOT_TOKEN', 'LINEAR_API_KEY'],
    repositoryTargets: [
      { repository: 'acme/frontend-app', branch: 'main' },
      { repository: 'acme/design-system', branch: 'release/v3' },
      { repository: 'acme/ui-tokens', branch: 'next' },
    ],
    runHistory: [
      {
        id: 'run-cross-repo-1',
        ranAtIso: '2026-03-23T08:30:00-07:00',
        status: 'success',
        conversationId: 'auto-activity-cross-repo',
        conversationName: 'Cross-repo release — dependency & CI report',
      },
      {
        id: 'run-cross-repo-2',
        ranAtIso: '2026-03-20T08:30:00-07:00',
        status: 'failed',
        conversationId: 'auto-activity-cross-repo',
        conversationName: 'Cross-repo release — dependency & CI report',
      },
      {
        id: 'run-cross-repo-3',
        ranAtIso: '2026-03-19T08:30:00-07:00',
        status: 'success',
        conversationId: 'auto-activity-cross-repo',
        conversationName: 'Cross-repo release — dependency & CI report',
      },
      {
        id: 'run-cross-repo-4',
        ranAtIso: '2026-03-18T08:30:00-07:00',
        status: 'success',
        conversationId: 'auto-activity-cross-repo',
        conversationName: 'Cross-repo release — dependency & CI report',
      },
      {
        id: 'run-cross-repo-5',
        ranAtIso: '2026-03-17T08:30:00-07:00',
        status: 'success',
        conversationId: 'auto-activity-cross-repo',
        conversationName: 'Cross-repo release — dependency & CI report',
      },
    ],
  },
  {
    id: 'auto-security-pass',
    title: 'Nightly Security Pass',
    description: 'Run a repository scan and create a remediation summary for critical findings.',
    prompt:
      'Scan the backend repository for critical security issues, dependency vulnerabilities, and suspicious auth changes, then generate a remediation summary with severity, likely blast radius, and next steps.',
    status: 'active',
    repository: 'acme/backend-api',
    branch: 'main',
    trigger: 'schedule',
    schedule: 'Daily at 01:30',
    timezone: 'UTC',
    model: 'GPT-5',
    notification: 'Issue comment + email',
    owner: 'Security Team',
    createdAt: 'Feb 2, 2026',
    lastRun: 'Today, 1:30 AM',
    nextRun: 'Tomorrow, 1:30 AM',
    runsThisWeek: 7,
    plugins: ['GitHub', 'Snyk', 'PagerDuty'],
    skills: ['Security scan', 'Dependency audit', 'Incident summary'],
    mcpServers: ['GitHub MCP', 'Snyk MCP', 'PagerDuty MCP'],
    secrets: ['GITHUB_TOKEN', 'SNYK_TOKEN', 'PAGERDUTY_API_KEY'],
    runHistory: [
      {
        id: 'run-security-1',
        ranAtIso: '2026-03-23T01:30:00Z',
        status: 'success',
        conversationId: 'auto-activity-security',
        conversationName: 'Nightly security pass — findings digest',
      },
      {
        id: 'run-security-2',
        ranAtIso: '2026-03-22T01:30:00Z',
        status: 'success',
        conversationId: 'auto-activity-security',
        conversationName: 'Nightly security pass — findings digest',
      },
      {
        id: 'run-security-3',
        ranAtIso: '2026-03-21T01:30:00Z',
        status: 'failed',
        conversationId: 'auto-activity-security',
        conversationName: 'Nightly security pass — findings digest',
      },
      {
        id: 'run-security-4',
        ranAtIso: '2026-03-20T01:30:00Z',
        status: 'success',
        conversationId: 'auto-activity-security',
        conversationName: 'Nightly security pass — findings digest',
      },
      {
        id: 'run-security-5',
        ranAtIso: '2026-03-19T01:30:00Z',
        status: 'success',
        conversationId: 'auto-activity-security',
        conversationName: 'Nightly security pass — findings digest',
      },
    ],
  },
  {
    id: 'auto-docs-sync',
    title: 'Docs Sync on Push',
    description: 'Watch the docs repository and prepare a changelog-ready summary when pushes land.',
    prompt:
      'On every push to the docs repository, summarize what changed, note user-facing documentation updates, and draft changelog-ready notes for the documentation team.',
    status: 'active',
    repository: 'acme/docs',
    branch: 'main',
    trigger: 'event',
    event: 'On push',
    model: 'GPT-4o',
    notification: 'GitHub comment',
    owner: 'Docs Team',
    createdAt: 'Feb 18, 2026',
    lastRun: '2 hours ago',
    nextRun: 'On next push',
    runsThisWeek: 14,
    plugins: ['GitHub', 'Notion'],
    skills: ['Changelog draft', 'Docs sync'],
    mcpServers: ['GitHub MCP', 'Notion MCP'],
    secrets: ['GITHUB_TOKEN', 'NOTION_TOKEN'],
    runHistory: [
      {
        id: 'run-docs-1',
        ranAtIso: '2026-03-23T14:15:00Z',
        status: 'success',
        conversationId: 'auto-activity-docs',
        conversationName: 'Docs sync run — user-facing updates summary',
      },
      {
        id: 'run-docs-2',
        ranAtIso: '2026-03-23T11:08:00Z',
        status: 'success',
        conversationId: 'auto-activity-docs',
        conversationName: 'Docs sync run — user-facing updates summary',
      },
      {
        id: 'run-docs-3',
        ranAtIso: '2026-03-22T16:10:00Z',
        status: 'failed',
        conversationId: 'auto-activity-docs',
        conversationName: 'Docs sync run — user-facing updates summary',
      },
      {
        id: 'run-docs-4',
        ranAtIso: '2026-03-22T13:42:00Z',
        status: 'success',
        conversationId: 'auto-activity-docs',
        conversationName: 'Docs sync run — user-facing updates summary',
      },
      {
        id: 'run-docs-5',
        ranAtIso: '2026-03-22T10:08:00Z',
        status: 'success',
        conversationId: 'auto-activity-docs',
        conversationName: 'Docs sync run — user-facing updates summary',
      },
    ],
  },
  {
    id: 'auto-weekly-release',
    title: 'Release Readiness Review',
    description: 'Compile release blockers, open incidents, and pending approvals before Friday ship.',
    prompt:
      'Before each weekly release, compile blockers, unresolved incidents, pending approvals, and risky open changes, then assemble a release-readiness review for the platform team.',
    status: 'inactive',
    repository: 'acme/realtime-service',
    branch: 'release',
    trigger: 'schedule',
    schedule: 'Fridays at 11:00',
    timezone: 'America/Los_Angeles',
    model: 'Gemini 2.5 Pro',
    notification: 'Slack digest to #release-war-room',
    owner: 'Platform Team',
    createdAt: 'Dec 14, 2025',
    lastRun: 'Mar 7, 2026',
    nextRun: 'Paused',
    runsThisWeek: 0,
    plugins: ['Slack', 'Jira', 'GitHub'],
    skills: ['Release checklist', 'Blocker audit'],
    mcpServers: ['Slack MCP', 'Jira MCP', 'GitHub MCP'],
    secrets: ['SLACK_BOT_TOKEN', 'JIRA_API_TOKEN', 'GITHUB_TOKEN'],
    runHistory: [
      {
        id: 'run-release-1',
        ranAtIso: '2026-03-07T11:00:00-08:00',
        status: 'success',
        conversationId: 'auto-activity-release',
        conversationName: 'Release readiness — blockers & approvals',
      },
      {
        id: 'run-release-2',
        ranAtIso: '2026-02-28T11:00:00-08:00',
        status: 'failed',
        conversationId: 'auto-activity-release',
        conversationName: 'Release readiness — blockers & approvals',
      },
      {
        id: 'run-release-3',
        ranAtIso: '2026-02-21T11:00:00-08:00',
        status: 'success',
        conversationId: 'auto-activity-release',
        conversationName: 'Release readiness — blockers & approvals',
      },
    ],
  },
  {
    id: 'auto-webhook-ops',
    title: 'Incident Webhook Summary',
    description: 'Generate an incident summary whenever PagerDuty sends a webhook event.',
    prompt:
      'When PagerDuty opens an incident, summarize the event details, affected systems, probable impact, and initial response context for the incident coordination channel.',
    status: 'inactive',
    repository: 'acme/backend-api',
    branch: 'main',
    trigger: 'event',
    event: 'incident.opened',
    model: 'Claude Opus',
    notification: 'Internal incident channel',
    owner: 'Ops Team',
    createdAt: 'Nov 28, 2025',
    lastRun: 'Feb 27, 2026',
    nextRun: 'Paused',
    runsThisWeek: 0,
    plugins: ['PagerDuty', 'Slack'],
    skills: ['Incident triage', 'Postmortem draft'],
    mcpServers: ['PagerDuty MCP', 'Slack MCP'],
    secrets: ['PAGERDUTY_ROUTING_KEY', 'SLACK_BOT_TOKEN'],
    runHistory: [
      {
        id: 'run-incident-1',
        ranAtIso: '2026-02-27T18:45:00Z',
        status: 'success',
        conversationId: 'auto-activity-incident',
        conversationName: 'Incident summary — PD webhook run',
      },
      {
        id: 'run-incident-2',
        ranAtIso: '2026-02-11T09:18:00Z',
        status: 'failed',
        conversationId: 'auto-activity-incident',
        conversationName: 'Incident summary — PD webhook run',
      },
      {
        id: 'run-incident-3',
        ranAtIso: '2026-01-29T22:04:00Z',
        status: 'success',
        conversationId: 'auto-activity-incident',
        conversationName: 'Incident summary — PD webhook run',
      },
    ],
  },
];

const runDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const getRepositoryTargets = (automation: AutomationItem): RepositoryTarget[] => {
  if (automation.repositoryTargets && automation.repositoryTargets.length > 0) {
    return automation.repositoryTargets.map((target) => ({
      repository: target.repository.trim(),
      branch: target.branch.trim() || 'main',
    }));
  }

  const repositoryNames = automation.repository
    .split(',')
    .map((repository) => repository.trim())
    .filter(Boolean);
  const fallbackBranch = automation.branch.trim() || 'main';

  return repositoryNames.map((repository) => ({
    repository,
    branch: fallbackBranch,
  }));
};

const formatRepositories = (automation: AutomationItem): string =>
  getRepositoryTargets(automation)
    .map((target) => target.repository)
    .join(', ');

const formatBranches = (automation: AutomationItem): string =>
  getRepositoryTargets(automation)
    .map((target) => `${target.repository}: ${target.branch}`)
    .join(' | ');

const automationRepositoryOptions = Array.from(
  new Set(
    initialAutomations.flatMap((automation) =>
      getRepositoryTargets(automation).map((target) => target.repository)
    )
  )
).sort((a, b) => a.localeCompare(b));

const automationBranchOptions = Array.from(
  new Set([
    'main',
    'develop',
    'staging',
    'release',
    ...initialAutomations.flatMap((automation) =>
      getRepositoryTargets(automation).map((target) => target.branch)
    ),
  ])
).sort((a, b) => a.localeCompare(b));

function automationTargetsToRepositoryFields(targets: RepositoryTarget[]): {
  repository: string;
  branch: string;
} {
  if (targets.length === 0) {
    return { repository: '', branch: 'main' };
  }
  if (targets.length === 1) {
    const t = targets[0];
    return { repository: t.repository, branch: t.branch };
  }
  const branchSet = new Set(targets.map((t) => t.branch));
  return {
    repository: targets.map((t) => t.repository).join(', '),
    branch: branchSet.size === 1 ? [...branchSet][0]! : 'multiple',
  };
}

const metadataSections: Array<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: Array<{
    key: keyof AutomationItem;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    value?: (automation: AutomationItem) => string;
    shouldRender?: (automation: AutomationItem) => boolean;
  }>;
}> = [
  {
    title: 'Configuration',
    icon: Settings2,
    fields: [
      {
        key: 'repository',
        label: 'Repositories',
        icon: Github,
        value: (automation) => formatRepositories(automation),
      },
      {
        key: 'trigger',
        label: 'Trigger',
        icon: Zap,
        value: (automation) => (automation.trigger === 'schedule' ? 'Schedule' : 'Event'),
      },
      {
        key: 'schedule',
        label: 'Schedule',
        icon: CalendarClock,
        value: (automation) => `${automation.schedule} (${automation.timezone})`,
        shouldRender: (automation) => automation.trigger === 'schedule',
      },
      {
        key: 'event',
        label: 'Event',
        icon: Zap,
        value: (automation) => automation.event ?? 'N/A',
        shouldRender: (automation) => Boolean(automation.event?.trim()),
      },
      { key: 'model', label: 'Model', icon: AutomationModelIcon },
      { key: 'notification', label: 'Notification', icon: Bell },
    ],
  },
];

const configurationMetadataSection = metadataSections[0];

const eventTriggerOptions = [
  'Pull request opened',
  'Pull request synchronized',
  'Pull request reopened',
  'Pull request merged',
  'Push to branch',
  'Tag created',
  'Release published',
  'Issue opened',
  'Issue labeled',
  'Comment created',
  'Workflow run completed',
];

const SCHEDULE_TRIGGER_OPTION = 'Schedule';

const scheduleDayChoices = [
  'Daily',
  'Weekdays',
  'Weekends',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const scheduleTimezoneChoices = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'Europe/London',
  'Europe/Paris',
  'UTC',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const;

type NewAutomationScheduleConfig = {
  days: string;
  time: string;
  timezone: string;
};

function formatTimeForScheduleSummary(time24: string): string {
  const parts = time24.trim().split(':');
  const h = parseInt(parts[0] ?? '0', 10);
  const m = parseInt(parts[1] ?? '0', 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24.trim() || '—';
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function buildScheduleSummary(config: NewAutomationScheduleConfig): string {
  return `${config.days} at ${formatTimeForScheduleSummary(config.time)}`;
}

type AutomationScheduleEntry = NewAutomationScheduleConfig & { id: string };

function createAutomationScheduleId(): string {
  return `sched-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const automationPluginOptions = Array.from(
  new Set(initialAutomations.flatMap((automation) => automation.plugins))
);

const automationModelOptions = Array.from(
  new Set(initialAutomations.map((automation) => automation.model))
).sort((a, b) => a.localeCompare(b));

const automationRowSpring = { type: 'spring', stiffness: 420, damping: 34, mass: 0.85 } as const;

/** After PluginToggle thumb/track transition (200ms); list column animation runs next. */
const AUTOMATION_TOGGLE_LAYOUT_DELAY_MS = 230;

function MultiSelectBubbleInput({
  label,
  addActionLabel,
  options,
  selectedValues,
  additionalItems,
  onRemoveAdditional,
  onAdd,
  onRemove,
  menuSearchable = false,
  menuSearchPlaceholder = 'Search…',
  menuTriggerMode = false,
}: {
  label: string;
  addActionLabel: string;
  options: string[];
  selectedValues: string[];
  additionalItems?: { id: string; label: string }[];
  onRemoveAdditional?: (id: string) => void;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  menuSearchable?: boolean;
  menuSearchPlaceholder?: string;
  /** Schedule on top + separator; git triggers stay visible but disabled when already added */
  menuTriggerMode?: boolean;
}) {
  const menuSearchRef = useRef<HTMLInputElement>(null);
  const [menuQuery, setMenuQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const selectedSet = new Set(selectedValues);
  const availableOptions = menuTriggerMode
    ? options
    : options.filter((opt) => !selectedSet.has(opt));

  const filteredAvailableOptions = useMemo(() => {
    const q = menuQuery.trim().toLowerCase();
    if (!menuSearchable || !q) return availableOptions;
    return availableOptions.filter((opt) => opt.toLowerCase().includes(q));
  }, [availableOptions, menuQuery, menuSearchable]);

  useEffect(() => {
    if (menuOpen && menuSearchable) {
      queueMicrotask(() => menuSearchRef.current?.focus());
    }
  }, [menuOpen, menuSearchable]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-border bg-muted/20 p-2">
        {additionalItems?.map(({ id, label: itemLabel }) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs text-foreground"
          >
            {itemLabel}
            <button
              type="button"
              onClick={() => onRemoveAdditional?.(id)}
              className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Remove ${itemLabel}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {selectedValues.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs text-foreground"
          >
            {value}
            <button
              type="button"
              onClick={() => onRemove(value)}
              className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Remove ${value}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <DropdownMenu
          open={menuOpen}
          onOpenChange={(open) => {
            setMenuOpen(open);
            if (!open) setMenuQuery('');
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={menuTriggerMode ? false : availableOptions.length === 0}
              className="group h-7 shrink-0 gap-1.5 px-2 text-muted-foreground hover:!bg-primary hover:!text-primary-foreground"
              aria-label={addActionLabel}
            >
              <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-black" />
              <span className="text-xs font-medium text-muted-foreground transition-colors duration-200 group-hover:text-black">
                {addActionLabel}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={cn(
              menuSearchable
                ? 'flex max-h-72 min-w-[260px] w-[var(--radix-dropdown-menu-trigger-width)] flex-col overflow-hidden p-0'
                : 'max-h-60'
            )}
          >
            {menuSearchable ? (
              <>
                <div className="shrink-0 overflow-hidden rounded-t-md border-b border-border bg-popover p-0">
                  <SearchInput
                    ref={menuSearchRef}
                    size="sm"
                    placeholder={menuSearchPlaceholder}
                    value={menuQuery}
                    onValueChange={setMenuQuery}
                    onKeyDown={(e) => e.stopPropagation()}
                    aria-label={menuSearchPlaceholder}
                    className="w-full [&_input]:rounded-none [&_input]:border-0 [&_input]:bg-muted/50 [&_input]:shadow-none focus-visible:[&_input]:ring-0 focus-visible:[&_input]:ring-offset-0"
                  />
                </div>
                <div className="dropdown-scroll min-h-0 max-h-52 flex-1 overflow-y-auto p-1">
                  {availableOptions.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-muted-foreground">All options selected</div>
                  ) : filteredAvailableOptions.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-muted-foreground">No matches</div>
                  ) : (
                    filteredAvailableOptions.map((opt) => (
                      <DropdownMenuItem key={opt} onSelect={() => onAdd(opt)}>
                        {opt}
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </>
            ) : menuTriggerMode ? (
              <>
                <DropdownMenuItem
                  className="font-medium"
                  onSelect={() => onAdd(SCHEDULE_TRIGGER_OPTION)}
                >
                  {SCHEDULE_TRIGGER_OPTION}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {options.map((opt) => {
                  const taken = selectedValues.includes(opt);
                  return (
                    <DropdownMenuItem
                      key={opt}
                      disabled={taken}
                      onSelect={() => {
                        if (!taken) onAdd(opt);
                      }}
                      className={
                        taken
                          ? 'cursor-default text-muted-foreground opacity-50 data-[disabled]:opacity-50'
                          : undefined
                      }
                    >
                      {opt}
                    </DropdownMenuItem>
                  );
                })}
              </>
            ) : availableOptions.length === 0 ? (
              <div className="px-2 py-3 text-sm text-muted-foreground">All options selected</div>
            ) : (
              availableOptions.map((opt) => (
                <DropdownMenuItem key={opt} onSelect={() => onAdd(opt)}>
                  {opt}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function AssociatedResources({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span>{title}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 p-5">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center rounded-full border border-border bg-background/40 px-3 py-1.5 text-sm text-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function PromptSection({ prompt }: { prompt: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3>Prompt</h3>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm leading-6 text-foreground">{prompt}</p>
      </div>
    </section>
  );
}

function AutomationModelIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M10 13C9.80222 13 9.60888 13.0586 9.44443 13.1685C9.27998 13.2784 9.15181 13.4346 9.07612 13.6173C9.00043 13.8 8.98063 14.0011 9.01921 14.1951C9.0578 14.3891 9.15304 14.5673 9.29289 14.7071C9.43275 14.847 9.61093 14.9422 9.80491 14.9808C9.99889 15.0194 10.2 14.9996 10.3827 14.9239C10.5654 14.8482 10.7216 14.72 10.8315 14.5556C10.9414 14.3911 11 14.1978 11 14C11 13.7348 10.8946 13.4804 10.7071 13.2929C10.5196 13.1054 10.2652 13 10 13ZM10 9C9.80222 9 9.60888 9.05865 9.44443 9.16853C9.27998 9.27841 9.15181 9.43459 9.07612 9.61732C9.00043 9.80004 8.98063 10.0011 9.01921 10.1951C9.0578 10.3891 9.15304 10.5673 9.29289 10.7071C9.43275 10.847 9.61093 10.9422 9.80491 10.9808C9.99889 11.0194 10.2 10.9996 10.3827 10.9239C10.5654 10.8482 10.7216 10.72 10.8315 10.5556C10.9414 10.3911 11 10.1978 11 10C11 9.73478 10.8946 9.48043 10.7071 9.29289C10.5196 9.10536 10.2652 9 10 9ZM14 9C13.8022 9 13.6089 9.05865 13.4444 9.16853C13.28 9.27841 13.1518 9.43459 13.0761 9.61732C13.0004 9.80004 12.9806 10.0011 13.0192 10.1951C13.0578 10.3891 13.153 10.5673 13.2929 10.7071C13.4327 10.847 13.6109 10.9422 13.8049 10.9808C13.9989 11.0194 14.2 10.9996 14.3827 10.9239C14.5654 10.8482 14.7216 10.72 14.8315 10.5556C14.9414 10.3911 15 10.1978 15 10C15 9.73478 14.8946 9.48043 14.7071 9.29289C14.5196 9.10536 14.2652 9 14 9ZM21 13C21.2652 13 21.5196 12.8946 21.7071 12.7071C21.8946 12.5196 22 12.2652 22 12C22 11.7348 21.8946 11.4804 21.7071 11.2929C21.5196 11.1054 21.2652 11 21 11H19V9H21C21.2652 9 21.5196 8.89464 21.7071 8.70711C21.8946 8.51957 22 8.26522 22 8C22 7.73478 21.8946 7.48043 21.7071 7.29289C21.5196 7.10536 21.2652 7 21 7H18.82C18.6707 6.5806 18.4299 6.19969 18.1151 5.8849C17.8003 5.57011 17.4194 5.32932 17 5.18V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2C15.7348 2 15.4804 2.10536 15.2929 2.29289C15.1054 2.48043 15 2.73478 15 3V5H13V3C13 2.73478 12.8946 2.48043 12.7071 2.29289C12.5196 2.10536 12.2652 2 12 2C11.7348 2 11.4804 2.10536 11.2929 2.29289C11.1054 2.48043 11 2.73478 11 3V5H9V3C9 2.73478 8.89464 2.48043 8.70711 2.29289C8.51957 2.10536 8.26522 2 8 2C7.73478 2 7.48043 2.10536 7.29289 2.29289C7.10536 2.48043 7 2.73478 7 3V5.18C6.5806 5.32932 6.19969 5.57011 5.8849 5.8849C5.57011 6.19969 5.32932 6.5806 5.18 7H3C2.73478 7 2.48043 7.10536 2.29289 7.29289C2.10536 7.48043 2 7.73478 2 8C2 8.26522 2.10536 8.51957 2.29289 8.70711C2.48043 8.89464 2.73478 9 3 9H5V11H3C2.73478 11 2.48043 11.1054 2.29289 11.2929C2.10536 11.4804 2 11.7348 2 12C2 12.2652 2.10536 12.5196 2.29289 12.7071C2.48043 12.8946 2.73478 13 3 13H5V15H3C2.73478 15 2.48043 15.1054 2.29289 15.2929C2.10536 15.4804 2 15.7348 2 16C2 16.2652 2.10536 16.5196 2.29289 16.7071C2.48043 16.8946 2.73478 17 3 17H5.18C5.32932 17.4194 5.57011 17.8003 5.8849 18.1151C6.19969 18.4299 6.5806 18.6707 7 18.82V21C7 21.2652 7.10536 21.5196 7.29289 21.7071C7.48043 21.8946 7.73478 22 8 22C8.26522 22 8.51957 21.8946 8.70711 21.7071C8.89464 21.5196 9 21.2652 9 21V19H11V21C11 21.2652 11.1054 21.5196 11.2929 21.7071C11.4804 21.8946 11.7348 22 12 22C12.2652 22 12.5196 21.8946 12.7071 21.7071C12.8946 21.5196 13 21.2652 13 21V19H15V21C15 21.2652 15.1054 21.5196 15.2929 21.7071C15.4804 21.8946 15.7348 22 16 22C16.2652 22 16.5196 21.8946 16.7071 21.7071C16.8946 21.5196 17 21.2652 17 21V18.82C17.4194 18.6707 17.8003 18.4299 18.1151 18.1151C18.4299 17.8003 18.6707 17.4194 18.82 17H21C21.2652 17 21.5196 16.8946 21.7071 16.7071C21.8946 16.5196 22 16.2652 22 16C22 15.7348 21.8946 15.4804 21.7071 15.2929C21.5196 15.1054 21.2652 15 21 15H19V13H21ZM17 16C17 16.2652 16.8946 16.5196 16.7071 16.7071C16.5196 16.8946 16.2652 17 16 17H8C7.73478 17 7.48043 16.8946 7.29289 16.7071C7.10536 16.5196 7 16.2652 7 16V8C7 7.73478 7.10536 7.48043 7.29289 7.29289C7.48043 7.10536 7.73478 7 8 7H16C16.2652 7 16.5196 7.10536 16.7071 7.29289C16.8946 7.48043 17 7.73478 17 8V16ZM14 13C13.8022 13 13.6089 13.0586 13.4444 13.1685C13.28 13.2784 13.1518 13.4346 13.0761 13.6173C13.0004 13.8 12.9806 14.0011 13.0192 14.1951C13.0578 14.3891 13.153 14.5673 13.2929 14.7071C13.4327 14.847 13.6109 14.9422 13.8049 14.9808C13.9989 15.0194 14.2 14.9996 14.3827 14.9239C14.5654 14.8482 14.7216 14.72 14.8315 14.5556C14.9414 14.3911 15 14.1978 15 14C15 13.7348 14.8946 13.4804 14.7071 13.2929C14.5196 13.1054 14.2652 13 14 13Z" fill="currentColor" />
    </svg>
  );
}

function MetadataSection({
  title,
  icon: Icon,
  fields,
  automation,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: Array<{
    key: keyof AutomationItem;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    value?: (automation: AutomationItem) => string;
    shouldRender?: (automation: AutomationItem) => boolean;
  }>;
  automation: AutomationItem;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3>{title}</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
        {fields
          .filter((field) => (field.shouldRender ? field.shouldRender(automation) : true))
          .map((field) => {
          const Icon = field.icon;
          const value = field.value ? field.value(automation) : String(automation[field.key]);
          const isRepositoriesField = field.key === 'repository';

          return (
            <div key={field.key} className="pb-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                <span>{field.label}</span>
              </div>
              {isRepositoriesField ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-foreground">
                  {getRepositoryTargets(automation).map((target) => (
                    <React.Fragment key={`${target.repository}-${target.branch}`}>
                      <span className="inline-flex items-center gap-1">
                        <span>{target.repository}</span>
                        <span className="inline-flex items-center rounded-full border border-border bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
                          {target.branch}
                        </span>
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-sm text-foreground">{value}</div>
              )}
            </div>
          );
          })}
      </div>
    </section>
  );
}

function ActivityLogSection({
  runHistory,
  onOpenConversation,
}: {
  runHistory: AutomationRunLogEntry[];
  onOpenConversation?: (conversationId: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3>Activity Log</h3>
        </div>
      </div>
      {runHistory.length === 0 ? (
        <div className="px-5 py-3 text-sm text-muted-foreground">
          No automations have run yet.
        </div>
      ) : (
        <>
          <div
            className="hidden border-b border-border bg-muted/20 px-5 py-2 sm:grid sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1.15fr)_minmax(12rem,auto)] sm:items-center sm:gap-4 sm:[&>*]:min-w-0"
            aria-hidden
          >
            <span className="text-left text-xs font-medium text-muted-foreground">Time</span>
            <span className="text-left text-xs font-medium text-muted-foreground">Conversation</span>
            <span className="text-right text-xs font-medium text-muted-foreground">Status</span>
          </div>
          <ul className="divide-y divide-border">
            {runHistory.map((run) => {
              const isSuccess = run.status === 'success';
              const isRunning = run.status === 'running';
              const runDateLabel = runDateFormatter.format(new Date(run.ranAtIso));
              const conversationId = run.conversationId;
              const conversationName = run.conversationName;
              const canOpenConversation = Boolean(conversationId && onOpenConversation);

              return (
                <li
                  key={run.id}
                  className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1.15fr)_minmax(12rem,auto)] sm:items-center sm:gap-4 sm:[&>*]:min-w-0"
                >
                  <div className="text-left">
                    <div className="text-left text-xs font-medium text-muted-foreground sm:hidden">Time</div>
                    <div className="text-left text-sm text-foreground sm:mt-0">{runDateLabel}</div>
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-left text-xs font-medium text-muted-foreground sm:hidden">Conversation</div>
                    {conversationId ? (
                      <button
                        type="button"
                        disabled={!canOpenConversation}
                        onClick={() => conversationId && onOpenConversation?.(conversationId)}
                        className={cn(
                          'mt-0.5 block w-full max-w-full truncate text-left text-sm font-medium sm:mt-0',
                          canOpenConversation
                            ? 'rounded-sm text-primary underline-offset-2 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card'
                            : 'cursor-default text-muted-foreground'
                        )}
                        aria-label={`Open conversation${conversationName ? `: ${conversationName}` : ''}`}
                      >
                        {conversationName ?? 'View conversation'}
                      </button>
                    ) : (
                      <div className="mt-0.5 text-left text-sm text-muted-foreground sm:mt-0">—</div>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <span className="text-xs font-medium text-muted-foreground sm:hidden">Status</span>
                    <div
                      className={cn(
                        'inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
                        isRunning
                          ? 'border-warning/40 bg-warning/10 text-warning'
                          : isSuccess
                            ? 'border-success/40 bg-success/10 text-success-foreground'
                            : 'border-destructive/40 bg-destructive/10 text-destructive-foreground'
                      )}
                    >
                      {isRunning ? (
                        <Spinner className="h-3.5 w-3.5" color="border-t-warning" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {isRunning ? 'Running' : isSuccess ? 'Successful' : 'Failed'}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

interface AutomationsScreenProps {
  onRunNow?: (payload: {
    automationTitle: string;
    repository: string;
    branch: string;
    model: string;
  }) => { conversationId: string; conversationName: string } | undefined;
  onOpenConversation?: (conversationId: string) => void;
}

export const AutomationsScreen: React.FC<AutomationsScreenProps> = ({
  onRunNow,
  onOpenConversation,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const listTransition = prefersReducedMotion
    ? { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }
    : automationRowSpring;

  const [search, setSearch] = useState('');
  const [automations, setAutomations] = useState(initialAutomations);
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isCreatingAutomation, setIsCreatingAutomation] = useState(false);
  const [newAutomationTitle, setNewAutomationTitle] = useState('');
  const [newAutomationPrompt, setNewAutomationPrompt] = useState('');
  const [newAutomationRepoTargets, setNewAutomationRepoTargets] = useState<RepositoryTarget[]>([]);
  const [addRepoModalOpen, setAddRepoModalOpen] = useState(false);
  const [newAutomationModel, setNewAutomationModel] = useState('GPT-5');
  const [newAutomationNotification, setNewAutomationNotification] = useState('');
  const [selectedTriggerEvents, setSelectedTriggerEvents] = useState<string[]>([]);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState<NewAutomationScheduleConfig>({
    days: 'Weekdays',
    time: '09:00',
    timezone: 'America/Los_Angeles',
  });
  const [newAutomationSchedules, setNewAutomationSchedules] = useState<AutomationScheduleEntry[]>([]);
  const [useModalForAddAutomation, setUseModalForAddAutomation] = useState(false);
  const [isAddAutomationGuideModalOpen, setIsAddAutomationGuideModalOpen] = useState(false);
  const [toggleOptimisticStatus, setToggleOptimisticStatus] = useState<
    Partial<Record<string, AutomationStatus>>
  >({});
  const toggleCommitTimeoutsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    return () => {
      toggleCommitTimeoutsRef.current.forEach((tid) => window.clearTimeout(tid));
      toggleCommitTimeoutsRef.current.clear();
    };
  }, []);

  const filteredAutomations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return automations;

    return automations.filter((automation) =>
      [
        automation.title,
        formatRepositories(automation),
        formatBranches(automation),
        automation.trigger,
        automation.schedule ?? '',
        automation.event ?? '',
        automation.model,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [automations, search]);

  const activeAutomations = filteredAutomations.filter((automation) => automation.status === 'active');
  const inactiveAutomations = filteredAutomations.filter((automation) => automation.status === 'inactive');
  const totalActiveCount = useMemo(
    () => automations.filter((a) => a.status === 'active').length,
    [automations]
  );
  const totalInactiveCount = useMemo(
    () => automations.filter((a) => a.status === 'inactive').length,
    [automations]
  );
  const selectedAutomation =
    automations.find((automation) => automation.id === selectedAutomationId) ?? null;
  const deleteTargetAutomation =
    automations.find((automation) => automation.id === deleteTargetId) ?? null;

  const displayAutomationStatus = useCallback(
    (automation: AutomationItem): AutomationStatus =>
      toggleOptimisticStatus[automation.id] ?? automation.status,
    [toggleOptimisticStatus]
  );

  const handleToggle = useCallback(
    (automationId: string) => {
      const existingTid = toggleCommitTimeoutsRef.current.get(automationId);
      if (existingTid !== undefined) {
        window.clearTimeout(existingTid);
        toggleCommitTimeoutsRef.current.delete(automationId);
      }

      const automation = automations.find((a) => a.id === automationId);
      if (!automation) return;

      let nextStatus!: AutomationStatus;
      setToggleOptimisticStatus((opt) => {
        const display = opt[automationId] ?? automation.status;
        nextStatus = display === 'active' ? 'inactive' : 'active';
        return { ...opt, [automationId]: nextStatus };
      });

      const tid = window.setTimeout(() => {
        setAutomations((prev) =>
          prev.map((a) =>
            a.id === automationId
              ? {
                  ...a,
                  status: nextStatus,
                  nextRun:
                    nextStatus === 'inactive'
                      ? 'Paused'
                      : a.nextRun === 'Paused'
                        ? 'Tomorrow, 9:00 AM'
                        : a.nextRun,
                }
              : a
          )
        );
        setToggleOptimisticStatus((prev) => {
          const copy = { ...prev };
          delete copy[automationId];
          return copy;
        });
        toggleCommitTimeoutsRef.current.delete(automationId);
      }, AUTOMATION_TOGGLE_LAYOUT_DELAY_MS);

      toggleCommitTimeoutsRef.current.set(automationId, tid);
    },
    [automations]
  );

  const handleDelete = (automationId: string) => {
    const pendingTid = toggleCommitTimeoutsRef.current.get(automationId);
    if (pendingTid !== undefined) {
      window.clearTimeout(pendingTid);
      toggleCommitTimeoutsRef.current.delete(automationId);
    }
    setToggleOptimisticStatus((prev) => {
      const copy = { ...prev };
      delete copy[automationId];
      return copy;
    });
    setAutomations((prev) => prev.filter((automation) => automation.id !== automationId));
    setSelectedAutomationId((prev) => (prev === automationId ? null : prev));
    setDeleteTargetId((prev) => (prev === automationId ? null : prev));
  };

  const resetCreateForm = () => {
    setNewAutomationTitle('');
    setNewAutomationPrompt('');
    setNewAutomationRepoTargets([]);
    setAddRepoModalOpen(false);
    setNewAutomationModel('GPT-5');
    setNewAutomationNotification('');
    setSelectedTriggerEvents([]);
    setSelectedPlugins([]);
    setScheduleModalOpen(false);
    setNewAutomationSchedules([]);
    setScheduleDraft({
      days: 'Weekdays',
      time: '09:00',
      timezone: 'America/Los_Angeles',
    });
  };

  const handleAddAutomationClick = () => {
    if (useModalForAddAutomation) {
      setIsAddAutomationGuideModalOpen(true);
    } else {
      setIsCreatingAutomation(true);
    }
  };

  const handleCreateAutomation = () => {
    const title = newAutomationTitle.trim();
    const prompt = newAutomationPrompt.trim();
    if (!title || !prompt) return;
    if (newAutomationRepoTargets.length === 0) return;

    const now = new Date();
    const createdAt = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(now);

    const { repository: normalizedRepository, branch: normalizedBranch } =
      automationTargetsToRepositoryFields(newAutomationRepoTargets);

    const hasSchedule = newAutomationSchedules.length > 0;
    const scheduleSummary = hasSchedule
      ? newAutomationSchedules.map((entry) => buildScheduleSummary(entry)).join('; ')
      : undefined;
    const scheduleTimezoneSet = new Set(newAutomationSchedules.map((entry) => entry.timezone));
    const scheduleTimezone =
      hasSchedule && scheduleTimezoneSet.size === 1
        ? [...scheduleTimezoneSet][0]!
        : hasSchedule
          ? [...scheduleTimezoneSet].join(', ')
          : undefined;
    const eventFromTriggers =
      selectedTriggerEvents.length > 0 ? selectedTriggerEvents.join(', ') : undefined;

    const createdAutomation: AutomationItem = {
      id: `auto-${now.getTime()}`,
      title,
      description: '',
      prompt,
      status: 'active',
      repository: normalizedRepository,
      branch: normalizedBranch,
      trigger: hasSchedule ? 'schedule' : 'event',
      schedule: scheduleSummary,
      timezone: scheduleTimezone,
      event: eventFromTriggers ?? (!hasSchedule ? 'Push to branch' : undefined),
      model: newAutomationModel.trim() || 'GPT-5',
      notification: newAutomationNotification.trim(),
      owner: '',
      createdAt,
      lastRun: 'Not run yet',
      nextRun: hasSchedule ? 'Pending first run' : 'On matching event',
      runsThisWeek: 0,
      plugins: selectedPlugins.length > 0 ? selectedPlugins : ['GitHub'],
      skills: ['Custom workflow'],
      mcpServers: ['GitHub MCP'],
      secrets: ['GITHUB_TOKEN'],
      runHistory: [],
      repositoryTargets: newAutomationRepoTargets.map((target) => ({
        repository: target.repository,
        branch: target.branch,
      })),
    };

    setAutomations((prev) => [createdAutomation, ...prev]);
    setIsCreatingAutomation(false);
    resetCreateForm();
    setSelectedAutomationId(createdAutomation.id);
  };

  const handleRunNow = (automationId: string) => {
    const targetAutomation = automations.find((automation) => automation.id === automationId);
    if (!targetAutomation) return;

    const primaryTarget = getRepositoryTargets(targetAutomation)[0] ?? {
      repository: targetAutomation.repository,
      branch: targetAutomation.branch || 'main',
    };

    const runNowResult = onRunNow?.({
      automationTitle: targetAutomation.title,
      repository: primaryTarget.repository,
      branch: primaryTarget.branch || 'main',
      model: targetAutomation.model,
    });

    const runEntry: AutomationRunLogEntry = {
      id: `run-now-${automationId}-${Date.now()}`,
      ranAtIso: new Date().toISOString(),
      status: 'running',
      conversationId: runNowResult?.conversationId,
      conversationName: runNowResult?.conversationName,
    };

    setAutomations((prev) =>
      prev.map((automation) =>
        automation.id === automationId
          ? {
              ...automation,
              lastRun: 'Running now',
              runHistory: [runEntry, ...automation.runHistory],
            }
          : automation
      )
    );
  };

  const renderAutomationRow = (automation: AutomationItem) => (
    <div className="rounded-xl border border-border bg-card transition-colors hover:bg-muted/60 hover:border-muted-foreground/20">
      <div className="flex items-start justify-between gap-4 p-5">
        <button
          type="button"
          onClick={() => setSelectedAutomationId(automation.id)}
          className="flex min-w-0 flex-1 flex-col text-left"
        >
          <div className="flex items-center gap-3">
            <h3 className="truncate text-base font-medium text-foreground">{automation.title}</h3>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2.5 py-1">
              <Github className="h-3.5 w-3.5" />
              {formatRepositories(automation)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2.5 py-1">
              {automation.trigger === 'schedule' ? (
                <CalendarClock className="h-3.5 w-3.5" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              {automation.trigger === 'schedule'
                ? `${automation.schedule} (${automation.timezone})`
                : (automation.event ?? 'Event')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2.5 py-1">
              <AutomationModelIcon className="h-3.5 w-3.5" />
              {automation.model}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <PluginToggle
            checked={displayAutomationStatus(automation) === 'active'}
            onCheckedChange={() => handleToggle(automation.id)}
            aria-label={`${displayAutomationStatus(automation) === 'active' ? 'Deactivate' : 'Activate'} ${automation.title}`}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label={`Open actions for ${automation.title}`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => handleRunNow(automation.id)}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Run now
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleToggle(automation.id)}
                className="gap-2"
              >
                <Power className="h-4 w-4" />
                {displayAutomationStatus(automation) === 'active' ? 'Turn off' : 'Turn on'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteTargetId(automation.id)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  const automationsFabAndGuideModal = (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <PrototypeControlsFab
            isActive={useModalForAddAutomation}
            aria-label="Automations page options"
            title="Automations page options"
          />
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-64 p-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">Add Automation modal</div>
            <button
              type="button"
              role="switch"
              aria-checked={useModalForAddAutomation}
              onClick={() => setUseModalForAddAutomation((v) => !v)}
              className={cn(
                'h-6 w-10 shrink-0 rounded-full border border-border flex items-center px-0.5 transition-colors',
                useModalForAddAutomation ? 'bg-foreground/80' : 'bg-muted/60'
              )}
            >
              <span
                className={cn(
                  'h-4 w-4 rounded-full bg-background shadow transition-transform',
                  useModalForAddAutomation ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isAddAutomationGuideModalOpen} onOpenChange={setIsAddAutomationGuideModalOpen}>
        <DialogContent className="flex max-h-[min(90vh,40rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 text-foreground sm:max-w-lg">
          <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6 text-left">
            <DialogTitle>How to create an Automation</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="dropdown-scroll min-h-0 flex-1 overflow-y-auto px-6 py-4 text-left text-sm text-muted-foreground">
              <div className="space-y-4">
                <p>
                  The easiest way is to ask OpenHands directly inside of a conversation. Automations handle schedules,
                  plugins, and setup—you describe what you want and OpenHands will automate it. In the chat message
                  input, run:
                </p>
                <p className="font-mono text-sm text-foreground bg-muted/50 border border-border rounded-md px-3 py-2.5">
                  /automation
                </p>
                <div>
                  <p className="font-medium text-foreground">Prompt vs plugin</p>
                  <p className="mt-1">
                    <span className="text-foreground">Prompt-based</span> automations (most common): one natural-language
                    request with timing—fine for reports, monitoring, and syncs.{' '}
                    <span className="text-foreground">Plugin-based</span> adds MCP integrations (e.g. Slack) when you need
                    more than your logged-in git provider.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">What to include</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    <li>What it should do</li>
                    <li>When it runs (daily, hourly, weekdays 9 AM, etc.) and optional timezone (defaults to UTC)</li>
                    <li>Optional name—the agent can suggest one</li>
                    <li>Optional plugins for extra capabilities</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground">Writing good prompts</p>
                  <p className="mt-1">
                    Be specific. Say where results go (e.g. post to a Slack channel, save a file, open a GitHub issue).
                    For health checks, say what to do on failure vs success. GitHub/GitLab/Bitbucket from your Cloud login
                    are available automatically; other services need MCP configuration.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Schedules</p>
                  <p className="mt-1">
                    Plain language works—“every weekday at 9 AM Eastern”, “hourly”, “twice a day at 9 and 5”—and the agent
                    maps it to cron. You can also pass a cron expression directly if you prefer.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">What each run can use</p>
                  <p className="mt-1">
                    A full sandbox: terminal, files, your configured LLM, secrets from Settings, MCP servers, network, and
                    git tokens from your Cloud login.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">After creation</p>
                  <p className="mt-1">
                    Automations start enabled and run on the next schedule. Review past runs and linked conversations in
                    this UI; disable, update, or delete anytime.
                  </p>
                </div>
              </div>
            </div>
          </DialogDescription>
          <DialogFooter className="shrink-0 flex-col gap-2 border-t border-border px-6 py-4 sm:flex-col sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                setIsAddAutomationGuideModalOpen(false);
                if (AUTOMATIONS_DOCUMENTATION_HREF !== '#') {
                  window.open(AUTOMATIONS_DOCUMENTATION_HREF, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
              View Documentation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  if (selectedAutomation) {
    return (
      <>
      <div className="flex h-full w-full flex-col overflow-auto bg-background px-8 py-8">
        <div className="mx-auto w-full max-w-4xl">
        <button
          type="button"
          onClick={() => setSelectedAutomationId(null)}
            className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Automations</span>
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold leading-6 text-foreground">{selectedAutomation.title}</h2>
              <motion.span
                key={`${selectedAutomation.id}-${displayAutomationStatus(selectedAutomation)}`}
                initial={{ opacity: 0, scale: 0.94, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={listTransition}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  displayAutomationStatus(selectedAutomation) === 'active'
                    ? 'bg-success/15 text-success-foreground'
                    : 'bg-muted/40 text-muted-foreground'
                }`}
              >
                {displayAutomationStatus(selectedAutomation) === 'active' ? 'Active' : 'Inactive'}
              </motion.span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PluginToggle
              checked={displayAutomationStatus(selectedAutomation) === 'active'}
              onCheckedChange={() => handleToggle(selectedAutomation.id)}
              aria-label={`${displayAutomationStatus(selectedAutomation) === 'active' ? 'Deactivate' : 'Activate'} ${selectedAutomation.title}`}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  aria-label={`Open actions for ${selectedAutomation.title}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => handleRunNow(selectedAutomation.id)}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Run now
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleToggle(selectedAutomation.id)}
                  className="gap-2"
                >
                  <Power className="h-4 w-4" />
                  {displayAutomationStatus(selectedAutomation) === 'active' ? 'Turn off' : 'Turn on'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteTargetId(selectedAutomation.id)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              onClick={() => handleRunNow(selectedAutomation.id)}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
              aria-label={`Run now: ${selectedAutomation.title}`}
            >
              <Play className="h-4 w-4" aria-hidden />
              Run now
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <PromptSection prompt={selectedAutomation.prompt} />
          {configurationMetadataSection && (
            <MetadataSection
              title={configurationMetadataSection.title}
              icon={configurationMetadataSection.icon}
              fields={configurationMetadataSection.fields}
              automation={selectedAutomation}
            />
          )}
          <AssociatedResources
            title="Plugins"
            icon={Box}
            items={selectedAutomation.plugins}
          />
          <ActivityLogSection
            runHistory={selectedAutomation.runHistory}
            onOpenConversation={onOpenConversation}
          />
        </div>
        <DeleteWorkflowDialog
          open={deleteTargetAutomation !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTargetId(null);
          }}
          workflowName={deleteTargetAutomation?.title ?? ''}
          entityLabel="automation"
          onConfirm={() => {
            if (deleteTargetAutomation) {
              handleDelete(deleteTargetAutomation.id);
            }
          }}
        />
        </div>
      </div>
      {automationsFabAndGuideModal}
      </>
    );
  }

  if (isCreatingAutomation) {
    return (
      <>
        <div className="flex h-full w-full flex-col overflow-auto bg-background px-8 py-8">
          <div className="mx-auto w-full max-w-4xl">
            <button
              type="button"
              onClick={() => {
                setIsCreatingAutomation(false);
                resetCreateForm();
              }}
              className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Automations</span>
            </button>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-5 space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Create Automation</h2>
                <p className="text-sm text-muted-foreground">
                  Configure an automation with trigger events, optional schedule, and plugin dependencies.
                </p>
              </div>

            <div className="space-y-5">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Name</span>
                <input
                  value={newAutomationTitle}
                  onChange={(event) => setNewAutomationTitle(event.target.value)}
                  placeholder="Weekly release risk check"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                />
              </label>

              <div className="pt-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Prompt</span>
                  <textarea
                    value={newAutomationPrompt}
                    onChange={(event) => setNewAutomationPrompt(event.target.value)}
                    rows={5}
                    placeholder="Describe what the automation should do..."
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
              </div>

              <div className="-mt-2">
                <RepositoryTargetsBubbleField
                  targets={newAutomationRepoTargets}
                  onRemove={(target) =>
                    setNewAutomationRepoTargets((previous) =>
                      previous.filter(
                        (item) => repositoryTargetKey(item) !== repositoryTargetKey(target)
                      )
                    )
                  }
                  onRequestAdd={() => setAddRepoModalOpen(true)}
                />
              </div>

              <MultiSelectBubbleInput
                label="Trigger Events"
                addActionLabel="Add Trigger"
                options={eventTriggerOptions}
                menuTriggerMode
                selectedValues={selectedTriggerEvents}
                additionalItems={newAutomationSchedules.map((entry) => ({
                  id: entry.id,
                  label: `Schedule · ${buildScheduleSummary(entry)} (${entry.timezone})`,
                }))}
                onRemoveAdditional={(id) =>
                  setNewAutomationSchedules((previous) => previous.filter((entry) => entry.id !== id))
                }
                onAdd={(value) => {
                  if (value === SCHEDULE_TRIGGER_OPTION) {
                    setScheduleDraft({
                      days: 'Weekdays',
                      time: '09:00',
                      timezone: 'America/Los_Angeles',
                    });
                    setScheduleModalOpen(true);
                    return;
                  }
                  setSelectedTriggerEvents((prev) =>
                    prev.includes(value) ? prev : [...prev, value]
                  );
                }}
                onRemove={(value) =>
                  setSelectedTriggerEvents((prev) => prev.filter((item) => item !== value))
                }
              />

              <MultiSelectBubbleInput
                label="Plugins"
                addActionLabel="Add Plugin"
                options={automationPluginOptions}
                selectedValues={selectedPlugins}
                menuSearchable
                menuSearchPlaceholder="Search plugins"
                onAdd={(value) =>
                  setSelectedPlugins((prev) =>
                    prev.includes(value) ? prev : [...prev, value]
                  )
                }
                onRemove={(value) =>
                  setSelectedPlugins((prev) => prev.filter((item) => item !== value))
                }
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-4 md:gap-y-0">
                <label className="space-y-2">
                  <span className="flex h-5 items-center text-sm font-medium leading-none text-foreground">
                    Model
                  </span>
                  <NativeSelect
                    aria-label="Model"
                    value={newAutomationModel}
                    onChange={(event) => setNewAutomationModel(event.target.value)}
                  >
                    {automationModelOptions.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </NativeSelect>
                </label>
                <div className="space-y-2">
                  <div className="flex h-5 items-center gap-1.5">
                    <label
                      htmlFor="create-automation-notification"
                      className="text-sm font-medium leading-none text-foreground"
                    >
                      Notification
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          aria-label="How notification destination is used"
                        >
                          <Info className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" side="top" className="w-80 space-y-3 p-4 text-sm">
                        <p className="leading-relaxed text-popover-foreground">
                          If your original prompt does not already include notification instructions, this
                          destination is amended into the prompt so the automation knows where to send
                          updates.
                        </p>
                        <a
                          href="#"
                          className="inline-flex font-medium text-foreground underline decoration-muted-foreground/60 underline-offset-4 transition-colors hover:decoration-foreground"
                        >
                          Read Documentation
                        </a>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <input
                    id="create-automation-notification"
                    value={newAutomationNotification}
                    onChange={(event) => setNewAutomationNotification(event.target.value)}
                    placeholder="e.g. Slack digest to #channel, email alias, or PagerDuty service"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingAutomation(false);
                  resetCreateForm();
                }}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAutomation}
                disabled={
                  !newAutomationTitle.trim() ||
                  !newAutomationPrompt.trim() ||
                  newAutomationRepoTargets.length === 0
                }
                className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Automation
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>

        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent className="max-w-md border-border text-foreground sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule</DialogTitle>
              <DialogDescription>
                Choose which days and what time this automation runs, and the timezone to use.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Days</span>
                <NativeSelect
                  aria-label="Days"
                  value={scheduleDraft.days}
                  onChange={(event) =>
                    setScheduleDraft((previous) => ({ ...previous, days: event.target.value }))
                  }
                >
                  {scheduleDayChoices.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </NativeSelect>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Time</span>
                <input
                  type="time"
                  value={scheduleDraft.time}
                  onChange={(event) =>
                    setScheduleDraft((previous) => ({ ...previous, time: event.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Timezone</span>
                <NativeSelect
                  aria-label="Timezone"
                  value={scheduleDraft.timezone}
                  onChange={(event) =>
                    setScheduleDraft((previous) => ({ ...previous, timezone: event.target.value }))
                  }
                >
                  {scheduleTimezoneChoices.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </NativeSelect>
              </label>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setNewAutomationSchedules((previous) => [
                    ...previous,
                    { id: createAutomationScheduleId(), ...scheduleDraft },
                  ]);
                  setScheduleModalOpen(false);
                }}
              >
                Save schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AddRepositoryTargetDialog
          open={addRepoModalOpen}
          onOpenChange={setAddRepoModalOpen}
          existingTargets={newAutomationRepoTargets}
          onAdd={(target) =>
            setNewAutomationRepoTargets((previous) => [...previous, target])
          }
          repoOptions={
            automationRepositoryOptions.length > 0 ? automationRepositoryOptions : ['acme/frontend-app']
          }
          branchOptions={
            automationBranchOptions.length > 0 ? automationBranchOptions : ['main']
          }
          description="Choose a repository and branch for this automation. You can add more than one target."
        />
      {automationsFabAndGuideModal}
      </>
    );
  }

  return (
    <>
    <div className="flex h-full w-full flex-col overflow-auto bg-background px-8 py-8">
      <div className="mx-auto w-full max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold leading-6 text-foreground">Automations</h2>
            <DocIconLink aria-label="Automations documentation" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            View active and inactive automations, search by metadata, and inspect read-only details.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddAutomationClick}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          <Plus className="h-4 w-4" />
          Add Automation
        </button>
      </div>

      <div className="mt-6 max-w-sm">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search automations..."
          size="sm"
        />
      </div>

      <div className="mt-8">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Active</h3>
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
              {activeAutomations.length}
            </span>
          </div>
          <div className="space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
              {activeAutomations.map((automation) => (
                <motion.div
                  key={automation.id}
                  layout
                  initial={{ opacity: 0, y: 22, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 18, scale: 0.98 }}
                  transition={listTransition}
                  className="w-full"
                >
                  {renderAutomationRow(automation)}
                </motion.div>
              ))}
            </AnimatePresence>
            {activeAutomations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-6 text-sm text-muted-foreground">
                {totalActiveCount === 0
                  ? 'No active automations. Turn one on from Inactive below or add a new automation.'
                  : 'No active automations match your search.'}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Inactive</h3>
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
              {inactiveAutomations.length}
            </span>
          </div>
          <div className="space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
              {inactiveAutomations.map((automation) => (
                <motion.div
                  key={automation.id}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={listTransition}
                  className="w-full"
                >
                  {renderAutomationRow(automation)}
                </motion.div>
              ))}
            </AnimatePresence>
            {inactiveAutomations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-6 text-sm text-muted-foreground">
                {totalInactiveCount === 0
                  ? 'No inactive automations. All automations are currently active.'
                  : 'No inactive automations match your search.'}
              </div>
            ) : null}
          </div>
        </section>
      </div>
      <DeleteWorkflowDialog
        open={deleteTargetAutomation !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        workflowName={deleteTargetAutomation?.title ?? ''}
        entityLabel="automation"
        onConfirm={() => {
          if (deleteTargetAutomation) {
            handleDelete(deleteTargetAutomation.id);
          }
        }}
      />
      </div>
    </div>
    {automationsFabAndGuideModal}
    </>
  );
};
