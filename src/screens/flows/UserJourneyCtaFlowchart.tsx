import React from 'react';
import { FlowchartLayout, FlowchartNode, FlowchartEdge } from '../../components/flowchart/FlowchartLayout';

const nodes: FlowchartNode[] = [
  {
    id: 'overview',
    title: 'Dashboard Entry',
    subtitle: 'Surface CTAs',
    hash: 'dashboard',
    position: { x: 80, y: 120 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'cta-tiles',
        title: 'CTA tiles',
        body: 'Promote next-best actions in the first column.',
      },
    ],
  },
  {
    id: 'skills',
    title: 'Assistant Skills',
    subtitle: 'Guided tasks',
    hash: 'skills',
    position: { x: 620, y: 120 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'recommendations',
        title: 'Recommendations',
        body: 'Highlight skill bundles linked to user intent.',
      },
    ],
  },
  {
    id: 'components',
    title: 'Component Library',
    subtitle: 'Reusable patterns',
    hash: 'components',
    position: { x: 1160, y: 120 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'cta-copy',
        title: 'CTA copy',
        body: 'Link components back to productivity outcomes.',
      },
    ],
  },
  {
    id: 'new-components',
    title: 'New Components',
    subtitle: 'Experiment flow',
    hash: 'new-components',
    position: { x: 620, y: 460 },
    size: { width: 420, height: 280 },
    notes: [
      {
        id: 'follow-up',
        title: 'Follow-up CTA',
        body: 'Offer a quick action to apply the selected component.',
      },
    ],
  },
];

const edges: FlowchartEdge[] = [
  { id: 'overview-to-skills', from: 'overview', to: 'skills' },
  { id: 'skills-to-components', from: 'skills', to: 'components' },
  { id: 'skills-to-new', from: 'skills', to: 'new-components' },
];

export const UserJourneyCtaFlowchart: React.FC<{ onExit: () => void }> = ({ onExit }) => (
  <FlowchartLayout
    title="User Journey CTAs"
    description="Map the CTA moments that move users between key destinations."
    nodes={nodes}
    edges={edges}
    onExit={onExit}
  />
);
