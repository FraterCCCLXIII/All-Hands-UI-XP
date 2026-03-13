import React, { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import type { WorkflowNodeData } from '../../types/workflow';
import { PLUGIN_OPTIONS, SKILL_OPTIONS } from '../../data/workflowData';
import { BubbleSelect } from '../common/BubbleSelect';

type NodeKind = 'repo' | 'schedule' | 'conversation' | 'notification';

function getNodeKind(nodeId: string, data?: WorkflowNodeData): NodeKind {
  if (['repo', 'schedule', 'conversation', 'notification'].includes(nodeId)) {
    return nodeId as NodeKind;
  }
  const type = data?.type?.toLowerCase() ?? '';
  if (type === 'source') return 'repo';
  if (type === 'trigger') return 'schedule';
  if (type === 'agent') return 'conversation';
  if (type === 'action') return 'notification';
  return 'repo';
}

function toEditableData(data: WorkflowNodeData, kind: NodeKind): Record<string, string | boolean> {
  const base: Record<string, string | boolean> = {
    title: data.title ?? '',
    type: data.type ?? '',
    description: data.description ?? '',
    meta: data.meta ?? '',
    tag: data.tag ?? '',
    prompt: (data.prompt ?? ''),
    plugins: (data.plugins ?? []).join(', '),
    skills: (data.skills ?? []).join(', '),
    optional: data.optional ?? false,
    repoPath: data.repoPath ?? '',
    branch: data.branch ?? '',
    includePaths: data.includePaths ?? '',
    excludePaths: data.excludePaths ?? '',
    triggerType: data.triggerType ?? 'cron',
    webhookEvent: data.webhookEvent ?? 'push',
    scheduleFrequency: data.scheduleFrequency ?? 'daily',
    scheduleDay: data.scheduleDay ?? (['weekly', 'monthly'].includes(data.scheduleFrequency ?? '') ? '1' : ''),
    scheduleTime: data.scheduleTime ?? '09:00',
    cronExpression: data.cronExpression ?? '',
    timezone: data.timezone ?? 'UTC',
    runOnBranches: data.runOnBranches ?? '',
    model: data.model ?? '',
    channel: data.channel ?? 'Slack',
    destination: data.destination ?? '',
    notifyOn: data.notifyOn ?? 'both',
  };
  return base;
}

function fromEditableData(
  editable: Record<string, string | boolean>,
  existing: WorkflowNodeData,
  kind: NodeKind
): WorkflowNodeData {
  const pluginsStr = String(editable.plugins ?? '').trim();
  const skillsStr = String(editable.skills ?? '').trim();
  const base: WorkflowNodeData = {
    ...existing,
    title: existing.title,
    type: existing.type,
    description: existing.description,
    meta: String(editable.meta ?? '').trim() || undefined,
    tag: String(editable.tag ?? '').trim() || undefined,
    prompt: String(editable.prompt ?? '').trim() || undefined,
    plugins: pluginsStr ? pluginsStr.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    skills: skillsStr ? skillsStr.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    optional: Boolean(editable.optional),
  };

  if (kind === 'repo') {
    return {
      ...base,
      repoPath: String(editable.repoPath ?? '').trim() || undefined,
      branch: String(editable.branch ?? '').trim() || undefined,
      includePaths: String(editable.includePaths ?? '').trim() || undefined,
      excludePaths: String(editable.excludePaths ?? '').trim() || undefined,
    };
  }
  if (kind === 'schedule') {
    return {
      ...base,
      triggerType: String(editable.triggerType ?? '').trim() || undefined,
      webhookEvent: String(editable.webhookEvent ?? '').trim() || undefined,
      scheduleFrequency: String(editable.scheduleFrequency ?? '').trim() || undefined,
      scheduleDay: String(editable.scheduleDay ?? '').trim() || undefined,
      scheduleTime: String(editable.scheduleTime ?? '').trim() || undefined,
      cronExpression: String(editable.cronExpression ?? '').trim() || undefined,
      timezone: String(editable.timezone ?? '').trim() || undefined,
      runOnBranches: String(editable.runOnBranches ?? '').trim() || undefined,
    };
  }
  if (kind === 'conversation') {
    return {
      ...base,
      model: String(editable.model ?? '').trim() || undefined,
    };
  }
  if (kind === 'notification') {
    return {
      ...base,
      channel: String(editable.channel ?? '').trim() || undefined,
      destination: String(editable.destination ?? '').trim() || undefined,
      notifyOn: String(editable.notifyOn ?? '').trim() || undefined,
    };
  }
  return base;
}

const defaultForm: Record<string, string | boolean> = {
  title: '',
  type: '',
  description: '',
  meta: '',
  tag: '',
  prompt: '',
  plugins: '',
  skills: '',
  optional: false,
  repoPath: '',
  branch: '',
  includePaths: '',
  excludePaths: '',
  triggerType: 'cron',
  webhookEvent: 'push',
  scheduleFrequency: 'daily',
  scheduleDay: '',
  scheduleTime: '09:00',
  cronExpression: '',
  timezone: 'UTC',
  runOnBranches: '',
  model: '',
  channel: 'Slack',
  destination: '',
  notifyOn: 'both',
};

const Field: React.FC<{
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}> = ({ label, placeholder, value, onChange, multiline }) => (
  <div>
    <label className="text-xs text-muted-foreground">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="mt-1 flex w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    ) : (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1"
      />
    )}
  </div>
);

export interface WorkflowNodeInspectorProps {
  node: Node | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (nodeId: string, data: WorkflowNodeData) => void;
}

export const WorkflowNodeInspector: React.FC<WorkflowNodeInspectorProps> = ({
  node,
  open,
  onOpenChange,
  onSave,
}) => {
  const data = node?.data as WorkflowNodeData | undefined;
  const kind = node ? getNodeKind(node.id, data) : null;

  const [form, setForm] = useState<Record<string, string | boolean>>(defaultForm);

  useEffect(() => {
    if (data) {
      setForm(toEditableData(data, kind!));
    }
  }, [node?.id, data, kind]);

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!node?.id || !onSave || !data || !kind) return;
    const updated = fromEditableData(form, data, kind);
    onSave(node.id, updated);
  };

  const hasData = Boolean(data);

  const renderForm = () => {
    if (!kind) return null;

    return (
      <>
        {kind === 'repo' && (
          <section className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Repository</label>
              <select
                value={String(form.repoPath)}
                onChange={(e) => handleChange('repoPath', e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select repository</option>
                <option value="repoA/frontend-web">repoA/frontend-web</option>
                <option value="repoB/api-service">repoB/api-service</option>
                <option value="repoC/shared-lib">repoC/shared-lib</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Branch</label>
              <select
                value={String(form.branch)}
                onChange={(e) => handleChange('branch', e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select branch</option>
                <option value="main">main</option>
                <option value="develop">develop</option>
                <option value="staging">staging</option>
                <option value="release">release</option>
              </select>
            </div>
            <Field
              label="Include paths (comma-separated)"
              value={String(form.includePaths)}
              onChange={(v) => handleChange('includePaths', v)}
              placeholder="src/, lib/"
            />
            <Field
              label="Exclude paths (comma-separated)"
              value={String(form.excludePaths)}
              onChange={(v) => handleChange('excludePaths', v)}
              placeholder="node_modules/, dist/"
            />
          </section>
        )}

        {kind === 'schedule' && (
          <section className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Trigger type</label>
              <select
                value={String(form.triggerType)}
                onChange={(e) => handleChange('triggerType', e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="cron">Scheduled</option>
                <option value="webhook">Webhook (GitHub Actions)</option>
                <option value="on-push">On push</option>
              </select>
            </div>
            {form.triggerType === 'webhook' && (
              <div>
                <label className="text-xs text-muted-foreground">GitHub event</label>
                <select
                  value={String(form.webhookEvent)}
                  onChange={(e) => handleChange('webhookEvent', e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="push">push</option>
                  <option value="pull_request">pull_request</option>
                  <option value="pull_request_review">pull_request_review</option>
                  <option value="workflow_dispatch">workflow_dispatch</option>
                  <option value="repository_dispatch">repository_dispatch</option>
                  <option value="workflow_run">workflow_run</option>
                  <option value="release">release</option>
                  <option value="issues">issues</option>
                  <option value="issue_comment">issue_comment</option>
                  <option value="create">create</option>
                  <option value="delete">delete</option>
                </select>
              </div>
            )}
            {form.triggerType === 'cron' && (
              <>
                <div>
                  <label className="text-xs text-muted-foreground">Frequency</label>
                  <select
                    value={String(form.scheduleFrequency)}
                    onChange={(e) => handleChange('scheduleFrequency', e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                {(form.scheduleFrequency === 'weekly' || form.scheduleFrequency === 'monthly') && (
                  <div>
                    <label className="text-xs text-muted-foreground">
                      {form.scheduleFrequency === 'weekly' ? 'Day of week' : 'Day of month'}
                    </label>
                    <select
                      value={String(form.scheduleDay || '1')}
                      onChange={(e) => handleChange('scheduleDay', e.target.value)}
                      className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {form.scheduleFrequency === 'weekly' ? (
                        <>
                          <option value="0">Sunday</option>
                          <option value="1">Monday</option>
                          <option value="2">Tuesday</option>
                          <option value="3">Wednesday</option>
                          <option value="4">Thursday</option>
                          <option value="5">Friday</option>
                          <option value="6">Saturday</option>
                        </>
                      ) : (
                        Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={String(d)}>
                            {d}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground">
                    {form.scheduleFrequency === 'hourly' ? 'Minute' : 'Time'}
                  </label>
                  {form.scheduleFrequency === 'hourly' ? (
                    <select
                      value={String(form.scheduleTime)}
                      onChange={(e) => handleChange('scheduleTime', e.target.value)}
                      className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {[0, 15, 30, 45].map((m) => (
                        <option key={m} value={String(m)}>
                          :{String(m).padStart(2, '0')} past the hour
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="time"
                      value={/^\d{1,2}:\d{2}$/.test(String(form.scheduleTime)) ? form.scheduleTime : '09:00'}
                      onChange={(e) => handleChange('scheduleTime', e.target.value)}
                      className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  )}
                </div>
                <Field
                  label="Timezone"
                  value={String(form.timezone)}
                  onChange={(v) => handleChange('timezone', v)}
                  placeholder="UTC"
                />
              </>
            )}
          </section>
        )}

        {kind === 'conversation' && (
          <section className="space-y-2">
            <Field
              label="Prompt"
              value={String(form.prompt)}
              onChange={(v) => handleChange('prompt', v)}
              placeholder="AI instruction..."
              multiline
            />
            <BubbleSelect
              label="Plugins"
              value={form.plugins ? String(form.plugins).split(',').map((s) => s.trim()).filter(Boolean) : []}
              onChange={(arr) => handleChange('plugins', arr.join(', '))}
              options={PLUGIN_OPTIONS}
              placeholder="None selected"
            />
            <BubbleSelect
              label="Skills"
              value={form.skills ? String(form.skills).split(',').map((s) => s.trim()).filter(Boolean) : []}
              onChange={(arr) => handleChange('skills', arr.join(', '))}
              options={SKILL_OPTIONS}
              placeholder="None selected"
            />
            <div>
              <label className="text-xs text-muted-foreground">Model</label>
              <select
                value={String(form.model)}
                onChange={(e) => handleChange('model', e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select model</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="claude-3">Claude 3</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
            </div>
          </section>
        )}

        {kind === 'notification' && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-foreground">
                Notifications {form.optional ? 'On' : 'Off'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(form.optional)}
                onClick={() => handleChange('optional', !form.optional)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  form.optional ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition-transform ${
                    form.optional ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Channel</label>
              <select
                value={String(form.channel)}
                onChange={(e) => handleChange('channel', e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Slack">Slack</option>
                <option value="email">Email</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>
            <Field
              label="Destination"
              value={String(form.destination)}
              onChange={(v) => handleChange('destination', v)}
              placeholder="#dev-alerts, user@example.com, https://..."
            />
            <div>
              <label className="text-xs text-muted-foreground">Notify on</label>
              <select
                value={String(form.notifyOn)}
                onChange={(e) => handleChange('notifyOn', e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="success">Success only</option>
                <option value="failure">Failure only</option>
                <option value="both">Both</option>
              </select>
            </div>
          </section>
        )}

        <div className="mt-auto pt-4 border-t border-border">
          <Button onClick={handleSave} className="w-full">
            Save
          </Button>
        </div>
      </>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col"
        hideOverlay
        hideClose
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle className="text-left">
            {kind ? `${kind.charAt(0).toUpperCase() + kind.slice(1)}` : 'Node'} Inspector
          </SheetTitle>
        </SheetHeader>
        {hasData ? (
          <div className="mt-4 flex-1 overflow-y-auto space-y-4 flex flex-col">
            {renderForm()}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Select a node to inspect its properties.</p>
        )}
      </SheetContent>
    </Sheet>
  );
};
