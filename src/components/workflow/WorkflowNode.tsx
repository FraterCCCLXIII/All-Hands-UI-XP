import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FolderGit, Calendar, MessageSquare, Bell } from 'lucide-react';
import type { WorkflowNodeData } from '../../types/workflow';

const NODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  repo: FolderGit,
  schedule: Calendar,
  conversation: MessageSquare,
  notification: Bell,
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatScheduleLabel(d: WorkflowNodeData): string {
  const freq = d.scheduleFrequency ?? 'daily';
  const time = d.scheduleTime ?? '09:00';
  const tz = d.timezone ? ` (${d.timezone})` : '';
  if (freq === 'hourly') return `Hourly at :${String(time).padStart(2, '0')}${tz}`;
  if (freq === 'daily') return `Daily at ${time}${tz}`;
  if (freq === 'weekly' && d.scheduleDay !== undefined) {
    const day = WEEKDAYS[Number(d.scheduleDay)] ?? `Day ${d.scheduleDay}`;
    return `Weekly ${day} at ${time}${tz}`;
  }
  if (freq === 'monthly' && d.scheduleDay) return `Monthly on day ${d.scheduleDay} at ${time}${tz}`;
  return `Daily at ${time}${tz}`;
}

function getNodeIcon(id: string, type: string): React.ComponentType<{ className?: string }> {
  const byId = NODE_ICONS[id];
  if (byId) return byId;
  const typeMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Source: FolderGit,
    Trigger: Calendar,
    Agent: MessageSquare,
    Action: Bell,
  };
  return typeMap[type] ?? FolderGit;
}

const chipClass =
  'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px]';

const chipVariants: Record<string, string> = {
  default: 'border-border bg-muted/40 text-muted-foreground',
  plugin: 'border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-300',
  skill: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
};

type ChipItem = { value: string; variant?: keyof typeof chipVariants };

export const WorkflowNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const d = data as WorkflowNodeData;
  const Icon = getNodeIcon(id, d.type);

  const chips: ChipItem[] = [];
  if (d.repoPath) chips.push({ value: d.repoPath });
  if (d.branch) chips.push({ value: d.branch });
  if (d.triggerType === 'cron' && (d.scheduleFrequency || d.cronExpression)) {
    chips.push({
      value: d.scheduleFrequency ? formatScheduleLabel(d) : `${d.cronExpression}${d.timezone ? ` (${d.timezone})` : ''}`,
    });
  }
  if (d.triggerType && d.triggerType !== 'cron') {
    const label = d.triggerType === 'webhook' && d.webhookEvent
      ? `webhook: ${d.webhookEvent}`
      : d.triggerType;
    chips.push({ value: label });
  }
  if (d.destination) chips.push({ value: `${d.channel ?? 'Notify'}: ${d.destination}` });
  if (d.prompt) chips.push({ value: d.prompt.length > 28 ? `${d.prompt.slice(0, 28)}…` : d.prompt });
  if (d.plugins?.length) chips.push(...d.plugins.map((v) => ({ value: v, variant: 'plugin' as const })));
  if (d.skills?.length) chips.push(...d.skills.map((v) => ({ value: v, variant: 'skill' as const })));
  if (d.model) chips.push({ value: d.model });
  if (d.tag && !d.branch && id !== 'schedule' && id !== 'notification') chips.push({ value: d.tag });
  if (d.meta && !d.repoPath && !d.scheduleFrequency && !d.cronExpression && !d.destination) chips.push({ value: d.meta });

  const isNotificationOff = id === 'notification' && !d.optional;

  return (
    <div
      className={`w-64 rounded-lg border bg-card p-3 shadow-sm transition-colors border-border ${
        selected ? 'ring-2 ring-primary/50' : ''
      } ${isNotificationOff ? 'border-dashed opacity-90' : ''}`}
    >
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-border !bg-background" />
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`${chipClass} ${chipVariants.default} font-semibold text-foreground uppercase`}>{d.type}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip, i) => (
            <span
              key={`${chip.value}-${i}`}
              className={`${chipClass} ${chipVariants[chip.variant ?? 'default']}`}
              title={chip.value}
            >
              {chip.value}
            </span>
          ))}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-border !bg-background" />
    </div>
  );
};
