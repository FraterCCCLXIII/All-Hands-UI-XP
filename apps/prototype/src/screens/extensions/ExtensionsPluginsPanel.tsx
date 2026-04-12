import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Folder,
  Github,
} from 'lucide-react';
import {
  marketplaceSkills,
  skillRepoTree,
  type RepoTreeNode,
  type SkillRepositoryItem,
} from '../../data/skillsPageData';
import { InfoCard } from '../../components/common/InfoCard';
import { PluginToggle } from '../../components/ui/plugin-toggle';
import { APP_ROUTE_EVENT, navigateAppRoute } from '../../lib/captureNavigation';
import { EXTENSIONS_ALL_BASE, EXTENSIONS_PLUGINS_BASE } from '../../lib/extensionsRoutes';
import { ExtensionsCatalogAddButton } from './ExtensionsCatalogAddButton';
import { ExtensionsCatalogPageHeader } from './ExtensionsCatalogPageHeader';
import { getSkillSource, SkillSourceBadge } from './SkillSourceBadge';
import { ExtensionsShellSidebar, type ExtensionsBrowseControls } from './ExtensionsShellSidebar';
import { cn } from '../../lib/utils';
import { toSkillFileName } from './pluginRepoUtils';

type ExtensionsPluginsPanelProps = {
  browseControls: ExtensionsBrowseControls;
};

export function ExtensionsPluginsPanel({ browseControls }: ExtensionsPluginsPanelProps) {
  const [selectedPlugin, setSelectedPlugin] = useState<SkillRepositoryItem | null>(null);
  const [pluginDetailView, setPluginDetailView] = useState<'files' | 'content'>('files');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(['root', 'root/skills']),
  );
  const [selectedFilePath, setSelectedFilePath] = useState<string>('root/README.md');
  /** Per-plugin enabled state; missing id defaults to on. */
  const [pluginEnabledById, setPluginEnabledById] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const applyPluginFromHash = () => {
      const raw = window.location.hash.replace(/^#\/?/, '');
      if (!raw.startsWith(EXTENSIONS_PLUGINS_BASE) && !raw.startsWith(EXTENSIONS_ALL_BASE)) return;

      const pathPart = raw.split('?')[0];
      let pluginId: string | null = null;
      const pathMatch = pathPart.match(/^extensions\/plugins\/plugin\/([^/?#]+)/);
      if (pathMatch) {
        pluginId = decodeURIComponent(pathMatch[1]);
      } else {
        const qIdx = raw.indexOf('?');
        if (qIdx >= 0) {
          pluginId = new URLSearchParams(raw.slice(qIdx + 1)).get('plugin');
        }
      }

      if (!pluginId) {
        if (pathPart === EXTENSIONS_PLUGINS_BASE || pathPart === EXTENSIONS_ALL_BASE) {
          setSelectedPlugin(null);
        }
        return;
      }

      const skill = marketplaceSkills.find((s) => s.id === pluginId);
      if (!skill) return;
      setSelectedPlugin(skill);
    };
    applyPluginFromHash();
    window.addEventListener('hashchange', applyPluginFromHash);
    window.addEventListener(APP_ROUTE_EVENT, applyPluginFromHash);
    return () => {
      window.removeEventListener('hashchange', applyPluginFromHash);
      window.removeEventListener(APP_ROUTE_EVENT, applyPluginFromHash);
    };
  }, []);

  const filteredSkills = useMemo(() => {
    const query = browseControls.searchQuery.trim().toLowerCase();

    return marketplaceSkills.filter((item) => {
      if (!item.isPlugin) return false;
      const itemName = (item.skillName ?? item.title).toLowerCase();

      const matchesSearch =
        !query || itemName.includes(query) || item.description.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [browseControls.searchQuery]);

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
      <ExtensionsShellSidebar browseControls={browseControls} />

      <main
        className={cn(
          'flex min-w-0 min-h-0 flex-1 flex-col',
          selectedPlugin ? 'overflow-hidden' : 'overflow-y-auto'
        )}
      >
        {selectedPlugin ? (
          <div className="flex min-h-0 flex-1 flex-col p-6">
            <div className="flex h-full min-h-0 gap-4">
              <div className="repo-dropdown-scroll min-w-0 flex-1 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlugin(null);
                    const h = window.location.hash;
                    if (h.includes('plugin=') || h.includes('/plugin/')) {
                      navigateAppRoute(`#/${EXTENSIONS_ALL_BASE}`);
                    }
                  }}
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
                      <div className="mt-4">
                        <SkillSourceBadge source={getSkillSource(selectedPlugin)} />
                      </div>
                    </div>
                    {selectedPlugin.isPlugin ? (
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
                    ) : null}
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
          </div>
        ) : (
          <>
            <ExtensionsCatalogPageHeader
              title="Plugins"
              description="Enable plugin bundles that ship multiple skills together. Open a pack for files, toggles, and bundled skills."
              actions={<ExtensionsCatalogAddButton kind="plugin" />}
            />
            <div className="px-6 pb-6">
              <section aria-labelledby="plugins-marketplace-heading">
                <h3 id="plugins-marketplace-heading" className="sr-only">
                  Available plugins
                </h3>
                {filteredSkills.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No marketplace plugins match your search.
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
                          onClick={() => {
                            navigateAppRoute(
                              `#/${EXTENSIONS_PLUGINS_BASE}/plugin/${encodeURIComponent(skill.id)}`,
                            );
                          }}
                          className="w-full rounded-xl p-5 pr-14 pt-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                              <Box className="h-5 w-5" />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="text-base font-medium text-foreground">{pluginLabel}</span>
                              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                                {skill.description}
                              </p>
                              <div className="mt-3">
                                <SkillSourceBadge source={getSkillSource(skill)} />
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
