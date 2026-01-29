/**
 * Data for the Skills page: repository/task list and detail content.
 */

export interface SkillRepositoryItem {
  id: string;
  repo: string;
  title: string;
  /** Display name for the skill (sidebar and main title). Use when title is the repo name. */
  skillName?: string;
  repoUrl: string;
  description: string;
  initialPrompt: string;
  curlCommand: string;
  docTitle: string;
  conversationCount?: number;
  /** Marketplace card metadata */
  stars?: number;
  reviews?: number;
  forks?: number;
  updatedAt?: string;
  category?: string;
}

/** Categories for the Skills Market (slug, display name, export count). */
export const marketplaceCategories = [
  { slug: 'tools', name: 'Tools', exports: 35466 },
  { slug: 'development', name: 'Development', exports: 30981 },
  { slug: 'data-ai', name: 'Data & AI', exports: 20454 },
  { slug: 'business', name: 'Business', exports: 19598 },
  { slug: 'devops', name: 'DevOps', exports: 17031 },
  { slug: 'testing-security', name: 'Testing & Security', exports: 12904 },
  { slug: 'content-media', name: 'Content & Media', exports: 9316 },
  { slug: 'documentation', name: 'Documentation', exports: 9089 },
  { slug: 'research', name: 'Research', exports: 4854 },
  { slug: 'databases', name: 'Databases', exports: 2285 },
  { slug: 'lifestyle', name: 'Lifestyle', exports: 1860 },
  { slug: 'blockchain', name: 'Blockchain', exports: 1318 },
] as const;

/** Node in the skill repo folder tree. */
export interface RepoTreeNode {
  name: string;
  type: 'folder' | 'file';
  children?: RepoTreeNode[];
  /** File content shown when this file is opened. */
  content?: string;
}

/** Default folder structure and file contents for the skill detail panel. */
export const skillRepoTree: RepoTreeNode[] = [
  {
    name: 'examples',
    type: 'folder',
    children: [
      {
        name: 'tutorials',
        type: 'folder',
        children: [
          {
            name: '01_hello.py',
            type: 'file',
            content: `# Minimal run example
def main():
    print("Hello from tutorial 01")
`,
          },
          { name: '02_navigation.py', type: 'file', content: '# Navigation example\n' },
          { name: '03_forms.py', type: 'file', content: '# Forms example\n' },
          {
            name: 'README.md',
            type: 'file',
            content: '# Tutorials\n\nProgressive tutorial series.\n',
          },
        ],
      },
    ],
  },
  {
    name: 'Plugin.json',
    type: 'file',
    content: `# Improve Developer Onboarding and Examples

## Overview
This plan addresses gaps in developer onboarding by improving documentation and adding progressive tutorials.

## Current State Analysis
**Strengths:** Good quickstart documentation, extensive examples.
**Gaps Identified:** No progressive tutorial series, limited troubleshooting documentation.

## Proposed Improvements
### 1. Create Interactive Tutorial Series
**Key Features:** Each file 50–80 lines max, extensive inline comments.
`,
  },
  {
    name: 'README.md',
    type: 'file',
    content: '# Skill repository\n\nLorem ipsum dolor sit amet.\n',
  },
];

/** Marketplace skills (catalog) – different from skills in a user's repos. */
export const marketplaceSkills: SkillRepositoryItem[] = [
  {
    id: 'marketplace-code-review',
    repo: 'skills/code-review',
    title: 'Code Review',
    skillName: 'Code Review',
    repoUrl: 'https://github.com/skills/code-review',
    description: 'Review code for quality, security, and best practices. Get structured feedback and suggestions.',
    initialPrompt: 'Analyze this codebase for potential issues, security concerns, and improvement opportunities.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "code-review", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 420,
    reviews: 32,
    forks: 58,
    updatedAt: '2024-01-22',
    category: 'Development',
  },
  {
    id: 'marketplace-docs',
    repo: 'skills/documentation',
    title: 'Documentation',
    skillName: 'Documentation',
    repoUrl: 'https://github.com/skills/documentation',
    description: 'Generate and improve documentation from your code and comments.',
    initialPrompt: 'Generate clear documentation for this project. Include setup, usage, and API overview.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "documentation", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 256,
    reviews: 19,
    forks: 31,
    updatedAt: '2024-01-18',
    category: 'Documentation',
  },
  {
    id: 'marketplace-security',
    repo: 'skills/security-audit',
    title: 'Security Audit',
    skillName: 'Security Audit',
    repoUrl: 'https://github.com/skills/security-audit',
    description: 'Scan for security vulnerabilities and compliance issues.',
    initialPrompt: 'Run a security audit on this repository. Flag vulnerabilities and suggest remediations.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "security-audit", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 189,
    reviews: 14,
    forks: 27,
    updatedAt: '2024-01-15',
    category: 'Testing & Security',
  },
  {
    id: 'marketplace-test-gen',
    repo: 'skills/test-generation',
    title: 'Test Generation',
    skillName: 'Test Generation',
    repoUrl: 'https://github.com/skills/test-generation',
    description: 'Generate unit and integration tests from your code.',
    initialPrompt: 'Generate test cases for this code. Cover edge cases and main flows.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "test-generation", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 98,
    reviews: 8,
    forks: 12,
    updatedAt: '2024-01-12',
    category: 'Testing & Security',
  },
  {
    id: 'marketplace-refactor',
    repo: 'skills/refactor',
    title: 'Refactor Assistant',
    skillName: 'Refactor Assistant',
    repoUrl: 'https://github.com/skills/refactor',
    description: 'Suggest and apply refactors for clarity and maintainability.',
    initialPrompt: 'Suggest refactors for this code. Focus on readability and maintainability.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "refactor", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 167,
    reviews: 11,
    forks: 19,
    updatedAt: '2024-01-14',
    category: 'Tools',
  },
  {
    id: 'marketplace-migrate',
    repo: 'skills/migrate',
    title: 'Migration Helper',
    skillName: 'Migration Helper',
    repoUrl: 'https://github.com/skills/migrate',
    description: 'Plan and execute framework or dependency migrations.',
    initialPrompt: 'Create a migration plan from the current stack to the target. Include steps and risks.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "migrate", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 221,
    reviews: 16,
    forks: 38,
    updatedAt: '2024-01-19',
    category: 'DevOps',
  },
  {
    id: 'marketplace-deps',
    repo: 'skills/dependency-audit',
    title: 'Dependency Audit',
    skillName: 'Dependency Audit',
    repoUrl: 'https://github.com/skills/dependency-audit',
    description: 'Audit dependencies for outdated packages, vulnerabilities, and license compliance.',
    initialPrompt: 'Audit this project\'s dependencies. Report outdated packages and security issues.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "dependency-audit", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 76,
    reviews: 6,
    forks: 9,
    updatedAt: '2024-01-10',
    category: 'Development',
  },
  {
    id: 'marketplace-pr-description',
    repo: 'skills/pr-description',
    title: 'PR Description',
    skillName: 'PR Description',
    repoUrl: 'https://github.com/skills/pr-description',
    description: 'Generate pull request descriptions from diffs and commit history.',
    initialPrompt: 'Generate a PR description for these changes. Include summary and checklist.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "pr-description", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 134,
    reviews: 9,
    forks: 15,
    updatedAt: '2024-01-16',
    category: 'Documentation',
  },
  {
    id: 'marketplace-changelog',
    repo: 'skills/changelog',
    title: 'Changelog Generator',
    skillName: 'Changelog Generator',
    repoUrl: 'https://github.com/skills/changelog',
    description: 'Generate changelogs from commits, tags, and PRs.',
    initialPrompt: 'Generate a changelog for the latest release. Group by type and highlight breaking changes.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "changelog", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 203,
    reviews: 15,
    forks: 24,
    updatedAt: '2024-01-17',
    category: 'Tools',
  },
  {
    id: 'marketplace-api-design',
    repo: 'skills/api-design',
    title: 'API Design Review',
    skillName: 'API Design Review',
    repoUrl: 'https://github.com/skills/api-design',
    description: 'Review and suggest improvements for API design and consistency.',
    initialPrompt: 'Review this API design. Suggest improvements for consistency and developer experience.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "api-design", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 178,
    reviews: 12,
    forks: 21,
    updatedAt: '2024-01-13',
    category: 'Tools',
  },
  {
    id: 'marketplace-performance',
    repo: 'skills/performance',
    title: 'Performance Analysis',
    skillName: 'Performance Analysis',
    repoUrl: 'https://github.com/skills/performance',
    description: 'Analyze code for performance bottlenecks and optimization opportunities.',
    initialPrompt: 'Analyze this code for performance. Identify bottlenecks and suggest optimizations.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "performance", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 145,
    reviews: 10,
    forks: 18,
    updatedAt: '2024-01-11',
    category: 'Tools',
  },
  {
    id: 'marketplace-accessibility',
    repo: 'skills/accessibility',
    title: 'Accessibility Check',
    skillName: 'Accessibility Check',
    repoUrl: 'https://github.com/skills/accessibility',
    description: 'Check UI and markup for accessibility issues and WCAG compliance.',
    initialPrompt: 'Audit this code for accessibility. Flag issues and suggest fixes for WCAG compliance.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "accessibility", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 112,
    reviews: 7,
    forks: 14,
    updatedAt: '2024-01-09',
    category: 'Tools',
  },
  {
    id: 'marketplace-i18n',
    repo: 'skills/i18n',
    title: 'Internationalization',
    skillName: 'Internationalization',
    repoUrl: 'https://github.com/skills/i18n',
    description: 'Add or review internationalization and localization in your app.',
    initialPrompt: 'Review i18n in this project. Suggest improvements and extract hardcoded strings.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "i18n", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 89,
    reviews: 5,
    forks: 11,
    updatedAt: '2024-01-08',
    category: 'Tools',
  },
  {
    id: 'marketplace-db-schema',
    repo: 'skills/db-schema',
    title: 'Database Schema Review',
    skillName: 'Database Schema Review',
    repoUrl: 'https://github.com/skills/db-schema',
    description: 'Review database schemas and migrations for best practices and performance.',
    initialPrompt: 'Review this database schema. Suggest indexes, constraints, and migration improvements.',
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "db-schema", "repo": "<your-repo>"}'`,
    docTitle: 'README.md',
    stars: 67,
    reviews: 4,
    forks: 8,
    updatedAt: '2024-01-07',
    category: 'Databases',
  },
];

export const skillRepositoryItems: SkillRepositoryItem[] = [
  {
    id: 'orbit234-sudoku',
    repo: 'orbit234/sudoku',
    title: 'orbit234/sudoku',
    skillName: 'Get started',
    repoUrl: 'https://github.com/orbit234/sudoku',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    initialPrompt: `Analyzed Browser-Use's current documentation and examples. This plan addresses gaps in developer onboarding and provides a clear path for new users to get started.`,
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "update-readme", "repo": "orbit234/sudoku"}'`,
    docTitle: 'Plugin.json',
    conversationCount: 1,
  },
  {
    id: 'update-readme',
    repo: 'orbit234/sudoku',
    title: 'Update Readme',
    repoUrl: 'https://github.com/user/repo',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    initialPrompt: `Analyzed Browser-Use's current documentation and examples. This plan addresses gaps in developer onboarding and provides a clear path for new users to get started.`,
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "update-readme", "repo": "orbit234/sudoku"}'`,
    docTitle: 'Plugin.json',
    conversationCount: 1,
  },
  {
    id: 'acme-backend',
    repo: 'acme/backend-api',
    title: 'acme/backend-api',
    skillName: 'Code Review',
    repoUrl: 'https://github.com/acme/backend-api',
    description:
      'Backend API service with authentication and rate limiting. Lorem ipsum dolor sit amet.',
    initialPrompt: `Review the API design for consistency and security. Suggest improvements for error handling and validation.`,
    curlCommand: `curl -X POST https://api.example.com/skills/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"skillId": "code-review", "repo": "acme/backend-api"}'`,
    docTitle: 'README.md',
    conversationCount: 2,
  },
];
