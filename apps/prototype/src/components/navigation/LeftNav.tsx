import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  Archive,
  Boxes,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  Cloud,
  Clock3,
  Cpu,
  ExternalLink,
  Filter,
  Folder,
  FolderX,
  FolderMinus,
  FolderOpen,
  FolderPlus,
  Settings,
  GitBranch,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Monitor,
  MoreVertical,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  PlusCircle,
  StopCircle,
  SquareKanban,
  Star,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ConnectBackendModal } from '../common/ConnectBackendModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Theme, ThemeElement } from '../../types/theme';
import { cn } from '../../lib/utils';
import { getAccountPopoverNavSections } from '../../config/settingsWorkspaceNav';
import { accountWorkspaceOptions, isOrgAdminOrOwner } from '../../config/accountWorkspaces';
import { type ConversationSummary } from '../../data/conversations';
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

type BackendOption = {
  id: string;
  label: string;
  kind: 'local' | 'cloud';
  color: string;
};

const defaultBackendOptions: BackendOption[] = [
  { id: 'local', label: 'Local', kind: 'local', color: '#64748b' },
  { id: 'hetzner', label: 'Hetzner', kind: 'cloud', color: '#3b82f6' },
  { id: 'aws', label: 'AWS', kind: 'cloud', color: '#f59e0b' },
];

function AutomationsIcon({ className, spinOuter = false }: { className?: string; spinOuter?: boolean }) {
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
        <g className={cn(spinOuter && 'origin-center animate-spin [transform-box:fill-box]')}>
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
        </g>
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

function EnvironmentSwitchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 74.17 22" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <g>
        <rect x="1" y="1" width="20" height="8" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="13" width="20" height="8" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="5" y1="5" x2="5.01" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="17" x2="5.01" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g>
        <rect x="53.17" y="1" width="20" height="8" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="53.17" y="13" width="20" height="8" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="57.17" y1="5" x2="57.18" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="57.17" y1="17" x2="57.18" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g>
        <path d="M43.09,7l4,4-4,4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M27.09,11h20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M31.09,7l-4,4,4,4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

const navItems = [
  { icon: Plus, label: 'New', action: 'new-project' },
  { icon: AutomationsIcon, label: 'Automations', action: 'automations' },
  { icon: Boxes, label: 'Extensions', action: 'extensions' },
];

interface ConversationFolder {
  id: string;
  label: string;
  conversations: ConversationSummary[];
}

type ConversationOrganizeBy = 'project' | 'chronological' | 'type';

const TYPE_GROUP_LIMIT = 5;

function getConversationFolderName(conversation: ConversationSummary): string {
  if (conversation.repo === 'No Repository') return 'No Repo';
  if (conversation.tag === 'Automation') return 'Sidekicks';

  return conversation.repo.split('/').at(-1) ?? conversation.repo;
}

function buildConversationFolders(conversations: ConversationSummary[]): ConversationFolder[] {
  const folders = conversations.reduce<Map<string, ConversationSummary[]>>((acc, conversation) => {
    const folderName = getConversationFolderName(conversation);
    acc.set(folderName, [...(acc.get(folderName) ?? []), conversation]);
    return acc;
  }, new Map());

  return Array.from(folders.entries()).map(([label, folderConversations]) => ({
    id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    label,
    conversations: [...folderConversations].sort((a, b) => Number(Boolean(a.archived)) - Number(Boolean(b.archived))),
  }));
}

function buildConversationTypeFolders(conversations: ConversationSummary[]): ConversationFolder[] {
  const automationConversations = conversations.filter(
    (conversation) => conversation.tag === 'Automation' && !conversation.archived
  );
  const regularConversations = conversations.filter(
    (conversation) => conversation.tag !== 'Automation' && !conversation.archived
  );
  const archivedConversations = conversations.filter((conversation) => conversation.archived);

  return [
    { id: 'automation', label: 'Automation', conversations: automationConversations },
    { id: 'conversation', label: 'Conversation', conversations: regularConversations },
    { id: 'archived', label: 'Archived', conversations: archivedConversations },
  ].filter((folder) => folder.conversations.length > 0);
}

function ThreadList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNavItemClick,
  onStartConversationClick,
}: {
  conversations: ConversationSummary[];
  activeConversationId?: string | null;
  onSelectConversation?: (conversation: ConversationSummary) => void;
  onNavItemClick: (action: string) => void;
  onStartConversationClick?: () => void;
}) {
  const folders = useMemo(() => buildConversationFolders(conversations), [conversations]);
  const typeFolders = useMemo(() => buildConversationTypeFolders(conversations), [conversations]);
  const chronologicalConversations = useMemo(
    () => [...conversations].sort((a, b) => Number(Boolean(a.archived)) - Number(Boolean(b.archived))),
    [conversations]
  );
  const automationIndicatorIds = useMemo(
    () =>
      conversations
        .filter((conversation) => conversation.tag === 'Automation' && !conversation.archived)
        .slice(0, 2)
        .map((conversation) => conversation.id),
    [conversations]
  );
  const [organizeBy, setOrganizeBy] = useState<ConversationOrganizeBy>('project');
  const [sortBy, setSortBy] = useState<'created' | 'updated'>('updated');
  const [showFilter, setShowFilter] = useState<'all' | 'relevant'>('all');
  const [visibleMetadata, setVisibleMetadata] = useState({
    agent: false,
    llmProfiles: false,
    repoBranch: false,
  });
  const [collapsedFolderIds, setCollapsedFolderIds] = useState<Set<string>>(() => new Set());
  const [expandedTypeGroupIds, setExpandedTypeGroupIds] = useState<Set<string>>(() => new Set());

  const toggleFolder = (folderId: string) => {
    setCollapsedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleGroupAddClick = (groupId: string) => {
    if (organizeBy === 'type' && groupId === 'automation') {
      onNavItemClick('automations');
      return;
    }

    if (organizeBy === 'type' && groupId === 'conversation') {
      onStartConversationClick?.();
    }
  };

  const filterSections = [
    {
      label: 'Organize',
      value: organizeBy,
      onSelect: (id: string) => setOrganizeBy(id as ConversationOrganizeBy),
      items: [
        { id: 'project', label: 'By project', icon: Folder },
        { id: 'chronological', label: 'Chronological list', icon: Clock3 },
        { id: 'type', label: 'Type', icon: MessageCircle },
      ],
    },
    {
      label: 'Sort by',
      value: sortBy,
      onSelect: (id: string) => setSortBy(id as 'created' | 'updated'),
      items: [
        { id: 'created', label: 'Created', icon: PlusCircle },
        { id: 'updated', label: 'Updated', icon: MessageCircle },
      ],
    },
    {
      label: 'Show',
      value: showFilter,
      onSelect: (id: string) => setShowFilter(id as 'all' | 'relevant'),
      items: [
        { id: 'all', label: 'All threads', icon: MessageCircle },
        { id: 'relevant', label: 'Relevant', icon: Star },
      ],
    },
    {
      label: 'Metadata',
      value: visibleMetadata,
      onSelect: (id: string) => {
        setVisibleMetadata((prev) => {
          if (id === 'agent') return { ...prev, agent: !prev.agent };
          if (id === 'llm-profiles') return { ...prev, llmProfiles: !prev.llmProfiles };
          return { ...prev, repoBranch: !prev.repoBranch };
        });
      },
      items: [
        { id: 'agent', label: 'Agent', icon: Bot },
        { id: 'llm-profiles', label: 'LLM Profile', icon: Cpu },
        { id: 'repo-branch', label: 'Repo and Branch', icon: GitBranch },
      ],
    },
  ] as const;

  return (
    <div className="mt-4 min-h-0">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-medium text-muted-foreground">Conversations</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Create thread folder"
          >
            <FolderPlus className="h-4 w-4" aria-hidden />
          </button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Filter conversations"
              >
                <Filter className="h-4 w-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-64"
            >
              {filterSections.map((section, sectionIndex) => (
                <React.Fragment key={section.label}>
                  {sectionIndex > 0 ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuLabel className="py-1 text-xs text-muted-foreground">
                    {section.label}
                  </DropdownMenuLabel>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                      const isSelected =
                        section.label === 'Metadata'
                          ? item.id === 'agent'
                            ? visibleMetadata.agent
                            : item.id === 'llm-profiles'
                              ? visibleMetadata.llmProfiles
                              : visibleMetadata.repoBranch
                          : section.value === item.id;

                    return (
                      <DropdownMenuItem
                        key={item.id}
                        className="cursor-pointer gap-2 py-1 text-xs"
                        onSelect={() => section.onSelect(item.id)}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {isSelected ? <Check className="ml-auto h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
                      </DropdownMenuItem>
                    );
                  })}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <nav aria-label="Conversation threads" className="space-y-3">
        {(organizeBy === 'project'
          ? folders.map((folder) => ({
              id: folder.id,
              label: folder.label,
              conversations: folder.conversations,
              totalCount: folder.conversations.length,
            }))
          : organizeBy === 'type'
            ? typeFolders.map((folder) => {
                const isExpanded = expandedTypeGroupIds.has(folder.id);
                return {
                  id: folder.id,
                  label: folder.label,
                  conversations: isExpanded ? folder.conversations : folder.conversations.slice(0, TYPE_GROUP_LIMIT),
                  totalCount: folder.conversations.length,
                };
              })
            : [
                {
                  id: 'chronological',
                  label: null,
                  conversations: chronologicalConversations,
                  totalCount: chronologicalConversations.length,
                },
              ]
        ).map((group) => {
          const isFolderCollapsed = collapsedFolderIds.has(group.id);
          const isNoRepoFolder = group.id === 'no-repo';
          const hasMoreTypeConversations =
            organizeBy === 'type' && group.totalCount > group.conversations.length;
          const showGroupAddButton = organizeBy !== 'type' || group.id !== 'archived';
          const typeGroupIcon =
            organizeBy === 'type' && group.id === 'automation' ? (
              <AutomationsIcon className="absolute inset-0 h-4 w-4" />
            ) : organizeBy === 'type' && group.id === 'conversation' ? (
              <MessageCircle className="absolute inset-0 h-4 w-4" />
            ) : organizeBy === 'type' && group.id === 'archived' ? (
              <Archive className="absolute inset-0 h-4 w-4" />
            ) : null;

          return (
          <section key={group.id} aria-labelledby={group.label ? `thread-folder-${group.id}` : undefined}>
            {group.label ? (
              <div
                role="button"
                tabIndex={0}
                aria-expanded={!isFolderCollapsed}
                id={`thread-folder-${group.id}`}
                onClick={() => toggleFolder(group.id)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  toggleFolder(group.id);
                }}
                className="group/folder flex h-8 min-w-0 cursor-pointer items-center gap-2 rounded-md px-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:bg-sidebar-accent focus-visible:ring-1 focus-visible:ring-ring"
              >
                <span className="relative h-4 w-4 shrink-0" aria-hidden>
                  {typeGroupIcon ? (
                    typeGroupIcon
                  ) : isNoRepoFolder ? (
                    <FolderX className="absolute inset-0 h-4 w-4 opacity-100" />
                  ) : (
                    <>
                      <Folder className="absolute inset-0 h-4 w-4 opacity-100 transition-opacity group-hover/folder:opacity-0 group-focus-visible/folder:opacity-0" />
                      {isFolderCollapsed ? (
                        <FolderOpen className="absolute inset-0 h-4 w-4 opacity-0 transition-opacity group-hover/folder:opacity-100 group-focus-visible/folder:opacity-100" />
                      ) : (
                        <FolderMinus className="absolute inset-0 h-4 w-4 opacity-0 transition-opacity group-hover/folder:opacity-100 group-focus-visible/folder:opacity-100" />
                      )}
                    </>
                  )}
                </span>
                <span className="truncate">{group.label}</span>
                <div className="ml-auto flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/folder:opacity-100 group-focus-within/folder:opacity-100">
                  {showGroupAddButton ? (
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      aria-label={`Add conversation to ${group.label}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleGroupAddClick(group.id);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  ) : null}
                  {organizeBy !== 'type' ? (
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          aria-label={`${group.label} folder options`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MoreVertical className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={6} className="w-44">
                        <DropdownMenuItem className="cursor-pointer">Rename folder</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">New conversation</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">Archive folder</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </div>
            ) : null}
            {!isFolderCollapsed ? (
            <div className="space-y-0.5">
              {group.conversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                const automationIndicatorIndex = automationIndicatorIds.indexOf(conversation.id);
                const agentName = conversation.agent ?? 'OpenHands Agent';
                const metadataRows = [
                  visibleMetadata.repoBranch
                    ? [conversation.repo, conversation.branch].filter(Boolean).join(' · ')
                    : null,
                  visibleMetadata.agent ? agentName : null,
                  visibleMetadata.llmProfiles ? conversation.model : null,
                ].filter(Boolean);
                const metadataText = metadataRows.join(' · ');

                return (
                  <div
                    key={conversation.id}
                    role="button"
                    tabIndex={0}
                    data-testid="left-nav-thread"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onSelectConversation?.(conversation)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      onSelectConversation?.(conversation);
                    }}
                    className={cn(
                      'cursor-pointer',
                      'group relative flex min-h-8 w-full min-w-0 items-start gap-2 rounded-lg py-1.5 pl-7 pr-2 text-left text-sm outline-none transition-colors',
                      'text-sidebar-foreground hover:bg-sidebar-accent focus-visible:bg-sidebar-accent focus-visible:ring-1 focus-visible:ring-ring',
                      isActive && 'bg-sidebar-accent',
                      conversation.archived && 'text-muted-foreground',
                    )}
                  >
                    {conversation.archived ? (
                      <Archive
                        className="absolute left-2.5 top-[0.9375rem] h-3 w-3 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                    ) : conversation.tag === 'Automation' ? (
                      automationIndicatorIndex >= 0 ? (
                        <AutomationsIcon
                          spinOuter={automationIndicatorIndex === 0}
                          className={cn(
                            'absolute left-2 top-[0.9375rem] h-4 w-4 -translate-y-1/2',
                            automationIndicatorIndex === 0 ? 'text-success' : 'text-muted-foreground'
                          )}
                        />
                      ) : (
                        <span
                          className={cn(
                            'absolute left-3 top-[0.9375rem] h-1.5 w-1.5 -translate-y-1/2 rounded-full',
                            conversation.status === 'running' ? 'bg-success' : 'bg-muted-foreground/60'
                          )}
                          aria-hidden
                        />
                      )
                    ) : (
                      <span
                        className={cn(
                          'absolute left-3 top-[0.9375rem] h-1.5 w-1.5 -translate-y-1/2 rounded-full',
                          conversation.status === 'running' ? 'bg-success' : 'bg-muted-foreground/60'
                        )}
                        aria-hidden
                      />
                    )}
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="min-w-0 truncate pr-1">{conversation.name}</span>
                      {metadataText ? (
                        <span className="min-w-0 truncate text-xs text-muted-foreground">
                          {metadataText}
                        </span>
                      ) : null}
                    </span>
                    <span className="relative h-5 shrink-0 pt-0.5">
                      <time className="block text-xs text-muted-foreground transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0">
                        {conversation.time}
                      </time>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="absolute right-0 top-0.5 inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group-hover:opacity-100 group-focus-visible:opacity-100"
                            aria-label={`${conversation.name} options`}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => event.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" aria-hidden />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={6} className="w-64">
                          <DropdownMenuItem className="gap-2">
                            <ExternalLink className="h-4 w-4" aria-hidden />
                            View in New Tab
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <StopCircle className="h-4 w-4" aria-hidden />
                            Stop Conversation (Close Runtime)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2">
                            <Trash2 className="h-4 w-4" aria-hidden />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </span>
                  </div>
                );
              })}
              {hasMoreTypeConversations ? (
                <button
                  type="button"
                  className="ml-7 mt-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  onClick={() =>
                    setExpandedTypeGroupIds((prev) => {
                      const next = new Set(prev);
                      next.add(group.id);
                      return next;
                    })
                  }
                >
                  Show more
                </button>
              ) : null}
            </div>
            ) : null}
          </section>
          );
        })}
      </nav>
    </div>
  );
}

/** Hover/focus tooltip to the right of the trigger; hides after click until pointer re-enters. */
function LeftNavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <span
      data-left-nav-no-expand="true"
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
  onEnterpriseLearnMoreClick?: () => void;
  onStartConversationClick?: () => void;
  /** Workspace id from `accountWorkspaceOptions`; non-`personal` shows org chrome on the account button. */
  activeWorkspaceId?: string;
  onActiveWorkspaceChange?: (workspaceId: string) => void;
  /** True when the app is on `/` (home / create flow); used to highlight the Plus nav item while `activeNavItem` is still `code`. */
  isHomeRoute?: boolean;
  conversations?: ConversationSummary[];
  activeConversationId?: string | null;
  onSelectConversation?: (conversation: ConversationSummary) => void;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
}

export const LeftNav: React.FC<LeftNavProps> = ({
  isExpanded,
  onExpandChange,
  onNavItemClick,
  activeNavItem,
  onStartConversationClick,
  activeWorkspaceId = 'personal',
  onActiveWorkspaceChange,
  isHomeRoute = false,
  conversations = [],
  activeConversationId = null,
  onSelectConversation,
  width = 320,
  minWidth = 320,
  maxWidth = 480,
  onWidthChange,
}) => {
  const location = useLocation();
  const isBlankNewChatRoute = useMemo(() => {
    if (location.pathname !== '/chat') return false;
    return new URLSearchParams(location.search).get('setup') === 'none';
  }, [location.pathname, location.search]);
  const selectedWorkspace =
    accountWorkspaceOptions.find((o) => o.id === activeWorkspaceId) ?? accountWorkspaceOptions[0];
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
  const showOrgAdminDashboard = isOrgAdminOrOwner(activeWorkspaceId);
  const workspaceNavItems = [
    { icon: SquareKanban, label: 'Workspaces', action: 'dashboard' },
    ...(showOrgAdminDashboard
      ? [{ icon: LayoutDashboard, label: 'Admin dashboard', action: 'org-admin-dashboard' }]
      : []),
  ];
  const [isLogoPopoverOpen, setIsLogoPopoverOpen] = useState(false);
  const [isCollapsedRailHovered, setIsCollapsedRailHovered] = useState(false);
  const [isMiddleNavScrolled, setIsMiddleNavScrolled] = useState(false);
  const [isNavResizing, setIsNavResizing] = useState(false);
  const [backendOptions, setBackendOptions] = useState<BackendOption[]>(defaultBackendOptions);
  const [selectedBackendId, setSelectedBackendId] = useState(isOrgAccount ? 'hetzner' : 'local');
  const [connectBackendOpen, setConnectBackendOpen] = useState(false);
  const [environmentSwitchTarget, setEnvironmentSwitchTarget] = useState('');
  const [showEnvironmentSwitchOverlay, setShowEnvironmentSwitchOverlay] = useState(false);
  const logoPopoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navResizePointerIdRef = useRef<number | null>(null);
  const environmentSwitchHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedBackend = backendOptions.find((backend) => backend.id === selectedBackendId) ?? backendOptions[0]!;
  const SelectedBackendIcon = selectedBackend.kind === 'cloud' ? Cloud : Monitor;
  const selectedOrg = selectedWorkspace.type === 'org' ? selectedWorkspace : null;
  const isOrgEnvironmentSelected = selectedOrg !== null;
  const EnvironmentIcon = isOrgEnvironmentSelected ? Building2 : SelectedBackendIcon;
  const selectedEnvironmentLabel = selectedOrg ? selectedOrg.name : selectedBackend.label;
  const selectedEnvironmentInitial = selectedEnvironmentLabel.trim().charAt(0).toUpperCase() || '?';
  const selectedEnvironmentColor = selectedBackend.color;
  const showEnvironmentBadge = isOrgEnvironmentSelected || selectedBackend.id !== 'local';

  const triggerEnvironmentSwitchOverlay = (nextEnvironmentLabel: string) => {
    setEnvironmentSwitchTarget(nextEnvironmentLabel);
    setShowEnvironmentSwitchOverlay(true);

    if (environmentSwitchHideTimeoutRef.current) clearTimeout(environmentSwitchHideTimeoutRef.current);
    environmentSwitchHideTimeoutRef.current = setTimeout(() => {
      setShowEnvironmentSwitchOverlay(false);
    }, 980);
  };

  useEffect(() => {
    return () => {
      if (environmentSwitchHideTimeoutRef.current) clearTimeout(environmentSwitchHideTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (showEnvironmentSwitchOverlay) {
      document.body.setAttribute('data-environment-switching', 'true');
      return () => {
        document.body.removeAttribute('data-environment-switching');
      };
    }
    document.body.removeAttribute('data-environment-switching');
    return undefined;
  }, [showEnvironmentSwitchOverlay]);

  const handleSelectBackend = (backendId: string) => {
    const nextBackend = backendOptions.find((backend) => backend.id === backendId);
    if (!nextBackend) return;
    const isChangingEnvironment = selectedWorkspace.type === 'org' || selectedBackendId !== backendId;
    if (isChangingEnvironment) {
      triggerEnvironmentSwitchOverlay(nextBackend.label);
    }
    setSelectedBackendId(backendId);
    if (selectedWorkspace.type === 'org') {
      onActiveWorkspaceChange?.('personal');
    }
  };

  const handleSelectOrg = (orgId: string) => {
    const nextOrg = accountWorkspaceOptions.find((workspace) => workspace.id === orgId);
    if (nextOrg && selectedWorkspace.id !== orgId) {
      triggerEnvironmentSwitchOverlay(nextOrg.name);
    }
    onActiveWorkspaceChange?.(orgId);
    if (selectedBackend.kind !== 'cloud') {
      const preferredCloudBackend =
        backendOptions.find((backend) => backend.id === 'hetzner') ??
        backendOptions.find((backend) => backend.kind === 'cloud');
      if (preferredCloudBackend) {
        setSelectedBackendId(preferredCloudBackend.id);
      }
    }
  };

  const handleConnectBackend = ({ nickname, url, color }: { nickname: string; url: string; color: string }) => {
    let hostname = 'Custom Cloud';
    try {
      hostname = new URL(url).hostname || hostname;
    } catch {
      hostname = url.replace(/^https?:\/\//, '').split('/')[0] || hostname;
    }

    const nextBackend: BackendOption = {
      id: `custom-${Date.now()}`,
      label: nickname || hostname,
      kind: 'cloud',
      color,
    };

    setBackendOptions((prev) => [...prev, nextBackend]);
    setSelectedBackendId(nextBackend.id);
  };

  const isInteractiveSidebarTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest(
        'button, a, input, select, textarea, [role="button"], [role="separator"], [data-left-nav-no-expand="true"], [data-radix-popper-content-wrapper]'
      )
    );
  };

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

  const showCollapsedDrawerIcon = !isExpanded && isCollapsedRailHovered;
  const clampedWidth = Math.min(Math.max(width, minWidth), maxWidth);

  const handleResizePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (navResizePointerIdRef.current !== event.pointerId) return;
    onWidthChange?.(Math.min(Math.max(event.clientX, minWidth), maxWidth));
  };

  const handleResizePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (navResizePointerIdRef.current !== event.pointerId) return;
    navResizePointerIdRef.current = null;
    setIsNavResizing(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const renderNavButton = (item: (typeof navItems)[number] | (typeof workspaceNavItems)[number]) => {
    const Icon = item.icon;
    const isActive =
      item.action === 'new-project'
        ? activeNavItem === 'new-project' ||
          (activeNavItem === 'code' && isBlankNewChatRoute) ||
          ((activeNavItem === 'code' ||
            activeNavItem === 'chat-start' ||
            activeNavItem === 'new-chat-start' ||
            activeNavItem === 'old-chat-start') &&
            isHomeRoute)
        : activeNavItem === item.action;
    const navButton = (
      <button
        type="button"
        aria-label={item.label}
        aria-pressed={isActive}
        onClick={() => onNavItemClick(item.action)}
        className={cn(
          'inline-flex h-9 w-full items-center rounded-lg text-sm transition-colors',
          isExpanded ? 'gap-3 px-3' : 'justify-center px-0',
          isActive
            ? 'bg-sidebar-accent text-sidebar-foreground'
            : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
        )}
      >
        <span className="inline-flex leading-none transition-transform duration-500 ease-out">
          <Icon className="w-5 h-5" />
        </span>
        {isExpanded ? <span className="truncate">{item.label}</span> : null}
      </button>
    );

    return (
      <React.Fragment key={item.action}>
        {isExpanded ? navButton : <LeftNavTooltip label={item.label}>{navButton}</LeftNavTooltip>}
      </React.Fragment>
    );
  };

  return (
  <aside
    data-left-nav
    className={cn(
      'pointer-events-auto fixed left-0 top-0 z-50 flex h-screen border-r border-sidebar-border bg-sidebar',
      !isNavResizing && 'transition-[width] duration-200',
      !isExpanded && 'w-12'
    )}
    style={isExpanded ? { width: clampedWidth } : undefined}
    onMouseMove={() => {
      if (isExpanded) return;
      setIsCollapsedRailHovered(true);
    }}
    onMouseLeave={() => setIsCollapsedRailHovered(false)}
    onClickCapture={(event) => {
      if (isExpanded || isInteractiveSidebarTarget(event.target)) return;
      onExpandChange(true);
    }}
  >
    <div className={cn('flex h-full w-full flex-col py-4 text-sidebar-foreground', isExpanded ? 'px-3' : 'px-1')}>
      <div className={cn('flex items-center gap-1 pb-3', isExpanded ? 'justify-between' : 'justify-center')}>
        {showCollapsedDrawerIcon ? (
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Expand left navigation"
            aria-expanded={false}
            onClick={() => onExpandChange(true)}
          >
            <PanelLeftOpen className="h-5 w-5" aria-hidden />
          </button>
        ) : (
          <Popover open={false && isLogoPopoverOpen} onOpenChange={setIsLogoPopoverOpen}>
            <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground',
                    isExpanded && 'ml-1.5'
                  )}
                  aria-label="Hyperview logo"
                  onMouseEnter={handleLogoMouseEnter}
                  onMouseLeave={handleLogoMouseLeave}
                >
                <svg
                  className="h-7 w-7 text-sidebar-foreground"
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
        )}
        {isExpanded ? (
          <button
            type="button"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Collapse left navigation"
            aria-expanded={isExpanded}
            onClick={() => onExpandChange(false)}
          >
            <PanelLeftClose className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <div
        className={cn(
          'h-px shrink-0 bg-sidebar-border transition-opacity duration-200',
          isExpanded ? '-mx-3' : '-mx-1',
          isMiddleNavScrolled ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pt-3 scrollbar-on-hover',
          isExpanded ? '-mx-3' : '-mx-1'
        )}
        onScroll={(event) => setIsMiddleNavScrolled(event.currentTarget.scrollTop > 0)}
      >
        <div className={cn('flex min-h-0 flex-col', isExpanded ? 'px-3' : 'px-1')}>
          <div className="flex flex-col gap-1">
          {navItems.map(renderNavButton)}
          </div>
          <div className={cn('flex flex-col gap-1', !isExpanded && 'mt-1')}>
            {workspaceNavItems.map(renderNavButton)}
          </div>
          {isExpanded ? (
            <ThreadList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={onSelectConversation}
              onNavItemClick={onNavItemClick}
              onStartConversationClick={onStartConversationClick}
            />
          ) : null}
        </div>
      </div>
      <div
        className={cn(
          'mt-auto space-y-2',
          isExpanded
            ? '-mx-3 border-t border-sidebar-border px-4 pt-3'
            : 'flex flex-col items-center px-0'
        )}
      >
        <Popover>
          {isExpanded ? (
            <div className="flex h-10 w-full min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1">
                <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-border bg-muted/20 px-3 text-left text-sm text-sidebar-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                    aria-label={`Select environment, current selection is ${selectedEnvironmentLabel}`}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <EnvironmentIcon className="h-4 w-4 shrink-0 !text-muted-foreground transition-colors group-hover:!text-white" />
                      <span className="truncate">{selectedEnvironmentLabel}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 !text-muted-foreground transition-colors group-hover:!text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="z-[100] w-[var(--radix-dropdown-menu-trigger-width)] border-border bg-sidebar text-sidebar-foreground"
                >
                  {backendOptions.map((backend) => (
                    <DropdownMenuItem
                      key={backend.id}
                      className="cursor-pointer text-sidebar-foreground"
                      onClick={() => handleSelectBackend(backend.id)}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        {backend.kind === 'cloud' ? (
                          <Cloud className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        ) : (
                          <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        )}
                        <span className="truncate">{backend.label}</span>
                      </span>
                      {!isOrgEnvironmentSelected && selectedBackend.id === backend.id ? (
                        <Check className="h-4 w-4 shrink-0" aria-hidden />
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                  {gitOrganizationWorkspaces.length > 0 ? (
                    gitOrganizationWorkspaces.map((org) => (
                      <DropdownMenuItem
                        key={org.id}
                        className="cursor-pointer text-sidebar-foreground"
                        onClick={() => handleSelectOrg(org.id)}
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span className="truncate">{org.name}</span>
                        </span>
                        {isOrgEnvironmentSelected && selectedWorkspace.id === org.id ? (
                          <Check className="h-4 w-4 shrink-0" aria-hidden />
                        ) : null}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div
                      data-testid="left-nav-orgs-empty"
                      className="mx-1 mb-1 rounded-md border border-border bg-muted/20 px-3 py-2.5 text-center text-sm text-muted-foreground"
                    >
                      No git organizations found
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-sidebar-foreground"
                    onClick={() => setConnectBackendOpen(true)}
                  >
                    <Plus className="h-4 w-4 shrink-0" aria-hidden />
                    Connect New
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-sidebar-foreground"
                    onClick={() => onNavItemClick('settings/backend-server')}
                  >
                    <Settings className="h-4 w-4 shrink-0" aria-hidden />
                    Configure
                  </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="Open account settings"
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                </button>
              </PopoverTrigger>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="Open account settings"
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-sidebar-accent text-sidebar-foreground transition-colors hover:bg-sidebar-accent/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                    )}
                    style={showEnvironmentBadge ? { borderColor: selectedEnvironmentColor } : undefined}
                    aria-label={`Select environment, current selection is ${selectedEnvironmentLabel}`}
                  >
                    <EnvironmentIcon className="h-4 w-4" aria-hidden="true" />
                    {showEnvironmentBadge && (
                      <span
                        className="pointer-events-none absolute -left-1.5 -top-1.5 z-10 flex h-[15px] w-[15px] items-center justify-center rounded-full shadow-sm"
                        style={{ backgroundColor: selectedEnvironmentColor }}
                        aria-hidden
                      >
                        <span className="text-[8px] font-semibold leading-none text-white">
                          {selectedEnvironmentInitial}
                        </span>
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="top"
                  sideOffset={8}
                  className="z-[100] w-64 border-border bg-sidebar text-sidebar-foreground"
                >
                  {backendOptions.map((backend) => (
                    <DropdownMenuItem
                      key={backend.id}
                      className="cursor-pointer text-sidebar-foreground"
                      onClick={() => handleSelectBackend(backend.id)}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        {backend.kind === 'cloud' ? (
                          <Cloud className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        ) : (
                          <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        )}
                        <span className="truncate">{backend.label}</span>
                      </span>
                      {!isOrgEnvironmentSelected && selectedBackend.id === backend.id ? (
                        <Check className="h-4 w-4 shrink-0" aria-hidden />
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                  {gitOrganizationWorkspaces.length > 0 ? (
                    gitOrganizationWorkspaces.map((org) => (
                      <DropdownMenuItem
                        key={org.id}
                        className="cursor-pointer text-sidebar-foreground"
                        onClick={() => handleSelectOrg(org.id)}
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span className="truncate">{org.name}</span>
                        </span>
                        {isOrgEnvironmentSelected && selectedWorkspace.id === org.id ? (
                          <Check className="h-4 w-4 shrink-0" aria-hidden />
                        ) : null}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div
                      data-testid="left-nav-orgs-empty-collapsed"
                      className="mx-1 mb-1 rounded-md border border-border bg-muted/20 px-3 py-2.5 text-center text-sm text-muted-foreground"
                    >
                      No git organizations found
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-sidebar-foreground"
                    onClick={() => setConnectBackendOpen(true)}
                  >
                    <Plus className="h-4 w-4 shrink-0" aria-hidden />
                    Connect New
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-sidebar-foreground"
                    onClick={() => onNavItemClick('settings/backend-server')}
                  >
                    <Settings className="h-4 w-4 shrink-0" aria-hidden />
                    Configure
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            showScrollbar={false}
            hugContent
            className="max-w-[calc(100vw-2rem)] bg-sidebar p-4 text-sidebar-foreground max-h-[min(90dvh,calc(100dvh-2rem))] overflow-y-auto rounded-xl border border-border"
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
                          const isSettingsRootItem = item.id === 'settings';
                          const isActiveSettingsItem = isSettingsRootItem
                            ? location.pathname === '/settings' || location.pathname.startsWith('/settings/')
                            : isSettingsTabPathActive(location.pathname, item.tabId);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => onNavItemClick(isSettingsRootItem ? 'settings' : `settings/${item.tabId}`)}
                              className="group inline-flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs text-sidebar-foreground transition-colors hover:bg-muted/60 hover:text-white"
                            >
                              <Icon
                                className={cn(
                                  'h-4 w-4 shrink-0 transition-colors',
                                  isActiveSettingsItem
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
                    <a
                      href="https://docs.openhands.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 shrink-0 !text-muted-foreground transition-colors group-hover:!text-white" />
                      Documentation
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </PopoverContent>
        </Popover>
      </div>
      <ConnectBackendModal
        open={connectBackendOpen}
        onOpenChange={setConnectBackendOpen}
        onSubmit={handleConnectBackend}
      />
      {showEnvironmentSwitchOverlay && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="environment-switch-overlay pointer-events-none fixed inset-0 z-[2147483646] flex items-center justify-center"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="pointer-events-none flex min-w-[280px] max-w-[420px] flex-col items-center gap-2 rounded-xl border border-border bg-card px-5 py-4 text-foreground shadow-2xl">
                <EnvironmentSwitchIcon className="mb-2 h-6 w-20 shrink-0 text-foreground" />
                <p className="text-center text-sm font-medium">Switching to {environmentSwitchTarget}</p>
              </div>
            </div>,
            document.body
          )
        : null}
      {isExpanded ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize left navigation"
          className="absolute bottom-0 right-0 top-0 z-10 w-2 cursor-col-resize touch-none"
          onPointerDown={(event) => {
            navResizePointerIdRef.current = event.pointerId;
            setIsNavResizing(true);
            event.currentTarget.setPointerCapture(event.pointerId);
            event.preventDefault();
          }}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerEnd}
          onPointerCancel={handleResizePointerEnd}
        >
          <span
            className={cn(
              'absolute bottom-0 right-0 top-0 w-px transition-colors',
              isNavResizing ? 'bg-white' : 'bg-transparent hover:bg-sidebar-border'
            )}
          />
        </div>
      ) : null}
    </div>
  </aside>
  );
};
