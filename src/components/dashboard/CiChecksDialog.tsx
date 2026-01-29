import { Check, Circle, Minus, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface CiChecksDialogProps {
  count: number;
}

const statusFilters = [
  { id: 'failing', label: '1 Failing', icon: <X className="h-4 w-4 text-destructive" /> },
  { id: 'in-progress', label: '1 In Progress', icon: <Circle className="h-4 w-4 text-foreground" /> },
  { id: 'skipped', label: '1 Skipped', icon: <Minus className="h-4 w-4 text-warning" /> },
  { id: 'successful', label: '1 Successful', icon: <Check className="h-4 w-4 text-accent" /> },
];

const checks = [
  { id: 1, status: 'failing', label: 'Lorem ipsum dolor sit amet consectetur sit amet' },
  { id: 2, status: 'in-progress', label: 'Lorem ipsum dolor sit amet consectetur sit amet' },
  { id: 3, status: 'skipped', label: 'Lorem ipsum dolor sit amet consectetur sit amet' },
  { id: 4, status: 'successful', label: 'Lorem ipsum dolor sit amet consectetur sit amet' },
];

export function CiChecksDialog({ count }: CiChecksDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-xs text-foreground bg-transparent hover:bg-muted/70 hover:border-border transition-colors"
          aria-label="View CI check results"
          onClick={(event) => event.stopPropagation()}
        >
          <Check className="h-3 w-3" />
          <span>{count}</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="text-2xl">CI Checks</DialogTitle>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((status) => (
              <span
                key={status.id}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {status.icon}
                {status.label}
              </span>
            ))}
          </div>
        </DialogHeader>

        <div className="mt-4 rounded-2xl border border-border bg-muted/60">
          {checks.map((check) => (
            <div
              key={check.id}
              className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0"
            >
              <div className="flex items-center gap-3 text-sm text-foreground">
                {check.status === 'failing' && <X className="h-4 w-4 text-destructive" />}
                {check.status === 'in-progress' && <Circle className="h-4 w-4 text-foreground" />}
                {check.status === 'skipped' && <Minus className="h-4 w-4 text-warning" />}
                {check.status === 'successful' && <Check className="h-4 w-4 text-accent" />}
                <span>{check.label}</span>
              </div>
              <button className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:bg-muted/80">
                Fix
              </button>
            </div>
          ))}
        </div>

        <DialogFooter className="mt-4 justify-end">
          <DialogClose asChild>
            <button className="h-10 flex items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted/80">
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
