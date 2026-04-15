import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

export type InvitationAcceptModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called before the dialog closes when the user confirms. */
  onConfirm?: () => void;
};

export function InvitationAcceptModal({ open, onOpenChange, onConfirm }: InvitationAcceptModalProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <div data-testid="invitation-accept-modal" className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Join Organization</DialogTitle>
            <DialogDescription>
              You have been invited to join an organization. Would you like to accept this invitation?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 flex w-full flex-row gap-2 !justify-start sm:space-x-0">
            <Button
              type="button"
              size="sm"
              className="flex-1"
              data-testid="accept-invitation-button"
              onClick={handleConfirm}
            >
              Confirm
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              data-testid="cancel-invitation-button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
