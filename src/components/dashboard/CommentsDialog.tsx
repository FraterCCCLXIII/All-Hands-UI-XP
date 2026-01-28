import { MessagesSquare } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
];

export function CommentsDialog({ count }: { count: number }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-xs text-foreground bg-transparent hover:bg-muted/70 hover:border-border transition-colors"
          aria-label="View comments"
          onClick={(event) => event.stopPropagation()}
        >
          <MessagesSquare className="h-3 w-3" />
          <span>{count}</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="text-2xl">Comments</DialogTitle>
          <p className="text-sm text-muted-foreground">Recent chat feedback; scroll to see more.</p>
        </DialogHeader>
        <div className="space-y-3">
          <div className="max-h-[300px] overflow-y-auto rounded-lg border border-border bg-muted/60 p-3 shadow-inner">
            <div className="divide-border divide-y">
              {comments.map((comment, index) => (
                <article key={comment.id} className={`py-3 ${index === comments.length - 1 ? 'pb-0' : ''}`}>
                  <p className="text-sm text-foreground">{comment.text}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-muted-foreground">{comment.author}</span>
                    <span>{comment.date}</span>
                    <div className="flex items-center gap-2">
                      <button className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted/70">
                        View Comment
                      </button>
                      <button className="rounded-full border border-transparent bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent hover:bg-accent/20">
                        Fix
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4 flex items-center justify-between gap-3">
          <DialogClose asChild>
            <button className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80">
              Close
            </button>
          </DialogClose>
          <button className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:brightness-95">
            Fix
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
