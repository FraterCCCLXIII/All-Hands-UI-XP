import { Children, isValidElement, useMemo, useState } from 'react';
import { Check, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { SearchInput } from '../components/ui/search-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import Credits from '../components/common/Credits';
import { Logo } from '../components/common/Logo';
import { Spinner } from '../components/common/Spinner';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { WavingHand } from '../components/common/WavingHand';
import HomeInfo from '../components/common/HomeInfo';
import ProjectLoading from '../components/common/ProjectLoading';
import InviteTeam from '../components/common/InviteTeam';
import SharePreview from '../components/common/SharePreview';
import UserSettings from '../components/common/UserSettings';
import { PrototypeControlsFab } from '../components/common/PrototypeControlsFab';
import { InspectorOverlay } from '../components/common/InspectorOverlay';
import { EnterpriseCtaCard } from '../components/common/EnterpriseCtaCard';
import { ServerStatus, type ServerStatusType } from '../components/common/ServerStatus';
import { TaskItem } from '../components/chat/TaskItem';
import { TaskList, type Task } from '../components/chat/TaskList';
import SuggestedTasks from '../components/chat/SuggestedTasks';
import { Message as ChatMessage } from '../components/chat/Message';
import { ChatThread } from '../components/chat/ChatThread';
import { ChatWindowTabs, type ChatWindowTabId } from '../components/chat/ChatWindowTabs';
import { MessageInputPanel } from '../components/chat/MessageInputPanel';
import { DrawerTabs, type DrawerTab } from '../components/chat/DrawerTabs';
import { ChangesView, type FileChange } from '../components/chat/ChangesView';
import { ConversationDrawer } from '../components/chat/ConversationDrawer';
import { ChatStartScreen } from '../components/chat/ChatStartScreen';
import { WelcomeScreen } from '../components/chat/WelcomeScreen';
import { ChatArea } from '../components/chat/ChatArea';
import { Canvas, type CanvasContentType } from '../components/canvas/Canvas';
import { CanvasContent } from '../components/canvas/CanvasContent';
import { CanvasHeader } from '../components/canvas/CanvasHeader';
import { CanvasFooter } from '../components/canvas/CanvasFooter';
import { CanvasErrorModal } from '../components/canvas/CanvasErrorModal';
import { CanvasResizer } from '../components/canvas/CanvasResizer';
import { Protip } from '../components/canvas/Protip';
import { TerminalDrawer } from '../components/canvas/TerminalDrawer';
import { DashboardHeader, type DashboardTabId } from '../components/dashboard/DashboardHeader';
import { AgentPanel } from '../components/dashboard/AgentPanel';
import { AgentAvatarIcon } from '../components/dashboard/AgentAvatarIcon';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { ConversationCard, ConversationList } from '../components/dashboard/ConversationCard';
import { PRCardComponent } from '../components/dashboard/PRCard';
import { RepositorySection } from '../components/dashboard/RepositorySection';
import { Sidebar } from '../components/dashboard/Sidebar';
import { StatusBadge } from '../components/dashboard/StatusBadge';
import { CiChecksDialog } from '../components/dashboard/CiChecksDialog';
import { CommentsDialog } from '../components/dashboard/CommentsDialog';
import { NewConversationDialog } from '../components/dashboard/NewConversationDialog';
import CurrentProjects from '../components/navigation/CurrentProjects';
import { TopBar } from '../components/navigation/TopBar';
import { LeftNav } from '../components/navigation/LeftNav';
import { GitControls } from '../components/git/GitControls';
import { TetrisGame } from '../components/tetris/TetrisGame';
import type { ThemeElement } from '../types/theme';
import type { Message as MessageModel } from '../types/message';
import { conversationSummaries } from '../data/conversations';
import type { PRCard } from '../types/pr';
import { componentExportManifest } from './componentExportManifest';

type ComponentCardProps = {
  title: string;
  description: string;
  usage?: string;
  children: React.ReactNode;
};

function ComponentCard({ title, description, usage, children }: ComponentCardProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">{children}</div>
      {usage && (
        <div className="mt-4 rounded-lg bg-muted/40 px-3 py-2 text-xs font-mono text-muted-foreground">
          {usage}
        </div>
      )}
    </section>
  );
}

type ComponentItem = {
  id: string;
  name: string;
  path: string;
  description?: string;
  preview?: React.ReactNode;
  usage?: string;
};

type ComponentSection = {
  id: string;
  title: string;
  items: ComponentItem[];
};

type ExportExample = {
  label: string;
  content: React.ReactNode;
  span?: 'default' | 'wide' | 'full';
};

const formatLabel = (value: string) =>
  value
    .replace(/\.tsx$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const toKebabCase = (value: string) =>
  value
    .replace(/\.tsx$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

const extractNodeText = (node: React.ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (!isValidElement(node)) {
    return '';
  }

  return Children.toArray(node.props.children)
    .map((child) => extractNodeText(child))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

type ComponentLibraryScreenProps = {
  mode?: 'library' | 'figma';
  exportItemId?: string | null;
};

export function ComponentLibraryScreen({
  mode = 'library',
  exportItemId = null,
}: ComponentLibraryScreenProps) {
  const isFigmaExport = mode === 'figma';
  const [isDialogOpen, setIsDialogOpen] = useState(isFigmaExport && exportItemId === 'ui-dialog');
  const [isSheetOpen, setIsSheetOpen] = useState(isFigmaExport && exportItemId === 'ui-sheet');
  const [searchValue, setSearchValue] = useState('');
  const [statusIndicatorStatus, setStatusIndicatorStatus] = useState<'active' | 'stopped' | 'thinking'>('active');
  const [serverStatus, setServerStatus] = useState<ServerStatusType>('active');
  const [showInviteTeam, setShowInviteTeam] = useState(isFigmaExport && exportItemId === 'common-invite-team');
  const [showSharePreview, setShowSharePreview] = useState(
    isFigmaExport && (exportItemId === 'common-share-preview' || exportItemId === 'navigation-top-bar')
  );
  const [showUserSettings, setShowUserSettings] = useState(isFigmaExport && exportItemId === 'common-user-settings');
  const [isInspectorEnabled, setIsInspectorEnabled] = useState(isFigmaExport && exportItemId === 'common-inspector-overlay');
  const [chatWindowTab, setChatWindowTab] = useState<ChatWindowTabId>('preview');
  const [messagePanelStatus, setMessagePanelStatus] = useState<'active' | 'stopped' | 'thinking' | 'connecting'>('active');
  const [drawerTab, setDrawerTab] = useState<DrawerTab['id']>('tasks');
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(isFigmaExport && exportItemId === 'chat-conversation-drawer');
  const [showWelcome, setShowWelcome] = useState(isFigmaExport && exportItemId === 'chat-welcome-screen');
  const [canvasView, setCanvasView] = useState<'changes' | 'code' | 'terminal' | 'browser' | 'preview'>('preview');
  const [canvasContentType, setCanvasContentType] = useState<CanvasContentType>('preview');
  const [showCanvasError, setShowCanvasError] = useState(isFigmaExport && exportItemId === 'canvas-canvas-error-modal');
  const [canvasWidth, setCanvasWidth] = useState(180);
  const [terminalVisible, setTerminalVisible] = useState(isFigmaExport && exportItemId === 'canvas-terminal-drawer');
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [dashboardTab, setDashboardTab] = useState<DashboardTabId>('kanban');
  const [agentPanelOpen, setAgentPanelOpen] = useState(isFigmaExport && exportItemId === 'dashboard-agent-panel');
  const [projectTitle, setProjectTitle] = useState('Component Library');
  const [isRunningPreview, setIsRunningPreview] = useState(false);
  const [isCanvasVisiblePreview, setIsCanvasVisiblePreview] = useState(false);
  const [activeNavItemPreview, setActiveNavItemPreview] = useState('code');
  const isConversationDrawerOpenPreview = false;
  const [isInspectorPreview, setIsInspectorPreview] = useState(false);
  const [isLeftNavExpanded, setIsLeftNavExpanded] = useState(false);

  const sampleMessages: MessageModel[] = [
    {
      role: 'user',
      text: 'Show me the latest UI updates.',
      type: 'user',
      status: 'completed',
    },
    {
      role: 'ai',
      text: 'I updated the components overview and added hover scrollbars.',
      type: 'docs',
      status: 'completed',
      headerText: 'UI Update',
      actions: [
        { label: 'Accept', action: 'accept' },
        { label: 'Reject', action: 'reject' },
      ],
    },
  ];

  const sampleTasks: Task[] = [
    { id: 'task-1', title: 'Audit component tokens', completed: true },
    { id: 'task-2', title: 'Add hover scrollbars', completed: false },
    { id: 'task-3', title: 'Wire navigation anchors', completed: false },
  ];

  const sampleChanges: FileChange[] = [
    { name: 'src/screens/ComponentLibraryScreen.tsx', additions: 120, deletions: 4 },
    { name: 'src/index.css', additions: 16, deletions: 0 },
  ];

  const drawerTabs: DrawerTab[] = [
    { id: 'tasks', label: 'Task List', badge: '1/3 Tasks Completed' },
    { id: 'changes', label: 'Changes', stats: { additions: 150, deletions: 20, count: 4 } },
  ];

  const samplePRCard: PRCard = {
    id: 'pr-101',
    number: 101,
    title: 'Refine component library layout',
    repo: 'all-hands/ui',
    author: { name: 'DesignBot', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=design' },
    labels: [{ name: 'UI', color: 'info' }],
    additions: 128,
    deletions: 42,
    comments: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branch: 'feature/component-library',
    baseBranch: 'main',
    status: 'open',
    conversations: [
      {
        id: 'conv-1',
        name: 'Library audit',
        activity: 'Reviewing components',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  const sampleConversation = {
    id: 'conv-1',
    name: 'UI polish',
    description: 'Audit spacing + typography',
    timestamp: '2m ago',
    agentStatus: 'active' as const,
    isActive: true,
    commitStatus: 'Up to date',
  };

  const previewThemeClasses = (element: ThemeElement) => {
    const map: Partial<Record<ThemeElement, string>> = {
      text: 'text-foreground',
      bg: 'bg-background',
      border: 'border-border',
      'input-bg': 'bg-muted/40',
      'placeholder-text': 'placeholder:text-muted-foreground',
      'button-bg': 'bg-foreground',
      'button-text': 'text-background',
      'user-message-bg': 'bg-muted/70',
      'user-message-text': 'text-foreground',
      'ai-message-bg': 'bg-card',
      'ai-message-text': 'text-foreground',
      'status-dot-running': 'bg-emerald-400',
      'status-dot-stopped': 'bg-rose-400',
      'status-text': 'text-muted-foreground',
      'stop-button-bg': 'bg-rose-500',
      'canvas-bg': 'bg-muted/40',
      'panel-bg': 'bg-card',
      'active-button-bg': 'bg-muted',
      'active-button-text': 'text-foreground',
      'pill-button-bg': 'bg-muted/60',
      'pill-button-text': 'text-muted-foreground',
      'icon-color': 'text-muted-foreground',
      'hover-icon-color': 'hover:text-foreground',
      'hover-resizer-bg': 'hover:bg-muted/60',
      'stop-button-bg-subtle': 'bg-muted',
      'stop-button-text': 'text-foreground',
      'button-hover': 'hover:bg-muted/60',
      'task-item-bg': 'bg-muted/40',
      scrollbar: 'scrollbar-thin scrollbar-thumb-muted/70 scrollbar-track-transparent',
      'success-text': 'text-emerald-400',
      'error-text': 'text-rose-400',
    };
    return map[element] ?? '';
  };

  const componentSections: ComponentSection[] = [
    {
      id: 'logos',
      title: 'Logos',
      items: [
        {
          id: 'logos-primary',
          name: 'Primary Logo',
          path: 'components/common/Logo.tsx',
          description: 'Main product mark for headers and onboarding.',
          usage: `<Logo className="h-10 w-10 text-foreground" />`,
          preview: (
            <div className="flex items-center gap-4">
              <Logo className="h-10 w-10 text-foreground" />
              <Logo className="h-8 w-8 text-muted-foreground" />
              <Logo className="h-12 w-12 text-primary" />
            </div>
          ),
        },
      ],
    },
    {
      id: 'colors',
      title: 'Colors',
      items: [
        {
          id: 'colors-core',
          name: 'Core Tokens',
          path: 'src/index.css',
          description: 'Foundational color tokens for surfaces and text.',
          usage: `--background, --foreground, --card, --muted, --border`,
          preview: (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: 'Background', className: 'bg-background text-foreground border-border' },
                { label: 'Card', className: 'bg-card text-card-foreground border-border' },
                { label: 'Muted', className: 'bg-muted text-muted-foreground border-border' },
                { label: 'Primary', className: 'bg-primary text-primary-foreground border-transparent' },
                { label: 'Secondary', className: 'bg-secondary text-secondary-foreground border-transparent' },
                { label: 'Accent', className: 'bg-accent text-accent-foreground border-transparent' },
              ].map((swatch) => (
                <div key={swatch.label} className={`rounded-lg border ${swatch.className} p-3`}>
                  <div className="text-xs font-semibold">{swatch.label}</div>
                  <div className="text-[11px] opacity-70">Token sample</div>
                </div>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      id: 'typography',
      title: 'Typography',
      items: [
        {
          id: 'typography-scale',
          name: 'Type Scale',
          path: 'src/index.css',
          description: 'Primary font stack and text sizing.',
          usage: `--font-sans, --font-mono`,
          preview: (
            <div className="space-y-3">
              <div className="text-2xl font-semibold text-foreground">Heading — 24px / Semibold</div>
              <div className="text-lg font-medium text-foreground">Subheading — 18px / Medium</div>
              <div className="text-sm text-muted-foreground">
                Body text — 14px / Regular. Use for default paragraph copy and labels.
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Caption — 12px</div>
              <div className="rounded-md bg-muted/40 px-3 py-2 text-xs font-mono text-foreground">
                Monospace sample: npx all-hands-ui build
              </div>
            </div>
          ),
        },
      ],
    },
    {
        id: 'ui',
        title: 'UI',
        items: [
          {
            id: 'ui-button',
            name: 'Button',
            path: 'components/ui/button.tsx',
            description: 'Primary, secondary, and muted actions with consistent sizing.',
            usage: `<Button variant="default">Primary</Button>`,
            preview: (
              <>
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="muted">Muted</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </>
            ),
          },
          {
            id: 'ui-input',
            name: 'Input',
            path: 'components/ui/input.tsx',
            description: 'Standard form inputs and the inline search input pattern.',
            usage: `<Input placeholder="Project name" />`,
            preview: (
              <>
                <Input className="w-56" placeholder="Project name" />
                <SearchInput
                  value={searchValue}
                  onValueChange={setSearchValue}
                  placeholder="Search components"
                  size="sm"
                  className="w-56"
                />
              </>
            ),
          },
          {
            id: 'ui-badge',
            name: 'Badge',
            path: 'components/ui/badge.tsx',
            description: 'Status chips with semantic emphasis.',
            usage: `<Badge variant="secondary">Draft</Badge>`,
            preview: (
              <>
                <Badge>Active</Badge>
                <Badge variant="secondary">Draft</Badge>
                <Badge variant="outline">Paused</Badge>
                <Badge variant="destructive">Blocked</Badge>
              </>
            ),
          },
          {
            id: 'ui-dialog',
            name: 'Dialog',
            path: 'components/ui/dialog.tsx',
            description: 'Modal dialogs for confirmations and workflows.',
            usage: `<Dialog open={isOpen}>...</Dialog>`,
            preview: (
              <>
                {!isFigmaExport && (
                  <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                    Open dialog
                  </Button>
                )}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share update</DialogTitle>
                      <DialogDescription>Invite teammates to review this draft.</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2">
                      <Input placeholder="name@company.com" />
                      <Button size="sm">Send</Button>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ),
          },
          {
            id: 'ui-popover',
            name: 'Popover',
            path: 'components/ui/popover.tsx',
            description: 'Inline popovers for supporting context.',
            usage: `<Popover><PopoverTrigger>...</PopoverTrigger></Popover>`,
            preview: (
              <Popover open={isFigmaExport && exportItemId === 'ui-popover' ? true : undefined}>
                <PopoverTrigger asChild>
                  <Button variant="outline">Quick info</Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="text-sm font-medium text-foreground">Release checklist</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Validate API keys, run smoke tests, and confirm approvals.
                  </p>
                </PopoverContent>
              </Popover>
            ),
          },
          {
            id: 'ui-dropdown-menu',
            name: 'Dropdown Menu',
            path: 'components/ui/dropdown-menu.tsx',
            description: 'Compact menus for contextual actions.',
            usage: `<DropdownMenu><DropdownMenuTrigger>...</DropdownMenuTrigger></DropdownMenu>`,
            preview: (
              <DropdownMenu open={isFigmaExport && exportItemId === 'ui-dropdown-menu' ? true : undefined}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">More actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Move to folder</DropdownMenuItem>
                  <DropdownMenuItem>Archive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
          {
            id: 'ui-llm-profile-menu',
            name: 'LLM Profile Menu',
            path: 'src/screens/NewLlmSwitcherScreen2.tsx',
            description: 'Profile actions menu used in the LLM switcher settings flow.',
            usage: `<DropdownMenuContent align="end" className="w-40">...</DropdownMenuContent>`,
            preview: (
              <div className="flex flex-wrap items-start gap-4">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  aria-label="Open actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                <div className="w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                  <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                    Edit
                  </div>
                  <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    Set as default
                  </div>
                  <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: 'ui-search-input',
            name: 'Search Input',
            path: 'components/ui/search-input.tsx',
            description: 'Search input with inline clear affordance.',
            usage: `<SearchInput value={query} onValueChange={setQuery} />`,
          },
          {
            id: 'ui-sheet',
            name: 'Sheet',
            path: 'components/ui/sheet.tsx',
            description: 'Side panels for secondary flows.',
            usage: `<Sheet><SheetTrigger>...</SheetTrigger></Sheet>`,
            preview: (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                {!isFigmaExport && (
                  <SheetTrigger asChild>
                    <Button variant="outline">Open sheet</Button>
                  </SheetTrigger>
                )}
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Preferences</SheetTitle>
                    <SheetDescription>Update notification settings and defaults.</SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            ),
          },
        ],
      },
      {
        id: 'common',
        title: 'Common',
        items: [
          {
            id: 'common-credits',
            name: 'Credits',
            path: 'components/common/Credits.tsx',
            description: 'Credit balance pill with hover details.',
            usage: `<Credits credits={1200} />`,
            preview: <Credits credits={1200} />,
          },
          {
            id: 'common-enterprise-cta-card',
            name: 'EnterpriseCtaCard',
            path: 'components/common/EnterpriseCtaCard.tsx',
            description: 'Enterprise call-to-action card used in chat and navigation surfaces.',
            usage: `<EnterpriseCtaCard onLearnMoreClick={...} />`,
            preview: <EnterpriseCtaCard staticLayout onDismiss={() => {}} />,
          },
          {
            id: 'common-home-info',
            name: 'HomeInfo',
            path: 'components/common/HomeInfo.tsx',
            description: 'Quick-start cards for the home panel.',
            usage: `<HomeInfo />`,
            preview: <HomeInfo />,
          },
          {
            id: 'common-inspector-overlay',
            name: 'InspectorOverlay',
            path: 'components/common/InspectorOverlay.tsx',
            description: 'Interactive inspector for UI elements.',
            usage: `<InspectorOverlay enabled={true} />`,
            preview: (
              <div className="flex items-center gap-3">
                <Button variant={isInspectorEnabled ? 'secondary' : 'outline'} onClick={() => setIsInspectorEnabled(true)}>
                  Enable inspector
                </Button>
                <Button variant="ghost" onClick={() => setIsInspectorEnabled(false)}>
                  Disable
                </Button>
                <span className="text-xs text-muted-foreground">Click anywhere to inspect; Esc to exit.</span>
                <InspectorOverlay enabled={isInspectorEnabled} onRequestDisable={() => setIsInspectorEnabled(false)} />
              </div>
            ),
          },
          {
            id: 'common-invite-team',
            name: 'InviteTeam',
            path: 'components/common/InviteTeam.tsx',
            description: 'Invite modal with organization selection.',
            usage: `<InviteTeam organizations={['Acme']} currentOrg="Acme" onClose={...} />`,
            preview: (
              <div className="flex items-center gap-3">
                {!isFigmaExport && (
                  <Button variant="outline" onClick={() => setShowInviteTeam(true)}>
                    Open invite modal
                  </Button>
                )}
                {showInviteTeam && (
                  <InviteTeam
                    organizations={['Acme Inc.', 'Design Lab', 'Ops Team']}
                    currentOrg="Acme Inc."
                    onClose={() => setShowInviteTeam(false)}
                  />
                )}
              </div>
            ),
          },
          {
            id: 'common-logo',
            name: 'Logo',
            path: 'components/common/Logo.tsx',
            description: 'Inline SVG logo mark.',
            usage: `<Logo className="h-8 w-8 text-foreground" />`,
            preview: <Logo className="h-10 w-10 text-foreground" />,
          },
          {
            id: 'common-project-loading',
            name: 'ProjectLoading',
            path: 'components/common/ProjectLoading.tsx',
            description: 'Animated loading state for project setup.',
            usage: `<ProjectLoading />`,
            preview: (
              <div className="w-full rounded-xl border border-border bg-card/50">
                <ProjectLoading />
              </div>
            ),
          },
          {
            id: 'common-prototype-controls-fab',
            name: 'PrototypeControlsFab',
            path: 'components/common/PrototypeControlsFab.tsx',
            description: 'Floating action button for prototype controls.',
            usage: `<PrototypeControlsFab isActive />`,
            preview: (
              <div className="flex items-center">
                <PrototypeControlsFab isActive className="static" />
              </div>
            ),
          },
          {
            id: 'common-server-status',
            name: 'ServerStatus',
            path: 'components/common/ServerStatus.tsx',
            description: 'Interactive server status pill with dropdown.',
            usage: `<ServerStatus status="active" getThemeClasses={...} />`,
            preview: (
              <ServerStatus
                status={serverStatus}
                getThemeClasses={previewThemeClasses}
                onStatusChange={setServerStatus}
                simulate
              />
            ),
          },
          {
            id: 'common-share-preview',
            name: 'SharePreview',
            path: 'components/common/SharePreview.tsx',
            description: 'Share modal with social actions and copy link.',
            usage: `<SharePreview shareUrl="..." onClose={...} />`,
            preview: (
              <div className="flex items-center gap-3">
                {!isFigmaExport && (
                  <Button variant="outline" onClick={() => setShowSharePreview(true)}>
                    Open share modal
                  </Button>
                )}
                {showSharePreview && (
                  <SharePreview shareUrl={window.location.href} onClose={() => setShowSharePreview(false)} />
                )}
              </div>
            ),
          },
          {
            id: 'common-spinner',
            name: 'Spinner',
            path: 'components/common/Spinner.tsx',
            description: 'Lightweight spinner for inline loading.',
            usage: `<Spinner className="h-5 w-5" color="border-t-foreground" />`,
            preview: <Spinner className="h-6 w-6 border-2" color="border-t-foreground" />,
          },
          {
            id: 'common-status-indicator',
            name: 'StatusIndicator',
            path: 'components/common/StatusIndicator.tsx',
            description: 'Compact status indicator with toggle.',
            usage: `<StatusIndicator serverStatus="active" onServerStatusChange={...} />`,
            preview: (
              <StatusIndicator
                serverStatus={statusIndicatorStatus}
                onServerStatusChange={(status) => setStatusIndicatorStatus(status as 'active' | 'thinking' | 'stopped')}
              />
            ),
          },
          {
            id: 'common-user-settings',
            name: 'UserSettings',
            path: 'components/common/UserSettings.tsx',
            description: 'Settings panel for account and org management.',
            usage: `<UserSettings theme="dark" getThemeClasses={...} onClose={...} />`,
            preview: (
              <div className="relative min-h-[240px] w-full">
                {!isFigmaExport && (
                  <Button variant="outline" onClick={() => setShowUserSettings(true)}>
                    Open user settings
                  </Button>
                )}
                {showUserSettings && (
                  <UserSettings
                    theme="dark"
                    getThemeClasses={previewThemeClasses}
                    onClose={() => setShowUserSettings(false)}
                  />
                )}
              </div>
            ),
          },
          {
            id: 'common-waving-hand',
            name: 'WavingHand',
            path: 'components/common/WavingHand.tsx',
            description: 'Animated waving hand icon.',
            usage: `<WavingHand className="h-6 w-6" />`,
            preview: <WavingHand className="h-6 w-6" />,
          },
          {
            id: 'common-gripper',
            name: 'Gripper',
            path: 'components/common/Gripper.tsx',
            description: 'Canvas resize handle (requires layout context).',
            usage: `<Gripper getThemeClasses={...} onResize={...} initialWidth={50} minWidth={30} maxWidth={70} />`,
          },
        ],
      },
      {
        id: 'chat',
        title: 'Chat',
        items: [
          {
            id: 'chat-message',
            name: 'Message',
            path: 'components/chat/Message.tsx',
            description: 'Single chat bubble with optional actions.',
            usage: `<Message theme="dark" getThemeClasses={...} message={...} />`,
            preview: (
              <div className="flex w-full flex-col gap-3">
                <ChatMessage
                  theme="dark"
                  getThemeClasses={previewThemeClasses}
                  message={{ role: 'user', text: 'Can we add a component list?', headerText: 'User' }}
                />
                <ChatMessage
                  theme="dark"
                  getThemeClasses={previewThemeClasses}
                  message={{
                    role: 'ai',
                    text: 'Done. I also added scrollbars on hover.',
                    headerText: 'AI Assistant',
                    actions: [
                      { label: 'Accept', action: 'accept' },
                      { label: 'Reject', action: 'reject' },
                    ],
                  }}
                />
              </div>
            ),
          },
          {
            id: 'chat-chat-window-tabs',
            name: 'ChatWindowTabs',
            path: 'components/chat/ChatWindowTabs.tsx',
            description: 'Preview/code/docs tabs for the chat window.',
            usage: `<ChatWindowTabs activeTab={tab} onTabChange={...} />`,
            preview: (
              <ChatWindowTabs
                activeTab={chatWindowTab}
                onTabChange={setChatWindowTab}
                getThemeClasses={previewThemeClasses}
              />
            ),
          },
          {
            id: 'chat-task-item',
            name: 'TaskItem',
            path: 'components/chat/TaskItem.tsx',
            description: 'Single task row with completion state.',
            usage: `<TaskItem id="task" title="..." completed={false} />`,
            preview: (
              <TaskItem
                id="task-1"
                title="Ship component library"
                completed={false}
                getThemeClasses={previewThemeClasses}
              />
            ),
          },
          {
            id: 'chat-task-list',
            name: 'TaskList',
            path: 'components/chat/TaskList.tsx',
            description: 'Scrollable list of tasks.',
            usage: `<TaskList tasks={tasks} onToggle={...} />`,
            preview: (
              <div className="h-48 w-full rounded-lg border border-border">
                <TaskList
                  tasks={sampleTasks}
                  onToggle={() => {}}
                  getThemeClasses={previewThemeClasses}
                />
              </div>
            ),
          },
          {
            id: 'chat-changes-view',
            name: 'ChangesView',
            path: 'components/chat/ChangesView.tsx',
            description: 'File change summary list.',
            usage: `<ChangesView changes={changes} />`,
            preview: (
              <div className="h-48 w-full rounded-lg border border-border">
                <ChangesView changes={sampleChanges} getThemeClasses={previewThemeClasses} />
              </div>
            ),
          },
          {
            id: 'chat-drawer-tabs',
            name: 'DrawerTabs',
            path: 'components/chat/DrawerTabs.tsx',
            description: 'Tabs for chat drawer sections.',
            usage: `<DrawerTabs tabs={...} activeTab="tasks" />`,
            preview: (
              <div className="w-full rounded-lg border border-border overflow-hidden">
                <DrawerTabs
                  tabs={drawerTabs}
                  activeTab={drawerTab}
                  onTabChange={setDrawerTab}
                  isCollapsed={drawerCollapsed}
                  onToggleCollapse={() => setDrawerCollapsed((prev) => !prev)}
                  getThemeClasses={previewThemeClasses}
                />
              </div>
            ),
          },
          {
            id: 'chat-message-input-panel',
            name: 'MessageInputPanel',
            path: 'components/chat/MessageInputPanel.tsx',
            description: 'Input bar with server status and send actions.',
            usage: `<MessageInputPanel onSendMessage={...} serverStatus="active" />`,
            preview: (
              <MessageInputPanel
                getThemeClasses={previewThemeClasses}
                onSendMessage={() => {}}
                serverStatus={messagePanelStatus}
                onServerStatusChange={setMessagePanelStatus}
              />
            ),
          },
          {
            id: 'chat-suggested-tasks',
            name: 'SuggestedTasks',
            path: 'components/chat/SuggestedTasks.tsx',
            description: 'Suggested tasks card list.',
            usage: `<SuggestedTasks />`,
            preview: <SuggestedTasks theme="dark" getThemeClasses={previewThemeClasses} />,
          },
          {
            id: 'chat-chat-start-screen',
            name: 'ChatStartScreen',
            path: 'components/chat/ChatStartScreen.tsx',
            description: 'Start screen with quick suggestions.',
            usage: `<ChatStartScreen />`,
            preview: (
              <div className="relative h-56 w-full rounded-lg border border-border bg-card">
                <ChatStartScreen />
              </div>
            ),
          },
          {
            id: 'chat-welcome-screen',
            name: 'WelcomeScreen',
            path: 'components/chat/WelcomeScreen.tsx',
            description: 'Repository selection and onboarding view.',
            usage: `<WelcomeScreen theme="dark" userName="User" />`,
            preview: (
              <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-border bg-card">
                {!showWelcome && !isFigmaExport ? (
                  <Button variant="outline" onClick={() => setShowWelcome(true)}>
                    Open welcome screen
                  </Button>
                ) : (
                  <WelcomeScreen
                    theme="dark"
                    getThemeClasses={previewThemeClasses}
                    userName="User"
                    onRepoSelect={() => {}}
                    onBranchSelect={() => {}}
                    onCreateNewRepo={() => {}}
                    onClose={() => setShowWelcome(false)}
                  />
                )}
              </div>
            ),
          },
          {
            id: 'chat-conversation-drawer',
            name: 'ConversationDrawer',
            path: 'components/chat/ConversationDrawer.tsx',
            description: 'Sheet drawer for recent conversations.',
            usage: `<ConversationDrawer open={open} onOpenChange={...} conversations={...} />`,
            preview: (
              <div className="flex items-center gap-3">
                {!isFigmaExport && (
                  <Button variant="outline" onClick={() => setDrawerOpen(true)}>
                    Open conversation drawer
                  </Button>
                )}
                <ConversationDrawer
                  open={drawerOpen}
                  onOpenChange={setDrawerOpen}
                  conversations={conversationSummaries.slice(0, 3)}
                />
              </div>
            ),
          },
          {
            id: 'chat-chat-thread',
            name: 'ChatThread',
            path: 'components/chat/ChatThread.tsx',
            description: 'Full chat transcript with input and git controls.',
            usage: `<ChatThread messages={messages} onSendMessage={...} />`,
            preview: (
              <div className="h-[520px] w-full rounded-lg border border-border bg-card">
                <ChatThread
                  theme="dark"
                  getThemeClasses={previewThemeClasses}
                  messages={sampleMessages}
                  serverStatus={messagePanelStatus}
                  onSendMessage={() => {}}
                  onServerStatusChange={setMessagePanelStatus}
                  onCanvasToggle={() => {}}
                  disableAutoScroll
                />
              </div>
            ),
          },
          {
            id: 'chat-chat-area',
            name: 'ChatArea',
            path: 'components/chat/ChatArea.tsx',
            description: 'Main chat layout with tasks drawer and git controls.',
            usage: `<ChatArea messages={messages} onSendMessage={...} />`,
            preview: (
              <div className="h-[520px] w-full rounded-lg border border-border bg-card">
                <ChatArea
                  theme="dark"
                  getThemeClasses={previewThemeClasses}
                  messages={sampleMessages}
                  serverStatus={messagePanelStatus}
                  projectName="component-library"
                  branchName="main"
                  userName="User"
                  onSendMessage={() => {}}
                  onServerStatusChange={setMessagePanelStatus}
                  onPush={() => {}}
                  onPull={() => {}}
                  onCreatePR={() => {}}
                  onRepoSelect={() => {}}
                  onBranchSelect={() => {}}
                  onCreateNewRepo={() => {}}
                  activeChatWindowTab={chatWindowTab}
                  onChatWindowTabChange={setChatWindowTab}
                  disableAutoScroll
                  enterpriseCtaPlacement={isFigmaExport ? 'inline' : 'fixed'}
                />
              </div>
            ),
          },
        ],
      },
      {
        id: 'canvas',
        title: 'Canvas',
        items: [
          {
            id: 'canvas-canvas',
            name: 'Canvas',
            path: 'components/canvas/Canvas.tsx',
            description: 'Canvas layout with header, content, and terminal drawer.',
            usage: `<Canvas contentType="preview" />`,
            preview: (
              <div className="w-full space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(['preview', 'code', 'docs', 'share', 'run'] as CanvasContentType[]).map((type) => (
                    <Button
                      key={type}
                      variant={canvasContentType === type ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setCanvasContentType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
                <div className="h-[320px] w-full rounded-lg border border-border bg-card">
                  <Canvas
                    theme="dark"
                    getThemeClasses={previewThemeClasses}
                    contentType={canvasContentType}
                    showTip
                  />
                </div>
              </div>
            ),
          },
          {
            id: 'canvas-canvas-content',
            name: 'CanvasContent',
            path: 'components/canvas/CanvasContent.tsx',
            description: 'Code/preview content renderer.',
            usage: `<CanvasContent content={...} />`,
            preview: (
              <div className="h-40 w-full rounded-lg border border-border bg-card">
                <CanvasContent
                  theme="dark"
                  getThemeClasses={previewThemeClasses}
                  content={{ type: 'code', text: 'export const Component = () => null;', headerText: 'Example' }}
                />
              </div>
            ),
          },
          {
            id: 'canvas-canvas-header',
            name: 'CanvasHeader',
            path: 'components/canvas/CanvasHeader.tsx',
            description: 'Canvas navigation bar.',
            usage: `<CanvasHeader currentView="preview" onViewChange={...} />`,
            preview: (
              <CanvasHeader
                getThemeClasses={previewThemeClasses}
                currentView={canvasView}
                isTerminalVisible={terminalVisible}
                onViewChange={(view) => {
                  if (view === 'terminal') {
                    setTerminalVisible((prev) => !prev);
                    return;
                  }
                  setCanvasView(view);
                }}
              />
            ),
          },
          {
            id: 'canvas-canvas-footer',
            name: 'CanvasFooter',
            path: 'components/canvas/CanvasFooter.tsx',
            description: 'Canvas footer controls.',
            usage: `<CanvasFooter isConsoleVisible />`,
            preview: (
              <CanvasFooter
                theme="dark"
                getThemeClasses={previewThemeClasses}
                isConsoleVisible
                consoleHeight={terminalHeight}
              />
            ),
          },
          {
            id: 'canvas-canvas-error-modal',
            name: 'CanvasErrorModal',
            path: 'components/canvas/CanvasErrorModal.tsx',
            description: 'Error modal for canvas runtime failures.',
            usage: `<CanvasErrorModal showError onErrorClose={...} />`,
            preview: (
              <div className="flex items-center gap-3">
                {!isFigmaExport && (
                  <Button variant="outline" onClick={() => setShowCanvasError(true)}>
                    Trigger error modal
                  </Button>
                )}
                <CanvasErrorModal
                  getThemeClasses={previewThemeClasses}
                  showError={showCanvasError}
                  onErrorClose={() => setShowCanvasError(false)}
                  onShowConsole={() => {}}
                />
              </div>
            ),
          },
          {
            id: 'canvas-canvas-resizer',
            name: 'CanvasResizer',
            path: 'components/canvas/CanvasResizer.tsx',
            description: 'Drag handle for canvas width adjustments.',
            usage: `<CanvasResizer currentWidth={width} onResize={...} />`,
            preview: (
              <div className="flex h-16 w-full items-stretch rounded-lg border border-border overflow-hidden">
                <div className="flex-1 bg-muted/30" />
                <CanvasResizer
                  getThemeClasses={previewThemeClasses}
                  currentWidth={canvasWidth}
                  onResize={setCanvasWidth}
                  minWidth={120}
                  maxWidth={260}
                />
                <div className="flex-1 bg-muted/50" />
              </div>
            ),
          },
          {
            id: 'canvas-protip',
            name: 'Protip',
            path: 'components/canvas/Protip.tsx',
            description: 'Informational tip card.',
            usage: `<Protip />`,
            preview: <Protip />,
          },
          {
            id: 'canvas-terminal-drawer',
            name: 'TerminalDrawer',
            path: 'components/canvas/TerminalDrawer.tsx',
            description: 'Resizable terminal drawer.',
            usage: `<TerminalDrawer isVisible height={200} />`,
            preview: (
              <div className="w-full rounded-lg border border-border overflow-hidden">
                {!isFigmaExport && (
                  <div className="flex items-center gap-3 p-3">
                    <Button variant="outline" onClick={() => setTerminalVisible(true)}>
                      Open terminal
                    </Button>
                  </div>
                )}
                <TerminalDrawer
                  getThemeClasses={previewThemeClasses}
                  isVisible={terminalVisible}
                  height={terminalHeight}
                  onResize={setTerminalHeight}
                  onMinimize={() => setTerminalHeight(32)}
                  onClose={() => setTerminalVisible(false)}
                />
              </div>
            ),
          },
        ],
      },
      {
        id: 'dashboard',
        title: 'Dashboard',
        items: [
          {
            id: 'dashboard-dashboard-header',
            name: 'DashboardHeader',
            path: 'components/dashboard/DashboardHeader.tsx',
            description: 'Sticky header with dashboard tabs.',
            usage: `<DashboardHeader activeTab="kanban" onSelectTab={...} />`,
            preview: (
              <div className="rounded-lg border border-border overflow-hidden">
                <DashboardHeader activeTab={dashboardTab} onSelectTab={setDashboardTab} />
              </div>
            ),
          },
          {
            id: 'dashboard-sidebar',
            name: 'Sidebar',
            path: 'components/dashboard/Sidebar.tsx',
            description: 'Compact sidebar for dashboard navigation.',
            usage: `<Sidebar />`,
            preview: (
              <div className="h-56 w-20 overflow-hidden rounded-lg border border-border">
                <Sidebar />
              </div>
            ),
          },
          {
            id: 'dashboard-agent-avatar-icon',
            name: 'AgentAvatarIcon',
            path: 'components/dashboard/AgentAvatarIcon.tsx',
            description: 'Icon for agent personas.',
            usage: `<AgentAvatarIcon icon="search" />`,
            preview: (
              <div className="flex items-center gap-3 text-muted-foreground">
                <AgentAvatarIcon icon="search" className="h-5 w-5" />
                <AgentAvatarIcon icon="flask" className="h-5 w-5" />
                <AgentAvatarIcon icon="file-text" className="h-5 w-5" />
                <AgentAvatarIcon icon="shield" className="h-5 w-5" />
              </div>
            ),
          },
          {
            id: 'dashboard-status-badge',
            name: 'StatusBadge',
            path: 'components/dashboard/StatusBadge.tsx',
            description: 'Status chips for PR and branch states.',
            usage: `<StatusBadge variant="open">Open</StatusBadge>`,
            preview: (
              <div className="flex items-center gap-2">
                <StatusBadge variant="open">Open</StatusBadge>
                <StatusBadge variant="closed">Closed</StatusBadge>
                <StatusBadge variant="error">Error</StatusBadge>
              </div>
            ),
          },
          {
            id: 'dashboard-ci-checks-dialog',
            name: 'CiChecksDialog',
            path: 'components/dashboard/CiChecksDialog.tsx',
            description: 'Dialog for CI checks and filters.',
            usage: `<CiChecksDialog count={4} />`,
            preview: <CiChecksDialog count={4} />,
          },
          {
            id: 'dashboard-comments-dialog',
            name: 'CommentsDialog',
            path: 'components/dashboard/CommentsDialog.tsx',
            description: 'Dialog for PR comments.',
            usage: `<CommentsDialog count={12} />`,
            preview: <CommentsDialog count={12} />,
          },
          {
            id: 'dashboard-new-conversation-dialog',
            name: 'NewConversationDialog',
            path: 'components/dashboard/NewConversationDialog.tsx',
            description: 'Start a new conversation dialog.',
            usage: `<NewConversationDialog repositoryName="..." branches={...} />`,
            preview: (
              <NewConversationDialog
                repositoryName="all-hands/ui"
                branches={['main', 'feature/component-library']}
              />
            ),
          },
          {
            id: 'dashboard-conversation-card',
            name: 'ConversationCard',
            path: 'components/dashboard/ConversationCard.tsx',
            description: 'Conversation summary card.',
            usage: `<ConversationCard conversation={...} showFooter={false} />`,
            preview: <ConversationCard conversation={sampleConversation} showFooter={false} />,
          },
          {
            id: 'dashboard-conversation-list',
            name: 'ConversationList',
            path: 'components/dashboard/ConversationCard.tsx',
            description: 'List of conversations with optional collapse.',
            usage: `<ConversationList conversations={...} title="Recent" showFooter={false} />`,
            preview: (
              <ConversationList
                conversations={[sampleConversation]}
                title="Recent Conversations"
                collapsible
                showFooter={false}
              />
            ),
          },
          {
            id: 'dashboard-pr-card',
            name: 'PRCard',
            path: 'components/dashboard/PRCard.tsx',
            description: 'PR summary card used in the kanban board.',
            usage: `<PRCardComponent card={card} onClick={...} />`,
            preview: (
              <PRCardComponent card={samplePRCard} onClick={() => {}} />
            ),
          },
          {
            id: 'dashboard-agent-panel',
            name: 'AgentPanel',
            path: 'components/dashboard/AgentPanel.tsx',
            description: 'Side panel showing agent conversations.',
            usage: `<AgentPanel card={card} isOpen={open} showConversationFooter={false} />`,
            preview: (
              <div className="flex items-center gap-3">
                {!isFigmaExport && (
                  <Button variant="outline" onClick={() => setAgentPanelOpen(true)}>
                    Open agent panel
                  </Button>
                )}
                <AgentPanel
                  card={samplePRCard}
                  isOpen={agentPanelOpen}
                  onClose={() => setAgentPanelOpen(false)}
                  onCreateConversation={() => 'conv-1'}
                  onSendMessage={() => {}}
                  showConversationFooter={false}
                />
              </div>
            ),
          },
          {
            id: 'dashboard-kanban-board',
            name: 'KanbanBoard',
            path: 'components/dashboard/KanbanBoard.tsx',
            description: 'Drag-and-drop kanban board for PRs.',
            usage: `<KanbanBoard activeRepo="all" />`,
            preview: (
              <div className="h-[420px] w-full rounded-lg border border-border bg-card">
                <KanbanBoard activeRepo="all" />
              </div>
            ),
          },
          {
            id: 'dashboard-repository-section',
            name: 'RepositorySection',
            path: 'components/dashboard/RepositorySection.tsx',
            description: 'Repository overview with branches and conversations.',
            usage: `<RepositorySection name="repo" branches={...} />`,
            preview: (
              <RepositorySection
                name="all-hands/ui"
                branches={[
                  {
                    name: 'main',
                    status: 'open',
                    prNumber: 101,
                    prTitle: 'Component library polish',
                    conversations: [sampleConversation],
                    commitStatus: 'Up to date',
                  },
                ]}
              />
            ),
          },
        ],
      },
      {
        id: 'navigation',
        title: 'Navigation',
        items: [
          {
            id: 'navigation-current-projects',
            name: 'CurrentProjects',
            path: 'components/navigation/CurrentProjects.tsx',
            description: 'Collapsible list of active projects.',
            usage: `<CurrentProjects projects={...} />`,
            preview: (
              <CurrentProjects
                theme="dark"
                getThemeClasses={previewThemeClasses}
                projects={[
                  { id: '1', name: 'All-Hands UI' },
                  { id: '2', name: 'Component Library' },
                  { id: '3', name: 'Dashboard Revamp' },
                  { id: '4', name: 'Chat UX' },
                ]}
              />
            ),
          },
          {
            id: 'navigation-left-nav',
            name: 'LeftNav',
            path: 'components/navigation/LeftNav.tsx',
            description: 'Primary left navigation rail.',
            usage: `<LeftNav theme="dark" onNavItemClick={...} />`,
            preview: (
              <div className="h-72 w-20 overflow-hidden rounded-lg border border-border bg-sidebar">
                <LeftNav
                  theme="dark"
                  getThemeClasses={previewThemeClasses}
                  isExpanded={isLeftNavExpanded}
                  onExpandChange={setIsLeftNavExpanded}
                  onNavItemClick={setActiveNavItemPreview}
                  onFlowPrototypeClick={() => {}}
                  activeNavItem={activeNavItemPreview}
                  isConversationDrawerOpen={isConversationDrawerOpenPreview}
                  isInspectorEnabled={isInspectorPreview}
                  onInspectorToggle={() => setIsInspectorPreview((prev) => !prev)}
                />
              </div>
            ),
          },
          {
            id: 'navigation-top-bar',
            name: 'TopBar',
            path: 'components/navigation/TopBar.tsx',
            description: 'Top bar with share/run controls.',
            usage: `<TopBar projectTitle="..." onShare={...} />`,
            preview: (
              <div className="rounded-lg border border-border bg-card">
                <TopBar
                  theme="dark"
                  getThemeClasses={previewThemeClasses}
                  projectTitle={projectTitle}
                  onProjectTitleChange={setProjectTitle}
                  serverStatus={messagePanelStatus}
                  onServerStatusChange={setMessagePanelStatus}
                  onShare={() => setShowSharePreview(true)}
                  onRun={() => setIsRunningPreview((prev) => !prev)}
                  isRunning={isRunningPreview}
                  isCanvasVisible={isCanvasVisiblePreview}
                  onCanvasToggle={() => setIsCanvasVisiblePreview((prev) => !prev)}
                  activeChatWindowTab={chatWindowTab}
                  onChatWindowTabChange={setChatWindowTab}
                />
                {showSharePreview && (
                  <SharePreview shareUrl={window.location.href} onClose={() => setShowSharePreview(false)} />
                )}
              </div>
            ),
          },
        ],
      },
      {
        id: 'git',
        title: 'Git',
        items: [
          {
            id: 'git-git-controls',
            name: 'GitControls',
            path: 'components/git/GitControls.tsx',
            description: 'Repository, branch, and sync controls.',
            usage: `<GitControls projectName="repo" branchName="main" />`,
            preview: (
              <GitControls
                theme="dark"
                getThemeClasses={previewThemeClasses}
                projectName="all-hands/ui"
                branchName="main"
                onPush={() => {}}
                onPull={() => {}}
                onCreatePR={() => {}}
              />
            ),
          },
        ],
      },
      {
        id: 'tetris',
        title: 'Tetris',
        items: [
          {
            id: 'tetris-tetris-game',
            name: 'TetrisGame',
            path: 'components/tetris/TetrisGame.tsx',
            description: 'Interactive Tetris mini-game.',
            usage: `<TetrisGame theme="dark" getThemeClasses={...} />`,
            preview: (
              <div className="w-full rounded-lg border border-border bg-card p-4">
                <TetrisGame theme="dark" getThemeClasses={previewThemeClasses} />
              </div>
            ),
          },
        ],
      },
    ];

  const allComponentSections = useMemo(() => {
    const knownPaths = new Set(
      componentSections.flatMap((section) => section.items.map((item) => item.path))
    );
    const mergedSections = new Map<string, ComponentSection>(
      componentSections.map((section) => [
        section.id,
        {
          ...section,
          items: [...section.items],
        },
      ])
    );

    componentExportManifest.forEach((modulePath) => {
      const relativePath = modulePath.replace(/^src\//, '');

      if (knownPaths.has(relativePath)) {
        return;
      }

      const segments = relativePath.split('/');
      const sectionId = segments[1] ?? 'misc';
      const fileName = segments[segments.length - 1] ?? relativePath;
      const componentName = fileName.replace(/\.tsx$/, '');
      const sectionTitle = formatLabel(sectionId);
      const section = mergedSections.get(sectionId) ?? {
        id: sectionId,
        title: sectionTitle,
        items: [],
      };

      section.items.push({
        id: `${sectionId}-${toKebabCase(componentName)}`,
        name: formatLabel(componentName),
        path: relativePath,
        description: `Standalone export route scaffold for ${formatLabel(componentName)}.`,
      });

      mergedSections.set(sectionId, section);
    });

    return Array.from(mergedSections.values()).map((section) => ({
      ...section,
      items: section.items.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [componentSections]);

  const handleScrollTo = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredSections = useMemo(() => {
    if (!isFigmaExport || !exportItemId) {
      return allComponentSections;
    }

    if (exportItemId === 'all-components') {
      return componentSections;
    }

    return allComponentSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.id === exportItemId),
      }))
      .filter((section) => section.items.length > 0);
  }, [allComponentSections, exportItemId, isFigmaExport]);

  const selectedItem = exportItemId === 'all-components' ? null : filteredSections.flatMap((section) => section.items)[0] ?? null;

  const buildExportExamples = (item: ComponentItem): ExportExample[] => {
    if (!item) {
      return [];
    }

    if (item.id === 'ui-button') {
      const renderButtonState = (
          stateLabel: string,
          variant: React.ComponentProps<typeof Button>['variant'],
          className?: string,
          disabled?: boolean
        ) => (
          <div className="flex min-w-[120px] flex-col gap-3">
            <div className="text-xs font-medium text-muted-foreground">{stateLabel}</div>
          <Button variant={variant} className={className} disabled={disabled}>
            {item.name}
          </Button>
          </div>
        );

      const buildButtonRow = (
        label: string,
        variant: React.ComponentProps<typeof Button>['variant'],
        classes?: {
          hover?: string;
          focus?: string;
          pressed?: string;
        }
      ): ExportExample => ({
        label,
        span: 'full',
        content: (
          <div className="flex w-full flex-wrap gap-6">
            {renderButtonState('Default', variant)}
            {renderButtonState('Hover', variant, classes?.hover)}
            {renderButtonState('Focus', variant, classes?.focus ?? 'ring-2 ring-ring ring-offset-2')}
            {renderButtonState('Pressed', variant, classes?.pressed)}
            {renderButtonState('Disabled', variant, undefined, true)}
          </div>
        ),
      });

      return [
        buildButtonRow('Primary', 'default', {
          hover: 'bg-primary/90',
          pressed: 'bg-primary/80',
        }),
        buildButtonRow('Secondary', 'secondary', {
          hover: 'bg-secondary/80',
          pressed: 'bg-secondary/70',
        }),
        buildButtonRow('Muted', 'muted', {
          hover: 'bg-muted/80 text-muted-foreground',
          pressed: 'bg-muted/70 text-muted-foreground',
        }),
        buildButtonRow('Outline', 'outline', {
          hover: 'bg-accent text-accent-foreground',
          pressed: 'bg-accent/80 text-accent-foreground',
        }),
        buildButtonRow('Ghost', 'ghost', {
          hover: 'bg-accent text-accent-foreground',
          pressed: 'bg-accent/80 text-accent-foreground',
        }),
      ];
    }

    if (item.id === 'ui-input') {
      return [
        { label: 'Input / Default', content: <Input className="w-56" placeholder="Project name" /> },
        { label: 'Input / Hover', content: <Input className="w-56 bg-muted/60" placeholder="Project name" /> },
        {
          label: 'Input / Focus',
          content: (
            <Input
              className="w-56 bg-muted/60 ring-2 ring-ring ring-offset-2"
              value="Project Atlas"
              readOnly
            />
          ),
        },
        { label: 'Input / Disabled', content: <Input className="w-56" value="Disabled" disabled readOnly /> },
        {
          label: 'Search / Default',
          content: (
            <SearchInput
              className="w-56"
              value=""
              onValueChange={() => {}}
              placeholder="Search components"
            />
          ),
        },
        {
          label: 'Search / Focus',
          content: (
            <SearchInput
              className="w-56 [&_input]:bg-muted/60 [&_input]:ring-2 [&_input]:ring-ring [&_input]:ring-offset-2"
              value="Dialog"
              onValueChange={() => {}}
              placeholder="Search components"
            />
          ),
        },
        {
          label: 'Search / Filled',
          content: (
            <SearchInput
              className="w-56"
              value="Dialog"
              onValueChange={() => {}}
              placeholder="Search components"
            />
          ),
        },
      ];
    }

    if (item.id === 'ui-search-input') {
      return [
        {
          label: 'Default',
          content: (
            <SearchInput
              className="w-56"
              value=""
              onValueChange={() => {}}
              placeholder="Search components"
            />
          ),
        },
        {
          label: 'Hover',
          content: (
            <SearchInput
              className="w-56 [&_input]:bg-muted/60"
              value=""
              onValueChange={() => {}}
              placeholder="Search components"
            />
          ),
        },
        {
          label: 'Focus',
          content: (
            <SearchInput
              className="w-56 [&_input]:bg-muted/60 [&_input]:ring-2 [&_input]:ring-ring [&_input]:ring-offset-2"
              value="Dialog"
              onValueChange={() => {}}
              placeholder="Search components"
            />
          ),
        },
      ];
    }

    if (item.id === 'ui-dialog') {
      return [
        {
          label: 'Open dialog',
          span: 'wide',
          content: (
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
              <div className="space-y-1.5">
                <div className="text-lg font-semibold text-foreground">Share update</div>
                <p className="text-sm text-muted-foreground">Invite teammates to review this draft.</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Input placeholder="name@company.com" />
                <Button size="sm">Send</Button>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">Close</Button>
              </div>
            </div>
          ),
        },
      ];
    }

    if (item.id === 'ui-sheet') {
      return [
        {
          label: 'Open sheet',
          span: 'wide',
          content: (
            <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-lg">
              <div className="space-y-2">
                <div className="text-lg font-semibold text-foreground">Preferences</div>
                <p className="text-sm text-muted-foreground">Update notification settings and defaults.</p>
              </div>
            </div>
          ),
        },
      ];
    }

    if (item.id === 'ui-popover') {
      return [
        {
          label: 'Trigger + popover',
          span: 'wide',
          content: (
            <div className="flex flex-wrap items-start gap-4">
              <Button variant="outline">Quick info</Button>
              <div className="w-56 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md">
                <div className="text-sm font-medium text-foreground">Release checklist</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Validate API keys, run smoke tests, and confirm approvals.
                </p>
              </div>
            </div>
          ),
        },
      ];
    }

    if (item.id === 'ui-dropdown-menu') {
      return [
        {
          label: 'Trigger + menu',
          span: 'wide',
          content: (
            <div className="flex flex-wrap items-start gap-4">
              <Button variant="outline">More actions</Button>
              <div className="w-56 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
                <div className="rounded-sm px-2 py-1.5 text-sm text-foreground">Duplicate</div>
                <div className="rounded-sm px-2 py-1.5 text-sm text-foreground">Move to folder</div>
                <div className="rounded-sm px-2 py-1.5 text-sm text-foreground">Archive</div>
              </div>
            </div>
          ),
        },
      ];
    }

    if (item.id === 'ui-llm-profile-menu') {
      return [
        {
          label: 'Open menu',
          span: 'wide',
          content: (
            <div className="flex flex-wrap items-start gap-4">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label="Open actions for Model 1"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              <div className="w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                  Edit
                </div>
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  Set as default
                </div>
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </div>
              </div>
            </div>
          ),
        },
      ];
    }

    if (item.id === 'common-invite-team') {
      return [
        {
          label: 'Open modal',
          span: 'wide',
          content: (
            <div className="w-[512px] max-w-full rounded-xl border border-stone-700 bg-stone-900 p-8 shadow-xl">
              <div className="text-2xl font-normal text-stone-200">Invite Team Members</div>
              <p className="mt-2 text-sm text-stone-400">
                Invite team members to your organization by entering their email addresses below.
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-1 text-xs text-stone-400">Organization</div>
                  <div className="rounded bg-stone-800 p-2 text-stone-200">Acme Inc.</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-stone-400">Email Addresses</div>
                  <div className="min-h-[44px] rounded bg-stone-800 p-2 text-stone-400">Enter email and press Enter</div>
                </div>
                <button className="w-full rounded bg-yellow-500 py-2 text-lg font-normal text-stone-900">
                  Send Invites
                </button>
              </div>
            </div>
          ),
        },
      ];
    }

    if (item.id === 'common-share-preview') {
      return [
        {
          label: 'Open modal',
          span: 'wide',
          content: (
            <div className="w-[448px] max-w-full rounded-xl border border-stone-700 bg-stone-900 p-8 shadow-xl">
              <div className="text-2xl font-normal text-stone-200">Share Preview</div>
              <p className="mt-2 text-sm text-stone-400">Share this preview with your team or on social platforms.</p>
              <div className="mt-4">
                <div className="mb-1 text-xs text-stone-400">Share Link</div>
                <div className="rounded bg-stone-800 px-3 py-2 text-sm text-stone-200">
                  https://preview.openhands.dev/demo
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                {['Slack', 'GitHub', 'Email', 'WhatsApp', 'X', 'Facebook'].map((name) => (
                  <div key={name} className="rounded-full bg-stone-700 px-4 py-2 text-xs text-stone-200">
                    {name}
                  </div>
                ))}
              </div>
            </div>
          ),
        },
      ];
    }

    if (item.id === 'canvas-canvas-error-modal') {
      return [
        {
          label: 'Error modal',
          span: 'wide',
          content: (
            <div className="w-[512px] max-w-full rounded-xl border border-stone-700 bg-stone-900 p-6 shadow-xl">
              <div className="text-lg font-semibold text-foreground">Canvas error</div>
              <p className="mt-2 text-sm text-muted-foreground">
                The preview runtime hit an unexpected error. Open the console to inspect the failure.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm">Open console</Button>
                <Button size="sm">Dismiss</Button>
              </div>
            </div>
          ),
        },
      ];
    }

    if (item.id === 'common-enterprise-cta-card') {
      return [
        {
          label: 'Default',
          content: (
            <div className="w-[320px] max-w-full">
              <EnterpriseCtaCard staticLayout onDismiss={() => {}} />
            </div>
          ),
        },
        {
          label: 'With icon',
          content: (
            <div className="w-[320px] max-w-full">
              <EnterpriseCtaCard staticLayout showIcon onDismiss={() => {}} />
            </div>
          ),
        },
      ];
    }

    const previewNodes = item.preview ? Children.toArray(item.preview) : [];
    if (previewNodes.length === 0) {
      return [
        {
          label: 'Default',
          content: (
            <div className="text-sm text-muted-foreground">
              Preview coming soon. File: {item.path}
            </div>
          ),
          span: 'wide',
        },
      ];
    }

    return previewNodes.map((node, index) => {
      const extractedLabel = extractNodeText(node);
      const label =
        extractedLabel.length > 0
          ? extractedLabel.slice(0, 48)
          : previewNodes.length === 1
            ? 'Default'
            : `Example ${index + 1}`;

      return {
        label,
        content: node,
        span: previewNodes.length === 1 ? 'wide' : 'default',
      };
    });
  };

  const exportExamples = useMemo<ExportExample[]>(() => {
    if (!selectedItem) {
      return [];
    }

    return buildExportExamples(selectedItem);
  }, [selectedItem]);

  const aggregateExportSections = useMemo(
    () =>
      componentSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => item.preview || item.id === 'ui-search-input'),
        }))
        .filter((section) => section.items.length > 0),
    [componentSections]
  );

  if (isFigmaExport) {
    if (!exportItemId) {
      return (
        <div className="h-full overflow-y-auto bg-background px-8 py-10 text-foreground scrollbar-on-hover">
          <div className="mx-auto max-w-6xl space-y-8">
            <header className="space-y-3 rounded-2xl border border-border bg-card px-8 py-8">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Figma Export Routes
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold">Component Export Index</h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  Each route below renders one component family on a clean canvas so HTML-to-Figma capture produces
                  isolated, editable frames instead of mixed product screens.
                </p>
              </div>
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                Capture any entry with <span className="font-mono text-foreground">?captureRoute=figma/&lt;component-id&gt;</span>
                {' '}while keeping the Figma capture hash intact.
              </div>
              <a
                href="#/figma/all-components"
                className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
              >
                Open All Components Page
              </a>
            </header>

            <div className="grid gap-6">
              {allComponentSections.map((section) => (
                <section key={section.id} className="rounded-2xl border border-border bg-card px-6 py-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">{section.title}</h2>
                    <p className="text-sm text-muted-foreground">{section.items.length} export routes.</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {section.items.map((item) => (
                      <a
                        key={item.id}
                        href={`#/figma/${item.id}`}
                        className="rounded-xl border border-border bg-background px-4 py-4 transition-colors hover:border-primary/60 hover:bg-muted/30"
                      >
                        <div className="text-sm font-semibold text-foreground">{item.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{item.description ?? item.path}</div>
                        <div className="mt-3 text-[11px] font-mono text-muted-foreground">#/figma/{item.id}</div>
                      </a>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (exportItemId === 'all-components') {
      return (
        <div className="h-full overflow-y-auto bg-background px-8 py-10 text-foreground scrollbar-on-hover">
          <div className="mx-auto max-w-7xl space-y-10">
            <header className="space-y-4 px-8 py-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold">All Components</h1>
                  <p className="max-w-3xl text-sm text-muted-foreground">
                    One long export surface with the curated component set and visible states where available.
                  </p>
                </div>
                <div className="space-y-2 text-right text-xs text-muted-foreground">
                  <div className="font-mono">#/figma/all-components</div>
                </div>
              </div>
            </header>

            {aggregateExportSections.map((section) => (
              <section key={section.id} className="space-y-6 px-8 py-2">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.items.length} components</p>
                </div>

                <div className="space-y-10">
                  {section.items.map((item) => {
                    const itemExamples = buildExportExamples(item);

                    return (
                      <article key={item.id} className="space-y-5 border-t border-border/60 pt-6 first:border-t-0 first:pt-0">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                            <p className="max-w-3xl text-sm text-muted-foreground">
                              {item.description ?? item.path}
                            </p>
                          </div>
                          <div className="space-y-1 text-right text-xs text-muted-foreground">
                            <div className="font-mono text-foreground">{item.path}</div>
                            <div className="font-mono">#/figma/{item.id}</div>
                          </div>
                        </div>

                        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                          {itemExamples.map((example, index) => (
                            <div
                              key={`${item.id}-aggregate-example-${index}`}
                              className={
                                example.span === 'full'
                                  ? 'md:col-span-2 xl:col-span-3'
                                  : example.span === 'wide'
                                    ? 'md:col-span-2'
                                    : ''
                              }
                            >
                              <div className="mb-3 text-xs font-medium text-muted-foreground">
                                {example.label}
                              </div>
                              <div className="flex min-h-[72px] flex-wrap items-start gap-4">
                                {example.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      );
    }

    if (!selectedItem) {
      return (
        <div className="flex h-full overflow-y-auto items-center justify-center bg-background px-6 text-center text-foreground scrollbar-on-hover">
          <div className="max-w-md rounded-2xl border border-border bg-card px-8 py-8">
            <h1 className="text-xl font-semibold">Component not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No export page is registered for <span className="font-mono text-foreground">{exportItemId}</span>.
            </p>
            <a
              href="#/figma"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
            >
              Back to export index
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto bg-background px-8 py-10 text-foreground scrollbar-on-hover">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="space-y-4 px-8 py-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold">{selectedItem.name}</h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  {selectedItem.description ?? 'Isolated component capture page for Figma migration.'}
                </p>
              </div>
              <div className="space-y-2 text-right text-xs text-muted-foreground">
                <div className="font-mono text-foreground">{selectedItem.path}</div>
                <div className="font-mono">#/figma/{selectedItem.id}</div>
              </div>
            </div>
          </header>

          <section className="px-8 py-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">{selectedItem.name} canvas</h2>
            </div>
            <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
              {exportExamples.map((example, index) => (
                <div
                  key={`${selectedItem.id}-example-${index}`}
                  className={
                    example.span === 'full'
                      ? 'md:col-span-2 xl:col-span-3'
                      : example.span === 'wide'
                        ? 'md:col-span-2'
                        : ''
                  }
                >
                  <div className="mb-3 text-xs font-medium text-muted-foreground">
                    {example.label}
                  </div>
                  <div className="flex min-h-[72px] flex-wrap items-start gap-4">
                    {example.content}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-w-0 bg-background">
      <aside className="hidden w-72 flex-shrink-0 min-h-0 border-r border-border bg-card/50 px-6 py-6 lg:flex lg:flex-col">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Component Library
        </div>
        <button
          type="button"
          onClick={() => handleScrollTo('component-library-top')}
          className="mt-3 w-full text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          Overview
        </button>
        <nav
          className="mt-6 flex-1 space-y-5 overflow-y-auto pr-2 scrollbar-on-hover"
          aria-label="Component library navigation"
        >
          {allComponentSections.map((section) => (
            <div key={section.id}>
              <button
                type="button"
                onClick={() => handleScrollTo(`section-${section.id}`)}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                {section.title}
              </button>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleScrollTo(item.id)}
                    className="block w-full truncate text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        <header id="component-library-top" className="border-b border-border bg-card px-8 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Component Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick reference for UI building blocks and feature-level components.
          </p>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth p-8 scrollbar-on-hover">
          <div className="min-h-full pb-12">
            {allComponentSections.map((section) => (
              <div key={section.id} id={`section-${section.id}`} className="mb-10 scroll-mt-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {section.items.length} components in this section.
                </p>
              </div>
              <div className="grid gap-5">
                {section.items.map((item) => (
                  <div key={item.id} id={item.id} className="scroll-mt-6">
                    <ComponentCard
                      title={item.name}
                      description={item.description ?? 'Component reference entry.'}
                      usage={item.usage ?? item.path}
                    >
                      {item.preview ? (
                        item.preview
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          Preview coming soon. File: {item.path}
                        </div>
                      )}
                    </ComponentCard>
                  </div>
                ))}
              </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
