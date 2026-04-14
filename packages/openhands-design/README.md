# openhands-design

CLI that adds **OpenHands-Design** (tokens, `DESIGN.md`, UI primitives, and the static catalog) to your project.

## Usage

From your **project root**:

```bash
npx openhands-design
```

This creates `./OpenHands-Design/` with `DESIGN.md`, `README.md`, `tailwind.config.js`, `src/`, `index.html`, etc.

If `./OpenHands-Design` already exists, pass **`--force`** to replace it:

```bash
npx openhands-design --force
```

## After install

Ask your AI assistant to use **`OpenHands-Design/DESIGN.md`** for UI work, and follow **`OpenHands-Design/README.md`** to wire up Tailwind and components.

## Development (this monorepo)

To refresh the bundled template after editing the root `OpenHands-Design/` folder:

```bash
npm run sync:openhands-design-template
```

Then publish from `packages/openhands-design` when ready.
