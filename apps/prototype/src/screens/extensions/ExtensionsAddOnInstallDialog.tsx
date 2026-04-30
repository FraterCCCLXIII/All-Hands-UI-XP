import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

export type ExtensionsAddOnInstallDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExtensionsAddOnInstallDialog({ open, onOpenChange }: ExtensionsAddOnInstallDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Install Add-on</DialogTitle>
          <DialogDescription>
            We need more specification for how add-ons should work before the install flow can be implemented.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Please define the add-on package format, installation source, permissions, configuration steps, and how users
          should manage installed add-ons.
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="default" size="sm">
              Got it
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
