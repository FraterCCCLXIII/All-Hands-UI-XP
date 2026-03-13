import React, { useState, useMemo } from 'react';
import { ChevronDown, MoreVertical, Pencil, Power, PowerOff, Search, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import type { Workflow } from '../../data/workflowData';

export interface WorkflowToolbarProps {
  workflows: Workflow[];
  activeWorkflow: Workflow | null;
  onSelectWorkflow: (workflow: Workflow) => void;
  onToggleWorkflow: (workflowId: string, enabled: boolean) => void;
  onNewWorkflow: () => void;
  onRenameClick: () => void;
  onDeleteClick: () => void;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  workflows,
  activeWorkflow,
  onSelectWorkflow,
  onToggleWorkflow,
  onNewWorkflow,
  onRenameClick,
  onDeleteClick,
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      workflows.filter((w) =>
        w.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [workflows, search]
  );

  const triggerClass =
    'flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background/95 p-2 backdrop-blur">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={`${triggerClass} w-[280px]`} aria-haspopup="listbox">
            <span className="truncate">
              {activeWorkflow?.name ?? 'No workflow selected'}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[280px] p-0" onCloseAutoFocus={() => setSearch('')}>
          <div className="sticky top-0 z-10 border-b border-border bg-popover p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="h-9 pl-8 pr-3"
              />
            </div>
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No workflows found
              </div>
            ) : (
              filtered.map((w) => (
                <DropdownMenuItem
                  key={w.id}
                  onClick={() => onSelectWorkflow(w)}
                  className={activeWorkflow?.id === w.id ? 'bg-muted/60' : ''}
                >
                  <span className="truncate flex-1">{w.name}</span>
                  {!w.enabled && (
                    <span className="ml-2 text-xs text-muted-foreground">(off)</span>
                  )}
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeWorkflow && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Workflow options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={onRenameClick}>
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleWorkflow(activeWorkflow.id, !activeWorkflow.enabled)}
            >
              {activeWorkflow.enabled ? (
                <>
                  <PowerOff className="mr-2 h-4 w-4" />
                  Turn off
                </>
              ) : (
                <>
                  <Power className="mr-2 h-4 w-4" />
                  Turn on
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDeleteClick}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <button
        type="button"
        onClick={onNewWorkflow}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-white text-black hover:bg-white/90"
      >
        New workflow
      </button>
    </div>
  );
};
