import React from 'react';
import { FlowchartLayout, FlowchartNode, FlowchartEdge } from '../../components/flowchart/FlowchartLayout';

const nodes: FlowchartNode[] = [
  {
    id: 'credit-card-request',
    title: 'Require Credit Card',
    subtitle: 'Free credits gate',
    hash: 'saas-credit-card',
    position: { x: 80, y: 140 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'gate-copy',
        title: 'Gate copy',
        body: 'Explain why payment info is required before issuing credits.',
      },
    ],
  },
  {
    id: 'account-settings',
    title: 'Billing & Settings',
    subtitle: 'Update details',
    hash: 'settings',
    position: { x: 620, y: 140 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'billing-tab',
        title: 'Billing tab',
        body: 'Keep upgrade and invoice actions in a single view.',
      },
    ],
  },
  {
    id: 'dashboard-review',
    title: 'Usage Dashboard',
    subtitle: 'Monitor credits',
    hash: 'dashboard',
    position: { x: 1160, y: 140 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'alerts',
        title: 'Usage alerts',
        body: 'Surface low-credit warnings and upgrade CTAs.',
      },
    ],
  },
];

const edges: FlowchartEdge[] = [
  { id: 'credit-to-settings', from: 'credit-card-request', to: 'account-settings' },
  { id: 'settings-to-dashboard', from: 'account-settings', to: 'dashboard-review' },
];

export const SaasCreditCardFlowchart: React.FC<{ onExit: () => void }> = ({ onExit }) => (
  <FlowchartLayout
    title="SaaS Credit Card Flow"
    description="Show the journey from credit card collection to usage monitoring."
    nodes={nodes}
    edges={edges}
    onExit={onExit}
  />
);
