import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

interface ConversationMetrics {
  totalCost: number;
  budgetLimit: number | null;
  inputTokens: number;
  cacheHitTokens: number;
  cacheWriteTokens: number;
  outputTokens: number;
  contextWindowUsed: number;
  contextWindowMax: number;
}

const MOCK_METRICS: ConversationMetrics = {
  totalCost: 0.2499,
  budgetLimit: null,
  inputTokens: 92371,
  cacheHitTokens: 58658,
  cacheWriteTokens: 33711,
  outputTokens: 395,
  contextWindowUsed: 18340,
  contextWindowMax: 200000,
};

function formatTokens(n: number): string {
  return n.toLocaleString('en-US');
}

function formatCost(n: number): string {
  return `$${n.toFixed(4)}`;
}

interface ConversationMetricsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConversationMetricsModal({ open, onOpenChange }: ConversationMetricsModalProps) {
  const m = MOCK_METRICS;
  const totalTokens = m.inputTokens + m.outputTokens;
  const contextPct = m.contextWindowMax > 0
    ? (m.contextWindowUsed / m.contextWindowMax) * 100
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="conversation-metrics-modal"
        className="flex flex-col gap-6 w-[min(384px,95vw)] max-w-none"
      >
        <DialogTitle className="text-xl font-semibold leading-6 -tracking-[0.01em]">
          Conversation Metrics
        </DialogTitle>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="grid gap-3">

            {/* Total cost */}
            <div className="flex justify-between items-center pb-2">
              <span className="text-lg font-semibold">Total Cost</span>
              <span className="font-semibold">{formatCost(m.totalCost)}</span>
            </div>

            {/* Budget limit */}
            <div className="border-b border-border pb-2">
              <span className="text-xs text-muted-foreground">
                {m.budgetLimit === null ? 'No budget limit' : `Budget limit: ${formatCost(m.budgetLimit)}`}
              </span>
            </div>

            {/* Input */}
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span>Input:</span>
              <span className="font-semibold">{formatTokens(m.inputTokens)}</span>
            </div>

            {/* Cache breakdown */}
            <div className="grid grid-cols-2 gap-2 pl-4 text-sm">
              <span className="text-muted-foreground">Cache Hit</span>
              <span className="text-right">{formatTokens(m.cacheHitTokens)}</span>
              <span className="text-muted-foreground">Cache Write</span>
              <span className="text-right">{formatTokens(m.cacheWriteTokens)}</span>
            </div>

            {/* Output */}
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span>Output:</span>
              <span className="font-semibold">{formatTokens(m.outputTokens)}</span>
            </div>

            {/* Total tokens */}
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="font-semibold">Total:</span>
              <span className="font-bold">{formatTokens(totalTokens)}</span>
            </div>

            {/* Context window */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Context Window</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-info transition-all duration-300 rounded-full"
                  style={{ width: `${contextPct}%` }}
                />
              </div>
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {formatTokens(m.contextWindowUsed)} / {formatTokens(m.contextWindowMax)}{' '}
                  ({contextPct.toFixed(2)}% used)
                </span>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
