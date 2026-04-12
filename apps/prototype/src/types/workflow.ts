export interface WorkflowNodeData extends Record<string, unknown> {
  title: string;
  type: string;
  description: string;
  meta?: string;
  tag?: string;
  /** Workflow-level name (from wizard) */
  workflowName?: string;

  /** Repository: repo path (e.g. org/repo) */
  repoPath?: string;
  /** Repository: branch to run against */
  branch?: string;
  /** Repository: paths to include (comma-separated) */
  includePaths?: string;
  /** Repository: paths to exclude (comma-separated) */
  excludePaths?: string;

  /** Schedule: cron | webhook | on-push */
  triggerType?: string;
  /** Schedule: GitHub Actions webhook event (when triggerType is webhook) */
  webhookEvent?: string;
  /** Schedule: hourly | daily | weekly | monthly */
  scheduleFrequency?: string;
  /** Schedule: for weekly 0-6 (Sun-Sat), for monthly 1-31 */
  scheduleDay?: string;
  /** Schedule: time as HH:mm (e.g. 09:00) */
  scheduleTime?: string;
  /** Schedule: cron expression (e.g. 0 9 * * *) - used when frequency is custom */
  cronExpression?: string;
  /** Schedule: timezone (e.g. UTC) */
  timezone?: string;
  /** Schedule: branches to run on (comma-separated) */
  runOnBranches?: string;

  /** Conversation: user-specified prompt */
  prompt?: string;
  /** Conversation: selected plugins */
  plugins?: string[];
  /** Conversation: selected skills */
  skills?: string[];
  /** Conversation: model name */
  model?: string;

  /** Notification: whether step is optional */
  optional?: boolean;
  /** Notification: Slack | email | webhook */
  channel?: string;
  /** Notification: destination (e.g. #dev-alerts, user@example.com) */
  destination?: string;
  /** Notification: success | failure | both */
  notifyOn?: string;
}
