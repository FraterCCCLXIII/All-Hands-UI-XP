export type WebhookCatalogEntry = {
  id: string;
  name: string;
  endpoint: string;
};

export const OPENHANDS_EVENT_AUTOMATIONS_DOCS_URL =
  'https://docs.openhands.dev/openhands/usage/automations/event-automations';

export const DEFAULT_WEBHOOK_CONFIGURATION = `{
  "name": "Linear Issues",
  "source": "linear",
  "event_key_expr": "type",
  "signature_header": "Linear-Signature",
  "webhook_secret": "\${LINEAR_WEBHOOK_SECRET}"
}`;

export const webhookCatalogEntries: WebhookCatalogEntry[] = [
  {
    id: 'github-events',
    name: 'GitHub events',
    endpoint: 'https://webhooks.example/github/events',
  },
  {
    id: 'linear-issues',
    name: 'Linear issue updates',
    endpoint: 'https://webhooks.example/linear/issues',
  },
  {
    id: 'pagerduty-incidents',
    name: 'PagerDuty incidents',
    endpoint: 'https://webhooks.example/pagerduty/incidents',
  },
  {
    id: 'slack-command',
    name: 'Slack slash commands',
    endpoint: 'https://webhooks.example/slack/commands',
  },
];

export function webhooksCatalogEntryMatchesQuery(entry: WebhookCatalogEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${entry.name} ${entry.endpoint}`.toLowerCase().includes(q);
}
