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

/** Main column: scrolls at the viewport right edge; content inside uses `extensionsPageContentClassName`. */
export const extensionsMainScrollClassName =
  'relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto pt-[var(--settings-main-padding-top)] pb-[var(--settings-main-padding-bottom)]';

/** Plugin detail split: main fills width but does not scroll (inner panes scroll). */
export const extensionsMainNoScrollClassName =
  'relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-[var(--settings-main-padding-top)] pb-[var(--settings-main-padding-bottom)]';

export type ExtensionsShellMode = 'all' | 'skills' | 'plugins';

/**
 * Which full-screen Extensions child to render from the current pathname.
 * Skill / plugin detail routes mount the legacy full panels.
 */
export function getExtensionsShellMode(pathname: string): ExtensionsShellMode {
  const pathPart = pathname.replace(/^\/+/, '').split('?')[0] ?? '';

  if (/^extensions\/skills\/skill\//.test(pathPart)) {
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

  if (raw === 'extensions/skills' || raw === 'extensions/mcp' || raw === 'extensions/hooks') {
    navigateAppRoute(`/${EXTENSIONS_ALL_BASE}`, { replace: true });
    return true;
  }
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
