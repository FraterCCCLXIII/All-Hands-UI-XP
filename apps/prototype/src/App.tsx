import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChatArea } from './components/chat/ChatArea';
import { StartNewConversationDialog } from './components/chat/StartNewConversationDialog';
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
  type StatusBadgeState,
  ComponentLibraryScreen,
  NewLlmSwitcherScreen,
  NewLlmSwitcherScreen2,
  SaasCreditCardFlow,
  EnterpriseLearnMoreScreen,
  SignInWithAdScreen,
  WorkflowsScreen,
  ClaimStatesScreen,
  PublicShareScreen,
  ChatComponentsScreen,
  StartNewConversationModalScreen,
  LaunchFromPluginModalScreen,
  OnboardingScreen,
} from './screens';
import { SettingsScreen } from './screens/SettingsScreen';
import { OrgAdminDashboardScreen } from './screens/OrgAdminDashboardScreen';
import SharePreview from './components/common/SharePreview';
import { AppToaster } from './components/common/AppToaster';
import { Gripper } from './components/common/Gripper';
import { InspectorOverlay } from './components/common/InspectorOverlay';
import { ElectronTitleBar } from './components/electron/ElectronTitleBar';
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
import { usePageTransitions } from './contexts/PageTransitionsContext';
import { tryNormalizeExtensionsPath } from './lib/extensionsRoutes';
import { themeAppClassMap as themeClasses } from './theme/themeAppClassMap';

type CanvasTipVariant = 'none' | ProtipVariant;

const LEFT_NAV_COLLAPSED_WIDTH = 48;
const LEFT_NAV_MIN_WIDTH = 320;
const LEFT_NAV_MAX_WIDTH = 480;
const LEFT_NAV_EXPANDED_STORAGE_KEY = 'openhands:left-nav-expanded';

const actionSlugs: Record<string, string> = {
  code: 'chat',
  'chat-start': 'chat-start',
  'new-chat-start': 'new-chat-start',
  'old-chat-start': 'old-chat-start',
  onboarding: 'onboarding',
  dashboard: 'dashboard',
  automations: 'automations',
  extensions: 'extensions/all',
  'new-llm-switcher': 'new-llm-switcher',
  'new-llm-switcher-2': 'new-llm-switcher-2',
  conversations: 'conversations',
  settings: 'settings',
  workflows: 'workflows',
  'claim-states': 'claim-states',
  'chat-components': 'chat-components',
  'start-new-conversation-modal': 'start-new-conversation-modal',
  'launch-from-plugin-modal': 'launch-from-plugin-modal',
  'org-admin-dashboard': 'org-admin',
};

const slugToAction = Object.fromEntries(Object.entries(actionSlugs).map(([action, slug]) => [slug, action]));

/** Default shell when opening the app or returning from overlays (pathname segment). */
const DEFAULT_HOME_SLUG = actionSlugs['chat-start'];

/**
 * Collapse nested in-app routes so the outer shell slide does not re-run when only the
 * sub-route changes (left nav + secondary column stay stable). Extensions uses inner
 * `ExtensionsAnimatedMain` for sub-route transitions.
 */
function normalizePathForShellTransition(pathname: string): string {
  if (pathname === '/settings' || pathname.startsWith('/settings/')) return '/settings';
  if (pathname === '/extensions' || pathname.startsWith('/extensions/')) return '/extensions';
  return pathname;
}

function getConversationDrawerBackgroundRoute(search: string, fallbackRoute: string): string {
  const params = new URLSearchParams(search);
  const from = params.get('from');
  return from && from.startsWith('/') ? from : fallbackRoute;
}

/** When opening the conversations overlay, `from` must match the full URL (path + search) so the shell page key stays stable. */
function getConversationDrawerBackgroundFallback(
  pathname: string,
  search: string,
  lastNonDrawerNavItem: string
): string {
  if (pathname === '/conversations') {
    return `/${actionSlugs[lastNonDrawerNavItem] ?? DEFAULT_HOME_SLUG}`;
  }
  return `${pathname}${search}`;
}

function parseAppRoute(route: string): { pathname: string; search: string; hash: string } {
  const url = new URL(route, 'http://localhost');
  return {
    pathname: url.pathname,
    search: url.search,
    hash: url.pathname.replace(/^\/+/, '') || '',
  };
}

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
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [canvasTipVariant, setCanvasTipVariant] = useState<CanvasTipVariant>('none');
  const [showCanvasLoading, setShowCanvasLoading] = useState(true);
  const [chatContentMode, setChatContentMode] = useState<'skeleton' | 'conversation' | 'start'>('conversation');
  const [repositoryStatus, setRepositoryStatus] = useState<'connected' | 'disconnected' | 'connect'>('connected');
  const [activeChatRepositoryName, setActiveChatRepositoryName] = useState<string | null>(null);
  const [activeChatBranchName, setActiveChatBranchName] = useState<string | null>(null);
  const [inputStatusBadgeState, setInputStatusBadgeState] = useState<StatusBadgeState>('off');
  const [composerStatusBadgeState, setComposerStatusBadgeState] = useState<StatusBadgeState>('off');
  const [activeChatAutomationTitle, setActiveChatAutomationTitle] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('My Project');
  const chatCanvasDefaultOpen = useMemo(
    () => new URLSearchParams(location.search).get('canvas') !== 'closed',
    [location.search]
  );
  const [activeNavItem, setActiveNavItem] = useState('chat-start');
  const [isRunning, setIsRunning] = useState(false);
  const [isWelcomeScreenActive, setIsWelcomeScreenActive] = useState(true);
  const [isLeftNavExpanded, setIsLeftNavExpanded] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(LEFT_NAV_EXPANDED_STORAGE_KEY) === 'true';
  });
  const [leftNavWidth, setLeftNavWidth] = useState(LEFT_NAV_MIN_WIDTH);
  const [isConversationDrawerOpen, setIsConversationDrawerOpen] = useState(false);
  const [isStartConversationDialogOpen, setIsStartConversationDialogOpen] = useState(false);
  const [activeChatWindowTab, setActiveChatWindowTab] = useState<ChatWindowTabId>('preview');
  const [lastNonDrawerNavItem, setLastNonDrawerNavItem] = useState('chat-start');
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
  const [isShareView, setIsShareView] = useState(false);
  const [shareConversationId, setShareConversationId] = useState<string | null>(null);
  const [isInspectorEnabled, setIsInspectorEnabled] = useState(false);
  const [showClaimCreditsPrompt, setShowClaimCreditsPrompt] = useState(false);
  const [isUxFlowMenuOpen, setIsUxFlowMenuOpen] = useState(false);
  const [enterpriseRequestSubmitted, setEnterpriseRequestSubmitted] = useState(false);
  const [figmaExportRoute, setFigmaExportRoute] = useState<string | null>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('personal');

  const prefersReducedMotion = useReducedMotion();
  const { pageTransitionsEnabled } = usePageTransitions();
  const shellMotionActive =
    pageTransitionsEnabled &&
    !prefersReducedMotion &&
    location.pathname !== '/conversations';

  /** Collapse `/settings/...` and `/extensions/...` so in-app navigation does not re-run the shell slide. */
  const pageTransitionKey = useMemo(() => {
    const drawerBgFallback = getConversationDrawerBackgroundFallback(
      location.pathname,
      location.search,
      lastNonDrawerNavItem
    );
    const transitionRoute =
      location.pathname === '/conversations'
        ? parseAppRoute(getConversationDrawerBackgroundRoute(location.search, drawerBgFallback))
        : { pathname: location.pathname, search: location.search };
    const normalizedPath = normalizePathForShellTransition(transitionRoute.pathname);
    const searchForKey =
      normalizedPath === '/extensions' ? '' : transitionRoute.search;
    return [
      normalizedPath,
      searchForKey,
      figmaExportRoute ?? '',
      activeFlowPrototype ?? '',
      activeNavItem,
      String(isActiveChatView),
      String(isWelcomeScreenActive),
      String(isShareView),
    ].join('|');
  }, [
    location.pathname,
    location.search,
    figmaExportRoute,
    activeFlowPrototype,
    activeNavItem,
    isActiveChatView,
    isWelcomeScreenActive,
    isShareView,
    lastNonDrawerNavItem,
  ]);

  const pageTransition = shellMotionActive
    ? { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const }
    : { duration: 0 };

  useEffect(() => {
    registerAppNavigate(navigate);
  }, [navigate]);

  /** Right-panel canvas: initial spinner clears after 2s so tab empty states can show. */
  useEffect(() => {
    const id = window.setTimeout(() => setShowCanvasLoading(false), 2000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LEFT_NAV_EXPANDED_STORAGE_KEY, String(isLeftNavExpanded));
  }, [isLeftNavExpanded]);

  const isEmbedded = new URLSearchParams(window.location.search).has('embed');
  const showCanvasTip = canvasTipVariant !== 'none';
  const isOnboardingView = activeNavItem === 'onboarding';
  const isDashboardView = activeNavItem === 'dashboard';
  const isAutomationsView = activeNavItem === 'automations';
  const automationRouteId = useMemo(() => new URLSearchParams(location.search).get('automation'), [location.search]);
  const isExtensionsView = activeNavItem === 'extensions';
  const isSettingsView = activeNavItem === 'settings';
  const isNewLlmSwitcherView = activeNavItem === 'new-llm-switcher';
  const isNewLlmSwitcherView2 = activeNavItem === 'new-llm-switcher-2';
  const isWorkflowsView = activeNavItem === 'workflows';
  const isClaimStatesView = activeNavItem === 'claim-states';
  const isChatComponentsView = activeNavItem === 'chat-components';
  const isStartNewConversationModalView = activeNavItem === 'start-new-conversation-modal';
  const isLaunchFromPluginModalView = activeNavItem === 'launch-from-plugin-modal';
  const isOrgAdminDashboardView = activeNavItem === 'org-admin-dashboard';
  const showStandaloneFlow = Boolean(activeFlowPrototype);
  const showFigmaExportView = figmaExportRoute !== null;
  const isFigmaCaptureSession = isFigmaCaptureActive();
  const showMainApp = !showStandaloneFlow && !showFigmaExportView;
  const showChatView =
    !isDashboardView &&
    !isOnboardingView &&
    !isAutomationsView &&
    !isExtensionsView &&
    !isSettingsView &&
    !isNewLlmSwitcherView &&
    !isNewLlmSwitcherView2 &&
    !isWorkflowsView &&
    !isChatComponentsView &&
    !isStartNewConversationModalView &&
    !isLaunchFromPluginModalView &&
    !isOrgAdminDashboardView;
  const showLeftNav =
    !showFigmaExportView &&
    !isShareView &&
    activeFlowPrototype !== 'new-user-experience' &&
    activeFlowPrototype !== 'enterprise-learn-more' &&
    activeFlowPrototype !== 'sign-in-with-ad';

  const shareConversation = useMemo(
    () =>
      conversationSummaries.find((c) => c.id === shareConversationId) ??
      conversationSummaries[0],
    [shareConversationId]
  );

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
      setIsConversationDrawerOpen(false);
      navigateAppRoute('/chat');
      return { conversationId, conversationName };
    },
    []
  );

  const handleOpenAutomationConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsConversationDrawerOpen(false);
    navigateAppRoute('/chat');
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
        const backgroundRoute = getConversationDrawerBackgroundRoute(
          location.search,
          getConversationDrawerBackgroundFallback(location.pathname, location.search, lastNonDrawerNavItem)
        );
        navigateAppRoute(
          nextOpenState
            ? `/conversations?from=${encodeURIComponent(backgroundRoute)}`
            : backgroundRoute
        );
        return;
      }
      if (action === 'new-project') {
        setActiveFlowPrototype(null);
        setIsConversationDrawerOpen(false);
        setActiveNavItem('chat-start');
        setLastNonDrawerNavItem('chat-start');
        setIsWelcomeScreenActive(true);
        navigateAppRoute(`/${actionSlugs['chat-start']}`);
        return;
      }
      if (action.startsWith('settings/')) {
        const tab = action.slice('settings/'.length) || 'user';
        setActiveNavItem('settings');
        setLastNonDrawerNavItem('settings');
        setIsConversationDrawerOpen(false);
        navigateAppRoute(`/settings/${tab}`);
        return;
      }

      setActiveNavItem(action);
      setLastNonDrawerNavItem(action);
      setIsConversationDrawerOpen(false);
      navigateAppRoute(action === 'settings' ? '/settings' : (actionSlugs[action] ?? DEFAULT_HOME_SLUG));
      if (action === 'tetris') {
      const tetrisMessage: Message = {
        role: 'ai',
        text: 'Starting Tetris game...',
        type: 'tetris_game',
        status: 'completed',
      };
      setMessages((prev) => [...prev, tetrisMessage]);
    }
  }, [isConversationDrawerOpen, lastNonDrawerNavItem, location.pathname, location.search]);

  const handleExitFlowPrototype = useCallback(() => {
    setActiveFlowPrototype(null);
    navigateAppRoute(actionSlugs[lastNonDrawerNavItem] ?? DEFAULT_HOME_SLUG);
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

  const handleOpenStartConversationDialog = useCallback(() => {
    setActiveFlowPrototype(null);
    setIsConversationDrawerOpen(false);
    setIsStartConversationDialogOpen(true);
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
    if (pathname === 'chat-cards' || legacyHash === 'chat-cards') {
      navigate({ pathname: '/chat-start', search }, { replace: true });
      return;
    }
    const route = normalizedCaptureRoute ? normalizedCaptureRoute : pathname || legacyHash;
    const routeHash = route.split('?')[0];
    const drawerFallbackRoute = `/${actionSlugs[lastNonDrawerNavItem] ?? DEFAULT_HOME_SLUG}`;
    const drawerShouldBeOpen = routeHash === 'conversations';
    const drawerBackgroundRoute = drawerShouldBeOpen
      ? getConversationDrawerBackgroundRoute(search, drawerFallbackRoute)
      : null;
    const effectiveRoute = drawerBackgroundRoute ? parseAppRoute(drawerBackgroundRoute) : null;
    const hash = effectiveRoute?.hash ?? routeHash;
    const routeSearch = effectiveRoute?.search ?? search;
    if (!routeHash && !normalizedCaptureRoute) {
      setFigmaExportRoute(null);
      setActiveFlowPrototype(null);
      setIsActiveChatView(false);
      setActiveNavItem('chat-start');
      setLastNonDrawerNavItem('chat-start');
      setIsConversationDrawerOpen(false);
      setSettingsTab(null);
      setIsWelcomeScreenActive(true);
      navigate({ pathname: '/chat-start', search }, { replace: true });
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
    setIsShareView(false);
    if (hash === 'share') {
      setIsShareView(true);
      setIsActiveChatView(false);
      setActiveFlowPrototype(null);
      setIsConversationDrawerOpen(false);
      setSettingsTab(null);
      const shareParams = new URLSearchParams(routeSearch);
      setShareConversationId(shareParams.get('id'));
      return;
    }
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
    if (hash === 'legacy-chat-home') {
      const legacyChatSearch = new URLSearchParams({
        content: 'start',
        repository: 'connected',
      });
      navigate(
        {
          pathname: '/chat',
          search: `?${legacyChatSearch.toString()}`,
        },
        { replace: true }
      );
      return;
    }
    if (hash === 'chat') {
      setIsActiveChatView(true);
      setActiveNavItem('code');
      setLastNonDrawerNavItem('code');
      setIsConversationDrawerOpen(drawerShouldBeOpen);
      setSettingsTab(null);
      const chatParams = new URLSearchParams(routeSearch);
      setChatContentMode(chatParams.get('content') === 'start' ? 'start' : 'conversation');
      const repositoryParam = chatParams.get('repository');
      setRepositoryStatus(
        repositoryParam === 'disconnected'
          ? 'disconnected'
          : repositoryParam === 'connect'
            ? 'connect'
            : 'connected'
      );
      setActiveChatRepositoryName(chatParams.get('repo'));
      setActiveChatBranchName(chatParams.get('branch'));
      setActiveChatAutomationTitle(chatParams.get('skill'));
      return;
    }
    setIsActiveChatView(false);
    if (hash === 'settings' || hash.startsWith('settings/')) {
      setActiveNavItem('settings');
      setLastNonDrawerNavItem('settings');
      setIsConversationDrawerOpen(drawerShouldBeOpen);
      const subTab =
        hash === 'settings' ? null : hash.startsWith('settings/') ? hash.slice('settings/'.length) || null : null;
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
      setIsConversationDrawerOpen(drawerShouldBeOpen);
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
      setIsConversationDrawerOpen(drawerShouldBeOpen);
      return;
    }
    if (hash === 'chat-components') {
      setActiveNavItem('chat-components');
      setLastNonDrawerNavItem('chat-components');
      setIsConversationDrawerOpen(false);
      setSettingsTab(null);
      return;
    }
    const action = slugToAction[hash] ?? 'chat-start';
    setActiveNavItem(action);
    setLastNonDrawerNavItem(action);
    setIsConversationDrawerOpen(drawerShouldBeOpen);
  }, [lastNonDrawerNavItem, navigate]);

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

  const isElectronShell = typeof window !== 'undefined' && Boolean(window.openHandsWindowControls);

  return (
    <div
      className={`flex w-full flex-col ${isFigmaCaptureSession ? 'min-h-[900px]' : 'h-screen'} ${isElectronShell && !isFigmaCaptureSession ? 'electron-shell pt-9' : ''} ${getThemeClasses('bg')} ${getThemeClasses('text')}`}
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
      {!isFigmaCaptureSession && <ElectronTitleBar />}
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
                width={leftNavWidth}
                minWidth={LEFT_NAV_MIN_WIDTH}
                maxWidth={LEFT_NAV_MAX_WIDTH}
                onWidthChange={setLeftNavWidth}
                onNavItemClick={handleNavItemClick}
                activeNavItem={activeNavItem}
                onEnterpriseLearnMoreClick={handleEnterpriseLearnMoreClick}
                onStartConversationClick={handleOpenStartConversationDialog}
                activeWorkspaceId={activeWorkspaceId}
                onActiveWorkspaceChange={setActiveWorkspaceId}
                isHomeRoute={
                  location.pathname === '/chat-start' ||
                  location.pathname === '/' ||
                  location.pathname === '/new-chat-start'
                }
                conversations={drawerConversations}
                activeConversationId={activeConversationId}
                onSelectConversation={(conversation) => {
                  setActiveConversationId(conversation.id);
                  setIsConversationDrawerOpen(false);
                  navigateAppRoute('/chat');
                }}
              />
            )}
            <div
              className="flex min-h-0 flex-1 flex-col transition-all duration-200"
              style={{
                minWidth: 0,
                ...(
                  activeFlowPrototype || showFigmaExportView || isShareView
                    ? {}
                    : { marginLeft: isLeftNavExpanded ? leftNavWidth : LEFT_NAV_COLLAPSED_WIDTH }
                ),
              }}
            >
              {showMainApp && !isEmbedded && (
                <InspectorOverlay
                  enabled={isInspectorEnabled}
                  onRequestDisable={() => setIsInspectorEnabled(false)}
                />
              )}
              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pageTransitionKey}
                    className="flex min-h-0 min-w-0 flex-1 flex-col"
                    initial={shellMotionActive ? { opacity: 0, x: 28 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    exit={shellMotionActive ? { opacity: 0, x: -28 } : { opacity: 0 }}
                    transition={pageTransition}
                  >
                    {isShareView ? (
                      <PublicShareScreen conversation={shareConversation} />
                    ) : showFigmaExportView ? (
                      <ComponentLibraryScreen
                        key={`figma-export-${figmaExportRoute}`}
                        mode="figma"
                        exportItemId={figmaExportRoute === '__index__' ? null : figmaExportRoute}
                      />
                    ) : showStandaloneFlow ? (
                      activeFlowPrototype === 'new-user-experience' ? (
                        <LoginScreen onBack={handleExitFlowPrototype} />
                      ) : activeFlowPrototype === 'enterprise-learn-more' ? (
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
                      showErrorNotification={showErrorNotification}
                      onToggleErrorNotification={() => setShowErrorNotification((prev) => !prev)}
                      canvasTipVariant={canvasTipVariant}
                      onCanvasTipVariantChange={setCanvasTipVariant}
                      showCanvasLoading={showCanvasLoading}
                      onToggleCanvasLoading={() => setShowCanvasLoading((prev) => !prev)}
                      chatContentMode={chatContentMode}
                      onChatContentModeChange={setChatContentMode}
                      repositoryStatus={repositoryStatus}
                      onRepositoryStatusChange={setRepositoryStatus}
                      repositoryName={activeChatRepositoryName}
                      branchName={activeChatBranchName}
                      inputStatusBadgeState={inputStatusBadgeState}
                      onInputStatusBadgeStateChange={setInputStatusBadgeState}
                      composerStatusBadgeState={composerStatusBadgeState}
                      onComposerStatusBadgeStateChange={setComposerStatusBadgeState}
                      automationContextTitle={activeChatAutomationTitle}
                      onAutomationContextTitleChange={setActiveChatAutomationTitle}
                      initialCanvasOpen={chatCanvasDefaultOpen}
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
                <StartNewConversationDialog
                  open={isStartConversationDialogOpen}
                  onOpenChange={setIsStartConversationDialogOpen}
                />
                {isOnboardingView && <OnboardingScreen />}
                {isDashboardView && <DashboardScreen />}
                {isAutomationsView && (
                  <AutomationsScreen
                    initialAutomationId={automationRouteId ?? undefined}
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
                    selectedOrgId={activeWorkspaceId}
                    onOrgChange={setActiveWorkspaceId}
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
                {isChatComponentsView && <ChatComponentsScreen />}
                {isStartNewConversationModalView && <StartNewConversationModalScreen />}
                {isLaunchFromPluginModalView && <LaunchFromPluginModalScreen />}
                {isOrgAdminDashboardView && <OrgAdminDashboardScreen activeWorkspaceId={activeWorkspaceId} />}
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
                        onWelcomeScreenChange={setIsWelcomeScreenActive}
                        onEnterpriseCtaVisibilityChange={setIsEnterpriseCtaVisible}
                        welcomeScreenVariant={
                          activeNavItem === 'chat-start'
                            ? 'chat-start'
                            : activeNavItem === 'new-chat-start'
                              ? 'new-chat-start'
                              : activeNavItem === 'old-chat-start'
                                ? 'old-chat-start'
                              : 'default'
                        }
                        onEnterpriseLearnMoreClick={handleEnterpriseLearnMoreClick}
                        isInspectorEnabled={isInspectorEnabled}
                        onInspectorToggle={() => setIsInspectorEnabled((prev) => !prev)}
                        onStartUxTour={uxTourController.startTour}
                        uxTourLinks={uxTourLinks}
                        isUxFlowMenuOpen={isUxFlowMenuOpen}
                        onUxFlowMenuOpenChange={setIsUxFlowMenuOpen}
                        onPrototypeNavItemClick={handleNavItemClick}
                        isHomeRoute={
                          location.pathname === '/chat-start' ||
                          location.pathname === '/' ||
                          location.pathname === '/new-chat-start' ||
                          location.pathname === '/old-chat-start'
                        }
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
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
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
                    className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/85 transition-colors"
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

export default App; 
