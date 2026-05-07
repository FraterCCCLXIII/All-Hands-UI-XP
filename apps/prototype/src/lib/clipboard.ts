export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // In embedded browsers, calling `navigator.clipboard.writeText` when permission is denied
  // can surface a loud "permission denied" toast. Preflight via Permissions API when possible.
  try {
    const anyNav = navigator as unknown as { permissions?: { query: (p: { name: string }) => Promise<{ state: string }> } };
    const permissions = anyNav.permissions;
    if (permissions?.query) {
      const status = await permissions.query({ name: 'clipboard-write' });
      if (status?.state === 'denied') {
        return false;
      }
    }
  } catch {
    // Ignore and proceed to attempt copy.
  }

  // Prefer async clipboard when available and in a secure context.
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to legacy approach.
  }

  // Legacy fallback.
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function promptManualCopy(text: string) {
  if (typeof window === 'undefined') return;
  window.prompt('Copy this text (Cmd/Ctrl+C, then Enter):', text);
}

