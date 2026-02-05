import React from 'react';
import { FlowchartLayout, FlowchartNode, FlowchartEdge } from '../../components/flowchart/FlowchartLayout';

const nodes: FlowchartNode[] = [
  {
    id: 'library',
    title: 'Component Library',
    subtitle: 'Browse inventory',
    hash: 'components',
    position: { x: 80, y: 160 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'filtering',
        title: 'Filtering',
        body: 'Provide category filters and quick previews.',
      },
    ],
  },
  {
    id: 'new-components',
    title: 'New Components',
    subtitle: 'Prototype updates',
    hash: 'new-components',
    position: { x: 620, y: 160 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'launch',
        title: 'Launch CTAs',
        body: 'Encourage trial of the latest UI modules.',
      },
    ],
  },
  {
    id: 'llm-switcher',
    title: 'LLM Switcher',
    subtitle: 'Model selection',
    hash: 'new-llm-switcher',
    position: { x: 1160, y: 160 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'context',
        title: 'Context settings',
        body: 'Show model context differences in-line.',
      },
    ],
  },
];

const edges: FlowchartEdge[] = [
  { id: 'library-to-new', from: 'library', to: 'new-components' },
  { id: 'new-to-llm', from: 'new-components', to: 'llm-switcher' },
];

export const ComponentLibraryFlowchart: React.FC<{ onExit: () => void }> = ({ onExit }) => (
  <FlowchartLayout
    title="Component Library Flow"
    description="Connect the library entry point to the newest component prototypes."
    nodes={nodes}
    edges={edges}
    onExit={onExit}
  />
);
