import { navigateAppRoute } from './captureNavigation';

/** Default browse: skills, plugins, MCP, and hooks in one scroll. */
export const EXTENSIONS_ALL_BASE = 'extensions/all';

export const EXTENSIONS_SKILLS_BASE = 'extensions/skills';
export const EXTENSIONS_PLUGINS_BASE = 'extensions/plugins';
export const EXTENSIONS_MCP_BASE = 'extensions/mcp';
export const EXTENSIONS_HOOKS_BASE = 'extensions/hooks';

/** Same vertical rhythm as Settings `settingsSectionStackGap`. */
export const extensionsSectionStackGap = 'gap-6';

/** Centered main column (matches Settings inner: `max-w-4xl`, `pr-8`, section stack gap). */
export const extensionsPageContentClassName = `mx-auto flex w-full max-w-4xl flex-col pr-8 ${extensionsSectionStackGap}`;

/** Outer row: matches Settings (left inset, gap before main, shell does not scroll). */
export const extensionsShellRowClassName =
  'flex h-full min-h-0 min-w-0 w-full flex-1 gap-6 overflow-hidden bg-background pl-8 pr-0';

/**
 * Skills / plugins / MCP marketplace cards use `p-5`; place toggles and menus at the same
 * inset so spacing matches the card padding on the top and right.
 */
/** Slightly above `p-5` text block so the switch lines up with the title row. */
export const extensionsCatalogCardControlsClassName = 'absolute right-5 top-3 z-10';

/**
 * Toggle is rightmost; optional ⋯ sits to its left. Skills/plugins use an empty slot so the
 * switch lines up with MCP cards (same geometry as toggle + menu).
 */
export const extensionsCatalogCardControlClusterClassName =
  'flex flex-row-reverse items-center gap-0.5';

/**
 * Reserved footprint for the ⋯ control (matches `extensionsCatalogCardOverflowMenuTriggerClassName`).
 * Empty on skills/plugins so toggles align with MCP.
 */
export const extensionsCatalogCardMenuSlotClassName =
  'flex h-6 w-7 shrink-0 items-center justify-center';

/** Compact ⋯ trigger — matches toolbar icon buttons (e.g. pl-1.5 py-1 pr-1.5, muted hover). */
export const extensionsCatalogCardOverflowMenuTriggerClassName =
  'flex h-6 w-7 items-center justify-center rounded-md cursor-pointer pl-1.5 py-1 pr-1.5 gap-0 text-sm font-medium text-muted-foreground transition-[color,background-color] duration-200 hover:text-foreground hover:bg-muted/60 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0';

/** Main column: clears toggle + menu column + gap (shared by skills, plugins, MCP). */
export const extensionsCatalogCardBodyPrWithControlCluster = 'pr-24';

/** Main column: scrolls at the viewport right edge; content inside uses `extensionsPageContentClassName`. */
export const extensionsMainScrollClassName =
  'relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto pt-[var(--settings-main-padding-top)] pb-[var(--settings-main-padding-bottom)]';

/** Plugin detail split: main fills width but does not scroll (inner panes scroll). */
export const extensionsMainNoScrollClassName =
  'relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-[var(--settings-main-padding-top)] pb-[var(--settings-main-padding-bottom)]';

export type ExtensionsShellMode = 'all' | 'skills' | 'plugins';

/**
 * Which full-screen Extensions child to render from the current pathname.
 * Skills browse + skill detail use `ExtensionsSkillsPanel`; plugins use `ExtensionsPluginsPanel`.
 */
export function getExtensionsShellMode(pathname: string): ExtensionsShellMode {
  const pathPart = pathname.replace(/^\/+/, '').split('?')[0] ?? '';

  if (pathPart === EXTENSIONS_SKILLS_BASE || pathPart.startsWith(`${EXTENSIONS_SKILLS_BASE}/`)) {
    return 'skills';
  }
  if (
    pathPart === EXTENSIONS_PLUGINS_BASE ||
    pathPart.startsWith(`${EXTENSIONS_PLUGINS_BASE}/`)
  ) {
    return 'plugins';
  }
  return 'all';
}

/**
 * Normalize Extensions entry paths and map legacy `/skills` / `/plugin-marketplace` routes.
 * Returns true when the URL was rewritten (caller should skip the rest of location sync for this tick).
 */
export function tryNormalizeExtensionsPath(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = window.location.pathname.replace(/^\/+/, '').split('?')[0] ?? '';

  if (raw === 'extensions') {
    navigateAppRoute(`/${EXTENSIONS_ALL_BASE}`, { replace: true });
    return true;
  }
  if (raw === 'skills') {
    navigateAppRoute(`/${EXTENSIONS_ALL_BASE}`, { replace: true });
    return true;
  }
  if (raw.startsWith('skills/')) {
    const next = `${EXTENSIONS_SKILLS_BASE}${raw.slice('skills'.length)}`;
    navigateAppRoute(`/${next}`, { replace: true });
    return true;
  }
  if (raw === 'plugin-marketplace') {
    navigateAppRoute(`/${EXTENSIONS_ALL_BASE}`, { replace: true });
    return true;
  }
  if (raw.startsWith('plugin-marketplace/')) {
    const next = `${EXTENSIONS_PLUGINS_BASE}${raw.slice('plugin-marketplace'.length)}`;
    navigateAppRoute(`/${next}`, { replace: true });
    return true;
  }
  return false;
}
