/**
 * Prototype workspace switcher — mirrors Settings org selector.
 * Used by LeftNav and org-admin visibility.
 */
export const accountWorkspaceOptions = [
  { id: 'personal', name: 'Personal Account', role: null as string | null, type: 'personal' as const },
  { id: 'acme-owner', name: 'Acme Inc', role: 'Owner' as const, type: 'org' as const },
  { id: 'starlight-admin', name: 'Starlight Labs', role: 'Admin' as const, type: 'org' as const },
  { id: 'nova-member', name: 'Nova Group', role: 'Member' as const, type: 'org' as const },
] as const;

export type AccountWorkspaceOption = (typeof accountWorkspaceOptions)[number];

export function isOrgAdminOrOwner(workspaceId: string): boolean {
  const w = accountWorkspaceOptions.find((o) => o.id === workspaceId);
  if (!w || w.type !== 'org') return false;
  return w.role === 'Owner' || w.role === 'Admin';
}

export function getWorkspaceLabel(workspaceId: string): string {
  return accountWorkspaceOptions.find((o) => o.id === workspaceId)?.name ?? 'Workspace';
}
