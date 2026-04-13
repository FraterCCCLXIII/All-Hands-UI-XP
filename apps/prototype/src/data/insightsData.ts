export const insightsRepositories = [
  { id: 'havok/chatrk', name: 'havok/chatrk', isActive: true },
  { id: 'fireman/hose', name: 'fireman/hose', isActive: true },
  { id: 'all-hands/openhands', name: 'all-hands/openhands', isActive: true },
  { id: 'orbit234/sudoku', name: 'orbit234/sudoku', isActive: true },
  { id: 'no-repo', name: 'No Repository' },
];

export const insightsRepoData = [
  {
    name: 'havok/chatrk',
    branches: [
      {
        name: 'add-dark-mode',
        prNumber: 124,
        prTitle: 'Add Dark Mode',
        status: 'open' as const,
        commitStatus: 'Ahead 2 Commits',
        conversations: [
          {
            id: '1',
            name: 'New Dark Mode',
            description: 'Updating the .tsx file',
            timestamp: '2 min ago',
            agentStatus: 'active' as const,
            isActive: true,
            commitStatus: 'Ahead 2 Commits',
          },
          {
            id: '2',
            name: 'New Dark Mode',
            description: 'Refactoring components',
            timestamp: '5 min ago',
            agentStatus: 'idle' as const,
            isActive: false,
            commitStatus: 'Ahead 2 Commits',
          },
          {
            id: '3',
            name: 'New Dark Mode',
            description: 'Testing the theme switcher',
            timestamp: '10 min ago',
            agentStatus: 'idle' as const,
            isActive: false,
            commitStatus: 'Ahead 2 Commits',
          },
        ],
      },
      {
        name: 'add-light-mode',
        status: 'error' as const,
        commitStatus: 'Behind 5 Commits',
        conversations: [
          {
            id: '4',
            name: 'Add Light Mode',
            description: 'Fixing regressions in the toggle',
            timestamp: '15 min ago',
            agentStatus: 'error' as const,
            isActive: true,
            commitStatus: 'Behind 5 Commits',
          },
        ],
      },
    ],
    stats: { prs: 2, commits: 3, messages: 4, agents: 4 },
  },
  {
    name: 'fireman/hose',
    branches: [
      {
        name: 'firehose',
        prNumber: 312,
        prTitle: 'Wire up telemetry',
        status: 'open' as const,
        commitStatus: 'Ahead 1 Commit',
        conversations: [
          {
            id: '5',
            name: 'Telemetry agents',
            description: 'Updating the analytics path',
            timestamp: '4 min ago',
            agentStatus: 'active' as const,
            isActive: true,
          },
        ],
      },
      {
        name: 'replay-stream',
        status: 'error' as const,
        commitStatus: 'Behind 3 Commits',
        conversations: [
          {
            id: '6',
            name: 'Replay stream',
            description: 'Fixing replay capture',
            timestamp: '12 min ago',
            agentStatus: 'idle' as const,
            isActive: false,
          },
          {
            id: '7',
            name: 'Replay stream',
            description: 'Verifying latency',
            timestamp: '3 min ago',
            agentStatus: 'active' as const,
            isActive: true,
          },
        ],
      },
    ],
    stats: { prs: 2, commits: 4, messages: 5, agents: 3 },
  },
  {
    name: 'all-hands/openhands',
    branches: [
      {
        name: 'release-candidate',
        prNumber: 218,
        prTitle: 'Ship release candidate',
        status: 'open' as const,
        commitStatus: 'Clean',
        conversations: [
          {
            id: '3',
            name: 'RC review',
            description: 'Validating deployment scripts',
            timestamp: '6 min ago',
            agentStatus: 'active' as const,
            isActive: true,
          },
          {
            id: '10',
            name: 'RC review',
            description: 'Double-checking config',
            timestamp: '11 min ago',
            agentStatus: 'idle' as const,
            isActive: false,
          },
        ],
      },
      {
        name: 'integration-tests',
        status: 'closed' as const,
        conversations: [
          {
            id: '11',
            name: 'Integration gate',
            description: 'Replaying failing suite',
            timestamp: '22 min ago',
            agentStatus: 'active' as const,
            isActive: true,
          },
          {
            id: '12',
            name: 'Integration gate',
            description: 'Analyzing results',
            timestamp: '35 min ago',
            agentStatus: 'idle' as const,
            isActive: false,
          },
        ],
      },
    ],
    stats: { prs: 1, commits: 6, messages: 3, agents: 2 },
  },
  {
    name: 'orbit234/sudoku',
    branches: [
      {
        name: 'gamepad-support',
        status: 'draft' as const,
        conversations: [
          {
            id: '4',
            name: 'Gamepad tweaks',
            description: 'Testing axis mapping',
            timestamp: '1 hr ago',
            agentStatus: 'idle' as const,
            isActive: false,
          },
          {
            id: '14',
            name: 'Gamepad tweaks',
            description: 'Fine-tuning sensitivity',
            timestamp: '5 min ago',
            agentStatus: 'active' as const,
            isActive: true,
          },
        ],
      },
    ],
    stats: { prs: 0, commits: 1, messages: 1, agents: 1 },
  },
  {
    name: 'No Repository',
    branches: [
      {
        name: 'Conversation Name',
        status: 'closed' as const,
        conversations: [
          {
            id: '13',
            name: 'Unassigned discussion',
            description: 'Checking bystanders',
            timestamp: '45 min ago',
            agentStatus: 'active' as const,
            isActive: true,
          },
        ],
      },
    ],
    stats: { prs: 0, commits: 2, messages: 2, agents: 0 },
  },
];

export const insightsPullRequests = [
  {
    id: '#12408',
    title: 'chore(deps-dev): bump eslint-plugin-prettier',
    repoDisplay: 'OpenHands/OpenHands',
    repoKey: 'all-hands/openhands',
    status: 'Open',
    author: 'dependabot',
    time: 'opened 6 hours ago',
    tasks: 'Review required · 0 of 1 tasks',
    comments: 2,
  },
  {
    id: '#12405',
    title: 'fix(frontend): show friendly message',
    repoDisplay: 'openhands/frontend',
    repoKey: 'all-hands/openhands',
    status: 'Changes requested',
    author: 'neubig',
    time: 'opened 20 hours ago',
    tasks: 'Changes requested · 2 of 4 tasks',
    comments: 3,
  },
  {
    id: '#12401',
    title: 'fix: prevent error messages from consuming entire view area',
    repoDisplay: 'openhands/frontend',
    repoKey: 'all-hands/openhands',
    status: 'Review required',
    author: 'js hackelford',
    time: 'opened 5 days ago',
    tasks: 'Review required · 1 of 3 tasks',
    comments: 5,
  },
];
