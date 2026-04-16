/**
 * Browsable MCP server catalog for Extensions (prototype data).
 */

export interface McpCatalogEntry {
  id: string;
  name: string;
  description: string;
  /** Short vendor or stack hint */
  provider?: string;
  tags: string[];
  docsUrl?: string;
}

export const mcpCatalogCategories = [
  { slug: 'devtools', name: 'Developer tools' },
  { slug: 'cloud', name: 'Cloud & infra' },
  { slug: 'data', name: 'Data & storage' },
  { slug: 'comms', name: 'Comms & support' },
] as const;

export const mcpCatalogEntries: McpCatalogEntry[] = [
  {
    id: 'mcp-github',
    name: 'GitHub',
    provider: 'GitHub',
    description:
      'Issues, pull requests, and repository context for agents working with GitHub-hosted code.',
    tags: ['devtools', 'git'],
    docsUrl: 'https://docs.github.com',
  },
  {
    id: 'mcp-slack',
    name: 'Slack',
    provider: 'Slack',
    description: 'Post messages and read channel context for team notifications and digests.',
    tags: ['comms'],
    docsUrl: 'https://api.slack.com',
  },
  {
    id: 'mcp-linear',
    name: 'Linear',
    provider: 'Linear',
    description: 'Create and update issues, list project work for release and triage automations.',
    tags: ['devtools'],
    docsUrl: 'https://linear.app/docs',
  },
  {
    id: 'mcp-notion',
    name: 'Notion',
    provider: 'Notion',
    description: 'Read and update pages and databases for documentation-centric workflows.',
    tags: ['data'],
    docsUrl: 'https://developers.notion.com',
  },
  {
    id: 'mcp-postgres',
    name: 'PostgreSQL',
    description: 'Parameterized queries against approved schemas for reporting and data checks.',
    tags: ['data', 'cloud'],
  },
  {
    id: 'mcp-aws',
    name: 'AWS',
    description: 'Describe resources and invoke approved APIs for ops and deployment tasks.',
    tags: ['cloud'],
    docsUrl: 'https://docs.aws.amazon.com',
  },
  {
    id: 'mcp-pagerduty',
    name: 'PagerDuty',
    provider: 'PagerDuty',
    description: 'Incident lifecycle hooks and on-call context for reliability automations.',
    tags: ['comms', 'cloud'],
    docsUrl: 'https://developer.pagerduty.com',
  },
  {
    id: 'mcp-snyk',
    name: 'Snyk',
    provider: 'Snyk',
    description: 'Security findings and dependency metadata for scan and gate workflows.',
    tags: ['devtools', 'cloud'],
    docsUrl: 'https://docs.snyk.io',
  },
];

/** Local overrides when editing catalog MCP entries from the Extensions UI (prototype). */
export type McpConnectionOverride = {
  name: string;
  serverType: string;
  url: string;
  hasApiKey: boolean;
};

/** Effective MCP endpoint URL for display and forms (catalog defaults + optional local overrides). */
export function mcpCatalogDisplayUrl(
  entry: McpCatalogEntry,
  saved?: McpConnectionOverride | null
): string {
  return saved?.url ?? entry.docsUrl ?? `https://mcp.example/${encodeURIComponent(entry.id)}`;
}

export function mcpModalInitialValuesFromCatalog(
  entry: McpCatalogEntry,
  saved?: McpConnectionOverride | null
): { name: string; serverType: string; url: string; hasApiKey: boolean } {
  return {
    name: saved?.name ?? entry.name,
    serverType: saved?.serverType ?? 'http',
    url: mcpCatalogDisplayUrl(entry, saved),
    hasApiKey: saved?.hasApiKey ?? false,
  };
}
