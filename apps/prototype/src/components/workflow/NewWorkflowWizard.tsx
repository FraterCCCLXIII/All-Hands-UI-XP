import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { NewWorkflowData } from '../../data/workflowData';
import { PLUGIN_OPTIONS, SKILL_OPTIONS } from '../../data/workflowData';
import { BubbleSelect } from '../common/BubbleSelect';
import { FileText, FolderGit, Calendar, MessageSquare, Bell, ChevronRight } from 'lucide-react';

const STEPS = [
  { id: 'name', title: 'Name', icon: FileText },
  { id: 'repo', title: 'Repository', icon: FolderGit },
  { id: 'schedule', title: 'Schedule', icon: Calendar },
  { id: 'conversation', title: 'Conversation', icon: MessageSquare },
  { id: 'notification', title: 'Notification', icon: Bell },
] as const;

export interface NewWorkflowWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: NewWorkflowData) => void;
}

export const NewWorkflowWizard: React.FC<NewWorkflowWizardProps> = ({
  open,
  onOpenChange,
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<NewWorkflowData>({});

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  /** Name and repo are required; skills and plugins depend on the repo */
  const isRequiredStep = currentStep.id === 'name' || currentStep.id === 'repo';
  const canSkipStep = !isRequiredStep;

  const isNameValid = Boolean(data.name?.trim());
  const isRepoValid = Boolean(data.repo?.repoPath?.trim());
  const isCurrentStepValid =
    currentStep.id === 'name' ? isNameValid : currentStep.id === 'repo' ? isRepoValid : true;

  const update = <K extends keyof NewWorkflowData>(key: K, value: NewWorkflowData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete(data);
      onOpenChange(false);
      setStep(0);
      setData({});
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    if (!canSkipStep) return;
    if (isLastStep) {
      onComplete(data);
      onOpenChange(false);
      setStep(0);
      setData({});
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setStep(0);
      setData({});
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-background text-foreground border-border">
        <DialogHeader>
          <DialogTitle>New workflow</DialogTitle>
          <DialogDescription>
            Name and repository are required—skills and plugins depend on the repo. Other steps can be configured later in the inspector.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 py-2">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
              aria-hidden
            />
          ))}
        </div>

        <div className="min-h-[200px] py-4">
          {currentStep.id === 'name' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Workflow name</label>
                <Input
                  value={data.name ?? ''}
                  onChange={(e) => update('name', e.target.value || undefined)}
                  placeholder="e.g. Daily code review"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {currentStep.id === 'repo' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Repository</label>
                <select
                  value={data.repo?.repoPath ?? ''}
                  onChange={(e) => update('repo', { ...data.repo, repoPath: e.target.value || undefined })}
                  className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
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
                  value={data.repo?.branch ?? ''}
                  onChange={(e) => update('repo', { ...data.repo, branch: e.target.value || undefined })}
                  className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  <option value="">Select branch</option>
                  <option value="main">main</option>
                  <option value="develop">develop</option>
                  <option value="staging">staging</option>
                  <option value="release">release</option>
                </select>
              </div>
            </div>
          )}

          {currentStep.id === 'schedule' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Trigger type</label>
                <select
                  value={data.schedule?.triggerType ?? 'cron'}
                  onChange={(e) => update('schedule', { ...data.schedule, triggerType: e.target.value })}
                  className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  <option value="cron">Scheduled</option>
                  <option value="webhook">Webhook (GitHub Actions)</option>
                  <option value="on-push">On push</option>
                </select>
              </div>
              {data.schedule?.triggerType === 'webhook' && (
                <div>
                  <label className="text-xs text-muted-foreground">GitHub event</label>
                  <select
                    value={data.schedule?.webhookEvent ?? 'push'}
                    onChange={(e) => update('schedule', { ...data.schedule, webhookEvent: e.target.value })}
                    className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
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
              {data.schedule?.triggerType === 'on-push' && (
                <p className="text-xs text-muted-foreground">Runs on push to the selected branch. Configure branch filters in the inspector.</p>
              )}
              {(!data.schedule?.triggerType || data.schedule.triggerType === 'cron') && (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground">Frequency</label>
                    <select
                      value={data.schedule?.scheduleFrequency ?? 'daily'}
                      onChange={(e) => update('schedule', { ...data.schedule, scheduleFrequency: e.target.value })}
                      className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Time</label>
                    <input
                      type="time"
                      value={data.schedule?.scheduleTime ?? '09:00'}
                      onChange={(e) => update('schedule', { ...data.schedule, scheduleTime: e.target.value })}
                      className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Timezone</label>
                    <Input
                      value={data.schedule?.timezone ?? 'UTC'}
                      onChange={(e) => update('schedule', { ...data.schedule, timezone: e.target.value })}
                      placeholder="UTC"
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep.id === 'conversation' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Prompt</label>
                <textarea
                  value={data.conversation?.prompt ?? ''}
                  onChange={(e) => update('conversation', { ...data.conversation, prompt: e.target.value || undefined })}
                  placeholder="AI instruction..."
                  rows={3}
                  className="mt-1 flex w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <BubbleSelect
                label="Plugins"
                value={data.conversation?.plugins ?? []}
                onChange={(plugins) =>
                  update('conversation', { ...data.conversation, plugins: plugins.length ? plugins : undefined })
                }
                options={PLUGIN_OPTIONS}
                placeholder="None selected"
              />
              <BubbleSelect
                label="Skills"
                value={data.conversation?.skills ?? []}
                onChange={(skills) =>
                  update('conversation', { ...data.conversation, skills: skills.length ? skills : undefined })
                }
                options={SKILL_OPTIONS}
                placeholder="None selected"
              />
              <div>
                <label className="text-xs text-muted-foreground">Model</label>
                <select
                  value={data.conversation?.model ?? ''}
                  onChange={(e) => update('conversation', { ...data.conversation, model: e.target.value || undefined })}
                  className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  <option value="">Select model</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="claude-3">Claude 3</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                </select>
              </div>
            </div>
          )}

          {currentStep.id === 'notification' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={data.notification?.optional ?? true}
                  onClick={() =>
                    update('notification', {
                      ...data.notification,
                      optional: !(data.notification?.optional ?? true),
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    data.notification?.optional !== false ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform ${
                      data.notification?.optional !== false ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Channel</label>
                <select
                  value={data.notification?.channel ?? 'Slack'}
                  onChange={(e) => update('notification', { ...data.notification, channel: e.target.value })}
                  className="mt-1 flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  <option value="Slack">Slack</option>
                  <option value="email">Email</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Destination</label>
                <Input
                  value={data.notification?.destination ?? ''}
                  onChange={(e) => update('notification', { ...data.notification, destination: e.target.value || undefined })}
                  placeholder="#dev-alerts"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          {canSkipStep ? (
            <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
              Skip for now
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">
              {currentStep.id === 'name' && 'Name is required'}
              {currentStep.id === 'repo' && 'Repository is required for skills and plugins'}
            </span>
          )}
          <Button onClick={handleNext} disabled={!isCurrentStepValid}>
            {isLastStep ? 'Create workflow' : 'Next'}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
