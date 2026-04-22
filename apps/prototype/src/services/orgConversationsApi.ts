/**
 * Org Conversations REST API (prototype).
 * Real backend: GET /api/orgs/{orgId}/conversations — Admin/Owner only, paginated; support sort, status, and search query params.
 * Response items may include `stackCreatedAt` / `stackUpdatedAt` (runtime stack lifecycle); if absent, UI may fall back to conversation `createdAt` / `updatedAt`.
 */

export type ConversationStatus = 'active' | 'completed' | 'error' | 'stopped';
export type RuntimeStatus = 'running' | 'starting' | 'stopped' | 'error';

export interface OrgSubagentUsage {
  id: string;
  name: string;
  model: string;
  tokens: number;
  costUsd: number;
}

export interface OrgConversation {
  id: string;
  name: string;
  model: string;
  createdBy: string;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
  /** Runtime / sandbox stack provision time (ISO). Omitted in API → UI falls back to conversation timestamps. */
  stackCreatedAt?: string;
  /** Last stack reconcile or infra update (ISO). */
  stackUpdatedAt?: string;
  conversationStatus: ConversationStatus;
  runtimeStatus: RuntimeStatus;
  runtimeGuid: string;
  runtimeUrl: string;
  totalTokens: number;
  totalCostUsd: number;
  subagents: OrgSubagentUsage[];
  /** Read-only preview for admin drawer */
  previewMessages: Array<{ role: 'user' | 'assistant'; text: string; at: string }>;
}

export interface OrgConversationsPage {
  items: OrgConversation[];
  total: number;
  page: number;
  pageSize: number;
}

/** Sortable fields; date sorts use stack timestamps when present (same as table “Created / Updated”). */
export type OrgConversationsSortField =
  | 'updatedAt'
  | 'createdAt'
  | 'name'
  | 'totalTokens'
  | 'totalCostUsd';

export type OrgConversationsSortDir = 'asc' | 'desc';

export interface OrgConversationsListQuery {
  sortField?: OrgConversationsSortField;
  sortDir?: OrgConversationsSortDir;
  conversationStatus?: ConversationStatus | 'all';
  runtimeStatus?: RuntimeStatus | 'all';
  /** Trims; matches conversation name, creator, email, or model (case-insensitive). */
  search?: string;
  /**
   * Inclusive local calendar date `YYYY-MM-DD` (browser timezone when set from UI).
   * Filters by last activity: `stackUpdatedAt ?? updatedAt`.
   */
  dateFrom?: string;
  /** Inclusive local calendar end date `YYYY-MM-DD`. */
  dateTo?: string;
  /**
   * Rolling window: keep rows whose effective last update is within this many hours from now.
   * Can combine with `dateFrom` / `dateTo` (intersection).
   */
  updatedWithinHours?: number;
}

function effectiveCreated(c: OrgConversation): string {
  return c.stackCreatedAt ?? c.createdAt;
}

function effectiveUpdated(c: OrgConversation): string {
  return c.stackUpdatedAt ?? c.updatedAt;
}

function localDayStartMs(isoDate: string): number {
  const [y, m, d] = isoDate.trim().split('-').map(Number);
  if (!y || !m || !d) return NaN;
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

function localDayEndMs(isoDate: string): number {
  const [y, m, d] = isoDate.trim().split('-').map(Number);
  if (!y || !m || !d) return NaN;
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

function applyOrgConversationsQuery(
  rows: OrgConversation[],
  query?: OrgConversationsListQuery
): OrgConversation[] {
  let out = [...rows];
  const q = query?.search?.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.createdBy.toLowerCase().includes(q) ||
        c.createdByEmail.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q)
    );
  }
  const cs = query?.conversationStatus;
  if (cs && cs !== 'all') {
    out = out.filter((c) => c.conversationStatus === cs);
  }
  const rs = query?.runtimeStatus;
  if (rs && rs !== 'all') {
    out = out.filter((c) => c.runtimeStatus === rs);
  }
  const hrs = query?.updatedWithinHours;
  if (hrs != null && hrs > 0) {
    const cutoff = Date.now() - hrs * 60 * 60 * 1000;
    out = out.filter((c) => new Date(effectiveUpdated(c)).getTime() >= cutoff);
  }
  const df = query?.dateFrom?.trim();
  if (df) {
    const fromMs = localDayStartMs(df);
    if (!Number.isNaN(fromMs)) {
      out = out.filter((c) => new Date(effectiveUpdated(c)).getTime() >= fromMs);
    }
  }
  const dt = query?.dateTo?.trim();
  if (dt) {
    const toMs = localDayEndMs(dt);
    if (!Number.isNaN(toMs)) {
      out = out.filter((c) => new Date(effectiveUpdated(c)).getTime() <= toMs);
    }
  }
  const sortField = query?.sortField ?? 'updatedAt';
  const sortDir = query?.sortDir ?? 'desc';
  const mul = sortDir === 'asc' ? 1 : -1;
  out.sort((a, b) => {
    if (sortField === 'name') {
      return mul * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    }
    if (sortField === 'totalTokens') {
      return mul * (a.totalTokens - b.totalTokens);
    }
    if (sortField === 'totalCostUsd') {
      return mul * (a.totalCostUsd - b.totalCostUsd);
    }
    if (sortField === 'createdAt') {
      return mul * (new Date(effectiveCreated(a)).getTime() - new Date(effectiveCreated(b)).getTime());
    }
    return mul * (new Date(effectiveUpdated(a)).getTime() - new Date(effectiveUpdated(b)).getTime());
  });
  return out;
}

const MOCK: OrgConversation[] = [
  {
    id: 'conv-01',
    name: 'Fix auth middleware regression',
    model: 'claude-sonnet-4-5',
    createdBy: 'Alex Rivera',
    createdByEmail: 'alex@acme.example',
    createdAt: '2026-04-21T14:02:00Z',
    updatedAt: '2026-04-22T09:15:00Z',
    stackCreatedAt: '2026-04-21T14:02:18Z',
    stackUpdatedAt: '2026-04-22T09:14:02Z',
    conversationStatus: 'active',
    runtimeStatus: 'running',
    runtimeGuid: 'rt-7f3a9c2e-441b-4d01-9c11-8e2b0d4a1f00',
    runtimeUrl: 'https://runtime.openhands.dev/r/rt-7f3a9c2e',
    totalTokens: 84200,
    totalCostUsd: 4.12,
    subagents: [
      { id: 'sa-1', name: 'Code explorer', model: 'claude-sonnet-4-5', tokens: 41000, costUsd: 2.01 },
      { id: 'sa-2', name: 'Test runner', model: 'claude-sonnet-4-5', tokens: 43200, costUsd: 2.11 },
    ],
    previewMessages: [
      { role: 'user', text: 'JWT validation fails on edge after deploy.', at: '2026-04-21T14:02:00Z' },
      { role: 'assistant', text: 'I’ll trace auth middleware and reproduce against staging.', at: '2026-04-21T14:03:10Z' },
    ],
  },
  {
    id: 'conv-02',
    name: 'Service account: nightly eval harness',
    model: 'gpt-5.2',
    createdBy: 'api:eval-bot',
    createdByEmail: 'eval-bot@acme.example',
    createdAt: '2026-04-22T01:00:00Z',
    updatedAt: '2026-04-22T08:40:00Z',
    stackCreatedAt: '2026-04-22T01:00:42Z',
    stackUpdatedAt: '2026-04-22T08:39:55Z',
    conversationStatus: 'active',
    runtimeStatus: 'running',
    runtimeGuid: 'rt-aa991122-bbcc-4dee-8899-001122334455',
    runtimeUrl: 'https://runtime.openhands.dev/r/rt-aa991122',
    totalTokens: 201400,
    totalCostUsd: 9.87,
    subagents: [
      { id: 'sa-3', name: 'Batch worker', model: 'gpt-5.2', tokens: 201400, costUsd: 9.87 },
    ],
    previewMessages: [
      { role: 'user', text: 'Run swe-bench subset and post summary to #eng-agents.', at: '2026-04-22T01:00:00Z' },
    ],
  },
  {
    id: 'conv-03',
    name: 'On-call: resume stuck session',
    model: 'claude-opus-4-6',
    createdBy: 'Jordan Lee',
    createdByEmail: 'jordan@acme.example',
    createdAt: '2026-04-20T18:30:00Z',
    updatedAt: '2026-04-21T22:10:00Z',
    conversationStatus: 'completed',
    runtimeStatus: 'stopped',
    runtimeGuid: 'rt-deadbeef-0000-4000-8000-000000000001',
    runtimeUrl: 'https://runtime.openhands.dev/r/rt-deadbeef',
    totalTokens: 120500,
    totalCostUsd: 18.2,
    subagents: [],
    previewMessages: [
      { role: 'user', text: 'Conversation hung after sandbox reconnect.', at: '2026-04-20T18:30:00Z' },
      { role: 'assistant', text: 'Resumed from checkpoint; PR opened.', at: '2026-04-21T21:55:00Z' },
    ],
  },
  {
    id: 'conv-04',
    name: 'Migrate terraform modules',
    model: 'claude-sonnet-4-5',
    createdBy: 'Sam Patel',
    createdByEmail: 'sam@acme.example',
    createdAt: '2026-04-19T10:00:00Z',
    updatedAt: '2026-04-20T16:00:00Z',
    conversationStatus: 'completed',
    runtimeStatus: 'stopped',
    runtimeGuid: 'rt-c0ffee11-2222-4333-8444-555566667777',
    runtimeUrl: 'https://runtime.openhands.dev/r/rt-c0ffee11',
    totalTokens: 56000,
    totalCostUsd: 2.74,
    subagents: [
      { id: 'sa-4', name: 'Infra reviewer', model: 'claude-sonnet-4-5', tokens: 56000, costUsd: 2.74 },
    ],
    previewMessages: [{ role: 'user', text: 'Bump AWS provider and fix subnet refs.', at: '2026-04-19T10:00:00Z' }],
  },
  {
    id: 'conv-05',
    name: 'Debug websocket disconnects',
    model: 'gemini-3-pro-preview',
    createdBy: 'Riley Chen',
    createdByEmail: 'riley@acme.example',
    createdAt: '2026-04-18T09:12:00Z',
    updatedAt: '2026-04-18T14:22:00Z',
    conversationStatus: 'error',
    runtimeStatus: 'error',
    runtimeGuid: 'rt-error-3333-4444-5555-666677778888',
    runtimeUrl: 'https://runtime.openhands.dev/r/rt-error-3333',
    totalTokens: 12000,
    totalCostUsd: 0.45,
    subagents: [],
    previewMessages: [{ role: 'assistant', text: 'Runtime lost connection to agent bus.', at: '2026-04-18T14:20:00Z' }],
  },
  {
    id: 'conv-06',
    name: 'CI: flaky integration test',
    model: 'gpt-5-mini',
    createdBy: 'Morgan Blake',
    createdByEmail: 'morgan@acme.example',
    createdAt: '2026-04-17T11:00:00Z',
    updatedAt: '2026-04-17T19:30:00Z',
    conversationStatus: 'completed',
    runtimeStatus: 'stopped',
    runtimeGuid: 'rt-11112222-3333-4444-5555-666677778888',
    runtimeUrl: 'https://runtime.openhands.dev/r/rt-11112222',
    totalTokens: 34000,
    totalCostUsd: 0.82,
    subagents: [{ id: 'sa-5', name: 'Log digger', model: 'gpt-5-mini', tokens: 34000, costUsd: 0.82 }],
    previewMessages: [],
  },
  {
    id: 'conv-07',
    name: 'Docs: OpenHands Index rollout',
    model: 'claude-sonnet-4-5',
    createdBy: 'Taylor Kim',
    createdByEmail: 'taylor@acme.example',
    createdAt: '2026-04-16T08:00:00Z',
    updatedAt: '2026-04-16T12:00:00Z',
    conversationStatus: 'completed',
    runtimeStatus: 'stopped',
    runtimeGuid: 'rt-docs-aaaa-bbbb-cccc-dddddddddddd',
    runtimeUrl: 'https://runtime.openhands.dev/r/rt-docs-aaaa',
    totalTokens: 22000,
    totalCostUsd: 1.05,
    subagents: [],
    previewMessages: [],
  },
  {
    id: 'conv-08',
    name: 'API smoke via service account',
    model: 'gpt-5.2',
    createdBy: 'api:smoke-runner',
    createdByEmail: 'smoke@acme.example',
    createdAt: '2026-04-22T06:00:00Z',
    updatedAt: '2026-04-22T06:12:00Z',
    conversationStatus: 'stopped',
    runtimeStatus: 'stopped',
    runtimeGuid: 'rt-smoke-9999-8888-7777-666655554444',
    runtimeUrl: 'https://runtime.openhands.dev/r/rt-smoke-9999',
    totalTokens: 8900,
    totalCostUsd: 0.31,
    subagents: [],
    previewMessages: [],
  },
  {
    id: 'conv-09',
    name: 'Feature: export chat transcript',
    model: 'claude-sonnet-4-5',
    createdBy: 'Casey Nguyen',
    createdByEmail: 'casey@acme.example',
    createdAt: '2026-04-15T15:20:00Z',
    updatedAt: '2026-04-15T17:00:00Z',
    conversationStatus: 'completed',
    runtimeStatus: 'stopped',
    runtimeGuid: 'rt-export-1212-3434-5656-787898989898',
    runtimeUrl: 'https://runtime.openhands.dev/r/rt-export-1212',
    totalTokens: 15000,
    totalCostUsd: 0.72,
    subagents: [],
    previewMessages: [],
  },
  {
    id: 'conv-10',
    name: 'Runtime cold start investigation',
    model: 'claude-opus-4-6',
    createdBy: 'DevOps Bot',
    createdByEmail: 'devops-bot@acme.example',
    createdAt: '2026-04-14T04:00:00Z',
    updatedAt: '2026-04-14T07:30:00Z',
    conversationStatus: 'completed',
    runtimeStatus: 'stopped',
    runtimeGuid: 'rt-cold-abcd-ef01-2345-6789abcdef01',
    runtimeUrl: 'https://runtime.openhands.dev/r/rt-cold-abcd',
    totalTokens: 98000,
    totalCostUsd: 14.5,
    subagents: [
      { id: 'sa-6', name: 'Metrics', model: 'claude-opus-4-6', tokens: 40000, costUsd: 6.1 },
      { id: 'sa-7', name: 'Trace', model: 'claude-opus-4-6', tokens: 58000, costUsd: 8.4 },
    ],
    previewMessages: [],
  },
  {
    id: 'conv-11',
    name: 'Quick: typo in README',
    model: 'gpt-5-mini',
    createdBy: 'Jamie Fox',
    createdByEmail: 'jamie@acme.example',
    createdAt: '2026-04-13T19:00:00Z',
    updatedAt: '2026-04-13T19:08:00Z',
    conversationStatus: 'completed',
    runtimeStatus: 'stopped',
    runtimeGuid: 'rt-readme-0000-1111-2222-333344445555',
    runtimeUrl: 'https://runtime.openhands.dev/r/rt-readme-0000',
    totalTokens: 2100,
    totalCostUsd: 0.04,
    subagents: [],
    previewMessages: [],
  },
  {
    id: 'conv-12',
    name: 'Security review dependency bump',
    model: 'claude-sonnet-4-5',
    createdBy: 'Priya Shah',
    createdByEmail: 'priya@acme.example',
    createdAt: '2026-04-12T10:00:00Z',
    updatedAt: '2026-04-12T16:45:00Z',
    conversationStatus: 'completed',
    runtimeStatus: 'stopped',
    runtimeGuid: 'rt-sec-aaaa-bbbb-cccc-ddddaaaaaaaa',
    runtimeUrl: 'https://runtime.openhands.dev/r/rt-sec-aaaa',
    totalTokens: 67000,
    totalCostUsd: 3.28,
    subagents: [{ id: 'sa-8', name: 'CVE scan', model: 'claude-sonnet-4-5', tokens: 67000, costUsd: 3.28 }],
    previewMessages: [],
  },
];

function allMockConversations(): OrgConversation[] {
  return [...MOCK];
}

/**
 * Simulated GET /api/orgs/:orgId/conversations?page=&pageSize=&sort=&status=&q=&dateFrom=&dateTo=&updatedWithinHours=
 * Prototype applies sort/filter in-process; a real API would pass query params.
 */
export async function fetchOrgConversationsPage(
  _orgId: string,
  page: number,
  pageSize: number,
  query?: OrgConversationsListQuery
): Promise<OrgConversationsPage> {
  const filtered = applyOrgConversationsQuery(allMockConversations(), query);
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  await new Promise((r) => setTimeout(r, 180));
  return { items, total, page, pageSize };
}

/** All rows matching filters/sort (no pagination) — for CSV export and similar. */
export async function fetchOrgConversationsFilteredAll(
  _orgId: string,
  query?: OrgConversationsListQuery
): Promise<OrgConversation[]> {
  const filtered = applyOrgConversationsQuery(allMockConversations(), query);
  await new Promise((r) => setTimeout(r, 120));
  return filtered;
}

export interface OrgConversationMetrics {
  activeConversations: number;
  runningRuntimes: number;
  completedLast24h: number;
  totalTokensWindow: number;
  estimatedSpendUsd: number;
}

export async function fetchOrgConversationMetrics(_orgId: string): Promise<OrgConversationMetrics> {
  const items = allMockConversations();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const activeConversations = items.filter((c) => c.conversationStatus === 'active').length;
  const runningRuntimes = items.filter((c) => c.runtimeStatus === 'running').length;
  const completedLast24h = items.filter(
    (c) => c.conversationStatus === 'completed' && now - new Date(c.updatedAt).getTime() < day
  ).length;
  const totalTokensWindow = items.reduce((s, c) => s + c.totalTokens, 0);
  const estimatedSpendUsd = items.reduce((s, c) => s + c.totalCostUsd, 0);
  await new Promise((r) => setTimeout(r, 80));
  return {
    activeConversations,
    runningRuntimes,
    completedLast24h,
    totalTokensWindow,
    estimatedSpendUsd,
  };
}
