import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { SearchInput } from '../../components/ui/search-input';
import { Button } from '../../components/ui/button';
import { mcpCatalogCategories, mcpCatalogEntries, type McpCatalogEntry } from '../../data/mcpCatalog';
import { navigateAppRoute } from '../../lib/captureNavigation';
import { cn } from '../../lib/utils';
import { ExtensionsCatalogAddButton } from './ExtensionsCatalogAddButton';
import { ExtensionsCatalogPageHeader } from './ExtensionsCatalogPageHeader';

function entryMatchesQuery(entry: McpCatalogEntry, q: string): boolean {
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

export function ExtensionsMcpPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySlug, setCategorySlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return mcpCatalogEntries.filter((entry) => {
      if (categorySlug && !entry.tags.includes(categorySlug)) return false;
      return entryMatchesQuery(entry, searchQuery);
    });
  }, [searchQuery, categorySlug]);

  const description = (
    <>
      Browse recommended Model Context Protocol servers. Add and manage connections in{' '}
      <button
        type="button"
        className="font-medium text-foreground transition-colors hover:text-foreground/90"
        onClick={() => navigateAppRoute('/settings/mcp')}
      >
        Settings
      </button>
      .
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <ExtensionsCatalogPageHeader
        title="MCP servers"
        description={description}
        actions={<ExtensionsCatalogAddButton kind="mcp" />}
      >
        <div className="max-w-lg">
          <SearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search by name, tag, or description"
            aria-label="Search MCP catalog"
            size="lg"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setCategorySlug(null)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              categorySlug === null
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted/60'
            )}
          >
            All
          </button>
          {mcpCatalogCategories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setCategorySlug(cat.slug === categorySlug ? null : cat.slug)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                categorySlug === cat.slug
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted/60'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </ExtensionsCatalogPageHeader>

      <div className="flex-1 px-6 py-6">
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-2">
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
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  onClick={() => navigateAppRoute('/settings/mcp')}
                >
                  Add in Settings
                </Button>
                {entry.docsUrl ? (
                  <Button type="button" size="sm" variant="outline" asChild>
                    <a href={entry.docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                      View docs
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No servers match your search.</p>
        ) : null}
      </div>

      <footer className="border-t border-border px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Configure installed servers under{' '}
          <button
            type="button"
            className="font-medium text-foreground transition-colors hover:text-foreground/90"
            onClick={() => navigateAppRoute('/settings/mcp')}
          >
            Settings → MCP
          </button>
          .
        </p>
      </footer>
    </div>
  );
}
