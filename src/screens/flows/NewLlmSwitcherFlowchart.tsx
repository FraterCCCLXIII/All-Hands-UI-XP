import React from 'react';
import { FlowchartLayout, FlowchartNode, FlowchartEdge } from '../../components/flowchart/FlowchartLayout';

const nodes: FlowchartNode[] = [
  {
    id: 'llm-switcher',
    title: 'LLM Switcher',
    subtitle: 'Model selection',
    hash: 'new-llm-switcher',
    position: { x: 80, y: 160 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'model-choice',
        title: 'Model choice',
        body: 'Expose the decision criteria and expected outcomes.',
      },
    ],
  },
  {
    id: 'llm-switcher-2',
    title: 'LLM Switcher V2',
    subtitle: 'Comparison view',
    hash: 'new-llm-switcher-2',
    position: { x: 620, y: 160 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'compare',
        title: 'Comparison',
        body: 'Highlight differences in latency, cost, and quality.',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Persist selection',
    hash: 'settings',
    position: { x: 1160, y: 160 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'save',
        title: 'Save state',
        body: 'Keep the selected model in user preferences.',
      },
    ],
  },
];

const edges: FlowchartEdge[] = [
  { id: 'llm-to-llm2', from: 'llm-switcher', to: 'llm-switcher-2' },
  { id: 'llm2-to-settings', from: 'llm-switcher-2', to: 'settings' },
];

export const NewLlmSwitcherFlowchart: React.FC<{ onExit: () => void }> = ({ onExit }) => (
  <FlowchartLayout
    title="LLM Switcher Flow"
    description="Track how users compare models and save their selection."
    nodes={nodes}
    edges={edges}
    onExit={onExit}
  />
);
