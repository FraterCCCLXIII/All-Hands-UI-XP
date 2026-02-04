import React, { useState, useEffect } from 'react';
import {
  Building2,
  Cloud,
  Cpu,
  CreditCard,
  CheckCircle,
  ChevronDown,
  Key,
  Plus,
  Puzzle,
  Settings as SettingsIcon,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { AdvancedLlmForm } from '../components/settings/AdvancedLlmForm';
import { ChatGPTConnectSection } from '../components/settings/ChatGPTConnectSection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const settingsTabs = [
  { id: 'user', label: 'User', icon: User },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
  { id: 'app', label: 'Application', icon: SettingsIcon },
  { id: 'llm', label: 'Language Model (LLM)', icon: Cpu },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'secrets', label: 'Secrets', icon: Shield },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'mcp', label: 'MCP', icon: Cloud },
];

const settingsLinks = [
  { id: 'manage-account', label: 'Manage Account', icon: CreditCard, tabId: 'billing' },
  { id: 'manage-team', label: 'Manage Team', icon: Users, tabId: 'user' },
  { id: 'integrations', label: 'Integrations', icon: Puzzle, tabId: 'integrations' },
  { id: 'llm', label: 'Language Model (LLM)', icon: Cpu, tabId: 'llm' },
  { id: 'api-keys', label: 'API Keys', icon: Key, tabId: 'api-keys' },
  { id: 'secrets', label: 'Secrets', icon: Shield, tabId: 'secrets' },
  { id: 'mcp', label: 'MCP', icon: Cloud, tabId: 'mcp' },
];

const orgOptions = [
  { id: 'personal', name: 'Personal Account', role: null, type: 'personal' },
  { id: 'acme-admin', name: 'Acme Inc', role: 'Admin', type: 'org' },
  { id: 'starlight-user', name: 'Starlight Labs', role: 'User', type: 'org' },
];

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
  const selectedOrgId = controlledOrgId ?? uncontrolledOrgId;

  useEffect(() => {
    if (initialTab && settingsTabs.some((t) => t.id === initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
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
  const handleOrgChange = (orgId: string) => {
    if (controlledOrgId === undefined) {
      setUncontrolledOrgId(orgId);
    }
    onOrgChange?.(orgId);
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
          {settingsLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.tabId)}
                className={`flex items-center gap-3 px-[14px] py-2 rounded-md transition-colors text-left ${
                  activeTab === item.tabId
                    ? 'bg-muted/60'
                    : 'hover:bg-muted/40'
                }`}
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
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
            className={`flex items-center gap-3 px-[14px] py-2 rounded-md transition-colors text-left ${
              activeTab === 'user'
                ? 'bg-muted/60'
                : 'hover:bg-muted/40'
            }`}
          >
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
              User
            </span>
          </button>
          <button
            onClick={() => handleTabClick('app')}
            className={`flex items-center gap-3 px-[14px] py-2 rounded-md transition-colors text-left ${
              activeTab === 'app'
                ? 'bg-muted/60'
                : 'hover:bg-muted/40'
            }`}
          >
            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
              Application
            </span>
          </button>
          <button className="flex items-center gap-3 px-[14px] py-2 rounded-md transition-colors text-left hover:bg-muted/40">
            <Plus className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
              Create New Organization
            </span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className={mainContentScrollable ? 'flex-1 overflow-auto' : 'flex-1'}>
        <div className="flex flex-col gap-6 h-full">
          {activeTabLabel && (
            <h2 className="text-xl font-semibold leading-6 text-foreground">{activeTabLabel}</h2>
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
                        className="h-10 flex items-center justify-center px-4 rounded-md bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Content */}
          {activeTab === 'integrations' && (
            <div className="flex-1 overflow-auto">
              <div className="flex flex-col gap-4">
                {/* GitHub */}
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <h3 className="text-base font-medium text-foreground">GitHub</h3>
                  </div>
                  <button
                    type="button"
                    className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    Configure Github Repositories
                  </button>
                </div>

                {/* GitLab */}
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.387 9.452.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.624-8.443a.92.92 0 0 0 .331-1.024" fill="#E24329"/>
                      <path d="M12 23.054l4.418-13.604H7.582z" fill="#FC6D26"/>
                      <path d="M12 23.054l-4.418-13.604H1.387z" fill="#FCA326"/>
                      <path d="M1.387 9.451L.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054z" fill="#E24329"/>
                      <path d="M1.387 9.451h6.195L4.918 1.262a.455.455 0 0 0-.867 0z" fill="#FC6D26"/>
                      <path d="M12 23.054l4.418-13.604h6.195z" fill="#FCA326"/>
                      <path d="M22.613 9.451l1.342 4.136a.924.924 0 0 1-.331 1.023L12 23.054z" fill="#E24329"/>
                      <path d="M22.613 9.451h-6.195l2.664-8.189a.455.455 0 0 1 .867 0z" fill="#FC6D26"/>
                    </svg>
                    <h3 className="text-base font-medium text-foreground">GitLab</h3>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px] shrink-0" color="#FF684E">
                      <path d="M15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12Z" fill="currentColor"></path>
                    </svg>
                    <span className="font-normal text-xs text-muted-foreground">Not Connected</span>
                  </div>
                </div>

                {/* Slack */}
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-6 h-6" viewBox="0 0 54 54">
                      <g fill="none" fillRule="evenodd">
                        <path d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386" fill="#36C5F0"/>
                        <path d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387" fill="#2EB67D"/>
                        <path d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386" fill="#ECB22E"/>
                        <path d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336 0v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.25a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387" fill="#E01E5A"/>
                      </g>
                    </svg>
                    <h3 className="text-base font-medium text-foreground">Slack</h3>
                  </div>
                  <button
                    type="button"
                    className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    Install OpenHands Slack App
                  </button>
                </div>

                {/* Jira Cloud */}
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#2684FF" d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.757a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0z"/>
                    </svg>
                    <h3 className="text-base font-medium text-foreground">Jira Cloud</h3>
                  </div>
                  <button
                    type="button"
                    className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    Configure
                  </button>
                </div>
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
                    <h3 className="text-lg font-medium mb-2 text-foreground">Git Settings</h3>
                    <p className="text-xs mb-4 text-muted-foreground">Configure the username and email that OpenHands uses to commit changes.</p>
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
                  className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                      className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                      className="h-10 flex items-center justify-center px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 cursor-pointer transition-colors"
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
                      className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                  className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 cursor-pointer transition-colors"
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
                  <h3 className="text-xl font-medium text-foreground">OpenHands LLM Key</h3>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      Refresh API Key
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      You can use this API Key as the LLM API Key for OpenHands open-source and CLI. It will incur cost on your OpenHands Cloud account. Do NOT share this key elsewhere.
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
                <h3 className="text-xl font-medium text-foreground">OpenHands API Keys</h3>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    Create API Key
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  API keys allow you to authenticate with the OpenHands API programmatically. Keep your API keys secure; anyone with your API key can access your account. For more information on how to use the API, see our{' '}
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
              <div className="flex flex-col gap-5">
                <button
                  type="button"
                  className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  Add Server
                </button>
                <div className="border border-border rounded-md p-8 text-center">
                  <p className="text-muted-foreground text-sm">No servers configured</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
