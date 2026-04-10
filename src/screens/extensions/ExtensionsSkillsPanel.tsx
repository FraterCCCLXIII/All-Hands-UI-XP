import type { ReactNode } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Code2,
  Copy,
  ExternalLink,
  FlaskConical,
  GitBranch,
  Github,
  MoreHorizontal,
  MoreVertical,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
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
import { APP_ROUTE_EVENT, navigateAppRoute } from '../../lib/captureNavigation';
import {
  EXTENSIONS_ALL_BASE,
  EXTENSIONS_PLUGINS_BASE,
  EXTENSIONS_SKILLS_BASE,
} from '../../lib/extensionsRoutes';
import { ExtensionsCatalogAddButton } from './ExtensionsCatalogAddButton';
import { ExtensionsCatalogPageHeader } from './ExtensionsCatalogPageHeader';
import { getSkillSource, SkillSourceBadge } from './SkillSourceBadge';
import { ExtensionsShellSidebar, type ExtensionsBrowseControls } from './ExtensionsShellSidebar';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

const SKILL_ICONS: Record<string, LucideIcon> = {
  'marketplace-code-review': Code2,
  'marketplace-docs': BookOpen,
  'marketplace-security': ShieldCheck,
  'marketplace-test-gen': FlaskConical,
  'marketplace-refactor': Wrench,
  'marketplace-migrate': GitBranch,
};

function getSkillIcon(skillId: string): LucideIcon {
  return SKILL_ICONS[skillId] ?? Bot;
}

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
      let className = 'text-emerald-300';
      if (match[1]) {
        const rest = line.slice(index + token.length);
        className = /^\s*:/.test(rest) ? 'text-sky-300' : 'text-emerald-300';
      } else if (match[2]) {
        className = 'text-purple-300';
      } else if (match[3]) {
        className = 'text-amber-300';
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

type SkillsViewMode = 'marketplace' | 'repos';

export type ExtensionsSkillsPanelProps = {
  browseControls: ExtensionsBrowseControls;
  footerExtra?: ReactNode;
};

export function ExtensionsSkillsPanel({ browseControls, footerExtra }: ExtensionsSkillsPanelProps) {
  const [viewMode, setViewMode] = useState<SkillsViewMode>('marketplace');
  const [marketplaceSwitchById, setMarketplaceSwitchById] = useState<Record<string, boolean>>({});
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SkillRepositoryItem | null>(null);
  const [addToRepoModalOpen, setAddToRepoModalOpen] = useState(false);
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
  const [addSkillTargetRepo, setAddSkillTargetRepo] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleCategoryCount, setVisibleCategoryCount] = useState<number>(marketplaceCategories.length);
  const categoryTabsRef = useRef<HTMLDivElement>(null);
  const categoryTabsWrapperRef = useRef<HTMLDivElement>(null);
  const categoryTabsMeasureRef = useRef<HTMLDivElement>(null);

  const isMarketplaceView = viewMode === 'marketplace' && !selectedItem;

  useEffect(() => {
    const applySkillFromHash = () => {
      const raw = window.location.hash.replace(/^#\/?/, '');
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
    applySkillFromHash();
    window.addEventListener('hashchange', applySkillFromHash);
    window.addEventListener(APP_ROUTE_EVENT, applySkillFromHash);
    return () => {
      window.removeEventListener('hashchange', applySkillFromHash);
      window.removeEventListener(APP_ROUTE_EVENT, applySkillFromHash);
    };
  }, []);

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

  const handleAddToRepo = useCallback((repo: string) => {
    void repo;
    setAddToRepoModalOpen(false);
    setAddSkillModalOpen(false);
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

  const handleAddToRepoModalChange = useCallback(
    (open: boolean) => {
      setAddToRepoModalOpen(open);
      if (open && !addSkillTargetRepo) {
        setAddSkillTargetRepo(orderedRepoGroups[0]?.repo ?? null);
      }
    },
    [addSkillTargetRepo, orderedRepoGroups]
  );

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
    <div className="flex h-full w-full min-w-0 overflow-hidden bg-background">
      <ExtensionsShellSidebar browseControls={browseControls} footerExtra={footerExtra} />

      {/* Main content: spans available width (right panel only when skill selected) */}
      <main className="flex min-w-0 min-h-0 flex-1 flex-col overflow-y-auto">
        {showMarketplace ? (
          <>
            <ExtensionsCatalogPageHeader
              title="Skills"
              description="Discover skills to add to your workspace. Open a card for prompts, curl, and install flows. Filter by category below or search from the sidebar."
              actions={<ExtensionsCatalogAddButton kind="skill" />}
            />
            <div className="px-6 pb-6">
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
                              : 'bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
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
                                : 'bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
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
                                className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
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
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {filteredMarketplaceSkills.map((skill) => {
                  const IconComponent = getSkillIcon(skill.id);
                  const label = skill.skillName ?? skill.title;
                  const locked = skill.switchLocked === true;
                  const enabled = locked ? true : marketplaceSwitchById[skill.id] !== false;
                  const source = getSkillSource(skill);
                  return (
                    <div
                      key={skill.id}
                      className="relative flex h-full min-h-[120px] flex-col rounded-xl border border-border bg-card text-left transition-colors hover:bg-muted/50 hover:border-muted-foreground/20"
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
                              `#/${EXTENSIONS_PLUGINS_BASE}/plugin/${encodeURIComponent(skill.id)}`,
                            );
                            return;
                          }
                          setSelectedItem(skill);
                          window.history.replaceState(
                            null,
                            '',
                            `#/${EXTENSIONS_SKILLS_BASE}/skill/${encodeURIComponent(skill.id)}`,
                          );
                        }}
                        className="flex flex-1 flex-col rounded-xl p-6 pr-14 pt-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                            <IconComponent className="h-4 w-4" />
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
            <div className="p-6">
              {isMarketplaceSkill && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(null);
                    if (window.location.hash.includes('/skill/')) {
                      navigateAppRoute(`#/${EXTENSIONS_ALL_BASE}`);
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
                      <h2 className="text-[28px] font-semibold text-foreground leading-tight">
                        {displayItem.skillName ?? displayItem.title}
                      </h2>
                      <a
                        href={displayItem.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        <span className="font-mono">
                          {displayItem.repoUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <p className="mt-4 text-sm text-muted-foreground">{displayItem.description}</p>
                      <div className="mt-4">
                        <SkillSourceBadge source={getSkillSource(displayItem)} />
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
                  <h2 className="text-[28px] font-semibold text-foreground leading-tight">
                    {displayItem.skillName ?? displayItem.title}
                  </h2>
                  <a
                    href={displayItem.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span className="font-mono">
                      {displayItem.repoUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <p className="mt-4 text-sm text-muted-foreground">{displayItem.description}</p>
                  <div className="mt-4">
                    <SkillSourceBadge source={getSkillSource(displayItem)} />
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
                    onClick={() => handleAddToRepoModalChange(true)}
                  >
                    Add Skill
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
                <AddSkillDialog
                  open={addToRepoModalOpen}
                  onOpenChange={handleAddToRepoModalChange}
                  title="Add skill to repository"
                  description={`Choose a repository to add "${displayItem.skillName ?? displayItem.title}" to.`}
                  repoGroups={orderedRepoGroups}
                  selectedRepo={addSkillTargetRepo}
                  onSelectRepo={setAddSkillTargetRepo}
                  onAdd={() => addSkillTargetRepo && handleAddToRepo(addSkillTargetRepo)}
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
                  onAdd={() => addSkillTargetRepo && handleAddToRepo(addSkillTargetRepo)}
                />
              )}
            </div>
          ) : showRepoPage && selectedRepoGroup && selectedRepoMeta ? (
            <div className="p-6">
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {selectedRepoGroup.skills.map((skill) => (
                      <InfoCard
                        key={skill.id}
                        as="button"
                        type="button"
                        onClick={() => handleSelectSkill(skill)}
                        title={skill.skillName ?? skill.title}
                        description={skill.description}
                        icon={<Wrench className="h-5 w-5" />}
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
      </main>

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
