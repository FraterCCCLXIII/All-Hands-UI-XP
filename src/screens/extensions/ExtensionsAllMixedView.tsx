import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  BookOpen,
  Bot,
  Box,
  Code2,
  ExternalLink,
  FlaskConical,
  GitBranch,
  ShieldCheck,
  Webhook,
  Wrench,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { PluginToggle } from '../../components/ui/plugin-toggle';
import { marketplaceSkills } from '../../data/skillsPageData';
import {
  hooksCatalogCategories,
  hooksCatalogEntries,
  type HooksCatalogEntry,
} from '../../data/hooksCatalog';
import { mcpCatalogCategories, mcpCatalogEntries, type McpCatalogEntry } from '../../data/mcpCatalog';
import { navigateAppRoute } from '../../lib/captureNavigation';
import { EXTENSIONS_PLUGINS_BASE, EXTENSIONS_SKILLS_BASE } from '../../lib/extensionsRoutes';
import { cn } from '../../lib/utils';
import { ExtensionsCatalogAddButton } from './ExtensionsCatalogAddButton';
import { ExtensionsCatalogPageHeader } from './ExtensionsCatalogPageHeader';
import { getSkillSource, SkillSourceBadge } from './SkillSourceBadge';
import { ExtensionsShellSidebar, type ExtensionsBrowseControls } from './ExtensionsShellSidebar';
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

function skillMatchesQuery(
  skill: (typeof marketplaceSkills)[number],
  q: string
): boolean {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const name = (skill.skillName ?? skill.title).toLowerCase();
  return name.includes(s) || skill.description.toLowerCase().includes(s);
}

function mcpMatchesQuery(entry: McpCatalogEntry, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const categoryLabelMatch = entry.tags.some((tag) => {
    const label = mcpCatalogCategories.find((c) => c.slug === tag)?.name?.toLowerCase() ?? '';
    return label.includes(s);
  });
  return (
    entry.name.toLowerCase().includes(s) ||
    entry.description.toLowerCase().includes(s) ||
    (entry.provider?.toLowerCase().includes(s) ?? false) ||
    entry.tags.some((t) => t.toLowerCase().includes(s)) ||
    categoryLabelMatch
  );
}

function hooksMatchesQuery(entry: HooksCatalogEntry, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const categoryLabelMatch = entry.tags.some((tag) => {
    const label = hooksCatalogCategories.find((c) => c.slug === tag)?.name?.toLowerCase() ?? '';
    return label.includes(s);
  });
  return (
    entry.name.toLowerCase().includes(s) ||
    entry.description.toLowerCase().includes(s) ||
    (entry.trigger?.toLowerCase().includes(s) ?? false) ||
    entry.tags.some((t) => t.toLowerCase().includes(s)) ||
    categoryLabelMatch
  );
}

export type ExtensionsAllMixedViewProps = {
  browseControls: ExtensionsBrowseControls;
  footerExtra?: ReactNode;
};

export function ExtensionsAllMixedView({ browseControls, footerExtra }: ExtensionsAllMixedViewProps) {
  /** Enabled state for marketplace skills and plugins (toggle on cards). */
  const [marketplaceSwitchById, setMarketplaceSwitchById] = useState<Record<string, boolean>>({});
  const { searchQuery, scope } = browseControls;

  const filteredSkills = useMemo(
    () => marketplaceSkills.filter((skill) => skillMatchesQuery(skill, searchQuery)),
    [searchQuery]
  );
  const filteredMcp = useMemo(
    () => mcpCatalogEntries.filter((e) => mcpMatchesQuery(e, searchQuery)),
    [searchQuery]
  );
  const filteredHooks = useMemo(
    () => hooksCatalogEntries.filter((e) => hooksMatchesQuery(e, searchQuery)),
    [searchQuery]
  );

  /** Skills-only rows (non-plugin marketplace items). */
  const skillCatalogItems = useMemo(() => {
    if (scope === 'plugins' || scope === 'hooks') return [];
    return filteredSkills.filter((s) => s.isPlugin !== true);
  }, [filteredSkills, scope]);

  /** Plugin rows (`isPlugin`). */
  const pluginCatalogItems = useMemo(() => {
    if (scope === 'skills' || scope === 'hooks') return [];
    return filteredSkills.filter((s) => s.isPlugin === true);
  }, [filteredSkills, scope]);

  const showSkillsSection =
    scope === 'all' || scope === 'skills' || scope === 'plugins';
  const showMcpSection = scope === 'all' || scope === 'mcp';
  const showHooksSection = scope === 'all' || scope === 'hooks';

  const renderMarketplaceCard = (skill: (typeof marketplaceSkills)[number]) => {
    const label = skill.skillName ?? skill.title;
    const locked = skill.switchLocked === true;
    const enabled = locked ? true : marketplaceSwitchById[skill.id] !== false;
    const IconComponent = getSkillIcon(skill.id);
    const showPluginToggle =
      skill.isPlugin === true && (scope === 'all' || scope === 'plugins');
    const showSkillToggle =
      skill.isPlugin !== true && (scope === 'all' || scope === 'skills');
    const showToggle = showPluginToggle || showSkillToggle;
    const source = getSkillSource(skill);
    return (
      <div
        key={skill.id}
        className="relative rounded-xl border border-border bg-card transition-colors hover:bg-muted/40"
      >
        {showToggle ? (
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
        ) : null}
        <button
          type="button"
          onClick={() =>
            navigateAppRoute(
              skill.isPlugin === true
                ? `#/${EXTENSIONS_PLUGINS_BASE}/plugin/${encodeURIComponent(skill.id)}`
                : `#/${EXTENSIONS_SKILLS_BASE}/skill/${encodeURIComponent(skill.id)}`
            )
          }
          className={cn(
            'w-full rounded-xl p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
            showToggle ? 'pr-14 pt-5' : 'p-5'
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-base font-medium text-foreground">{label}</span>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{skill.description}</p>
              <div className="mt-3">
                <SkillSourceBadge source={source} />
              </div>
            </div>
          </div>
        </button>
      </div>
    );
  };

  const skillsDescription =
    'Discover skills to add to your workspace. Open a card for prompts, curl, and install flows.';
  const pluginsDescription =
    'Enable plugin bundles that ship multiple skills together. Open a pack for files, toggles, and bundled skills.';
  const mcpDescription = (
    <>
      Browse recommended Model Context Protocol servers. Add and manage connections in{' '}
      <button
        type="button"
        className="font-medium text-foreground transition-colors hover:text-foreground/90"
        onClick={() => navigateAppRoute('#/settings/mcp')}
      >
        Settings
      </button>
      .
    </>
  );

  const hooksDescription = (
    <>
      Automation entry points for Git, CI, chat, and schedules. Configure webhooks and integrations in{' '}
      <button
        type="button"
        className="font-medium text-foreground transition-colors hover:text-foreground/90"
        onClick={() => navigateAppRoute('#/settings/integrations')}
      >
        Settings
      </button>
      .
    </>
  );

  const mcpList = (
    <>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredMcp.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-start gap-2">
              <Box className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground">{entry.name}</h3>
                {entry.provider &&
                entry.provider.trim().toLowerCase() !== entry.name.trim().toLowerCase() ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{entry.provider}</p>
                ) : null}
              </div>
            </div>
            <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{entry.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" variant="default" onClick={() => navigateAppRoute('#/settings/mcp')}>
                Add in Settings
              </Button>
              {entry.docsUrl ? (
                <Button type="button" size="sm" variant="outline" asChild>
                  <a
                    href={entry.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    View docs
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {filteredMcp.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No MCP servers match your search.</p>
      ) : null}
    </>
  );

  const hooksList = (
    <>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredHooks.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-start gap-2">
              <Webhook className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground">{entry.name}</h3>
                {entry.trigger ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{entry.trigger}</p>
                ) : null}
              </div>
            </div>
            <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{entry.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => navigateAppRoute('#/settings/integrations')}
              >
                Configure in Settings
              </Button>
              {entry.docsUrl ? (
                <Button type="button" size="sm" variant="outline" asChild>
                  <a
                    href={entry.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    View docs
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {filteredHooks.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No hooks match your search.</p>
      ) : null}
    </>
  );

  return (
    <div className="flex h-full min-w-0 overflow-hidden bg-background">
      <ExtensionsShellSidebar browseControls={browseControls} footerExtra={footerExtra} />

      <main className="repo-dropdown-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        {scope === 'all' ? (
          <div className="p-6">
            {showSkillsSection && (scope === 'all' || scope === 'skills') && (
              <section aria-labelledby="ext-skills-heading">
                <ExtensionsCatalogPageHeader
                  titleId="ext-skills-heading"
                  title="Skills"
                  description={skillsDescription}
                  actions={<ExtensionsCatalogAddButton kind="skill" />}
                  bordered={false}
                  className="px-0"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {skillCatalogItems.map(renderMarketplaceCard)}
                </div>
                {skillCatalogItems.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">No skills match your search.</p>
                ) : null}
              </section>
            )}

            {showSkillsSection && (scope === 'all' || scope === 'plugins') && (
              <section
                aria-labelledby="ext-plugins-heading"
                className={cn(scope === 'all' ? 'mt-12 border-t border-border pt-10' : 'mt-0')}
              >
                <ExtensionsCatalogPageHeader
                  titleId="ext-plugins-heading"
                  title="Plugins"
                  description={pluginsDescription}
                  actions={<ExtensionsCatalogAddButton kind="plugin" />}
                  bordered={false}
                  className="px-0"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pluginCatalogItems.map(renderMarketplaceCard)}
                </div>
                {pluginCatalogItems.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">No plugins match your search.</p>
                ) : null}
              </section>
            )}

            {showMcpSection && (
              <section
                className={cn(
                  showSkillsSection && scope === 'all' ? 'mt-12 border-t border-border pt-10' : 'mt-0'
                )}
                aria-labelledby="ext-mcp-heading"
              >
                <ExtensionsCatalogPageHeader
                  titleId="ext-mcp-heading"
                  title="MCP servers"
                  description={mcpDescription}
                  actions={<ExtensionsCatalogAddButton kind="mcp" />}
                  bordered={false}
                  className="px-0"
                />
                <div>{mcpList}</div>
              </section>
            )}

            {showHooksSection && (
              <section
                className={cn(
                  (showSkillsSection || showMcpSection) && scope === 'all'
                    ? 'mt-12 border-t border-border pt-10'
                    : 'mt-0'
                )}
                aria-labelledby="ext-hooks-heading"
              >
                <ExtensionsCatalogPageHeader
                  titleId="ext-hooks-heading"
                  title="Hooks"
                  description={hooksDescription}
                  actions={<ExtensionsCatalogAddButton kind="hook" />}
                  bordered={false}
                  className="px-0"
                />
                <div>{hooksList}</div>
              </section>
            )}
          </div>
        ) : (
          <>
            {scope === 'skills' && (
              <>
                <ExtensionsCatalogPageHeader
                  title="Skills"
                  description={skillsDescription}
                  actions={<ExtensionsCatalogAddButton kind="skill" />}
                />
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {skillCatalogItems.map(renderMarketplaceCard)}
                  </div>
                  {skillCatalogItems.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">No skills match your search.</p>
                  ) : null}
                </div>
              </>
            )}
            {scope === 'plugins' && (
              <>
                <ExtensionsCatalogPageHeader
                  title="Plugins"
                  description={pluginsDescription}
                  actions={<ExtensionsCatalogAddButton kind="plugin" />}
                />
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pluginCatalogItems.map(renderMarketplaceCard)}
                  </div>
                  {pluginCatalogItems.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">No plugins match your search.</p>
                  ) : null}
                </div>
              </>
            )}
            {scope === 'mcp' && (
              <>
                <ExtensionsCatalogPageHeader
                  title="MCP servers"
                  description={mcpDescription}
                  actions={<ExtensionsCatalogAddButton kind="mcp" />}
                />
                <div className="px-6 pb-6">{mcpList}</div>
              </>
            )}
            {scope === 'hooks' && (
              <>
                <ExtensionsCatalogPageHeader
                  title="Hooks"
                  description={hooksDescription}
                  actions={<ExtensionsCatalogAddButton kind="hook" />}
                />
                <div className="px-6 pb-6">{hooksList}</div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
