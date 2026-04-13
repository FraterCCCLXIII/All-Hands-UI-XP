import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Cloud,
  Cpu,
  CreditCard,
  CheckCircle,
  ChevronDown,
  Key,
  Layers,
  MoreVertical,
  Pencil,
  Plus,
  Puzzle,
  Settings as SettingsIcon,
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
import { PluginToggle } from '../components/ui/plugin-toggle';
import { SearchInput } from '../components/ui/search-input';
import { cn } from '../lib/utils';
import { AddHookModal, AddMcpServerModal, mcpServerTypeLabel } from './extensions/extensionsCatalogAddModals';

type OrgRole = 'Member' | 'Admin' | 'Owner';
type PermissionKey =
  | 'manage_secrets'
  | 'manage_mcp'
  | 'manage_integrations'
  | 'manage_application_settings'
  | 'manage_api_keys'
  | 'view_llm_settings'
  | 'edit_llm_settings'
  | 'view_billing'
  | 'invite_user_to_organization'
  | 'change_user_role:member'
  | 'change_user_role:admin'
  | 'change_user_role:owner'
  | 'change_organization_name'
  | 'delete_organization'
  | 'add_credits'
  | 'manage_organization_claims'
  | 'manage_org_plugins'
  | 'manage_org_hooks';

const rolePermissions: Record<OrgRole, Set<PermissionKey>> = {
  Member: new Set([
    'manage_secrets',
    'manage_mcp',
    'manage_integrations',
    'manage_application_settings',
    'manage_api_keys',
    'view_llm_settings',
  ]),
  Admin: new Set([
    'manage_secrets',
    'manage_mcp',
    'manage_integrations',
    'manage_application_settings',
    'manage_api_keys',
    'view_llm_settings',
    'edit_llm_settings',
    'view_billing',
    'invite_user_to_organization',
    'change_user_role:member',
    'change_user_role:admin',
    'add_credits',
    'manage_organization_claims',
    'manage_org_plugins',
    'manage_org_hooks',
  ]),
  Owner: new Set([
    'manage_secrets',
    'manage_mcp',
    'manage_integrations',
    'manage_application_settings',
    'manage_api_keys',
    'view_llm_settings',
    'edit_llm_settings',
    'view_billing',
    'invite_user_to_organization',
    'change_user_role:member',
    'change_user_role:admin',
    'change_user_role:owner',
    'change_organization_name',
    'delete_organization',
    'add_credits',
    'manage_organization_claims',
    'manage_org_plugins',
    'manage_org_hooks',
  ]),
};

const settingsTabs = [
  { id: 'user', label: 'User', icon: User },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
  { id: 'app', label: 'Application', icon: SettingsIcon },
  { id: 'llm', label: 'Language Model (LLM)', icon: Cpu },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'secrets', label: 'Secrets', icon: Shield },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'mcp', label: 'MCP', icon: Cloud },
  { id: 'organizations', label: 'Organization', icon: Building2 },
  { id: 'org-plugins', label: 'Extensions', icon: Layers },
  { id: 'org-hooks', label: 'Hooks', icon: Webhook },
  { id: 'manage-team', label: 'Organization Members', icon: Users },
];

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
};

const settingsLinks: Array<{
  id: string;
  label: string;
  icon: typeof Users;
  tabId: string;
  requiredPermission: PermissionKey;
}> = [
  { id: 'manage-team', label: 'Manage Team', icon: Users, tabId: 'manage-team', requiredPermission: 'invite_user_to_organization' },
  { id: 'integrations', label: 'Integrations', icon: Puzzle, tabId: 'integrations', requiredPermission: 'manage_integrations' },
  { id: 'llm', label: 'Language Model (LLM)', icon: Cpu, tabId: 'llm', requiredPermission: 'view_llm_settings' },
  { id: 'api-keys', label: 'API Keys', icon: Key, tabId: 'api-keys', requiredPermission: 'manage_api_keys' },
  { id: 'secrets', label: 'Secrets', icon: Shield, tabId: 'secrets', requiredPermission: 'manage_secrets' },
  { id: 'mcp', label: 'MCP', icon: Cloud, tabId: 'mcp', requiredPermission: 'manage_mcp' },
  {
    id: 'organizations',
    label: 'Organization',
    icon: Building2,
    tabId: 'organizations',
    requiredPermission: 'manage_organization_claims',
  },
  {
    id: 'org-plugins',
    label: 'Extensions',
    icon: Layers,
    tabId: 'org-plugins',
    requiredPermission: 'manage_org_plugins',
  },
  {
    id: 'org-hooks',
    label: 'Hooks',
    icon: Webhook,
    tabId: 'org-hooks',
    requiredPermission: 'manage_org_hooks',
  },
  { id: 'billing', label: 'Billing', icon: CreditCard, tabId: 'billing', requiredPermission: 'view_billing' },
];

const orgOptions = [
  { id: 'personal', name: 'Personal Account', role: null, type: 'personal' },
  { id: 'acme-owner', name: 'Acme Inc', role: 'Owner', type: 'org' },
  { id: 'starlight-admin', name: 'Starlight Labs', role: 'Admin', type: 'org' },
  { id: 'nova-member', name: 'Nova Group', role: 'Member', type: 'org' },
];

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
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    connectLabel: 'Connect GitLab',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
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
      <svg className="w-6 h-6" viewBox="0 0 14 14" fill="none" aria-hidden>
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
  llmContentScrollable = true,
  mainContentScrollable = true,
  selectedOrgId: controlledOrgId,
  onOrgChange,
  pluginRepositories = [],
  onAddPluginRepository,
  onRemovePluginRepository,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab ?? 'api-keys');
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'info' | 'success' | 'error'>('info');
  const [toastVisible, setToastVisible] = useState(false);
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
  const selectedOrgId = controlledOrgId ?? uncontrolledOrgId;

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
    if (initialTab && settingsTabs.some((t) => t.id === initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
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
    if (
      selectedOrg?.type === 'personal' &&
      (activeTab === 'org-plugins' || activeTab === 'org-hooks')
    ) {
      setActiveTab('user');
      onTabChange?.('user');
    }
  }, [selectedOrg?.type, activeTab, onTabChange]);

  const hasPermission = (permission: PermissionKey) => rolePermissions[effectiveRole].has(permission);
  const visibleSettingsLinks = settingsLinks.filter((item) => {
    if (selectedOrg?.type === 'personal' && item.id === 'manage-team') {
      return false;
    }
    if (selectedOrg?.type === 'personal' && item.id === 'org-plugins') {
      return false;
    }
    if (selectedOrg?.type === 'personal' && item.id === 'org-hooks') {
      return false;
    }
    return !item.requiredPermission || hasPermission(item.requiredPermission);
  });
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
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
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

  useEffect(() => {
    if (!toastVisible) return;
    const timer = window.setTimeout(() => setToastVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, [toastVisible]);
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

  return (
    <div className="flex flex-1 overflow-hidden gap-10 p-8">
      {/* Left Navigation */}
      <nav className="flex flex-col gap-6 w-64">
        <div className="flex items-center gap-2 ml-1">
          <h2 className="text-xl font-semibold leading-6 text-foreground">Settings</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-tour-id="settings.org-selector"
              className="w-full h-12 rounded-md border border-border bg-muted/20 px-4 flex items-center justify-between text-left text-sm text-foreground hover:bg-muted/40 transition-colors"
              aria-label="Select organization"
            >
              <span className="flex items-center gap-2 w-full">
                {selectedOrg?.type === 'org' ? (
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
                <span>{selectedOrg?.name ?? 'Personal Account'}</span>
                {selectedOrg?.role && (
                  <span className="ml-auto rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {selectedOrg.role}
                  </span>
                )}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {orgOptions.map((org) => (
              <DropdownMenuItem key={org.id} onClick={() => handleOrgChange(org.id)}>
                <span className="flex items-center gap-2 w-full">
                  {org.type === 'org' ? (
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span>{org.name}</span>
                  {org.role && (
                    <span className="ml-auto rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {org.role}
                    </span>
                  )}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex flex-col gap-2">
          {visibleSettingsLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.tabId)}
                className={`group flex items-center gap-3 px-[14px] py-2 rounded-md transition-colors text-left ${
                  activeTab === item.tabId
                    ? 'bg-muted/60'
                    : 'hover:bg-muted/40'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    activeTab === item.tabId
                      ? 'text-white'
                      : 'text-muted-foreground group-hover:text-white'
                  }`}
                />
                <span
                  className={`text-sm font-normal whitespace-nowrap ${
                    activeTab === item.tabId
                      ? 'text-white'
                      : 'text-muted-foreground group-hover:text-white'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="border-t border-border" />
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleTabClick('user')}
            className={`group flex items-center gap-3 px-[14px] py-2 rounded-md transition-colors text-left ${
              activeTab === 'user'
                ? 'bg-muted/60'
                : 'hover:bg-muted/40'
            }`}
          >
            <User
              className={`w-5 h-5 ${
                activeTab === 'user' ? 'text-white' : 'text-muted-foreground group-hover:text-white'
              }`}
            />
            <span
              className={`text-sm font-normal whitespace-nowrap ${
                activeTab === 'user' ? 'text-white' : 'text-muted-foreground group-hover:text-white'
              }`}
            >
              User
            </span>
          </button>
          <button
            onClick={() => handleTabClick('app')}
            className={`group flex items-center gap-3 px-[14px] py-2 rounded-md transition-colors text-left ${
              activeTab === 'app'
                ? 'bg-muted/60'
                : 'hover:bg-muted/40'
            }`}
          >
            <SettingsIcon
              className={`w-5 h-5 ${
                activeTab === 'app' ? 'text-white' : 'text-muted-foreground group-hover:text-white'
              }`}
            />
            <span
              className={`text-sm font-normal whitespace-nowrap ${
                activeTab === 'app' ? 'text-white' : 'text-muted-foreground group-hover:text-white'
              }`}
            >
              Application
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCreateOrgModalOpen(true)}
            className="group flex items-center gap-3 px-[14px] py-2 rounded-md transition-colors text-left hover:bg-muted/40"
          >
            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-white" />
            <span className="text-sm font-normal text-muted-foreground whitespace-nowrap group-hover:text-white">
              Create New Organization
            </span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className={mainContentScrollable ? 'flex-1 overflow-auto' : 'flex-1'}>
        <div className="flex flex-col gap-6 h-full">
          {activeTabLabel && activeTab !== 'manage-team' && (
            <div className="space-y-1">
              <h2 className="text-xl font-semibold leading-6 text-foreground">{activeTabLabel}</h2>
              {settingsTabDescriptions[activeTab] && (
                <p className="text-sm text-muted-foreground">{settingsTabDescriptions[activeTab]}</p>
              )}
            </div>
          )}

          {/* User Content */}
          {activeTab === 'user' && (
            <div className="flex-1 overflow-auto">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-foreground">Email</label>
                    <div className="flex items-center gap-3">
                      <input
                        className="h-10 text-base text-foreground px-3 bg-muted/40 hover:bg-muted/60 transition-colors rounded-md border border-border flex-grow max-w-[680px]"
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
                        className="h-10 flex items-center justify-center px-4 rounded-md bg-white text-black hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
            <div className="flex-1 overflow-auto">
              <div className="flex flex-col gap-6 w-full">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold leading-6 text-foreground">
                      Organization Members
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Manage access and roles for your organization.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!canInviteMembers}
                    onClick={() => setInviteModalOpen(true)}
                    className="h-10 px-4 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Invite Organization Member
                  </button>
                </div>

                <div className="rounded-lg border border-border bg-card divide-y divide-border">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">{member.email}</span>
                        {member.status === 'invited' && (
                          <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
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
                              className="gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete user
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
            <div className="flex flex-col gap-4">
                {gitSourceDefinitions.map((source) => {
                  const status = gitSourceStatus[source.id];
                  const isConnected = status === 'connected';
                  const isConnecting = status === 'connecting';
                  return (
                    <div key={source.id} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {source.icon}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-xl font-semibold leading-6 text-foreground">{source.name}</h3>
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border w-fit">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    isConnected
                                      ? 'bg-emerald-400'
                                      : isConnecting
                                      ? 'bg-amber-400 animate-pulse'
                                      : 'bg-[#FF684E]'
                                  }`}
                                  aria-hidden
                                />
                                <span className="font-normal text-xs text-muted-foreground">
                                  {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Not Connected'}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Connect your {source.name} account to authorize repositories and configure access for
                              OpenHands.
                            </p>
                          </div>
                        </div>
                        {isConnected && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="h-8 w-8 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
                                aria-label={`Open actions for ${source.name}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                onClick={() => setGitSourceDisconnectTarget(source.id)}
                                className="gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Disconnect
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {isConnected ? (
                          <button
                            type="button"
                            onClick={() => handleGitSourceConfigure(source.id)}
                            className="h-10 flex items-center justify-center px-4 text-sm rounded-md border border-border bg-background text-foreground hover:bg-muted/60 transition-colors"
                          >
                            Configure Repositories
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleGitSourceConnect(source.id)}
                            disabled={isConnecting}
                            className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-white text-black hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                          >
                            {isConnecting ? 'Connecting...' : source.connectLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Slack */}
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-start gap-3 mb-6">
                    <svg className="w-6 h-6 shrink-0" viewBox="0 0 54 54">
                      <g fill="none" fillRule="evenodd">
                        <path d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386" fill="#36C5F0"/>
                        <path d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387" fill="#2EB67D"/>
                        <path d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386" fill="#ECB22E"/>
                        <path d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336 0v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.25a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387" fill="#E01E5A"/>
                      </g>
                    </svg>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold leading-6 text-foreground">Slack</h3>
                      <p className="text-sm text-muted-foreground">
                        Install the OpenHands Slack app to receive notifications in your workspace.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-white text-black hover:bg-gray-300 cursor-pointer transition-colors"
                  >
                    Install OpenHands Slack App
                  </button>
                </div>

                {/* Jira Cloud */}
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-start gap-3 mb-6">
                    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                      <path fill="#2684FF" d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.757a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0z"/>
                    </svg>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold leading-6 text-foreground">Jira Cloud</h3>
                      <p className="text-sm text-muted-foreground">
                        Link Jira to sync issues and keep OpenHands aligned with your project tracking.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="h-10 flex items-center justify-center px-4 text-sm rounded-md border border-border bg-background text-foreground hover:bg-muted/60 transition-colors"
                  >
                    Configure
                  </button>
                </div>
            </div>
          )}

          {/* Application Content */}
          {activeTab === 'app' && (
            <div className="flex-1 overflow-auto">
              <form className="flex flex-col h-full justify-between">
                <div className="flex flex-col gap-6">
                  <label className="flex flex-col gap-2.5 w-full max-w-[680px]">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-foreground">Language</span>
                    </div>
                    <input
                      className="bg-muted/40 hover:bg-muted/60 transition-colors border border-border h-10 w-full rounded-md p-2"
                      type="text"
                      value="English"
                      readOnly
                    />
                  </label>

                  <label className="flex items-center gap-2 w-fit cursor-pointer">
                    <input
                      hidden
                      type="checkbox"
                      checked={enableAnalytics}
                      onChange={(e) => setEnableAnalytics(e.target.checked)}
                    />
                    <div className={`relative w-12 h-6 rounded-xl cursor-pointer transition-colors duration-200 ease-in-out flex items-center p-1.5 justify-start ${enableAnalytics ? 'bg-white' : 'bg-muted border border-border'}`}>
                      <div className={`w-3 h-3 rounded-xl transition-all duration-200 ease-in-out ${enableAnalytics ? 'translate-x-6 bg-black' : 'translate-x-0 bg-muted-foreground'}`}></div>
                    </div>
                    <span className="text-sm text-foreground">Send anonymous usage data</span>
                  </label>

                  <label className="flex items-center gap-2 w-fit cursor-pointer">
                    <input
                      hidden
                      type="checkbox"
                      checked={enableSound}
                      onChange={(e) => setEnableSound(e.target.checked)}
                    />
                    <div className={`relative w-12 h-6 rounded-xl cursor-pointer transition-colors duration-200 ease-in-out flex items-center p-1.5 justify-start ${enableSound ? 'bg-white' : 'bg-muted border border-border'}`}>
                      <div className={`w-3 h-3 rounded-xl transition-all duration-200 ease-in-out ${enableSound ? 'translate-x-6 bg-black' : 'translate-x-0 bg-muted-foreground'}`}></div>
                    </div>
                    <span className="text-sm text-foreground">Sound Notifications</span>
                  </label>

                  <label className="flex items-center gap-2 w-fit cursor-pointer">
                    <input
                      hidden
                      type="checkbox"
                      checked={enableProactive}
                      onChange={(e) => setEnableProactive(e.target.checked)}
                    />
                    <div className={`relative w-12 h-6 rounded-xl cursor-pointer transition-colors duration-200 ease-in-out flex items-center p-1.5 justify-start ${enableProactive ? 'bg-white' : 'bg-muted border border-border'}`}>
                      <div className={`w-3 h-3 rounded-xl transition-all duration-200 ease-in-out ${enableProactive ? 'translate-x-6 bg-black' : 'translate-x-0 bg-muted-foreground'}`}></div>
                    </div>
                    <span className="text-sm text-foreground">Suggest Tasks on GitHub</span>
                  </label>

                  <label className="flex items-center gap-2 w-fit cursor-pointer">
                    <input
                      hidden
                      type="checkbox"
                      checked={enableSolvability}
                      onChange={(e) => setEnableSolvability(e.target.checked)}
                    />
                    <div className={`relative w-12 h-6 rounded-xl cursor-pointer transition-colors duration-200 ease-in-out flex items-center p-1.5 justify-start ${enableSolvability ? 'bg-white' : 'bg-muted border border-border'}`}>
                      <div className={`w-3 h-3 rounded-xl transition-all duration-200 ease-in-out ${enableSolvability ? 'translate-x-6 bg-black' : 'translate-x-0 bg-muted-foreground'}`}></div>
                    </div>
                    <span className="text-sm text-foreground">Enable Solvability Analysis</span>
                  </label>

                  <div className="border-t border-border pt-6 mt-2">
                    <div className="space-y-1 mb-4">
                      <h3 className="text-xl font-semibold leading-6 text-foreground">Git Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure the username and email that OpenHands uses to commit changes.
                      </p>
                    </div>
                    <div className="flex flex-col gap-6">
                      <label className="flex flex-col gap-2.5 w-full max-w-[680px]">
                        <span className="text-sm text-foreground">Git Username</span>
                        <input
                          placeholder="Username for git commits"
                          className="bg-muted/40 hover:bg-muted/60 transition-colors border border-border h-10 w-full rounded-md p-2 placeholder:italic"
                          type="text"
                          value={gitUsername}
                          onChange={(e) => setGitUsername(e.target.value)}
                        />
                      </label>
                      <label className="flex flex-col gap-2.5 w-full max-w-[680px]">
                        <span className="text-sm text-foreground">Git Email</span>
                        <input
                          placeholder="Email for git commits"
                          className="bg-muted/40 hover:bg-muted/60 transition-colors border border-border h-10 w-full rounded-md p-2 placeholder:italic"
                          type="email"
                          value={gitEmail}
                          onChange={(e) => setGitEmail(e.target.value)}
                        />
                      </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-6 py-6 pr-6 justify-start">
                <button
                  disabled
                  type="submit"
                  className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Save Changes
                </button>
                </div>
              </form>
            </div>
          )}

          {/* LLM Content */}
          {activeTab === 'llm' && (
            <div className={llmContentScrollable ? 'flex-1 overflow-auto' : 'flex-1'}>
              {llmContentOverride ?? (
                <form className="flex flex-col h-full justify-between">
                  <div className="flex flex-col gap-6">
                    <label className="flex items-center gap-2 w-fit cursor-pointer">
                      <input
                        hidden
                        type="checkbox"
                        checked={advancedLLM}
                        onChange={(e) => setAdvancedLLM(e.target.checked)}
                        data-testid="advanced-settings-switch"
                      />
                      <div
                        className={`relative w-12 h-6 rounded-xl cursor-pointer transition-colors duration-200 ease-in-out flex items-center p-1.5 justify-start ${
                          advancedLLM ? 'bg-white' : 'bg-muted border border-border'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-xl transition-all duration-200 ease-in-out ${
                            advancedLLM ? 'translate-x-6 bg-black' : 'translate-x-0 bg-muted-foreground'
                          }`}
                        ></div>
                      </div>
                      <span className="text-sm text-foreground">Advanced</span>
                    </label>

                    {!advancedLLM ? (
                      <>
                        <div className="flex flex-col gap-6 w-full max-w-[680px]">
                          <fieldset className="flex flex-col gap-2.5 w-full">
                            <label className="text-sm text-foreground">LLM Provider</label>
                            <div className="relative w-full">
                              <select
                                className="h-10 w-full rounded-md border border-border bg-muted/40 pl-3 pr-10 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30 appearance-none"
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
                          <fieldset className="flex flex-col gap-2.5 w-full">
                            <label className="text-sm text-foreground">LLM Model</label>
                            <div className="relative w-full">
                              <select
                                className="h-10 w-full rounded-md border border-border bg-muted/40 pl-3 pr-10 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30 appearance-none"
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
                        <label className="flex flex-col gap-2.5 w-full max-w-[680px]">
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
                              className="h-10 w-full rounded-md border border-border bg-muted/40 pl-3 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30"
                              type="text"
                              data-testid="llm-api-key-input"
                            />
                            {llmApiKeyApproved && llmApiKey.length > 0 && (
                              <CheckCircle
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none"
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
                            className="underline underline-offset-2 text-white hover:text-gray-300"
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
                  <div className="flex gap-6 py-6 pr-6 justify-start">
                    <button
                      disabled
                      type="submit"
                      className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
            <div className="flex-1 overflow-auto">
              <form className="flex flex-col gap-6">
                <div className="w-[680px] rounded-lg border border-border bg-gradient-to-br from-card to-muted/50 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                        <CreditCard className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Available Balance</span>
                        <span className="text-2xl font-bold text-foreground">$437.18</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-white text-black hover:bg-gray-300 cursor-pointer transition-colors"
                    >
                      Manage Credits
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-2.5 w-[680px]">
                    <span className="text-sm text-foreground">Add Funds</span>
                    <input
                      placeholder="Specify an amount in USD to add - min $10"
                      min="10"
                      max="25000"
                      step="1"
                      className="bg-muted/40 hover:bg-muted/60 transition-colors border border-border h-10 w-full rounded-md p-2 placeholder:italic"
                      type="number"
                    />
                  </label>
                  <div className="flex items-center w-[680px] gap-2">
                    <button
                      disabled
                      type="submit"
                      className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Add credit
                    </button>
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
          {activeTab === 'secrets' && (
            <div className="flex-1 overflow-auto">
              <div className="flex flex-col gap-5">
                <button
                  type="button"
                  className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-300 cursor-pointer transition-colors"
                >
                  Add a new secret
                </button>
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full min-w-full table-fixed">
                    <thead className="bg-muted">
                      <tr>
                        <th className="w-1/4 text-left p-3 text-sm font-medium text-foreground">Name</th>
                        <th className="w-1/2 text-left p-3 text-sm font-medium text-foreground">Description</th>
                        <th className="w-1/4 text-right p-3 text-sm font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Content */}
          {activeTab === 'api-keys' && (
            <div className="flex-1 overflow-auto">
              <div className="flex flex-col gap-6">
                {/* OpenHands LLM Key Section */}
                <div className="border-b border-border pb-6 mb-6 flex flex-col gap-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold leading-6 text-foreground">OpenHands LLM Key</h3>
                    <p className="text-sm text-muted-foreground">
                      Use this key as the LLM API key in OpenHands open-source and CLI; usage is billed to your cloud
                      account.
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-300 cursor-pointer transition-colors"
                    >
                      Refresh API Key
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Do not share this key elsewhere; anyone with it can incur charges on your account.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-md py-2 px-3 flex items-center justify-between">
                        <span className="text-foreground">••••••••••••••••••••</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="text-foreground hover:text-muted-foreground cursor-pointer"
                            aria-label="Show API key"
                            title="Show API key"
                          >
                            <svg width="20" height="20" viewBox="0 0 576 512" fill="currentColor">
                              <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/>
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="text-foreground hover:text-muted-foreground cursor-pointer"
                            aria-label="Copy API key"
                            title="Copy API key"
                          >
                            <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
                              <path d="M208 0L332.1 0c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9L448 336c0 26.5-21.5 48-48 48l-192 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48zM48 128l80 0 0 64-64 0 0 256 192 0 0-32 64 0 0 48c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 176c0-26.5 21.5-48 48-48z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* OpenHands API Keys Section */}
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold leading-6 text-foreground">OpenHands API Keys</h3>
                  <p className="text-sm text-muted-foreground">
                    Create keys to authenticate with the OpenHands API from your applications and scripts.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-300 cursor-pointer transition-colors"
                  >
                    Create API Key
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep your API keys secure; anyone with a key can access your account. For more information on how to use
                  the API, see our{' '}
                  <a
                    href="https://docs.all-hands.dev/usage/cloud/cloud-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline hover:text-gray-300"
                  >
                    API documentation
                  </a>.
                </p>

                {/* API Keys Table */}
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-foreground">Name</th>
                        <th className="text-left p-3 text-sm font-medium text-foreground">Created</th>
                        <th className="text-left p-3 text-sm font-medium text-foreground">Last Used</th>
                        <th className="text-right p-3 text-sm font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="p-3 text-sm text-foreground truncate max-w-[160px]" title="CLI 2">
                          CLI 2
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">9/23/2025, 8:58:05 PM</td>
                        <td className="p-3 text-sm text-muted-foreground">Never</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            aria-label="Delete CLI 2"
                            className="cursor-pointer text-foreground hover:text-muted-foreground"
                          >
                            <svg width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
                              <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3 text-sm text-foreground truncate max-w-[160px]" title="CLI">
                          CLI
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">9/19/2025, 5:09:37 PM</td>
                        <td className="p-3 text-sm text-muted-foreground">Never</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            aria-label="Delete CLI"
                            className="cursor-pointer text-foreground hover:text-muted-foreground"
                          >
                            <svg width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
                              <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MCP Content */}
          {activeTab === 'mcp' && (
            <div className="flex-1 overflow-auto">
              <div className="flex w-full max-w-5xl flex-col gap-4">
                <div className="flex justify-start">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setMcpEditingId(null);
                      setAddMcpModalOpen(true);
                    }}
                  >
                    Add server
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
                <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
                  <div className="min-w-0">
                    <table className="w-full table-fixed border-collapse text-sm">
                      <colgroup>
                        <col className="min-w-0" />
                        <col className="w-[6.5rem]" />
                        <col className="w-[5.5rem]" />
                        <col className="w-[6.5rem]" />
                        <col className="w-[7rem]" />
                        <col className="w-12" />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th
                            scope="col"
                            className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            URL
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            API key
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            Visible
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                            title="All conversations — enable for every new conversation"
                          >
                            All conv.
                          </th>
                          <th
                            scope="col"
                            className="w-12 px-1 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {settingsMcpServers.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-10 text-center text-sm text-muted-foreground"
                            >
                              No servers configured. Use Add server to connect one.
                            </td>
                          </tr>
                        ) : (
                          settingsMcpServers.map((row) => (
                            <tr
                              key={row.id}
                              className="bg-card transition-colors hover:bg-muted/25"
                            >
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
                                      className="gap-2 text-destructive focus:text-destructive"
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
            <div className="flex-1 overflow-auto">
              <div className="flex w-full max-w-5xl flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold leading-6 text-foreground">Extension repositories</h3>
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
                      className="h-10 rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Add repository
                    </button>
                  </div>
                  <div className="mb-4 overflow-hidden rounded-md border border-border">
                    {pluginRepositories.length > 0 ? (
                      <ul className="divide-y divide-border">
                        {pluginRepositories.map((repo) => (
                          <li key={repo} className="flex items-center justify-between gap-3 px-3 py-2.5">
                            <span className="truncate text-sm text-foreground">{repo}</span>
                            <button
                              type="button"
                              onClick={() => onRemovePluginRepository?.(repo)}
                              className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground transition-colors hover:bg-muted/60"
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
                <div className="w-full max-w-5xl space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold leading-6 text-foreground">Plugins & skills</h3>
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
                        <span className="text-[11px] uppercase tracking-wide">Type</span>
                        <div className="relative min-w-[8.5rem]">
                          <select
                            value={orgPluginsKindFilter}
                            onChange={(e) =>
                              setOrgPluginsKindFilter(e.target.value as 'all' | OrgCatalogKind)
                            }
                            aria-label="Filter by plugin or skill"
                            className="h-10 w-full min-w-[8.5rem] appearance-none rounded-md border border-border bg-muted/40 pl-3 pr-10 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                        <span className="text-[11px] uppercase tracking-wide">Repository</span>
                        <div className="relative min-w-0 w-full">
                          <select
                            value={orgPluginsRepoFilter}
                            onChange={(e) => setOrgPluginsRepoFilter(e.target.value)}
                            aria-label="Filter by plugin repository"
                            className="h-10 w-full min-w-0 appearance-none rounded-md border border-border bg-muted/40 pl-3 pr-10 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                </div>
                <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
                  <div className="min-w-0">
                    <table className="w-full table-fixed border-collapse text-sm">
                      <colgroup>
                        <col className="min-w-0" />
                        <col className="min-w-0" />
                        <col className="w-[6.5rem]" />
                        <col className="w-[5.5rem]" />
                        <col className="w-[7rem]" />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th
                            scope="col"
                            className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                            title="Plugin or skill bundle repository"
                          >
                            Repository
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            Visible
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                            title="All conversations — enable for every new conversation"
                          >
                            All conv.
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
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
                            <tr
                              key={row.id}
                              className="bg-card transition-colors hover:bg-muted/25"
                            >
                              <td className="px-4 py-3.5 align-middle">
                                <a
                                  href={
                                    row.kind === 'skill'
                                      ? `/extensions/skills/skill/${encodeURIComponent(row.marketplaceSkillId)}`
                                      : `/extensions/plugins/plugin/${encodeURIComponent(row.marketplaceSkillId)}`
                                  }
                                  className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
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
          )}

          {/* Organization hooks (Admin / Owner) */}
          {activeTab === 'org-hooks' && (
            <div className="flex-1 overflow-auto">
              <div className="flex w-full max-w-5xl flex-col gap-4">
                <div className="flex justify-start">
                  <Button type="button" size="sm" onClick={() => setAddHookModalOpen(true)}>
                    Add hook
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
                <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
                  <div className="min-w-0">
                    <table className="w-full table-fixed border-collapse text-sm">
                      <colgroup>
                        <col className="min-w-0" />
                        <col className="min-w-0" />
                        <col className="w-[6.5rem]" />
                        <col className="w-[7rem]" />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th
                            scope="col"
                            className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            Instructions
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            Visible
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                            title="All conversations — enable for every new conversation"
                          >
                            All conv.
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {orgHooks.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-10 text-center text-sm text-muted-foreground"
                            >
                              No hooks yet. Use Add hook to create one.
                            </td>
                          </tr>
                        ) : (
                          orgHooks.map((row) => (
                            <tr
                              key={row.id}
                              className="bg-card transition-colors hover:bg-muted/25"
                            >
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

          {/* Organizations Content */}
          {activeTab === 'organizations' && (
            <div className="flex-1 overflow-auto">
              <div>
                <div className="mb-6">
                  <div>
                    <div className="space-y-1 mb-3">
                      <h3 className="text-xl font-semibold leading-6 text-foreground">Credits</h3>
                      <p className="text-sm text-muted-foreground">
                        Organization-wide balance used for OpenHands Cloud usage.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-full bg-[#FFE566] px-6 py-2 text-lg font-semibold text-black shadow-sm">
                        $27.80
                      </div>
                      <button
                        type="button"
                        className="h-9 rounded-full bg-muted px-4 text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="space-y-1 mb-3">
                      <h3 className="text-xl font-semibold leading-6 text-foreground">Organization Name</h3>
                      <p className="text-sm text-muted-foreground">
                        This name appears across your organization and shared workspaces.
                      </p>
                    </div>
                    <div className="mt-3 relative max-w-[520px]">
                      <input
                        type="text"
                        value="Starlight Labs"
                        readOnly
                        className="w-full h-10 rounded-md border border-border bg-muted/40 px-3 pr-20 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar"
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
                  <button type="button" className="mt-5 text-sm font-semibold text-destructive hover:text-destructive transition-colors">
                    Delete Organization
                  </button>
                </div>

                <div className="space-y-1 mb-2">
                  <h3 className="text-xl font-semibold leading-6 text-foreground">Git Conversation Routing</h3>
                  <p className="text-sm text-muted-foreground">
                    Claim GitHub or GitLab organizations so resolver traffic routes to the correct OpenHands org.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  If a requester is not a member of the claiming org, the conversation falls back to their Personal
                  Workspace. Available organizations are derived from your connected GitHub/GitLab identity. Only
                  organization admins and owners can manage organization claims.
                </p>

                <div className="overflow-hidden rounded-lg border border-border">
                  {claimableOptions.map((option) => {
                    const claimOwner = claimRegistry[option.id];
                    const isClaimedByCurrentOrg = claimOwner === activeOrgName;

                    return (
                      <div
                        key={option.id}
                        className="flex items-center justify-between gap-3 border-b border-border px-3 py-3 last:border-b-0"
                      >
                        <div className="text-sm text-foreground">
                          <span className="text-muted-foreground">{option.provider}</span>
                          <span className="mx-1 text-muted-foreground">/</span>
                          <span>{option.handle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isClaimedByCurrentOrg && canManageOrgClaims ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveClaim(option.id)}
                              className="group h-7 rounded-md border border-emerald-500/60 bg-emerald-500/20 px-2 text-xs font-medium text-emerald-300 transition-colors hover:border-rose-500/60 hover:bg-rose-500/15 hover:text-rose-300"
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
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}
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
        <div className="min-h-[44px] rounded-md border border-border bg-muted/40 px-2 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
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
          className="h-9 px-4 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Send invites
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <Dialog open={createOrgModalOpen} onOpenChange={setCreateOrgModalOpen}>
    <DialogContent className="sm:max-w-xl bg-card text-foreground border border-border">
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
            <path d="M144 65.0595L94 36.2002L44 65.0595M144 65.0595V122.778L94 151.637M144 65.0595L135.195 70.1417M94 151.637L44 122.778V65.0595M94 151.637V139.295M44 65.0595L52.805 70.1417M94 93.9188L83.5605 87.8933M94 93.9188L104.44 87.8933M94 93.9188V104.809M94 47.4535L52.805 70.1417M94 47.4535L135.195 70.1417M94 47.4535V59.0698M52.805 70.1417V116.425M135.195 70.1417V116.425M94 59.0698L62.7722 75.8946M94 59.0698L125.228 75.8946M62.7722 75.8946L73.121 81.8677M62.7722 75.8946V110.254M125.228 75.8946L114.879 81.8677M125.228 75.8946V110.254M94 70.1417L73.121 81.8677M94 70.1417L114.879 81.8677M94 70.1417V82.0302M73.121 81.8677V104.809M114.879 81.8677V104.809M94 82.0302L83.5605 87.8933M94 82.0302L104.44 87.8933M83.5605 87.8933V98.4565M104.44 87.8933V98.4565M94 139.295L135.195 116.425M94 139.295L52.805 116.425M135.195 116.425L125.228 110.254M94 127.497L125.228 110.254M94 127.497V116.425M94 127.497L62.7722 110.254M94 116.425L114.879 104.809M94 116.425L73.121 104.809M114.879 104.809L104.44 98.4565M73.121 104.809L83.5605 98.4565M62.7722 110.254L52.805 116.425M83.5605 98.4565L94 104.809M104.44 98.4565L94 104.809" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" />
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
          className="h-9 inline-flex items-center justify-center px-4 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-300 transition-colors"
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
  {toastMessage && (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all ${
        toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`rounded-md px-4 py-3 shadow-lg ${
          toastVariant === 'error'
            ? 'border border-rose-500/40 bg-rose-500/15 text-rose-100'
            : toastVariant === 'success'
            ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-100'
            : 'border border-blue-500/40 bg-blue-500/15 text-blue-100'
        }`}
      >
        <div className="text-sm">{toastMessage}</div>
      </div>
    </div>
  )}
    </div>
  );
};
