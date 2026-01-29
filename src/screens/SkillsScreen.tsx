import { useCallback, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FileCode,
  Folder,
  FolderOpen,
  GitFork,
  Github,
  MessageSquare,
  MoreVertical,
  Star,
  Store,
} from 'lucide-react';
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
  skillRepositoryItems,
  skillRepoTree,
  type RepoTreeNode,
  type SkillRepositoryItem,
} from '../data/skillsPageData';
import { cn } from '../lib/utils';

function collectFolderPaths(nodes: RepoTreeNode[], prefix = ''): string[] {
  return nodes.flatMap((n) => {
    if (n.type === 'folder') {
      const path = prefix ? `${prefix}/${n.name}` : n.name;
      return [path, ...collectFolderPaths(n.children ?? [], path)];
    }
    return [];
  });
}

/** Right panel: repo folder tree (default view). */
function RepoFolderTree({
  tree,
  onFileClick,
  depth = 0,
  pathPrefix = '',
  expanded,
  onToggleFolder,
}: {
  tree: RepoTreeNode[];
  onFileClick: (node: RepoTreeNode) => void;
  depth?: number;
  pathPrefix?: string;
  expanded: Set<string>;
  onToggleFolder: (path: string) => void;
}) {
  return (
    <ul className={cn('list-none', depth > 0 && 'pl-4 border-l border-border ml-1')}>
      {tree.map((node) =>
        node.type === 'folder' ? (
          <li key={node.name} className="py-0.5">
            {(() => {
              const folderPath = pathPrefix ? `${pathPrefix}/${node.name}` : node.name;
              const isExpanded = expanded.has(folderPath);
              const hasChildren = (node.children?.length ?? 0) > 0;
              return (
                <>
                  <button
                    type="button"
                    onClick={() => hasChildren && onToggleFolder(folderPath)}
                    className="flex w-full items-center gap-1.5 text-left text-sm text-muted-foreground hover:text-foreground"
                  >
                    <span className="flex h-4 w-4 items-center justify-center flex-shrink-0">
                      {hasChildren ? (
                        isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )
                      ) : (
                        <span className="w-4" aria-hidden />
                      )}
                    </span>
                    {isExpanded ? (
                      <FolderOpen className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <Folder className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="font-medium">{node.name}</span>
                  </button>
                  {hasChildren && isExpanded && (
                    <RepoFolderTree
                      tree={node.children!}
                      onFileClick={onFileClick}
                      depth={depth + 1}
                      pathPrefix={folderPath}
                      expanded={expanded}
                      onToggleFolder={onToggleFolder}
                    />
                  )}
                </>
              );
            })()}
          </li>
        ) : (
          <li key={node.name} className="py-0.5">
            <button
              type="button"
              onClick={() => onFileClick(node)}
              className="flex w-full items-center gap-1.5 text-left text-sm text-foreground hover:text-primary hover:underline"
            >
              <FileCode className="h-4 w-4 flex-shrink-0" />
              <span>{node.name}</span>
            </button>
          </li>
        )
      )}
    </ul>
  );
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
  return (
    <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre p-0">
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

type DetailPanelView = 'folder' | 'file';
type SkillsViewMode = 'marketplace' | 'repos';

export function SkillsScreen() {
  const [viewMode, setViewMode] = useState<SkillsViewMode>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplaceSearchQuery, setMarketplaceSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<SkillRepositoryItem | null>(null);
  const [detailPanelView, setDetailPanelView] = useState<DetailPanelView>('folder');
  const [selectedFile, setSelectedFile] = useState<{ name: string; content: string } | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() =>
    new Set(collectFolderPaths(skillRepoTree))
  );
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());
  const [addToRepoModalOpen, setAddToRepoModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  /** Repos with their skills; filtered by search. Number in column = skills count. */
  const repoGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const items = q
      ? skillRepositoryItems.filter(
          (item) =>
            item.repo.toLowerCase().includes(q) || item.title.toLowerCase().includes(q)
        )
      : skillRepositoryItems;
    const byRepo = new Map<string, SkillRepositoryItem[]>();
    for (const item of items) {
      const list = byRepo.get(item.repo) ?? [];
      list.push(item);
      byRepo.set(item.repo, list);
    }
    return Array.from(byRepo.entries()).map(([repo, skills]) => ({ repo, skills }));
  }, [searchQuery]);

  const handleToggleRepo = useCallback((repo: string) => {
    setExpandedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(repo)) next.delete(repo);
      else next.add(repo);
      return next;
    });
  }, []);

  const handleCopy = useCallback((text: string) => {
    void navigator.clipboard.writeText(text);
  }, []);

  const handleFileClick = useCallback((node: RepoTreeNode) => {
    if (node.type === 'file') {
      setSelectedFile({ name: node.name, content: node.content ?? '' });
      setDetailPanelView('file');
    }
  }, []);

  const handleDetailBack = useCallback(() => {
    setDetailPanelView('folder');
    setSelectedFile(null);
  }, []);

  const handleToggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const handleAddToRepo = useCallback((_repo: string) => {
    setAddToRepoModalOpen(false);
  }, []);

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

  const displayItem = selectedItem;
  const isMarketplaceSkill =
    displayItem?.id != null && String(displayItem.id).startsWith('marketplace-');

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
              <Store className="h-4 w-4 flex-shrink-0" />
              <span>Marketplace</span>
            </button>
          </nav>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <h3 className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Active Repositories
          </h3>
            <ul className="list-none space-y-1">
            {repoGroups.map(({ repo, skills }) => {
              const isRepoExpanded = expandedRepos.has(repo);
              return (
                <li key={repo}>
                  <button
                    type="button"
                    onClick={() => handleToggleRepo(repo)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                      {isRepoExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                    <Github className="h-4 w-4 flex-shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{repo}</span>
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {skills.length}
                    </span>
                  </button>
                  {isRepoExpanded && (
                    <ul className="list-none space-y-1">
                      {skills.map((skill) => (
                        <li key={skill.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedItem(skill)}
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
        </div>
      </aside>

      {/* Main content: spans available width (right panel only when skill selected) */}
      <main className="flex min-w-0 min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="p-6">
          {viewMode === 'marketplace' && !displayItem ? (
            <>
                  <div className="rounded-xl border border-border bg-gradient-to-br from-muted/50 via-muted/30 to-muted/10 p-10 sm:p-12 flex flex-col items-start">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[4px] bg-foreground/10 text-foreground">
                      <Store className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight text-left">
                      Skills Market
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
                  <span>Back to Skills Market</span>
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
                  <Button variant="default" size="sm">
                    Create New Conversation
                  </Button>
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
                {detailPanelView === 'file' && (
                  <button
                    type="button"
                    onClick={handleDetailBack}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Back to folder structure"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <span className="truncate text-sm font-medium text-foreground">
                  {detailPanelView === 'folder'
                    ? displayItem.repo
                    : selectedFile?.name ?? ''}
                </span>
                {detailPanelView === 'file' && (
                  <a
                    href="#"
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
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
              {detailPanelView === 'folder' ? (
                <RepoFolderTree
                  tree={skillRepoTree}
                  onFileClick={handleFileClick}
                  expanded={expandedFolders}
                  onToggleFolder={handleToggleFolder}
                />
              ) : selectedFile ? (
                <FileContentView content={selectedFile.content} fileName={selectedFile.name} />
              ) : null}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
