import {
  AgentMessage,
  CodeBlock,
  DiffBlock,
  DiffSummary,
  FileTree,
  InlineCode,
  P,
  SkillReady,
  SKILL_READY_ITEMS,
  TaskTracker,
  TASKS_ALL_STATES,
  ToolDisclosure,
  UserMessage,
} from './chatWidgets';

/**
 * Generic conversation thread matching the “Conversation Sample” tab on `/chat-components`.
 * Used for read-only previews (e.g. org admin drawer) so UI stays aligned with the component gallery.
 */
export function SimulatedConversationSample({ className }: { className?: string }) {
  return (
    <div className={className ?? 'mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-6'}>
      <UserMessage>
        <p>Can you add dark mode support to our React app? We use Tailwind CSS.</p>
      </UserMessage>

      <AgentMessage>
        <SkillReady skills={SKILL_READY_ITEMS.slice(0, 2)} />
        <P>
          Sure! I&apos;ll add dark mode support using Tailwind&apos;s <InlineCode>class</InlineCode> strategy so it
          can be toggled programmatically. Here&apos;s my plan:
        </P>
        <div className="my-2 flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-muted/20">
          {[
            {
              n: 1,
              title: 'Audit existing color usage',
              detail: 'Find all hardcoded hex/rgb values across the codebase.',
            },
            {
              n: 2,
              title: 'Define CSS custom properties',
              detail: 'Create a :root { } block with semantic tokens for each color role.',
            },
            {
              n: 3,
              title: 'Add a [data-theme="dark"] selector',
              detail: 'Override the token values for the dark palette.',
            },
            {
              n: 4,
              title: 'Wire the toggle',
              detail: 'Persist preference to localStorage and apply the attribute on the <html> element.',
            },
            {
              n: 5,
              title: 'Update Tailwind config',
              detail: 'Point Tailwind darkMode to "class" and map utilities to the new tokens.',
            },
          ].map(({ n, title, detail }) => (
            <div key={n} className="flex items-start gap-4 border-b border-border px-4 py-3 last:border-0">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {n}
              </span>
              <div>
                <div className="text-sm font-medium text-foreground">{title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>
              </div>
            </div>
          ))}
        </div>
        <P>Let me start by reading the current Tailwind config:</P>
        <ToolDisclosure verb="Read" target="tailwind.config.ts" fullPath="/workspace/tailwind.config.ts" defaultOpen>
          <CodeBlock
            language="ts"
            filename="tailwind.config.ts"
            code={`import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;`}
          />
        </ToolDisclosure>
      </AgentMessage>

      <AgentMessage>
        <P>Now I&apos;ll update the config and add the CSS tokens:</P>
        <DiffBlock
          filename="tailwind.config.ts"
          lines={[
            { type: 'context', content: "import type { Config } from 'tailwindcss';" },
            { type: 'context', content: '' },
            { type: 'context', content: 'export default {' },
            { type: 'context', content: "  content: ['./src/**/*.{ts,tsx}']," },
            { type: 'remove', content: '  theme: { extend: {} },' },
            { type: 'add', content: "  darkMode: 'class'," },
            {
              type: 'add',
              content:
                '  theme: { extend: { colors: { background: "hsl(var(--background))", foreground: "hsl(var(--foreground))" } } },',
            },
            { type: 'context', content: '  plugins: [],' },
            { type: 'context', content: '} satisfies Config;' },
          ]}
        />
        <DiffSummary
          files={[
            { path: 'tailwind.config.ts', added: 2, removed: 1 },
            { path: 'src/index.css', added: 14, removed: 0 },
            { path: 'src/components/ThemeToggle.tsx', added: 28, removed: 0 },
          ]}
          onUndo={() => {}}
        />
      </AgentMessage>

      <AgentMessage>
        <P>Here&apos;s the toggle component I created:</P>
        <CodeBlock
          language="tsx"
          filename="ThemeToggle.tsx"
          code={`import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button onClick={() => setDark((d) => !d)}>
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}`}
        />
        <TaskTracker tasks={TASKS_ALL_STATES} />
      </AgentMessage>

      <UserMessage>
        <p>Looks good. Can you also update the file tree to show what changed?</p>
      </UserMessage>

      <AgentMessage>
        <FileTree
          lines={[
            'src/',
            '├── components/',
            '│   ├── ThemeToggle.tsx      ← new',
            '│   └── Counter.tsx',
            '├── index.css                ← updated',
            '├── App.tsx                  ← updated',
            'tailwind.config.ts           ← updated',
            'package.json',
          ]}
        />
        <P>
          All changes are ready. The toggle persists across page reloads via <InlineCode>localStorage</InlineCode>.
        </P>
      </AgentMessage>

      <div className="h-16" aria-hidden />
    </div>
  );
}
