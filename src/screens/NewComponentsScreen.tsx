import { useMemo } from 'react';
import { PrLabel, type PrLabelStatus } from '../components/dashboard/PrLabel';

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
