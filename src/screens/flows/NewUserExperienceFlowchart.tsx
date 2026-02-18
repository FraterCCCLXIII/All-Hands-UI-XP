import React from 'react';
import { FlowchartLayout, FlowchartNode, FlowchartEdge } from '../../components/flowchart/FlowchartLayout';
import { flowchartLinks } from './flowchartRegistry';

const nodes: FlowchartNode[] = [
  {
    id: 'welcome-login',
    title: 'Welcome & Login',
    subtitle: 'Entry point',
    hash: 'new-user-experience',
    position: { x: 80, y: 140 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'welcome-copy',
        title: 'Hero messaging',
        body: 'Show the onboarding promise and primary CTA above the fold.',
      },
      {
        id: 'login-focus',
        title: 'Account creation',
        body: 'Keep sign-up inputs minimal and progressive.',
      },
    ],
  },
  {
    id: 'first-conversation',
    title: 'First Conversation',
    subtitle: 'Guided prompt',
    hash: 'chat-active',
    position: { x: 620, y: 140 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'prompt',
        title: 'Starter tasks',
        body: 'Highlight 3-4 preset tasks that map to the new user goals.',
      },
    ],
  },
  {
    id: 'project-overview',
    title: 'Project Overview',
    subtitle: 'Progress tracking',
    hash: 'dashboard',
    position: { x: 1160, y: 140 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'status',
        title: 'Progress visibility',
        body: 'Surface status badges and next-step CTAs immediately.',
      },
    ],
  },
];

const edges: FlowchartEdge[] = [
  { id: 'welcome-to-chat', from: 'welcome-login', to: 'first-conversation' },
  { id: 'chat-to-dashboard', from: 'first-conversation', to: 'project-overview' },
];

export const NewUserExperienceFlowchart: React.FC<{ onExit: () => void }> = ({ onExit }) => (
  <FlowchartLayout
    title="New User Experience Flow"
    description="Track the onboarding journey from first visit to a working project."
    nodes={nodes}
    edges={edges}
    flows={flowchartLinks}
    activeFlowId="new-user-experience"
    onExit={onExit}
    onFlowSelect={(flowId) => {
      window.location.hash = `#/flows/${flowId}`;
    }}
  />
);
