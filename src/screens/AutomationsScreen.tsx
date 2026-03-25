import React, { useMemo, useState } from 'react';
import {
  Bell,
  Bot,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ChevronLeft,
  GitBranch,
  Github,
  History,
  KeyRound,
  MessageSquare,
  Package,
  PlayCircle,
  MoreVertical,
  Power,
  Repeat,
  Server,
  Settings2,
  Trash2,
  XCircle,
} from 'lucide-react';
import { SearchInput } from '../components/ui/search-input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { DeleteWorkflowDialog } from '../components/workflow/DeleteWorkflowDialog';

type AutomationStatus = 'active' | 'inactive';
type AutomationRunStatus = 'success' | 'failed';
type AutomationTrigger = 'schedule' | 'event';

type AutomationRunLogEntry = {
  id: string;
  ranAtIso: string;
  status: AutomationRunStatus;
};

type RepositoryTarget = {
  repository: string;
  branch: string;
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
      { id: 'run-pr-triage-1', ranAtIso: '2026-03-23T09:00:00-07:00', status: 'success' },
      { id: 'run-pr-triage-2', ranAtIso: '2026-03-20T09:00:00-07:00', status: 'success' },
      { id: 'run-pr-triage-3', ranAtIso: '2026-03-19T09:00:00-07:00', status: 'failed' },
      { id: 'run-pr-triage-4', ranAtIso: '2026-03-18T09:00:00-07:00', status: 'success' },
      { id: 'run-pr-triage-5', ranAtIso: '2026-03-17T09:00:00-07:00', status: 'success' },
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
      { id: 'run-cross-repo-1', ranAtIso: '2026-03-23T08:30:00-07:00', status: 'success' },
      { id: 'run-cross-repo-2', ranAtIso: '2026-03-20T08:30:00-07:00', status: 'failed' },
      { id: 'run-cross-repo-3', ranAtIso: '2026-03-19T08:30:00-07:00', status: 'success' },
      { id: 'run-cross-repo-4', ranAtIso: '2026-03-18T08:30:00-07:00', status: 'success' },
      { id: 'run-cross-repo-5', ranAtIso: '2026-03-17T08:30:00-07:00', status: 'success' },
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
      { id: 'run-security-1', ranAtIso: '2026-03-23T01:30:00Z', status: 'success' },
      { id: 'run-security-2', ranAtIso: '2026-03-22T01:30:00Z', status: 'success' },
      { id: 'run-security-3', ranAtIso: '2026-03-21T01:30:00Z', status: 'failed' },
      { id: 'run-security-4', ranAtIso: '2026-03-20T01:30:00Z', status: 'success' },
      { id: 'run-security-5', ranAtIso: '2026-03-19T01:30:00Z', status: 'success' },
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
      { id: 'run-docs-1', ranAtIso: '2026-03-23T14:15:00Z', status: 'success' },
      { id: 'run-docs-2', ranAtIso: '2026-03-23T11:08:00Z', status: 'success' },
      { id: 'run-docs-3', ranAtIso: '2026-03-22T16:10:00Z', status: 'failed' },
      { id: 'run-docs-4', ranAtIso: '2026-03-22T13:42:00Z', status: 'success' },
      { id: 'run-docs-5', ranAtIso: '2026-03-22T10:08:00Z', status: 'success' },
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
      { id: 'run-release-1', ranAtIso: '2026-03-07T11:00:00-08:00', status: 'success' },
      { id: 'run-release-2', ranAtIso: '2026-02-28T11:00:00-08:00', status: 'failed' },
      { id: 'run-release-3', ranAtIso: '2026-02-21T11:00:00-08:00', status: 'success' },
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
      { id: 'run-incident-1', ranAtIso: '2026-02-27T18:45:00Z', status: 'success' },
      { id: 'run-incident-2', ranAtIso: '2026-02-11T09:18:00Z', status: 'failed' },
      { id: 'run-incident-3', ranAtIso: '2026-01-29T22:04:00Z', status: 'success' },
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
        icon: PlayCircle,
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
        icon: PlayCircle,
        value: (automation) => automation.event ?? 'N/A',
        shouldRender: (automation) => automation.trigger === 'event',
      },
      { key: 'model', label: 'Model', icon: AutomationModelIcon },
      { key: 'notification', label: 'Notification', icon: Bell },
    ],
  },
  {
    title: 'Activity',
    icon: History,
    fields: [
      { key: 'createdAt', label: 'Created', icon: History },
      { key: 'lastRun', label: 'Last run', icon: Clock3 },
    ],
  },
];

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
        <div className="rounded-xl bg-background/40 p-4">
          <p className="text-sm leading-6 text-foreground">{prompt}</p>
        </div>
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
            <div key={field.key} className="rounded-xl border border-border bg-background/40 p-4">
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

function ActivityLogSection({ runHistory }: { runHistory: AutomationRunLogEntry[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3>Activity Log</h3>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {runHistory.map((run) => {
          const isSuccess = run.status === 'success';
          const runDateLabel = runDateFormatter.format(new Date(run.ranAtIso));

          return (
            <li
              key={run.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="text-sm text-foreground">{runDateLabel}</div>
              <div
                className={`inline-flex items-center gap-1 text-xs font-medium ${
                  isSuccess ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {isSuccess ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {isSuccess ? 'Successful' : 'Failed'}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StatusToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
        checked ? 'border-emerald-400/50 bg-emerald-500/20' : 'border-border bg-muted/40'
      }`}
    >
      <span
        className={`absolute h-4 w-4 rounded-full transition-all ${
          checked ? 'left-6 bg-emerald-400' : 'left-1 bg-muted-foreground'
        }`}
      />
    </button>
  );
}

export const AutomationsScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [automations, setAutomations] = useState(initialAutomations);
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredAutomations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return automations;

    return automations.filter((automation) =>
      [
        automation.title,
        automation.description,
        formatRepositories(automation),
        formatBranches(automation),
        automation.trigger,
        automation.schedule ?? '',
        automation.event ?? '',
        automation.model,
        automation.owner,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [automations, search]);

  const activeAutomations = filteredAutomations.filter((automation) => automation.status === 'active');
  const inactiveAutomations = filteredAutomations.filter((automation) => automation.status === 'inactive');
  const selectedAutomation =
    automations.find((automation) => automation.id === selectedAutomationId) ?? null;
  const deleteTargetAutomation =
    automations.find((automation) => automation.id === deleteTargetId) ?? null;

  const handleToggle = (automationId: string) => {
    setAutomations((prev) =>
      prev.map((automation) =>
        automation.id === automationId
          ? {
              ...automation,
              status: automation.status === 'active' ? 'inactive' : 'active',
              nextRun: automation.status === 'active' ? 'Paused' : automation.nextRun === 'Paused' ? 'Tomorrow, 9:00 AM' : automation.nextRun,
            }
          : automation
      )
    );
  };

  const handleDelete = (automationId: string) => {
    setAutomations((prev) => prev.filter((automation) => automation.id !== automationId));
    setSelectedAutomationId((prev) => (prev === automationId ? null : prev));
    setDeleteTargetId((prev) => (prev === automationId ? null : prev));
  };

  const renderAutomationRow = (automation: AutomationItem) => (
    <div
      key={automation.id}
      className="rounded-xl border border-border bg-card transition-colors hover:border-muted-foreground/20"
    >
      <div className="flex items-start justify-between gap-4 p-5">
        <button
          type="button"
          onClick={() => setSelectedAutomationId(automation.id)}
          className="flex min-w-0 flex-1 flex-col text-left"
        >
          <div className="flex items-center gap-3">
            <h3 className="truncate text-base font-medium text-foreground">{automation.title}</h3>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{automation.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2.5 py-1">
              <Github className="h-3.5 w-3.5" />
              {formatRepositories(automation)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2.5 py-1">
              {automation.trigger === 'schedule' ? (
                <CalendarClock className="h-3.5 w-3.5" />
              ) : (
                <PlayCircle className="h-3.5 w-3.5" />
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
          <StatusToggle
            checked={automation.status === 'active'}
            onChange={() => handleToggle(automation.id)}
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
                onClick={() => handleToggle(automation.id)}
                className="gap-2"
              >
                <Power className="h-4 w-4" />
                {automation.status === 'active' ? 'Turn off' : 'Turn on'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteTargetId(automation.id)}
                className="gap-2 text-destructive focus:text-destructive"
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

  if (selectedAutomation) {
    return (
      <div className="flex h-full w-full flex-col overflow-auto bg-background px-8 py-8">
        <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={() => setSelectedAutomationId(null)}
          className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Automations</span>
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold leading-6 text-foreground">{selectedAutomation.title}</h2>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  selectedAutomation.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-muted/40 text-muted-foreground'
                }`}
              >
                {selectedAutomation.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-sm text-muted-foreground">{selectedAutomation.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusToggle
              checked={selectedAutomation.status === 'active'}
              onChange={() => handleToggle(selectedAutomation.id)}
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
                  onClick={() => handleToggle(selectedAutomation.id)}
                  className="gap-2"
                >
                  <Power className="h-4 w-4" />
                  {selectedAutomation.status === 'active' ? 'Turn off' : 'Turn on'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteTargetId(selectedAutomation.id)}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <PromptSection prompt={selectedAutomation.prompt} />
          <MetadataSection
            title={metadataSections[0].title}
            icon={metadataSections[0].icon}
            fields={metadataSections[0].fields}
            automation={selectedAutomation}
          />
          <AssociatedResources
            title="Plugins"
            icon={Package}
            items={selectedAutomation.plugins}
          />
          <AssociatedResources
            title="MCP Servers"
            icon={Server}
            items={selectedAutomation.mcpServers}
          />
          <AssociatedResources
            title="Secrets"
            icon={KeyRound}
            items={selectedAutomation.secrets}
          />
          <MetadataSection
            title={metadataSections[1].title}
            icon={metadataSections[1].icon}
            fields={metadataSections[1].fields}
            automation={selectedAutomation}
          />
          <ActivityLogSection runHistory={selectedAutomation.runHistory} />
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
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-auto bg-background px-8 py-8">
      <div className="mx-auto w-full max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold leading-6 text-foreground">Automations</h2>
            <a
              href="#"
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Automations documentation"
            >
              <BookOpen className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            View active and inactive automations, search by metadata, and inspect read-only details.
          </p>
        </div>
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
            {activeAutomations.length > 0 ? (
              activeAutomations.map(renderAutomationRow)
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-6 text-sm text-muted-foreground">
                No active automations match your search.
              </div>
            )}
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
            {inactiveAutomations.length > 0 ? (
              inactiveAutomations.map(renderAutomationRow)
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-6 text-sm text-muted-foreground">
                No inactive automations match your search.
              </div>
            )}
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
  );
};
