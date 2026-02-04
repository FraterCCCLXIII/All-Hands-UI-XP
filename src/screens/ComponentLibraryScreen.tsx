import { useState } from 'react';
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

export function ComponentLibraryScreen() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [statusIndicatorStatus, setStatusIndicatorStatus] = useState<'active' | 'stopped' | 'thinking'>('active');
  const [serverStatus, setServerStatus] = useState<ServerStatusType>('active');
  const [showInviteTeam, setShowInviteTeam] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [isInspectorEnabled, setIsInspectorEnabled] = useState(false);
  const [chatWindowTab, setChatWindowTab] = useState<ChatWindowTabId>('preview');
  const [messagePanelStatus, setMessagePanelStatus] = useState<'active' | 'stopped' | 'thinking' | 'connecting'>('active');
  const [drawerTab, setDrawerTab] = useState<DrawerTab['id']>('tasks');
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [canvasView, setCanvasView] = useState<'changes' | 'code' | 'terminal' | 'browser' | 'preview'>('preview');
  const [canvasContentType, setCanvasContentType] = useState<CanvasContentType>('preview');
  const [showCanvasError, setShowCanvasError] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(180);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [dashboardTab, setDashboardTab] = useState<DashboardTabId>('kanban');
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
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
                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                  Open dialog
                </Button>
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
              <Popover>
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
              <DropdownMenu>
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
                <SheetTrigger asChild>
                  <Button variant="outline">Open sheet</Button>
                </SheetTrigger>
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
                <Button variant="outline" onClick={() => setShowInviteTeam(true)}>
                  Open invite modal
                </Button>
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
                <Button variant="outline" onClick={() => setShowSharePreview(true)}>
                  Open share modal
                </Button>
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
                <Button variant="outline" onClick={() => setShowUserSettings(true)}>
                  Open user settings
                </Button>
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
                {!showWelcome ? (
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
                <Button variant="outline" onClick={() => setDrawerOpen(true)}>
                  Open conversation drawer
                </Button>
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
                <Button variant="outline" onClick={() => setShowCanvasError(true)}>
                  Trigger error modal
                </Button>
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
            usage: `<Protip getThemeClasses={...} />`,
            preview: <Protip getThemeClasses={previewThemeClasses} />,
          },
          {
            id: 'canvas-terminal-drawer',
            name: 'TerminalDrawer',
            path: 'components/canvas/TerminalDrawer.tsx',
            description: 'Resizable terminal drawer.',
            usage: `<TerminalDrawer isVisible height={200} />`,
            preview: (
              <div className="w-full rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <Button variant="outline" onClick={() => setTerminalVisible(true)}>
                    Open terminal
                  </Button>
                </div>
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
                <Button variant="outline" onClick={() => setAgentPanelOpen(true)}>
                  Open agent panel
                </Button>
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

  const handleScrollTo = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
          {componentSections.map((section) => (
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
            {componentSections.map((section) => (
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
