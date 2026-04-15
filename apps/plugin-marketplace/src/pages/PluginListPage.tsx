import { useMemo, useState } from 'react';
import { PLUGINS, getFeaturedPlugins } from '../data/plugins';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { PluginCard } from '../components/PluginCard';

function matchesSearch(
  p: (typeof PLUGINS)[number],
  q: string
): boolean {
  return (
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

const gridClass =
  'grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';

export default function PluginListPage() {
  const [search, setSearch] = useState('');

  const { isSearching, featuredPlugins, mainPlugins, empty } = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q) {
      const filtered = PLUGINS.filter((p) => matchesSearch(p, q));
      return {
        isSearching: true,
        featuredPlugins: [] as typeof PLUGINS,
        mainPlugins: filtered,
        empty: filtered.length === 0,
      };
    }
    const featured = getFeaturedPlugins();
    const rest = PLUGINS.filter((p) => !p.featured);
    return {
      isSearching: false,
      featuredPlugins: featured,
      mainPlugins: rest,
      empty: false,
    };
  }, [search]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketplaceHeader search={search} onSearchChange={setSearch} />

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 md:px-6">
        {!isSearching && featuredPlugins.length > 0 ? (
          <section className="mb-10" aria-labelledby="featured-heading">
            <h2 id="featured-heading" className="mb-4 text-lg font-semibold tracking-tight text-foreground">
              Featured
            </h2>
            <ul className={gridClass}>
              {featuredPlugins.map((plugin) => (
                <li key={plugin.id}>
                  <PluginCard plugin={plugin} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="all-plugins-heading">
          <h2 id="all-plugins-heading" className="mb-6 text-lg font-semibold tracking-tight text-foreground">
            {isSearching ? 'Matching plugins' : 'All Plugins'}
          </h2>

          {empty ? (
            <p className="text-sm text-muted-foreground">No plugins match your search.</p>
          ) : (
            <ul className={gridClass}>
              {mainPlugins.map((plugin) => (
                <li key={plugin.id}>
                  <PluginCard plugin={plugin} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
