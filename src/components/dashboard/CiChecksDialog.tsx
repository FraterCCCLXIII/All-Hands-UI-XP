import { Check, Circle, Minus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface CiChecksDialogProps {
  count: number;
  trigger?: React.ReactNode;
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
  { id: 5, status: 'successful', label: 'Unit tests — all passing' },
  { id: 6, status: 'failing', label: 'E2E integration test timeout' },
  { id: 7, status: 'in-progress', label: 'Build and deploy pipeline' },
  { id: 8, status: 'skipped', label: 'Lint (skipped in draft)' },
  { id: 9, status: 'successful', label: 'Type check' },
  { id: 10, status: 'successful', label: 'Bundle size report' },
];

export function CiChecksDialog({ count, trigger }: CiChecksDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-xs text-foreground bg-transparent hover:bg-muted/70 hover:border-border transition-colors"
            aria-label="View CI check results"
            onClick={(event) => event.stopPropagation()}
          >
            <Check className="h-3 w-3" />
            <span>{count}</span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl p-0 gap-0">
        <DialogHeader className="text-left space-y-2 px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">CI Checks</DialogTitle>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((status) => (
              <span
                key={status.id}
                className="inline-flex items-center gap-1 rounded-[4px] border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {status.icon}
                {status.label}
              </span>
            ))}
          </div>
        </DialogHeader>

        <div className="repo-dropdown-scroll max-h-[300px] overflow-y-auto border-y border-border bg-muted/60 pl-6 pr-3 py-3 shadow-inner">
          <div className="divide-border divide-y">
            {checks.map((check, index) => (
              <article
                key={check.id}
                className={`flex items-center justify-between gap-3 py-3 ${index === checks.length - 1 ? 'pb-0' : ''}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 text-sm text-foreground">
                  {check.status === 'failing' && <X className="h-4 w-4 shrink-0 text-destructive" />}
                  {check.status === 'in-progress' && <Circle className="h-4 w-4 shrink-0 text-foreground" />}
                  {check.status === 'skipped' && <Minus className="h-4 w-4 shrink-0 text-warning" />}
                  {check.status === 'successful' && <Check className="h-4 w-4 shrink-0 text-accent" />}
                  <span>{check.label}</span>
                </div>
                <button className="shrink-0 rounded-[4px] border border-transparent bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent hover:bg-accent/20">
                  Fix
                </button>
              </article>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
