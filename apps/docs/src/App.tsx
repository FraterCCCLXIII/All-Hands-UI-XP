import React from 'react';
import { Button, Input, SearchInput } from '@all-hands/ui';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground px-8 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Component Library</h1>
          <p className="text-sm text-muted-foreground">
            Staging area for UI components and states for export to Figma.
          </p>
        </header>

        <section className="rounded-lg border border-border bg-card/40 p-6">
          <h2 className="text-sm font-semibold text-foreground">Buttons</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card/40 p-6">
          <h2 className="text-sm font-semibold text-foreground">Inputs</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input placeholder="Name" />
            <Input placeholder="Email" />
            <SearchInput value="" onValueChange={() => {}} placeholder="Search" size="sm" />
            <Input placeholder="Disabled" disabled />
          </div>
        </section>
      </div>
    </div>
  );
}
