import { useState } from 'react';
import { Button } from '../components/ui/button';
import { StartNewConversationDialog } from '../components/chat/StartNewConversationDialog';

/**
 * Prototype: modal to start a conversation with optional initial message and optional linked repos.
 * Reuses repository chip + add dialog from automations (`RepositoryTargetsBubbleField`).
 */
export function StartNewConversationModalScreen() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-xl font-semibold text-foreground">Start New Conversation Modal</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Prototype shell: you may add an optional initial message and link one or more repositories (same
          components as Create Automation).
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => setModalOpen(true)}>
          Open modal
        </Button>
      </div>

      <StartNewConversationDialog open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
