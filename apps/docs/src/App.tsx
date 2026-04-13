import { ComponentLibraryDocs } from './ComponentLibraryDocs';

/**
 * Docs app: interactive component catalog (migrated from prototype `/new-components`).
 */
export default function App() {
  return (
    <div className="fixed inset-0 z-0 flex min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <ComponentLibraryDocs />
    </div>
  );
}
