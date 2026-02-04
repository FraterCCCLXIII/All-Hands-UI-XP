import { useCallback, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  GitFork,
  Package,
  Github,
  MessageSquare,
  MoreVertical,
  Star,
  Wrench,
} from 'lucide-react';
import { InfoCard } from '../components/common/InfoCard';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
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
import {
  marketplaceCategories,
  marketplaceSkills,
  skillRepositoryMetadata,
  skillRepositoryItems,
  type SkillRepositoryLink,
  type SkillRepositoryItem,
} from '../data/skillsPageData';
import { cn } from '../lib/utils';

function groupSkillsByRepo(items: SkillRepositoryItem[]) {
  const byRepo = new Map<string, SkillRepositoryItem[]>();
  for (const item of items) {
    const list = byRepo.get(item.repo) ?? [];
    list.push(item);
    byRepo.set(item.repo, list);
  }
  return Array.from(byRepo.entries()).map(([repo, skills]) => ({ repo, skills }));
}

function getRepoLinkIcon(type: SkillRepositoryLink['type']) {
  switch (type) {
    case 'repo':
      return Github;
    case 'docs':
      return BookOpen;
    case 'issues':
      return MessageSquare;
    case 'homepage':
      return ExternalLink;
    default:
      return ExternalLink;
  }
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
        'overflow-hidden rounded-xl border border-border bg-card',
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
        className="w-full resize-none border-0 bg-transparent p-4 font-mono text-sm text-foreground focus:ring-0 focus-visible:outline-none"
      />
    </div>
  );
}

type SkillsViewMode = 'marketplace' | 'repos';

export function SkillsScreen() {
  const [viewMode, setViewMode] = useState<SkillsViewMode>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplaceSearchQuery, setMarketplaceSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SkillRepositoryItem | null>(null);
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());
  const [addToRepoModalOpen, setAddToRepoModalOpen] = useState(false);
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
  const [addSkillTargetRepo, setAddSkillTargetRepo] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const repoMetadataMap = useMemo(
    () => new Map(skillRepositoryMetadata.map((meta) => [meta.repo, meta])),
    []
  );

  const allRepoGroups = useMemo(() => groupSkillsByRepo(skillRepositoryItems), []);

  /** Repos with their skills; filtered by search. Number in column = skills count. */
  const repoGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const items = q
      ? skillRepositoryItems.filter((item) => {
          const label = (item.skillName ?? item.title).toLowerCase();
          return item.repo.toLowerCase().includes(q) || label.includes(q);
        })
      : skillRepositoryItems;
    return groupSkillsByRepo(items);
  }, [searchQuery]);

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
  const personalRepoGroup = useMemo(
    () => repoGroups.find((group) => group.repo === personalRepoSlug) ?? null,
    [repoGroups]
  );
  const nonPersonalRepoGroups = useMemo(
    () => repoGroups.filter((group) => group.repo !== personalRepoSlug),
    [repoGroups]
  );
  const displayItem = selectedItem;
  const selectedRepoConversations = useMemo(() => {
    if (!selectedRepoGroup) return 0;
    return selectedRepoGroup.skills.reduce(
      (total, skill) => total + (skill.conversationCount ?? 0),
      0
    );
  }, [selectedRepoGroup]);
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

  const handleToggleRepo = useCallback((repo: string) => {
    setExpandedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(repo)) next.delete(repo);
      else next.add(repo);
      return next;
    });
  }, []);

  const handleSelectRepo = useCallback((repo: string) => {
    setViewMode('repos');
    setSelectedRepo(repo);
    setSelectedItem(null);
  }, []);

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

  const filteredMarketplaceSkills = useMemo(() => {
    let items = marketplaceSkills;
    if (selectedCategory) {
      const cat = marketplaceCategories.find((c) => c.slug === selectedCategory);
      if (cat) items = items.filter((s) => s.category === cat.name);
    }
    if (!marketplaceSearchQuery.trim()) return items;
    const q = marketplaceSearchQuery.toLowerCase();
    return items.filter(
      (s) =>
        (s.skillName ?? s.title).toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [marketplaceSearchQuery, selectedCategory]);

  const isMarketplaceSkill =
    displayItem?.id != null && String(displayItem.id).startsWith('marketplace-');
  const showMarketplace = viewMode === 'marketplace' && !displayItem;
  const showRepoPage = viewMode === 'repos' && !!selectedRepo && !displayItem;

  return (
    <div className="flex h-full w-full min-w-0 overflow-hidden bg-background">
      {/* Left sidebar */}
      <aside className="flex w-64 flex-shrink-0 flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg font-semibold text-foreground">Skills</h1>
            <a
              href="#"
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Skills documentation"
            >
              <BookOpen className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-3">
            <SearchInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search"
              aria-label="Search repositories"
              size="sm"
            />
          </div>
          <nav className="mt-3 space-y-0.5" aria-label="Skills navigation">
            <button
              type="button"
              onClick={() => {
                setViewMode('marketplace');
                setSelectedRepo(null);
                setSelectedItem(null);
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                viewMode === 'marketplace' &&
                  (!selectedItem || String(selectedItem?.id).startsWith('marketplace-'))
                  ? 'bg-muted/80 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <Package className="h-4 w-4 flex-shrink-0" />
              <span>All Skills</span>
            </button>
          </nav>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 repo-dropdown-scroll">
          <div className="mb-4 px-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personal Repository
            </div>
            <ul className="mt-2 list-none space-y-1">
              {personalRepoGroup ? (
                <li>
                  <div
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      selectedRepo === personalRepoGroup.repo
                        ? 'bg-muted/80 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleRepo(personalRepoGroup.repo)}
                      className="flex h-4 w-4 items-center justify-center"
                      aria-label={`Toggle ${personalRepoGroup.repo} skills`}
                    >
                      {expandedRepos.has(personalRepoGroup.repo) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectRepo(personalRepoGroup.repo)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      aria-current={selectedRepo === personalRepoGroup.repo}
                    >
                      <Github className="h-4 w-4 flex-shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{personalRepoGroup.repo}</span>
                    </button>
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {personalRepoGroup.skills.length}
                    </span>
                  </div>
                  {expandedRepos.has(personalRepoGroup.repo) && (
                    <ul className="list-none space-y-1">
                      {personalRepoGroup.skills.map((skill) => (
                        <li key={skill.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectSkill(skill)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-md py-1.5 pl-6 pr-2 text-left text-sm transition-colors',
                              selectedItem?.id === skill.id
                                ? 'bg-muted/80 text-foreground'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            )}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {skill.skillName ?? skill.title}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li className="px-2 py-1.5 text-xs text-muted-foreground">
                  No personal repository yet.
                </li>
              )}
            </ul>
          </div>
          <h3 className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            All Repositories
          </h3>
          <ul className="list-none space-y-1">
            {nonPersonalRepoGroups.slice(0, 10).map(({ repo, skills }) => {
              const isRepoExpanded = expandedRepos.has(repo);
              return (
                <li key={repo}>
                  <div
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      selectedRepo === repo
                        ? 'bg-muted/80 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleRepo(repo)}
                      className="flex h-4 w-4 items-center justify-center"
                      aria-label={`Toggle ${repo} skills`}
                    >
                      {isRepoExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectRepo(repo)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      aria-current={selectedRepo === repo}
                    >
                      <Github className="h-4 w-4 flex-shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{repo}</span>
                    </button>
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {skills.length}
                    </span>
                  </div>
                  {isRepoExpanded && (
                    <ul className="list-none space-y-1">
                      {skills.map((skill) => (
                        <li key={skill.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectSkill(skill)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-md py-1.5 pl-4 pr-2 text-left text-sm transition-colors',
                              selectedItem?.id === skill.id
                                ? 'bg-muted/80 text-foreground'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            )}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {skill.skillName ?? skill.title}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-4 border-t border-border pt-4">
            <ul className="list-none space-y-1">
              {[
                'facebook/react',
                'vercel/next.js',
                'tailwindlabs/tailwindcss',
                'shadcn-ui/ui',
                'microsoft/vscode',
                'facebook/react-native',
                'nodejs/node',
                'python/cpython',
                'rust-lang/rust',
                'golang/go',
              ].map((repo) => (
                <li key={repo}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                      <ChevronRight className="h-4 w-4" />
                    </span>
                    <Github className="h-4 w-4 flex-shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{repo}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-2 w-full px-2 py-1.5 text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View more...
            </button>
          </div>
        </div>
      </aside>

      {/* Main content: spans available width (right panel only when skill selected) */}
      <main className="flex min-w-0 min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="p-6">
          {showMarketplace ? (
            <>
                  <div className="rounded-xl border border-border bg-gradient-to-br from-muted/50 via-muted/30 to-muted/10 p-10 sm:p-12 flex flex-col items-start">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[4px] bg-foreground/10 text-foreground">
                      <Package className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight text-left">
                      Skills
                    </h2>
                    <div className="mt-8 w-full max-w-lg">
                      <SearchInput
                        value={marketplaceSearchQuery}
                        onValueChange={setMarketplaceSearchQuery}
                        placeholder="Search skills"
                        aria-label="Search marketplace skills"
                        size="lg"
                      />
                    </div>
                  </div>
                  <div className="mt-6 w-full">
                    <div
                      className="flex flex-wrap gap-2 rounded-lg p-2"
                      role="tablist"
                      aria-label="Category"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={selectedCategory === null}
                        onClick={() => setSelectedCategory(null)}
                        className={cn(
                          'rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
                          selectedCategory === null
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        )}
                      >
                        All
                      </button>
                      {marketplaceCategories.map((cat) => (
                        <button
                          key={cat.slug}
                          type="button"
                          role="tab"
                          aria-selected={selectedCategory === cat.slug}
                          onClick={() => setSelectedCategory(cat.slug)}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
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
                  </div>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {filteredMarketplaceSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => setSelectedItem(skill)}
                    className="flex h-full min-h-[120px] flex-col rounded-xl border border-border bg-card text-left transition-colors hover:bg-muted/50 hover:border-muted-foreground/20"
                  >
                    <div className="flex flex-1 flex-col p-6">
                      <span className="text-base font-medium text-foreground">
                        {skill.skillName ?? skill.title}
                      </span>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                        {skill.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 border-t border-border px-6 py-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" />
                        {skill.stars ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {skill.reviews ?? 0} Reviews
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-3.5 w-3.5" />
                        {skill.forks ?? 0}
                      </span>
                      {skill.updatedAt && (
                        <span>
                          Updated {new Date(skill.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : displayItem ? (
            <>
              {isMarketplaceSkill && (
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Skills</span>
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
                    onClick={() => setAddToRepoModalOpen(true)}
                  >
                    Add to repos
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
                        onClick={() => setAddSkillModalOpen(true)}
                      >
                        Add Skill
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {displayItem && isMarketplaceSkill && (
                <Dialog open={addToRepoModalOpen} onOpenChange={setAddToRepoModalOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add skill to repository</DialogTitle>
                      <DialogDescription>
                        Choose a repository to add "{displayItem.skillName ?? displayItem.title}" to.
                      </DialogDescription>
                    </DialogHeader>
                    <ul className="max-h-[280px] space-y-1 overflow-y-auto py-2">
                      {repoGroups.map(({ repo }) => (
                        <li key={repo}>
                          <button
                            type="button"
                            onClick={() => handleAddToRepo(repo)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/60"
                          >
                            <Github className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate">{repo}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {repoGroups.length === 0 && (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No repositories yet. Add a repo in My repositories first.
                      </p>
                    )}
                    <DialogFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddToRepoModalOpen(false)}
                      >
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {displayItem && !isMarketplaceSkill && (
                <Dialog open={addSkillModalOpen} onOpenChange={handleAddSkillModalChange}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add skill to repository</DialogTitle>
                      <DialogDescription>
                        Choose a repository to add "{displayItem.skillName ?? displayItem.title}"
                        to.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/60"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <Github className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              <span className="truncate">
                                {addSkillTargetRepo ?? 'Select a repository'}
                              </span>
                            </span>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-[var(--radix-dropdown-menu-trigger-width)]"
                        >
                          {orderedRepoGroups.map(({ repo }) => (
                            <DropdownMenuItem
                              key={repo}
                              onClick={() => setAddSkillTargetRepo(repo)}
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <Github className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{repo}</span>
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {orderedRepoGroups.length === 0 && (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No repositories yet. Add a repo in My repositories first.
                      </p>
                    )}
                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-start sm:space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => addSkillTargetRepo && handleAddToRepo(addSkillTargetRepo)}
                        disabled={!addSkillTargetRepo}
                      >
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddSkillModalOpen(false)}
                      >
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </>
          ) : showRepoPage && selectedRepoGroup && selectedRepoMeta ? (
            <>
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
                      {selectedRepoMeta.links.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {selectedRepoMeta.links.map((link) => {
                            const LinkIcon = getRepoLinkIcon(link.type);
                            return (
                              <a
                                key={link.label}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                              >
                                <LinkIcon className="h-4 w-4" />
                                <span>{link.label}</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedRepoMeta.visibility && (
                        <Badge variant="outline">
                          {selectedRepoMeta.visibility === 'public' ? 'Public' : 'Private'}
                        </Badge>
                      )}
                      {selectedRepoMeta.primaryLanguage && (
                        <Badge variant="outline">{selectedRepoMeta.primaryLanguage}</Badge>
                      )}
                      {selectedRepoMeta.defaultBranch && (
                        <Badge variant="outline">
                          Branch {selectedRepoMeta.defaultBranch}
                        </Badge>
                      )}
                      {selectedRepoMeta.lastUpdated && (
                        <Badge variant="outline">
                          Updated{' '}
                          {new Date(selectedRepoMeta.lastUpdated).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {selectedRepoGroup.skills.length} Skills
                      </Badge>
                      {selectedRepoConversations > 0 && (
                        <Badge variant="secondary">
                          {selectedRepoConversations} Conversations
                        </Badge>
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
                        icon={<Wrench className="h-4 w-4" />}
                        iconPosition="left"
                        interactive
                        className="w-full"
                      />
                    ))}
                  </div>
                </section>
              </div>
            </>
          ) : null}
        </div>
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
