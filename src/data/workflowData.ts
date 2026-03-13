import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { WorkflowNodeData } from '../types/workflow';

export interface Workflow {
  id: string;
  name: string;
  enabled: boolean;
  nodes: Node[];
  edges: Edge[];
}

export interface NewWorkflowData {
  name?: string;
  repo?: { repoPath?: string; branch?: string };
  schedule?: {
    triggerType?: string;
    scheduleFrequency?: string;
    scheduleDay?: string;
    scheduleTime?: string;
    timezone?: string;
    webhookEvent?: string;
  };
  conversation?: { prompt?: string; plugins?: string[]; skills?: string[]; model?: string };
  notification?: { optional?: boolean; channel?: string; destination?: string; notifyOn?: string };
}

/** Available plugins for conversation nodes */
export const PLUGIN_OPTIONS = [
  'Static Analysis',
  'Code Search',
  'Linter',
  'Test Runner',
  'Security Scan',
  'Dependency Check',
  'Documentation',
  'Git History',
];

/** Available skills for conversation nodes */
export const SKILL_OPTIONS = [
  'Diff Triage',
  'Documentation',
  'Code Review',
  'Test Writing',
  'Security Audit',
  'Refactor Assistant',
  'PR Description',
  'Changelog Generator',
];

const NODE_WIDTH = 300;

export function createWorkflowFromWizardData(data: NewWorkflowData): { nodes: Node[]; edges: Edge[] } {
  const baseY = 120;
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let x = 80;

  const repoData: WorkflowNodeData = {
    title: 'Repository',
    type: 'Source',
    description: 'Select the repository to run this workflow against.',
    repoPath: data.repo?.repoPath,
    branch: data.repo?.branch ?? 'main',
    workflowName: data.name,
  };
  nodes.push({
    id: 'repo',
    type: 'workflowNode',
    position: { x, y: baseY },
    data: repoData,
  });
  x += NODE_WIDTH;

  const scheduleData: WorkflowNodeData = {
    title: 'Schedule',
    type: 'Trigger',
    description: 'When to run the workflow.',
    triggerType: data.schedule?.triggerType ?? 'cron',
    scheduleFrequency: data.schedule?.scheduleFrequency ?? 'daily',
    scheduleDay: data.schedule?.scheduleDay,
    scheduleTime: data.schedule?.scheduleTime ?? '09:00',
    timezone: data.schedule?.timezone ?? 'UTC',
    webhookEvent: data.schedule?.webhookEvent,
  };
  nodes.push({
    id: 'schedule',
    type: 'workflowNode',
    position: { x, y: baseY },
    data: scheduleData,
  });
  x += NODE_WIDTH;

  const conversationData: WorkflowNodeData = {
    title: 'Conversation',
    type: 'Agent',
    description: 'AI conversation with configurable prompt, plugins, and skills.',
    prompt: data.conversation?.prompt,
    plugins: data.conversation?.plugins,
    skills: data.conversation?.skills,
    model: data.conversation?.model,
  };
  nodes.push({
    id: 'conversation',
    type: 'workflowNode',
    position: { x, y: baseY },
    data: conversationData,
  });
  x += NODE_WIDTH;

  const notificationData: WorkflowNodeData = {
    title: 'Notification',
    type: 'Action',
    description: 'Optional: notify when the workflow completes.',
    optional: data.notification?.optional ?? true,
    channel: data.notification?.channel ?? 'Slack',
    destination: data.notification?.destination,
    notifyOn: data.notification?.notifyOn ?? 'both',
  };
  nodes.push({
    id: 'notification',
    type: 'workflowNode',
    position: { x, y: baseY },
    data: notificationData,
  });

  edges.push(
    { id: 'edge-repo-schedule', source: 'repo', target: 'schedule', label: '' },
    { id: 'edge-schedule-conversation', source: 'schedule', target: 'conversation', label: '' },
    { id: 'edge-conversation-notification', source: 'conversation', target: 'notification', label: '' }
  );

  return { nodes, edges };
}

export const initialWorkflowNodes: Node[] = [
  {
    id: 'repo',
    type: 'workflowNode',
    position: { x: 80, y: 120 },
    data: {
      title: 'Repository',
      type: 'Source',
      description: 'Select the repository to run this workflow against.',
      meta: 'repoA/frontend-web',
      tag: 'Branch: main',
      repoPath: 'repoA/frontend-web',
      branch: 'main',
    },
  },
  {
    id: 'schedule',
    type: 'workflowNode',
    position: { x: 380, y: 120 },
    data: {
      title: 'Schedule',
      type: 'Trigger',
      description: 'When to run the workflow.',
      meta: 'Daily at 9:00 AM UTC',
      triggerType: 'cron',
      scheduleFrequency: 'daily',
      scheduleTime: '09:00',
      timezone: 'UTC',
      runOnBranches: 'main',
    },
  },
  {
    id: 'conversation',
    type: 'workflowNode',
    position: { x: 680, y: 120 },
    data: {
      title: 'Conversation',
      type: 'Agent',
      description: 'AI conversation with configurable prompt, plugins, and skills.',
      prompt: 'Review recent changes and suggest improvements...',
      plugins: ['Static Analysis', 'Code Search'],
      skills: ['Diff Triage', 'Documentation'],
    },
  },
  {
    id: 'notification',
    type: 'workflowNode',
    position: { x: 980, y: 120 },
    data: {
      title: 'Notification',
      type: 'Action',
      description: 'Optional: notify when the workflow completes.',
      meta: 'Slack #dev-alerts',
      optional: true,
      channel: 'Slack',
      destination: '#dev-alerts',
      notifyOn: 'both',
    },
  },
];

export const initialWorkflowEdges: Edge[] = [
  { id: 'edge-repo-schedule', source: 'repo', target: 'schedule', label: '' },
  { id: 'edge-schedule-conversation', source: 'schedule', target: 'conversation', label: '' },
  { id: 'edge-conversation-notification', source: 'conversation', target: 'notification', label: '' },
];

function generateWorkflowId(): string {
  return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createInitialWorkflow(): Workflow {
  const name = 'Enterprise PR Orchestration';
  const nodes = initialWorkflowNodes.map((n) => {
    if (n.id === 'repo') {
      return { ...n, data: { ...n.data, workflowName: name } };
    }
    return { ...n };
  });
  return {
    id: generateWorkflowId(),
    name,
    enabled: true,
    nodes,
    edges: [...initialWorkflowEdges],
  };
}

export function getWorkflowNameFromNodes(nodes: Node[]): string {
  const repoNode = nodes.find((n) => n.id === 'repo');
  const workflowName = (repoNode?.data as WorkflowNodeData)?.workflowName;
  return workflowName?.trim() || 'Untitled workflow';
}

export const defaultWorkflowEdgeOptions = {
  type: 'default' as const,
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { stroke: 'rgb(177, 177, 183)', strokeWidth: 1 },
  labelShowBg: true,
  labelBgStyle: {
    fill: 'hsl(var(--card))',
    stroke: 'hsl(var(--border))',
    strokeWidth: 1,
  },
  labelBgPadding: [4, 4] as [number, number],
  labelBgBorderRadius: 2,
  labelStyle: {
    fill: 'hsl(var(--foreground))',
    fontSize: 11,
    fontWeight: 500,
  },
};
