import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AppWindow,
  Building2,
  Copy,
  Cpu,
  CreditCard,
  CheckCircle,
  ChevronDown,
  Eye,
  Info,
  Key,
  Layers,
  MoreVertical,
  Pencil,
  Plus,
  Blocks,
  RefreshCw,
  Shield,
  User,
  Users,
  Trash2,
  Webhook,
} from 'lucide-react';
import { AdvancedLlmForm } from '../components/settings/AdvancedLlmForm';
import { ChatGPTConnectSection } from '../components/settings/ChatGPTConnectSection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { PrototypeControlsFab } from '../components/common/PrototypeControlsFab';
import { showAppToast } from '../lib/appToast';
import {
  dataTableBodyClassName,
  dataTableClassName,
  dataTableHeadRowClassName,
  dataTableInnerClassName,
  dataTableRowClassName,
  dataTableShellClassName,
  dataTableTh,
} from '../components/ui/table';
import { McpIcon } from '../components/icons/McpIcon';
import { SkillIcon } from '../components/icons/SkillIcon';
import { PluginToggle } from '../components/ui/plugin-toggle';
import { SearchInput } from '../components/ui/search-input';
import { cn } from '../lib/utils';
import { usePageTransitions } from '../contexts/PageTransitionsContext';
import { AddHookModal, AddMcpServerModal, mcpServerTypeLabel } from './extensions/extensionsCatalogAddModals';
import {
  ACCOUNT_NAV,
  INTEGRATIONS_AND_SKILLS_NAV,
  INTEGRATIONS_ONLY_NAV,
  ORG_ADMIN_PERSONAL_SETTINGS_NAV,
  ORG_SETTINGS_NAV,
  PERSONAL_ACCOUNT_WITH_BILLING_NAV,
  PERSONAL_WORKSPACE_TOP_NAV,
  SKILLS_ONLY_NAV,
  filterSettingsNav,
  rolePermissions,
  type OrgRole,
  type PermissionKey,
  type SettingsNavItem,
  type WorkspaceNavContext,
} from '../config/settingsWorkspaceNav';

const settingsTabs = [
  { id: 'user', label: 'User', icon: User },
  { id: 'integrations', label: 'Integrations', icon: Blocks },
  { id: 'app', label: 'Application', icon: AppWindow },
  { id: 'llm', label: 'Language Model (LLM)', icon: Cpu },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'secrets', label: 'Secrets', icon: Shield },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'mcp', label: 'MCP', icon: McpIcon },
  { id: 'organizations', label: 'Organization', icon: Building2 },
  { id: 'org-plugins', label: 'Extensions', icon: Layers },
  { id: 'org-hooks', label: 'Hooks', icon: Webhook },
  { id: 'manage-team', label: 'Organization Members', icon: Users },
  { id: 'skills', label: 'Skills', icon: SkillIcon },
];

type SecretsView = 'list' | 'add' | 'edit';

function parseSettingsRoute(tab: string | undefined): {
  tabId: string;
  secretsView: SecretsView;
  editingSecretId: string | null;
} {
  if (!tab) {
    return { tabId: 'api-keys', secretsView: 'list', editingSecretId: null };
  }
  if (tab === 'secrets' || tab.startsWith('secrets/')) {
    if (tab === 'secrets') {
      return { tabId: 'secrets', secretsView: 'list', editingSecretId: null };
    }
    const sub = tab.slice('secrets/'.length);
    if (sub === 'add') {
      return { tabId: 'secrets', secretsView: 'add', editingSecretId: null };
    }
    if (sub.startsWith('edit/')) {
      const id = sub.slice('edit/'.length);
      return { tabId: 'secrets', secretsView: 'edit', editingSecretId: id || null };
    }
    return { tabId: 'secrets', secretsView: 'list', editingSecretId: null };
  }
  if (settingsTabs.some((t) => t.id === tab)) {
    return { tabId: tab, secretsView: 'list', editingSecretId: null };
  }
  return { tabId: 'api-keys', secretsView: 'list', editingSecretId: null };
}

const settingsTabDescriptions: Record<string, string> = {
  user: 'View and update your account email address.',
  integrations: 'Connect Git hosts, Slack, Jira, and other services.',
  app: 'Set language, privacy, notifications, and Git commit identity.',
  llm: 'Choose your model provider, API keys, and advanced options.',
  billing: 'Check your balance and add credits to your account.',
  secrets: 'Create and manage secrets for safe use in workflows.',
  'api-keys': 'Manage API keys for programmatic access and the OpenHands LLM key.',
  mcp:
    'Add Model Context Protocol servers, control team visibility, and choose whether each server is used in every new conversation.',
  organizations: 'Manage credits, organization details, and Git conversation routing.',
  'org-plugins':
    'Add extension repositories from Git URLs, choose which plugins and skills appear for your organization, and enable them in every conversation.',
  'org-hooks':
    'Define organization hooks and control whether members see them in the UI and whether they run automatically in every new conversation.',
  skills: 'Choose which skills are available for your organization and how they appear in conversations.',
};

/** Border + padding below the line only. Parent stacks sections with `gap-6`; extra `mt-*` here doubles the gap above the rule. */
const settingsSectionRule = 'border-t border-border pt-6';

/** Vertical gap between major settings blocks (Tailwind `gap-6`). */
const settingsSectionStackGap = 'gap-6';

/** Gap under subsection subline (description) to the next control or table — same as `settingsSectionStackGap`. */
const settingsSublineToContentGap = settingsSectionStackGap;

const orgOptions = [
  { id: 'personal', name: 'Personal Account', role: null, type: 'personal' },
  { id: 'acme-owner', name: 'Acme Inc', role: 'Owner', type: 'org' },
  { id: 'starlight-admin', name: 'Starlight Labs', role: 'Admin', type: 'org' },
  { id: 'nova-member', name: 'Nova Group', role: 'Member', type: 'org' },
];

const personalOrgOptions = orgOptions.filter((o) => o.type === 'personal');
const gitOrganizationOptions = orgOptions.filter((o) => o.type === 'org');

const roleOptionsForTeam: OrgRole[] = ['Member', 'Admin', 'Owner'];

const initialTeamMembers = [
  { id: 'alice', email: 'alice@acme.org', role: 'Owner', status: 'active' },
  { id: 'bob', email: 'bob@acme.org', role: 'Owner', status: 'active' },
  { id: 'some', email: 'some@email.com', role: 'Member', status: 'invited' },
  { id: 'separate', email: 'separate@email.com', role: 'Member', status: 'invited' },
];

type GitSourceId = 'github' | 'gitlab' | 'bitbucket';
type GitConnectionStatus = 'connected' | 'disconnected' | 'connecting';

const gitSourceDefinitions: Array<{
  id: GitSourceId;
  name: string;
  connectLabel: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'github',
    name: 'GitHub',
    connectLabel: 'Connect GitHub',
    icon: (
      <svg className="h-5 w-5 text-[#8534F3]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    connectLabel: 'Connect GitLab',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.387 9.452.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.624-8.443a.92.92 0 0 0 .331-1.024" fill="#E24329"/>
        <path d="M12 23.054l4.418-13.604H7.582z" fill="#FC6D26"/>
        <path d="M12 23.054l-4.418-13.604H1.387z" fill="#FCA326"/>
        <path d="M1.387 9.451L.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054z" fill="#E24329"/>
        <path d="M1.387 9.451h6.195L4.918 1.262a.455.455 0 0 0-.867 0z" fill="#FC6D26"/>
        <path d="M12 23.054l4.418-13.604h6.195z" fill="#FCA326"/>
        <path d="M22.613 9.451l1.342 4.136a.924.924 0 0 1-.331 1.023L12 23.054z" fill="#E24329"/>
        <path d="M22.613 9.451h-6.195l2.664-8.189a.455.455 0 0 1 .867 0z" fill="#FC6D26"/>
      </svg>
    ),
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    connectLabel: 'Connect Bitbucket',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M13.5508 0.555664C13.8304 0.555669 14.04 0.794414 13.9941 1.08105L13.3906 4.8584H4.78516L5.55469 9.08887H8.46875L8.99902 5.98438H13.2109L12.082 13.0566C12.0353 13.2715 11.8489 13.4385 11.6387 13.4385H2.50098C2.19793 13.4385 1.94217 13.2238 1.89551 12.9131L0.00683594 1.05762C-0.0392224 0.794892 0.169738 0.531535 0.449219 0.53125L13.5508 0.555664Z" fill="#2684FF"/>
      </svg>
    ),
  },
];

const initialGitSourceStatus: Record<GitSourceId, GitConnectionStatus> = {
  github: 'connected',
  gitlab: 'disconnected',
  bitbucket: 'disconnected',
};

type VcsProvider = 'GitHub' | 'GitLab';
type OrgClaimOption = {
  id: string;
  provider: VcsProvider;
  handle: string;
  availableToOwner: boolean;
};

const orgClaimOptions: OrgClaimOption[] = [
  { id: 'gh-openhands', provider: 'GitHub', handle: 'OpenHands', availableToOwner: true },
  { id: 'gh-acmeco', provider: 'GitHub', handle: 'AcmeCo', availableToOwner: true },
  { id: 'gh-already-claimed', provider: 'GitHub', handle: 'already-claimed', availableToOwner: true },
  { id: 'gl-openhands', provider: 'GitLab', handle: 'OpenHands', availableToOwner: true },
];

const initialClaimRegistry: Record<string, string | null> = {
  'gh-openhands': 'OpenHands',
  'gh-acmeco': 'Acme Inc',
  'gh-already-claimed': 'Acme Inc',
  'gl-openhands': null,
};

type OrgCatalogKind = 'plugin' | 'skill';

type OrgPluginCatalogItem = {
  id: string;
  name: string;
  /** Git URL or owner/repo for the plugin or skill bundle. */
  pluginRepo: string;
  /** Marketplace catalog id; used to open this item in Plugin Marketplace. */
  marketplaceSkillId: string;
  kind: OrgCatalogKind;
  visible: boolean;
  availableAllConversations: boolean;
};

const initialOrgPluginCatalog: OrgPluginCatalogItem[] = [
  {
    id: 'cat-static',
    name: 'Static Analysis',
    pluginRepo: 'github.com/OpenHands/static-analysis',
    marketplaceSkillId: 'marketplace-deps',
    kind: 'plugin',
    visible: true,
    availableAllConversations: false,
  },
  {
    id: 'cat-search',
    name: 'Code Search',
    pluginRepo: 'github.com/OpenHands/code-search',
    marketplaceSkillId: 'marketplace-performance',
    kind: 'plugin',
    visible: true,
    availableAllConversations: true,
  },
  {
    id: 'cat-github',
    name: 'GitHub',
    pluginRepo: 'github.com/OpenHands/github-plugin',
    marketplaceSkillId: 'marketplace-security',
    kind: 'plugin',
    visible: true,
    availableAllConversations: false,
  },
  {
    id: 'skill-babysit',
    name: 'babysit',
    pluginRepo: 'github.com/FraterCCCLXIII/babysit-skill',
    marketplaceSkillId: 'marketplace-refactor',
    kind: 'skill',
    visible: true,
    availableAllConversations: false,
  },
  {
    id: 'skill-canvas',
    name: 'canvas',
    pluginRepo: 'gitlab.com/FraterCCCLXIII/canvas-skill',
    marketplaceSkillId: 'marketplace-api-design',
    kind: 'skill',
    visible: true,
    availableAllConversations: false,
  },
  {
    id: 'skill-create-rule',
    name: 'create-rule',
    pluginRepo: 'github.com/FraterCCCLXIII/create-rule',
    marketplaceSkillId: 'marketplace-pr-description',
    kind: 'skill',
    visible: false,
    availableAllConversations: false,
  },
];

type OrgHookItem = {
  id: string;
  name: string;
  instructions: string;
  visible: boolean;
  availableAllConversations: boolean;
};

const initialOrgHooks: OrgHookItem[] = [];

type SettingsMcpServerRow = {
  id: string;
  serverType: string;
  url: string;
  hasApiKey: boolean;
  visible: boolean;
  availableAllConversations: boolean;
};

type OpenHandsApiKeyRow = {
  id: string;
  name: string;
  created: string;
  lastUsed: string;
};

const initialOpenHandsApiKeys: OpenHandsApiKeyRow[] = [
  { id: 'api-key-cli-2', name: 'CLI 2', created: '9/23/2025, 8:58:05 PM', lastUsed: 'Never' },
  { id: 'api-key-cli', name: 'CLI', created: '9/19/2025, 5:09:37 PM', lastUsed: 'Never' },
];

/** Demo-only: generate a one-time display secret for the “API Key Created” modal. */
function generateOpenHandsApiKeySecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const len = 48;
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  let tail = '';
  for (let i = 0; i < len; i += 1) tail += chars[arr[i]! % chars.length];
  return `sk-oh-${tail}`;
}

export interface SettingsScreenProps {
  /** Initial tab from route (e.g. llm for #/settings/llm) */
  initialTab?: string;
  /** Called when user switches tab so the URL can be updated */
  onTabChange?: (tab: string) => void;
  /** Optional override for LLM tab content */
  llmContentOverride?: React.ReactNode;
  /** Optional label override for the LLM tab heading */
  llmTabLabelOverride?: string;
  /** Control whether LLM content is scrollable */
  llmContentScrollable?: boolean;
  /** Control whether main content is scrollable */
  mainContentScrollable?: boolean;
  /** Optional controlled org selection */
  selectedOrgId?: string;
  /** Optional org change callback */
  onOrgChange?: (orgId: string) => void;
  /** Installed plugin repositories shown in user settings */
  pluginRepositories?: string[];
  /** Add plugin repository callback */
  onAddPluginRepository?: (repoUrl: string) => void;
  /** Remove plugin repository callback */
  onRemovePluginRepository?: (repoUrl: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  initialTab,
  onTabChange,
  llmContentOverride,
  llmTabLabelOverride,
  llmContentScrollable: _llmContentScrollable = true,
  mainContentScrollable = true,
  selectedOrgId: controlledOrgId,
  onOrgChange,
  pluginRepositories = [],
  onAddPluginRepository,
  onRemovePluginRepository,
}) => {
  const [activeTab, setActiveTab] = useState(() => parseSettingsRoute(initialTab).tabId);
  const [secretsView, setSecretsView] = useState<SecretsView>(() => parseSettingsRoute(initialTab).secretsView);
  const [editingSecretId, setEditingSecretId] = useState<string | null>(
    () => parseSettingsRoute(initialTab).editingSecretId,
  );
  const [gitUsername, setGitUsername] = useState('openhands');
  const [gitEmail, setGitEmail] = useState('openhands@all-hands.dev');
  const [userEmail, setUserEmail] = useState('panentheum@gmail.com');
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [enableSound, setEnableSound] = useState(false);
  const [enableProactive, setEnableProactive] = useState(true);
  const [enableSolvability, setEnableSolvability] = useState(true);
  const [advancedLLM, setAdvancedLLM] = useState(true);
  const [llmProvider, setLlmProvider] = useState('');
  const [llmApiKey, setLlmApiKey] = useState('');
  const [llmApiKeyApproved, setLlmApiKeyApproved] = useState(false);
  const [openaiConnecting, setOpenaiConnecting] = useState(false);
  const [enableCondenser, setEnableCondenser] = useState(true);
  const [enableConfirmation, setEnableConfirmation] = useState(false);
  const [advancedModel, setAdvancedModel] = useState('litellm_proxy/prod/claude-opus-4-5-20251101');
  const [advancedBaseUrl, setAdvancedBaseUrl] = useState('https://llm-proxy.app.all-hands.dev');
  const [uncontrolledOrgId, setUncontrolledOrgId] = useState(orgOptions[0]?.id ?? 'personal');
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [memberDeleteTarget, setMemberDeleteTarget] = useState<(typeof initialTeamMembers)[number] | null>(
    null,
  );
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [createOrgModalOpen, setCreateOrgModalOpen] = useState(false);
  const [gitSourceStatus, setGitSourceStatus] = useState<Record<GitSourceId, GitConnectionStatus>>(
    initialGitSourceStatus,
  );
  const [gitSourceDisconnectTarget, setGitSourceDisconnectTarget] = useState<GitSourceId | null>(null);
  const [claimRegistry, setClaimRegistry] = useState<Record<string, string | null>>(initialClaimRegistry);
  const [pluginRepoInput, setPluginRepoInput] = useState('');
  const [orgPluginCatalog, setOrgPluginCatalog] = useState<OrgPluginCatalogItem[]>(initialOrgPluginCatalog);
  const [orgPluginsSearchQuery, setOrgPluginsSearchQuery] = useState('');
  const [orgPluginsKindFilter, setOrgPluginsKindFilter] = useState<'all' | OrgCatalogKind>('all');
  const [orgPluginsRepoFilter, setOrgPluginsRepoFilter] = useState<string>('all');
  const [orgHooks, setOrgHooks] = useState<OrgHookItem[]>(initialOrgHooks);
  const [addHookModalOpen, setAddHookModalOpen] = useState(false);
  const [addMcpModalOpen, setAddMcpModalOpen] = useState(false);
  const [mcpEditingId, setMcpEditingId] = useState<string | null>(null);
  const [settingsMcpServers, setSettingsMcpServers] = useState<SettingsMcpServerRow[]>([]);
  const [secrets, setSecrets] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [newSecretName, setNewSecretName] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  const [newSecretDescription, setNewSecretDescription] = useState('');
  const [secretDeleteTarget, setSecretDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteOrganizationDialogOpen, setDeleteOrganizationDialogOpen] = useState(false);
  const [addCreditAmount, setAddCreditAmount] = useState('');
  const [openHandsApiKeys, setOpenHandsApiKeys] = useState<OpenHandsApiKeyRow[]>(initialOpenHandsApiKeys);
  const [createApiKeyModalOpen, setCreateApiKeyModalOpen] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [apiKeyCreatedModalOpen, setApiKeyCreatedModalOpen] = useState(false);
  const [revealedApiKey, setRevealedApiKey] = useState('');
  /** Demo: unlocked after adding ≥$10 on Billing, or via prototype FAB (API Keys). */
  const [hasOpenHandsLlmKeyAccess, setHasOpenHandsLlmKeyAccess] = useState(false);
  /** Demo: Organization → Git Conversation Routing shows empty state (prototype FAB). */
  const [demoEmptyGitClaimOrganizations, setDemoEmptyGitClaimOrganizations] = useState(false);
  const selectedOrgId = controlledOrgId ?? uncontrolledOrgId;

  const canAddCredit = useMemo(() => {
    const v = addCreditAmount.trim();
    if (v === '') return false;
    const n = Number(v);
    return Number.isFinite(n) && n >= 10 && n <= 25000;
  }, [addCreditAmount]);

  const orgPluginCatalogRepoOptions = useMemo(() => {
    const unique = [...new Set(orgPluginCatalog.map((r) => r.pluginRepo))];
    unique.sort((a, b) => a.localeCompare(b));
    return unique;
  }, [orgPluginCatalog]);

  const filteredOrgPluginCatalog = useMemo(() => {
    let rows = orgPluginCatalog;
    if (orgPluginsKindFilter !== 'all') {
      rows = rows.filter((r) => r.kind === orgPluginsKindFilter);
    }
    if (orgPluginsRepoFilter !== 'all') {
      rows = rows.filter((r) => r.pluginRepo === orgPluginsRepoFilter);
    }
    const q = orgPluginsSearchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const name = row.name.toLowerCase();
      const kind = row.kind.toLowerCase();
      const repo = row.pluginRepo.toLowerCase();
      return name.includes(q) || kind.includes(q) || repo.includes(q);
    });
  }, [
    orgPluginCatalog,
    orgPluginsSearchQuery,
    orgPluginsKindFilter,
    orgPluginsRepoFilter,
  ]);

  useEffect(() => {
    const r = parseSettingsRoute(initialTab);
    if (settingsTabs.some((t) => t.id === r.tabId)) {
      setActiveTab(r.tabId);
    }
    setSecretsView(r.secretsView);
    setEditingSecretId(r.editingSecretId);
    if (r.secretsView === 'edit' && r.editingSecretId) {
      const row = secrets.find((s) => s.id === r.editingSecretId);
      if (row) {
        setNewSecretName(row.name);
        setNewSecretDescription(row.description);
        setNewSecretValue('');
      } else {
        setSecretsView('list');
        setEditingSecretId(null);
        onTabChange?.('secrets');
      }
    }
    // secrets read intentionally only when initialTab changes (avoid resetting edit form when list updates)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync route → form on navigation only
  }, [initialTab, onTabChange]);

  useEffect(() => {
    if (createApiKeyModalOpen) {
      setNewApiKeyName('');
    }
  }, [createApiKeyModalOpen]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'secrets') {
      setSecretsView('list');
      setEditingSecretId(null);
    }
    onTabChange?.(tabId);
  };

  const updateOrgCatalogItem = (
    id: string,
    patch: Partial<Pick<OrgPluginCatalogItem, 'visible' | 'availableAllConversations'>>,
  ) => {
    setOrgPluginCatalog((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const updateOrgHookItem = (
    id: string,
    patch: Partial<Pick<OrgHookItem, 'visible' | 'availableAllConversations'>>,
  ) => {
    setOrgHooks((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const updateSettingsMcpServer = (
    id: string,
    patch: Partial<Pick<SettingsMcpServerRow, 'visible' | 'availableAllConversations'>>,
  ) => {
    setSettingsMcpServers((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const handleDeleteMcpServer = (id: string) => {
    setSettingsMcpServers((prev) => prev.filter((row) => row.id !== id));
    if (mcpEditingId === id) {
      setAddMcpModalOpen(false);
      setMcpEditingId(null);
    }
    showToast('MCP server removed.', 'success');
  };

  const isChatGPTConnected = llmProvider === 'openai' && llmApiKeyApproved && llmApiKey.length > 0;
  const isValidBaseUrl = (() => {
    try {
      const parsed = new URL(advancedBaseUrl.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  })();
  const isValidModelName = advancedModel.trim().length > 0 && !advancedModel.includes(' ');
  const selectedOrg = orgOptions.find((org) => org.id === selectedOrgId) ?? orgOptions[0];
  const effectiveRole: OrgRole =
    selectedOrg?.type === 'personal' ? 'Owner' : (selectedOrg?.role as OrgRole) ?? 'Member';

  useEffect(() => {
    if (selectedOrg?.type === 'personal' && (activeTab === 'org-plugins' || activeTab === 'org-hooks')) {
      setActiveTab('user');
      onTabChange?.('user');
    }
  }, [selectedOrg?.type, activeTab, onTabChange]);

  const workspaceNavCtx: WorkspaceNavContext = useMemo(
    () => ({
      workspaceType: selectedOrg?.type === 'org' ? 'org' : 'personal',
      effectiveRole,
    }),
    [selectedOrg?.type, effectiveRole],
  );
  const hasPermission = (permission: PermissionKey) => rolePermissions[effectiveRole].has(permission);
  const filterNav = (items: SettingsNavItem[]) => filterSettingsNav(items, workspaceNavCtx);
  const showOrgAdminNav =
    selectedOrg?.type === 'org' && (effectiveRole === 'Admin' || effectiveRole === 'Owner');
  const showOrgMemberNav = selectedOrg?.type === 'org' && effectiveRole === 'Member';
  const canInviteMembers = hasPermission('invite_user_to_organization');
  const canManageOrgClaims = true;
  const activeOrgName = selectedOrg?.name ?? 'Personal Account';
  const canChangeRoles =
    hasPermission('change_user_role:member') ||
    hasPermission('change_user_role:admin') ||
    hasPermission('change_user_role:owner');
  const canAssignOwner = hasPermission('change_user_role:owner');

  const handleMemberRoleChange = (memberId: string, role: OrgRole) => {
    setTeamMembers((prev) =>
      prev.map((member) => (member.id === memberId ? { ...member, role } : member)),
    );
  };

  const handleMemberDelete = () => {
    if (!memberDeleteTarget) return;
    setTeamMembers((prev) => prev.filter((member) => member.id !== memberDeleteTarget.id));
    setMemberDeleteTarget(null);
  };

  const showToast = (message: string, variant: 'info' | 'success' | 'error' = 'info') => {
    showAppToast({ message, variant });
  };

  const handleConfirmDeleteSecret = () => {
    if (!secretDeleteTarget) return;
    const id = secretDeleteTarget.id;
    setSecrets((prev) => prev.filter((s) => s.id !== id));
    if (editingSecretId === id) {
      setEditingSecretId(null);
      setNewSecretName('');
      setNewSecretValue('');
      setNewSecretDescription('');
      setSecretsView('list');
      onTabChange?.('secrets');
    }
    setSecretDeleteTarget(null);
    showToast('Secret removed.', 'success');
  };

  const handleConfirmDeleteOrganization = () => {
    setDeleteOrganizationDialogOpen(false);
    showToast('This prototype does not delete organizations.', 'info');
  };

  const addInviteEmail = (rawValue: string) => {
    const normalized = rawValue.trim().replace(/,+$/, '');
    if (!normalized) return;
    setInviteEmails((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
  };

  const handleInviteInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
      event.preventDefault();
      addInviteEmail(inviteInput);
      setInviteInput('');
    }
  };

  const handleInviteInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.includes(',') || value.includes(' ')) {
      const tokens = value.split(/[,\s]+/).filter(Boolean);
      tokens.forEach((token) => addInviteEmail(token));
      setInviteInput('');
      return;
    }
    setInviteInput(value);
  };

  const handleSendInvites = () => {
    const pending = inviteInput.trim();
    const combined = [...inviteEmails, ...(pending ? [pending] : [])];
    const uniqueEmails = Array.from(new Set(combined.map((email) => email.trim()).filter(Boolean)));
    if (uniqueEmails.length === 0) return;
    setTeamMembers((prev) => {
      const existing = new Set(prev.map((member) => member.email.toLowerCase()));
      const newMembers = uniqueEmails
        .filter((email) => !existing.has(email.toLowerCase()))
        .map((email, index) => ({
          id: `invite-${Date.now()}-${index}`,
          email,
          role: 'Member' as OrgRole,
          status: 'invited' as const,
        }));
      return [...prev, ...newMembers];
    });
    setInviteInput('');
    setInviteEmails([]);
    setInviteModalOpen(false);
    showToast(`Invites sent to ${uniqueEmails.length} email${uniqueEmails.length === 1 ? '' : 's'}.`);
  };

  const handleOrgChange = (orgId: string) => {
    if (controlledOrgId === undefined) {
      setUncontrolledOrgId(orgId);
    }
    onOrgChange?.(orgId);
  };

  const handleGitSourceConnect = async (sourceId: GitSourceId) => {
    setGitSourceStatus((prev) => ({ ...prev, [sourceId]: 'connecting' }));
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    setGitSourceStatus((prev) => ({ ...prev, [sourceId]: 'connected' }));
    const sourceName = gitSourceDefinitions.find((source) => source.id === sourceId)?.name ?? sourceId;
    showToast(`${sourceName} connected. Continue sign-in to proceed with the demo.`);
  };

  const handleGitSourceDisconnect = () => {
    if (!gitSourceDisconnectTarget) return;
    const sourceName =
      gitSourceDefinitions.find((source) => source.id === gitSourceDisconnectTarget)?.name ??
      gitSourceDisconnectTarget;
    setGitSourceStatus((prev) => ({ ...prev, [gitSourceDisconnectTarget]: 'disconnected' }));
    setGitSourceDisconnectTarget(null);
    showToast(`${sourceName} disconnected.`);
  };

  const handleGitSourceConfigure = (sourceId: GitSourceId) => {
    const sourceName = gitSourceDefinitions.find((source) => source.id === sourceId)?.name ?? sourceId;
    showToast(`Configuring ${sourceName} repositories...`);
  };

  const claimableOptions = orgClaimOptions.filter((option) => option.availableToOwner);
  const gitConversationRoutingClaims = demoEmptyGitClaimOrganizations ? [] : claimableOptions;

  const handleClaim = (claimId: string) => {
    const owner = claimRegistry[claimId];
    if (owner && owner !== activeOrgName) {
      showToast('This has already been claimed by another organization and cannot be claimed.', 'error');
      return;
    }
    setClaimRegistry((prev) => ({ ...prev, [claimId]: activeOrgName }));
    showToast('Organization claimed successfully.', 'success');
  };

  const handleRemoveClaim = (claimId: string) => {
    setClaimRegistry((prev) => ({ ...prev, [claimId]: null }));
  };

  const handleChatGPTConnect = async () => {
    setOpenaiConnecting(true);
    setLlmProvider('openai');
    await new Promise((r) => setTimeout(r, 1500));
    setOpenaiConnecting(false);
    setLlmApiKey('•'.repeat(20));
    setLlmApiKeyApproved(true);
  };

  const handleChatGPTDisconnect = () => {
    setLlmProvider('');
    setLlmApiKey('');
    setLlmApiKeyApproved(false);
  };

  const handleAddPluginRepo = () => {
    const repoUrl = pluginRepoInput.trim();
    if (!repoUrl) return;
    onAddPluginRepository?.(repoUrl);
    setPluginRepoInput('');
  };

  const chatGPTConnectSection = (
    <ChatGPTConnectSection
      isConnected={isChatGPTConnected}
      isConnecting={openaiConnecting}
      onConnect={handleChatGPTConnect}
      onDisconnect={handleChatGPTDisconnect}
    />
  );

  const activeTabLabel = (() => {
    if (activeTab === 'llm' && llmTabLabelOverride !== undefined) {
      return llmTabLabelOverride;
    }
    return settingsTabs.find((t) => t.id === activeTab)?.label;
  })();

  const prefersReducedMotion = useReducedMotion();
  const { pageTransitionsEnabled, setPageTransitionsEnabled } = usePageTransitions();
  const settingsContentMotionActive = pageTransitionsEnabled && !prefersReducedMotion;

  /** Route-derived state only — avoids a second key flip when `initialTab` catches up after mount (which caused double transitions). */
  const settingsMainTransitionKey = useMemo(
    () => [activeTab, secretsView, editingSecretId ?? ''].join('|'),
    [activeTab, secretsView, editingSecretId],
  );

  const settingsMainTransition = settingsContentMotionActive
    ? { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const }
    : { duration: 0 };

  const renderNavButton = (item: SettingsNavItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.tabId;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleTabClick(item.tabId)}
        className={cn(
          'group flex w-full items-center gap-3 rounded-md px-3.5 py-2 text-left transition-colors duration-200',
          isActive ? 'bg-muted/60' : 'hover:bg-muted/60',
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5 shrink-0',
            isActive ? '!text-white' : '!text-muted-foreground group-hover:!text-white',
          )}
          aria-hidden
        />
        <span
          className={cn(
            'block min-w-0 flex-1 truncate text-sm font-normal transition-transform duration-300',
            isActive
              ? 'text-white'
              : 'text-muted-foreground group-hover:translate-x-0.5 group-hover:!text-white',
          )}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className={cn('flex min-h-0 min-w-0 flex-1 overflow-hidden pl-8 pr-0', settingsSectionStackGap)}>
      {/* Left Navigation — vertical inset from CSS vars (independent of main) */}
      <nav
        className={cn(
          'relative z-10 flex w-64 shrink-0 flex-col pt-[var(--settings-nav-padding-top)] pb-[var(--settings-nav-padding-bottom)]',
          settingsSectionStackGap,
        )}
      >
        <div className="flex items-center gap-2 ml-1">
          <h2 className="text-xl font-semibold leading-6 text-foreground">Settings</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-tour-id="settings.org-selector"
              className="group flex h-10 w-full shrink-0 items-center justify-between gap-2 rounded-md border border-border bg-muted/20 px-4 text-left text-sm text-foreground transition-colors hover:bg-muted/60"
              aria-label="Select organization"
            >
              <span className="flex items-center gap-2 w-full">
                {selectedOrg?.type === 'org' ? (
                  <Building2 className="w-4 h-4 shrink-0 text-muted-foreground transition-colors group-hover:text-white" />
                ) : (
                  <User className="w-4 h-4 shrink-0 text-muted-foreground transition-colors group-hover:text-white" />
                )}
                <span>{selectedOrg?.name ?? 'Personal Account'}</span>
                {selectedOrg?.role && (
                  <span className="ml-auto rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {selectedOrg.role}
                  </span>
                )}
              </span>
              <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground transition-colors group-hover:text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {personalOrgOptions.map((org) => (
              <DropdownMenuItem key={org.id} onClick={() => handleOrgChange(org.id)}>
                <span className="flex items-center gap-2 w-full">
                  <User className="w-4 h-4 shrink-0" />
                  <span>{org.name}</span>
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {gitOrganizationOptions.length > 0 ? (
              gitOrganizationOptions.map((org) => (
                <DropdownMenuItem key={org.id} onClick={() => handleOrgChange(org.id)}>
                  <span className="flex items-center gap-2 w-full">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>{org.name}</span>
                    {org.role && (
                      <span className="ml-auto rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {org.role}
                      </span>
                    )}
                  </span>
                </DropdownMenuItem>
              ))
            ) : (
              <div
                data-testid="git-organizations-empty"
                className="mx-1 mb-1 rounded-md border border-border bg-muted/20 px-3 py-2.5 text-center text-sm text-muted-foreground"
              >
                No git organizations found
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex flex-col gap-2">
          {showOrgAdminNav ? (
            <>
              <div className="px-3.5 pt-0.5">
                <span className="text-[11px] font-medium uppercase tracking-wide leading-5 text-muted-foreground">
                  Org settings
                </span>
              </div>
              <div className="flex flex-col gap-0.5">{filterNav(ORG_SETTINGS_NAV).map(renderNavButton)}</div>
              <div className="border-t border-border" />
              <div className="px-3.5">
                <span className="text-[11px] font-medium uppercase tracking-wide leading-5 text-muted-foreground">
                  Personal settings
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                {filterNav(ORG_ADMIN_PERSONAL_SETTINGS_NAV).map(renderNavButton)}
              </div>
              <div className="border-t border-border" />
              <div className="flex flex-col gap-0.5">{filterNav(ACCOUNT_NAV).map(renderNavButton)}</div>
            </>
          ) : showOrgMemberNav ? (
            <>
              <div className="px-3.5 pt-0.5">
                <span className="text-[11px] font-medium uppercase tracking-wide leading-5 text-muted-foreground">
                  Personal settings
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                {filterNav(PERSONAL_WORKSPACE_TOP_NAV).map(renderNavButton)}
                {filterNav(INTEGRATIONS_ONLY_NAV).map(renderNavButton)}
              </div>
              <div className="border-t border-border" />
              <div className="flex flex-col gap-0.5">
                {filterNav(ACCOUNT_NAV).map(renderNavButton)}
                {filterNav(SKILLS_ONLY_NAV).map(renderNavButton)}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-0.5">
                {filterNav(PERSONAL_WORKSPACE_TOP_NAV).map(renderNavButton)}
                {filterNav(INTEGRATIONS_AND_SKILLS_NAV).map(renderNavButton)}
              </div>
              <div className="border-t border-border" />
              <div className="flex flex-col gap-0.5">
                {filterNav(PERSONAL_ACCOUNT_WITH_BILLING_NAV).map(renderNavButton)}
              </div>
            </>
          )}
          {selectedOrg?.type === 'personal' ? (
            <>
              <div className="border-t border-border" />
              <button
                type="button"
                onClick={() => setCreateOrgModalOpen(true)}
                className="group flex items-center gap-3 rounded-md px-3.5 py-2 text-left transition-colors hover:bg-muted/60"
              >
                <Plus className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-white" aria-hidden />
                <span className="text-sm font-normal text-muted-foreground group-hover:text-white">
                  Create New Organization
                </span>
              </button>
            </>
          ) : null}
        </div>
      </nav>

      {/* Main Content — scrolls at the viewport right edge; inner padding keeps text off the gutter */}
      <main
        className={cn(
          'relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden pt-[var(--settings-main-padding-top)] pb-[var(--settings-main-padding-bottom)]',
          mainContentScrollable && 'overflow-y-auto'
        )}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col pr-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={settingsMainTransitionKey}
              className={cn('flex flex-col', settingsSectionStackGap)}
              initial={settingsContentMotionActive ? { opacity: 0, x: 28 } : false}
              animate={{ opacity: 1, x: 0 }}
              exit={settingsContentMotionActive ? { opacity: 0, x: -28 } : { opacity: 0 }}
              transition={settingsMainTransition}
            >
          {activeTabLabel && activeTab !== 'manage-team' && (
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold leading-6 text-foreground">{activeTabLabel}</h2>
                {activeTab === 'llm' && showOrgAdminNav && (
                  <div
                    data-testid="org-wide-settings-badge"
                    className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-2.5 py-1"
                  >
                    <Info className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="text-[11px] font-medium leading-5 text-muted-foreground">
                      This setting affects the whole organization
                    </span>
                  </div>
                )}
              </div>
              {settingsTabDescriptions[activeTab] &&
                !(activeTab === 'secrets' && (secretsView === 'add' || secretsView === 'edit')) && (
                <p className="text-sm text-muted-foreground">{settingsTabDescriptions[activeTab]}</p>
              )}
            </div>
          )}

          {/* User Content */}
          {activeTab === 'user' && (
            <div className="contents">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-foreground">Email</label>
                    <div className="flex items-center gap-3">
                      <input
                        className="h-10 text-base text-foreground px-3 bg-muted/40 hover:bg-muted/60 transition-colors rounded-md border border-border flex-grow max-w-[680px] ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
                        placeholder="Loading..."
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        disabled
                        className="h-10 flex items-center justify-center px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/85 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manage Team Content */}
          {activeTab === 'manage-team' && (
            <div className="contents">
              <div className="flex flex-col gap-6 w-full">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold leading-6 text-foreground">
                      Organization Members
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Manage access and roles for your organization.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!canInviteMembers}
                    onClick={() => setInviteModalOpen(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 shrink-0" aria-hidden />
                    Invite Organization Member
                  </button>
                </div>

                <div className="rounded-lg border border-border bg-card divide-y divide-border">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">{member.email}</span>
                        {member.status === 'invited' && (
                          <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            Invited
                          </span>
                        )}
                      </div>
                      {member.role === 'Owner' ? (
                        <span className="text-xs text-muted-foreground">Owner</span>
                      ) : canChangeRoles ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={`Change role for ${member.email}`}
                            >
                              {member.role}
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuRadioGroup
                              value={member.role}
                              onValueChange={(value) => handleMemberRoleChange(member.id, value as OrgRole)}
                            >
                              {roleOptionsForTeam
                                .filter((role) => (role === 'Owner' ? canAssignOwner : true))
                                .map((role) => (
                                  <DropdownMenuRadioItem key={role} value={role}>
                                    {role}
                                  </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setMemberDeleteTarget(member)}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-xs text-muted-foreground">{member.role}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Integrations Content */}
          {activeTab === 'integrations' && (
            <div className="flex flex-col gap-3">
                {gitSourceDefinitions.map((source) => {
                  const status = gitSourceStatus[source.id];
                  const isConnected = status === 'connected';
                  const isConnecting = status === 'connecting';
                  return (
                    <div
                      key={source.id}
                      className="relative rounded-xl border border-border bg-card p-5 transition-colors duration-200 ease-out hover:bg-muted/60"
                    >
                      {isConnected && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted/60 hover:text-foreground"
                              aria-label={`Open actions for ${source.name}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => setGitSourceDisconnectTarget(source.id)}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Disconnect
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                          {source.icon}
                        </div>
                        <div
                          className={cn(
                            'flex min-w-0 flex-1 flex-col',
                            isConnected && 'pr-10',
                          )}
                        >
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className="text-base font-medium leading-tight text-foreground">{source.name}</span>
                            {isConnected && (
                              <span className="inline-flex shrink-0 items-center rounded-full border border-success/40 bg-success/15 px-2 py-0.5 text-xs font-medium text-success-foreground">
                                Connected
                              </span>
                            )}
                          </div>
                          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                            {`Connect your ${source.name} account to authorize repositories and configure access for OpenHands.`}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            {isConnected ? (
                              <button
                                type="button"
                                onClick={() => handleGitSourceConfigure(source.id)}
                                className="flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm text-foreground transition-colors duration-200 ease-out hover:bg-muted/60"
                              >
                                Configure Repositories
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void handleGitSourceConnect(source.id)}
                                disabled={isConnecting}
                                className="flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isConnecting ? 'Connecting...' : source.connectLabel}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Slack */}
                <div className="relative rounded-xl border border-border bg-card p-5 transition-colors duration-200 ease-out hover:bg-muted/60">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted/60">
                      <svg className="h-5 w-5" viewBox="0 0 54 54" aria-hidden>
                      <g fill="none" fillRule="evenodd">
                        <path d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386" fill="#36C5F0"/>
                        <path d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387" fill="#2EB67D"/>
                        <path d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386" fill="#ECB22E"/>
                        <path d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336 0v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.25a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387" fill="#E01E5A"/>
                      </g>
                      </svg>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-base font-medium text-foreground">Slack</span>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        Install the OpenHands Slack app to receive notifications in your workspace.
                      </p>
                      <div className="mt-3">
                        <button
                          type="button"
                          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/85 cursor-pointer"
                        >
                          Install OpenHands Slack App
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jira Cloud */}
                <div className="relative rounded-xl border border-border bg-card p-5 transition-colors duration-200 ease-out hover:bg-muted/60">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted/60">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                        <path
                          fill="#2684FF"
                          d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.757a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-base font-medium text-foreground">Jira Cloud</span>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        Link Jira to sync issues and keep OpenHands aligned with your project tracking.
                      </p>
                      <div className="mt-3">
                        <button
                          type="button"
                          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm text-foreground transition-colors duration-200 ease-out hover:bg-muted/60"
                        >
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          )}

          {/* Application Content */}
          {activeTab === 'app' && (
            <div className="contents">
              <form className="flex flex-col gap-6">
                <div className="flex flex-col gap-6">
                  <label className="flex w-full flex-col gap-2.5">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-foreground">Language</span>
                    </div>
                    <input
                      className="bg-muted/40 hover:bg-muted/60 transition-colors border border-border h-10 w-full rounded-md p-2 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
                      type="text"
                      value="English"
                      readOnly
                    />
                  </label>

                  <label className="flex items-center gap-2 w-fit cursor-pointer">
                    <PluginToggle
                      checked={enableAnalytics}
                      onCheckedChange={setEnableAnalytics}
                      aria-label="Send anonymous usage data"
                    />
                    <span className="text-sm text-foreground">Send anonymous usage data</span>
                  </label>

                  <label className="flex items-center gap-2 w-fit cursor-pointer">
                    <PluginToggle
                      checked={enableSound}
                      onCheckedChange={setEnableSound}
                      aria-label="Sound notifications"
                    />
                    <span className="text-sm text-foreground">Sound Notifications</span>
                  </label>

                  <label className="flex items-center gap-2 w-fit cursor-pointer">
                    <PluginToggle
                      checked={enableProactive}
                      onCheckedChange={setEnableProactive}
                      aria-label="Suggest tasks on GitHub"
                    />
                    <span className="text-sm text-foreground">Suggest Tasks on GitHub</span>
                  </label>

                  <label className="flex items-center gap-2 w-fit cursor-pointer">
                    <PluginToggle
                      checked={enableSolvability}
                      onCheckedChange={setEnableSolvability}
                      aria-label="Enable solvability analysis"
                    />
                    <span className="text-sm text-foreground">Enable Solvability Analysis</span>
                  </label>

                  <div
                    className="flex gap-3"
                    role="group"
                    aria-labelledby="settings-page-transitions-label"
                  >
                    <PluginToggle
                      checked={pageTransitionsEnabled}
                      onCheckedChange={setPageTransitionsEnabled}
                      aria-label="Page transitions when navigating"
                      className="mt-0.5 shrink-0"
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                      <span
                        id="settings-page-transitions-label"
                        className="text-sm leading-snug text-foreground"
                      >
                        Page transitions when navigating
                      </span>
                      <p className="text-xs leading-relaxed text-muted-foreground max-w-md">
                        Slide animations when switching views. Turn off for instant navigation.
                      </p>
                    </div>
                  </div>

                  <div className={settingsSectionRule}>
                    <div className={cn('flex flex-col', settingsSublineToContentGap)}>
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold leading-snug text-foreground">Git Settings</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure the username and email that OpenHands uses to commit changes.
                        </p>
                      </div>
                      <div className="flex flex-col gap-6">
                      <label className="flex w-full flex-col gap-2.5">
                        <span className="text-sm text-foreground">Git Username</span>
                        <input
                          placeholder="Username for git commits"
                          className="bg-muted/40 hover:bg-muted/60 transition-colors border border-border h-10 w-full rounded-md p-2 placeholder:italic ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
                          type="text"
                          value={gitUsername}
                          onChange={(e) => setGitUsername(e.target.value)}
                        />
                      </label>
                      <label className="flex w-full flex-col gap-2.5">
                        <span className="text-sm text-foreground">Git Email</span>
                        <input
                          placeholder="Email for git commits"
                          className="bg-muted/40 hover:bg-muted/60 transition-colors border border-border h-10 w-full rounded-md p-2 placeholder:italic ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
                          type="email"
                          value={gitEmail}
                          onChange={(e) => setGitEmail(e.target.value)}
                        />
                      </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-start gap-6 pt-2">
                <button
                  disabled
                  type="submit"
                  className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/85 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Save Changes
                </button>
                </div>
              </form>
            </div>
          )}

          {/* LLM Content */}
          {activeTab === 'llm' && (
            <div className="contents">
              {llmContentOverride ?? (
                <form className="flex w-full flex-col gap-6">
                  <div className="flex w-full flex-col gap-6">
                    <label className="flex items-center gap-2 w-fit cursor-pointer" data-testid="advanced-settings-switch">
                      <PluginToggle
                        checked={advancedLLM}
                        onCheckedChange={setAdvancedLLM}
                        aria-label="Advanced"
                      />
                      <span className="text-sm text-foreground">Advanced</span>
                    </label>

                    {!advancedLLM ? (
                      <>
                        <div className="flex w-full flex-col gap-6">
                          <fieldset className="flex w-full flex-col gap-2.5">
                            <label className="text-sm text-foreground">LLM Provider</label>
                            <div className="relative w-full">
                              <select
                                className="h-10 w-full rounded-md border border-border bg-muted/40 pl-3 pr-10 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30 appearance-none"
                                data-testid="llm-provider-input"
                                aria-label="LLM Provider"
                                value={llmProvider}
                                onChange={(e) => {
                                  setLlmProvider(e.target.value);
                                  setLlmApiKey('');
                                  setLlmApiKeyApproved(false);
                                }}
                              >
                                <option value="">Select a provider</option>
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic</option>
                                <option value="litellm">LiteLLM</option>
                              </select>
                              <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
                                aria-hidden
                              />
                            </div>
                          </fieldset>
                          <fieldset className="flex w-full flex-col gap-2.5">
                            <label className="text-sm text-foreground">LLM Model</label>
                            <div className="relative w-full">
                              <select
                                className="h-10 w-full rounded-md border border-border bg-muted/40 pl-3 pr-10 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30 appearance-none"
                                data-testid="llm-model-input"
                                aria-label="LLM Model"
                                defaultValue=""
                              >
                                <option value="">Select a model</option>
                                <option value="claude-opus">Claude Opus</option>
                                <option value="gpt-4o">GPT-4o</option>
                              </select>
                              <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
                                aria-hidden
                              />
                            </div>
                          </fieldset>
                        </div>
                        <label className="flex w-full flex-col gap-2.5">
                          <span className="text-sm text-foreground">API Key</span>
                          <div className="relative w-full">
                            <input
                              placeholder=""
                              value={llmApiKeyApproved ? '•'.repeat(llmApiKey.length) : llmApiKey}
                              onChange={(e) => setLlmApiKey(e.target.value)}
                              onKeyDown={(e) => {
                                if (llmApiKeyApproved) {
                                  setLlmApiKeyApproved(false);
                                  setLlmApiKey(e.key.length === 1 ? e.key : '');
                                  e.preventDefault();
                                } else if (e.key === 'Enter' && llmApiKey.length > 0) {
                                  setLlmApiKeyApproved(true);
                                  e.preventDefault();
                                }
                              }}
                              className="h-10 w-full rounded-md border border-border bg-muted/40 pl-3 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30"
                              type="text"
                              data-testid="llm-api-key-input"
                            />
                            {llmApiKeyApproved && llmApiKey.length > 0 && (
                              <CheckCircle
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success pointer-events-none"
                                aria-hidden
                              />
                            )}
                          </div>
                        </label>
                        <p className="text-xs text-muted-foreground" data-testid="llm-api-key-help-anchor">
                          Don't know your API key?{' '}
                          <a
                            href="https://docs.all-hands.dev/usage/local-setup#getting-an-api-key"
                            rel="noreferrer noopener"
                            target="_blank"
                            className="underline underline-offset-2 text-white hover:text-muted-foreground"
                          >
                            Click here for instructions
                          </a>
                        </p>
                        {chatGPTConnectSection}
                      </>
                    ) : (
                      <AdvancedLlmForm
                        model={advancedModel}
                        baseUrl={advancedBaseUrl}
                        onModelChange={setAdvancedModel}
                        onBaseUrlChange={setAdvancedBaseUrl}
                        isValidModelName={isValidModelName}
                        isValidBaseUrl={isValidBaseUrl}
                        enableCondenser={enableCondenser}
                        onEnableCondenserChange={setEnableCondenser}
                        enableConfirmation={enableConfirmation}
                        onEnableConfirmationChange={setEnableConfirmation}
                        footerContent={chatGPTConnectSection}
                      />
                    )}
                  </div>
                  <div className="flex justify-start gap-6 pt-2">
                    <button
                      disabled
                      type="submit"
                      className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/85 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Billing Content */}
          {activeTab === 'billing' && (
            <div className="contents">
              <form
                className="flex w-full min-w-0 flex-col gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!canAddCredit) return;
                  setHasOpenHandsLlmKeyAccess(true);
                  showToast('Credits added. OpenHands LLM key is now available in API Keys.', 'success');
                  setAddCreditAmount('');
                }}
              >
                <div className="w-full rounded-lg border border-border bg-gradient-to-br from-card to-muted/50 p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                        <CreditCard className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Available Balance</span>
                        <span className="text-2xl font-bold text-foreground">$437.18</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="flex h-10 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm text-primary-foreground transition-colors hover:bg-primary/85 cursor-pointer"
                    >
                      Manage Credits
                    </button>
                  </div>
                </div>
                <div className="flex w-full min-w-0 flex-col gap-3">
                  <span className="text-sm text-foreground">Add Funds</span>
                  <div className="flex w-full min-w-0 flex-col gap-2">
                    <div className="flex w-full min-w-0 items-center gap-2">
                      <div className="flex h-10 min-w-0 w-full max-w-[11rem] flex-1 items-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 transition-colors hover:bg-muted/60 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
                        <span className="shrink-0 select-none text-sm font-medium text-muted-foreground" aria-hidden>
                          $
                        </span>
                        <input
                          value={addCreditAmount}
                          onChange={(e) => setAddCreditAmount(e.target.value)}
                          placeholder="10 minimum"
                          min="10"
                          max="25000"
                          step="1"
                          aria-label="Amount in USD to add"
                          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          type="number"
                        />
                      </div>
                      <button
                        disabled={!canAddCredit}
                        type="submit"
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Plus className="h-4 w-4 shrink-0" aria-hidden />
                        Add Credit
                      </button>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                      <span className="text-sm font-semibold text-muted-foreground">Powered by</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8" viewBox="0 0 468 222.5">
                        <path d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.5v-20c-6.8 3.4-14.6 5.5-24.5 5.5-9.7 0-18.3-3.4-19.4-15.2h48.9c0-1.3.2-6.5.2-8.9zm-49.4-9.5c0-11.3 6.9-16 13.2-16 6.1 0 12.6 4.7 12.6 16h-25.8zM301.1 67.6c-9.8 0-16.1 4.6-19.6 7.8l-1.3-6.2h-22v116.6l25-5.3.1-28.3c3.6 2.6 8.9 6.3 17.7 6.3 17.9 0 34.2-14.4 34.2-46.1-.1-29-16.6-44.8-34.1-44.8zm-6 68.9c-5.9 0-9.4-2.1-11.8-4.7l-.1-37.1c2.6-2.9 6.2-4.9 11.9-4.9 9.1 0 15.4 10.2 15.4 23.3 0 13.4-6.2 23.4-15.4 23.4zM223.8 61.7l25.1-5.4V36l-25.1 5.3zM223.8 69.3h25.1v87.5h-25.1zM196.9 76.7l-1.6-7.4h-21.6v87.5h25V97.5c5.9-7.7 15.9-6.3 19-5.2v-23c-3.2-1.2-14.9-3.4-20.8 7.4zM146.9 47.6l-24.4 5.2-.1 80.1c0 14.8 11.1 25.7 25.9 25.7 8.2 0 14.2-1.5 17.5-3.3V135c-3.2 1.3-19 5.9-19-8.9V90.6h19V69.3h-19l.1-21.7zM79.3 94.7c0-3.9 3.2-5.4 8.5-5.4 7.6 0 17.2 2.3 24.8 6.4V72.2c-8.3-3.3-16.5-4.6-24.8-4.6C67.5 67.6 54 78.2 54 95.9c0 27.6 38 23.2 38 35.1 0 4.6-4 6.1-9.6 6.1-8.3 0-18.9-3.4-27.3-8v23.8c9.3 4 18.7 5.7 27.3 5.7 20.8 0 35.1-10.3 35.1-28.2-.1-29.8-38.2-24.5-38.2-35.7z" fill="#635bff"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Secrets Content */}
          {activeTab === 'secrets' && (secretsView === 'add' || secretsView === 'edit') && (
            <div className="contents">
              <form
                className={cn('flex max-w-xl flex-col', settingsSectionStackGap)}
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = newSecretName.trim();
                  if (!name) {
                    showToast('Enter a name for the secret.', 'error');
                    return;
                  }
                  if (editingSecretId) {
                    setSecrets((prev) =>
                      prev.map((s) =>
                        s.id === editingSecretId
                          ? { ...s, name, description: newSecretDescription.trim() }
                          : s,
                      ),
                    );
                    showToast('Secret updated.', 'success');
                  } else {
                    setSecrets((prev) => [
                      ...prev,
                      {
                        id: crypto.randomUUID(),
                        name,
                        description: newSecretDescription.trim(),
                      },
                    ]);
                    showToast('Secret added.', 'success');
                  }
                  setNewSecretName('');
                  setNewSecretValue('');
                  setNewSecretDescription('');
                  setEditingSecretId(null);
                  setSecretsView('list');
                  onTabChange?.('secrets');
                }}
              >
                <div className="flex flex-col gap-2">
                  <label htmlFor="secret-name" className="text-sm text-foreground">
                    Name
                  </label>
                  <input
                    id="secret-name"
                    name="name"
                    autoComplete="off"
                    placeholder="e.g. OpenAI_API_Key"
                    value={newSecretName}
                    onChange={(ev) => setNewSecretName(ev.target.value)}
                    className="h-10 max-w-[680px] flex-grow rounded-md border border-border bg-muted/40 px-3 text-base text-foreground transition-colors hover:bg-muted/60 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="secret-value" className="text-sm text-foreground">
                    Value
                  </label>
                  <textarea
                    id="secret-value"
                    name="value"
                    rows={6}
                    value={newSecretValue}
                    onChange={(ev) => setNewSecretValue(ev.target.value)}
                    className="min-h-[140px] w-full max-w-[680px] resize-y rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/60 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="secret-description" className="text-sm text-foreground">
                    Description{' '}
                    <span className="font-normal text-muted-foreground">(Optional)</span>
                  </label>
                  <input
                    id="secret-description"
                    name="description"
                    autoComplete="off"
                    value={newSecretDescription}
                    onChange={(ev) => setNewSecretDescription(ev.target.value)}
                    className="h-10 max-w-[680px] flex-grow rounded-md border border-border bg-muted/40 px-3 text-base text-foreground transition-colors hover:bg-muted/60 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setNewSecretName('');
                      setNewSecretValue('');
                      setNewSecretDescription('');
                      setEditingSecretId(null);
                      setSecretsView('list');
                      onTabChange?.('secrets');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editingSecretId ? 'Save changes' : 'Add secret'}</Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'secrets' && secretsView === 'list' && (
            <div className="contents">
              <div className="flex flex-col gap-8">
                <button
                  type="button"
                  className="inline-flex h-10 w-fit shrink-0 items-center justify-center gap-2 px-4 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/85 cursor-pointer transition-colors"
                  onClick={() => {
                    setEditingSecretId(null);
                    setSecretsView('add');
                    onTabChange?.('secrets/add');
                  }}
                >
                  <Plus className="h-4 w-4 shrink-0" aria-hidden />
                  Add A New Secret
                </button>
                <div className={dataTableShellClassName}>
                  <div className={dataTableInnerClassName}>
                    <table className={dataTableClassName}>
                      <thead>
                        <tr className={dataTableHeadRowClassName}>
                          <th scope="col" className={dataTableTh('w-1/4 px-4 text-left')}>
                            Name
                          </th>
                          <th scope="col" className={dataTableTh('w-1/2 px-4 text-left')}>
                            Description
                          </th>
                          <th scope="col" className={dataTableTh('w-1/4 px-4 text-right')}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className={dataTableBodyClassName}>
                        {secrets.length === 0 ? (
                          <tr className="bg-card">
                            <td
                              colSpan={3}
                              className="px-4 py-12 text-center"
                              role="status"
                              aria-live="polite"
                            >
                              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                                No secrets yet. Add your first secret to store API keys and other sensitive values for
                                workflows and automations—they stay encrypted and are never shown in full after
                                creation.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          secrets.map((row) => (
                            <tr key={row.id} className={dataTableRowClassName}>
                              <td className="px-4 py-3.5 align-middle text-sm text-foreground">{row.name}</td>
                              <td className="px-4 py-3.5 align-middle text-sm text-muted-foreground">
                                {row.description}
                              </td>
                              <td className="px-4 py-3.5 align-middle text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    aria-label={`Edit ${row.name}`}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                    onClick={() => {
                                      setEditingSecretId(row.id);
                                      setNewSecretName(row.name);
                                      setNewSecretDescription(row.description);
                                      setNewSecretValue('');
                                      setSecretsView('edit');
                                      onTabChange?.(`secrets/edit/${row.id}`);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" aria-hidden />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Delete ${row.name}`}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                    onClick={() => setSecretDeleteTarget({ id: row.id, name: row.name })}
                                  >
                                    <Trash2 className="h-4 w-4" aria-hidden />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Content */}
          {activeTab === 'api-keys' && (
            <div className="contents">
              <div className={cn('flex flex-col', settingsSectionStackGap)}>
                {/* OpenHands LLM Key Section */}
                <div className="flex flex-col gap-6 border-b border-border pb-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold leading-snug text-foreground">OpenHands LLM Key</h3>
                    <p className="text-sm text-muted-foreground">
                      Use this key as the LLM API key in OpenHands open-source and CLI; usage is billed to your cloud
                      account. Do not share this key elsewhere; anyone with it can incur charges on your account.
                    </p>
                  </div>
                  {!hasOpenHandsLlmKeyAccess ? (
                    <div className="flex flex-col gap-4 rounded-md border border-border bg-muted/60 p-4">
                      <p className="text-sm text-muted-foreground">
                        Purchase at least $10 in credits to get access to OpenHands LLM key for use with OpenHands CLI
                        and SDK.
                      </p>
                      <div>
                        <Button type="button" size="sm" onClick={() => handleTabClick('billing')}>
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          className="h-10 inline-flex w-fit cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm text-primary-foreground transition-colors hover:bg-primary/85"
                          onClick={() =>
                            showToast('A new OpenHands LLM key was generated.', 'success')
                          }
                        >
                          <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
                          Refresh API Key
                        </button>
                      </div>
                      <div>
                        <div className="flex w-full items-center gap-2">
                          <div
                            className="flex h-10 min-h-10 w-full min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-foreground ring-offset-background transition-colors hover:bg-muted/60 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2 focus-within:bg-muted/60"
                            role="group"
                            aria-label="OpenHands LLM API key"
                          >
                            <span className="min-w-0 truncate font-mono text-sm text-foreground">
                              ••••••••••••••••••••
                            </span>
                            <div className="flex shrink-0 items-center gap-0.5">
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                aria-label="Show API key"
                                title="Show API key"
                              >
                                <Eye className="h-4 w-4" aria-hidden />
                              </button>
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                aria-label="Copy API key"
                                title="Copy API key"
                              >
                                <Copy className="h-4 w-4" aria-hidden />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* OpenHands API Keys Section: intro + CTA grouped */}
                <div className={cn('flex flex-col', settingsSectionStackGap)}>
                  <div className={cn('flex flex-col', settingsSectionStackGap)}>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold leading-snug text-foreground">OpenHands API Keys</h3>
                      <p className="text-sm text-muted-foreground">
                        Create keys to authenticate with the OpenHands API from your applications and scripts. Keep your
                        API keys secure; anyone with a key can access your account. For more information on how to use the
                        API, see our{' '}
                        <a
                          href="https://docs.all-hands.dev/usage/cloud/cloud-api"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:underline hover:text-muted-foreground"
                        >
                          API documentation
                        </a>.
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="h-10 inline-flex items-center justify-center gap-2 w-fit px-4 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/85 cursor-pointer transition-colors"
                        onClick={() => setCreateApiKeyModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 shrink-0" aria-hidden />
                        Create API Key
                      </button>
                    </div>
                  </div>

                  {/* API Keys Table */}
                  <div className={dataTableShellClassName}>
                    <div className={dataTableInnerClassName}>
                      <table className={dataTableClassName}>
                        <thead>
                          <tr className={dataTableHeadRowClassName}>
                            <th scope="col" className={dataTableTh('px-4 text-left')}>
                              Name
                            </th>
                            <th scope="col" className={dataTableTh('px-4 text-left')}>
                              Created
                            </th>
                            <th scope="col" className={dataTableTh('px-4 text-left')}>
                              Last Used
                            </th>
                            <th scope="col" className={dataTableTh('px-4 text-right')}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className={dataTableBodyClassName}>
                          {openHandsApiKeys.length === 0 ? (
                            <tr className="bg-card">
                              <td
                                colSpan={4}
                                className="px-4 py-12 text-center"
                                role="status"
                                aria-live="polite"
                              >
                                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                                  No API keys yet. Create a key to authenticate with the OpenHands API from your
                                  applications and scripts.
                                </p>
                              </td>
                            </tr>
                          ) : (
                            openHandsApiKeys.map((row) => (
                              <tr key={row.id} className={dataTableRowClassName}>
                                <td
                                  className="max-w-[160px] truncate px-4 py-3.5 align-middle text-sm text-foreground"
                                  title={row.name}
                                >
                                  {row.name}
                                </td>
                                <td className="px-4 py-3.5 align-middle text-sm text-muted-foreground">{row.created}</td>
                                <td className="px-4 py-3.5 align-middle text-sm text-muted-foreground">
                                  {row.lastUsed}
                                </td>
                                <td className="px-4 py-3.5 align-middle text-right">
                                  <button
                                    type="button"
                                    aria-label={`Delete ${row.name}`}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                    onClick={() =>
                                      setOpenHandsApiKeys((prev) => prev.filter((k) => k.id !== row.id))
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" aria-hidden />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <Dialog open={createApiKeyModalOpen} onOpenChange={setCreateApiKeyModalOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                    <DialogDescription>
                      Give your API key a descriptive name to help you identify it later.
                    </DialogDescription>
                  </DialogHeader>
                  <div data-testid="create-api-key-modal" className="space-y-4 py-1">
                    <div>
                      <label htmlFor="api-key-name-input" className="mb-1.5 block text-sm font-medium text-foreground">
                        Name
                      </label>
                      <Input
                        id="api-key-name-input"
                        data-testid="api-key-name-input"
                        type="text"
                        placeholder="My API Key"
                        value={newApiKeyName}
                        onChange={(e) => setNewApiKeyName(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setCreateApiKeyModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!newApiKeyName.trim()}
                      onClick={() => {
                        const name = newApiKeyName.trim();
                        if (!name) return;
                        const secret = generateOpenHandsApiKeySecret();
                        setOpenHandsApiKeys((prev) => [
                          {
                            id: `api-key-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                            name,
                            created: new Date().toLocaleString(),
                            lastUsed: 'Never',
                          },
                          ...prev,
                        ]);
                        setCreateApiKeyModalOpen(false);
                        setRevealedApiKey(secret);
                        setApiKeyCreatedModalOpen(true);
                      }}
                    >
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={apiKeyCreatedModalOpen}
                onOpenChange={(open) => {
                  setApiKeyCreatedModalOpen(open);
                  if (!open) setRevealedApiKey('');
                }}
              >
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>API Key Created</DialogTitle>
                  </DialogHeader>
                  <div data-testid="new-api-key-modal" className="space-y-4 py-1">
                    <p className="text-sm text-muted-foreground">
                      This is the only time your API key will be displayed. Please copy it now and store it securely.
                    </p>
                    <div className="mt-4 flex min-h-10 items-center gap-2 rounded-md border border-border bg-muted/60 py-1.5 pl-3 pr-1.5">
                      <span className="min-w-0 flex-1 break-all font-mono text-sm leading-normal text-foreground">
                        {revealedApiKey}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        aria-label="Copy API key"
                        title="Copy API key"
                        onClick={() => {
                          if (!revealedApiKey) return;
                          void navigator.clipboard.writeText(revealedApiKey).then(() => {
                            showAppToast({ variant: 'success', message: 'Copied to clipboard.' });
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (!revealedApiKey) return;
                        void navigator.clipboard.writeText(revealedApiKey).then(() => {
                          showAppToast({ variant: 'success', message: 'Copied to clipboard.' });
                        });
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setApiKeyCreatedModalOpen(false);
                        setRevealedApiKey('');
                      }}
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* MCP Content */}
          {activeTab === 'mcp' && (
            <div className="contents">
              <div className="flex w-full flex-col gap-8">
                <div className="flex justify-start">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setMcpEditingId(null);
                      setAddMcpModalOpen(true);
                    }}
                  >
                    <Plus aria-hidden />
                    Add Server
                  </Button>
                </div>
                <AddMcpServerModal
                  open={addMcpModalOpen}
                  onOpenChange={(open) => {
                    setAddMcpModalOpen(open);
                    if (!open) setMcpEditingId(null);
                  }}
                  editingId={mcpEditingId}
                  initialValues={
                    mcpEditingId
                      ? settingsMcpServers.find((r) => r.id === mcpEditingId) ?? null
                      : null
                  }
                  onAdd={({ serverType, url, apiKey }) => {
                    setSettingsMcpServers((prev) => [
                      ...prev,
                      {
                        id: `mcp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                        serverType,
                        url,
                        hasApiKey: apiKey.length > 0,
                        visible: true,
                        availableAllConversations: false,
                      },
                    ]);
                  }}
                  onEdit={(id, payload) => {
                    setSettingsMcpServers((prev) =>
                      prev.map((r) => {
                        if (r.id !== id) return r;
                        const nextHasApiKey = payload.apiKey.length > 0 ? true : r.hasApiKey;
                        return {
                          ...r,
                          serverType: payload.serverType,
                          url: payload.url,
                          hasApiKey: nextHasApiKey,
                        };
                      }),
                    );
                  }}
                />
                <div className={dataTableShellClassName}>
                  <div className={dataTableInnerClassName}>
                    <table className={dataTableClassName}>
                      <colgroup>
                        <col className="min-w-0" />
                        <col className="w-[6.5rem]" />
                        <col className="w-[5.5rem]" />
                        <col className="w-[6.5rem]" />
                        <col className="w-[7rem]" />
                        <col className="w-12" />
                      </colgroup>
                      <thead>
                        <tr className={dataTableHeadRowClassName}>
                          <th scope="col" className={dataTableTh('px-4 text-left')}>
                            URL
                          </th>
                          <th scope="col" className={dataTableTh('px-3 text-left')}>
                            Type
                          </th>
                          <th scope="col" className={dataTableTh('px-3 text-center')}>
                            API key
                          </th>
                          <th scope="col" className={dataTableTh('px-3 text-center')}>
                            Visible
                          </th>
                          <th
                            scope="col"
                            className={dataTableTh('px-2 text-center whitespace-nowrap')}
                            title="All conversations — enable for every new conversation"
                          >
                            All conv.
                          </th>
                          <th scope="col" className={dataTableTh('w-12 px-1 text-right')}>
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className={dataTableBodyClassName}>
                        {settingsMcpServers.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-10 text-center text-sm text-muted-foreground"
                            >
                              No servers configured. Use Add Server to connect one.
                            </td>
                          </tr>
                        ) : (
                          settingsMcpServers.map((row) => (
                            <tr key={row.id} className={dataTableRowClassName}>
                              <td className="min-w-0 px-4 py-3.5 align-middle">
                                <span
                                  className="block truncate font-mono text-xs text-foreground"
                                  title={row.url}
                                >
                                  {row.url}
                                </span>
                              </td>
                              <td className="px-3 py-3.5 align-middle">
                                <span className="inline-flex rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground">
                                  {mcpServerTypeLabel(row.serverType)}
                                </span>
                              </td>
                              <td className="px-3 py-3.5 align-middle text-center">
                                <span className="text-xs text-muted-foreground">
                                  {row.hasApiKey ? 'Set' : '—'}
                                </span>
                              </td>
                              <td className="px-3 py-3.5 align-middle">
                                <div className="flex justify-center">
                                  <PluginToggle
                                    checked={row.visible}
                                    onCheckedChange={(next) =>
                                      updateSettingsMcpServer(row.id, {
                                        visible: next,
                                        ...(next ? {} : { availableAllConversations: false }),
                                      })
                                    }
                                    aria-label="Visible in UI for members"
                                  />
                                </div>
                              </td>
                              <td className="px-2 py-3.5 align-middle">
                                <div
                                  className={cn(
                                    'flex justify-center',
                                    !row.visible && 'cursor-not-allowed opacity-40',
                                  )}
                                >
                                  <PluginToggle
                                    checked={row.visible && row.availableAllConversations}
                                    disabled={!row.visible}
                                    onCheckedChange={(next) =>
                                      updateSettingsMcpServer(row.id, {
                                        availableAllConversations: next,
                                      })
                                    }
                                    aria-label="Use in every new conversation"
                                  />
                                </div>
                              </td>
                              <td className="px-1 py-3.5 align-middle text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                                      aria-label={`Actions for ${row.url}`}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                      className="gap-2"
                                      onClick={() => {
                                        setMcpEditingId(row.id);
                                        setAddMcpModalOpen(true);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="gap-2"
                                      onClick={() => handleDeleteMcpServer(row.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Org plugins & skills (Admin / Owner) */}
          {activeTab === 'org-plugins' && (
            <div className="contents">
              <div className={cn('flex w-full flex-col', settingsSectionStackGap)}>
                <div className={cn('flex flex-col', settingsSublineToContentGap)}>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold leading-snug text-foreground">Extension repositories</h3>
                    <p className="text-sm text-muted-foreground">
                      Add plugin repositories from Git URLs. Added repositories appear in the plugin marketplace.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      value={pluginRepoInput}
                      onChange={(e) => setPluginRepoInput(e.target.value)}
                      placeholder="https://github.com/org/plugin-repo"
                      className="h-10 flex-1 rounded-md border border-border bg-muted/40 px-3 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={handleAddPluginRepo}
                      disabled={pluginRepoInput.trim().length === 0}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4 shrink-0" aria-hidden />
                      Add Repository
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-md border border-border bg-card">
                    {pluginRepositories.length > 0 ? (
                      <ul className="divide-y divide-border">
                        {pluginRepositories.map((repo) => (
                          <li
                            key={repo}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-muted/60"
                          >
                            <span className="truncate text-sm text-foreground">{repo}</span>
                            <button
                              type="button"
                              onClick={() => onRemovePluginRepository?.(repo)}
                              className="h-7 shrink-0 rounded-md border border-destructive/35 bg-transparent px-2 text-xs text-destructive transition-colors hover:bg-destructive/10"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-3 pt-3 pb-4 text-sm text-muted-foreground">
                        No extension repositories added yet.
                      </div>
                    )}
                  </div>
                </div>
                <div className={cn('flex w-full flex-col', settingsSublineToContentGap, settingsSectionRule)}>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold leading-snug text-foreground">Plugins & skills</h3>
                    <p className="text-sm text-muted-foreground">
                      Search and filter by repository path, plugin vs skill, or narrow by repository.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
                    <SearchInput
                      value={orgPluginsSearchQuery}
                      onValueChange={setOrgPluginsSearchQuery}
                      placeholder="Search by name, repo, or type…"
                      aria-label="Search organization plugins and skills"
                      className="min-w-0 w-full sm:max-w-md sm:flex-1"
                    />
                    <div className="flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0">
                      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
                        <span className="text-xs uppercase tracking-wide">Type</span>
                        <div className="relative min-w-[8.5rem]">
                          <select
                            value={orgPluginsKindFilter}
                            onChange={(e) =>
                              setOrgPluginsKindFilter(e.target.value as 'all' | OrgCatalogKind)
                            }
                            aria-label="Filter by plugin or skill"
                            className="h-10 w-full min-w-[8.5rem] appearance-none rounded-md border border-border bg-muted/40 pl-3 pr-10 text-sm text-foreground ring-offset-background hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
                          >
                            <option value="all">All types</option>
                            <option value="plugin">Plugins only</option>
                            <option value="skill">Skills only</option>
                          </select>
                          <ChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                          />
                        </div>
                      </label>
                      <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-medium text-muted-foreground sm:min-w-[12rem] sm:max-w-[22rem]">
                        <span className="text-xs uppercase tracking-wide">Repository</span>
                        <div className="relative min-w-0 w-full">
                          <select
                            value={orgPluginsRepoFilter}
                            onChange={(e) => setOrgPluginsRepoFilter(e.target.value)}
                            aria-label="Filter by plugin repository"
                            className="h-10 w-full min-w-0 appearance-none rounded-md border border-border bg-muted/40 pl-3 pr-10 text-sm text-foreground ring-offset-background hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
                          >
                            <option value="all">All repositories</option>
                            {orgPluginCatalogRepoOptions.map((repo) => (
                              <option key={repo} value={repo}>
                                {repo}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                <div className={dataTableShellClassName}>
                  <div className={dataTableInnerClassName}>
                    <table className={dataTableClassName}>
                      <colgroup>
                        <col className="min-w-0" />
                        <col className="min-w-0" />
                        <col className="w-[6.5rem]" />
                        <col className="w-[5.5rem]" />
                        <col className="w-[7rem]" />
                      </colgroup>
                      <thead>
                        <tr className={dataTableHeadRowClassName}>
                          <th scope="col" className={dataTableTh('px-4 text-left')}>
                            Name
                          </th>
                          <th
                            scope="col"
                            className={dataTableTh('px-3 text-left')}
                            title="Plugin or skill bundle repository"
                          >
                            Repository
                          </th>
                          <th scope="col" className={dataTableTh('px-3 text-left')}>
                            Type
                          </th>
                          <th scope="col" className={dataTableTh('px-3 text-center')}>
                            Visible
                          </th>
                          <th
                            scope="col"
                            className={dataTableTh('px-2 text-center whitespace-nowrap')}
                            title="All conversations — enable for every new conversation"
                          >
                            All conv.
                          </th>
                        </tr>
                      </thead>
                      <tbody className={dataTableBodyClassName}>
                        {filteredOrgPluginCatalog.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-10 text-center text-sm text-muted-foreground"
                            >
                              No plugins or skills match your search.
                            </td>
                          </tr>
                        ) : (
                          filteredOrgPluginCatalog.map((row) => (
                            <tr key={row.id} className={dataTableRowClassName}>
                              <td className="px-4 py-3.5 align-middle">
                                <a
                                  href={
                                    row.kind === 'skill'
                                      ? `/extensions/skills/skill/${encodeURIComponent(row.marketplaceSkillId)}`
                                      : `/extensions/plugins/plugin/${encodeURIComponent(row.marketplaceSkillId)}`
                                  }
                                  className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
                                >
                                  {row.name}
                                </a>
                              </td>
                              <td className="min-w-0 px-3 py-3.5 align-middle">
                                <span
                                  className="block truncate font-mono text-xs text-muted-foreground"
                                  title={row.pluginRepo}
                                >
                                  {row.pluginRepo}
                                </span>
                              </td>
                              <td className="px-3 py-3.5 align-middle">
                                <span className="inline-flex rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium capitalize text-foreground">
                                  {row.kind}
                                </span>
                              </td>
                              <td className="px-3 py-3.5 align-middle">
                                <div className="flex justify-center">
                                  <PluginToggle
                                    checked={row.visible}
                                    onCheckedChange={(next) =>
                                      updateOrgCatalogItem(row.id, {
                                        visible: next,
                                        ...(next ? {} : { availableAllConversations: false }),
                                      })
                                    }
                                    aria-label="Visible in UI for members"
                                  />
                                </div>
                              </td>
                              <td className="px-2 py-3.5 align-middle">
                                <div
                                  className={cn(
                                    'flex justify-center',
                                    !row.visible && 'cursor-not-allowed opacity-40',
                                  )}
                                >
                                  <PluginToggle
                                    checked={row.visible && row.availableAllConversations}
                                    disabled={!row.visible}
                                    onCheckedChange={(next) =>
                                      updateOrgCatalogItem(row.id, {
                                        availableAllConversations: next,
                                      })
                                    }
                                    aria-label="Enable for every new conversation"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Organization hooks (Admin / Owner) */}
          {activeTab === 'org-hooks' && (
            <div className="contents">
              <div className="flex w-full flex-col gap-8">
                <div className="flex justify-start">
                  <Button type="button" size="sm" onClick={() => setAddHookModalOpen(true)}>
                    <Plus aria-hidden />
                    Add Hook
                  </Button>
                </div>
                <AddHookModal
                  open={addHookModalOpen}
                  onOpenChange={setAddHookModalOpen}
                  onAdd={({ name, instructions }) => {
                    setOrgHooks((prev) => [
                      ...prev,
                      {
                        id: `hook-${Date.now()}`,
                        name,
                        instructions,
                        visible: true,
                        availableAllConversations: false,
                      },
                    ]);
                  }}
                />
                <div className={dataTableShellClassName}>
                  <div className={dataTableInnerClassName}>
                    <table className={dataTableClassName}>
                      <colgroup>
                        <col className="min-w-0" />
                        <col className="min-w-0" />
                        <col className="w-[6.5rem]" />
                        <col className="w-[7rem]" />
                      </colgroup>
                      <thead>
                        <tr className={dataTableHeadRowClassName}>
                          <th scope="col" className={dataTableTh('px-4 text-left')}>
                            Name
                          </th>
                          <th scope="col" className={dataTableTh('px-3 text-left')}>
                            Instructions
                          </th>
                          <th scope="col" className={dataTableTh('px-3 text-center')}>
                            Visible
                          </th>
                          <th
                            scope="col"
                            className={dataTableTh('px-2 text-center whitespace-nowrap')}
                            title="All conversations — enable for every new conversation"
                          >
                            All conv.
                          </th>
                        </tr>
                      </thead>
                      <tbody className={dataTableBodyClassName}>
                        {orgHooks.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-10 text-center text-sm text-muted-foreground"
                            >
                              No hooks yet. Use Add Hook to create one.
                            </td>
                          </tr>
                        ) : (
                          orgHooks.map((row) => (
                            <tr key={row.id} className={dataTableRowClassName}>
                              <td className="px-4 py-3.5 align-middle">
                                <span className="font-medium text-foreground">{row.name}</span>
                              </td>
                              <td className="min-w-0 px-3 py-3.5 align-middle">
                                <span
                                  className="block truncate text-sm text-muted-foreground"
                                  title={row.instructions || undefined}
                                >
                                  {row.instructions || '—'}
                                </span>
                              </td>
                              <td className="px-3 py-3.5 align-middle">
                                <div className="flex justify-center">
                                  <PluginToggle
                                    checked={row.visible}
                                    onCheckedChange={(next) =>
                                      updateOrgHookItem(row.id, {
                                        visible: next,
                                        ...(next ? {} : { availableAllConversations: false }),
                                      })
                                    }
                                    aria-label="Visible in UI for members"
                                  />
                                </div>
                              </td>
                              <td className="px-2 py-3.5 align-middle">
                                <div
                                  className={cn(
                                    'flex justify-center',
                                    !row.visible && 'cursor-not-allowed opacity-40',
                                  )}
                                >
                                  <PluginToggle
                                    checked={row.visible && row.availableAllConversations}
                                    disabled={!row.visible}
                                    onCheckedChange={(next) =>
                                      updateOrgHookItem(row.id, {
                                        availableAllConversations: next,
                                      })
                                    }
                                    aria-label="Enable for every new conversation"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skills — org: extensions catalog; personal: integrations CTA */}
          {activeTab === 'skills' && (
            <div className="contents">
              <div className={cn('flex flex-col', settingsSectionStackGap)}>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold leading-snug text-foreground">
                    {selectedOrg?.type === 'personal' ? 'Skills' : 'Organization skills'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrg?.type === 'personal' ? (
                      <>
                        Skills in your personal workspace come from extensions you connect. Use Integrations to manage
                        connections; create an organization when you need shared extension repos and org-wide skills.
                      </>
                    ) : (
                      <>
                        Skills available to your org come from your extension repositories. Add or remove repos on
                        Extensions to change which skills appear in conversations.
                      </>
                    )}
                  </p>
                </div>
                <div>
                  {selectedOrg?.type === 'personal' ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => handleTabClick('integrations')}>
                      Open Integrations
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" size="sm" onClick={() => handleTabClick('org-plugins')}>
                      Open Extensions
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Organizations Content */}
          {activeTab === 'organizations' && (
            <div className="contents">
              <div className={cn('flex flex-col', settingsSectionStackGap)}>
                <div className={cn('flex flex-col', settingsSublineToContentGap)}>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold leading-snug text-foreground">Organization Name</h3>
                    <p className="text-sm text-muted-foreground">
                      This name appears across your organization and shared workspaces.
                    </p>
                  </div>
                  <div className="relative w-full max-w-[680px]">
                    <input
                      type="text"
                      value="Starlight Labs"
                      readOnly
                      className="w-full h-10 rounded-md border border-border bg-muted/40 px-3 pr-20 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:bg-muted/60 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
                      aria-label="Organization name"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className={settingsSectionRule}>
                  <div className={cn('flex flex-col', settingsSublineToContentGap)}>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold leading-snug text-foreground">Git Conversation Routing</h3>
                      <p className="text-sm text-muted-foreground">
                        Claim GitHub or GitLab organizations so resolver traffic routes to the correct OpenHands org. If a
                        requester is not a member of the claiming org, the conversation falls back to their Personal
                        Workspace. Available organizations are derived from your connected GitHub/GitLab identity. Only
                        organization admins and owners can manage organization claims.
                      </p>
                    </div>
                    <div className={dataTableShellClassName}>
                      <div className={dataTableInnerClassName}>
                        {gitConversationRoutingClaims.length === 0 ? (
                          <div
                            data-testid="git-conversation-routing-empty"
                            className="rounded-md border border-border bg-muted/10 px-4 py-10 text-center text-sm text-muted-foreground"
                          >
                            No git organizations found
                          </div>
                        ) : (
                          <table className={dataTableClassName}>
                            <colgroup>
                              <col className="min-w-0" />
                              <col className="w-[9rem]" />
                            </colgroup>
                            <tbody className={dataTableBodyClassName}>
                              {gitConversationRoutingClaims.map((option) => {
                                const claimOwner = claimRegistry[option.id];
                                const isClaimedByCurrentOrg = claimOwner === activeOrgName;

                                return (
                                  <tr key={option.id} className={dataTableRowClassName}>
                                    <td className="min-w-0 px-4 py-3.5 align-middle text-sm text-foreground">
                                      <span className="text-muted-foreground">{option.provider}</span>
                                      <span className="mx-1 text-muted-foreground">/</span>
                                      <span>{option.handle}</span>
                                    </td>
                                    <td className="px-4 py-3.5 align-middle text-right">
                                      {isClaimedByCurrentOrg && canManageOrgClaims ? (
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveClaim(option.id)}
                                          className="group h-7 rounded-md border border-success/60 bg-success/20 px-2 text-xs font-medium text-success-foreground transition-colors hover:border-destructive/60 hover:bg-destructive/15 hover:text-destructive-foreground"
                                        >
                                          <span className="group-hover:hidden">Claimed</span>
                                          <span className="hidden group-hover:inline">Disconnect</span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleClaim(option.id)}
                                          className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground hover:bg-muted/60 transition-colors"
                                        >
                                          Claim
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={settingsSectionRule} role="region" aria-labelledby="org-danger-zone-title">
                  <h3
                    id="org-danger-zone-title"
                    className="mb-2 text-sm font-semibold leading-6 text-white"
                  >
                    Danger zone
                  </h3>
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setDeleteOrganizationDialogOpen(true)}
                      className="text-sm font-semibold text-destructive hover:text-destructive transition-colors"
                    >
                      Delete Organization
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
  <Dialog
    open={Boolean(memberDeleteTarget)}
    onOpenChange={(open) => !open && setMemberDeleteTarget(null)}
  >
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete member</DialogTitle>
        <DialogDescription>
          Remove {memberDeleteTarget?.email} from this organization? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <button
          type="button"
          onClick={() => setMemberDeleteTarget(null)}
          className="h-9 px-4 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleMemberDelete}
          className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Delete
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <Dialog
    open={Boolean(secretDeleteTarget)}
    onOpenChange={(open) => !open && setSecretDeleteTarget(null)}
  >
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete secret</DialogTitle>
        <DialogDescription>
          Delete &quot;{secretDeleteTarget?.name}&quot;? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <button
          type="button"
          onClick={() => setSecretDeleteTarget(null)}
          className="h-9 px-4 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirmDeleteSecret}
          className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Delete
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <Dialog open={deleteOrganizationDialogOpen} onOpenChange={setDeleteOrganizationDialogOpen}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete organization</DialogTitle>
        <DialogDescription>
          Permanently delete &quot;{activeOrgName}&quot; and all of its data? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <button
          type="button"
          onClick={() => setDeleteOrganizationDialogOpen(false)}
          className="h-9 px-4 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirmDeleteOrganization}
          className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Delete organization
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <Dialog
    open={Boolean(gitSourceDisconnectTarget)}
    onOpenChange={(open) => !open && setGitSourceDisconnectTarget(null)}
  >
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Disconnect git source</DialogTitle>
        <DialogDescription>
          Disconnect{' '}
          {gitSourceDefinitions.find((source) => source.id === gitSourceDisconnectTarget)?.name ??
            'this source'}
          ? You can reconnect later from Integrations.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <button
          type="button"
          onClick={() => setGitSourceDisconnectTarget(null)}
          className="h-9 px-4 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleGitSourceDisconnect}
          className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Disconnect
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <Dialog
    open={inviteModalOpen}
    onOpenChange={(open) => {
      setInviteModalOpen(open);
      if (!open) {
        setInviteInput('');
        setInviteEmails([]);
      }
    }}
  >
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Invite organization members</DialogTitle>
        <DialogDescription>
          Add one or more email addresses. Press space or comma to add multiple.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <label className="text-sm text-foreground" htmlFor="invite-emails-input">
          Email addresses
        </label>
        <div className="min-h-[44px] rounded-md border border-border bg-muted/40 px-2 py-2 focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
          <div className="flex flex-wrap gap-2">
            {inviteEmails.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                {email}
                <button
                  type="button"
                  onClick={() => setInviteEmails((prev) => prev.filter((value) => value !== email))}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${email}`}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </span>
            ))}
            <input
              id="invite-emails-input"
              type="text"
              value={inviteInput}
              onChange={handleInviteInputChange}
              onKeyDown={handleInviteInputKeyDown}
              placeholder={inviteEmails.length === 0 ? 'name@company.com' : ''}
              className="flex-1 min-w-[160px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
      </div>
      <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <button
          type="button"
          onClick={() => setInviteModalOpen(false)}
          className="h-9 px-4 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSendInvites}
          disabled={inviteEmails.length === 0 && inviteInput.trim().length === 0}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Send Invites
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <Dialog open={createOrgModalOpen} onOpenChange={setCreateOrgModalOpen}>
    <DialogContent className="sm:max-w-xl border border-border text-foreground">
      <DialogHeader>
        <div className="flex justify-start pb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="96"
            height="96"
            viewBox="0 0 188 188"
            fill="none"
            aria-hidden="true"
          >
            <rect width="188" height="188" rx="16" fill="#2b2b2b" />
            <path d="M94 36.2002L144 65.0595V122.778L94 151.637L44 122.778V65.0595L94 36.2002Z" fill="#2b2b2b" />
            <path
              d="M144 65.0595L94 36.2002L44 65.0595M144 65.0595V122.778L94 151.637M144 65.0595L135.195 70.1417M94 151.637L44 122.778V65.0595M94 151.637V139.295M44 65.0595L52.805 70.1417M94 93.9188L83.5605 87.8933M94 93.9188L104.44 87.8933M94 93.9188V104.809M94 47.4535L52.805 70.1417M94 47.4535L135.195 70.1417M94 47.4535V59.0698M52.805 70.1417V116.425M135.195 70.1417V116.425M94 59.0698L62.7722 75.8946M94 59.0698L125.228 75.8946M62.7722 75.8946L73.121 81.8677M62.7722 75.8946V110.254M125.228 75.8946L114.879 81.8677M125.228 75.8946V110.254M94 70.1417L73.121 81.8677M94 70.1417L114.879 81.8677M94 70.1417V82.0302M73.121 81.8677V104.809M114.879 81.8677V104.809M94 82.0302L83.5605 87.8933M94 82.0302L104.44 87.8933M83.5605 87.8933V98.4565M104.44 87.8933V98.4565M94 139.295L135.195 116.425M94 139.295L52.805 116.425M135.195 116.425L125.228 110.254M94 127.497L125.228 110.254M94 127.497V116.425M94 127.497L62.7722 110.254M94 116.425L114.879 104.809M94 116.425L73.121 104.809M114.879 104.809L104.44 98.4565M73.121 104.809L83.5605 98.4565M62.7722 110.254L52.805 116.425M83.5605 98.4565L94 104.809M104.44 98.4565L94 104.809"
              stroke="#ffffff"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <DialogTitle className="text-xl font-semibold leading-6 text-foreground">
          Enterprise control meets open-source innovation
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mb-12">
          OpenHands Enterprise gives you the power of autonomous coding agents with the governance,
          security, and compliance your organization demands.
        </DialogDescription>
        <div className="h-3" aria-hidden="true" />
        <div className="rounded-lg border border-border bg-muted/20 p-4 mb-3">
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>Containerized sandbox runtime for safe autonomy</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>Secure enterprise platform with fine-grained access control</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>Self-host or private-cloud deployment</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>
                Bring your own LLM via Anthropic, OpenAI, Bedrock, or any other model provider
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>Integrations with enterprise ecosystems</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>Dedicated technical and account-level support</span>
            </div>
          </div>
        </div>
      </DialogHeader>
      <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-start sm:space-x-2">
        <a
          href="https://openhands.dev/contact"
          target="_blank"
          rel="noreferrer noopener"
          className="h-9 inline-flex items-center justify-center px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/85 transition-colors"
        >
          Contact Sales
        </a>
        <button
          type="button"
          onClick={() => setCreateOrgModalOpen(false)}
          className="h-9 px-4 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
        >
          Close
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
      <Popover>
        <PopoverTrigger asChild>
          <PrototypeControlsFab
            isActive={hasOpenHandsLlmKeyAccess || demoEmptyGitClaimOrganizations}
            aria-label="Prototype controls: OpenHands LLM key access"
            title="Open prototype controls"
            data-testid="settings-demo-llm-access-fab"
          />
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-72 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">OpenHands LLM key access</span>
            <button
              type="button"
              role="switch"
              aria-checked={hasOpenHandsLlmKeyAccess}
              aria-label={hasOpenHandsLlmKeyAccess ? 'Disable demo access' : 'Enable demo access'}
              onClick={() => setHasOpenHandsLlmKeyAccess((v) => !v)}
              className={cn(
                'flex h-6 w-10 shrink-0 items-center rounded-full border border-border px-0.5 transition-colors',
                hasOpenHandsLlmKeyAccess ? 'bg-foreground/80' : 'bg-muted/60',
              )}
            >
              <span
                className={cn(
                  'h-4 w-4 rounded-full bg-background shadow transition-transform',
                  hasOpenHandsLlmKeyAccess ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Demo: simulates having purchased enough credits to use the OpenHands LLM key (API Keys tab).
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
            <span className="text-sm font-medium text-foreground">Empty Git org claims</span>
            <button
              type="button"
              role="switch"
              aria-checked={demoEmptyGitClaimOrganizations}
              aria-label={
                demoEmptyGitClaimOrganizations
                  ? 'Show sample Git organizations in routing table'
                  : 'Show empty state in Git Conversation Routing'
              }
              data-testid="settings-demo-git-claims-empty-toggle"
              onClick={() => setDemoEmptyGitClaimOrganizations((v) => !v)}
              className={cn(
                'flex h-6 w-10 shrink-0 items-center rounded-full border border-border px-0.5 transition-colors',
                demoEmptyGitClaimOrganizations ? 'bg-foreground/80' : 'bg-muted/60',
              )}
            >
              <span
                className={cn(
                  'h-4 w-4 rounded-full bg-background shadow transition-transform',
                  demoEmptyGitClaimOrganizations ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Demo: Organization tab → Git Conversation Routing table shows “No git organizations found”.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
};
