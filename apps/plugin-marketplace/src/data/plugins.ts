export type MarketplacePlugin = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  /** 0–5 */
  rating: number;
  reviewCount: number;
  author: string;
  repoUrl: string;
  /** Semver string shown on list cards (e.g. 1.2.0). */
  version?: string;
  /** When true, listed in the Featured section on the marketplace home. */
  featured?: boolean;
};

export const MOCK_USER_NAME = 'Foo Foo';

export const PLUGINS: MarketplacePlugin[] = [
  {
    id: 'add-skill',
    name: 'add-skill',
    description:
      'Add (import) an OpenHands skill from a GitHub repository into the current workspace.',
    tags: ['skill', 'import', 'github', 'sparse-checkout'],
    rating: 5,
    reviewCount: 12,
    author: 'OpenHands',
    repoUrl: 'https://github.com/OpenHands/extensions',
    version: '1.4.2',
    featured: true,
  },
  {
    id: 'agent-memory',
    name: 'agent-memory',
    description: 'Persistent memory helpers for long-running agent sessions and recall across turns.',
    tags: ['memory', 'agent', 'persistence'],
    rating: 5,
    reviewCount: 8,
    author: 'OpenHands',
    repoUrl: 'https://github.com/OpenHands/extensions',
    version: '2.0.1',
    featured: true,
  },
  {
    id: 'azure-devops',
    name: 'azure-devops',
    description: 'Integrate with Azure DevOps boards, repos, and pipelines from your workspace.',
    tags: ['azure', 'git', 'ci', 'devops'],
    rating: 4,
    reviewCount: 5,
    author: 'OpenHands',
    repoUrl: 'https://github.com/OpenHands/extensions',
    version: '0.9.3',
    featured: true,
  },
  {
    id: 'babysit-pr',
    name: 'babysit-pr',
    description:
      'Babysit a GitHub pull request by monitoring CI checks, workflow runs, review comments, and mergeability until it lands.',
    tags: ['github', 'pull-request', 'ci', 'actions', 'review', 'monitoring'],
    rating: 0,
    reviewCount: 0,
    author: 'OpenHands',
    repoUrl: 'https://github.com/OpenHands/extensions',
    version: '1.0.0',
  },
  {
    id: 'magic-test',
    name: 'magic-test',
    description:
      'A simple test plugin for verifying plugin loading. Triggers on magic words (alakazam, abracadabra) and returns a specific phrase to confirm plugins are working.',
    tags: ['test', 'magic', 'plugin', 'verification', 'sample'],
    rating: 0,
    reviewCount: 0,
    author: 'OpenHands',
    repoUrl: 'https://github.com/OpenHands/extensions/tree/main',
    version: '0.1.0',
  },
];

export function getPluginById(id: string): MarketplacePlugin | undefined {
  return PLUGINS.find((p) => p.id === id);
}

export function getFeaturedPlugins(): MarketplacePlugin[] {
  return PLUGINS.filter((p) => p.featured);
}
