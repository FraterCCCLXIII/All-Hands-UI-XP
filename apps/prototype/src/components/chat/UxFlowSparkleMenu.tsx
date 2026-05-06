import { ClipboardCheck, Plus, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export const UX_FLOW_PROTOTYPE_ENTRIES: { id: string; label: string; navAction: string }[] = [
  { id: 'old-chat-start', label: 'Old Chat Start', navAction: 'old-chat-start' },
  {
    id: 'launch-from-plugin-modal',
    label: 'Launch from plugin modal',
    navAction: 'launch-from-plugin-modal',
  },
  {
    id: 'start-new-conversation-modal',
    label: 'Start New Conversation Modal',
    navAction: 'start-new-conversation-modal',
  },
  { id: 'new-chat-start', label: 'New Chat Start', navAction: 'new-chat-start' },
  /** Archived home: `/chat-start` (legacy three-column landing). */
  { id: 'new-chat-start-2', label: 'New-Chat-Start-2', navAction: 'chat-start' },
  { id: 'chat-components', label: 'All Chat Components', navAction: 'chat-components' },
  { id: 'sign-in-with-ad', label: 'Sign in with ad', navAction: 'sign-in-with-ad' },
  { id: 'new-user-experience', label: 'New User Experience', navAction: 'new-user-experience' },
  { id: 'new-nux', label: 'New NUX', navAction: 'new-nux' },
  { id: 'saas-credit-card', label: 'SaaS - Require Credit Card for Free Credits', navAction: 'saas-credit-card' },
  {
    id: 'user-journey-cta',
    label: 'User Journey - Create in-app call-to-actions (CTAs)',
    navAction: 'code',
  },
  { id: 'new-llm-switcher', label: 'New LLM Switcher', navAction: 'new-llm-switcher' },
  { id: 'new-llm-switcher-2', label: 'New LLM Switcher 2', navAction: 'new-llm-switcher-2' },
  { id: 'loading-screen', label: 'Loading Screen', navAction: 'loading-screen' },
];

export interface UxFlowSparkleMenuProps {
  uxTourLinks: Array<{ id: string; label: string }>;
  onStartUxTour?: (tourId: string) => void;
  isUxFlowMenuOpen?: boolean;
  onUxFlowMenuOpenChange?: (open: boolean) => void;
  onPrototypeNavItemClick?: (action: string) => void;
  isInspectorEnabled?: boolean;
  onInspectorToggle?: () => void;
}

/**
 * UX tours + prototype links + inspector — fixed sparkles control.
 * Shown on chat-start landing and on the main `/chat` workspace route.
 */
export function UxFlowSparkleMenu({
  uxTourLinks,
  onStartUxTour,
  isUxFlowMenuOpen,
  onUxFlowMenuOpenChange,
  onPrototypeNavItemClick,
  isInspectorEnabled = false,
  onInspectorToggle,
}: UxFlowSparkleMenuProps) {
  return (
    <Popover open={isUxFlowMenuOpen} onOpenChange={onUxFlowMenuOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="fixed bottom-20 right-7 z-[60] shrink-0 outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-8 h-8 rounded-lg flex items-center justify-center bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent transition-colors border border-transparent hover:border-border"
          aria-label="UX flow tutorials"
          data-tour-id="left-nav.ux-flow-icon"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="end"
        sideOffset={8}
        className="bg-sidebar text-sidebar-foreground border border-border rounded-xl w-56 p-3"
      >
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          UX Flows
        </div>
        {uxTourLinks.length === 0 ? (
          <div className="px-3 py-2 text-xs text-muted-foreground">No UX tours available yet.</div>
        ) : (
          uxTourLinks.map((tour) => (
            <button
              key={tour.id}
              type="button"
              onClick={() => {
                onUxFlowMenuOpenChange?.(false);
                onStartUxTour?.(tour.id);
              }}
              className="inline-flex items-center gap-2 text-sm text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-2 transition-colors text-left"
            >
              {tour.label}
            </button>
          ))
        )}
        <div className="mt-3 border-t border-border pt-2">
          <div className="px-1 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">New chat</div>
          <button
            type="button"
            onClick={() => {
              onUxFlowMenuOpenChange?.(false);
              onPrototypeNavItemClick?.('blank-new-chat');
            }}
            className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-muted/60 hover:text-white"
          >
            <Plus className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            Blank new conversation
          </button>
        </div>
        <div className="mt-3 border-t border-border pt-2">
          <div className="px-1 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Setup</div>
          <button
            type="button"
            onClick={() => {
              onUxFlowMenuOpenChange?.(false);
              onPrototypeNavItemClick?.('onboarding');
            }}
            className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-muted/60 hover:text-white"
          >
            <ClipboardCheck className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            Onboarding
          </button>
        </div>
        <div className="mt-3 border-t border-border pt-2">
          <div className="px-1 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prototypes</div>
          {UX_FLOW_PROTOTYPE_ENTRIES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                onUxFlowMenuOpenChange?.(false);
                onPrototypeNavItemClick?.(entry.navAction);
              }}
              className="inline-flex items-center gap-2 text-sm text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-2 transition-colors text-left"
            >
              {entry.label}
            </button>
          ))}
        </div>
        <div className="mt-3 border-t border-border pt-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inspector mode</div>
              <div className="text-xs text-muted-foreground mt-1">Click any element to view code.</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isInspectorEnabled}
              data-testid="inspector-toggle"
              data-tour-id="left-nav.inspector-toggle"
              onClick={onInspectorToggle}
              className={`h-6 w-10 rounded-full border border-border flex items-center px-0.5 transition-colors ${
                isInspectorEnabled ? 'bg-foreground/80' : 'bg-muted/60'
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full bg-background shadow transition-transform ${
                  isInspectorEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
