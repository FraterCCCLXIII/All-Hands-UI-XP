# OpenHands UI Design System

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
- `transition-colors` as the dominant transition (958 uses) — UI feels responsive but not animated
- Dark-only primary mode; light and sepia modes exist as secondary via class-map theming

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
| `--modal-background` | Inherits `--background` | `#0d0d0d` | Dialogs, sheets, modals (can diverge) |

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

The app uses Tailwind's default type scale. These are the **canonical sizes** ordered by frequency of use:

| Tailwind Class | Size | Uses | Role |
|----------------|------|------|------|
| `text-sm` | 14px / 0.875rem | 711 | **Primary body text**, labels, button text, descriptions |
| `text-xs` | 12px / 0.75rem | 427 | **Secondary text**, metadata, badges, menu items, captions |
| `text-base` | 16px / 1rem | 52 | Larger body text, input text, chat messages |
| `text-lg` | 18px / 1.125rem | 67 | Section sub-headings, dialog titles |
| `text-xl` | 20px / 1.25rem | 28 | Page sub-headings |
| `text-2xl` | 24px / 1.5rem | 31 | Page headings, modal titles |
| `text-3xl` | 30px / 1.875rem | 12 | Hero headings, landing sections |

### Arbitrary Font Sizes (to normalize)

These arbitrary sizes appear frequently and should be migrated to the standard scale or formalized as tokens:

| Arbitrary | Count | Recommended Replacement |
|-----------|-------|------------------------|
| `text-[11px]` | 46 | `text-xs` (12px) — or formalize as `--text-2xs` if 11px is intentional |
| `text-[10px]` | 20 | `text-xs` (12px) — or formalize as `--text-2xs` |
| `text-[12px]` | 8 | `text-xs` (already 12px — use the utility) |
| `text-[40px]` | 5 | `text-4xl` (36px) or formalize as hero display size |
| `text-[28px]` | 3 | `text-3xl` (30px) or formalize |
| `text-[32px]` | 1 | `text-3xl` (30px) or `text-4xl` (36px) |
| `text-[8px]` | 1 | Likely a micro label — evaluate if needed |

### Font Weight Scale

| Tailwind Class | Weight | Uses | Role |
|----------------|--------|------|------|
| `font-medium` | 500 | 304 | Labels, nav items, badges (note: buttons use `font-normal`) |
| `font-semibold` | 600 | 229 | **Headings**, section titles, strong emphasis |
| `font-normal` | 400 | 106 | **Body text**, descriptions, long-form content |
| `font-bold` | 700 | 29 | Maximum emphasis (use sparingly) |
| `font-light` | 300 | 13 | De-emphasized text (use sparingly) |

### Line Height

| Tailwind Class | Uses | Role |
|----------------|------|------|
| `leading-4` | 38 | Tight — compact UI, badges |
| `leading-6` | 34 | Standard — body text |
| `leading-relaxed` | 33 | Comfortable — long-form, descriptions |
| `leading-5` | 28 | Medium — labels, short text |
| `leading-tight` | 27 | Condensed — headings |
| `leading-snug` | 17 | Slightly condensed |
| `leading-none` | 16 | No leading — single-line elements |

### Letter Spacing

| Tailwind Class | Uses | Role |
|----------------|------|------|
| `tracking-wide` | 28 | Uppercase labels, section headers |
| `tracking-wider` | 20 | Small-caps metadata |
| `tracking-tight` | 19 | Display headings |

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

### Buttons (`Button` component — `src/components/ui/button.tsx`)

**Base classes (all variants):**
`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-normal ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`

| Variant | Background | Text | Border | Hover | Use |
|---------|-----------|------|--------|-------|-----|
| `default` | `bg-primary` | `text-primary-foreground` | — | `hover:bg-primary/85` | Primary CTA (white button, black text) |
| `destructive` | `bg-destructive` | `text-destructive-foreground` | — | `hover:bg-destructive/85` | Delete, danger actions |
| `outline` | `bg-background` | — | `border border-input` | `hover:bg-muted hover:text-foreground` | Secondary actions (most used — 53 instances) |
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

### Inputs (`Input` component — `src/components/ui/input.tsx`)

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
- `sm`: `h-9` + `pl-8 pr-8` (icon padding)
- `default`: `h-10` + `pl-9 pr-9`
- `lg`: `h-11` + `pl-10 pr-10`

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

### Navigation (LeftNav sidebar)

- Collapsed: 56px wide icon rail
- Expanded: 240px+ with text labels
- Items: `flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors`
- Icons: `w-4 h-4 text-muted-foreground group-hover:text-white`
- Active: `bg-muted/60 text-foreground`
- Hover: `hover:bg-muted/60 hover:text-white`

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

---

## 5. Layout Principles

### Spacing System

The app uses Tailwind's default 4px-based spacing scale. These are the most common values by usage:

**Gaps (flex/grid):**

| Class | Px | Uses | Context |
|-------|-----|------|---------|
| `gap-2` | 8px | 414 | **Standard gap** — between items in rows, icon + label |
| `gap-3` | 12px | 144 | Comfortable gap — form groups, card content |
| `gap-4` | 16px | 110 | Generous gap — section spacing, grid layouts |
| `gap-1` | 4px | 86 | Tight gap — inline badges, compact lists |
| `gap-1.5` | 6px | 59 | Between tight and standard |
| `gap-6` | 24px | 50 | Large gap — major sections |

**Padding:**

| Class | Px | Uses | Context |
|-------|-----|------|---------|
| `px-4` | 16px | 216 | **Standard horizontal padding** — buttons, cards |
| `px-3` | 12px | 212 | Compact horizontal padding — menu items, inputs |
| `py-2` | 8px | 200 | **Standard vertical padding** — buttons, rows |
| `px-2` | 8px | 198 | Tight horizontal padding — badges, pills |
| `py-1` | 4px | 138 | Compact vertical padding |
| `py-1.5` | 6px | 76 | Slightly more than compact |
| `p-4` | 16px | 89 | Uniform card/container padding |
| `p-6` | 24px | 26 | Generous container/dialog padding |

### Grid & Container

- Max container width: `1400px` (via Tailwind `container` config with `2rem` padding)
- Primary layout: sidebar (56–240px) + main content area
- Settings layout: custom CSS vars for independent nav/main vertical inset
  - `--settings-nav-padding-top/bottom`: `2rem`
  - `--settings-main-padding-top/bottom`: `2rem`

### Whitespace Philosophy

- **Dense but breathable**: The app uses `text-sm` (14px) as the default with `gap-2` (8px) standard spacing — dense enough for a productivity tool, but never cramped.
- **Consistent rhythm**: Sections are separated by `border-t border-border` dividers with `my-3` (12px) vertical margin. No heavy horizontal rules.
- **Surface differentiation over spacing**: Rather than using large whitespace to separate areas, the app uses background color shifts (`bg-background` → `bg-card` → `bg-muted`) to create visual sections.

### Border Radius Scale

Defined via CSS custom properties and Tailwind mapping:

| Token | Value | Tailwind | Uses | Role |
|-------|-------|----------|------|------|
| `--radius` | `0.375rem` (6px) | `rounded-lg` | 112 | **Standard container radius** — cards, panels |
| `calc(--radius - 2px)` | `0.25rem` (4px) | `rounded-md` | 501 | **Default element radius** — buttons, inputs, menu items |
| `calc(--radius - 4px)` | `0.125rem` (2px) | `rounded-sm` | 12 | Subtle radius — small inline elements |
| `--radius-modal` | `0.75rem` (12px) | `rounded-modal` | — | Modal/dialog/popover radius |
| — | — | `rounded-xl` | 90 | Larger cards, featured containers |
| — | — | `rounded-2xl` | 23 | Hero elements, large cards |
| — | — | `rounded-full` | 185 | Avatars, pills, circular buttons, badges |

**Arbitrary radii to normalize:**

| Arbitrary | Count | Recommended |
|-----------|-------|-------------|
| `rounded-[6px]` | 20 | `rounded-lg` (already 6px via `--radius`) |
| `rounded-[100px]` | 15 | `rounded-full` (same visual effect) |
| `rounded-[12px]` | 8 | `rounded-modal` or `rounded-xl` (12px) |
| `rounded-[4px]` | 4 | `rounded-md` (already 4px) |

---

## 6. Depth & Elevation

### Shadow Scale

| Tailwind | Uses | Role |
|----------|------|------|
| `shadow-sm` | 21 | Subtle elevation — small cards, badges |
| `shadow` | 22 | Default — standalone cards |
| `shadow-md` | 31 | Medium — dropdown menus, popovers |
| `shadow-lg` | 49 | **Most used** — modals, dialogs, elevated panels |
| `shadow-xl` | 14 | High emphasis — floating panels |
| `shadow-2xl` | 5 | Maximum — overlay dialogs |
| `shadow-inner` | 8 | Inset — pressed buttons, input focus |
| `shadow-none` | 19 | Reset — flat elements |

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
| Use `text-foreground` for primary text | Use `text-white` for primary text (278 instances to migrate) |
| Use `text-muted-foreground` for secondary text | Use `text-stone-400` or `text-gray-400` (raw palette) |
| Use `bg-background` for page surfaces | Use `bg-black` or hardcoded `bg-[#0d0d0d]` |
| Use `bg-card` for elevated surfaces | Use `bg-stone-800` or `bg-neutral-900` |
| Use `bg-muted` for subtle backgrounds | Use `bg-stone-700` or `bg-gray-800` |
| Use `border-border` for all borders | Use `border-stone-700` or `border-gray-700` |
| Use `text-success-foreground` for success text | Use `text-emerald-400` or `text-green-400` |
| Use `text-destructive` for error text | Use `text-red-500` or `text-rose-500` |
| Use `hover:text-foreground` for hover text brightening | Use `hover:text-white` except in sidebar context |

**Semantic status colors:** Use `text-success` / `bg-success`, `text-warning` / `bg-warning`, `text-info` / `bg-info`, `text-destructive` / `bg-destructive` — never raw chromatic palette classes like `text-green-500`, `bg-amber-400`, `text-blue-500`, etc.

**Current debt:** `themeAppClassMap.ts` and `NewUserExperienceFlowchart.tsx` still use raw `stone-*` / `rgb()` values (theme definition maps — intentionally deferred; requires per-theme CSS variable architecture). `ChatThread.tsx` `messageTypeColors` has 4 remaining raw palette colors (`orange-500`, `indigo-500`, `purple-500`, `pink-500`) for categorical distinctness — no semantic tokens defined for these yet.

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
| Use `transition-colors` for color-only changes | Use `transition-all` when only color changes |
| Use `duration-200` as standard transition speed | Mix `duration-150`, `duration-200`, `duration-300` randomly |
| Use `group` + `group-hover:` for parent-child hover | Apply hover to each child independently |
| Use `active:scale-[0.97]` for button press feedback | Use `active:scale-95` (inconsistent with Button component) |

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
- Sidebar: collapses from expanded (labels) to icon-only rail on narrow viewports
- Navigation menus: horizontal → hamburger on mobile
- Grid layouts: multi-column → single-column stacked
- Container padding: reduces from `p-6` → `p-4` → `p-3` at smaller breakpoints

---

## 9. Interaction & Motion

### Transitions

| Pattern | Uses | When |
|---------|------|------|
| `transition-colors` | 958 | **Default** — use for any color/bg/border change |
| `transition-opacity` | 96 | Fade in/out |
| `transition-all` | 96 | Multiple properties changing simultaneously |
| `transition-transform` | 59 | Scale/translate animations |

### Duration

| Duration | Uses | When |
|----------|------|------|
| `duration-200` | ~48 | **Standard** — local, small feedback: toggles, chevron rotation, sidebar width, card/row hovers, opacity on hover, dialogs |
| `duration-300` | ~34 | **Layout motion** — panel/drawer resize, sheet exit, canvas split, login/marketing card hover, grid row animations |

### Easing

| Easing | Uses | When |
|--------|------|------|
| `ease-in-out` | 111 | **Default** — smooth symmetrical transitions |
| `ease-out` | 52 | Enter animations — elements arriving |

### Framer Motion Patterns (23 files)
- `AnimatePresence` for mount/unmount transitions
- Standard enter: `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}`
- Standard exit: `exit={{ opacity: 0 }}`
- Duration: typically `0.2s`–`0.3s`
- Used for: panel reveals, notification toasts, drawer slides, loading states

### Interactive Feedback
- **Button press:** `active:scale-[0.97]` (slight shrink on click)
- **Card hover:** `hover:scale-[1.02]` (subtle grow, 12 uses)
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
- **"Create a sidebar menu item"**: `group flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 transition-colors`. Icon: `w-4 h-4 shrink-0 text-muted-foreground transition-colors group-hover:text-white`.
- **"Create a dropdown menu"**: Use `DropdownMenu` + `DropdownMenuTrigger` + `DropdownMenuContent` + `DropdownMenuItem` from `src/components/ui/dropdown-menu.tsx`. Icons auto-styled grey → white on hover via the component's built-in `[&_svg]` selectors.
- **"Create a form field"**: Label at `text-sm font-medium text-foreground mb-1.5`. Use `<Input>` component (never inline raw `<input>` with custom focus styles). Help text at `text-xs text-muted-foreground mt-1`.
- **"Create a tooltip"**: `bg-muted text-foreground text-xs rounded-md px-2 py-1 shadow-md`. For pill-style: use `rounded-full` instead of `rounded-md`.
- **"Create a status badge"**: `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium`. Success: `bg-success/10 text-success-foreground`. Error: `bg-destructive/10 text-destructive`.

### Iteration Guide

1. **Always use semantic color tokens** — never raw palette colors (`stone-*`, `gray-*`, `slate-*`). Every color should trace back to a `--css-variable`.
2. **`text-sm` is the default** — don't reach for `text-base` unless the context genuinely needs larger text (e.g., chat messages, hero content).
3. **`rounded-md` for elements, `rounded-lg` for containers** — this is the consistent radius hierarchy. Dialogs get `rounded-xl` or `rounded-modal`.
4. **`gap-2` is the standard** — 8px between items in any flex/grid layout. Use `gap-4` for major sections.
5. **Icons are always `text-muted-foreground`** by default and brighten to `text-foreground` or `text-white` on hover via `group` + `group-hover:`.
6. **`transition-colors duration-200`** is the standard animation. Don't add `transition-all` unless multiple property types are actually changing.
7. **`hover:bg-muted/60`** is the canonical hover background. Use it consistently across menus, nav items, and interactive rows.
8. **The `Button` component handles its own variants** — don't rebuild button styles from scratch. Use `variant="outline"` for most secondary actions.

