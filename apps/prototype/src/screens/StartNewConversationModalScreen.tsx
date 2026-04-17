import { useCallback, useMemo, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AddRepositoryTargetDialog,
  repositoryTargetKey,
  RepositoryTargetsBubbleField,
  type RepositoryTarget,
} from '../components/automation/repositoryTargetsField';
import { showAppToast } from '../lib/appToast';

const DEMO_REPO_OPTIONS = [
  'acme/frontend-app',
  'acme/design-system',
  'acme/backend-api',
  'FraterCCCLXIII/openhands',
];

const DEMO_BRANCH_OPTIONS = ['main', 'develop', 'release/v1.2.0', 'feature/kanban-drawer'];

/**
 * Prototype: modal to start a conversation with optional initial message and optional linked repos.
 * Reuses repository chip + add dialog from automations (`RepositoryTargetsBubbleField`).
 */
export function StartNewConversationModalScreen() {
  const [modalOpen, setModalOpen] = useState(true);
  const [initialMessage, setInitialMessage] = useState('');
  const [repoTargets, setRepoTargets] = useState<RepositoryTarget[]>([]);
  const [addRepoOpen, setAddRepoOpen] = useState(false);

  const repoOptions = useMemo(() => DEMO_REPO_OPTIONS, []);
  const branchOptions = useMemo(() => DEMO_BRANCH_OPTIONS, []);

  const handleSubmit = useCallback(() => {
    const reposSummary =
      repoTargets.length === 0
        ? 'no repositories linked'
        : repoTargets.map((t) => `${t.repository}@${t.branch}`).join(', ');
    const msgBit = initialMessage.trim()
      ? `message: ${initialMessage.trim().slice(0, 80)}${initialMessage.trim().length > 80 ? '…' : ''}`
      : 'no initial message';
    showAppToast({
      variant: 'success',
      message: `Conversation started (prototype): ${msgBit}; ${reposSummary}`,
    });
    setModalOpen(false);
  }, [initialMessage, repoTargets]);

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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg border-border sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" aria-hidden />
              Start conversation
            </DialogTitle>
            <DialogDescription>
              You may add an optional initial message and link one or more repositories.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            <div className="space-y-2">
              <label htmlFor="start-modal-initial-message" className="text-sm font-medium text-foreground">
                Initial message (optional)
              </label>
              <textarea
                id="start-modal-initial-message"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                rows={4}
                placeholder="What should the agent do first?"
                className="w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60"
              />
            </div>

            <RepositoryTargetsBubbleField
              targets={repoTargets}
              onRemove={(target) =>
                setRepoTargets((prev) =>
                  prev.filter((item) => repositoryTargetKey(item) !== repositoryTargetKey(target))
                )
              }
              onRequestAdd={() => setAddRepoOpen(true)}
              label="Linked repositories (optional)"
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Start conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddRepositoryTargetDialog
        open={addRepoOpen}
        onOpenChange={setAddRepoOpen}
        existingTargets={repoTargets}
        onAdd={(target) => setRepoTargets((prev) => [...prev, target])}
        repoOptions={repoOptions}
        branchOptions={branchOptions}
        title="Link repository"
        description="Choose a repository and branch to associate with this run. You can add more than one."
      />
    </div>
  );
}
