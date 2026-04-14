# Token Normalization Log

Tracking the migration from raw Tailwind palette classes and arbitrary values to semantic design tokens.

## Completed

- [x] `.dark` CSS block now declares all variables from `:root` (`--modal-background`, `--radius-*`, `--success`, `--warning`, `--info`, `--gradient-*`, `--shadow-*`, `--font-*`, `--settings-*`)
- [x] Migrated ~160 raw `stone-*` utility classes across 17 component files to semantic tokens (excluding `themeAppClassMap.ts`, `index.ts`, and scrollbar utilities)
- [x] Migrated ~44 raw `gray-*` utility classes across 10 files to semantic tokens
- [x] Migrated ~83 raw `neutral-*` classes across 3 files to semantic tokens (preserving VS Code diff mock borders)
- [x] Replaced 47 arbitrary border radius values (`rounded-[6px]` → `rounded-lg`, `rounded-[100px]` → `rounded-full`, `rounded-[12px]` → `rounded-xl`, `rounded-[4px]` → `rounded-md`, `rounded-r-[100px]` → `rounded-r-full`)
- [x] Replaced 74 arbitrary font sizes (`text-[11px]` → `text-xs`, `text-[10px]` → `text-xs`, `text-[12px]` → `text-xs`)
- [x] Standardized 57 `hover:bg-muted` opacity variants (`/40`, `/50`, `/70`, `/80`) to canonical `/60`
- [x] Replaced 6 unsafe `text-white` usages with semantic tokens (`text-foreground`, `text-card-foreground`)
- [x] Replaced `bg-[#141414]` → `bg-secondary` (2 instances)
- [x] Migrated ~100+ chromatic palette classes to semantic tokens: `amber/yellow` → `warning`, `blue/sky` → `info`, `green/emerald` → `success`, `red` → `destructive`
- [x] Unified tooltip backgrounds from `bg-popover`/`bg-card` to `bg-muted` across all 6 tooltip instances
- [x] Fixed 33 inline white buttons (`bg-white text-black hover:bg-muted/60` → `bg-primary text-primary-foreground hover:bg-primary/85`)
- [x] Fixed Button `light` variant from `bg-white text-black hover:bg-zinc-200` to `bg-primary text-primary-foreground hover:bg-primary/85`
- [x] Removed Dialog `--ring` inline override (`0 0% 95%`) that caused inconsistent focus ring color in modals
- [x] Updated global `--ring` from `0 0% 50%` to `0 0% 80%` for better visibility
- [x] Normalized ~50 inline input/textarea/select focus styles to canonical `focus-visible:` pattern (from mixed `focus:`/`focus-visible:` with missing offsets)
- [x] Changed all focus rings from `ring-2` to `ring-1` site-wide (~97 instances across 39 files)
- [x] Added `appearance: none` on `input[type="search"]` to strip browser default focus chrome
- [x] Removed focus ring from dialog close button
- [x] Consolidated `active:scale-95` (3 uses) → `active:scale-[0.97]` to match Button standard
- [x] Migrated `ChatThread.tsx` `messageTypeColors`: `yellow-500` → `warning`, `blue-500` → `info` (3 categories). Remaining categorical colors (`orange-500`, `indigo-500`, `purple-500`, `pink-500`) kept as raw palette — no semantic equivalent for multi-category distinctness
- [x] Migrated 14 remaining `bg-white` usages in non-button contexts to semantic tokens: toggles → `bg-primary`, resize grips → `bg-foreground`, badge → `bg-primary`, attachment previews → `bg-foreground/5`, CTA buttons → `bg-primary text-primary-foreground hover:bg-primary/85`, ghost hover buttons → `hover:bg-primary hover:text-primary-foreground`
- [x] Documented `duration-200` vs `duration-300` convention (200ms = local feedback, 300ms = layout/panel motion)
- [x] ~~Migrate legacy `index.ts`~~ — invalid; `screens/index.ts` and `components/workflow/index.ts` are barrel files with zero raw color classes

## Deferred by Design

- [ ] `themeAppClassMap.ts` and `NewUserExperienceFlowchart.tsx` use raw `stone-*` / `rgb()` values — these are **theme definition maps** that intentionally encode per-theme palettes (dark/light/sepia). Migrating requires defining CSS variables for each theme mode, which is an architectural change
- [ ] `sepia` theme in `themeAppClassMap.ts` uses hardcoded `rgb()` — requires defining a `.theme-sepia` CSS variable block before semantic classes can replace arbitrary values
- [ ] `ChatThread.tsx` categorical palette (`orange-500`, `indigo-500`, `purple-500`, `pink-500`) for `bug`, `docs`, `dependency`, `git` message types — no semantic tokens exist for multi-category distinctness; would need new `--chart-*` or `--category-*` CSS variables
