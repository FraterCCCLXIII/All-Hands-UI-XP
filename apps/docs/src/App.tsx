import { ComponentLibraryScreen } from '../../prototype/src/screens/ComponentLibraryScreen';

/**
 * Mirrors the main app’s #/components view (prototype) so the docs app is a
 * standalone component library with the same layout and full catalog.
 *
 * The library relies on a definite height (`h-full` + flex `min-h-0`) so only
 * the main pane scrolls while the top and left rails stay put. Without a
 * viewport-sized wrapper, `#root` grows with content and the whole page scrolls.
 */
export default function App() {
  return (
    <div className="fixed inset-0 z-0 flex min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <ComponentLibraryScreen omitComponentIds={['navigation-left-nav']} />
    </div>
  );
}
