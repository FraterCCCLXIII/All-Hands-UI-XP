import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronLeft,
  Copy,
  ExternalLink,
  Folder,
  GitBranch,
  Github,
  MoreHorizontal,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { SkillIcon } from '../../components/icons/SkillIcon';
import { InfoCard } from '../../components/common/InfoCard';
import { Button } from '../../components/ui/button';
import { PluginToggle } from '../../components/ui/plugin-toggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  marketplaceCategories,
  marketplaceSkills,
  skillRepositoryMetadata,
  skillRepositoryItems,
  type SkillRepositoryItem,
} from '../../data/skillsPageData';
import { APP_ROUTE_EVENT, getEffectiveAppRouteSegment, navigateAppRoute } from '../../lib/captureNavigation';
import {
  EXTENSIONS_ALL_BASE,
  EXTENSIONS_PLUGINS_BASE,
  EXTENSIONS_SKILLS_BASE,
  extensionsMainScrollClassName,
  extensionsPageContentClassName,
  extensionsShellRowClassName,
} from '../../lib/extensionsRoutes';
import { ExtensionsAnimatedMain } from './ExtensionsAnimatedMain';
import { ExtensionsCatalogAddButton } from './ExtensionsCatalogAddButton';
import { ExtensionsCatalogPageHeader } from './ExtensionsCatalogPageHeader';
import { getSkillSource, SkillSourceBadge } from './SkillSourceBadge';
import { ExtensionsShellSidebar, type ExtensionsBrowseControls } from './ExtensionsShellSidebar';
import { cn } from '../../lib/utils';

function groupSkillsByRepo(items: SkillRepositoryItem[]) {
  const byRepo = new Map<string, SkillRepositoryItem[]>();
  for (const item of items) {
    const list = byRepo.get(item.repo) ?? [];
    list.push(item);
    byRepo.set(item.repo, list);
  }
  return Array.from(byRepo.entries()).map(([repo, skills]) => ({ repo, skills }));
}

function highlightJson(content: string) {
  const tokenRegex = /("(?:\\.|[^"\\])*")|(\btrue\b|\bfalse\b|null)|(-?\d+(?:\.\d+)?)/g;
  const lines = content.split('\n');

  return lines.map((line, lineIndex) => {
    const tokens: React.ReactNode[] = [];
    let lastIndex = 0;
    for (const match of line.matchAll(tokenRegex)) {
      const index = match.index ?? 0;
      if (index > lastIndex) {
        tokens.push(line.slice(lastIndex, index));
      }
      const token = match[0];
      let className = 'text-success-foreground';
      if (match[1]) {
        const rest = line.slice(index + token.length);
        className = /^\s*:/.test(rest) ? 'text-info' : 'text-success-foreground';
      } else if (match[2]) {
        className = 'text-agent';
      } else if (match[3]) {
        className = 'text-warning';
      }
      tokens.push(
        <span key={`${lineIndex}-${index}`} className={className}>
          {token}
        </span>
      );
      lastIndex = index + token.length;
    }
    if (lastIndex < line.length) {
      tokens.push(line.slice(lastIndex));
    }
    return (
      <span key={`line-${lineIndex}`}>
        {tokens}
        {lineIndex < lines.length - 1 ? '\n' : null}
      </span>
    );
  });
}

/** Right panel: file code/content view. */
function FileContentView({ content, fileName }: { content: string; fileName: string }) {
  const isMarkdown = fileName.endsWith('.md') || fileName.endsWith('.json');
  if (isMarkdown && content.startsWith('#')) {
    return (
      <div className="prose prose-invert prose-sm max-w-none text-foreground">
        <pre className="whitespace-pre-wrap font-sans text-sm text-foreground bg-transparent p-0 border-0">
          {content}
        </pre>
      </div>
    );
  }
  if (fileName === 'skill.md') {
    return (
      <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words">
        {highlightJson(content)}
      </pre>
    );
  }
  return (
    <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words">
      {content || '(empty)'}
    </pre>
  );
}

function CopyableBlock({
  title,
  value,
  onCopy,
  className,
}: {
  title: string;
  value: string;
  onCopy: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card [&_textarea]:min-h-[100px]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <button
          type="button"
          onClick={onCopy}
          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Copy"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <textarea
        readOnly
        value={value}
        rows={4}
        className="repo-dropdown-scroll max-h-[180px] w-full resize-none overflow-y-auto border-0 bg-transparent p-4 font-mono text-sm text-foreground focus:ring-0 focus-visible:outline-none"
      />
    </div>
  );
}

type AddSkillDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  repoGroups: { repo: string }[];
  selectedRepo: string | null;
  onSelectRepo: (repo: string) => void;
  onAdd: () => void;
};

function AddSkillDialog({
  open,
  onOpenChange,
  title,
  description,
  repoGroups,
  selectedRepo,
  onSelectRepo,
  onAdd,
}: AddSkillDialogProps) {
  const canAdd = Boolean(selectedRepo);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-50"
                disabled={repoGroups.length === 0}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Github className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">{selectedRepo ?? 'Select a repository'}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[var(--radix-dropdown-menu-trigger-width)]"
            >
              {repoGroups.map(({ repo }) => (
                <DropdownMenuItem key={repo} onClick={() => onSelectRepo(repo)}>
                  <span className="flex min-w-0 items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{repo}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {repoGroups.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No repositories yet. Add a repo in My repositories first.
          </p>
        )}
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-start sm:space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              if (canAdd) onAdd();
            }}
            disabled={!canAdd}
          >
            Add
          </Button>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildChatRoute(options: {
  repository: 'connected' | 'disconnected';
  skillName?: string | null;
  repo?: string | null;
  branch?: string | null;
}) {
  const params = new URLSearchParams({
    content: 'start',
    repository: options.repository,
    canvas: 'closed',
  });
  if (options.skillName) params.set('skill', options.skillName);
  if (options.repo) params.set('repo', options.repo);
  if (options.branch) params.set('branch', options.branch);
  return `/chat?${params.toString()}`;
}

type StartConversationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: SkillRepositoryItem | null;
  repoGroups: { repo: string }[];
  repoMetadataMap: Map<string, { defaultBranch?: string }>;
  selectedRepo: string | null;
  selectedBranch: string;
  onSelectRepo: (repo: string) => void;
  onBranchChange: (branch: string) => void;
  onStartWithRepo: () => void;
  onStartWithoutRepo: () => void;
};

function StartConversationDialog({
  open,
  onOpenChange,
  skill,
  repoGroups,
  repoMetadataMap,
  selectedRepo,
  selectedBranch,
  onSelectRepo,
  onBranchChange,
  onStartWithRepo,
  onStartWithoutRepo,
}: StartConversationDialogProps) {
  const canStartWithRepo = Boolean(selectedRepo && selectedBranch.trim());
  const selectedRepoDefaultBranch = selectedRepo ? repoMetadataMap.get(selectedRepo)?.defaultBranch : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle>Start Conversation</DialogTitle>
          <DialogDescription>
            Launch a new conversation with this skill using an existing repository, or start without a repo.
          </DialogDescription>
        </DialogHeader>
        {skill ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <SkillIcon className="h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{skill.skillName ?? skill.title}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{skill.description}</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span>Select an existing repository</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-50"
                      disabled={repoGroups.length === 0}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Github className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="truncate">{selectedRepo ?? 'Select a repository'}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                    {repoGroups.map(({ repo }) => (
                      <DropdownMenuItem key={repo} onClick={() => onSelectRepo(repo)}>
                        <span className="flex min-w-0 items-center gap-2">
                          <Github className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{repo}</span>
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
                  <GitBranch className="h-4 w-4" />
                </div>
                <input
                  placeholder={selectedRepoDefaultBranch ?? 'Select branch...'}
                  disabled={!selectedRepo}
                  className="h-10 w-full rounded-md border border-border bg-muted/40 px-4 pl-10 pr-4 text-sm text-foreground shadow-none transition-colors hover:bg-muted/60 placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60"
                  value={selectedBranch}
                  onChange={(event) => onBranchChange(event.target.value)}
                />
              </div>
              <Button variant="default" size="sm" onClick={onStartWithRepo} disabled={!canStartWithRepo} className="w-full">
                Start with Repository
              </Button>
            </div>
            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-x-0 h-px bg-border" />
              <span className="relative bg-background px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">or</span>
            </div>
            <Button variant="outline" size="sm" onClick={onStartWithoutRepo} className="w-full">
              <Plus className="mr-1 h-4 w-4" />
              Start Without Repository
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type SkillsViewMode = 'marketplace' | 'repos';

export type ExtensionsSkillsPanelProps = {
  browseControls: ExtensionsBrowseControls;
};

export function ExtensionsSkillsPanel({ browseControls }: ExtensionsSkillsPanelProps) {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<SkillsViewMode>('marketplace');
  const [marketplaceSwitchById, setMarketplaceSwitchById] = useState<Record<string, boolean>>({});
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SkillRepositoryItem | null>(null);
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
  const [addSkillTargetRepo, setAddSkillTargetRepo] = useState<string | null>(null);
  const [startConversationModalOpen, setStartConversationModalOpen] = useState(false);
  const [startConversationTargetRepo, setStartConversationTargetRepo] = useState<string | null>(null);
  const [startConversationTargetBranch, setStartConversationTargetBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleCategoryCount, setVisibleCategoryCount] = useState<number>(marketplaceCategories.length);
  const categoryTabsRef = useRef<HTMLDivElement>(null);
  const categoryTabsWrapperRef = useRef<HTMLDivElement>(null);
  const categoryTabsMeasureRef = useRef<HTMLDivElement>(null);

  const isMarketplaceView = viewMode === 'marketplace' && !selectedItem;

  useEffect(() => {
    const applySkillFromPath = () => {
      const raw = getEffectiveAppRouteSegment();
      if (!raw.startsWith(EXTENSIONS_SKILLS_BASE) && !raw.startsWith(EXTENSIONS_ALL_BASE)) return;
      const pathPart = raw.split('?')[0];
      const pathMatch = pathPart.match(/^extensions\/skills\/skill\/([^/?#]+)/);
      if (!pathMatch) {
        if (pathPart === EXTENSIONS_SKILLS_BASE || pathPart === EXTENSIONS_ALL_BASE) {
          setSelectedItem(null);
        }
        return;
      }
      const skillId = decodeURIComponent(pathMatch[1]);
      const skill = marketplaceSkills.find((s) => s.id === skillId);
      if (!skill) return;
      setViewMode('marketplace');
      setSelectedRepo(null);
      setSelectedItem(skill);
    };
    applySkillFromPath();
    window.addEventListener(APP_ROUTE_EVENT, applySkillFromPath);
    return () => {
      window.removeEventListener(APP_ROUTE_EVENT, applySkillFromPath);
    };
  }, [location.pathname, location.search]);

  useLayoutEffect(() => {
    const wrapper = categoryTabsWrapperRef.current;
    const measureContainer = categoryTabsMeasureRef.current;
    if (!wrapper || !measureContainer || !isMarketplaceView) return;

    const MENU_SLOT_WIDTH = 44;
    const GAP = 8;

    const updateVisibleCount = () => {
      const availableWidth = wrapper.offsetWidth - MENU_SLOT_WIDTH - GAP;
      const tabs = measureContainer.querySelectorAll<HTMLElement>('[role="tab"]');
      if (tabs.length === 0) return;

      let totalWidth = 0;
      let visibleCount = 0;
      for (let i = 0; i < tabs.length; i++) {
        const w = tabs[i].offsetWidth + (i > 0 ? GAP : 0);
        if (totalWidth + w > availableWidth) break;
        totalWidth += w;
        visibleCount = i + 1;
      }
      setVisibleCategoryCount(visibleCount);
    };

    const ro = new ResizeObserver(updateVisibleCount);
    ro.observe(wrapper);
    updateVisibleCount();
    return () => ro.disconnect();
  }, [isMarketplaceView]);

  const overflowCategories = useMemo(
    () => marketplaceCategories.slice(visibleCategoryCount - 1),
    [visibleCategoryCount]
  );
  const visibleCategories = useMemo(
    () => marketplaceCategories.slice(0, visibleCategoryCount - 1),
    [visibleCategoryCount]
  );

  const repoMetadataMap = useMemo(
    () => new Map(skillRepositoryMetadata.map((meta) => [meta.repo, meta])),
    []
  );

  const allRepoGroups = useMemo(() => groupSkillsByRepo(skillRepositoryItems), []);

  const selectedRepoGroup = useMemo(() => {
    if (!selectedRepo) return null;
    return allRepoGroups.find((group) => group.repo === selectedRepo) ?? null;
  }, [allRepoGroups, selectedRepo]);

  const selectedRepoMeta = useMemo(() => {
    if (!selectedRepoGroup) return null;
    const { repo, skills } = selectedRepoGroup;
    const metadata = repoMetadataMap.get(repo);
    const repoUrl = metadata?.repoUrl ?? skills[0]?.repoUrl ?? '';
    const docsFallback =
      repoUrl && skills[0]?.docTitle ? `${repoUrl}/blob/main/${skills[0].docTitle}` : '';
    const links =
      metadata?.links?.length
        ? metadata.links
        : [
            ...(repoUrl ? [{ label: 'Repository', url: repoUrl, type: 'repo' as const }] : []),
            ...(docsFallback ? [{ label: 'Docs', url: docsFallback, type: 'docs' as const }] : []),
            ...(repoUrl
              ? [{ label: 'Issues', url: `${repoUrl}/issues`, type: 'issues' as const }]
              : []),
          ];
    return {
      repo,
      repoUrl,
      description: metadata?.description ?? skills[0]?.description ?? '',
      primaryLanguage: metadata?.primaryLanguage,
      defaultBranch: metadata?.defaultBranch,
      visibility: metadata?.visibility,
      lastUpdated: metadata?.lastUpdated,
      links,
    };
  }, [repoMetadataMap, selectedRepoGroup]);

  const personalRepoSlug = 'paulbloch/personal-lab';
  const orderedRepoGroups = useMemo(() => {
    const personal = allRepoGroups.find((group) => group.repo === personalRepoSlug) ?? null;
    const rest = allRepoGroups.filter((group) => group.repo !== personalRepoSlug);
    return personal ? [personal, ...rest] : rest;
  }, [allRepoGroups, personalRepoSlug]);
  const displayItem = selectedItem;
  const displayItemConversations = displayItem?.conversationCount ?? 0;
  const skillFileContent = useMemo(() => {
    if (!displayItem) return '';
    const payload = {
      title: displayItem.skillName ?? displayItem.title,
      repo: displayItem.repo,
      repoUrl: displayItem.repoUrl,
      description: displayItem.description,
      initialPrompt: displayItem.initialPrompt,
      curlCommand: displayItem.curlCommand,
    };
    return JSON.stringify(payload, null, 2);
  }, [displayItem]);

  const handleSelectSkill = useCallback((skill: SkillRepositoryItem) => {
    setViewMode('repos');
    setSelectedRepo(skill.repo);
    setSelectedItem(skill);
  }, []);

  const handleCopy = useCallback((text: string) => {
    void navigator.clipboard.writeText(text);
  }, []);

  const handleAddSkillModalChange = useCallback(
    (open: boolean) => {
      setAddSkillModalOpen(open);
      if (open && !addSkillTargetRepo) {
        setAddSkillTargetRepo(orderedRepoGroups[0]?.repo ?? null);
      }
    },
    [addSkillTargetRepo, orderedRepoGroups]
  );

  const handleStartConversationModalChange = useCallback(
    (open: boolean) => {
      setStartConversationModalOpen(open);
      if (open) {
        const defaultRepo = startConversationTargetRepo ?? orderedRepoGroups[0]?.repo ?? null;
        setStartConversationTargetRepo(defaultRepo);
        setStartConversationTargetBranch(defaultRepo ? repoMetadataMap.get(defaultRepo)?.defaultBranch ?? '' : '');
      }
    },
    [orderedRepoGroups, repoMetadataMap, startConversationTargetRepo]
  );

  const handleStartConversationRepoSelect = useCallback(
    (repo: string) => {
      setStartConversationTargetRepo(repo);
      setStartConversationTargetBranch(repoMetadataMap.get(repo)?.defaultBranch ?? '');
    },
    [repoMetadataMap]
  );

  const handleStartConversationWithRepo = useCallback(() => {
    if (!displayItem || !startConversationTargetRepo || !startConversationTargetBranch.trim()) return;
    navigateAppRoute(
      buildChatRoute({
        repository: 'connected',
        skillName: displayItem.skillName ?? displayItem.title,
        repo: startConversationTargetRepo,
        branch: startConversationTargetBranch.trim(),
      })
    );
  }, [displayItem, startConversationTargetBranch, startConversationTargetRepo]);

  const handleStartConversationWithoutRepo = useCallback(() => {
    if (!displayItem) return;
    navigateAppRoute(
      buildChatRoute({
        repository: 'disconnected',
        skillName: displayItem.skillName ?? displayItem.title,
      })
    );
  }, [displayItem]);

  const filteredMarketplaceSkills = useMemo(() => {
    let items = marketplaceSkills;
    if (selectedCategory) {
      const cat = marketplaceCategories.find((c) => c.slug === selectedCategory);
      if (cat) items = items.filter((s) => s.category === cat.name);
    }
    const q = browseControls.searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (s) =>
        (s.skillName ?? s.title).toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [browseControls.searchQuery, selectedCategory]);

  const isMarketplaceSkill =
    displayItem?.id != null && String(displayItem.id).startsWith('marketplace-');
  const showMarketplace = viewMode === 'marketplace' && !displayItem;
  const showRepoPage = viewMode === 'repos' && !!selectedRepo && !displayItem;

  return (
    <div className={extensionsShellRowClassName}>
      <ExtensionsShellSidebar browseControls={browseControls} />

      <ExtensionsAnimatedMain className={cn('repo-dropdown-scroll', extensionsMainScrollClassName)}>
        <div className={extensionsPageContentClassName}>
        {showMarketplace ? (
          <>
            <ExtensionsCatalogPageHeader
              title="Skills"
              description="Discover skills to add to your workspace. Open a card for prompts, curl, and install flows. Filter by category below or search from the sidebar."
              actions={<ExtensionsCatalogAddButton kind="skill" />}
            />
            <div className="flex flex-col gap-6">
                  <div className="relative w-full overflow-hidden">
                    {/* Hidden measurement container - all tabs for accurate width calculation on resize */}
                    <div
                      ref={categoryTabsMeasureRef}
                      className="pointer-events-none invisible absolute left-0 top-0 z-[-1] flex flex-nowrap items-center gap-2"
                      aria-hidden="true"
                    >
                      <button
                        type="button"
                        role="tab"
                        tabIndex={-1}
                        className="shrink-0 rounded-md px-4 py-2.5 text-sm font-medium"
                      >
                        All
                      </button>
                      {marketplaceCategories.map((cat) => (
                        <button
                          key={cat.slug}
                          type="button"
                          role="tab"
                          tabIndex={-1}
                          className="inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium"
                        >
                          <span>{cat.name}</span>
                          <span className="tabular-nums text-muted-foreground/80">
                            {cat.exports.toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div
                      ref={categoryTabsWrapperRef}
                      className="flex items-center gap-2 rounded-lg p-2"
                    >
                      <div
                        ref={categoryTabsRef}
                        className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-hidden"
                        role="tablist"
                        aria-label="Category"
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={selectedCategory === null}
                          onClick={() => setSelectedCategory(null)}
                          className={cn(
                            'shrink-0 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
                            selectedCategory === null
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                          )}
                        >
                          All
                        </button>
                        {visibleCategories.map((cat) => (
                          <button
                            key={cat.slug}
                            type="button"
                            role="tab"
                            aria-selected={selectedCategory === cat.slug}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={cn(
                              'inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
                              selectedCategory === cat.slug
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                            )}
                          >
                            <span>{cat.name}</span>
                            <span className={cn('tabular-nums', selectedCategory === cat.slug ? 'opacity-90' : 'text-muted-foreground/80')} aria-label={`${cat.exports.toLocaleString()} skills`}>
                              {cat.exports.toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="h-9 w-9 shrink-0 flex items-center justify-center">
                        {overflowCategories.length > 0 ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                                aria-label="More categories"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {overflowCategories.map((cat) => (
                                <DropdownMenuItem
                                  key={cat.slug}
                                  onClick={() => setSelectedCategory(cat.slug)}
                                >
                                  {cat.name} ({cat.exports.toLocaleString()})
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="h-9 w-9" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                  </div>
              <div className="grid grid-cols-1 gap-4">
                {filteredMarketplaceSkills.map((skill) => {
                  const label = skill.skillName ?? skill.title;
                  const locked = skill.switchLocked === true;
                  const enabled = locked ? true : marketplaceSwitchById[skill.id] !== false;
                  const source = getSkillSource(skill);
                  return (
                    <div
                      key={skill.id}
                      className="relative flex h-full min-h-[120px] flex-col rounded-xl border border-border bg-card text-left transition-colors hover:bg-muted/60 hover:border-muted-foreground/20"
                    >
                      <PluginToggle
                        size="sm"
                        className="absolute right-3 top-3 z-10"
                        checked={enabled}
                        locked={locked}
                        onCheckedChange={() =>
                          setMarketplaceSwitchById((prev) => ({
                            ...prev,
                            [skill.id]: !(prev[skill.id] !== false),
                          }))
                        }
                        aria-label={
                          locked
                            ? `${label} is on and locked by your organization`
                            : enabled
                              ? `Turn off ${label}`
                              : `Turn on ${label}`
                        }
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (skill.isPlugin) {
                            navigateAppRoute(
                              `/${EXTENSIONS_PLUGINS_BASE}/plugin/${encodeURIComponent(skill.id)}`,
                            );
                            return;
                          }
                          setSelectedItem(skill);
                          navigateAppRoute(
                            `/${EXTENSIONS_SKILLS_BASE}/skill/${encodeURIComponent(skill.id)}`,
                          );
                        }}
                        className="flex flex-1 flex-col rounded-xl p-6 pr-14 pt-6 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                            <SkillIcon className="h-4 text-muted-foreground" />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="text-base font-medium text-foreground">{label}</span>
                            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                              {skill.description}
                            </p>
                            <div className="mt-3">
                              <SkillSourceBadge source={source} />
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            </>
          ) : displayItem ? (
            <div>
              {isMarketplaceSkill && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(null);
                    if (getEffectiveAppRouteSegment().includes('/skill/')) {
                      navigateAppRoute(`/${EXTENSIONS_ALL_BASE}`);
                    }
                  }}
                  className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              )}
              {!isMarketplaceSkill && selectedRepo && (
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to {selectedRepo}</span>
                </button>
              )}
              {isMarketplaceSkill ? (
                <div className="my-6">
                  <div className="flex items-start justify-between gap-4 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-semibold leading-6 text-foreground">
                        {displayItem.skillName ?? displayItem.title}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">{displayItem.description}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                        <a
                          href={displayItem.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                        >
                          <Github className="h-4 w-4 shrink-0" />
                          <span className="truncate font-mono">
                            {displayItem.repoUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </span>
                        </a>
                        <SkillSourceBadge source={getSkillSource(displayItem)} className="shrink-0" />
                      </div>
                    </div>
                    <PluginToggle
                      className="mt-0.5 shrink-0"
                      checked={
                        displayItem.switchLocked === true
                          ? true
                          : marketplaceSwitchById[displayItem.id] !== false
                      }
                      locked={displayItem.switchLocked === true}
                      onCheckedChange={() =>
                        setMarketplaceSwitchById((prev) => ({
                          ...prev,
                          [displayItem.id]: !(prev[displayItem.id] !== false),
                        }))
                      }
                      aria-label={
                        displayItem.switchLocked
                          ? `${displayItem.skillName ?? displayItem.title} is on and locked by your organization`
                          : marketplaceSwitchById[displayItem.id] !== false
                            ? `Turn off ${displayItem.skillName ?? displayItem.title}`
                            : `Turn on ${displayItem.skillName ?? displayItem.title}`
                      }
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold leading-6 text-foreground">
                    {displayItem.skillName ?? displayItem.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">{displayItem.description}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <a
                      href={displayItem.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    >
                      <Github className="h-4 w-4 shrink-0" />
                      <span className="truncate font-mono">
                        {displayItem.repoUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </span>
                    </a>
                    <SkillSourceBadge source={getSkillSource(displayItem)} className="shrink-0" />
                  </div>
                </>
              )}

              <div className="mt-6">
                <CopyableBlock
                  title="Initial Prompt"
                  value={displayItem.initialPrompt}
                  onCopy={() => handleCopy(displayItem.initialPrompt)}
                />
              </div>
              <div className="mt-4">
                <CopyableBlock
                  title="Curl Command"
                  value={displayItem.curlCommand}
                  onCopy={() => handleCopy(displayItem.curlCommand)}
                  className="[&_textarea]:min-h-[100px]"
                />
              </div>
              <div className="mt-6">
                {isMarketplaceSkill ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleStartConversationModalChange(true)}
                  >
                    Start Conversation
                  </Button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default" size="sm">
                      Create New Conversation
                    </Button>
                    {displayItemConversations > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSkillModalChange(true)}
                      >
                        Add Skill
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {displayItem && isMarketplaceSkill && (
                <StartConversationDialog
                  open={startConversationModalOpen}
                  onOpenChange={handleStartConversationModalChange}
                  skill={displayItem}
                  repoGroups={orderedRepoGroups}
                  repoMetadataMap={repoMetadataMap}
                  selectedRepo={startConversationTargetRepo}
                  selectedBranch={startConversationTargetBranch}
                  onSelectRepo={handleStartConversationRepoSelect}
                  onBranchChange={setStartConversationTargetBranch}
                  onStartWithRepo={handleStartConversationWithRepo}
                  onStartWithoutRepo={handleStartConversationWithoutRepo}
                />
              )}
              {displayItem && !isMarketplaceSkill && (
                <AddSkillDialog
                  open={addSkillModalOpen}
                  onOpenChange={handleAddSkillModalChange}
                  title="Add skill to repository"
                  description={`Choose a repository to add "${displayItem.skillName ?? displayItem.title}" to.`}
                  repoGroups={orderedRepoGroups}
                  selectedRepo={addSkillTargetRepo}
                  onSelectRepo={setAddSkillTargetRepo}
                  onAdd={() => handleAddSkillModalChange(false)}
                />
              )}
            </div>
          ) : showRepoPage && selectedRepoGroup && selectedRepoMeta ? (
            <div>
              <div className="space-y-6">
                <section className="rounded-xl border border-border bg-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-[28px] font-semibold text-foreground leading-tight">
                        {selectedRepoMeta.repo}
                      </h2>
                      {selectedRepoMeta.description && (
                        <p className="mt-3 text-sm text-muted-foreground">
                          {selectedRepoMeta.description}
                        </p>
                      )}
                      {selectedRepoMeta.repoUrl && (
                        <a
                          href={selectedRepoMeta.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                        >
                          <Github className="h-4 w-4" />
                          <span className="font-mono">
                            {selectedRepoMeta.repoUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </section>
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Skills in this repo</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedRepoGroup.skills.map((skill) => (
                      <InfoCard
                        key={skill.id}
                        as="button"
                        type="button"
                        onClick={() => handleSelectSkill(skill)}
                        title={skill.skillName ?? skill.title}
                        description={skill.description}
                        icon={<SkillIcon className="h-5 text-muted-foreground" />}
                        iconPosition="left"
                        interactive
                        className="w-full"
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : null}
        </div>
      </ExtensionsAnimatedMain>

      {displayItem && (
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden p-4">
          <section
            className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card w-full"
            aria-label="Skill detail"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate text-sm font-medium text-foreground">skill.md</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="More options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Copy link</DropdownMenuItem>
                  <DropdownMenuItem>Open in new tab</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex-1 overflow-y-auto p-4 repo-dropdown-scroll">
              <FileContentView content={skillFileContent} fileName="skill.md" />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
