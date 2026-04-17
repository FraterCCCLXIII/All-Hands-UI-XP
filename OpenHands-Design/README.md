# OpenHands Design System

A portable design system extracted from the OpenHands UI. Drop it into any React + Tailwind project to get a consistent dark-first interface with semantic color tokens, pre-built components, and a comprehensive style guide.

## What's Included

```
OpenHands-Design/
  DESIGN.md                          # Full design system specification
  README.md                          # This file
  tailwind.config.js                 # Tailwind theme (colors, radii, fonts, animations)
  src/
    globals.css                      # CSS custom properties (design tokens) + base resets
    lib/
      utils.ts                       # cn() helper (clsx + tailwind-merge)
    components/ui/
      button.tsx                     # Button with 8 variants (default, destructive, outline, light, secondary, muted, ghost, link)
      input.tsx                      # Text input with unified focus style
      search-input.tsx               # Search input with icon, clear button, and 3 sizes
      native-select.tsx              # Native <select> with consistent styling
```

## Quick Start

### Install with npx

From your project root:

```bash
npx openhands-design
```

This adds `./OpenHands-Design/` (including `DESIGN.md`, tokens, and UI components). Then ask your AI assistant to use **`DESIGN.md`** for UI work. If the folder already exists, run `npx openhands-design --force` to replace it.

### 1. Install dependencies

```bash
npm install clsx tailwind-merge class-variance-authority @radix-ui/react-slot lucide-react tailwindcss-animate
```

### 2. Copy files into your project

```bash
# Copy the design tokens and global CSS
cp OpenHands-Design/src/globals.css        your-project/src/globals.css

# Copy the Tailwind config (or merge into your existing one)
cp OpenHands-Design/tailwind.config.js     your-project/tailwind.config.js

# Copy the utility helper
cp OpenHands-Design/src/lib/utils.ts       your-project/src/lib/utils.ts

# Copy the UI components
cp -r OpenHands-Design/src/components/ui/  your-project/src/components/ui/
```

### 3. Import globals.css

In your app entry point (e.g., `main.tsx` or `App.tsx`):

```tsx
import './globals.css';
```

### 4. Theme class on `<html>` (optional)

Tokens are defined on `:root` in `globals.css`; many apps also duplicate values under `.dark`. You can add `class="dark"` on `<html>` for Tailwind `dark:` variants and consistency with the **OpenHands** prototype. **A full light theme is not product-ready** in the prototype — ship dark only until that work is scheduled.

### 5. Start using components

```tsx
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { SearchInput } from './components/ui/search-input';
import { NativeSelect } from './components/ui/native-select';

function Example() {
  return (
    <div className="flex flex-col gap-4 bg-background p-6 text-foreground">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-muted-foreground">Manage your account.</p>

      <Input placeholder="Your name" />

      <NativeSelect>
        <option>Option A</option>
        <option>Option B</option>
      </NativeSelect>

      <div className="flex gap-2">
        <Button>Save</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="destructive">Delete</Button>
      </div>
    </div>
  );
}
```

## Using with AI Agents (Cursor, Copilot, etc.)

The `DESIGN.md` file is structured as an AI-readable specification. Two ways to use it:

### Option A: Cursor Rule (recommended)

Create `.cursor/rules/design-system.md` in your project:

```markdown
When building UI components, follow the design system in /DESIGN.md.

Key rules:
- Use semantic color tokens (bg-card, text-foreground, border-border) — never raw palette classes
- Use the Button, Input, SearchInput, and NativeSelect components — never raw HTML with inline styles
- Hover on dark surfaces: hover:bg-muted/60
- Hover on white/primary buttons: hover:bg-primary/85
- Focus rings: focus-visible:ring-1 (keyboard-only, 1px)
- Default text: text-sm font-normal text-foreground
- Secondary text: text-sm text-muted-foreground
- Standard gap: gap-2 (8px)
- Standard card: bg-card border border-border rounded-lg p-4
```

Every Cursor conversation will now follow your design system automatically.

### Option B: Direct prompt

Paste this at the start of a conversation:

> Build this feature following the design system in DESIGN.md. Use semantic tokens for all colors, the Button component for actions, and the Input component for form fields.

## Token Architecture

All colors are HSL triplets stored as CSS custom properties. Tailwind maps them via `hsl(var(--token))`.

```
Background scale (darkest → lightest):
  --background    5%   #0d0d0d   Page background
  --card          7%   #121212   Cards, elevated surfaces
  --secondary     8%   #141414   Secondary surfaces
  --muted        12%   #1f1f1f   Hover fills, badges, tooltips
  --border       14%   #242424   Borders, dividers
  --muted-hover  18%   #2e2e2e   Hover on muted surfaces

Text scale:
  --foreground          98%   #fafafa   Primary text
  --muted-foreground    55%   #8c8c8c   Secondary text, placeholders
  --primary            100%   #ffffff   Maximum emphasis, button bg
  --primary-foreground   0%   #000000   Text on white buttons

Semantic colors:
  --success       hsl(142 71% 45%)   Green — success states
  --warning       hsl(38 92% 50%)    Amber — warnings, in-progress
  --info          hsl(217 91% 60%)   Blue — links, informational
  --destructive   hsl(0 72% 51%)     Red — errors, danger
```

## Button Variants

| Variant | Look | Use |
|---------|------|-----|
| `default` | White bg, black text | Primary CTA |
| `destructive` | Red bg, white text | Delete, danger |
| `outline` | Transparent, border | Secondary actions |
| `light` | White bg, border | High-contrast primary |
| `secondary` | Dark bg | Tertiary actions |
| `muted` | Muted bg, grey text | Subdued actions |
| `ghost` | Transparent, no border | Minimal chrome |
| `link` | Underline on hover | Inline links |

## Customization

### Changing the color scheme

Edit the HSL values in `globals.css`. Every UI element updates automatically:

```css
:root {
  --background: 220 20% 5%;   /* Add a blue tint */
  --card: 220 15% 8%;
  --border: 220 10% 16%;
}
```

### Light theme

**Not implemented** in the current OpenHands prototype (dark mode only). Do not add a `.light` block or ship light surfaces until the product explicitly schedules that work; keep documentation and new UI aligned with **dark tokens** only.

## Reference

See [DESIGN.md](./DESIGN.md) for the complete specification, including scope (monorepo paths vs copied `OpenHands-Design/`), visual theme, color palette, typography, components, layout, elevation, do's and don'ts, responsive behavior, motion, and the agent prompt guide.

In this repo, **`DESIGN.md` is kept in sync with `apps/prototype`** (run `npm run sync:openhands-design-template` to refresh the packaged template).

## License

MIT
