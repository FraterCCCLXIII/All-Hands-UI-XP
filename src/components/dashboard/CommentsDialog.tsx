import { MessagesSquare } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const comments = [
  {
    id: 1,
    text: 'Lorem ipsum dolor sit amet consectetur sit amet consectetur sit amet consectetur sit amet... View More',
    author: 'highroller123',
    date: 'Apr 26',
  },
  {
    id: 2,
    text: 'Lorem ipsum dolor sit amet consectetur sit amet consectetur sit amet.',
    author: 'highroller123',
    date: 'Apr 26',
  },
  {
    id: 3,
    text: 'Lorem ipsum dolor sit amet consectetur sit amet consectetur sit amet consectetur sit amet consectetur sit amet.',
    author: 'highroller123',
    date: 'Apr 26',
  },
  {
    id: 4,
    text: 'Another comment on the implementation. Consider refactoring the hook to reduce re-renders.',
    author: 'devuser',
    date: 'Apr 25',
  },
  {
    id: 5,
    text: 'The types could be exported from a shared module for consistency across the app.',
    author: 'highroller123',
    date: 'Apr 25',
  },
  {
    id: 6,
    text: 'Nice work on the accessibility improvements. The focus order looks correct now.',
    author: 'reviewer42',
    date: 'Apr 24',
  },
  {
    id: 7,
    text: 'Should we add error boundaries around this component? Worth discussing in the next sync.',
    author: 'highroller123',
    date: 'Apr 24',
  },
  {
    id: 8,
    text: 'Minor: the loading state could use a skeleton to match the rest of the dashboard.',
    author: 'devuser',
    date: 'Apr 23',
  },
  {
    id: 9,
    text: 'Approved pending the CI fix. Let me know when the checks are green.',
    author: 'reviewer42',
    date: 'Apr 23',
  },
  {
    id: 10,
    text: 'Last one for the list — this should make the modal scrollable as requested.',
    author: 'highroller123',
    date: 'Apr 22',
  },
];

interface CommentsDialogProps {
  count: number;
  trigger?: React.ReactNode;
}

export function CommentsDialog({ count, trigger }: CommentsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-xs text-foreground bg-transparent hover:bg-muted/70 hover:border-border transition-colors"
            aria-label="View comments"
            onClick={(event) => event.stopPropagation()}
          >
            <MessagesSquare className="h-3 w-3" />
            <span>{count}</span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl p-0 gap-0">
        <div className="flex min-h-0 max-h-[80vh] flex-col">
          <DialogHeader className="text-left px-6 pt-6 pb-4">
            <DialogTitle className="text-2xl">Comments</DialogTitle>
          </DialogHeader>
          <div className="repo-dropdown-scroll flex-1 overflow-y-auto border-y border-border bg-muted/60 pl-6 pr-3 py-3 shadow-inner min-h-0">
            <div className="divide-border divide-y">
              {comments.map((comment, index) => (
                <article key={comment.id} className={`py-3 ${index === comments.length - 1 ? 'pb-0' : ''}`}>
                  <p className="text-sm text-foreground">{comment.text}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>
                      <span className="font-semibold text-muted-foreground">{comment.author}</span>
                      <span className="mx-1.5" aria-hidden>•</span>
                      <span>{comment.date}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="rounded-[4px] border border-border px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted/70">
                        View Comment
                      </button>
                      <button className="rounded-[4px] border border-transparent bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent hover:bg-accent/20">
                        Fix
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="border-t border-border px-6 py-4 flex items-center justify-start gap-2 bg-black">
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Fix all
              </button>
            </DialogClose>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
              >
                Close
              </button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
