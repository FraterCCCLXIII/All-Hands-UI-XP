import { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AddRepositoryTargetDialog,
  repositoryTargetKey,
  RepositoryTargetsBubbleField,
  type RepositoryTarget,
} from '../automation/repositoryTargetsField';
import { showAppToast } from '../../lib/appToast';
import { cn } from '../../lib/utils';

const DEMO_REPO_OPTIONS = [
  'acme/frontend-app',
  'acme/design-system',
  'acme/backend-api',
  'FraterCCCLXIII/All-Hands-UI-XP',
];

const DEMO_BRANCH_OPTIONS = ['main', 'develop', 'release/v1.2.0', 'feature/kanban-drawer'];

export type StartNewConversationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StartNewConversationDialog({ open, onOpenChange }: StartNewConversationDialogProps) {
  const [initialMessage, setInitialMessage] = useState('');
  const [repoTargets, setRepoTargets] = useState<RepositoryTarget[]>([]);
  const [addRepoOpen, setAddRepoOpen] = useState(false);
  const [openAfterStarting, setOpenAfterStarting] = useState(true);
  const [performAgentOnboarding, setPerformAgentOnboarding] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);

  const repoOptions = useMemo(() => DEMO_REPO_OPTIONS, []);
  const branchOptions = useMemo(() => DEMO_BRANCH_OPTIONS, []);

  const handleSubmit = useCallback(() => {
    const reposSummary =
      repoTargets.length === 0
        ? 'no repositories linked'
        : repoTargets.map((t) => `${t.repository}@${t.branch}`).join(', ');
    const msgBit = initialMessage.trim()
      ? `message: ${initialMessage.trim().slice(0, 80)}${initialMessage.trim().length > 80 ? '...' : ''}`
      : 'no initial message';
    showAppToast({
      variant: 'success',
      message: `Conversation started (prototype): ${msgBit}; ${reposSummary}; open after start: ${
        openAfterStarting ? 'yes' : 'no'
      }; onboarding: ${performAgentOnboarding ? 'yes' : 'no'}`,
    });
    onOpenChange(false);
  }, [initialMessage, onOpenChange, openAfterStarting, performAgentOnboarding, repoTargets]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg border-border sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Start conversation</DialogTitle>
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

            <div className="space-y-3">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-expanded={moreOptionsOpen}
                onClick={() => setMoreOptionsOpen((isOpen) => !isOpen)}
              >
                More Options
                <ChevronDown className={cn('h-4 w-4 transition-transform', moreOptionsOpen && 'rotate-180')} />
              </button>
              {moreOptionsOpen ? (
                <div className="space-y-3">
                  <label className="grid cursor-pointer grid-cols-[1rem_1fr] items-start gap-3 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={openAfterStarting}
                      onChange={(e) => setOpenAfterStarting(e.target.checked)}
                      className="mt-0.5 h-4 min-h-4 w-4 min-w-4 shrink-0 accent-primary"
                    />
                    <span className="leading-5">Open conversation after starting</span>
                  </label>
                  <label className="grid cursor-pointer grid-cols-[1rem_1fr] items-start gap-3 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={performAgentOnboarding}
                      onChange={(e) => setPerformAgentOnboarding(e.target.checked)}
                      className="mt-0.5 h-4 min-h-4 w-4 min-w-4 shrink-0 accent-primary"
                    />
                    <span className="leading-5">
                      Perform OpenHands Agent onboarding on repo (if not already enabled)
                    </span>
                  </label>
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
    </>
  );
}
