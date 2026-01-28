export interface ConversationSummary {
  id: string;
  name: string;
  version: string;
  repo: string;
  branch?: string;
  time: string;
}

export const conversationSummaries: ConversationSummary[] = [
  {
    id: 'af0bb6d8f20947f7ad04d53b7bf05a00',
    name: 'Conversation af0bb',
    version: 'V1',
    repo: 'FraterCCCLXIII/pr-navigator',
    branch: 'main',
    time: '1h ago',
  },
  {
    id: '0ff1812ced8f453189e945365bd52268',
    name: 'Conversation 0ff18',
    version: 'V1',
    repo: 'FraterCCCLXIII/chatrtk',
    time: '3d ago',
  },
];
