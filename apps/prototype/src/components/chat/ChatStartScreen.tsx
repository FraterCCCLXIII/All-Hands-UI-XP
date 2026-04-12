import { FileText, Merge, Package, TestTube } from 'lucide-react';

const suggestions = [
  { id: 'tests', label: 'Increase test coverage', icon: TestTube },
  { id: 'merge', label: 'Auto-merge PRs', icon: Merge },
  { id: 'readme', label: 'Fix README', icon: FileText },
  { id: 'deps', label: 'Clean dependencies', icon: Package },
];

export function ChatStartScreen() {
  return (
    <div
      data-testid="chat-suggestions"
      className="absolute top-0 left-0 right-0 bottom-[80px] flex flex-col items-center justify-center pointer-events-auto"
    >
      <div className="flex flex-col items-center p-4 rounded-xl w-full">
        <div className="flex flex-col items-center text-center">
          <span className="text-2xl md:text-3xl font-semibold text-foreground pb-6">Let&apos;s start building!</span>
        </div>
        <div data-testid="suggestions" className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-fit">
          {suggestions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="list-none border border-border/70 rounded-xl hover:bg-muted/60 flex-1 flex items-center justify-center cursor-pointer gap-2 h-[55px] px-4"
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span data-testid="suggestion" className="text-sm font-normal leading-5 text-muted-foreground text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
