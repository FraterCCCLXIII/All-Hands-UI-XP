import { useState, type ReactNode } from 'react';
import {
  GitBranch,
  Github,
  Paperclip,
  Send,
  Settings,
  Sparkles,
  SquareKanban,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { SearchInput } from '../components/ui/search-input';
import { PluginToggle } from '../components/ui/plugin-toggle';
import { cn } from '../lib/utils';

type BlockDef = {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
};

function BlockFrame({ title, description, children }: Omit<BlockDef, 'id'>) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="min-h-[280px] p-6 md:min-h-[320px]">{children}</div>
    </section>
  );
}

/**
 * Larger composed “blocks” for the component library — multi-control layouts meant to mirror real screens.
 */
export function ComponentLibraryBlocksScreen() {
  const [search, setSearch] = useState('');
  const [pluginOn, setPluginOn] = useState(true);

  const blocks: BlockDef[] = [
    {
      id: 'block-workspace-header',
      title: 'Workspace header',
      description: 'Search, status, and primary actions as a single horizontal strip.',
      children: (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search workspace…"
            className="w-full max-w-md"
            size="sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Synced</Badge>
            <Badge>Live</Badge>
            <Button size="sm" variant="outline" type="button">
              <Settings className="mr-1.5 h-4 w-4" aria-hidden />
              Settings
            </Button>
            <Button size="sm" type="button">
              New task
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: 'block-repo-bar',
      title: 'Repository & branch bar',
      description: 'Git context row: repo, branch, and PR affordances.',
      children: (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Github className="h-4 w-4 text-muted-foreground" aria-hidden />
              all-hands/ui
            </span>
            <span className="text-border">/</span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <GitBranch className="h-4 w-4" aria-hidden />
              feature/library-nav
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" type="button">
              Open PR
            </Button>
            <Button size="sm" variant="outline" type="button">
              Compare
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: 'block-chat-composer',
      title: 'Chat composer block',
      description: 'Attachment affordance, growing input, and send — typical chat footer.',
      children: (
        <div className="rounded-xl border border-border bg-background p-3 shadow-inner">
          <div className="mb-3 min-h-[72px] rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            Ask the agent to refactor the navigation shell…
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button size="sm" variant="ghost" type="button" className="text-muted-foreground">
              <Paperclip className="mr-1.5 h-4 w-4" aria-hidden />
              Attach
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">GPT-4</span>
              <Button size="sm" type="button">
                <Send className="mr-1.5 h-4 w-4" aria-hidden />
                Send
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'block-board-lane',
      title: 'Board lane',
      description: 'Column header with WIP badges and inline add.',
      children: (
        <div className="max-w-lg rounded-xl border border-border bg-muted/20 p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SquareKanban className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-sm font-semibold text-foreground">In progress</span>
              <Badge variant="secondary">3</Badge>
            </div>
            <Button size="sm" variant="ghost" type="button">
              + Add
            </Button>
          </div>
          <div className="space-y-2">
            {['Wire blocks tab', 'Snapshot tokens', 'QA navigation'].map((t) => (
              <div
                key={t}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm"
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'block-extension-cards',
      title: 'Extension cards row',
      description: 'Three-up marketplace-style tiles with icon, title, and CTA.',
      children: (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { title: 'Slack notify', desc: 'Post thread updates to a channel.', icon: Sparkles },
            { title: 'Linear', desc: 'Sync issues bidirectionally.', icon: SquareKanban },
            { title: 'Custom MCP', desc: 'Bring your own tools via MCP.', icon: Github },
          ].map(({ title, desc, icon: Icon }) => (
            <div
              key={title}
              className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-foreground" aria-hidden />
              </div>
              <div className="text-sm font-semibold text-foreground">{title}</div>
              <p className="mt-1 flex-1 text-xs text-muted-foreground">{desc}</p>
              <Button className="mt-4 w-full" size="sm" variant="secondary" type="button">
                Configure
              </Button>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'block-settings-rows',
      title: 'Settings rows',
      description: 'Label + control + helper text — common settings density.',
      children: (
        <div className="max-w-xl space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Org plugins</div>
              <p className="text-xs text-muted-foreground">Visible to members in this workspace.</p>
            </div>
            <PluginToggle checked={pluginOn} onCheckedChange={setPluginOn} aria-label="Plugins visible" />
          </div>
          <div className="border-t border-border pt-6">
            <label className="text-sm font-medium text-foreground" htmlFor="block-api-base">
              API base URL
            </label>
            <Input
              id="block-api-base"
              className="mt-2"
              placeholder="https://api.example.com"
              defaultValue=""
            />
            <p className="mt-1 text-xs text-muted-foreground">Used for server-side tool calls only.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-on-hover">
        <div
          id="component-library-blocks-top"
          className="border-b border-border bg-card/95 px-8 py-6 backdrop-blur-sm supports-[backdrop-filter]:bg-card/90"
        >
          <h1 className="text-2xl font-semibold text-foreground">Blocks</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Composed layouts built from primitives — use these as references when assembling full pages.
          </p>
        </div>
        <div className="mx-auto max-w-5xl space-y-10 px-8 pb-16 pt-8">
          <nav className="flex flex-wrap gap-2" aria-label="Jump to block">
            {blocks.map((b) => (
              <a
                key={b.id}
                href={`#${b.id}`}
                className={cn(
                  'rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground'
                )}
              >
                {b.title}
              </a>
            ))}
          </nav>
          {blocks.map((b) => (
            <div key={b.id} id={b.id} className="scroll-mt-4">
              <BlockFrame title={b.title} description={b.description}>
                {b.children}
              </BlockFrame>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
