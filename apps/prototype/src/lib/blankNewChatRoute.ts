/** Minimal new conversation: right canvases closed, header title cleared until workspace is set up. */
export const BLANK_NEW_CHAT_SEARCH = '?canvas=closed&setup=none';
export const BLANK_NEW_CHAT_ROUTE = `/chat${BLANK_NEW_CHAT_SEARCH}`;

/** New left-nav "New" opens a fresh `/chat` instance (unique URL so shell remounts). */
export function freshBlankNewChatRoute(): string {
  const p = new URLSearchParams();
  p.set('canvas', 'closed');
  p.set('setup', 'none');
  p.set('instance', `${Date.now()}`);
  return `/chat?${p.toString()}`;
}
