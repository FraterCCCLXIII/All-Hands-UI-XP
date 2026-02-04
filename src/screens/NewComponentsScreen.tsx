import { useMemo } from 'react';
import { PrLabel, type PrLabelStatus } from '../components/dashboard/PrLabel';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  EllipsisVertical,
  FileCode,
  FolderOpen,
  Wrench,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { InfoCard } from '../components/common/InfoCard';
import { cn } from '../lib/utils';

type ComponentItem = {
  id: string;
  name: string;
  description?: string;
  usage?: string;
  preview?: React.ReactNode;
};

type ComponentSection = {
  id: string;
  title: string;
  items: ComponentItem[];
};

type ComponentCardProps = {
  title: string;
  description: string;
  usage?: string;
  preview?: React.ReactNode;
};

function ComponentCard({ title, description, usage, preview }: ComponentCardProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {preview && <div className="mt-4 flex flex-wrap items-center gap-2">{preview}</div>}
      {usage && (
        <div className="mt-4 rounded-lg bg-muted/40 px-3 py-2 text-xs font-mono text-muted-foreground">
          {usage}
        </div>
      )}
    </section>
  );
}

export function NewComponentsScreen() {
  const componentSections = useMemo<ComponentSection[]>(
    () => [
      {
        id: 'overview',
        title: 'Overview',
        items: [
          {
            id: 'overview-guidelines',
            name: 'Documentation Guidelines',
            description:
              'Add new components here with a short summary, usage snippet, and any relevant states.',
            usage:
              '<ComponentCard title="Component Name" description="..." usage="<Component />" />',
          },
        ],
      },
      {
        id: 'new-components',
        title: 'New Components',
        items: [
              {
                id: 'copyable-code-panel',
                name: 'Copyable Code Panel',
                description:
                  'Scrollable code panel with header actions and a custom scrollbar.',
                usage: `<div className="overflow-hidden rounded-xl border border-border bg-card [&_textarea]:min-h-[100px]">
  <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
    <span className="text-sm font-medium text-foreground">Curl Command</span>
    <button
      type="button"
      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      aria-label="Copy"
    >
      <Copy className="h-4 w-4" />
    </button>
  </div>
  <textarea
    readOnly
    rows={4}
    className="repo-dropdown-scroll max-h-[180px] w-full resize-none overflow-y-auto border-0 bg-transparent p-4 font-mono text-sm text-foreground focus:ring-0 focus-visible:outline-none"
    value="curl -X POST https://api.example.com/skills/run \\\n  -H &quot;Content-Type: application/json&quot; \\\n  -H &quot;Authorization: Bearer &lt;token&gt;&quot; \\\n  -d '{&quot;skillId&quot;: &quot;update-readme&quot;, &quot;repo&quot;: &quot;orbit234/sudoku&quot;}'"
  />
</div>`,
                preview: (
                  <div className="overflow-hidden rounded-xl border border-border bg-card [&_textarea]:min-h-[100px]">
                    <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
                      <span className="text-sm font-medium text-foreground">Curl Command</span>
                      <button
                        type="button"
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={4}
                      className="repo-dropdown-scroll max-h-[180px] w-full resize-none overflow-y-auto border-0 bg-transparent p-4 font-mono text-sm text-foreground focus:ring-0 focus-visible:outline-none"
                      value={`curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "update-readme", "repo": "orbit234/sudoku"}'`}
                    />
                  </div>
                ),
              },
              {
                id: 'info-card',
                name: 'Info Card',
                description:
                  'Generic card for summarizing a single item with an optional icon and body text.',
                usage: `<InfoCard
  title="Component Name"
  description="Short supporting description goes here."
  icon={<Wrench className="h-4 w-4" />}
/>`,
                preview: (
                  <InfoCard
                    title="Foundations Audit"
                    description="Document baseline UI patterns and highlight reusable foundations."
                    icon={<Wrench className="h-4 w-4" />}
                    className="max-w-md"
                  />
                ),
              },
              {
                id: 'info-card-left-icon',
                name: 'Info Card (Left Icon)',
                description: 'Variant with icon aligned to the left of the text.',
                usage: `<InfoCard
  title="Foundations Audit"
  description="Document baseline UI patterns and highlight reusable foundations."
  icon={<Wrench className="h-4 w-4" />}
  iconPosition="left"
  interactive
/>`,
                preview: (
                  <InfoCard
                    title="Foundations Audit"
                    description="Document baseline UI patterns and highlight reusable foundations."
                    icon={<Wrench className="h-4 w-4" />}
                    iconPosition="left"
                    className="max-w-md"
                  />
                ),
              },
          {
            id: 'skill-detail-panel',
            name: 'Skill Detail Panel',
            description:
              'A detailed repository view with a folder tree, file list, and action menu.',
            usage: `<section className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card w-full" aria-label="Skill detail">
  <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span className="truncate text-sm font-medium text-foreground">orbit234/sudoku</span>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <EllipsisVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Copy link</DropdownMenuItem>
        <DropdownMenuItem>Open in new tab</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  <div className="flex-1 overflow-y-auto p-4 repo-dropdown-scroll">
    <ul className="list-none">
      <li className="py-0.5">
        <button type="button" className="flex w-full items-center gap-1.5 text-left text-sm text-muted-foreground hover:text-foreground">
          <span className="flex h-4 w-4 items-center justify-center flex-shrink-0">
            <ChevronDown className="h-4 w-4" />
          </span>
          <FolderOpen className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">examples</span>
        </button>
        <ul className="list-none pl-4 border-l border-border ml-1">
          <li className="py-0.5">
            <button type="button" className="flex w-full items-center gap-1.5 text-left text-sm text-muted-foreground hover:text-foreground">
              <span className="flex h-4 w-4 items-center justify-center flex-shrink-0">
                <ChevronDown className="h-4 w-4" />
              </span>
              <FolderOpen className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">tutorials</span>
            </button>
            <ul className="list-none pl-4 border-l border-border ml-1">
              {['01_hello.py', '02_navigation.py', '03_forms.py', 'README.md'].map((file) => (
                <li key={file} className="py-0.5">
                  <button type="button" className="flex w-full items-center gap-1.5 text-left text-sm text-foreground hover:text-primary hover:underline">
                    <FileCode className="h-4 w-4 flex-shrink-0" />
                    <span>{file}</span>
                  </button>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </li>
      <li className="py-0.5">
        <button type="button" className="flex w-full items-center gap-1.5 text-left text-sm text-foreground hover:text-primary hover:underline">
          <FileCode className="h-4 w-4 flex-shrink-0" />
          <span>Plugin.json</span>
        </button>
      </li>
      <li className="py-0.5">
        <button type="button" className="flex w-full items-center gap-1.5 text-left text-sm text-foreground hover:text-primary hover:underline">
          <FileCode className="h-4 w-4 flex-shrink-0" />
          <span>README.md</span>
        </button>
      </li>
    </ul>
  </div>
</section>`,
            preview: (
              <section
                className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card w-full max-w-md"
                aria-label="Skill detail"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      orbit234/sudoku
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <EllipsisVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Copy link</DropdownMenuItem>
                      <DropdownMenuItem>Open in new tab</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex-1 overflow-y-auto p-4 repo-dropdown-scroll max-h-[300px]">
                  <ul className="list-none">
                    <li className="py-0.5">
                      <button
                        type="button"
                        className="flex w-full items-center gap-1.5 text-left text-sm text-muted-foreground hover:text-foreground"
                      >
                        <span className="flex h-4 w-4 items-center justify-center flex-shrink-0">
                          <ChevronDown className="h-4 w-4" />
                        </span>
                        <FolderOpen className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">examples</span>
                      </button>
                      <ul className="list-none pl-4 border-l border-border ml-1">
                        <li className="py-0.5">
                          <button
                            type="button"
                            className="flex w-full items-center gap-1.5 text-left text-sm text-muted-foreground hover:text-foreground"
                          >
                            <span className="flex h-4 w-4 items-center justify-center flex-shrink-0">
                              <ChevronDown className="h-4 w-4" />
                            </span>
                            <FolderOpen className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium">tutorials</span>
                          </button>
                          <ul className="list-none pl-4 border-l border-border ml-1">
                            {['01_hello.py', '02_navigation.py', '03_forms.py', 'README.md'].map(
                              (file) => (
                                <li key={file} className="py-0.5">
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-1.5 text-left text-sm text-foreground hover:text-primary hover:underline"
                                  >
                                    <FileCode className="h-4 w-4 flex-shrink-0" />
                                    <span>{file}</span>
                                  </button>
                                </li>
                              )
                            )}
                          </ul>
                        </li>
                      </ul>
                    </li>
                    <li className="py-0.5">
                      <button
                        type="button"
                        className="flex w-full items-center gap-1.5 text-left text-sm text-foreground hover:text-primary hover:underline"
                      >
                        <FileCode className="h-4 w-4 flex-shrink-0" />
                        <span>Plugin.json</span>
                      </button>
                    </li>
                    <li className="py-0.5">
                      <button
                        type="button"
                        className="flex w-full items-center gap-1.5 text-left text-sm text-foreground hover:text-primary hover:underline"
                      >
                        <FileCode className="h-4 w-4 flex-shrink-0" />
                        <span>README.md</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </section>
            ),
          },
          {
            id: 'new-pr-labels',
            name: 'PR Labels',
            description:
              'Status label used in PR cards. Only one label should be displayed at a time.',
            usage: `<PrLabel status="open" />`,
            preview: (
              <>
                {(
                  [
                    'draft',
                    'open',
                    'ready_for_review',
                    'changes_requested',
                    'approved',
                    'merged',
                    'closed',
                  ] as PrLabelStatus[]
                ).map((status) => (
                  <PrLabel key={status} status={status} />
                ))}
              </>
            ),
          },
          {
            id: 'new-component-placeholder',
            name: 'Start a new entry',
            description:
              'Document new components requested for the roadmap in this section.',
            usage: 'Add preview and usage once the component is ready.',
          },
        ],
      },
    ],
    []
  );

  const handleScrollTo = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex h-full w-full min-w-0 bg-background">
      <aside className="hidden w-72 flex-shrink-0 min-h-0 border-r border-border bg-card/50 px-6 py-6 lg:flex lg:flex-col">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          New Components
        </div>
        <button
          type="button"
          onClick={() => handleScrollTo('new-components-top')}
          className="mt-3 w-full text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          Overview
        </button>
        <nav
          className="mt-6 flex-1 space-y-5 overflow-y-auto pr-2 scrollbar-on-hover"
          aria-label="New components navigation"
        >
          {componentSections.map((section) => (
            <div key={section.id}>
              <button
                type="button"
                onClick={() => handleScrollTo(`section-${section.id}`)}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                {section.title}
              </button>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleScrollTo(item.id)}
                    className="block w-full truncate text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        <header id="new-components-top" className="border-b border-border bg-card px-8 py-6">
          <h1 className="text-2xl font-semibold text-foreground">New Components</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use this space to capture upcoming components and document their usage.
          </p>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth p-8 scrollbar-on-hover">
          <div className="min-h-full pb-12">
            {componentSections.map((section) => (
              <div key={section.id} id={`section-${section.id}`} className="mb-10 scroll-mt-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {section.items.length} entries in this section.
                  </p>
                </div>
                <div className="grid gap-5">
                  {section.items.map((item) => (
                    <div key={item.id} id={item.id} className="scroll-mt-6">
                      <ComponentCard
                        title={item.name}
                        description={item.description ?? 'Component reference entry.'}
                        usage={item.usage}
                        preview={item.preview}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
