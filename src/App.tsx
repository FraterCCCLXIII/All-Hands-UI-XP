import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatArea } from './components/chat/ChatArea';
import { ConversationDrawer } from './components/chat/ConversationDrawer';
import { Canvas } from './components/canvas/Canvas';
import { TopBar } from './components/navigation/TopBar';
import { LeftNav } from './components/navigation/LeftNav';
import { Message } from './types/message';
import { Theme, ThemeElement, ThemeClassMap } from './types/theme';
import {
  DashboardScreen,
  LoadingScreen,
  SkillsScreen,
  LoginScreen,
  ActiveChatScreen,
  ComponentLibraryScreen,
  NewComponentsScreen,
  NewLlmSwitcherScreen,
  NewLlmSwitcherScreen2,
  SaasCreditCardFlow,
} from './screens';
import { SettingsScreen } from './screens/SettingsScreen';
import SharePreview from './components/common/SharePreview';
import { Gripper } from './components/common/Gripper';
import { InspectorOverlay } from './components/common/InspectorOverlay';
import { conversationSummaries } from './data/conversations';
import { ChatWindowTabId } from './components/chat/ChatWindowTabs';

const themeClasses: ThemeClassMap = {
  dark: {
    text: 'text-stone-200',
    bg: 'bg-sidebar',
    border: 'border-stone-700',
    'input-bg': 'bg-stone-800',
    'placeholder-text': 'placeholder-stone-500',
    'button-bg': 'bg-white',
    'button-text': 'text-black',
    'user-message-bg': 'bg-stone-700',
    'user-message-text': 'text-stone-200',
    'ai-message-bg': 'bg-stone-800',
    'ai-message-text': 'text-stone-200',
    'status-dot-running': 'bg-green-500',
    'status-dot-stopped': 'bg-red-500',
    'status-text': 'text-stone-400',
    'stop-button-bg': 'bg-red-500',
    'canvas-bg': 'bg-stone-900',
    'panel-bg': 'bg-stone-800',
    'active-button-bg': 'bg-stone-600',
    'active-button-text': 'text-white',
    'pill-button-bg': 'bg-stone-700',
    'pill-button-text': 'text-stone-200',
    'icon-color': 'text-stone-400',
    'hover-icon-color': 'hover:text-yellow-400',
    'hover-resizer-bg': 'hover:bg-yellow-500',
    'stop-button-bg-subtle': 'bg-stone-700',
    'stop-button-text': 'text-stone-200',
    'button-hover': 'hover:bg-stone-600',
    'task-item-bg': 'bg-stone-600',
    'scrollbar': 'scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-stone-800',
    'success-text': 'text-emerald-400',
    'error-text': 'text-rose-400',
  },
  light: {
    text: 'text-stone-800',
    bg: 'bg-sidebar',
    border: 'border-stone-300',
    'input-bg': 'bg-white',
    'placeholder-text': 'placeholder-stone-400',
    'button-bg': 'bg-stone-200',
    'button-text': 'text-stone-800',
    'user-message-bg': 'bg-stone-200',
    'user-message-text': 'text-stone-800',
    'ai-message-bg': 'bg-white',
    'ai-message-text': 'text-stone-800',
    'status-dot-running': 'bg-green-500',
    'status-dot-stopped': 'bg-red-500',
    'status-text': 'text-stone-600',
    'stop-button-bg': 'bg-red-500',
    'canvas-bg': 'bg-stone-100',
    'panel-bg': 'bg-white',
    'active-button-bg': 'bg-stone-400',
    'active-button-text': 'text-stone-900',
    'pill-button-bg': 'bg-stone-200',
    'pill-button-text': 'text-stone-800',
    'icon-color': 'text-stone-600',
    'hover-icon-color': 'hover:text-amber-600',
    'hover-resizer-bg': 'hover:bg-amber-200',
    'stop-button-bg-subtle': 'bg-stone-300',
    'stop-button-text': 'text-stone-800',
    'button-hover': 'hover:bg-stone-300',
    'task-item-bg': 'bg-stone-300',
    'scrollbar': 'scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100',
    'success-text': 'text-emerald-600',
    'error-text': 'text-rose-600',
  },
  sepia: {
    text: 'text-[rgb(100,80,60)]',
    bg: 'bg-sidebar',
    border: 'border-[rgb(215,205,190)]',
    'input-bg': 'bg-[rgb(245,235,220)]',
    'placeholder-text': 'placeholder-[rgb(180,160,140)]',
    'button-bg': 'bg-[rgb(225,215,200)]',
    'button-text': 'text-[rgb(100,80,60)]',
    'user-message-bg': 'bg-[rgb(225,215,200)]',
    'user-message-text': 'text-[rgb(100,80,60)]',
    'ai-message-bg': 'bg-[rgb(245,235,220)]',
    'ai-message-text': 'text-[rgb(100,80,60)]',
    'status-dot-running': 'bg-[rgb(120,180,120)]',
    'status-dot-stopped': 'bg-[rgb(180,120,120)]',
    'status-text': 'text-[rgb(140,120,100)]',
    'stop-button-bg': 'bg-[rgb(180,120,120)]',
    'canvas-bg': 'bg-[rgb(235,225,210)]',
    'panel-bg': 'bg-[rgb(245,235,220)]',
    'active-button-bg': 'bg-[rgb(200,190,175)]',
    'active-button-text': 'text-[rgb(100,80,60)]',
    'pill-button-bg': 'bg-[rgb(215,205,190)]',
    'pill-button-text': 'text-[rgb(100,80,60)]',
    'icon-color': 'text-[rgb(140,120,100)]',
    'hover-icon-color': 'hover:text-[rgb(160,140,120)]',
    'hover-resizer-bg': 'hover:bg-[rgb(200,190,175)]',
    'stop-button-bg-subtle': 'bg-[rgb(200,190,175)]',
    'stop-button-text': 'text-[rgb(100,80,60)]',
    'button-hover': 'hover:bg-[rgb(215,205,190)]',
    'task-item-bg': 'bg-[rgb(215,205,190)]',
    'scrollbar': 'scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-100',
    'success-text': 'text-[rgb(120,180,120)]',
    'error-text': 'text-[rgb(180,120,120)]',
  },
};

const actionSlugs: Record<string, string> = {
  code: 'chat',
  dashboard: 'dashboard',
  skills: 'skills',
  components: 'components',
  'new-components': 'new-components',
  'new-llm-switcher': 'new-llm-switcher',
  'new-llm-switcher-2': 'new-llm-switcher-2',
  conversations: 'conversations',
  settings: 'settings',
};

const slugToAction = Object.fromEntries(Object.entries(actionSlugs).map(([action, slug]) => [slug, action]));

function App() {
  const [theme] = useState<Theme>('dark');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<'active' | 'stopped' | 'thinking' | 'connecting'>('active');
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [canvasContentType, setCanvasContentType] = useState<'preview' | 'code' | 'docs' | 'share' | 'run'>('preview');
  const [showRefreshNotification, setShowRefreshNotification] = useState(false);
  const [showCanvasTip, setShowCanvasTip] = useState(false);
  const [showCanvasLoading, setShowCanvasLoading] = useState(true);
  const [chatContentMode, setChatContentMode] = useState<'skeleton' | 'conversation' | 'start'>('conversation');
  const [repositoryStatus, setRepositoryStatus] = useState<'connected' | 'disconnected' | 'connect'>('connected');
  const [showStatusBadge, setShowStatusBadge] = useState(false);
  const [projectTitle, setProjectTitle] = useState('My Project');
  const [activeNavItem, setActiveNavItem] = useState('code');
  const [isRunning, setIsRunning] = useState(false);
  const [isWelcomeScreenActive, setIsWelcomeScreenActive] = useState(true);
  const [isLeftNavExpanded, setIsLeftNavExpanded] = useState(false);
  const [isConversationDrawerOpen, setIsConversationDrawerOpen] = useState(false);
  const [activeChatWindowTab, setActiveChatWindowTab] = useState<ChatWindowTabId>('preview');
  const [lastNonDrawerNavItem, setLastNonDrawerNavItem] = useState('code');
  const [isEnterpriseCtaVisible, setIsEnterpriseCtaVisible] = useState(true);
  // Canvas resizing state
  const [canvasWidth, setCanvasWidth] = useState(50); // Default to 50% width
  const minCanvasWidth = 30; // Minimum 30% width
  const maxCanvasWidth = 70; // Maximum 70% width
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [activeFlowPrototype, setActiveFlowPrototype] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<string | null>(null);
  const [isActiveChatView, setIsActiveChatView] = useState(false);
  const [isInspectorEnabled, setIsInspectorEnabled] = useState(false);
  const [showClaimCreditsPrompt, setShowClaimCreditsPrompt] = useState(false);
  const isDashboardView = activeNavItem === 'dashboard';
  const isSkillsView = activeNavItem === 'skills';
  const isSettingsView = activeNavItem === 'settings';
  const isComponentsView = activeNavItem === 'components';
  const isNewComponentsView = activeNavItem === 'new-components';
  const isNewLlmSwitcherView = activeNavItem === 'new-llm-switcher';
  const isNewLlmSwitcherView2 = activeNavItem === 'new-llm-switcher-2';
  const showChatView = !isDashboardView && !isSkillsView && !isSettingsView && !isComponentsView && !isNewComponentsView && !isNewLlmSwitcherView && !isNewLlmSwitcherView2;

  const getThemeClasses = useCallback((element: ThemeElement): string => {
    return themeClasses[theme][element] || '';
  }, [theme]);

  const handleLoadingComplete = useCallback(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show loading screen for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    const userMessage: Message = {
      role: 'user',
      text: message,
      type: 'user',
      status: 'completed',
    };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const aiMessage: Message = {
        role: 'ai',
        text: 'This is a simulated AI response.',
        type: 'code',
        status: 'completed',
        headerText: 'AI Assistant',
        actions: [
          { label: 'Accept', action: 'accept' },
          { label: 'Reject', action: 'reject' },
        ],
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  }, []);

  const handleCanvasToggle = useCallback(() => {
    setCanvasVisible(prev => !prev);
  }, []);

  const handleShare = useCallback(() => {
    setCanvasContentType('share');
    setCanvasVisible(true);
    setShowSharePreview(true);
  }, []);

  const handleChatWindowTabChange = useCallback((tabId: ChatWindowTabId) => {
    setActiveChatWindowTab(tabId);
    setCanvasContentType(tabId);
    setCanvasVisible(true);
  }, []);

  const handleRun = useCallback(() => {
    setIsRunning(prev => !prev);
    setCanvasContentType('run');
    setCanvasVisible(true);
    if (!isRunning) {
      const runMessage: Message = {
        role: 'ai',
        text: 'Starting the application...',
        type: 'build',
        status: 'in_progress',
      };
      setMessages(prev => [...prev, runMessage]);
    } else {
      const stopMessage: Message = {
        role: 'ai',
        text: 'Stopping the application...',
        type: 'build',
        status: 'completed',
      };
      setMessages(prev => [...prev, stopMessage]);
    }
  }, [isRunning]);

  const handleConversationDrawerChange = useCallback(
    (open: boolean) => {
      setIsConversationDrawerOpen(open);
      window.location.hash = open ? actionSlugs.conversations : actionSlugs[lastNonDrawerNavItem] ?? actionSlugs.code;
    },
    [lastNonDrawerNavItem]
  );

  const handleNavItemClick = useCallback(
    (action: string) => {
      setActiveFlowPrototype(null);
      if (action === 'conversations') {
        setIsConversationDrawerOpen((prev) => {
          const next = !prev;
          window.location.hash = next ? actionSlugs.conversations : actionSlugs[lastNonDrawerNavItem] ?? actionSlugs.code;
          return next;
        });
        return;
      }

      setActiveNavItem(action);
      setLastNonDrawerNavItem(action);
      setIsConversationDrawerOpen(false);
      window.location.hash = action === 'settings' ? '#/settings' : (actionSlugs[action] ?? actionSlugs.code);
      if (action === 'tetris') {
      const tetrisMessage: Message = {
        role: 'ai',
        text: 'Starting Tetris game...',
        type: 'tetris_game',
        status: 'completed',
      };
      setMessages((prev) => [...prev, tetrisMessage]);
    }
  }, []);

  const handleFlowPrototypeClick = useCallback((flowId: string) => {
    setActiveFlowPrototype(flowId);
    if (flowId === 'new-user-experience') {
      window.location.hash = '#/new-user-experience';
      return;
    }
    if (flowId === 'saas-credit-card') {
      window.location.hash = '#/saas-credit-card';
    }
  }, []);

  const handleExitFlowPrototype = useCallback(() => {
    setActiveFlowPrototype(null);
    window.location.hash = actionSlugs[lastNonDrawerNavItem] ?? actionSlugs.code;
  }, [lastNonDrawerNavItem]);

  const handleClaimCreditsSkip = useCallback(() => {
    setShowClaimCreditsPrompt(true);
    handleExitFlowPrototype();
  }, [handleExitFlowPrototype]);

  const handleClaimCreditsComplete = useCallback(() => {
    setShowClaimCreditsPrompt(false);
    handleExitFlowPrototype();
  }, [handleExitFlowPrototype]);

  const handleClaimCreditsOpen = useCallback(() => {
    setShowClaimCreditsPrompt(false);
    setActiveFlowPrototype('saas-credit-card');
    window.location.hash = '#/saas-credit-card';
  }, []);


  const handleCanvasResize = useCallback((percentage: number) => {
    setCanvasWidth(Math.min(Math.max(percentage, minCanvasWidth), maxCanvasWidth));
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash === 'new-user-experience') {
        setActiveFlowPrototype('new-user-experience');
        setIsActiveChatView(false);
        return;
      }
      if (hash === 'saas-credit-card') {
        setActiveFlowPrototype('saas-credit-card');
        setIsActiveChatView(false);
        return;
      }
      setActiveFlowPrototype(null);
      if (hash === 'chat-active') {
        setIsActiveChatView(true);
        setActiveNavItem('code');
        setLastNonDrawerNavItem('code');
        setIsConversationDrawerOpen(false);
        setSettingsTab(null);
        return;
      }
      setIsActiveChatView(false);
      if (hash === 'settings' || hash.startsWith('settings/')) {
        setActiveNavItem('settings');
        setLastNonDrawerNavItem('settings');
        setIsConversationDrawerOpen(false);
        setSettingsTab(hash === 'settings' ? null : hash.split('/')[1] ?? null);
        return;
      }
      setSettingsTab(null);
      const action = slugToAction[hash] ?? 'code';
      if (action === 'conversations') {
        setIsConversationDrawerOpen(true);
      } else {
        setActiveNavItem(action);
        setLastNonDrawerNavItem(action);
        setIsConversationDrawerOpen(false);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);


  return (
    <div className={`h-screen flex flex-col ${getThemeClasses('bg')} ${getThemeClasses('text')}`}>
      <AnimatePresence>
        {isLoading ? (
          <LoadingScreen theme={theme} getThemeClasses={getThemeClasses} onLoadingComplete={handleLoadingComplete} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex relative overflow-hidden"
          >
            {!activeFlowPrototype && (
              <LeftNav
                theme={theme}
                getThemeClasses={getThemeClasses}
                isExpanded={isLeftNavExpanded}
                onExpandChange={setIsLeftNavExpanded}
                onNavItemClick={handleNavItemClick}
                onFlowPrototypeClick={handleFlowPrototypeClick}
                activeNavItem={activeNavItem}
                isConversationDrawerOpen={isConversationDrawerOpen}
                isInspectorEnabled={isInspectorEnabled}
                onInspectorToggle={() => setIsInspectorEnabled((prev) => !prev)}
              />
            )}
            <div 
              className={`flex-1 flex flex-col transition-all duration-200 ${activeFlowPrototype ? '' : 'ml-16'}`}
              style={{ minWidth: 0 }}
            >
              <InspectorOverlay
                enabled={isInspectorEnabled}
                onRequestDisable={() => setIsInspectorEnabled(false)}
              />
              {activeFlowPrototype === 'new-user-experience' ? (
                <LoginScreen onBack={handleExitFlowPrototype} />
              ) : activeFlowPrototype === 'saas-credit-card' ? (
                <SaasCreditCardFlow onSkip={handleClaimCreditsSkip} onComplete={handleClaimCreditsComplete} />
              ) : (
                <>
              {showChatView && !isWelcomeScreenActive && !isActiveChatView && (
                    <TopBar
                  theme={theme}
                  getThemeClasses={getThemeClasses}
                  projectTitle={projectTitle}
                  onProjectTitleChange={setProjectTitle}
                  serverStatus={serverStatus}
                  onServerStatusChange={setServerStatus}
                  onShare={handleShare}
                  onRun={handleRun}
                  isRunning={isRunning}
                  isCanvasVisible={canvasVisible}
                  onCanvasToggle={handleCanvasToggle}
                  activeChatWindowTab={activeChatWindowTab}
                  onChatWindowTabChange={handleChatWindowTabChange}
                />
              )}
              <div className="flex-1 flex min-h-0">
                {isActiveChatView && (
                  <div className="flex-1 flex min-w-0">
                    <ActiveChatScreen
                      theme={theme}
                      getThemeClasses={getThemeClasses}
                      showRefreshNotification={showRefreshNotification}
                      onToggleRefreshNotification={() => setShowRefreshNotification((prev) => !prev)}
                      showCanvasTip={showCanvasTip}
                      onToggleCanvasTip={() => setShowCanvasTip((prev) => !prev)}
                      showCanvasLoading={showCanvasLoading}
                      onToggleCanvasLoading={() => setShowCanvasLoading((prev) => !prev)}
                      chatContentMode={chatContentMode}
                      onChatContentModeChange={setChatContentMode}
                      repositoryStatus={repositoryStatus}
                      onRepositoryStatusChange={setRepositoryStatus}
                      showStatusBadge={showStatusBadge}
                      onToggleStatusBadge={() => setShowStatusBadge((prev) => !prev)}
                    />
                  </div>
                )}
                <AnimatePresence>
                  {!activeFlowPrototype && showClaimCreditsPrompt && (
                    <motion.div
                      className="fixed right-6 z-50"
                      style={{ bottom: isEnterpriseCtaVisible ? 'calc(1.5rem + 220px + 12px)' : '1.5rem' }}
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <div className="relative flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
                        <button
                          type="button"
                          onClick={() => setShowClaimCreditsPrompt(false)}
                          className="absolute right-0 top-0 inline-flex h-7 w-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow hover:text-foreground hover:bg-muted/60 transition-colors"
                          aria-label="Dismiss claim free credits"
                        >
                          ×
                        </button>
                        <span className="text-sm font-medium text-foreground">Claim Free Credits</span>
                        <button
                          type="button"
                          onClick={handleClaimCreditsOpen}
                          className="h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          Claim now
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {isDashboardView && <DashboardScreen />}
                {isSkillsView && <SkillsScreen />}
                {isComponentsView && <ComponentLibraryScreen />}
                {isNewComponentsView && <NewComponentsScreen />}
                {isNewLlmSwitcherView && <NewLlmSwitcherScreen />}
                {isNewLlmSwitcherView2 && <NewLlmSwitcherScreen2 />}
                {isSettingsView && (
                  <SettingsScreen
                    initialTab={settingsTab ?? undefined}
                    onTabChange={(tab) => {
                      window.location.hash = `#/settings/${tab}`;
                    }}
                  />
                )}
                {showChatView && !isActiveChatView && (
                  <div className="flex w-full h-full">
                    {/* Chat Area Column */}
                    <div
                      className={`h-full transition-all duration-400 ease-out relative${!canvasVisible ? ' flex justify-center mx-auto' : ''}`}
                      style={{
                        width: canvasVisible ? `calc(${100 - canvasWidth}% - 0.5rem)` : '100%',
                        minWidth: 0,
                        ...(canvasVisible ? { marginRight: '1rem' } : {}),
                        ...(canvasVisible ? {} : { maxWidth: '760px' }),
                      }}
                    >
                    <ChatArea
                        theme={theme}
                        getThemeClasses={getThemeClasses}
                        messages={messages}
                        serverStatus={serverStatus}
                        projectName={projectTitle}
                        branchName="main"
                        userName="User"
                        onSendMessage={handleSendMessage}
                        onServerStatusChange={setServerStatus}
                        onPush={handlePush}
                        onPull={handlePull}
                        onCreatePR={handleCreatePR}
                        onRepoSelect={handleRepoSelect}
                        onBranchSelect={handleBranchSelect}
                        onCreateNewRepo={handleCreateNewRepo}
                        onWelcomeScreenChange={setIsWelcomeScreenActive}
                        onEnterpriseCtaVisibilityChange={setIsEnterpriseCtaVisible}
                      activeChatWindowTab={activeChatWindowTab}
                      onChatWindowTabChange={handleChatWindowTabChange}
                      />
                      {canvasVisible && (
                        <div className="absolute right-0 top-0 bottom-0 z-10">
                          <Gripper
                            getThemeClasses={getThemeClasses}
                            onResize={handleCanvasResize}
                            initialWidth={canvasWidth}
                            minWidth={minCanvasWidth}
                            maxWidth={maxCanvasWidth}
                          />
                        </div>
                      )}
                    </div>
                    {canvasVisible && (
                      <div
                        className="h-full transition-all duration-400 ease-out flex flex-col mr-4"
                        style={{
                          width: `calc(${canvasWidth}% - 0.5rem)`,
                          minWidth: 0,
                        }}
                      >
                        <div className="flex-1 flex flex-col pb-4">
                          <Canvas
                            theme={theme}
                            getThemeClasses={getThemeClasses}
                            contentType={canvasContentType}
                            showTip={showCanvasTip}
                            onResize={handleCanvasResize}
                            initialWidth={canvasWidth}
                            minWidth={minCanvasWidth}
                            maxWidth={maxCanvasWidth}
                          />
                        </div>
                      </div>
                    )}
                    <ConversationDrawer
                      open={isConversationDrawerOpen}
                      onOpenChange={handleConversationDrawerChange}
                      conversations={conversationSummaries}
                    />
                  </div>
                )}
              </div>
              {showChatView && showSharePreview && (
                <SharePreview
                  shareUrl={window.location.href}
                  onClose={() => setShowSharePreview(false)}
                />
              )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const handlePush = () => {
  console.log('Push clicked');
};

const handlePull = () => {
  console.log('Pull clicked');
};

const handleCreatePR = () => {
  console.log('Create PR clicked');
};

const handleRepoSelect = (repo: string) => {
  console.log('Repo selected:', repo);
};

const handleBranchSelect = (branch: string) => {
  console.log('Branch selected:', branch);
};

const handleCreateNewRepo = () => {
  console.log('Create new repo clicked');
};

export default App; 