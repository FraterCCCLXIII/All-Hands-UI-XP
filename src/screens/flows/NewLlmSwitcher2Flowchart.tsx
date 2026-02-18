import React from 'react';
import { FlowchartLayout, FlowchartNode, FlowchartEdge } from '../../components/flowchart/FlowchartLayout';
import { flowchartLinks } from './flowchartRegistry';

const nodes: FlowchartNode[] = [
  {
    id: 'llm-switcher-2',
    title: 'LLM Switcher V2',
    subtitle: 'Refined flow',
    hash: 'new-llm-switcher-2',
    position: { x: 80, y: 160 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'detail',
        title: 'Detail view',
        body: 'Surface reasoning for the recommended model choice.',
      },
    ],
  },
  {
    id: 'skills',
    title: 'Skills',
    subtitle: 'Use cases',
    hash: 'skills',
    position: { x: 620, y: 160 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'use-cases',
        title: 'Use cases',
        body: 'Map each model to a specific skill or workflow.',
      },
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    subtitle: 'Monitor impact',
    hash: 'dashboard',
    position: { x: 1160, y: 160 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'impact',
        title: 'Impact',
        body: 'Track quality and cost metrics post-switch.',
      },
    ],
  },
];

const edges: FlowchartEdge[] = [
  { id: 'llm2-to-skills', from: 'llm-switcher-2', to: 'skills' },
  { id: 'skills-to-dashboard', from: 'skills', to: 'dashboard' },
];

export const NewLlmSwitcher2Flowchart: React.FC<{ onExit: () => void }> = ({ onExit }) => (
  <FlowchartLayout
    title="LLM Switcher V2 Flow"
    description="Describe the refined model-switching experience with impact tracking."
    nodes={nodes}
    edges={edges}
    flows={flowchartLinks}
    activeFlowId="new-llm-switcher-2"
    onExit={onExit}
    onFlowSelect={(flowId) => {
      window.location.hash = `#/flows/${flowId}`;
    }}
  />
);
