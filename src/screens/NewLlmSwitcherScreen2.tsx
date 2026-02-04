import { useState } from 'react';
import { Check, CheckCircle, ChevronDown, ChevronLeft, KeyRound, MoreVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import { SettingsScreen } from './SettingsScreen';
import { PrototypeControlsFab } from '../components/common/PrototypeControlsFab';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { AdvancedLlmForm } from '../components/settings/AdvancedLlmForm';
import { ChatGPTConnectSection } from '../components/settings/ChatGPTConnectSection';
import { CondensationSettings } from '../components/settings/CondensationSettings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

const roleOptions = ['Personal', 'Org User', 'Org Admin'] as const;
type RoleOption = (typeof roleOptions)[number];

const orgOptions = [
  { id: 'personal', name: 'Personal Account', role: null, type: 'personal' },
  { id: 'acme-admin', name: 'Acme Inc', role: 'Admin', type: 'org' },
  { id: 'starlight-user', name: 'Starlight Labs', role: 'User', type: 'org' },
] as const;

const defaultProfiles = [
  { id: 'model-1', name: 'Model 1', provider: 'OpenAI', model: 'GPT5.2' },
  { id: 'model-2', name: 'Model 2', provider: 'OpenAI', model: 'GPT5.2' },
];

const apiKeyOptions = [
  { id: 'key-openai-gpt5', label: 'OpenAI · GPT5.2', value: 'sk-openai-gpt5-••••' },
  { id: 'key-openai-gpt4o', label: 'OpenAI · GPT-4o', value: 'sk-openai-gpt4o-••••' },
  { id: 'key-anthropic-opus', label: 'Anthropic · Claude Opus', value: 'sk-anthropic-opus-••••' },
  { id: 'key-litellm', label: 'LiteLLM · Proxy', value: 'sk-litellm-proxy-••••' },
];

export function NewLlmSwitcherScreen2() {
  const [selectedRole, setSelectedRole] = useState<RoleOption>('Personal');
  const [selectedOrgId, setSelectedOrgId] = useState<string>(orgOptions[0]?.id ?? 'personal');
  const [activeView, setActiveView] = useState<'list' | 'add' | 'edit'>('list');
  const [profiles, setProfiles] = useState(defaultProfiles);
  const [defaultProfileId, setDefaultProfileId] = useState<string | null>(defaultProfiles[0]?.id ?? null);
  const [deleteTarget, setDeleteTarget] = useState<(typeof defaultProfiles)[number] | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [providerName, setProviderName] = useState('');
  const [modelName, setModelName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [initialEditValues, setInitialEditValues] = useState({
    displayName: '',
    providerName: '',
    modelName: '',
    apiKey: '',
  });
  const [llmProvider, setLlmProvider] = useState('');
  const [llmApiKey, setLlmApiKey] = useState('');
  const [llmApiKeyApproved, setLlmApiKeyApproved] = useState(false);
  const [openaiConnecting, setOpenaiConnecting] = useState(false);
  const [advancedModel, setAdvancedModel] = useState('litellm_proxy/prod/claude-opus-4-5-20251101');
  const [advancedBaseUrl, setAdvancedBaseUrl] = useState('https://llm-proxy.app.all-hands.dev');
  const [addAdvanced, setAddAdvanced] = useState(true);
  const [addDisplayName, setAddDisplayName] = useState('');
  const [addProvider, setAddProvider] = useState('');
  const [addModel, setAddModel] = useState('');
  const [addApiKey, setAddApiKey] = useState('');
  const [addApiKeyApproved, setAddApiKeyApproved] = useState(false);
  const [enableCondenser, setEnableCondenser] = useState(true);
  const [enableConfirmation, setEnableConfirmation] = useState(false);

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
  const isAddModelValid = advancedModel.trim().length === 0 ? true : isValidModelName;
  const isAddBaseUrlValid = advancedBaseUrl.trim().length === 0 ? true : isValidBaseUrl;

  const handleStartAdd = () => {
    setAddAdvanced(true);
    setAddDisplayName('');
    setAddProvider('');
    setAddModel('');
    setAddApiKey('');
    setAddApiKeyApproved(false);
    setAdvancedModel('');
    setAdvancedBaseUrl('');
    setActiveView('add');
  };

  const handleChatGPTConnect = async () => {
    setOpenaiConnecting(true);
    setLlmProvider('openai');
    await new Promise((r) => setTimeout(r, 1500));
    setOpenaiConnecting(false);
    setLlmApiKey('•'.repeat(20));
    setLlmApiKeyApproved(true);
    setAddApiKey('•'.repeat(20));
    setAddApiKeyApproved(true);
    setApiKey('•'.repeat(20));
  };

  const handleChatGPTDisconnect = () => {
    setLlmProvider('');
    setLlmApiKey('');
    setLlmApiKeyApproved(false);
  };

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    const org = orgOptions.find((item) => item.id === orgId);
    if (!org || org.type === 'personal') {
      setSelectedRole('Personal');
      return;
    }
    setSelectedRole(org.role === 'Admin' ? 'Org Admin' : 'Org User');
  };

  const handleEditProfile = (profile: (typeof defaultProfiles)[number]) => {
    const normalizedModel = profile.model.trim().toLowerCase().replace(/\s+/g, '-');
    setDisplayName(profile.name);
    setProviderName(profile.provider.trim().toLowerCase());
    setModelName(normalizedModel);
    setApiKey('••••••••••');
    setInitialEditValues({
      displayName: profile.name,
      providerName: profile.provider.trim().toLowerCase(),
      modelName: normalizedModel,
      apiKey: '••••••••••',
    });
    setActiveView('edit');
  };

  const handleDeleteProfile = () => {
    if (!deleteTarget) return;
    setProfiles((prev) => prev.filter((profile) => profile.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const listView = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Available Models</h3>
        </div>
        {selectedRole !== 'Org User' && (
          <button
            type="button"
            onClick={handleStartAdd}
            className="h-10 px-4 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Add LLM Profile
          </button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {profiles.map((profile) => (
          <div key={profile.id} className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">{profile.name}</span>
              <span className="text-sm text-muted-foreground">
                {profile.provider} {profile.model}
              </span>
              {defaultProfileId === profile.id && (
                <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Default
                </span>
              )}
            </div>
            {selectedRole !== 'Org User' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-8 w-8 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
                    aria-label={`Open actions for ${profile.name}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleEditProfile(profile)} className="gap-2">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDefaultProfileId(profile.id)} className="gap-2">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    Set as default
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteTarget(profile)}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const addView = (
    <form className="flex flex-col h-full justify-between">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setActiveView('list')}
            className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to LLM list</span>
          </button>
          <h3 className="text-lg font-semibold text-foreground">Add LLM Profile</h3>
          <p className="text-sm text-muted-foreground">
            Configure an advanced model profile for your personal workspace.
          </p>
        </div>

        <label className="flex items-center gap-2 w-fit cursor-pointer">
          <input
            hidden
            type="checkbox"
            checked={addAdvanced}
            onChange={(e) => setAddAdvanced(e.target.checked)}
            data-testid="advanced-settings-switch"
          />
          <div
            className={`relative w-12 h-6 rounded-xl cursor-pointer transition-colors duration-200 ease-in-out flex items-center p-1.5 justify-start ${
              addAdvanced ? 'bg-white' : 'bg-muted border border-border'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-xl transition-all duration-200 ease-in-out ${
                addAdvanced ? 'translate-x-6 bg-black' : 'translate-x-0 bg-muted-foreground'
              }`}
            ></div>
          </div>
          <span className="text-sm text-foreground">Advanced</span>
        </label>

        <label className="flex flex-col gap-2.5 w-full max-w-[680px]">
          <span className="text-sm text-foreground">Display Name</span>
          <input
            placeholder="LLM Display Name"
            className="h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30"
            type="text"
            value={addDisplayName}
            onChange={(e) => setAddDisplayName(e.target.value)}
          />
        </label>

        {!addAdvanced ? (
          <>
            <fieldset className="flex flex-col gap-2.5 w-full max-w-[680px]">
              <label className="text-sm text-foreground">LLM Provider</label>
              <div className="relative w-full">
                <select
                  className="h-10 w-full rounded-md border border-border bg-muted/40 pl-3 pr-10 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30 appearance-none"
                  data-testid="llm-provider-input"
                  aria-label="LLM Provider"
                  value={addProvider}
                  onChange={(e) => setAddProvider(e.target.value)}
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
            <fieldset className="flex flex-col gap-2.5 w-full max-w-[680px]">
              <label className="text-sm text-foreground">LLM Model</label>
              <div className="relative w-full">
                <select
                  className="h-10 w-full rounded-md border border-border bg-muted/40 pl-3 pr-10 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30 appearance-none"
                  data-testid="llm-model-input"
                  aria-label="LLM Model"
                  value={addModel}
                  onChange={(e) => setAddModel(e.target.value)}
                >
                  <option value="">Select a model</option>
                  <option value="claude-opus">Claude Opus</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt5.2">GPT5.2</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
                  aria-hidden
                />
              </div>
            </fieldset>
            <label className="flex flex-col gap-2.5 w-full max-w-[680px]">
              <span className="text-sm text-foreground">API Key</span>
              <div className="relative w-full">
                <input
                  placeholder=""
                  value={addApiKeyApproved ? '•'.repeat(addApiKey.length) : addApiKey}
                  onChange={(e) => setAddApiKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (addApiKeyApproved) {
                      setAddApiKeyApproved(false);
                      setAddApiKey(e.key.length === 1 ? e.key : '');
                      e.preventDefault();
                    } else if (e.key === 'Enter' && addApiKey.length > 0) {
                      setAddApiKeyApproved(true);
                      e.preventDefault();
                    }
                  }}
                  className="h-10 w-full rounded-md border border-border bg-muted/40 pl-3 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30"
                  type="text"
                  data-testid="llm-api-key-input"
                />
                {!addApiKey && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="h-7 w-12 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
                          aria-label="Copy API key"
                        >
                          <span className="flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            <KeyRound className="h-3 w-3" />
                          </span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {apiKeyOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.id}
                            onClick={() => {
                              setAddApiKey(option.value);
                              setAddApiKeyApproved(true);
                            }}
                            className="gap-2"
                          >
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                {addApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddApiKey('');
                      setAddApiKeyApproved(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
                    aria-label="Clear API key"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {isChatGPTConnected && addApiKey.length > 0 && (
                  <CheckCircle
                    className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none"
                    aria-hidden
                  />
                )}
              </div>
            </label>
            <p className="text-xs text-muted-foreground">
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
            <ChatGPTConnectSection
              isConnected={isChatGPTConnected}
              isConnecting={openaiConnecting}
              onConnect={handleChatGPTConnect}
              onDisconnect={handleChatGPTDisconnect}
            />
          </>
        ) : (
          <AdvancedLlmForm
            model={advancedModel}
            baseUrl={advancedBaseUrl}
            onModelChange={setAdvancedModel}
            onBaseUrlChange={setAdvancedBaseUrl}
            isValidModelName={isAddModelValid}
            isValidBaseUrl={isAddBaseUrlValid}
            enableCondenser={enableCondenser}
            onEnableCondenserChange={setEnableCondenser}
            enableConfirmation={enableConfirmation}
            onEnableConfirmationChange={setEnableConfirmation}
            apiKeyPlaceholder=""
            apiKeyValue={addApiKey}
            onApiKeyChange={setAddApiKey}
            showApiKeyCheck={isChatGPTConnected && addApiKey.length > 0}
            apiKeyCheckOffsetClass={addApiKey ? 'right-12' : 'right-3'}
            apiKeyRightSlot={
              addApiKey ? (
                <button
                  type="button"
                  onClick={() => {
                    setAddApiKey('');
                    setAddApiKeyApproved(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
                  aria-label="Clear API key"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="h-7 w-12 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
                        aria-label="Copy API key"
                      >
                        <span className="flex items-center gap-1">
                          <Plus className="h-3 w-3" />
                          <KeyRound className="h-3 w-3" />
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {apiKeyOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.id}
                          onClick={() => {
                            setAddApiKey(option.value);
                            setAddApiKeyApproved(true);
                          }}
                          className="gap-2"
                        >
                          <KeyRound className="h-4 w-4 text-muted-foreground" />
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            }
            footerContent={
              <ChatGPTConnectSection
                isConnected={isChatGPTConnected}
                isConnecting={openaiConnecting}
                onConnect={handleChatGPTConnect}
                onDisconnect={handleChatGPTDisconnect}
              />
            }
          />
        )}
      </div>
      <div className="flex gap-6 py-6 pr-6 justify-start">
        <button
          disabled
          type="submit"
          className="h-10 flex items-center justify-center w-fit px-4 text-sm rounded-md bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Save Profile
        </button>
      </div>
    </form>
  );

  const isEditDirty =
    displayName !== initialEditValues.displayName ||
    providerName !== initialEditValues.providerName ||
    modelName !== initialEditValues.modelName ||
    apiKey !== initialEditValues.apiKey;

  const editView = (
    <form className="flex flex-col h-full justify-between">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setActiveView('list')}
            className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to LLM list</span>
          </button>
          <h3 className="text-lg font-semibold text-foreground">Edit LLM Profile</h3>
        </div>

        <label className="flex flex-col gap-2.5 w-full max-w-[680px]">
          <span className="text-sm text-foreground">Display Name</span>
          <input
            placeholder="Your Display Name"
            className="h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>

        <fieldset className="flex flex-col gap-2.5 w-full max-w-[680px]">
          <label className="text-sm text-foreground">LLM Provider</label>
          <div className="relative w-full">
            <select
              className="h-10 w-full rounded-md border border-border bg-muted/40 pl-3 pr-10 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30 appearance-none"
              data-testid="llm-provider-input"
              aria-label="LLM Provider"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
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

        <fieldset className="flex flex-col gap-2.5 w-full max-w-[680px]">
          <label className="text-sm text-foreground">LLM Model</label>
          <div className="relative w-full">
            <select
              className="h-10 w-full rounded-md border border-border bg-muted/40 pl-3 pr-10 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30 appearance-none"
              data-testid="llm-model-input"
              aria-label="LLM Model"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            >
              <option value="">Select a model</option>
              <option value="claude-opus">Claude Opus</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt5.2">GPT5.2</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
              aria-hidden
            />
          </div>
        </fieldset>

        <label className="flex flex-col gap-2.5 w-full max-w-[680px]">
          <span className="text-sm text-foreground">API Key</span>
          <div className="relative w-full">
            <input
              placeholder="••••••••••"
              className="h-10 w-full rounded-md border border-border bg-muted/40 px-3 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {!apiKey && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="h-7 w-12 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
                      aria-label="Copy API key"
                    >
                      <span className="flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        <KeyRound className="h-3 w-3" />
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {apiKeyOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => setApiKey(option.value)}
                        className="gap-2"
                      >
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {apiKey && (
              <button
                type="button"
                onClick={() => setApiKey('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
                aria-label="Clear API key"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isChatGPTConnected && apiKey.length > 0 && (
              <CheckCircle
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none"
                aria-hidden
              />
            )}
          </div>
        </label>

        <p className="text-xs text-muted-foreground">
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

        <ChatGPTConnectSection
          isConnected={isChatGPTConnected}
          isConnecting={openaiConnecting}
          onConnect={handleChatGPTConnect}
          onDisconnect={handleChatGPTDisconnect}
        />

        <CondensationSettings
          defaultHistorySize={120}
          showHeading
          enableCondenser={enableCondenser}
          onEnableCondenserChange={setEnableCondenser}
          enableConfirmation={enableConfirmation}
          onEnableConfirmationChange={setEnableConfirmation}
        />
      </div>

      <div className="flex gap-6 py-6 pr-6 justify-start">
        <button
          disabled={!isEditDirty}
          type="submit"
          className="h-10 flex items-center justify-center w-fit px-6 text-sm rounded-md bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setActiveView('list')}
          className="h-10 flex items-center justify-center w-fit px-6 text-sm rounded-md border border-border text-foreground hover:bg-muted/60 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="flex h-full w-full min-w-0 bg-background">
      <SettingsScreen
        initialTab="llm"
        llmTabLabelOverride={activeView === 'list' ? 'Language Model' : ''}
        llmContentScrollable={activeView === 'list'}
        mainContentScrollable={activeView === 'list'}
        selectedOrgId={selectedOrgId}
        onOrgChange={handleOrgChange}
        llmContentOverride={activeView === 'list' ? listView : activeView === 'add' ? addView : editView}
      />
      <Popover>
        <PopoverTrigger asChild>
          <PrototypeControlsFab isActive aria-label="Role controls" title="Role controls" />
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-56 p-3 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Role
          </div>
          <div className="space-y-1">
            {roleOptions.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                  selectedRole === role
                    ? 'bg-muted/60 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                <span>{role}</span>
                {selectedRole === role && (
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Active</span>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete LLM profile</DialogTitle>
            <DialogDescription>
              This will permanently remove "{deleteTarget?.name}". This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="h-9 px-4 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteProfile}
              className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
