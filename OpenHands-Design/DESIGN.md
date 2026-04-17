# OpenHands UI Design System

## Scope & canonical locations (OpenHands)

This document describes the design system implemented by the **prototype app** in this monorepo (`apps/prototype`). Portable copies live under **`OpenHands-Design/`** (synced to `packages/openhands-design/template/` via `npm run sync:openhands-design-template`). In a project that only copied `OpenHands-Design/`, use **`src/`** paths instead of **`apps/prototype/src/`** below.

| Concern | Path (monorepo) |
|--------|------------------|
| Design tokens (`:root`, `.dark`, scrollbars, utilities) | `apps/prototype/src/index.css` |
| Tailwind theme (`hsl(var(--token))`, container, radii) | `apps/prototype/tailwind.config.js` |
| Legacy theme class map (`stone-*` / rgb for chat & canvas) | `apps/prototype/src/theme/themeAppClassMap.ts` |
| UI primitives (Button, Input, Dialog, …) | `apps/prototype/src/components/ui/` |

**Theme mode:** `App` keeps **`theme` fixed to `'dark'`** (`useState<Theme>('dark')`). Tokens are declared on **`:root` and repeated under `.dark`**, so the UI matches the dark palette without requiring `class="dark"` on `<html>`. The `Theme` type and `themeAppClassMap` still define **`light` and `sepia`** for a few branching styles — **light mode is not product-ready**; do not implement or ship a full light theme until that work is explicitly scheduled.

**Major prototype surfaces (pathname / nav):** chat home (`/`, `/chat-start`, `/new-chat-start`), active chat (`/chat`), dashboard, automations, extensions (nested under `/extensions/…`), settings (`/settings`, `/settings/…`), workflows, claim states, LLM switcher demos, chat-components and modal demos, conversations drawer (`/conversations?from=…`), standalone flows (e.g. new-user experience, SaaS billing, enterprise, sign-in-with-ad), public share (`#/share`), and Figma export of the component library (`#figma/…` / `captureRoute`).

---

## 1. Visual Theme & Atmosphere

OpenHands is a dark-first AI agent platform built on a near-black monochrome canvas. The entire experience lives on a `0 0% 5%` HSL background — effectively `#0d0d0d` — with `0 0% 98%` foreground text that reads as warm off-white. Every surface is a shade of neutral grey scaled in 2–5% lightness increments, creating depth through tonal variation rather than color. The only chromatic moments are semantic: green for success, red-orange for danger, amber for warnings, and blue for informational states.

Typography is carried by **Inter** (sans-serif) for all UI text and **JetBrains Mono** for code, terminals, and technical labels. The type system is weight-restrained — `font-medium` (500) is the workhorse, `font-semibold` (600) for headings and emphasis, and `font-normal` (400) for body. Bold (700) is rare and reserved for maximum emphasis.

The UI framework is **React + Tailwind CSS + Radix primitives** (shadcn/ui pattern). All colors flow through CSS custom properties declared in `:root` and consumed via `hsl(var(--token))` in the Tailwind config. This means every color in the system is overridable by changing a single HSL triplet.

**Key characteristics:**
- Near-black monochrome canvas (`#0d0d0d` background, `#fafafa` foreground)
- Neutral grey surface scale in 2–5% lightness increments (5% → 7% → 8% → 12% → 14% → 18%)
- Inter + JetBrains Mono dual-font system
- HSL-based CSS custom property architecture for full theme overridability
- Tailwind utility-first styling with Radix UI headless primitives
- `transition-colors` as the dominant transition — UI feels responsive but not over-animated
- **Dark mode only** for the product shell; `light` / `sepia` in `themeAppClassMap` are legacy / partial — not a shipped light theme (see Scope)

---

## 2. Color Palette & Roles

All colors are declared as HSL triplets (without the `hsl()` wrapper) in CSS custom properties. Tailwind maps them as `hsl(var(--token))`.

### Core Surfaces

| Token | HSL | Hex | Role |
|-------|-----|-----|------|
| `--background` | `0 0% 5%` | `#0d0d0d` | Page background, app shell |
| `--card` | `0 0% 7%` | `#121212` | Card surfaces, elevated containers |
| `--secondary` | `0 0% 8%` | `#141414` | Secondary surfaces, sidebar accent |
| `--popover` | `0 0% 7%` | `#121212` | Dropdown menus, popovers |
| `--muted` | `0 0% 12%` | `#1f1f1f` | Muted backgrounds, hover fills, badges, **tooltip surfaces** |
| `--border` / `--input` | `0 0% 14%` | `#242424` | Borders, input borders, dividers |
| `--muted-hover` | `0 0% 18%` | `#2e2e2e` | Hover state for muted surfaces |
| `--modal-background` | Inherits `--background` | `#0d0d0d` | Dialogs, sheets, modals; Tailwind: `bg-modal` (`modal` in config) |

### Core Text

| Token | HSL | Hex | Role |
|-------|-----|-----|------|
| `--foreground` | `0 0% 98%` | `#fafafa` | Primary text, headings |
| `--muted-foreground` | `0 0% 55%` | `#8c8c8c` | Secondary text, labels, placeholders, icons |
| `--primary` | `0 0% 100%` | `#ffffff` | Maximum emphasis text, primary buttons |
| `--primary-foreground` | `0 0% 0%` | `#000000` | Text on primary (white) surfaces |
| `--accent` | `0 0% 100%` | `#ffffff` | Accent elements (matches primary in dark) |

### Sidebar (inherits core but isolated for overridability)

| Token | HSL | Role |
|-------|-----|------|
| `--sidebar-background` | `0 0% 5%` | Sidebar background |
| `--sidebar-foreground` | `0 0% 98%` | Sidebar text |
| `--sidebar-accent` | `0 0% 8%` | Sidebar hover/active background |
| `--sidebar-border` | `0 0% 14%` | Sidebar dividers |
| `--sidebar-ring` | `0 0% 50%` | Sidebar focus ring |

### Semantic / Status

| Token | HSL | Hex | Role |
|-------|-----|-----|------|
| `--success` | `142 71% 45%` | `#22c55e` | Success states, running indicators |
| `--success-foreground` | `142 71% 76%` | `#86efac` | Success text on dark surfaces |
| `--warning` | `38 92% 50%` | `#f59e0b` | Warning states, caution badges |
| `--info` | `217 91% 60%` | `#3b82f6` | Informational states, links |
| `--destructive` | `0 72% 51%` | `#dc2626` | Error states, danger actions, delete |
| `--destructive-foreground` | `0 0% 98%` | `#fafafa` | Text on destructive surfaces |
| `--ring` | `0 0% 80%` | `#cccccc` | Focus rings (1px, keyboard-only via `focus-visible:`) |

### Agent & product accent (prototype)

| Token | HSL / value | Role |
|-------|-------------|------|
| `--agent-active` / `--agent-glow` | `271 91% 65%` | Agent highlights; Tailwind: `text-agent`, `bg-agent`, `shadow-agent` |
| `--gradient-agent` | `linear-gradient(135deg, hsl(271 91% 65%) 0%, hsl(0 0% 100%) 100%)` | Agent emphasis, hero treatments |
| `--shadow-agent` | `0 0 20px hsl(271 91% 65% / 0.3)` | Agent glow |

### Gradients & Decorative

| Token | Value | Role |
|-------|-------|------|
| `--gradient-card-hover` | `linear-gradient(180deg, hsl(0 0% 9%) 0%, hsl(0 0% 7%) 100%)` | Subtle card hover gradient |
| `--shadow-card` | `0 1px 2px 0 hsl(0 0% 0% / 0.3)` | Default card shadow |

### Hover Backgrounds

| Surface | Hover Token | Use |
|---------|-------------|-----|
| Dark surfaces (cards, nav items, menus, rows) | `hover:bg-muted/60` | **Standard hover** — the single canonical dark-surface hover |
| White/primary buttons | `hover:bg-primary/85` | Light grey hover on white buttons (85% opacity white) |

**Canonical dark-surface hover: `hover:bg-muted/60`** — used consistently across the codebase. Do **not** mix `/40`, `/50`, `/70` variants.
**Canonical primary-button hover: `hover:bg-primary/85`** — never use `hover:bg-muted/60` on a `bg-primary`/`bg-white` button (causes dark flash).

---

## 3. Typography Rules

### Font Families

| Role | Family | CSS Variable | Tailwind Class | Fallbacks |
|------|--------|-------------|----------------|-----------|
| UI / Body | Inter | `--font-sans` | `font-sans` | `system-ui, sans-serif` |
| Code / Technical | JetBrains Mono | `--font-mono` | `font-mono` | `monospace` |

Fonts are loaded via Google Fonts `@import` in `index.css`.

### Type Scale

The app uses Tailwind's default type scale. These are the **canonical sizes** (by role, not a strict frequency count):

| Tailwind Class | Size | Role |
|----------------|------|------|
| `text-sm` | 14px / 0.875rem | **Primary body text**, labels, button text, descriptions |
| `text-xs` | 12px / 0.75rem | **Secondary text**, metadata, badges, menu items, captions |
| `text-base` | 16px / 1rem | Larger body text, input text, chat messages |
| `text-lg` | 18px / 1.125rem | Section sub-headings, dialog titles |
| `text-xl` | 20px / 1.25rem | Page sub-headings |
| `text-2xl` | 24px / 1.5rem | Page headings, modal titles |
| `text-3xl` | 30px / 1.875rem | Hero headings, landing sections |

### Arbitrary Font Sizes (to normalize)

Prefer the standard scale or formalize as tokens:

| Arbitrary | Recommended replacement |
|-----------|-------------------------|
| `text-[11px]` | `text-xs` — or formalize as `--text-2xs` if 11px is intentional |
| `text-[10px]` | `text-xs` — or `--text-2xs` |
| `text-[12px]` | `text-xs` |
| `text-[40px]` | `text-4xl` (36px) or a formal hero token |
| `text-[28px]` / `text-[32px]` | `text-3xl` / `text-4xl` or formalize |
| `text-[8px]` | Micro label only if truly needed |

### Font Weight Scale

| Tailwind Class | Weight | Role |
|----------------|--------|------|
| `font-medium` | 500 | Labels, nav items, badges (buttons use `font-normal`) |
| `font-semibold` | 600 | **Headings**, section titles, strong emphasis |
| `font-normal` | 400 | **Body text**, descriptions, long-form content |
| `font-bold` | 700 | Maximum emphasis (use sparingly) |
| `font-light` | 300 | De-emphasized text (use sparingly) |

### Line Height

| Tailwind Class | Role |
|----------------|------|
| `leading-4` | Tight — compact UI, badges |
| `leading-6` | Standard — body text |
| `leading-relaxed` | Comfortable — long-form, descriptions |
| `leading-5` | Medium — labels, short text |
| `leading-tight` | Condensed — headings |
| `leading-snug` | Slightly condensed |
| `leading-none` | Single-line elements |

### Letter Spacing

| Tailwind Class | Role |
|----------------|------|
| `tracking-wide` | Uppercase labels, section headers |
| `tracking-wider` | Small-caps metadata |
| `tracking-tight` | Display headings |

### Canonical Patterns

**Body text:** `text-sm font-normal text-foreground`
**Label:** `text-sm font-medium text-foreground`
**Secondary text:** `text-sm text-muted-foreground`
**Metadata/caption:** `text-xs text-muted-foreground`
**Uppercase category:** `text-[11px] font-medium uppercase tracking-wide text-muted-foreground`
**Heading (page):** `text-2xl font-semibold text-foreground`
**Heading (section):** `text-lg font-semibold text-foreground`
**Code/mono:** `text-sm font-mono`

---

## 4. Component Stylings

### Buttons (`Button` — `apps/prototype/src/components/ui/button.tsx`)

**Base classes (all variants):**
`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`

| Variant | Background | Text | Border | Hover | Use |
|---------|-----------|------|--------|-------|-----|
| `default` | `bg-primary` | `text-primary-foreground` | — | `hover:bg-primary/85` | Primary CTA (white button, black text) |
| `destructive` | `bg-destructive` | `text-destructive-foreground` | — | `hover:bg-destructive/85` | Delete, danger actions |
| `outline` | `bg-background` | — | `border border-input` | `hover:bg-muted hover:text-foreground` | Secondary actions (default for many toolbars and forms) |
| `light` | `bg-primary` | `text-primary-foreground` | `border border-input` | `hover:bg-primary/85` | High-contrast primary on dark bg (token-based, no raw `bg-white`) |
| `secondary` | `bg-secondary` | `text-secondary-foreground` | — | `hover:bg-muted-hover` | Tertiary actions |
| `muted` | `bg-muted` | `text-muted-foreground` | — | `hover:bg-muted-hover hover:text-foreground` | Subdued actions |
| `ghost` | transparent | — | — | `hover:bg-muted hover:text-foreground` | Minimal chrome actions |
| `link` | transparent | `text-primary underline-offset-4` | — | `hover:underline` | Inline links |

**Primary button convention:** All white/primary buttons use `bg-primary text-primary-foreground hover:bg-primary/85`. Never use `bg-white text-black hover:bg-muted/60` inline — the dark hover on a white button is incorrect. Use the `Button` component or match its tokens.

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `default` | `h-10` | `px-4 py-2` | `text-sm` |
| `sm` | `h-10` | `px-3` | `text-sm` |
| `xs` | `h-10` | `px-3` | `text-xs` |
| `lg` | `h-11` | `px-8` | `text-sm` |
| `icon` | `h-10 w-10` | — | — |

### Cards & Containers

There is no dedicated `Card` primitive — cards are composed with utilities.

**Standard card recipe:**
```
bg-card border border-border rounded-lg p-4
```

**Elevated card:**
```
bg-card border border-border rounded-xl p-6 shadow-lg
```

**Interactive card:**
```
bg-card border border-border rounded-lg p-4 transition-colors hover:border-white/30
```

**Glass / backdrop card:**
```
bg-card/70 border border-border/60 rounded-lg p-6 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-card/50
```

### Inputs (`Input` — `apps/prototype/src/components/ui/input.tsx`)

**Standard input:**
```
h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-base md:text-sm
ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
focus-visible:ring-offset-2 focus-visible:bg-muted/60 hover:bg-muted/60
placeholder:text-muted-foreground
disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30
```

**Canonical focus style (all inputs, textareas, selects must match):**
```
ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60
```

Key rules:
- Always use `focus-visible:` (keyboard-only), never `focus:` (fires on click too)
- Always include `ring-offset-background` and `focus-visible:ring-offset-2`
- Always include `focus-visible:bg-muted/60` for the subtle fill on focus
- Search inputs (`type="search"`) have `appearance: none` in global CSS to strip browser default focus chrome

**Size variants (via SearchInput wrapper):**
- `sm`: `h-9` + `pl-9 pr-9`
- `default`: `h-10` + `pl-10 pr-10`
- `lg`: `h-11` + `pl-11 pr-11 text-base`

### Dropdown Menus (`DropdownMenu` — Radix-based)

**Menu content:**
```
z-[100] min-w-[8rem] overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md
```

**Menu item:**
```
group relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm
transition-colors focus:bg-muted/60 data-[highlighted]:bg-muted/60
```

**Icon treatment in menu items:**
- Default: `[&_svg]:text-muted-foreground` (grey)
- Hover/highlight: `group-hover:[&_svg]:!text-foreground` (white)

### Popover

**Content:**
```
z-50 max-h-[min(24rem,calc(100dvh-2rem))] shadow-md rounded-[12px] border border-border
bg-sidebar p-6 text-sidebar-foreground overflow-y-auto
```

### Navigation shell & logo

Implementation: **`LeftNav`** — `apps/prototype/src/components/navigation/LeftNav.tsx`; **`TopBar`** — `apps/prototype/src/components/navigation/TopBar.tsx`.

#### Left navigation (icon rail)

- **Layout:** `fixed left-0 top-0 z-50 flex h-screen w-16` (**64px**), `bg-sidebar`, inner column `px-2 py-4 text-sidebar-foreground`. Main shell content uses **`ml-16`** beside the rail when the nav is shown.
- **Structure (top → bottom):** (1) logo + popover trigger, (2) primary nav icons in a centered stack (`flex-1 flex-col items-center gap-1`), (3) footer utilities (`mt-auto`) — UX-flow menu, account popover.
- **Nav item buttons:** `inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors`; icons **`w-5 h-5`**.
- **Active state:** `bg-sidebar-accent text-sidebar-foreground` (conversation drawer open counts as active for the list icon; “new conversation” plus can be active on home routes — see component).
- **Inactive state:** `text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground`.
- **Tooltips:** Custom `LeftNavTooltip` to the **right** of each control — `bg-muted px-2 py-1 text-xs text-foreground shadow-md rounded-md`, show on hover/focus, dismiss on click until pointer re-enters.

#### Top bar (chat chrome)

- **No logo.** Brand mark lives only in the **left nav** (and full-screen marketing/auth flows). The top bar shows **workspace context**: editable **project title** (`text-lg font-light`) and **server status** (2×2 dot with semantic colors), plus **Share**, **Run**, **canvas toggle**, and **chat window tabs** (`ChatWindowTabs`, hidden below `md`).
- **Container:** `<nav className="flex items-center justify-between px-4 py-3 … flex-shrink-0">` with background from the theme class map (`getThemeClasses('bg')`), not `bg-sidebar` by default.
- **Actions:** Primary-styled buttons use `getThemeClasses('button-bg')` / `('button-text')`; run/stop uses status-specific classes — see `TopBar`.

#### Logo mark (required usage)

**Hard rules (reviews / agents should fail diffs that violate these):**

- **Always import `Logo`** — `apps/prototype/src/components/common/Logo.tsx` (in a template-only tree: `src/components/common/Logo.tsx`). **Never** replace the mark with a different SVG, a generic “hands” icon, text-only wordmark, or **raster-only** (PNG/JPG/WebP) in the **app shell** (left nav, auth gates, loading screens, marketing surfaces that represent the product). Raster may appear in **external** assets (social, print) only when provided by brand; in-product = this SVG.
- **Do not edit path data** — the geometry below is canonical. No simplifying paths, merging strokes, or “optimized” replacements that change the silhouette.
- **Theme via `fill-current`** — every `<path>` stays `className="fill-current"`; the parent sets color with **`text-*`** utilities. **Never** set `fill="#…"` or `stroke` on logo paths.

**Geometry:** one `<svg>` with **`viewBox="0 0 133.88 91.13"`** — preserve **aspect ratio** (equal `w-*` and `h-*`, or one dimension + `h-auto` / `w-auto`); do not change `viewBox` or stretch non-uniformly.

**Canonical SVG (must match `Logo.tsx` byte-for-byte on paths and viewBox):**

```tsx
<svg
  viewBox="0 0 133.88 91.13"
  xmlns="http://www.w3.org/2000/svg"
  className={className}
>
  <path className="fill-current" d="M64.97,14.8V1.93c0-1.07.86-1.93,1.93-1.93s1.93.86,1.93,1.93v12.87c0,1.07-.86,1.93-1.93,1.93s-1.93-.86-1.93-1.93Z"/>
  <path className="fill-current" d="M74.95,16.72l6.43-11.15c.53-.92,1.71-1.24,2.64-.71.92.53,1.24,1.71.71,2.64l-6.43,11.15c-.53.92-1.71,1.24-2.64.71-.92-.53-1.24-1.71-.71-2.64Z"/>
  <path className="fill-current" d="M58.85,16.72l-6.43-11.15c-.53-.92-1.71-1.24-2.64-.71-.92.53-1.24,1.71-.71,2.64l6.43,11.15c.53.92,1.71,1.24,2.64.71.92-.53,1.24-1.71.71-2.64Z"/>
  <path className="fill-current" d="M128.77,56.65c0-3.35.9-13.3,1.19-16.58.19-2.22-.07-3.44-.43-4.06-.26-.46-.67-.78-1.66-.84-.71-.05-1.49.16-2.07.68-.54.49-1.15,1.48-1.15,3.47v.11s-.89,15.12-.89,15.12c-.03.54-.29,1.05-.72,1.39-.42.34-.97.49-1.51.4l-9.29-1.47-10.02-1.33c-.93-.12-1.63-.89-1.67-1.82l-.55-11.95v-.1c-.25-4.76-.49-9.1-.49-10.44,0-3.75-.63-5.33-1.19-5.99-.44-.53-1.08-.76-2.44-.76-.49,0-.83.1-1.09.25-.25.15-.54.41-.82.94-.59,1.12-1.02,3.22-.86,6.88.21,4.76.53,8.31.85,11.51.32,3.2.63,6.1.81,9.47.27,5.28.25,8.92.03,11.39-.11,1.23-.27,2.23-.48,3.02-.2.75-.51,1.51-1.04,2.07-.64.69-1.56,1.02-2.52.79-.76-.18-1.29-.66-1.58-.97-.61-.64-1.04-1.46-1.21-1.89-.98-2.47-4.01-8.22-8.12-11.46-1.2-.95-2.07-1.22-2.62-1.26-.52-.04-.89.11-1.19.35-.33.26-.57.63-.69.99-.04.13-.06.22-.07.27,1.11,1.88,5.53,8.77,7.61,15.76,1.55,5.21,5.29,10.52,8.09,12.8,2.71,2.2,7.57,3.57,13.05,3.84,5.42.27,11.01-.57,14.95-2.33,7.6-3.41,9.14-10.91,9.84-14.16.54-2.52.55-5.22.4-7.72-.07-1.25-.18-2.41-.27-3.49-.09-1.04-.17-2.05-.17-2.88ZM110.59,24.28c0-1.17-.31-2.21-.83-2.91-.47-.63-1.16-1.07-2.26-1.07-.91,0-1.52.11-1.94.29-.39.16-.71.42-1,.9-.68,1.1-1.18,3.3-1.18,7.69l.48,10.39c.18,3.47.37,7.22.49,10.35l6.25.83v-26.47ZM114.45,51.31l5.58.88.76-12.93v-9.97c0-1.37-.56-2.21-1.22-2.74-.74-.6-1.6-.81-2-.81-.74,0-1.5.11-2.05.5-.42.3-1.07,1.01-1.07,3.05v22.01ZM124.65,32c1.15-.58,2.39-.76,3.48-.69,1.97.13,3.71.96,4.75,2.77.95,1.65,1.15,3.83.93,6.31-.3,3.43-1.18,13.11-1.18,16.25,0,.63.06,1.47.16,2.54.09,1.05.21,2.28.28,3.6.15,2.63.16,5.72-.48,8.75-.67,3.15-2.49,12.6-12.03,16.88-4.64,2.08-10.87,2.95-16.72,2.66-5.79-.28-11.64-1.73-15.29-4.7-3.44-2.8-7.59-8.79-9.35-14.69-1.99-6.67-6.29-13.24-7.36-15.11-.63-1.1-.43-2.4-.14-3.27.33-.98.98-2,1.94-2.77,1-.79,2.32-1.29,3.88-1.18,1.53.12,3.11.81,4.72,2.08,4.14,3.27,7.18,8.43,8.67,11.59.02-.15.03-.3.05-.46.19-2.21.23-5.65-.04-10.86-.17-3.26-.47-6.05-.79-9.29-.32-3.24-.65-6.87-.87-11.72-.17-3.88.23-6.82,1.31-8.86.56-1.06,1.32-1.9,2.28-2.46.96-.56,2.01-.78,3.04-.78,1.53,0,3.43.22,4.95,1.66.13-.29.28-.56.44-.81.7-1.13,1.63-1.93,2.77-2.42,1.1-.47,2.29-.6,3.46-.6,2.36,0,4.19,1.04,5.36,2.63.76,1.03,1.22,2.23,1.44,3.46,1.25-.57,2.51-.64,3.28-.64,1.31,0,3.02.53,4.43,1.68,1.49,1.21,2.65,3.11,2.65,5.74v2.71Z"/>
  <path className="fill-current" d="M5.12,56.65c0-3.35-.9-13.3-1.19-16.58-.19-2.22.07-3.44.43-4.06.26-.46.67-.78,1.66-.84.71-.05,1.49.16,2.07.68.54.49,1.15,1.48,1.15,3.47v.11s.89,15.12.89,15.12c.03.54.29,1.05.72,1.39.42.34.97.49,1.51.4l9.29-1.47,10.02-1.33c.93-.12,1.63-.89,1.67-1.82l.55-11.95v-.1c.25-4.76.48-9.1.48-10.44,0-3.75.63-5.33,1.19-5.99.44-.53,1.08-.76,2.44-.76.49,0,.83.1,1.09.25.25.15.54.41.82.94.59,1.12,1.02,3.22.86,6.88-.21,4.76-.53,8.31-.85,11.51-.32,3.2-.63,6.1-.81,9.47-.27,5.28-.25,8.92-.03,11.39.11,1.23.27,2.23.48,3.02.2.75.51,1.51,1.04,2.07.65.69,1.56,1.02,2.52.79.76-.18,1.29-.66,1.58-.97.61-.64,1.04-1.46,1.21-1.89.98-2.47,4.01-8.22,8.12-11.46,1.2-.95,2.07-1.22,2.62-1.26.52-.04.89.11,1.19.35.33.26.57.63.69.99.04.13.06.22.07.27-1.11,1.88-5.53,8.77-7.61,15.76-1.55,5.21-5.29,10.52-8.09,12.8-2.71,2.2-7.57,3.57-13.05,3.84-5.43.27-11.01-.57-14.95-2.33-7.6-3.41-9.15-10.91-9.84-14.16-.54-2.52-.55-5.22-.4-7.72.07-1.25.18-2.41.27-3.49.09-1.04.17-2.05.17-2.88ZM23.29,24.28c0-1.17.31-2.21.83-2.91.47-.63,1.16-1.07,2.26-1.07.91,0,1.52.11,1.95.29.39.16.71.42,1,.9.68,1.1,1.18,3.3,1.18,7.69l-.48,10.39c-.18,3.47-.37,7.22-.49,10.35l-6.25.83v-26.47ZM19.43,51.31l-5.58.88-.76-12.93v-9.97c0-1.37.56-2.21,1.22-2.74.74-.6,1.59-.81,2-.81.74,0,1.5.11,2.05.5.42.3,1.07,1.01,1.07,3.05v22.01ZM9.24,32c-1.15-.58-2.39-.76-3.48-.69-1.97.13-3.7.96-4.75,2.77-.95,1.65-1.15,3.83-.93,6.31.3,3.43,1.18,13.11,1.18,16.25,0,.63-.07,1.47-.16,2.54-.09,1.05-.21,2.28-.28,3.6-.15,2.63-.16,5.72.48,8.75.67,3.15,2.49,12.6,12.04,16.88,4.64,2.08,10.87,2.95,16.72,2.66,5.79-.28,11.65-1.73,15.29-4.7,3.44-2.8,7.59-8.79,9.35-14.69,1.99-6.67,6.29-13.24,7.36-15.11.63-1.1.43-2.4.14-3.27-.33-.98-.98-2-1.94-2.77-1-.79-2.32-1.29-3.88-1.18-1.53.12-3.11.81-4.72,2.08-4.14,3.27-7.18,8.43-8.67,11.59-.02-.15-.03-.3-.05-.46-.19-2.21-.23-5.65.04-10.86.17-3.26.47-6.05.79-9.29.32-3.24.65-6.87.87-11.72.17-3.88-.23-6.82-1.31-8.86-.56-1.06-1.32-1.9-2.28-2.46-.96-.56-2.01-.78-3.04-.78-1.53,0-3.43.22-4.95,1.66-.13-.29-.28-.56-.44-.81-.7-1.13-1.63-1.93-2.77-2.42-1.1-.47-2.28-.6-3.46-.6-2.36,0-4.19,1.04-5.36,2.63-.76,1.03-1.22,2.23-1.44,3.46-1.25-.57-2.51-.64-3.27-.64-1.31,0-3.02.53-4.43,1.68-1.49,1.21-2.64,3.11-2.64,5.74v2.71Z"/>
</svg>
```

- **Left nav placement:** Wrap in a **square hit target** matching the prototype: button **`w-9 h-9 rounded-lg`** `bg-sidebar text-sidebar-foreground`, logo **`w-8 h-8`** + `text-sidebar-foreground`. Put the accessible name on the **`button`** (e.g. `aria-label="… logo"`). The decorative SVG may use `aria-hidden` when the button carries the name.
- **Popover:** Logo trigger opens a **wide** popover (`PopoverContent` ~`w-[900px]`, `side="right"`, `align="start"`) with resource cards; hover open/close uses a short leave delay so the cursor can move into the panel — match existing behavior when extending.
- **Marketing / full-screen:** Typical sizing is **`Logo className="w-16 h-16 text-foreground"`** (or similar); scale with **one** `w-*` / `h-*` pair so the mark stays sharp at 2×/3× DPI.
- **Don’t:** Crop the mark, add outlines or effects that change the brand silhouette, ship raster-only in the nav, or place the logo in the **top bar** — brand lives in the left rail and full-page headers only.

### Scrollbar Variants

| Class | Width | Behavior | Use |
|-------|-------|----------|-----|
| `.dropdown-scroll` | 6px thin | Always visible | Menus, popovers |
| `.custom-scrollbar` | 8px thin | Always visible | Chat, main content |
| `.scrollbar-on-hover` | 8px thin | Visible on hover only | Chat threads |
| `.hide-scrollbar` | hidden | Hidden | Horizontal scroll areas |

All scrollbar thumbs: `hsl(var(--muted-foreground) / 0.5)` with hover at `0.7`.

### Tooltips

All tooltips use `bg-muted` for a lighter surface that visually separates from the dark page background.

**Standard tooltip (rounded-md):**
```
whitespace-nowrap rounded-md bg-muted px-2 py-1 text-xs text-foreground shadow-md
```

**Pill tooltip (rounded-full):**
```
bg-muted text-foreground text-xs rounded-full shadow-lg px-3 py-1
```

### Dialog Close Button

The dialog close "×" button has no focus ring (focus ring removed to avoid visual noise on click):
```
absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-md opacity-70
ring-offset-background transition-colors hover:opacity-100 hover:bg-muted/60 focus:outline-none
```

### More component samples

Paths reference `apps/prototype/src/components/ui/` (template-only: `src/components/ui/`).

**Badge (`badge.tsx`)** — rounded pill, `text-xs font-semibold transition-colors`; variants: `default` (`bg-primary text-primary-foreground`), `secondary`, `destructive`, `outline` (`text-foreground`). Use for counts and labels inside toolbars and cards.

**Dialog (`dialog.tsx`)** — overlay: `fixed inset-0 z-[130] bg-black/80` + enter/exit fade. Content: `rounded-modal border border-border bg-modal p-6 text-foreground shadow-lg` (centered; includes zoom/slide animation classes). Prefer this shell over bespoke modals.

**Sheet (`sheet.tsx`)** — slide-in panel sharing overlay pattern with dialog; surface `bg-modal p-6 text-foreground shadow-lg`; sides `left` | `right` | `top` | `bottom` with `sm:max-w-sm` on horizontal sides.

**Native select (`native-select.tsx`)** — same focus/hover language as `Input`:

```
h-10 w-full appearance-none rounded-md border border-border bg-muted/40 py-2 pl-3 pr-10 text-sm text-foreground
ring-offset-background hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2
```

Chevron: `absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none`.

**Search input (`search-input.tsx`)** — wraps `Input` with leading `Search` icon (`absolute left-3`, `text-muted-foreground`) and optional clear control; sizes adjust `h-9` / `h-10` / `h-11` and horizontal padding (`pl-9`–`pl-11`). Use for filtered lists and command surfaces.

**Data table (`table.tsx`)** — shell: `overflow-hidden rounded-md border border-border bg-card shadow-sm`. Table: `w-full table-fixed border-collapse text-sm`. Head row: `border-b border-border bg-muted/50`. Body: `divide-y divide-border`. Rows: `bg-card transition-colors hover:bg-muted/25`. Header cell base: `py-3.5 text-xs font-semibold text-muted-foreground` (sentence case, not all-caps).

---

## 5. Layout Principles

### Spacing System

The app uses Tailwind's default 4px-based spacing scale. These are the most common values by usage:

**Gaps (flex/grid):**

| Class | Px | Context |
|-------|-----|---------|
| `gap-2` | 8px | **Standard gap** — rows, icon + label |
| `gap-3` | 12px | Comfortable — form groups, card content |
| `gap-4` | 16px | Generous — sections, grids |
| `gap-1` | 4px | Tight — badges, compact lists |
| `gap-1.5` | 6px | Between tight and standard |
| `gap-6` | 24px | Major sections |

**Padding:**

| Class | Px | Context |
|-------|-----|---------|
| `px-4` | 16px | **Standard horizontal** — buttons, cards |
| `px-3` | 12px | Compact — menus, inputs |
| `py-2` | 8px | **Standard vertical** — buttons, rows |
| `px-2` | 8px | Tight — badges, pills |
| `py-1` | 4px | Compact vertical |
| `py-1.5` | 6px | Slightly more than compact |
| `p-4` | 16px | Uniform card/container |
| `p-6` | 24px | Dialogs, generous containers |

### Grid & Container

- Max container width: `1400px` (via Tailwind `container` config with `2rem` padding)
- Primary layout: **fixed left icon rail** (`w-16`, 64px) + main content area (`ml-16` when the rail is visible)
- Settings layout: custom CSS vars for independent nav/main vertical inset
  - `--settings-nav-padding-top/bottom`: `2rem`
  - `--settings-main-padding-top/bottom`: `2rem`

### Whitespace Philosophy

- **Dense but breathable**: The app uses `text-sm` (14px) as the default with `gap-2` (8px) standard spacing — dense enough for a productivity tool, but never cramped.
- **Consistent rhythm**: Sections are separated by `border-t border-border` dividers with `my-3` (12px) vertical margin. No heavy horizontal rules.
- **Surface differentiation over spacing**: Rather than using large whitespace to separate areas, the app uses background color shifts (`bg-background` → `bg-card` → `bg-muted`) to create visual sections.

### Border Radius Scale

Defined via CSS custom properties and Tailwind mapping:

| Token | Value | Tailwind | Role |
|-------|-------|----------|------|
| `--radius` | `0.375rem` (6px) | `rounded-lg` | **Standard container** — cards, panels |
| `calc(--radius - 2px)` | `0.25rem` (4px) | `rounded-md` | **Default element** — buttons, inputs, menu items |
| `calc(--radius - 4px)` | `0.125rem` (2px) | `rounded-sm` | Subtle — small inline elements |
| `--radius-modal` | `0.75rem` (12px) | `rounded-modal` | Modal/dialog/popover |
| — | — | `rounded-xl` | Larger cards, featured containers |
| — | — | `rounded-2xl` | Hero elements, large cards |
| — | — | `rounded-full` | Avatars, pills, icon buttons, badges |

**Arbitrary radii to normalize:** `rounded-[6px]` → `rounded-lg`; `rounded-[100px]` → `rounded-full`; `rounded-[12px]` → `rounded-modal` / `rounded-xl`; `rounded-[4px]` → `rounded-md`.

---

## 6. Depth & Elevation

### Shadow Scale

| Tailwind | Role |
|----------|------|
| `shadow-sm` | Subtle elevation — small cards, badges |
| `shadow` | Default — standalone cards |
| `shadow-md` | Dropdowns, popovers |
| `shadow-lg` | Modals, dialogs, elevated panels |
| `shadow-xl` | Floating panels |
| `shadow-2xl` | Full-screen overlays |
| `shadow-inner` | Inset — pressed buttons, input focus |
| `shadow-none` | Flat elements |

### Custom Shadows

| Token | Value | Role |
|-------|-------|------|
| `--shadow-card` | `0 1px 2px 0 hsl(0 0% 0% / 0.3)` | Card resting shadow |

### Elevation Levels

| Level | Treatment | Use |
|-------|-----------|-----|
| 0 — Flat | No shadow, `bg-background` | Page background |
| 1 — Surface | `bg-card` + `border border-border` | Cards, content panels |
| 2 — Raised | `shadow-md` + `border` | Dropdown menus, popovers |
| 3 — Floating | `shadow-lg` + `border` | Modals, dialogs, sheets |
| 4 — Overlay | `shadow-xl` or `shadow-2xl` | Full-screen overlays, drawers |

### Border System

- **Standard border:** `border border-border` (1px solid `hsl(0 0% 14%)`)
- **Subtle border:** `border border-border/60` (reduced opacity)
- **Interactive hover:** `hover:border-white/30` or `hover:border-muted-foreground/30`
- **Section divider:** `border-t border-border` (horizontal rule) or `border-t border-sidebar-border` (in sidebar)
- **Focus ring:** `ring-1 ring-ring ring-offset-2 ring-offset-background` (1px, `focus-visible:` only)

---

## 7. Do's and Don'ts

### Colors

| Do | Don't |
|----|-------|
| Use `text-foreground` for primary text | Use `text-white` for primary text (prefer tokens) |
| Use `text-muted-foreground` for secondary text | Use `text-stone-400` or `text-gray-400` (raw palette) |
| Use `bg-background` for page surfaces | Use `bg-black` or hardcoded `bg-[#0d0d0d]` |
| Use `bg-card` for elevated surfaces | Use `bg-stone-800` or `bg-neutral-900` |
| Use `bg-muted` for subtle backgrounds | Use `bg-stone-700` or `bg-gray-800` |
| Use `border-border` for all borders | Use `border-stone-700` or `border-gray-700` |
| Use `text-success-foreground` for success text | Use `text-emerald-400` or `text-green-400` |
| Use `text-destructive` for error text | Use `text-red-500` or `text-rose-500` |
| Use `hover:text-foreground` for hover text brightening | Use `hover:text-white` except in sidebar context |

**Semantic status colors:** Use `text-success` / `bg-success`, `text-warning` / `bg-warning`, `text-info` / `bg-info`, `text-destructive` / `bg-destructive` — never raw chromatic palette classes like `text-green-500`, `bg-amber-400`, `text-blue-500`, etc.

**Current debt:** `apps/prototype/src/theme/themeAppClassMap.ts` and flows such as `NewUserExperienceFlowchart.tsx` still use raw `stone-*` / `rgb()` in places (legacy theme maps — migrating to full CSS-variable themes is deferred). `ChatThread.tsx` `messageTypeColors` uses a few raw palette colors for categorical distinctness where semantic tokens are not yet defined.

### Typography

| Do | Don't |
|----|-------|
| Use `text-sm` (14px) as default body size | Use `text-[14px]` or arbitrary pixel values |
| Use `text-xs` (12px) for small/meta text | Use arbitrary pixel sizes for general text |
| Use Tailwind scale (`text-lg`, `text-xl`, `text-2xl`) | Use arbitrary sizes like `text-[28px]`, `text-[40px]` |
| Use `font-medium` as default weight | Use `font-bold` for general emphasis |
| Keep heading hierarchy: `2xl` → `xl` → `lg` → `base` | Skip levels or invert the scale |

### Border Radius

| Do | Don't |
|----|-------|
| Use `rounded-md` (4px) for buttons, inputs, menu items | Use `rounded-[4px]` (same value, less maintainable) |
| Use `rounded-lg` (6px) for cards, containers | Use `rounded-[6px]` (use the token) |
| Use `rounded-xl` or `rounded-modal` for dialogs | Use `rounded-[12px]` (use the token) |
| Use `rounded-full` for pills and avatars | Use `rounded-[100px]` (use `rounded-full`) |

### Spacing

| Do | Don't |
|----|-------|
| Use `gap-2` (8px) as standard item gap | Use arbitrary gap values |
| Use `px-3`/`px-4` for horizontal padding | Mix `px-2.5` and `px-3.5` without reason |
| Use `p-4` for card padding, `p-6` for dialogs | Use `p-[24px]` (same as `p-6`) |
| Use `my-3` for section divider spacing | Use inconsistent vertical margins around dividers |

### Hover & Interaction

| Do | Don't |
|----|-------|
| Use `hover:bg-muted/60` as standard hover bg on dark surfaces | Mix `/40`, `/50`, `/60`, `/70` without hierarchy |
| Use `hover:bg-primary/85` for white/primary buttons | Use `hover:bg-muted/60` on white buttons (creates dark hover) |
| Use `transition-colors` on `Button` and color-only controls | Use `transition-all` when only colors change |
| Use `duration-200` as standard transition speed | Mix `duration-150`, `duration-200`, `duration-300` randomly |
| Use `group` + `group-hover:` for parent-child hover | Apply hover to each child independently |
| Rely on hover + focus-visible for button feedback (no press scale) | Add `active:scale-*` on `Button` or primary actions |

### Icons

| Do | Don't |
|----|-------|
| Use `w-4 h-4` as standard icon size in menus/buttons | Use `w-3 h-3` or `w-5 h-5` without size hierarchy reason |
| Set icon color to `text-muted-foreground` by default | Leave icons inheriting parent text color (appears too bright) |
| Brighten on hover: `group-hover:text-foreground` or `group-hover:text-white` | Omit icon hover transitions |
| Use `shrink-0` on icons in flex layouts | Let icons squish when text wraps |

---

## 8. Responsive Behavior

### Breakpoints (Tailwind defaults)

| Prefix | Min Width | Key Changes |
|--------|-----------|-------------|
| (none) | 0px | Mobile-first base styles |
| `sm` | 640px | Wider cards, more padding |
| `md` | 768px | Multi-column layouts begin, `md:text-sm` on inputs |
| `lg` | 1024px | Full sidebar visible, expanded grid |
| `xl` | 1280px | Maximum content width, full feature layout |
| `2xl` | 1400px | Container max-width ceiling |

### Touch Targets
- Minimum interactive height: `h-10` (40px) for buttons and inputs
- Small variant: `h-9` (36px) for compact contexts
- Icon buttons: `h-10 w-10` (40×40px)
- Menu items: `py-1.5` (6px) vertical padding at `text-sm` yields ~32px touch target

### Collapsing Strategy
- **Left nav:** In the prototype, a **fixed 64px icon rail** (`w-16`); labels appear in **tooltips**, not an expanded wide sidebar (props exist for future expansion but are unused).
- Navigation menus: horizontal → hamburger on mobile
- Grid layouts: multi-column → single-column stacked
- Container padding: reduces from `p-6` → `p-4` → `p-3` at smaller breakpoints

---

## 9. Interaction & Motion

### Transitions

| Pattern | When |
|---------|------|
| `transition-colors` | **Default** — color/bg/border changes |
| `transition-opacity` | Fade in/out |
| `transition-all` | Multiple property types changing |
| `transition-transform` | Scale/translate |

### Duration

| Duration | When |
|----------|------|
| `duration-200` | **Standard** — toggles, sidebar, hovers, dialogs |
| `duration-300` | Layout — drawers, canvas split, larger motion |

### Easing

| Easing | When |
|--------|------|
| `ease-in-out` | **Default** — symmetrical transitions |
| `ease-out` | Enter animations |

### Framer Motion (prototype)
- `AnimatePresence` for mount/unmount transitions
- Standard enter: `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}`
- Standard exit: `exit={{ opacity: 0 }}`
- Duration: typically `0.2s`–`0.3s`
- Used for: panel reveals, notification toasts, drawer slides, loading states

### Interactive Feedback
- **Buttons:** Hover and focus-visible only — **no** `active:scale-*` or press-shrink on the shared `Button` component.
- **Card hover:** `hover:scale-[1.02]` (subtle grow, only where explicitly designed — not default)
- **Focus:** `focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2` (1px ring, keyboard-only)

---

## 10. Agent Prompt Guide

### Quick Color Reference
- Page background: `bg-background` → `hsl(0 0% 5%)` → `#0d0d0d`
- Primary text: `text-foreground` → `hsl(0 0% 98%)` → `#fafafa`
- Secondary text: `text-muted-foreground` → `hsl(0 0% 55%)` → `#8c8c8c`
- Card surface: `bg-card` → `hsl(0 0% 7%)` → `#121212`
- Border: `border-border` → `hsl(0 0% 14%)` → `#242424`
- Hover background: `bg-muted/60` → `hsl(0 0% 12% / 0.6)`
- Success: `text-success-foreground` → `hsl(142 71% 76%)` → `#86efac`
- Error: `text-destructive` → `hsl(0 72% 51%)` → `#dc2626`

### Example Component Prompts

- **"Create a settings card"**: `bg-card border border-border rounded-lg p-4`. Title at `text-lg font-semibold text-foreground`. Description at `text-sm text-muted-foreground`. Action button: `<Button variant="outline">`.
- **"Create a left nav icon item"**: Match `LeftNav` — `h-9 w-9 rounded-md`, icon `w-5 h-5`, active `bg-sidebar-accent text-sidebar-foreground`, idle `text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground`. For **popover/menus** inside the shell, a text row can still use: `group flex … px-3 py-1.5 text-sm … hover:bg-muted/60` with `w-4 h-4` icons.
- **"Place the logo"**: Import `Logo` from `apps/prototype/src/components/common/Logo.tsx`; use the canonical SVG paths from **Logo mark (required usage)** — do not substitute icons or raster. Set `className` for size + `text-sidebar-foreground` or `text-foreground`.
- **"Create a dropdown menu"**: Use `DropdownMenu` + `DropdownMenuTrigger` + `DropdownMenuContent` + `DropdownMenuItem` from `apps/prototype/src/components/ui/dropdown-menu.tsx`. Icons auto-styled grey → white on hover via the component's built-in `[&_svg]` selectors.
- **"Create a form field"**: Label at `text-sm font-medium text-foreground mb-1.5`. Use `<Input>` component (never inline raw `<input>` with custom focus styles). Help text at `text-xs text-muted-foreground mt-1`.
- **"Create a tooltip"**: `bg-muted text-foreground text-xs rounded-md px-2 py-1 shadow-md`. For pill-style: use `rounded-full` instead of `rounded-md`.
- **"Create a status badge"**: Prefer `<Badge variant="outline" />` or semantic fills from `badge.tsx`; for custom pills: `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium`. Success: `bg-success/10 text-success-foreground`. Error: `bg-destructive/10 text-destructive`.
- **"Create a search field"**: Use `SearchInput` from `search-input.tsx` with `size` as needed; match icon padding and `text-muted-foreground` on the search icon.
- **"Create a modal"**: Compose `Dialog` + `DialogContent` from `dialog.tsx`; keep `bg-modal` and `rounded-modal` — do not invent a new modal frame.
- **"Create a side panel"**: Use `Sheet` + `SheetContent` from `sheet.tsx` with `side="right"` (or left) for filters and inspectors.
- **"Create a data table"**: Wrap with `dataTableShellClassName` / row and cell classes from `table.tsx`; header labels sentence case via `dataTableTh`.
- **"Create a select"**: Use `NativeSelect` so focus ring and hover match `Input`.

### Iteration Guide

1. **Always use semantic color tokens** — never raw palette colors (`stone-*`, `gray-*`, `slate-*`). Every color should trace back to a `--css-variable`.
2. **`text-sm` is the default** — don't reach for `text-base` unless the context genuinely needs larger text (e.g., chat messages, hero content).
3. **`rounded-md` for elements, `rounded-lg` for containers** — this is the consistent radius hierarchy. Dialogs get `rounded-xl` or `rounded-modal`.
4. **`gap-2` is the standard** — 8px between items in any flex/grid layout. Use `gap-4` for major sections.
5. **Icons are always `text-muted-foreground`** by default and brighten to `text-foreground` or `text-white` on hover via `group` + `group-hover:`.
6. **`transition-colors duration-200`** is the standard animation. Don't add `transition-all` unless multiple property types are actually changing.
7. **`hover:bg-muted/60`** is the canonical hover background. Use it consistently across menus, nav items, and interactive rows.
8. **The `Button` component handles its own variants** — don't rebuild button styles from scratch. Use `variant="outline"` for most secondary actions.

