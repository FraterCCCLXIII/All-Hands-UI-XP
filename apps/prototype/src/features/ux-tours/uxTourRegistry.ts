import { UxTourDefinition } from './uxTourTypes';

export const uxTourDefinitions: UxTourDefinition[] = [
  {
    id: 'new-user-onboarding',
    label: 'New User Onboarding Tour',
    description: 'Demo tour that highlights key onboarding UX touchpoints.',
    startHash: '#/chat',
    steps: [
      {
        id: 'chat-composer',
        title: 'Start with onboarding guidance',
        body: 'This icon is the entry point for UX tours and is highlighted immediately.',
        targetId: 'left-nav.ux-flow-icon',
      },
      {
        id: 'flowchart-library-menu',
        title: 'Open a contextual menu',
        body: 'Tutorial steps can open menus before highlighting controls inside them.',
        targetId: 'left-nav.inspector-toggle',
        beforeActions: [
          { type: 'set-state', key: 'leftNav.flowchartLibrary.open', value: true },
          { type: 'wait-for-target', targetId: 'left-nav.inspector-toggle', timeoutMs: 3000 },
        ],
      },
      {
        id: 'settings-navigation',
        title: 'Navigate to another page',
        body: 'Steps can move users between routes and keep the tour running.',
        targetId: 'settings.org-selector',
        beforeActions: [
          { type: 'set-state', key: 'leftNav.flowchartLibrary.open', value: false },
          { type: 'navigate', hash: '#/settings' },
          { type: 'wait-for-target', targetId: 'settings.org-selector', timeoutMs: 4000 },
        ],
      },
      {
        id: 'reveal-hidden-feature',
        title: 'Reveal hidden UI intentionally',
        body: 'Tour actions can expose features that are hidden by default for guided review.',
        targetId: 'claim-credits.cta',
        beforeActions: [
          { type: 'set-state', key: 'claimCreditsPrompt.visible', value: true },
          { type: 'wait-for-target', targetId: 'claim-credits.cta', timeoutMs: 3000 },
        ],
      },
      {
        id: 'dashboard-handoff',
        title: 'Hand off to the dashboard',
        body: 'Finish by navigating users to another area to continue their UX walkthrough.',
        targetId: 'dashboard.root',
        beforeActions: [
          { type: 'navigate', hash: '#/dashboard' },
          { type: 'wait-for-target', targetId: 'dashboard.root', timeoutMs: 4000 },
          { type: 'set-state', key: 'claimCreditsPrompt.visible', value: false },
        ],
        nextLabel: 'Finish',
      },
    ],
  },
];

export const uxTourLinks = uxTourDefinitions.map((tour) => ({
  id: tour.id,
  label: tour.label,
}));
