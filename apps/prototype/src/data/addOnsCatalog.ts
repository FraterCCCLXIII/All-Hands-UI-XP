export type AddOnCatalogEntry = {
  id: string;
  name: string;
  description: string;
};

export const addOnCatalogEntries: AddOnCatalogEntry[] = [
  {
    id: 'review-studio',
    name: 'Review Studio',
    description: 'Extend OpenHands with richer pull-request review tools, policy checks, and merge readiness workflows.',
  },
  {
    id: 'incident-command-center',
    name: 'Incident Command Center',
    description: 'Add an incident response workspace with alert intake, postmortems, and on-call collaboration flows.',
  },
  {
    id: 'frontend-lab',
    name: 'Frontend Lab',
    description: 'Bring accessibility, i18n, SEO, and visual QA experiences into OpenHands for frontend teams.',
  },
  {
    id: 'maintenance-hub',
    name: 'Maintenance Hub',
    description: 'Extend routine upkeep with dependency upgrades, CVE triage, test optimization, and release prep.',
  },
];

export function addOnCatalogEntryMatchesQuery(entry: AddOnCatalogEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${entry.name} ${entry.description}`.toLowerCase().includes(q);
}
