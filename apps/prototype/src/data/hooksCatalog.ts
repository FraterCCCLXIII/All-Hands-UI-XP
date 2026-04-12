/**
 * Browsable automation hooks catalog for Extensions (prototype data).
 */

export interface HooksCatalogEntry {
  id: string;
  name: string;
  description: string;
  /** Typical trigger or channel */
  trigger?: string;
  tags: string[];
  docsUrl?: string;
}

export const hooksCatalogCategories = [
  { slug: 'git', name: 'Git & CI' },
  { slug: 'issues', name: 'Issues & PRs' },
  { slug: 'deploy', name: 'Deploy & release' },
  { slug: 'chat', name: 'Chat & alerts' },
] as const;

export const hooksCatalogEntries: HooksCatalogEntry[] = [
  {
    id: 'hook-pr-opened',
    name: 'Pull request opened',
    trigger: 'GitHub · pull_request',
    description:
      'Run reviews, label routing, and CI gates when a new pull request is opened or updated.',
    tags: ['git', 'issues'],
    docsUrl: 'https://docs.github.com/en/webhooks',
  },
  {
    id: 'hook-issue-labeled',
    name: 'Issue labeled',
    trigger: 'GitHub · issues',
    description: 'Route triage bots and notifications when a specific label is applied to an issue.',
    tags: ['issues'],
  },
  {
    id: 'hook-deploy-success',
    name: 'Deployment succeeded',
    trigger: 'Deploy hooks',
    description: 'Notify channels, update dashboards, and tag releases after a successful deployment.',
    tags: ['deploy'],
  },
  {
    id: 'hook-slack-command',
    name: 'Slash command',
    trigger: 'Slack',
    description: 'Invoke agent workflows from a workspace slash command with scoped permissions.',
    tags: ['chat'],
    docsUrl: 'https://api.slack.com/interactivity/slash-commands',
  },
  {
    id: 'hook-linear-status',
    name: 'Linear issue transition',
    trigger: 'Linear',
    description: 'Sync status changes to conversations and automations when work moves across teams.',
    tags: ['issues', 'deploy'],
  },
  {
    id: 'hook-schedule',
    name: 'Scheduled run',
    trigger: 'Cron',
    description: 'Time-based hooks for digests, stale-issue sweeps, and recurring health checks.',
    tags: ['deploy'],
  },
];
