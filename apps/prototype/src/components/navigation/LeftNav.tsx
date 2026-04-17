import React, { useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Boxes,
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  List,
  LogOut,
  Megaphone,
  Newspaper,
  Plus,
  SquareKanban,
  Sparkles,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Theme, ThemeElement } from '../../types/theme';
import { EnterpriseCtaCard } from '../common/EnterpriseCtaCard';
import { cn } from '../../lib/utils';
import { getAccountPopoverNavSections } from '../../config/settingsWorkspaceNav';

/** Mirrors Settings org selector options for a consistent workspace switcher. */
const accountWorkspaceOptions = [
  { id: 'personal', name: 'Personal Account', role: null as string | null, type: 'personal' as const },
  { id: 'acme-owner', name: 'Acme Inc', role: 'Owner' as const, type: 'org' as const },
  { id: 'starlight-admin', name: 'Starlight Labs', role: 'Admin' as const, type: 'org' as const },
  { id: 'nova-member', name: 'Nova Group', role: 'Member' as const, type: 'org' as const },
] as const;

/** True when the browser path is the given Settings tab (including secrets sub-routes). */
function isSettingsTabPathActive(pathname: string, tabId: string) {
  if (!pathname.startsWith('/settings')) return false;
  const rest = pathname.replace(/^\/settings\/?/, '');
  const first = rest.split('/')[0] ?? '';
  return first === tabId;
}

const logoPopoverIconTileClass =
  'flex h-8 w-8 items-center justify-center rounded-sm bg-black text-white';

const highlightCards = [
  {
    title: 'Docs',
    text: 'Build, integrate, and scale with ease.',
    url: 'https://docs.openhands.dev/',
    icon: (
      <div className={logoPopoverIconTileClass} aria-hidden>
        <BookOpen className="h-5 w-5" />
      </div>
    ),
  },
  {
    title: 'Blog',
    text: 'Ideas, updates, and insights that inspire.',
    url: '/blog',
    icon: (
      <div className={logoPopoverIconTileClass} aria-hidden>
        <Newspaper className="h-5 w-5" />
      </div>
    ),
  },
  {
    title: 'Press',
    text: 'News, releases, and media highlights.',
    url: '/press',
    icon: (
      <div className={logoPopoverIconTileClass} aria-hidden>
        <Megaphone className="h-5 w-5" />
      </div>
    ),
  },
  {
    title: 'Community',
    text: 'Connect, share, and grow together.',
    url: 'http://openhands.dev/joinslack',
    icon: (
      <div className={logoPopoverIconTileClass} aria-hidden>
        <Users className="h-5 w-5" />
      </div>
    ),
  },
  {
    title: 'Careers',
    text: 'Learn more about our open roles.',
    url: 'https://jobs.ashbyhq.com/OpenHands',
    icon: (
      <div className={logoPopoverIconTileClass} aria-hidden>
        <Briefcase className="h-5 w-5" />
      </div>
    ),
  },
];

function AutomationsIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={cn('lucide block', className)}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#automations-icon-clip)">
        <path d="M10 18.1818V16.5454" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 1.81812V3.45448" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1.81824 10H3.4546" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.1818 10H16.5454" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.93359 17.1019L6.74359 15.6782" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.0663 2.89819L13.2563 4.32183" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.89819 5.93359L4.32183 6.74359" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.1019 14.0663L15.6782 13.2563" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.92542 2.90625L6.7436 4.3217" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.0909 17.0854L13.2727 15.6699" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.0855 5.90918L15.67 6.72736" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.91455 14.0909L4.33001 13.2727" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 16.5455C13.615 16.5455 16.5455 13.615 16.5455 10C16.5455 6.38509 13.615 3.45459 10 3.45459C6.38509 3.45459 3.45459 6.38509 3.45459 10C3.45459 13.615 6.38509 16.5455 10 16.5455Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.5854 9.77916L8.80545 7.59461C8.63363 7.49643 8.41272 7.61916 8.41272 7.81552V12.1846C8.41272 12.381 8.62545 12.5119 8.80545 12.4055L12.5854 10.221C12.7573 10.1228 12.7573 9.86916 12.5854 9.77098V9.77916Z" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="automations-icon-clip">
          <rect width="18" height="18" fill="white" transform="translate(1 1)"/>
        </clipPath>
      </defs>
    </svg>
  );
}

const navItems = [
  { icon: Plus, label: 'New Conversation', action: 'new-project' },
  { icon: List, label: 'Conversation List', action: 'conversations' },
  { icon: Boxes, label: 'Extensions', action: 'extensions' },
  { icon: AutomationsIcon, label: 'Automations', action: 'automations' },
  { icon: SquareKanban, label: 'Workspaces', action: 'dashboard' },
];

/** Hover/focus tooltip to the right of the trigger; hides after click until pointer re-enters. */
function LeftNavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <span
      className="relative inline-flex group"
      onMouseEnter={() => setDismissed(false)}
      onClickCapture={() => setDismissed(true)}
    >
      {children}
      <span
        className={cn(
          'pointer-events-none absolute left-full top-1/2 z-[60] ml-1 flex -translate-y-1/2 flex-col justify-center pl-1 opacity-0 transition-opacity duration-150',
          'group-hover:pointer-events-auto group-hover:opacity-100 group-hover:delay-75',
          'group-focus-within:pointer-events-auto group-focus-within:opacity-100',
          dismissed &&
            '!pointer-events-none !opacity-0 group-hover:!pointer-events-none group-hover:!opacity-0 group-focus-within:!pointer-events-none group-focus-within:!opacity-0'
        )}
      >
        <span
          role="tooltip"
          className="whitespace-nowrap rounded-md bg-muted px-2 py-1 text-xs text-foreground shadow-md"
        >
          {label}
        </span>
      </span>
    </span>
  );
}

export interface LeftNavProps {
  theme: Theme;
  getThemeClasses: (element: ThemeElement) => string;
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  onNavItemClick: (action: string) => void;
  activeNavItem: string;
  isConversationDrawerOpen: boolean;
  isInspectorEnabled: boolean;
  onInspectorToggle: () => void;
  onStartUxTour?: (tourId: string) => void;
  uxTourLinks?: Array<{ id: string; label: string }>;
  isUxFlowMenuOpen?: boolean;
  onUxFlowMenuOpenChange?: (open: boolean) => void;
  onEnterpriseLearnMoreClick?: () => void;
  /** Workspace id from `accountWorkspaceOptions`; non-`personal` shows org chrome on the account button. */
  activeWorkspaceId?: string;
  onActiveWorkspaceChange?: (workspaceId: string) => void;
  /** True when the app is on `/` (home / create flow); used to highlight the Plus nav item while `activeNavItem` is still `code`. */
  isHomeRoute?: boolean;
}

const prototypeMenuEntries = [
  {
    id: 'launch-from-plugin-modal',
    label: 'Launch from plugin modal',
    navAction: 'launch-from-plugin-modal',
  },
  {
    id: 'start-new-conversation-modal',
    label: 'Start New Conversation Modal',
    navAction: 'start-new-conversation-modal',
  },
  { id: 'new-chat-start', label: 'New Chat Start', navAction: 'new-chat-start' },
  { id: 'chat-components', label: 'All Chat Components', navAction: 'chat-components' },
  { id: 'sign-in-with-ad', label: 'Sign in with ad', navAction: 'sign-in-with-ad' },
  { id: 'new-user-experience', label: 'New User Experience', navAction: 'new-user-experience' },
  { id: 'saas-credit-card', label: 'SaaS - Require Credit Card for Free Credits', navAction: 'saas-credit-card' },
  {
    id: 'user-journey-cta',
    label: 'User Journey - Create in-app call-to-actions (CTAs)',
    navAction: 'code',
  },
  { id: 'new-llm-switcher', label: 'New LLM Switcher', navAction: 'new-llm-switcher' },
  { id: 'new-llm-switcher-2', label: 'New LLM Switcher 2', navAction: 'new-llm-switcher-2' },
  { id: 'loading-screen', label: 'Loading Screen', navAction: 'loading-screen' },
];

export const LeftNav: React.FC<LeftNavProps> = ({
  onNavItemClick,
  activeNavItem,
  isConversationDrawerOpen,
  isInspectorEnabled,
  onInspectorToggle,
  onStartUxTour,
  uxTourLinks = [],
  isUxFlowMenuOpen,
  onUxFlowMenuOpenChange,
  onEnterpriseLearnMoreClick,
  activeWorkspaceId = 'personal',
  onActiveWorkspaceChange,
  isHomeRoute = false,
}) => {
  const location = useLocation();
  const selectedWorkspace =
    accountWorkspaceOptions.find((o) => o.id === activeWorkspaceId) ?? accountWorkspaceOptions[0];
  const personalWorkspaces = accountWorkspaceOptions.filter((o) => o.type === 'personal');
  const gitOrganizationWorkspaces = accountWorkspaceOptions.filter((o) => o.type === 'org');

  const accountNavSections = useMemo(
    () =>
      getAccountPopoverNavSections({
        type: selectedWorkspace.type,
        role: selectedWorkspace.role,
      }),
    [selectedWorkspace.type, selectedWorkspace.role],
  );

  const isOrgAccount = selectedWorkspace.type === 'org';
  const orgInitial = selectedWorkspace.name.trim().charAt(0).toUpperCase() || '?';
  const [isLogoPopoverOpen, setIsLogoPopoverOpen] = useState(false);
  const logoPopoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoMouseEnter = () => {
    if (logoPopoverTimeoutRef.current) {
      clearTimeout(logoPopoverTimeoutRef.current);
      logoPopoverTimeoutRef.current = null;
    }
    setIsLogoPopoverOpen(true);
  };

  const handleLogoMouseLeave = () => {
    logoPopoverTimeoutRef.current = setTimeout(() => setIsLogoPopoverOpen(false), 150);
  };

  return (
  <aside className="pointer-events-auto fixed left-0 top-0 z-50 flex h-screen w-16 bg-sidebar">
    <div className="flex h-full w-16 flex-col px-2 py-4 text-sidebar-foreground">
      <div className="flex justify-center mb-3">
        <Popover open={isLogoPopoverOpen} onOpenChange={setIsLogoPopoverOpen}>
          <PopoverTrigger asChild>
              <button
                type="button"
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-sidebar text-sidebar-foreground"
                aria-label="Hyperview logo"
                onMouseEnter={handleLogoMouseEnter}
                onMouseLeave={handleLogoMouseLeave}
              >
              <svg
                className="w-8 h-8 text-sidebar-foreground"
                viewBox="0 0 133.88 91.13"
                role="img"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M64.97,14.8V1.93c0-1.07.86-1.93,1.93-1.93s1.93.86,1.93,1.93v12.87c0,1.07-.86,1.93-1.93,1.93s-1.93-.86-1.93-1.93Z"
                />
                <path
                  fill="currentColor"
                  d="M74.95,16.72l6.43-11.15c.53-.92,1.71-1.24,2.64-.71.92.53,1.24,1.71.71,2.64l-6.43,11.15c-.53.92-1.71,1.24-2.64.71-.92-.53-1.24-1.71-.71-2.64Z"
                />
                <path
                  fill="currentColor"
                  d="M58.85,16.72l-6.43-11.15c-.53-.92-1.71-1.24-2.64-.71-.92.53-1.24,1.71-.71,2.64l6.43,11.15c.53.92,1.71,1.24,2.64.71.92-.53,1.24-1.71.71-2.64Z"
                />
                <path
                  fill="currentColor"
                  d="M128.77,56.65c0-3.35.9-13.3,1.19-16.58.19-2.22-.07-3.44-.43-4.06-.26-.46-.67-.78-1.66-.84-.71-.05-1.49.16-2.07.68-.54.49-1.15,1.48-1.15,3.47v.11s-.89,15.12-.89,15.12c-.03.54-.29,1.05-.72,1.39-.42.34-.97.49-1.51.4l-9.29-1.47-10.02-1.33c-.93-.12-1.63-.89-1.67-1.82l-.55-11.95v-.1c-.25-4.76-.49-9.1-.49-10.44,0-3.75-.63-5.33-1.19-5.99-.44-.53-1.08-.76-2.44-.76-.49,0-.83.1-1.09.25-.25.15-.54.41-.82.94-.59,1.12-1.02,3.22-.86,6.88.21,4.76.53,8.31.85,11.51.32,3.2.63,6.1.81,9.47.27,5.28.25,8.92.03,11.39-.11,1.23-.27,2.23-.48,3.02-.2.75-.51,1.51-1.04,2.07-.64.69-1.56,1.02-2.52.79-.76-.18-1.29-.66-1.58-.97-.61-.64-1.04-1.46-1.21-1.89-.98-2.47-4.01-8.22-8.12-11.46-1.2-.95-2.07-1.22-2.62-1.26-.52-.04-.89.11-1.19.35-.33.26-.57.63-.69.99-.04.13-.06.22-.07.27,1.11,1.88,5.53,8.77,7.61,15.76,1.55,5.21,5.29,10.52,8.09,12.8,2.71,2.2,7.57,3.57,13.05,3.84,5.42.27,11.01-.57,14.95-2.33,7.6-3.41,9.14-10.91,9.84-14.16.54-2.52.55-5.22.4-7.72-.07-1.25-.18-2.41-.27-3.49-.09-1.04-.17-2.05-.17-2.88ZM110.59,24.28c0-1.17-.31-2.21-.83-2.91-.47-.63-1.16-1.07-2.26-1.07-.91,0-1.52.11-1.94.29-.39.16-.71.42-1,.9-.68,1.1-1.18,3.3-1.18,7.69l.48,10.39c.18,3.47.37,7.22.49,10.35l6.25.83v-26.47ZM114.45,51.31l5.58.88.76-12.93v-9.97c0-1.37-.56-2.21-1.22-2.74-.74-.6-1.6-.81-2-.81-.74,0-1.5.11-2.05.5-.42.3-1.07,1.01-1.07,3.05v22.01ZM124.65,32c1.15-.58,2.39-.76,3.48-.69,1.97.13,3.71.96,4.75,2.77.95,1.65,1.15,3.83.93,6.31-.3,3.43-1.18,13.11-1.18,16.25,0,.63.06,1.47.16,2.54.09,1.05.21,2.28.28,3.6.15,2.63.16,5.72-.48,8.75-.67,3.15-2.49,12.6-12.03,16.88-4.64,2.08-10.87,2.95-16.72,2.66-5.79-.28-11.64-1.73-15.29-4.7-3.44-2.8-7.59-8.79-9.35-14.69-1.99-6.67-6.29-13.24-7.36-15.11-.63-1.1-.43-2.4-.14-3.27.33-.98.98-2,1.94-2.77,1-.79,2.32-1.29,3.88-1.18,1.53.12,3.11.81,4.72,2.08,4.14,3.27,7.18,8.43,8.67,11.59.02-.15.03-.3.05-.46.19-2.21.23-5.65-.04-10.86-.17-3.26-.47-6.05-.79-9.29-.32-3.24-.65-6.87-.87-11.72-.17-3.88.23-6.82,1.31-8.86.56-1.06,1.32-1.9,2.28-2.46.96-.56,2.01-.78,3.04-.78,1.53,0,3.43.22,4.95,1.66.13-.29.28-.56.44-.81.7-1.13,1.63-1.93,2.77-2.42,1.1-.47,2.29-.6,3.46-.6,2.36,0,4.19,1.04,5.36,2.63.76,1.03,1.22,2.23,1.44,3.46,1.25-.57,2.51-.64,3.28-.64,1.31,0,3.02.53,4.43,1.68,1.49,1.21,2.65,3.11,2.65,5.74v2.71Z"
                />
                <path
                  fill="currentColor"
                  d="M5.12,56.65c0-3.35-.9-13.3-1.19-16.58-.19-2.22.07-3.44.43-4.06.26-.46.67-.78,1.66-.84.71-.05,1.49.16,2.07.68.54.49,1.15,1.48,1.15,3.47v.11s.89,15.12.89,15.12c.03.54.29,1.05.72,1.39.42.34.97.49,1.51.4l9.29-1.47,10.02-1.33c.93-.12,1.63-.89,1.67-1.82l.55-11.95v-.1c.25-4.76.48-9.1.48-10.44,0-3.75.63-5.33,1.19-5.99.44-.53,1.08-.76,2.44-.76.49,0,.83.1,1.09.25.25.15.54.41.82.94.59,1.12,1.02,3.22.86,6.88-.21,4.76-.53,8.31-.85,11.51-.32,3.2-.63,6.1-.81,9.47-.27,5.28-.25,8.92-.03,11.39.11,1.23.27,2.23.48,3.02.2.75.51,1.51,1.04,2.07.65.69,1.56,1.02,2.52.79.76-.18,1.29-.66,1.58-.97.61-.64,1.04-1.46,1.21-1.89.98-2.47,4.01-8.22,8.12-11.46,1.2-.95,2.07-1.22,2.62-1.26.52-.04.89.11,1.19.35.33.26.57.63.69.99.04.13.06.22.07.27-1.11,1.88-5.53,8.77-7.61,15.76-1.55,5.21-5.29,10.52-8.09,12.8-2.71,2.2-7.57,3.57-13.05,3.84-5.43.27-11.01-.57-14.95-2.33-7.6-3.41-9.15-10.91-9.84-14.16-.54-2.52-.55-5.22-.4-7.72.07-1.25.18-2.41.27-3.49.09-1.04.17-2.05.17-2.88ZM23.29,24.28c0-1.17.31-2.21.83-2.91.47-.63,1.16-1.07,2.26-1.07.91,0,1.52.11,1.95.29.39.16.71.42,1,.9.68,1.1,1.18,3.3,1.18,7.69l-.48,10.39c-.18,3.47-.37,7.22-.49,10.35l-6.25.83v-26.47ZM19.43,51.31l-5.58.88-.76-12.93v-9.97c0-1.37.56-2.21,1.22-2.74.74-.6,1.59-.81,2-.81.74,0,1.5.11,2.05.5.42.3,1.07,1.01,1.07,3.05v22.01ZM9.24,32c-1.15-.58-2.39-.76-3.48-.69-1.97.13-3.7.96-4.75,2.77-.95,1.65-1.15,3.83-.93,6.31.3,3.43,1.18,13.11,1.18,16.25,0,.63-.07,1.47-.16,2.54-.09,1.05-.21,2.28-.28,3.6-.15,2.63-.16,5.72.48,8.75.67,3.15,2.49,12.6,12.04,16.88,4.64,2.08,10.87,2.95,16.72,2.66,5.79-.28,11.65-1.73,15.29-4.7,3.44-2.8,7.59-8.79,9.35-14.69,1.99-6.67,6.29-13.24,7.36-15.11.63-1.1.43-2.4.14-3.27-.33-.98-.98-2-1.94-2.77-1-.79-2.32-1.29-3.88-1.18-1.53.12-3.11.81-4.72,2.08-4.14,3.27-7.18,8.43-8.67,11.59-.02-.15-.03-.3-.05-.46-.19-2.21-.23-5.65.04-10.86.17-3.26.47-6.05.79-9.29.32-3.24.65-6.87.87-11.72.17-3.88-.23-6.82-1.31-8.86-.56-1.06-1.32-1.9-2.28-2.46-.96-.56-2.01-.78-3.04-.78-1.53,0-3.43.22-4.95,1.66-.13-.29-.28-.56-.44-.81-.7-1.13-1.63-1.93-2.77-2.42-1.1-.47-2.28-.6-3.46-.6-2.36,0-4.19,1.04-5.36,2.63-.76,1.03-1.22,2.23-1.44,3.46-1.25-.57-2.51-.64-3.27-.64-1.31,0-3.02.53-4.43,1.68-1.49,1.21-2.64,3.11-2.64,5.74v2.71Z"
                />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" className="bg-sidebar text-sidebar-foreground border border-sidebar-border shadow-xl rounded-lg p-4 w-[900px]" onMouseEnter={handleLogoMouseEnter} onMouseLeave={handleLogoMouseLeave}>
            <div className="flex gap-4">
              {highlightCards.map((card) => (
                <a
                  key={card.title}
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg p-4 transition-colors hover:bg-muted/60 no-underline"
                >
                  <div className="mb-3">{card.icon}</div>
                  <div className="text-sm font-semibold text-sidebar-foreground mb-1">{card.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.text}</p>
                </a>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-1 flex-col items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.action === 'conversations'
              ? isConversationDrawerOpen
              : item.action === 'new-project'
                ? activeNavItem === 'new-project' ||
                  ((activeNavItem === 'code' ||
                    activeNavItem === 'chat-start' ||
                    activeNavItem === 'new-chat-start') &&
                    isHomeRoute)
                : activeNavItem === item.action;
          return (
            <LeftNavTooltip key={item.action} label={item.label}>
              <button
                type="button"
                aria-label={item.label}
                aria-pressed={isActive}
                data-conversation-toggle={item.action === 'conversations' ? 'true' : undefined}
                onClick={() => onNavItemClick(item.action)}
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <span className="inline-flex leading-none transition-transform duration-500 ease-out">
                  <Icon className="w-5 h-5" />
                </span>
              </button>
            </LeftNavTooltip>
          );
        })}
      </div>
      <div className="mt-auto px-2 space-y-2">
        {/* UX tours entry points */}
        <Popover open={isUxFlowMenuOpen} onOpenChange={onUxFlowMenuOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent transition-colors border border-transparent hover:border-border"
              aria-label="UX flow tutorials"
              data-tour-id="left-nav.ux-flow-icon"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="end"
            sideOffset={8}
            className="bg-sidebar text-sidebar-foreground border border-border rounded-xl w-56 p-3"
          >
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              UX Flows
            </div>
            {uxTourLinks.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No UX tours available yet.
              </div>
            ) : (
              uxTourLinks.map((tour) => (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => {
                    onUxFlowMenuOpenChange?.(false);
                    onStartUxTour?.(tour.id);
                  }}
                  className="inline-flex items-center gap-2 text-sm text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-2 transition-colors text-left"
                >
                  {tour.label}
                </button>
              ))
            )}
            <div className="mt-3 border-t border-border pt-2">
              <div className="px-1 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Prototypes
              </div>
              {prototypeMenuEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    onUxFlowMenuOpenChange?.(false);
                    onNavItemClick(entry.navAction);
                  }}
                  className="inline-flex items-center gap-2 text-sm text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-2 transition-colors text-left"
                >
                  {entry.label}
                </button>
              ))}
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Inspector mode
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Click any element to view code.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isInspectorEnabled}
                  data-testid="inspector-toggle"
                  data-tour-id="left-nav.inspector-toggle"
                  onClick={onInspectorToggle}
                  className={`h-6 w-10 rounded-full border border-border flex items-center px-0.5 transition-colors ${
                    isInspectorEnabled ? 'bg-foreground/80' : 'bg-muted/60'
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-background shadow transition-transform ${
                      isInspectorEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-sidebar-accent text-sidebar-foreground transition-colors hover:bg-sidebar-accent/80',
                isOrgAccount && 'ring-2 ring-white'
              )}
              aria-label={isOrgAccount ? 'Open account menu, organization workspace' : 'Open account menu'}
            >
              <User className="h-4 w-4" aria-hidden="true" />
              {isOrgAccount && (
                <span
                  className="pointer-events-none absolute -left-1.5 -top-1.5 z-10 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-foreground shadow-sm"
                  aria-hidden
                >
                  <span className="text-[8px] font-semibold leading-none text-black">{orgInitial}</span>
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-max max-w-[calc(100vw-2rem)] bg-sidebar p-6 text-sidebar-foreground [max-height:min(90dvh,calc(100dvh-2rem))] overflow-y-auto rounded-xl border border-border -translate-y-12"
          >
            <div
              className={cn(
                'inline-grid w-max max-w-full items-stretch gap-4 overflow-hidden',
                selectedWorkspace.type === 'org'
                  ? 'grid-cols-1'
                  : 'grid-cols-[max-content_max-content]',
              )}
            >
              {/* Left column: Account menu */}
              <div className="flex w-min min-w-[220px] flex-col">
                <div className="text-lg font-semibold mb-4">Account</div>

                {/* Workspace selector — same dropdown pattern as Settings org selector */}
                <div className="mb-3">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="group flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/20 px-4 text-left text-sm text-sidebar-foreground transition-colors hover:bg-muted/60"
                        aria-label="Select workspace"
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          {selectedWorkspace.type === 'org' ? (
                            <Building2 className="h-4 w-4 shrink-0 !text-muted-foreground transition-colors group-hover:!text-white" />
                          ) : (
                            <User className="h-4 w-4 shrink-0 !text-muted-foreground transition-colors group-hover:!text-white" />
                          )}
                          <span className="truncate">{selectedWorkspace.name}</span>
                          {selectedWorkspace.role ? (
                            <span className="ml-auto shrink-0 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              {selectedWorkspace.role}
                            </span>
                          ) : null}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 !text-muted-foreground transition-colors group-hover:!text-white" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="z-[100] w-[var(--radix-dropdown-menu-trigger-width)] border-border bg-sidebar text-sidebar-foreground"
                    >
                      {personalWorkspaces.map((org) => (
                        <DropdownMenuItem
                          key={org.id}
                          className="cursor-pointer text-sidebar-foreground"
                          onClick={() => onActiveWorkspaceChange?.(org.id)}
                        >
                          <span className="flex w-full items-center gap-2">
                            <User className="h-4 w-4 shrink-0" />
                            <span>{org.name}</span>
                          </span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      {gitOrganizationWorkspaces.length > 0 ? (
                        gitOrganizationWorkspaces.map((org) => (
                          <DropdownMenuItem
                            key={org.id}
                            className="cursor-pointer text-sidebar-foreground"
                            onClick={() => onActiveWorkspaceChange?.(org.id)}
                          >
                            <span className="flex w-full items-center gap-2">
                              <Building2 className="h-4 w-4 shrink-0" />
                              <span>{org.name}</span>
                              {org.role ? (
                                <span className="ml-auto rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                  {org.role}
                                </span>
                              ) : null}
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
                </div>

                <div className="flex min-h-0 flex-col">
                  {accountNavSections.map((section, sectionIndex) => (
                    <React.Fragment key={`${section.label ?? 'nav'}-${sectionIndex}`}>
                      {sectionIndex > 0 ? <div className="border-t border-sidebar-border my-3" /> : null}
                      {section.label ? (
                        <div className="mb-1.5 px-3">
                          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            {section.label}
                          </span>
                        </div>
                      ) : null}
                      <div className="space-y-0.5">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => onNavItemClick(`settings/${item.tabId}`)}
                              className="group inline-flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs text-sidebar-foreground transition-colors hover:bg-muted/60 hover:text-white"
                            >
                              <Icon
                                className={cn(
                                  'h-4 w-4 shrink-0 transition-colors',
                                  isSettingsTabPathActive(location.pathname, item.tabId)
                                    ? '!text-white'
                                    : '!text-muted-foreground group-hover:!text-white',
                                )}
                                aria-hidden
                              />
                              <span className="min-w-0 truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </React.Fragment>
                  ))}

                  <div className="border-t border-sidebar-border my-3" />

                  <div className="space-y-0.5">
                    <button type="button" className="group inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors">
                      <UserPlus className="w-4 h-4 shrink-0 !text-muted-foreground transition-colors group-hover:!text-white" />
                      Invite Team
                    </button>
                    {selectedWorkspace.type === 'personal' ? (
                      <button type="button" className="group inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors">
                        <Plus className="w-4 h-4 shrink-0 !text-muted-foreground transition-colors group-hover:!text-white" />
                        Create New Organization
                      </button>
                    ) : null}
                    <a
                      href="https://docs.openhands.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 shrink-0 !text-muted-foreground transition-colors group-hover:!text-white" />
                      Documentation
                    </a>
                    <button type="button" className="group inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors">
                      <LogOut className="w-4 h-4 shrink-0 !text-muted-foreground transition-colors group-hover:!text-white" />
                      Log Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Enterprise CTA — personal workspace only (hidden on org accounts) */}
              {selectedWorkspace.type === 'personal' ? (
                <div className="flex h-full min-h-0 w-max max-w-[min(20rem,calc(100vw-3rem))] flex-col">
                  <EnterpriseCtaCard
                    showIcon
                    className="pointer-events-auto h-full min-h-0 rounded-lg"
                    onLearnMoreClick={onEnterpriseLearnMoreClick}
                  />
                </div>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  </aside>
  );
};
