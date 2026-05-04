import type { LucideIcon } from 'lucide-react';
import {
  AppWindow,
  Building2,
  Blocks,
  Cloud,
  Cpu,
  CreditCard,
  Key,
  Layers,
  Settings,
  Shield,
  User,
  Users,
  Webhook,
} from 'lucide-react';
import { McpIcon } from '../components/icons/McpIcon';
import { SkillIcon } from '../components/icons/SkillIcon';

export type OrgRole = 'Member' | 'Admin' | 'Owner';

export type PermissionKey =
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

export const rolePermissions: Record<OrgRole, Set<PermissionKey>> = {
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

export type SettingsNavItem = {
  id: string;
  label: string;
  tabId: string;
  icon: LucideIcon | typeof SkillIcon | typeof McpIcon;
  requiredPermission?: PermissionKey;
};

/** Org context (Admin / Owner): order within Org settings. */
export const ORG_SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: 'organizations',
    label: 'Organization',
    tabId: 'organizations',
    icon: Building2,
    requiredPermission: 'manage_organization_claims',
  },
  {
    id: 'manage-team',
    label: 'Org Members',
    tabId: 'manage-team',
    icon: Users,
    requiredPermission: 'invite_user_to_organization',
  },
  { id: 'llm', label: 'Language Model (LLM)', tabId: 'llm', icon: Cpu, requiredPermission: 'view_llm_settings' },
  { id: 'billing', label: 'Billing', tabId: 'billing', icon: CreditCard, requiredPermission: 'view_billing' },
  { id: 'org-plugins', label: 'Skills', tabId: 'org-plugins', icon: Layers, requiredPermission: 'manage_org_plugins' },
  { id: 'org-hooks', label: 'Hooks', tabId: 'org-hooks', icon: Webhook, requiredPermission: 'manage_org_hooks' },
];

export const PERSONAL_SETTINGS_CORE_NAV: SettingsNavItem[] = [
  { id: 'api-keys', label: 'API Keys', tabId: 'api-keys', icon: Key, requiredPermission: 'manage_api_keys' },
  { id: 'secrets', label: 'Secrets', tabId: 'secrets', icon: Shield, requiredPermission: 'manage_secrets' },
  { id: 'mcp', label: 'MCP', tabId: 'mcp', icon: McpIcon, requiredPermission: 'manage_mcp' },
];

export const ACCOUNT_NAV: SettingsNavItem[] = [
  { id: 'user', label: 'User', tabId: 'user', icon: User },
  { id: 'app', label: 'Application', tabId: 'app', icon: AppWindow },
];

export const INTEGRATIONS_ONLY_NAV: SettingsNavItem[] = [
  {
    id: 'integrations',
    label: 'Integrations',
    tabId: 'integrations',
    icon: Blocks,
    requiredPermission: 'manage_integrations',
  },
];

export const SKILLS_ONLY_NAV: SettingsNavItem[] = [
  { id: 'skills', label: 'Skills', tabId: 'skills', icon: SkillIcon, requiredPermission: 'manage_org_plugins' },
];

export const INTEGRATIONS_AND_SKILLS_NAV: SettingsNavItem[] = [...INTEGRATIONS_ONLY_NAV, ...SKILLS_ONLY_NAV];

export const BACKEND_SERVER_NAV: SettingsNavItem[] = [
  { id: 'backend-server', label: 'Backend Server', tabId: 'backend-server', icon: Cloud },
];

/** Org admin/owner: Personal settings = core + Integrations + Skills under MCP, then Account. */
export const ORG_ADMIN_PERSONAL_SETTINGS_NAV: SettingsNavItem[] = [
  ...PERSONAL_SETTINGS_CORE_NAV,
  ...INTEGRATIONS_AND_SKILLS_NAV,
];

export const PERSONAL_WORKSPACE_TOP_NAV: SettingsNavItem[] = [
  { id: 'llm', label: 'Language Model (LLM)', tabId: 'llm', icon: Cpu, requiredPermission: 'view_llm_settings' },
  { id: 'api-keys', label: 'API Keys', tabId: 'api-keys', icon: Key, requiredPermission: 'manage_api_keys' },
  { id: 'secrets', label: 'Secrets', tabId: 'secrets', icon: Shield, requiredPermission: 'manage_secrets' },
  { id: 'mcp', label: 'MCP', tabId: 'mcp', icon: McpIcon, requiredPermission: 'manage_mcp' },
];

export const PERSONAL_WORKSPACE_BILLING_NAV: SettingsNavItem[] = [
  { id: 'billing', label: 'Billing', tabId: 'billing', icon: CreditCard, requiredPermission: 'view_billing' },
];

export const PERSONAL_ACCOUNT_WITH_BILLING_NAV: SettingsNavItem[] = [...ACCOUNT_NAV, ...PERSONAL_WORKSPACE_BILLING_NAV];

export const ACCOUNT_POPOVER_SETTINGS_NAV: SettingsNavItem[] = [
  { id: 'settings', label: 'Settings', tabId: '', icon: Settings },
];

export type WorkspaceNavContext = {
  workspaceType: 'personal' | 'org';
  effectiveRole: OrgRole;
};

export function isSettingsNavItemVisible(item: SettingsNavItem, ctx: WorkspaceNavContext): boolean {
  const hasPermission = (permission: PermissionKey) => rolePermissions[ctx.effectiveRole].has(permission);
  if (item.requiredPermission && !hasPermission(item.requiredPermission)) return false;
  if (ctx.workspaceType === 'personal' && item.tabId === 'manage-team') return false;
  if (ctx.workspaceType === 'personal' && (item.tabId === 'org-plugins' || item.tabId === 'org-hooks')) {
    return false;
  }
  if (ctx.workspaceType === 'org' && item.tabId === 'backend-server') return false;
  return true;
}

export function filterSettingsNav(items: SettingsNavItem[], ctx: WorkspaceNavContext): SettingsNavItem[] {
  return items.filter((item) => isSettingsNavItemVisible(item, ctx));
}

/** Same section grouping as the Settings sidebar, for the account popover. */
export function getAccountPopoverNavSections(selected: {
  type: 'personal' | 'org';
  role: string | null;
}): Array<{ label?: string; items: SettingsNavItem[] }> {
  void selected;
  return [{ items: ACCOUNT_POPOVER_SETTINGS_NAV }];
}
