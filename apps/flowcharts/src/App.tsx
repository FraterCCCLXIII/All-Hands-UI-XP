import React from 'react';
import { FlowchartLayout, FlowchartNode, FlowchartEdge } from '../../prototype/src/components/flowchart/FlowchartLayout';
import { Button } from '@all-hands/ui';

const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL ?? 'http://localhost:3000/';

const nodes: FlowchartNode[] = [
  {
    id: 'welcome-login',
    title: 'Welcome & Login',
    subtitle: 'Entry point',
    hash: 'new-user-experience',
    position: { x: 80, y: 140 },
    size: { width: 480, height: 320 },
  },
  {
    id: 'first-conversation',
    title: 'First Conversation',
    subtitle: 'Guided prompt',
    hash: 'chat-active',
    position: { x: 680, y: 140 },
    size: { width: 480, height: 320 },
  },
  {
    id: 'project-overview',
    title: 'Project Overview',
    subtitle: 'Progress tracking',
    hash: 'dashboard',
    position: { x: 1280, y: 140 },
    size: { width: 480, height: 320 },
  },
];

const edges: FlowchartEdge[] = [
  { id: 'welcome-to-chat', from: 'welcome-login', to: 'first-conversation' },
  { id: 'chat-to-dashboard', from: 'first-conversation', to: 'project-overview' },
];

export default function App() {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <div className="text-sm font-semibold text-foreground">UX Flowcharts</div>
          <div className="text-xs text-muted-foreground">Document workflows and stage for Figma export</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="h-8">Export Guidance</Button>
          <Button className="h-8">New Flow</Button>
        </div>
      </div>
      <div className="flex-1">
        <FlowchartLayout
          title="New User Experience Flow"
          description="Track the onboarding journey from first visit to a working project."
          nodes={nodes}
          edges={edges}
          embedBaseUrl={MAIN_APP_URL}
        />
      </div>
    </div>
  );
}
