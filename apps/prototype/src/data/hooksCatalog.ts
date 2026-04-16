/**
 * OpenHands lifecycle hooks — browseable patterns for Extensions (prototype).
 * Hooks run shell scripts at key moments; configure via `.openhands/hooks.json` in the repo.
 * @see https://docs.openhands.dev/openhands/usage/customization/hooks
 */

/** PascalCase event names match OpenHands / Claude Code hook compatibility. */
export type OpenHandsHookEvent =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'UserPromptSubmit'
  | 'Stop'
  | 'SessionStart'
  | 'SessionEnd';

/** `hooks.json` snake_case keys (also accepts PascalCase in config). */
export type HooksJsonConfigKey =
  | 'pre_tool_use'
  | 'post_tool_use'
  | 'user_prompt_submit'
  | 'stop'
  | 'session_start'
  | 'session_end';

export interface HooksCatalogEntry {
  id: string;
  /** Short recipe title */
  name: string;
  /** What the agent does when this hook runs */
  description: string;
  eventType: OpenHandsHookEvent;
  /** Key in `.openhands/hooks.json` */
  configKey: HooksJsonConfigKey;
  /**
   * Whether this event type can block the operation (exit 2 / JSON deny).
   * Async hooks never block regardless of event.
   */
  canBlock: boolean;
  /**
   * Matcher for tool hooks (`PreToolUse` / `PostToolUse`), or "*" / note for other events.
   */
  matcherHint: string;
  tags: string[];
  docsUrl?: string;
}

export const OPENHANDS_HOOKS_DOCS_URL =
  'https://docs.openhands.dev/openhands/usage/customization/hooks';

/** Local label + subtext overrides for hook recipe cards (Extensions prototype). */
export type HookRecipeOverride = {
  name: string;
  notes: string;
};

/** Subtext under the title: `configKey · matcher` or saved notes (mirrors MCP URL line). */
export function hooksCatalogDisplaySubtext(
  entry: HooksCatalogEntry,
  saved?: HookRecipeOverride | null
): string {
  if (saved?.notes?.trim()) return saved.notes.trim();
  return `${entry.configKey} · ${entry.matcherHint}`;
}

export const hooksCatalogCategories = [
  { slug: 'safety', name: 'Safety & tools' },
  { slug: 'quality', name: 'Quality gates' },
  { slug: 'context', name: 'Prompt & context' },
  { slug: 'observability', name: 'Logging & audit' },
  { slug: 'lifecycle', name: 'Session lifecycle' },
] as const;

export const hooksCatalogEntries: HooksCatalogEntry[] = [
  {
    id: 'oh-hook-block-dangerous',
    name: 'Block dangerous terminal commands',
    description:
      'Inspect JSON on stdin, parse the shell command, and deny before execution (e.g. `rm -rf /`). Use exit code 2 or stdout JSON with `decision: deny`.',
    eventType: 'PreToolUse',
    configKey: 'pre_tool_use',
    canBlock: true,
    matcherHint: 'Matcher: terminal',
    tags: ['safety'],
    docsUrl: OPENHANDS_HOOKS_DOCS_URL,
  },
  {
    id: 'oh-hook-stop-lint',
    name: 'Require lint before the agent stops',
    description:
      'Run `npm run lint` or pre-commit from `$OPENHANDS_PROJECT_DIR` when the agent tries to finish. Keeps unfinished work from landing when checks fail.',
    eventType: 'Stop',
    configKey: 'stop',
    canBlock: true,
    matcherHint: 'Matcher: *',
    tags: ['quality'],
    docsUrl: OPENHANDS_HOOKS_DOCS_URL,
  },
  {
    id: 'oh-hook-post-tool-log',
    name: 'Audit log every tool call',
    description:
      'Append tool name and time to a log file. Often combined with `"async": true` so auditing never adds latency; async hooks cannot block.',
    eventType: 'PostToolUse',
    configKey: 'post_tool_use',
    canBlock: false,
    matcherHint: 'Matcher: * (use async for fire-and-forget)',
    tags: ['observability'],
    docsUrl: OPENHANDS_HOOKS_DOCS_URL,
  },
  {
    id: 'oh-hook-user-prompt-git',
    name: 'Inject git status into the prompt',
    description:
      'On `UserPromptSubmit`, read stdin JSON and optionally echo `additionalContext` with `git status` so the model sees working-tree state.',
    eventType: 'UserPromptSubmit',
    configKey: 'user_prompt_submit',
    canBlock: true,
    matcherHint: 'Matcher: *',
    tags: ['context'],
    docsUrl: OPENHANDS_HOOKS_DOCS_URL,
  },
  {
    id: 'oh-hook-pre-browser',
    name: 'Gate browser automation',
    description:
      'Match the browser tool by name or regex in `pre_tool_use` to approve, log, or block automated browsing steps.',
    eventType: 'PreToolUse',
    configKey: 'pre_tool_use',
    canBlock: true,
    matcherHint: 'Matcher: browser (or regex)',
    tags: ['safety'],
    docsUrl: OPENHANDS_HOOKS_DOCS_URL,
  },
  {
    id: 'oh-hook-session-start',
    name: 'Workspace setup on session start',
    description:
      'Run once when a conversation begins — seed env vars, print repo hints, or warm caches. Cannot block agent startup.',
    eventType: 'SessionStart',
    configKey: 'session_start',
    canBlock: false,
    matcherHint: 'Non-tool hook (no matcher required)',
    tags: ['lifecycle'],
    docsUrl: OPENHANDS_HOOKS_DOCS_URL,
  },
  {
    id: 'oh-hook-session-end',
    name: 'Teardown or export on session end',
    description:
      'Run when the session ends — flush metrics, upload traces, or snapshot logs. Cannot block shutdown.',
    eventType: 'SessionEnd',
    configKey: 'session_end',
    canBlock: false,
    matcherHint: 'Non-tool hook (no matcher required)',
    tags: ['lifecycle'],
    docsUrl: OPENHANDS_HOOKS_DOCS_URL,
  },
];
