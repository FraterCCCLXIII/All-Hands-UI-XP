# All Hands UI XP

Monorepo containing the main prototype and supporting apps:

- **Prototype app** (`apps/prototype`) — OpenHands UI prototype (authoritative implementation for design tokens and components).
- **Flowcharts app** (`apps/flowcharts`) — UX workflow documentation and staging for Figma export (can embed the prototype).
- **Docs app** (`apps/docs`) — interactive component catalog (`ComponentLibraryDocs`; migrated from prototype `/new-components`).
- **Plugin marketplace** (`apps/plugin-marketplace`) — separate Vite app (see workspace `package.json` scripts).

**Design system:** [`OpenHands-Design/DESIGN.md`](./OpenHands-Design/DESIGN.md) documents tokens, patterns, and primitives aligned with `apps/prototype`. The portable `OpenHands-Design/` folder is mirrored into `packages/openhands-design/template/` via `npm run sync:openhands-design-template`. **Light mode is not product-ready** — the prototype ships **dark mode only**.

Shared packages:

- **UI** (`packages/ui`) — re-exports primitives from `apps/prototype` (Button, Input, SearchInput, table helpers, `cn`).

## Local Development

Install dependencies once from the repo root:

```bash
npm install
```

Start each app:

```bash
npm run dev:prototype
npm run dev:flowcharts
npm run dev:docs
npm run dev:plugin-marketplace
```

Default ports:

- Prototype: `http://localhost:3000`
- Flowcharts: `http://localhost:3001`
- Docs: `http://localhost:3002`

The plugin marketplace app also defaults to port **3002** in its Vite config, so run it alone or override the port if docs is already running.

## Flowcharts Embeds

The Flowcharts app embeds the Prototype app for frame previews. You can override the Prototype base URL with:

```
VITE_MAIN_APP_URL=http://localhost:3000/
```

## Figma Export Notes

For capture/export flows that use `#figmacapture=...`, routes can be passed via the `captureRoute` query parameter (e.g., `?captureRoute=flows/new-user-experience`) so the hash is preserved for capture.

## Repository Layout

```
apps/
  prototype/   # Main OpenHands prototype app
  flowcharts/  # UX workflow documentation app
  docs/        # Component library / docs app
packages/
  ui/          # Shared UI exports
```
