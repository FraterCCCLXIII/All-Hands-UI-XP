import React from 'react';
import { FlowchartLayout, FlowchartNode, FlowchartEdge } from '../../components/flowchart/FlowchartLayout';
import { flowchartLinks } from './flowchartRegistry';

const nodes: FlowchartNode[] = [
  {
    id: 'new-components',
    title: 'New Components',
    subtitle: 'Latest prototypes',
    hash: 'new-components',
    position: { x: 80, y: 160 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'preview',
        title: 'Preview mode',
        body: 'Expose interactive previews for each component.',
      },
    ],
  },
  {
    id: 'component-library',
    title: 'Component Library',
    subtitle: 'Browse catalog',
    hash: 'components',
    position: { x: 620, y: 160 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'handoff',
        title: 'Handoff',
        body: 'Link new items back to the library for adoption.',
      },
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard Review',
    subtitle: 'Adoption status',
    hash: 'dashboard',
    position: { x: 1160, y: 160 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'metrics',
        title: 'Metrics',
        body: 'Track usage or feedback signals for new UI pieces.',
      },
    ],
  },
];

const edges: FlowchartEdge[] = [
  { id: 'new-to-library', from: 'new-components', to: 'component-library' },
  { id: 'library-to-dashboard', from: 'component-library', to: 'dashboard' },
];

export const NewComponentsFlowchart: React.FC<{ onExit: () => void }> = ({ onExit }) => (
  <FlowchartLayout
    title="New Components Flow"
    description="Show how new UI components move from preview to adoption."
    nodes={nodes}
    edges={edges}
    flows={flowchartLinks}
    activeFlowId="new-components"
    onExit={onExit}
    onFlowSelect={(flowId) => {
      window.location.hash = `#/flows/${flowId}`;
    }}
  />
);
