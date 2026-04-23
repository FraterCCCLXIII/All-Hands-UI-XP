/**
 * GitHub Actions workflow `on:` events and activity types from:
 * https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows
 */

export type WorkflowTriggerEventConfig = {
  readonly key: string;
  /** `null` = event has no activity types (single trigger entry). */
  readonly types: readonly string[] | null;
};

export function humanizeWorkflowEventKey(key: string): string {
  const s = key.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function humanizeWorkflowActivityType(type: string): string {
  const s = type.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Stable id for multi-select state: `event` or `event:activityType`. */
export function workflowTriggerSelectionId(eventKey: string, activityType?: string): string {
  return activityType ? `${eventKey}:${activityType}` : eventKey;
}

export function formatWorkflowTriggerBubbleLabel(selectionId: string): string {
  const colon = selectionId.indexOf(':');
  if (colon === -1) {
    return humanizeWorkflowEventKey(selectionId);
  }
  const eventKey = selectionId.slice(0, colon);
  const activityType = selectionId.slice(colon + 1);
  return `${humanizeWorkflowEventKey(eventKey)} — ${humanizeWorkflowActivityType(activityType)}`;
}

const PULL_REQUEST_ACTIVITY_TYPES = [
  'assigned',
  'unassigned',
  'labeled',
  'unlabeled',
  'opened',
  'edited',
  'closed',
  'reopened',
  'synchronize',
  'converted_to_draft',
  'locked',
  'unlocked',
  'enqueued',
  'dequeued',
  'milestoned',
  'demilestoned',
  'ready_for_review',
  'review_requested',
  'review_request_removed',
  'auto_merge_enabled',
  'auto_merge_disabled',
] as const;

export const GITHUB_WORKFLOW_TRIGGER_EVENTS: readonly WorkflowTriggerEventConfig[] = [
  { key: 'branch_protection_rule', types: ['created', 'edited', 'deleted'] },
  { key: 'check_run', types: ['created', 'rerequested', 'completed', 'requested_action'] },
  { key: 'check_suite', types: ['completed'] },
  { key: 'create', types: null },
  { key: 'delete', types: null },
  { key: 'deployment', types: null },
  { key: 'deployment_status', types: null },
  {
    key: 'discussion',
    types: [
      'created',
      'edited',
      'deleted',
      'transferred',
      'pinned',
      'unpinned',
      'labeled',
      'unlabeled',
      'locked',
      'unlocked',
      'category_changed',
      'answered',
      'unanswered',
    ],
  },
  { key: 'discussion_comment', types: ['created', 'edited', 'deleted'] },
  { key: 'fork', types: null },
  { key: 'gollum', types: null },
  { key: 'image_version', types: null },
  { key: 'issue_comment', types: ['created', 'edited', 'deleted'] },
  {
    key: 'issues',
    types: [
      'opened',
      'edited',
      'deleted',
      'transferred',
      'pinned',
      'unpinned',
      'closed',
      'reopened',
      'assigned',
      'unassigned',
      'labeled',
      'unlabeled',
      'locked',
      'unlocked',
      'milestoned',
      'demilestoned',
      'typed',
      'untyped',
    ],
  },
  { key: 'label', types: ['created', 'edited', 'deleted'] },
  { key: 'merge_group', types: ['checks_requested'] },
  { key: 'milestone', types: ['created', 'closed', 'opened', 'edited', 'deleted'] },
  { key: 'page_build', types: null },
  { key: 'public', types: null },
  { key: 'pull_request', types: [...PULL_REQUEST_ACTIVITY_TYPES] },
  { key: 'pull_request_review', types: ['submitted', 'edited', 'dismissed'] },
  { key: 'pull_request_review_comment', types: ['created', 'edited', 'deleted'] },
  { key: 'pull_request_target', types: [...PULL_REQUEST_ACTIVITY_TYPES] },
  { key: 'push', types: null },
  { key: 'registry_package', types: ['published', 'updated'] },
  {
    key: 'release',
    types: ['published', 'unpublished', 'created', 'edited', 'deleted', 'prereleased', 'released'],
  },
  { key: 'repository_dispatch', types: null },
  { key: 'status', types: null },
  { key: 'watch', types: ['started'] },
  { key: 'workflow_call', types: null },
  { key: 'workflow_dispatch', types: null },
  { key: 'workflow_run', types: ['completed', 'requested', 'in_progress'] },
].sort((a, b) => a.key.localeCompare(b.key));
