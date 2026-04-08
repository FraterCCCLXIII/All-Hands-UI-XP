import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Folder,
  Github,
  Package,
} from 'lucide-react';
import { SearchInput } from '../components/ui/search-input';
import {
  marketplaceSkills,
  skillRepoTree,
  type RepoTreeNode,
  type SkillRepositoryItem,
} from '../data/skillsPageData';
import { InfoCard } from '../components/common/InfoCard';
import { PluginToggle } from '../components/ui/plugin-toggle';

type PluginMarketplaceScreenProps = {
  installedPluginRepos?: string[];
};

function extractRepoSlug(value: string): string | null {
  const normalized = value.trim().replace(/\.git$/, '');
  if (!normalized) return null;

  const directSlugMatch = normalized.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/);
  if (directSlugMatch) return directSlugMatch[1];

  const hostSlugMatch = normalized.match(/(?:github\.com|gitlab\.com)[/:]([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/i);
  if (hostSlugMatch) return hostSlugMatch[1];

  try {
    const parsed = new URL(normalized);
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      return `${segments[0]}/${segments[1]}`;
    }
  } catch {
    return null;
  }

  return null;
}

function normalizeRepoKey(value: string): string | null {
  const slug = extractRepoSlug(value);
  return slug ? slug.toLowerCase() : null;
}

function toSkillFileName(skillName: string): string {
  return `${skillName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')}.md`;
}

export function PluginMarketplaceScreen({
  installedPluginRepos = [],
}: PluginMarketplaceScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<SkillRepositoryItem | null>(null);
  const [pluginDetailView, setPluginDetailView] = useState<'files' | 'content'>('files');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(['root', 'root/skills']),
  );
  const [selectedFilePath, setSelectedFilePath] = useState<string>('root/README.md');
  /** Per-plugin enabled state; missing id defaults to on. */
  const [pluginEnabledById, setPluginEnabledById] = useState<Record<string, boolean>>({});

  const repoItems = useMemo(
    () =>
      installedPluginRepos.map((repo) => {
        const slug = extractRepoSlug(repo);
        const repoKey = normalizeRepoKey(repo);
        return {
          value: repo,
          label: slug ?? repo,
          slug,
          repoKey,
        };
      }),
    [installedPluginRepos],
  );

  const filteredRepoItems = useMemo(() => {
    if (!repoSearchQuery.trim()) return repoItems;
    const query = repoSearchQuery.toLowerCase();
    return repoItems.filter(
      (repo) => repo.label.toLowerCase().includes(query) || repo.value.toLowerCase().includes(query),
    );
  }, [repoItems, repoSearchQuery]);

  const filteredSkills = useMemo(() => {
    const selectedRepoKey = normalizeRepoKey(selectedRepo ?? '');
    const query = searchQuery.trim().toLowerCase();

    return marketplaceSkills.filter((item) => {
      const itemName = (item.skillName ?? item.title).toLowerCase();
      const itemRepoKey = normalizeRepoKey(item.repo) ?? normalizeRepoKey(item.repoUrl ?? '');

      const matchesSearch =
        !query || itemName.includes(query) || item.description.toLowerCase().includes(query);
      const matchesRepo = !selectedRepoKey || (itemRepoKey != null && itemRepoKey === selectedRepoKey);

      return matchesSearch && matchesRepo;
    });
  }, [searchQuery, selectedRepo]);

  const selectedRepoLabel = useMemo(
    () => repoItems.find((repo) => repo.value === selectedRepo)?.label ?? null,
    [repoItems, selectedRepo],
  );

  const pluginBundleSkills = useMemo(() => {
    if (!selectedPlugin) return [];
    const grouped = marketplaceSkills.filter(
      (item) => item.category === selectedPlugin.category || item.repo === selectedPlugin.repo,
    );
    return grouped.slice(0, 6);
  }, [selectedPlugin]);

  const pluginTree = useMemo<RepoTreeNode[]>(() => {
    if (!selectedPlugin) return [];
    const pluginName = selectedPlugin.skillName ?? selectedPlugin.title;
    return [
      {
        name: 'README.md',
        type: 'file',
        content: `# ${pluginName} Plugin Bundle

This plugin bundles multiple skills into a single installable package.

## Included skills
${pluginBundleSkills.map((skill) => `- ${skill.skillName ?? skill.title}`).join('\n')}
`,
      },
      {
        name: 'plugin.json',
        type: 'file',
        content: JSON.stringify(
          {
            name: pluginName,
            sourceRepo: selectedPlugin.repo,
            repoUrl: selectedPlugin.repoUrl,
            skills: pluginBundleSkills.map((skill) => ({
              id: skill.id,
              name: skill.skillName ?? skill.title,
              description: skill.description,
            })),
          },
          null,
          2,
        ),
      },
      {
        name: 'skills',
        type: 'folder',
        children: pluginBundleSkills.map((skill) => ({
          name: toSkillFileName(skill.skillName ?? skill.title),
          type: 'file',
          content: `# ${skill.skillName ?? skill.title}

${skill.description}

## Initial Prompt
${skill.initialPrompt}
`,
        })),
      },
      {
        name: 'examples',
        type: 'folder',
        children: skillRepoTree,
      },
    ];
  }, [pluginBundleSkills, selectedPlugin]);

  const treeFiles = useMemo(() => {
    const files: Array<{ path: string; name: string; content: string }> = [];

    const walk = (nodes: RepoTreeNode[], parentPath: string) => {
      nodes.forEach((node) => {
        const path = `${parentPath}/${node.name}`;
        if (node.type === 'file') {
          files.push({ path, name: node.name, content: node.content ?? '' });
        } else {
          walk(node.children ?? [], path);
        }
      });
    };

    walk(pluginTree, 'root');
    return files;
  }, [pluginTree]);

  useEffect(() => {
    if (selectedPlugin) {
      const firstFile = treeFiles[0]?.path ?? 'root/README.md';
      setSelectedFilePath(firstFile);
      setPluginDetailView('files');
    }
  }, [selectedPlugin, treeFiles]);

  const selectedFile = useMemo(
    () => treeFiles.find((file) => file.path === selectedFilePath) ?? null,
    [treeFiles, selectedFilePath],
  );

  const renderTree = (nodes: RepoTreeNode[], parentPath: string) =>
    nodes.map((node) => {
      const path = `${parentPath}/${node.name}`;
      if (node.type === 'folder') {
        const isExpanded = expandedFolders.has(path);
        return (
          <li key={path}>
            <button
              type="button"
              onClick={() =>
                setExpandedFolders((prev) => {
                  const next = new Set(prev);
                  if (next.has(path)) next.delete(path);
                  else next.add(path);
                  return next;
                })
              }
              className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <Folder className="h-3.5 w-3.5" />
              <span className="truncate">{node.name}</span>
            </button>
            {isExpanded && (node.children?.length ?? 0) > 0 && (
              <ul className="ml-4 mt-0.5 space-y-0.5">{renderTree(node.children ?? [], path)}</ul>
            )}
          </li>
        );
      }

      return (
        <li key={path}>
          <button
            type="button"
            onClick={() => {
              setSelectedFilePath(path);
              setPluginDetailView('content');
            }}
            className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs transition-colors ${
              selectedFilePath === path
                ? 'bg-muted/80 text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="truncate">{node.name}</span>
          </button>
        </li>
      );
    });

  return (
    <div className="flex h-full w-full min-w-0 overflow-hidden bg-background">
      <aside className="flex w-64 flex-shrink-0 flex-col">
        <div className="p-4">
          <h1 className="text-lg font-semibold text-foreground">Plugin Marketplace</h1>
          <div className="mt-3">
            <SearchInput
              value={repoSearchQuery}
              onValueChange={setRepoSearchQuery}
              placeholder="Search repositories"
              aria-label="Search repositories"
              size="sm"
            />
          </div>
          <nav className="mt-3 space-y-0.5">
            <ul className="list-none space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedRepo(null)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                    selectedRepo === null
                      ? 'bg-muted/80 text-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <Package className="h-4 w-4 flex-shrink-0" />
                  <span>All Plugins</span>
                </button>
              </li>
              {filteredRepoItems.map((repo) => (
                <li key={repo.value}>
                  <button
                    type="button"
                    onClick={() => setSelectedRepo(repo.value)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      selectedRepo === repo.value
                        ? 'bg-muted/80 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <Github className="h-4 w-4 flex-shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{repo.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {filteredRepoItems.length === 0 && (
            <div className="px-2">
              <p className="text-xs text-muted-foreground">
                No activated repositories yet. Add one in Settings → Plugins.
              </p>
              <a
                href="#/settings/plugins"
                className="mt-2 inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-xs text-foreground transition-colors hover:bg-muted/60"
              >
                Open Settings
              </a>
            </div>
          )}
        </div>
      </aside>

      <main className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col p-6">
          {selectedPlugin ? (
            <div className="flex h-full min-h-0 gap-4">
              <div className="repo-dropdown-scroll min-w-0 flex-1 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedPlugin(null)}
                  className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Plugin Marketplace</span>
                </button>

                <div className="my-6">
                  <div className="flex items-start justify-between gap-4 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-2xl font-semibold text-foreground">
                        {selectedPlugin.skillName ?? selectedPlugin.title}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">{selectedPlugin.description}</p>
                      <a
                        href={selectedPlugin.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                      >
                        <Github className="h-4 w-4" />
                        <span className="font-mono">
                          {selectedPlugin.repoUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                      </a>
                    </div>
                    <PluginToggle
                      className="mt-0.5 shrink-0"
                      checked={
                        selectedPlugin.switchLocked === true
                          ? true
                          : pluginEnabledById[selectedPlugin.id] !== false
                      }
                      locked={selectedPlugin.switchLocked === true}
                      onCheckedChange={() =>
                        setPluginEnabledById((prev) => ({
                          ...prev,
                          [selectedPlugin.id]: !(prev[selectedPlugin.id] !== false),
                        }))
                      }
                      aria-label={
                        selectedPlugin.switchLocked
                          ? `${selectedPlugin.skillName ?? selectedPlugin.title} is on and locked by your organization`
                          : pluginEnabledById[selectedPlugin.id] !== false
                            ? `Turn off ${selectedPlugin.skillName ?? selectedPlugin.title}`
                            : `Turn on ${selectedPlugin.skillName ?? selectedPlugin.title}`
                      }
                    />
                  </div>
                </div>

                <section className="mt-4">
                  <h3 className="text-sm font-semibold text-foreground">Skills in this plugin bundle</h3>
                  <div className="mt-3 grid grid-cols-1 gap-4">
                    {pluginBundleSkills.map((skill) => (
                      <InfoCard
                        key={skill.id}
                        as="button"
                        type="button"
                        onClick={() => {
                          const filePath = `root/skills/${toSkillFileName(skill.skillName ?? skill.title)}`;
                          setSelectedFilePath(filePath);
                          setPluginDetailView('content');
                        }}
                        title={skill.skillName ?? skill.title}
                        description={skill.description}
                        icon={<Box className="h-5 w-5" />}
                        iconPosition="left"
                        interactive
                        className="w-full"
                      />
                    ))}
                  </div>
                </section>
              </div>

              <section
                className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card"
                aria-label="Plugin file detail"
              >
                {pluginDetailView === 'files' ? (
                  <>
                    <div className="border-b border-border px-4 py-2">
                      <span className="text-sm font-medium text-foreground">Files</span>
                    </div>
                    <div className="repo-dropdown-scroll min-h-0 flex-1 overflow-y-auto p-4">
                      <ul className="space-y-0.5">{renderTree(pluginTree, 'root')}</ul>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setPluginDetailView('files')}
                        className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Back</span>
                      </button>
                      <span className="text-xs font-medium text-foreground">
                        {selectedFile?.name ?? 'No file selected'}
                      </span>
                    </div>
                    <div className="repo-dropdown-scroll min-h-0 flex-1 overflow-y-auto p-4">
                      <pre className="whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                        {selectedFile?.content ?? 'Select a file from the directory.'}
                      </pre>
                    </div>
                  </>
                )}
              </section>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-gradient-to-br from-muted/50 via-muted/30 to-muted/10 p-10 sm:p-12">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[4px] bg-foreground/10 text-foreground">
                  <Box className="h-6 w-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
                  {selectedRepoLabel ? `${selectedRepoLabel} Plugins` : 'Plugin Marketplace'}
                </h2>
                <div className="mt-8 w-full max-w-lg">
                  <SearchInput
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder={selectedRepoLabel ? `Search plugins in ${selectedRepoLabel}` : 'Search plugins'}
                    aria-label="Search marketplace plugins"
                    size="lg"
                  />
                </div>
              </div>

              <section className="mt-6">
                <h3 className="text-sm font-semibold text-foreground">Available Plugins</h3>
                {selectedRepo && filteredSkills.length === 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No marketplace plugins found for this repository yet.
                  </p>
                )}
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {filteredSkills.map((skill) => {
                    const pluginLabel = skill.skillName ?? skill.title;
                    const locked = skill.switchLocked === true;
                    const enabled = locked ? true : pluginEnabledById[skill.id] !== false;
                    return (
                      <div
                        key={skill.id}
                        className="relative rounded-xl border border-border bg-card transition-colors hover:bg-muted/50"
                      >
                        <PluginToggle
                          size="sm"
                          className="absolute right-3 top-3 z-10"
                          checked={enabled}
                          locked={locked}
                          onCheckedChange={() =>
                            setPluginEnabledById((prev) => ({
                              ...prev,
                              [skill.id]: !(prev[skill.id] !== false),
                            }))
                          }
                          aria-label={
                            locked
                              ? `${pluginLabel} is on and locked by your organization`
                              : enabled
                                ? `Turn off ${pluginLabel}`
                                : `Turn on ${pluginLabel}`
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedPlugin(skill)}
                          className="w-full rounded-xl p-5 pr-14 pt-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                              <Box className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-base font-medium text-foreground">
                                {pluginLabel}
                              </span>
                              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                                {skill.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
