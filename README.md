# All Hands UI XP

Monorepo containing three apps:

- **Prototype app** (`apps/prototype`) — the main OpenHands prototype UI.
- **Flowcharts app** (`apps/flowcharts`) — UX workflow documentation and staging for Figma export.
- **Docs app** (`apps/docs`) — component library and documentation staging.

Shared packages:

- **UI** (`packages/ui`) — shared UI exports (currently re-exported from the prototype app).

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
```

Default ports:

- Prototype: `http://localhost:3000`
- Flowcharts: `http://localhost:3001`
- Docs: `http://localhost:3002`

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
