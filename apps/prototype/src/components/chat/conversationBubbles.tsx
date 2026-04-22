import * as React from 'react';

import { cn } from '../../lib/utils';

/** User bubble — matches `UserMessage` in ChatComponentsScreen. */
export function ConversationUserBubble({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'relative flex w-fit max-w-full flex-col gap-2 self-end rounded-xl bg-muted p-3 text-sm',
        className
      )}
    >
      {children}
    </article>
  );
}

/** Agent / assistant bubble — matches `AgentMessage` in ChatComponentsScreen. */
export function ConversationAgentBubble({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'relative mt-2 flex w-full max-w-full flex-col gap-2 rounded-xl bg-transparent text-sm last:mb-4',
        className
      )}
    >
      {children}
    </article>
  );
}
