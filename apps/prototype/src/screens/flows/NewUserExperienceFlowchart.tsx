import React from 'react';
import { FlowchartLayout, FlowchartNode, FlowchartEdge } from '../../components/flowchart/FlowchartLayout';
import { navigateAppRoute } from '../../lib/captureNavigation';
import { flowchartLinks } from './flowchartRegistry';
import { LoginScreen } from '../LoginScreen';
import { ActiveChatScreen } from '../ActiveChatScreen';
import { DashboardScreen } from '../DashboardScreen';
import type { Theme, ThemeElement, ThemeClassMap } from '../../types/theme';
import type { ProtipVariant } from '../../components/canvas/Protip';

const previewTheme: Theme = 'dark';

const previewThemeClasses: ThemeClassMap = {
  dark: {
    text: 'text-stone-200',
    bg: 'bg-sidebar',
    border: 'border-stone-700',
    'input-bg': 'bg-stone-800',
    'placeholder-text': 'placeholder-stone-500',
    'button-bg': 'bg-white',
    'button-text': 'text-black',
    'user-message-bg': 'bg-stone-700',
    'user-message-text': 'text-stone-200',
    'ai-message-bg': 'bg-stone-800',
    'ai-message-text': 'text-stone-200',
    'status-dot-running': 'bg-success',
    'status-dot-stopped': 'bg-destructive',
    'status-text': 'text-stone-400',
    'stop-button-bg': 'bg-destructive',
    'canvas-bg': 'bg-stone-900',
    'panel-bg': 'bg-stone-800',
    'active-button-bg': 'bg-stone-600',
    'active-button-text': 'text-white',
    'pill-button-bg': 'bg-stone-700',
    'pill-button-text': 'text-stone-200',
    'icon-color': 'text-stone-400',
    'hover-icon-color': 'hover:text-yellow-400',
    'hover-resizer-bg': 'hover:bg-yellow-500',
    'stop-button-bg-subtle': 'bg-stone-700',
    'stop-button-text': 'text-stone-200',
    'button-hover': 'hover:bg-stone-600',
    'task-item-bg': 'bg-stone-600',
    'scrollbar': 'scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-stone-800',
    'success-text': 'text-success-foreground',
    'error-text': 'text-destructive',
  },
  light: {
    text: 'text-stone-800',
    bg: 'bg-sidebar',
    border: 'border-stone-300',
    'input-bg': 'bg-white',
    'placeholder-text': 'placeholder-stone-400',
    'button-bg': 'bg-stone-200',
    'button-text': 'text-stone-800',
    'user-message-bg': 'bg-stone-200',
    'user-message-text': 'text-stone-800',
    'ai-message-bg': 'bg-white',
    'ai-message-text': 'text-stone-800',
    'status-dot-running': 'bg-success',
    'status-dot-stopped': 'bg-destructive',
    'status-text': 'text-stone-600',
    'stop-button-bg': 'bg-destructive',
    'canvas-bg': 'bg-stone-100',
    'panel-bg': 'bg-white',
    'active-button-bg': 'bg-stone-400',
    'active-button-text': 'text-stone-900',
    'pill-button-bg': 'bg-stone-200',
    'pill-button-text': 'text-stone-800',
    'icon-color': 'text-stone-600',
    'hover-icon-color': 'hover:text-amber-600',
    'hover-resizer-bg': 'hover:bg-amber-200',
    'stop-button-bg-subtle': 'bg-stone-300',
    'stop-button-text': 'text-stone-800',
    'button-hover': 'hover:bg-stone-300',
    'task-item-bg': 'bg-stone-300',
    'scrollbar': 'scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100',
    'success-text': 'text-success',
    'error-text': 'text-destructive',
  },
  sepia: {
    text: 'text-[rgb(100,80,60)]',
    bg: 'bg-sidebar',
    border: 'border-[rgb(215,205,190)]',
    'input-bg': 'bg-[rgb(245,235,220)]',
    'placeholder-text': 'placeholder-[rgb(180,160,140)]',
    'button-bg': 'bg-[rgb(225,215,200)]',
    'button-text': 'text-[rgb(100,80,60)]',
    'user-message-bg': 'bg-[rgb(225,215,200)]',
    'user-message-text': 'text-[rgb(100,80,60)]',
    'ai-message-bg': 'bg-[rgb(245,235,220)]',
    'ai-message-text': 'text-[rgb(100,80,60)]',
    'status-dot-running': 'bg-[rgb(120,180,120)]',
    'status-dot-stopped': 'bg-[rgb(180,120,120)]',
    'status-text': 'text-[rgb(140,120,100)]',
    'stop-button-bg': 'bg-[rgb(180,120,120)]',
    'canvas-bg': 'bg-[rgb(235,225,210)]',
    'panel-bg': 'bg-[rgb(245,235,220)]',
    'active-button-bg': 'bg-[rgb(200,190,175)]',
    'active-button-text': 'text-[rgb(100,80,60)]',
    'pill-button-bg': 'bg-[rgb(215,205,190)]',
    'pill-button-text': 'text-[rgb(100,80,60)]',
    'icon-color': 'text-[rgb(140,120,100)]',
    'hover-icon-color': 'hover:text-[rgb(160,140,120)]',
    'hover-resizer-bg': 'hover:bg-[rgb(200,190,175)]',
    'stop-button-bg-subtle': 'bg-[rgb(200,190,175)]',
    'stop-button-text': 'text-[rgb(100,80,60)]',
    'button-hover': 'hover:bg-[rgb(215,205,190)]',
    'task-item-bg': 'bg-[rgb(215,205,190)]',
    'scrollbar': 'scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-100',
    'success-text': 'text-[rgb(120,180,120)]',
    'error-text': 'text-[rgb(180,120,120)]',
  },
};

const getThemeClasses = (element: ThemeElement) => previewThemeClasses[previewTheme][element] ?? '';

const ActiveChatPreview = () => (
  <ActiveChatScreen
    theme={previewTheme}
    getThemeClasses={getThemeClasses}
    showRefreshNotification
    onToggleRefreshNotification={() => {}}
    canvasTipVariant={'none' as ProtipVariant}
    onCanvasTipVariantChange={() => {}}
    showCanvasLoading={false}
    onToggleCanvasLoading={() => {}}
    chatContentMode="conversation"
    onChatContentModeChange={() => {}}
    repositoryStatus="connected"
    onRepositoryStatusChange={() => {}}
    statusBadgeState="off"
    onStatusBadgeStateChange={() => {}}
    automationContextTitle="PR Triage Digest"
    onAutomationContextTitleChange={() => {}}
  />
);

const nodes: FlowchartNode[] = [
  {
    id: 'welcome-login',
    title: 'Welcome & Login',
    subtitle: 'Entry point',
    hash: 'new-user-experience',
    position: { x: 80, y: 140 },
    size: { width: 420, height: 280 },
    capturePosition: { x: 80, y: 140 },
    captureSize: { width: 1280, height: 720 },
    frame: { width: 1280, height: 720, scale: 1 },
    render: <LoginScreen />,
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
    hash: 'chat',
    position: { x: 620, y: 140 },
    size: { width: 420, height: 280 },
    capturePosition: { x: 1560, y: 140 },
    captureSize: { width: 1280, height: 720 },
    frame: { width: 1280, height: 720, scale: 1 },
    render: <ActiveChatPreview />,
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
    capturePosition: { x: 3040, y: 140 },
    captureSize: { width: 1280, height: 720 },
    frame: { width: 1280, height: 720, scale: 1 },
    render: <DashboardScreen />,
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
      navigateAppRoute(`/flows/${flowId}`);
    }}
  />
);
