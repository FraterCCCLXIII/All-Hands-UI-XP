import { Spinner } from '../common/Spinner';

interface ChatGPTConnectSectionProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ChatGPTConnectSection({
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
}: ChatGPTConnectSectionProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-[680px]">
      {!isConnected && (
        <div className="flex items-center gap-3 w-full">
          <span className="flex-1 h-px bg-border" aria-hidden />
          <span className="text-sm text-muted-foreground uppercase tracking-wide">OR</span>
          <span className="flex-1 h-px bg-border" aria-hidden />
        </div>
      )}
      {isConnected && (
        <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
          <span className="text-foreground">ChatGPT connected</span>
          <button
            type="button"
            onClick={onDisconnect}
            className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
      {!isConnected && (
        <button
          type="button"
          disabled={isConnecting}
          onClick={onConnect}
          className="h-10 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <Spinner className="w-5 h-5 shrink-0" color="border-t-primary-foreground" />
          ) : (
            'Connect with ChatGPT'
          )}
        </button>
      )}
    </div>
  );
}
