import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatArea } from './components/chat/ChatArea';
import { ConversationDrawer } from './components/chat/ConversationDrawer';
import { Canvas } from './components/canvas/Canvas';
import { TopBar } from './components/navigation/TopBar';
import { LeftNav } from './components/navigation/LeftNav';
import { Message } from './types/message';
import { Theme, ThemeElement } from './types/theme';
import {
  DashboardScreen,
  AutomationsScreen,
  LoadingScreen,
  ExtensionsScreen,
  LoginScreen,
  ActiveChatScreen,
  ComponentLibraryScreen,
  NewLlmSwitcherScreen,
  NewLlmSwitcherScreen2,
  SaasCreditCardFlow,
  EnterpriseLearnMoreScreen,
  SignInWithAdScreen,
  WorkflowsScreen,
  ClaimStatesScreen,
} from './screens';
import { SettingsScreen } from './screens/SettingsScreen';
import SharePreview from './components/common/SharePreview';
import { AppToaster } from './components/common/AppToaster';
import { Gripper } from './components/common/Gripper';
import { InspectorOverlay } from './components/common/InspectorOverlay';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import { conversationSummaries } from './data/conversations';
import { ChatWindowTabId } from './components/chat/ChatWindowTabs';
import type { ProtipVariant } from './components/canvas/Protip';
import { UxTourOverlay } from './features/ux-tours/UxTourOverlay';
import { useUxTourController } from './features/ux-tours/useUxTourController';
import { uxTourDefinitions, uxTourLinks } from './features/ux-tours/uxTourRegistry';
import type { UxTourAction } from './features/ux-tours/uxTourTypes';
import {
  APP_ROUTE_EVENT,
  isFigmaCaptureActive,
  navigateAppRoute,
  registerAppNavigate,
  routeToPath,
} from './lib/captureNavigation';
import { tryNormalizeExtensionsPath } from './lib/extensionsRoutes';
import { themeAppClassMap as themeClasses } from './theme/themeAppClassMap';

type CanvasTipVariant = 'none' | ProtipVariant;

const actionSlugs: Record<string, string> = {
  code: 'chat',
  'chat-cards': 'chat-cards',
  dashboard: 'dashboard',
  automations: 'automations',
  extensions: 'extensions/all',
  'new-llm-switcher': 'new-llm-switcher',
  'new-llm-switcher-2': 'new-llm-switcher-2',
  conversations: 'conversations',
  settings: 'settings',
  workflows: 'workflows',
  'claim-states': 'claim-states',
};

const slugToAction = Object.fromEntries(Object.entries(actionSlugs).map(([action, slug]) => [slug, action]));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme] = useState<Theme>('dark');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const isEmbed = searchParams.has('embed');
      if (isEmbed) {
        return false;
      }
      return sessionStorage.getItem('hasShownLoadingScreen') !== 'true';
    }
    return false;
  });
  const [serverStatus, setServerStatus] = useState<'active' | 'stopped' | 'thinking' | 'connecting'>('active');
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [canvasContentType, setCanvasContentType] = useState<'preview' | 'code' | 'docs' | 'share' | 'run'>('preview');
  const [showRefreshNotification, setShowRefreshNotification] = useState(false);
  const [canvasTipVariant, setCanvasTipVariant] = useState<CanvasTipVariant>('none');
  const [showCanvasLoading, setShowCanvasLoading] = useState(true);
  const [chatContentMode, setChatContentMode] = useState<'skeleton' | 'conversation' | 'start'>('conversation');
  const [repositoryStatus, setRepositoryStatus] = useState<'connected' | 'disconnected' | 'connect'>('connected');
  const [showStatusBadge, setShowStatusBadge] = useState(false);
  const [activeChatAutomationTitle, setActiveChatAutomationTitle] = useState<string | null>(null);
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
  const [installedPluginRepos, setInstalledPluginRepos] = useState<string[]>([]);
  const [drawerConversations, setDrawerConversations] = useState(conversationSummaries);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isActiveChatView, setIsActiveChatView] = useState(false);
  const [isInspectorEnabled, setIsInspectorEnabled] = useState(false);
  const [showClaimCreditsPrompt, setShowClaimCreditsPrompt] = useState(false);
  const [isUxFlowMenuOpen, setIsUxFlowMenuOpen] = useState(false);
  const [enterpriseRequestSubmitted, setEnterpriseRequestSubmitted] = useState(false);
  const [figmaExportRoute, setFigmaExportRoute] = useState<string | null>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('personal');

  useEffect(() => {
    registerAppNavigate(navigate);
  }, [navigate]);

  const isEmbedded = new URLSearchParams(window.location.search).has('embed');
  const showCanvasTip = canvasTipVariant !== 'none';
  const isDashboardView = activeNavItem === 'dashboard';
  const isAutomationsView = activeNavItem === 'automations';
  const isExtensionsView = activeNavItem === 'extensions';
  const isSettingsView = activeNavItem === 'settings';
  const isNewLlmSwitcherView = activeNavItem === 'new-llm-switcher';
  const isNewLlmSwitcherView2 = activeNavItem === 'new-llm-switcher-2';
  const isWorkflowsView = activeNavItem === 'workflows';
  const isClaimStatesView = activeNavItem === 'claim-states';
  const showStandaloneFlow = Boolean(activeFlowPrototype);
  const showFigmaExportView = figmaExportRoute !== null;
  const isFigmaCaptureSession = isFigmaCaptureActive();
  const showMainApp = !showStandaloneFlow && !showFigmaExportView;
  const showChatView =
    !isDashboardView &&
    !isAutomationsView &&
    !isExtensionsView &&
    !isSettingsView &&
    !isNewLlmSwitcherView &&
    !isNewLlmSwitcherView2 &&
    !isWorkflowsView;
  const showLeftNav =
    !showFigmaExportView &&
    activeFlowPrototype !== 'new-user-experience' &&
    activeFlowPrototype !== 'enterprise-learn-more' &&
    activeFlowPrototype !== 'sign-in-with-ad';

  const getThemeClasses = useCallback((element: ThemeElement): string => {
    return themeClasses[theme][element] || '';
  }, [theme]);

  const handleLoadingComplete = useCallback(() => {
    setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem('hasShownLoadingScreen', 'true');
    }, 500);
  }, []);

  useEffect(() => {
    if (activeFlowPrototype || figmaExportRoute) {
      setIsLoading(false);
    }
  }, [activeFlowPrototype, figmaExportRoute]);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem('hasShownLoadingScreen', 'true');
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading]);

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
      if (!open) {
        setActiveConversationId(null);
      }
      navigateAppRoute(open ? actionSlugs.conversations : actionSlugs[lastNonDrawerNavItem] ?? actionSlugs.code);
    },
    [lastNonDrawerNavItem]
  );

  const handleAutomationRunNow = useCallback(
    (payload: { automationTitle: string; repository: string; branch: string; model: string }) => {
      const shortId = Math.random().toString(16).slice(2, 7);
      const conversationId = `automation-${Date.now()}`;
      const conversationName = `Automation ${shortId} · ${payload.automationTitle}`;
      setDrawerConversations((prev) => [
        {
          id: conversationId,
          name: conversationName,
          version: 'V1',
          tag: 'Automation',
          repo: payload.repository,
          branch: payload.branch,
          model: payload.model,
          time: 'just now',
        },
        ...prev,
      ]);
      setActiveConversationId(conversationId);
      setIsConversationDrawerOpen(true);
      navigateAppRoute(actionSlugs.conversations);
      return { conversationId, conversationName };
    },
    []
  );

  const handleOpenAutomationConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsConversationDrawerOpen(true);
    navigateAppRoute(actionSlugs.conversations);
  }, []);

  const handleNavItemClick = useCallback(
    (action: string) => {
      if (action === 'loading-screen') {
        setIsLoading(true);
        return;
      }
      setActiveFlowPrototype(null);
      if (action === 'new-user-experience') {
        setActiveFlowPrototype('new-user-experience');
        setIsConversationDrawerOpen(false);
        navigateAppRoute('/new-user-experience');
        return;
      }
      if (action === 'saas-credit-card') {
        setActiveFlowPrototype('saas-credit-card');
        setIsConversationDrawerOpen(false);
        navigateAppRoute('/saas-credit-card');
        return;
      }
      if (action === 'sign-in-with-ad') {
        setActiveFlowPrototype('sign-in-with-ad');
        setIsConversationDrawerOpen(false);
        navigateAppRoute('/sign-in-with-ad');
        return;
      }
      if (action === 'conversations') {
        const nextOpenState = !isConversationDrawerOpen;
        setIsConversationDrawerOpen(nextOpenState);
        navigateAppRoute(
          nextOpenState
            ? actionSlugs.conversations
            : actionSlugs[lastNonDrawerNavItem] ?? actionSlugs.code
        );
        return;
      }
      if (action === 'new-project') {
        setActiveFlowPrototype(null);
        setIsConversationDrawerOpen(false);
        setActiveNavItem('code');
        setLastNonDrawerNavItem('code');
        setIsWelcomeScreenActive(true);
        navigateAppRoute('/');
        return;
      }

      setActiveNavItem(action);
      setLastNonDrawerNavItem(action);
      setIsConversationDrawerOpen(false);
      navigateAppRoute(action === 'settings' ? '/settings' : (actionSlugs[action] ?? actionSlugs.code));
      if (action === 'tetris') {
      const tetrisMessage: Message = {
        role: 'ai',
        text: 'Starting Tetris game...',
        type: 'tetris_game',
        status: 'completed',
      };
      setMessages((prev) => [...prev, tetrisMessage]);
    }
  }, [isConversationDrawerOpen, lastNonDrawerNavItem]);

  const handleExitFlowPrototype = useCallback(() => {
    setActiveFlowPrototype(null);
    navigateAppRoute(actionSlugs[lastNonDrawerNavItem] ?? actionSlugs.code);
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
    navigateAppRoute('/saas-credit-card');
  }, []);

  const handleEnterpriseLearnMoreClick = useCallback(() => {
    setActiveFlowPrototype('enterprise-learn-more');
    setIsConversationDrawerOpen(false);
    navigateAppRoute('/enterprise-learn-more');
  }, []);

  const handleEnterpriseRequestSubmitted = useCallback(() => {
    setEnterpriseRequestSubmitted(true);
    handleExitFlowPrototype();
  }, [handleExitFlowPrototype]);

  const handleUxTourAction = useCallback(async (action: Extract<UxTourAction, { type: 'navigate' | 'set-state' }>) => {
    if (action.type === 'navigate') {
      navigateAppRoute(action.to);
      return;
    }

    switch (action.key) {
      case 'leftNav.uxFlows.open':
        setIsUxFlowMenuOpen(Boolean(action.value));
        return;
      case 'claimCreditsPrompt.visible':
        setShowClaimCreditsPrompt(Boolean(action.value));
        return;
      case 'conversationsDrawer.open':
        setIsConversationDrawerOpen(Boolean(action.value));
        return;
      default:
        return;
    }
  }, []);

  const uxTours = useMemo(() => uxTourDefinitions, []);
  const uxTourController = useUxTourController({
    tours: uxTours,
    runAction: handleUxTourAction,
    onStop: () => {
      setIsUxFlowMenuOpen(false);
    },
  });


  const handleCanvasResize = useCallback((percentage: number) => {
    setCanvasWidth(Math.min(Math.max(percentage, minCanvasWidth), maxCanvasWidth));
  }, []);

  const syncFromLocation = useCallback(() => {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const pathname = window.location.pathname.replace(/^\/+/, '') || '';
    const legacyHash =
      window.location.hash.startsWith('#/') && !window.location.hash.startsWith('#figmacapture=')
        ? window.location.hash.slice(2).split(/[?&]/)[0] ?? ''
        : '';
    const captureRoute = new URLSearchParams(window.location.search).get('captureRoute');
    const normalizedCaptureRoute = captureRoute?.replace(/^\/+/, '') ?? '';
    if (!pathname && legacyHash && !normalizedCaptureRoute) {
      navigate({ pathname: routeToPath(legacyHash), search }, { replace: true });
      return;
    }
    const route = normalizedCaptureRoute ? normalizedCaptureRoute : pathname || legacyHash;
    const hash = route.split('?')[0];
    if (!hash && !normalizedCaptureRoute) {
      setFigmaExportRoute(null);
      setActiveFlowPrototype(null);
      setIsActiveChatView(false);
      setActiveNavItem('code');
      setLastNonDrawerNavItem('code');
      setIsConversationDrawerOpen(false);
      setSettingsTab(null);
      setIsWelcomeScreenActive(true);
      return;
    }
    if (hash === 'figma' || hash.startsWith('figma/')) {
      setFigmaExportRoute(hash === 'figma' ? '__index__' : decodeURIComponent(hash.split('/').slice(1).join('/')));
      setActiveFlowPrototype(null);
      setIsActiveChatView(false);
      setIsConversationDrawerOpen(false);
      setSettingsTab(null);
      return;
    }
    setFigmaExportRoute(null);
    if (hash === 'components') {
      navigate({ pathname: '/chat', search }, { replace: true });
      return;
    }
    if (hash.startsWith('flows/')) {
      navigate({ pathname: '/chat', search }, { replace: true });
      return;
    }
    if (hash === 'new-components') {
      navigate({ pathname: '/chat', search }, { replace: true });
      return;
    }
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
    if (hash === 'enterprise-learn-more') {
      setActiveFlowPrototype('enterprise-learn-more');
      setIsActiveChatView(false);
      return;
    }
    if (hash === 'sign-in-with-ad') {
      setActiveFlowPrototype('sign-in-with-ad');
      setIsActiveChatView(false);
      return;
    }
    setActiveFlowPrototype(null);
    if (hash === 'chat-active') {
      navigate({ pathname: '/chat', search }, { replace: true });
      return;
    }
    if (hash === 'chat') {
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
      let subTab = hash === 'settings' ? null : hash.split('/')[1] ?? null;
      if (subTab === 'plugins') {
        navigate({ pathname: '/settings/org-plugins', search }, { replace: true });
        return;
      }
      if (subTab === 'hooks') {
        navigate({ pathname: '/settings/org-hooks', search }, { replace: true });
        return;
      }
      setSettingsTab(subTab);
      return;
    }
    if (hash === 'workflows') {
      setActiveNavItem('workflows');
      setLastNonDrawerNavItem('workflows');
      setIsConversationDrawerOpen(false);
      setSettingsTab(null);
      return;
    }
    setSettingsTab(null);
    if (tryNormalizeExtensionsPath()) {
      return;
    }
    if (hash === 'extensions' || hash.startsWith('extensions/')) {
      setActiveNavItem('extensions');
      setLastNonDrawerNavItem('extensions');
      setIsConversationDrawerOpen(false);
      return;
    }
    const action = slugToAction[hash] ?? 'code';
    if (action === 'conversations') {
      setIsConversationDrawerOpen(true);
    } else {
      setActiveNavItem(action);
      setLastNonDrawerNavItem(action);
      setIsConversationDrawerOpen(false);
    }
  }, [navigate]);

  useEffect(() => {
    syncFromLocation();
  }, [location.pathname, location.search, syncFromLocation]);

  useEffect(() => {
    const onAppRoute = () => syncFromLocation();
    window.addEventListener(APP_ROUTE_EVENT, onAppRoute);
    return () => window.removeEventListener(APP_ROUTE_EVENT, onAppRoute);
  }, [syncFromLocation]);

  useEffect(() => {
    const handleCaptureAnchorNavigation = (event: MouseEvent) => {
      if (!isFigmaCaptureActive()) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href^="/"], a[href^="#/"]') as HTMLAnchorElement | null;
      if (!anchor) {
        return;
      }

      event.preventDefault();
      const href = anchor.getAttribute('href') ?? 'code';
      navigateAppRoute(href.startsWith('#') ? href.slice(1) : href);
    };

    document.addEventListener('click', handleCaptureAnchorNavigation);
    return () => document.removeEventListener('click', handleCaptureAnchorNavigation);
  }, []);

  useEffect(() => {
    document.body.toggleAttribute('data-figma-fixed-canvas', isFigmaCaptureSession);
    const rootElement = document.getElementById('root');
    rootElement?.toggleAttribute('data-figma-fixed-canvas', isFigmaCaptureSession);

    return () => {
      document.body.removeAttribute('data-figma-fixed-canvas');
      rootElement?.removeAttribute('data-figma-fixed-canvas');
    };
  }, [isFigmaCaptureSession]);


  return (
    <div
      className={`flex w-full flex-col ${isFigmaCaptureSession ? 'min-h-[900px]' : 'h-screen'} ${getThemeClasses('bg')} ${getThemeClasses('text')}`}
      style={
        isFigmaCaptureSession
          ? {
              width: '1440px',
              minWidth: '1440px',
              maxWidth: '1440px',
              minHeight: '900px',
              height: 'auto',
            }
          : undefined
      }
    >
      <AnimatePresence>
        {isLoading ? (
          <LoadingScreen theme={theme} getThemeClasses={getThemeClasses} onLoadingComplete={handleLoadingComplete} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`relative flex w-full flex-1 ${isFigmaCaptureSession ? 'overflow-visible' : 'overflow-hidden'}`}
          >
            {showLeftNav && (
              <LeftNav
                theme={theme}
                getThemeClasses={getThemeClasses}
                isExpanded={isLeftNavExpanded}
                onExpandChange={setIsLeftNavExpanded}
                onNavItemClick={handleNavItemClick}
                activeNavItem={activeNavItem}
                isConversationDrawerOpen={isConversationDrawerOpen}
                isInspectorEnabled={isInspectorEnabled}
                onInspectorToggle={() => setIsInspectorEnabled((prev) => !prev)}
                onStartUxTour={uxTourController.startTour}
                uxTourLinks={uxTourLinks}
                isUxFlowMenuOpen={isUxFlowMenuOpen}
                onUxFlowMenuOpenChange={setIsUxFlowMenuOpen}
                onEnterpriseLearnMoreClick={handleEnterpriseLearnMoreClick}
                activeWorkspaceId={activeWorkspaceId}
                onActiveWorkspaceChange={setActiveWorkspaceId}
              />
            )}
            <div 
              className={`flex-1 flex flex-col transition-all duration-200 ${activeFlowPrototype || showFigmaExportView ? '' : 'ml-16'}`}
              style={{ minWidth: 0 }}
            >
              {showMainApp && !isEmbedded && (
                <InspectorOverlay
                  enabled={isInspectorEnabled}
                  onRequestDisable={() => setIsInspectorEnabled(false)}
                />
              )}
              {showFigmaExportView ? (
                <ComponentLibraryScreen
                  key={`figma-export-${figmaExportRoute}`}
                  mode="figma"
                  exportItemId={figmaExportRoute === '__index__' ? null : figmaExportRoute}
                />
              ) : showStandaloneFlow ? (
                activeFlowPrototype === 'new-user-experience' ? (
                  <LoginScreen onBack={handleExitFlowPrototype} />
                ) :                 activeFlowPrototype === 'enterprise-learn-more' ? (
                  <EnterpriseLearnMoreScreen
                    onBack={handleExitFlowPrototype}
                    onSubmitComplete={handleEnterpriseRequestSubmitted}
                  />
                ) : activeFlowPrototype === 'sign-in-with-ad' ? (
                  <SignInWithAdScreen onBack={handleExitFlowPrototype} />
                ) : (
                  <SaasCreditCardFlow onSkip={handleClaimCreditsSkip} onComplete={handleClaimCreditsComplete} />
                )
              ) : (
                <>
              {showChatView && !isWelcomeScreenActive && !isActiveChatView && !isEmbedded && (
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
                      canvasTipVariant={canvasTipVariant}
                      onCanvasTipVariantChange={setCanvasTipVariant}
                      showCanvasLoading={showCanvasLoading}
                      onToggleCanvasLoading={() => setShowCanvasLoading((prev) => !prev)}
                      chatContentMode={chatContentMode}
                      onChatContentModeChange={setChatContentMode}
                      repositoryStatus={repositoryStatus}
                      onRepositoryStatusChange={setRepositoryStatus}
                      showStatusBadge={showStatusBadge}
                      onToggleStatusBadge={() => setShowStatusBadge((prev) => !prev)}
                      automationContextTitle={activeChatAutomationTitle}
                      onAutomationContextTitleChange={setActiveChatAutomationTitle}
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
                          data-tour-id="claim-credits.cta"
                          className="h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          Claim now
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {isDashboardView && <DashboardScreen />}
                {isAutomationsView && (
                  <AutomationsScreen
                    onRunNow={handleAutomationRunNow}
                    onOpenConversation={handleOpenAutomationConversation}
                  />
                )}
                {isExtensionsView && (
                  <ExtensionsScreen />
                )}
                {isNewLlmSwitcherView && <NewLlmSwitcherScreen />}
                {isNewLlmSwitcherView2 && <NewLlmSwitcherScreen2 />}
                {isSettingsView && (
                  <SettingsScreen
                    initialTab={settingsTab ?? undefined}
                    onTabChange={(tab) => {
                      navigateAppRoute(`/settings/${tab}`);
                    }}
                    pluginRepositories={installedPluginRepos}
                    onAddPluginRepository={(repoUrl: string) =>
                      setInstalledPluginRepos((prev) =>
                        prev.includes(repoUrl) ? prev : [...prev, repoUrl]
                      )
                    }
                    onRemovePluginRepository={(repoUrl: string) =>
                      setInstalledPluginRepos((prev) => prev.filter((repo) => repo !== repoUrl))
                    }
                  />
                )}
                {isWorkflowsView && <WorkflowsScreen />}
                {isClaimStatesView && <ClaimStatesScreen />}
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
                        onWelcomeScreenChange={setIsWelcomeScreenActive}
                        onEnterpriseCtaVisibilityChange={setIsEnterpriseCtaVisible}
                        welcomeScreenVariant={activeNavItem === 'chat-cards' ? 'cards' : 'default'}
                        onEnterpriseLearnMoreClick={handleEnterpriseLearnMoreClick}
                        isHomeRoute={location.pathname === '/'}
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
                            tipVariant={canvasTipVariant === 'none' ? 'protip' : canvasTipVariant}
                            onTipDismiss={() => setCanvasTipVariant('none')}
                            onResize={handleCanvasResize}
                            initialWidth={canvasWidth}
                            minWidth={minCanvasWidth}
                            maxWidth={maxCanvasWidth}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {showChatView && showSharePreview && !isEmbedded && (
                <SharePreview
                  shareUrl={window.location.href}
                  onClose={() => setShowSharePreview(false)}
                />
              )}
                </>
              )}
            </div>
            {showMainApp && showLeftNav && (
              <ConversationDrawer
                open={isConversationDrawerOpen}
                onOpenChange={handleConversationDrawerChange}
                conversations={drawerConversations}
                highlightedConversationId={activeConversationId}
                onSelectConversation={(c) => setActiveConversationId(c.id)}
              />
            )}
            <UxTourOverlay
              isActive={uxTourController.isActive}
              step={uxTourController.activeStep}
              stepIndex={uxTourController.stepIndex}
              totalSteps={uxTourController.totalSteps}
              isBusy={uxTourController.isBusy}
              onBack={uxTourController.previousStep}
              onNext={() => {
                void uxTourController.nextStep();
              }}
              onClose={uxTourController.stopTour}
            />
            <Dialog open={enterpriseRequestSubmitted} onOpenChange={setEnterpriseRequestSubmitted}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Request submitted</DialogTitle>
                  <DialogDescription>
                    Your request has been submitted. We will follow up with next steps shortly.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                  <button
                    type="button"
                    onClick={() => setEnterpriseRequestSubmitted(false)}
                    className="h-10 rounded-md bg-white px-4 text-sm font-medium text-black hover:bg-gray-300 transition-colors"
                  >
                    Done
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>
      <AppToaster />
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

export default App; 
