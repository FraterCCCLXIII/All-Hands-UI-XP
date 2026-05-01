export type ConversationStatus = 'running' | 'awaiting' | 'error';

export interface ConversationSummary {
  id: string;
  name: string;
  version: string;
  tag?: string;
  repo: string;
  branch?: string;
  /** Agent persona/name used to run the conversation. */
  agent?: string;
  /** LLM / model label shown after branch in the conversation drawer. */
  model?: string;
  time: string;
  /** Agent status driving the indicator dot color. */
  status?: ConversationStatus;
  /** When true, conversation drawer row is muted and shows an Archived badge. */
  archived?: boolean;
}

export const conversationSummaries: ConversationSummary[] = [
  {
    id: 'af0bb6d8f20947f7ad04d53b7bf05a00',
    name: 'Ship dark-mode tokens for nav shell',
    version: 'V1',
    repo: 'FraterCCCLXIII/pr-navigator',
    branch: 'main',
    agent: 'Claude',
    model: 'GPT-5',
    time: '1h ago',
    status: 'running',
  },
  {
    id: '0ff1812ced8f453189e945365bd52268',
    name: 'Migrate chat store to RTK slices',
    version: 'V1',
    repo: 'FraterCCCLXIII/chatrtk',
    agent: 'Claude',
    model: 'Claude Opus',
    time: '3d ago',
    status: 'awaiting',
  },
  {
    id: 'sample-conv-billing-onboarding',
    name: 'Onboarding checklist — billing & entitlements',
    version: 'V1',
    tag: 'Feature',
    repo: 'acme/web-app',
    branch: 'feat/billing-onboarding',
    agent: 'OpenHands Agent',
    model: 'GPT-4o',
    time: '2h ago',
    status: 'error',
  },
  {
    id: 'sample-conv-checkout-e2e',
    name: 'Fix flaky checkout E2E (Safari)',
    version: 'V1',
    repo: 'acme/web-app',
    branch: 'fix/checkout-e2e',
    agent: 'Claude',
    model: 'Claude 3.5 Sonnet',
    time: '5h ago',
    status: 'running',
  },
  {
    id: 'sample-conv-tokens-audit',
    name: 'Design tokens audit — Q1 cleanup',
    version: 'V1',
    repo: 'acme/design-system',
    branch: 'chore/token-audit',
    agent: 'OpenHands Agent',
    model: 'GPT-5',
    time: '1d ago',
  },
  {
    id: 'sample-conv-api-rate-limits',
    name: 'API rate limits rollout plan',
    version: 'V1',
    repo: 'acme/backend-api',
    branch: 'main',
    agent: 'Claude',
    model: 'Claude Opus',
    time: '2d ago',
  },
  {
    id: 'sample-conv-no-repo-research',
    name: 'Draft onboarding questions for product review',
    version: 'V1',
    repo: 'No Repository',
    agent: 'OpenHands Agent',
    model: 'GPT-5',
    time: '4h ago',
  },
  // Linked from Automations activity log (prototype)
  {
    id: 'auto-activity-pr-triage',
    name: 'PR triage — risky changes & reviewer queue',
    version: 'V1',
    tag: 'Automation',
    repo: 'acme/frontend-app',
    branch: 'main',
    agent: 'Claude',
    model: 'Claude Opus',
    time: 'recent',
  },
  {
    id: 'auto-activity-cross-repo',
    name: 'Cross-repo release — dependency & CI report',
    version: 'V1',
    tag: 'Automation',
    repo: 'acme/frontend-app',
    branch: 'main',
    agent: 'OpenHands Agent',
    model: 'GPT-5',
    time: 'recent',
  },
  {
    id: 'auto-activity-security',
    name: 'Nightly security pass — findings digest',
    version: 'V1',
    repo: 'acme/backend-api',
    branch: 'main',
    agent: 'OpenHands Agent',
    model: 'GPT-5',
    time: 'recent',
  },
  {
    id: 'auto-activity-docs',
    name: 'Docs sync run — user-facing updates summary',
    version: 'V1',
    repo: 'acme/docs',
    branch: 'main',
    agent: 'Docs Agent',
    model: 'GPT-4o',
    time: 'recent',
  },
  {
    id: 'auto-activity-release',
    name: 'Release readiness — blockers & approvals',
    version: 'V1',
    repo: 'acme/realtime-service',
    branch: 'release',
    agent: 'Release Agent',
    model: 'Gemini 2.5 Pro',
    time: 'recent',
  },
  {
    id: 'auto-activity-incident',
    name: 'Incident summary — PD webhook run',
    version: 'V1',
    tag: 'Automation',
    repo: 'acme/backend-api',
    branch: 'main',
    agent: 'Claude',
    model: 'Claude Opus',
    time: 'recent',
    archived: true,
  },
];
