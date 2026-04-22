import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Coins,
  Copy,
  Download,
  ExternalLink,
  MessageSquare,
  OctagonPause,
  Server,
} from 'lucide-react';
import { getWorkspaceLabel, isOrgAdminOrOwner } from '../config/accountWorkspaces';
import {
  fetchOrgConversationMetrics,
  fetchOrgConversationsFilteredAll,
  fetchOrgConversationsPage,
  type ConversationStatus,
  type OrgConversation,
  type OrgConversationMetrics,
  type OrgConversationsSortDir,
  type OrgConversationsSortField,
  type RuntimeStatus,
} from '../services/orgConversationsApi';
import { showAppToast } from '../lib/appToast';
import { cn } from '../lib/utils';
import {
  dataTableBodyClassName,
  dataTableClassName,
  dataTableHeadRowClassName,
  dataTableRowClassName,
  dataTableShellClassName,
  dataTableTh,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { RuntimeIcon } from '../components/icons/RuntimeIcon';
import { nativeSelectClassName, NativeSelect } from '../components/ui/native-select';
import { SearchInput } from '../components/ui/search-input';
import { SimulatedConversationSample } from '../components/chat/SimulatedConversationSample';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../components/ui/sheet';

const ORG_ADMIN_PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;

function stackCreatedUpdated(c: OrgConversation) {
  return {
    created: c.stackCreatedAt ?? c.createdAt,
    updated: c.stackUpdatedAt ?? c.updatedAt,
  };
}

function csvEscapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function orgConversationsToCsv(rows: OrgConversation[]): string {
  const headers = [
    'id',
    'name',
    'model',
    'createdBy',
    'createdByEmail',
    'conversationCreatedAt',
    'conversationUpdatedAt',
    'stackCreatedAt',
    'stackUpdatedAt',
    'conversationStatus',
    'runtimeStatus',
    'runtimeGuid',
    'runtimeUrl',
    'totalTokens',
    'totalCostUsd',
    'subagentCount',
  ];
  const lines = [headers.join(',')];
  for (const c of rows) {
    lines.push(
      [
        csvEscapeCell(c.id),
        csvEscapeCell(c.name),
        csvEscapeCell(c.model),
        csvEscapeCell(c.createdBy),
        csvEscapeCell(c.createdByEmail),
        csvEscapeCell(c.createdAt),
        csvEscapeCell(c.updatedAt),
        csvEscapeCell(c.stackCreatedAt ?? ''),
        csvEscapeCell(c.stackUpdatedAt ?? ''),
        csvEscapeCell(c.conversationStatus),
        csvEscapeCell(c.runtimeStatus),
        csvEscapeCell(c.runtimeGuid),
        csvEscapeCell(c.runtimeUrl),
        String(c.totalTokens),
        String(c.totalCostUsd),
        String(c.subagents.length),
      ].join(',')
    );
  }
  return lines.join('\r\n');
}

function downloadTextFile(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addCalendarDays(d: Date, days: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + days);
  return x;
}

type ActivityTimeWindowPreset = 'all' | 'rolling24h' | 'last7d' | 'last30d' | 'custom';

function timeWindowTriggerLabel(
  preset: ActivityTimeWindowPreset,
  from: string,
  to: string
): string {
  switch (preset) {
    case 'all':
      return 'All time';
    case 'rolling24h':
      return 'Last 24 hours (rolling)';
    case 'last7d':
      return 'Last 7 days';
    case 'last30d':
      return 'Last 30 days';
    case 'custom':
      if (from && to) return `Custom · ${from} → ${to}`;
      if (from) return `Custom · from ${from}`;
      if (to) return `Custom · until ${to}`;
      return 'Custom range…';
    default:
      return 'Time window';
  }
}

const timeWindowSubmenuDateClass =
  'h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

function OrgAdminTimeWindowMenu({
  activityTimeWindow,
  activityDateFrom,
  activityDateTo,
  onPresetChange,
  onCustomDateFrom,
  onCustomDateTo,
}: {
  activityTimeWindow: ActivityTimeWindowPreset;
  activityDateFrom: string;
  activityDateTo: string;
  onPresetChange: (v: ActivityTimeWindowPreset) => void;
  onCustomDateFrom: (v: string) => void;
  onCustomDateTo: (v: string) => void;
}) {
  const presetRows = [
    ['all', 'All time'],
    ['rolling24h', 'Last 24 hours (rolling)'],
    ['last7d', 'Last 7 days'],
    ['last30d', 'Last 30 days'],
  ] as const;

  return (
    <div className="relative w-full min-w-0">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          asChild
          className="w-full min-w-0 shrink !outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <button
            type="button"
            className={cn(
              nativeSelectClassName,
              'relative flex w-full min-w-0 items-center text-left font-normal'
            )}
            aria-label="Activity time window"
          >
            <span className="min-w-0 flex-1 truncate pr-1">
              {timeWindowTriggerLabel(activityTimeWindow, activityDateFrom, activityDateTo)}
            </span>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          </button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[16rem]">
        {presetRows.map(([value, label]) => (
          <DropdownMenuItem key={value} onSelect={() => onPresetChange(value)}>
            <span className="flex w-full items-center gap-2">
              {activityTimeWindow === value ? (
                <Check className="h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <span className="inline-block w-4 shrink-0" aria-hidden />
              )}
              {label}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {activityTimeWindow === 'custom' ? (
              <Check className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <span className="inline-block w-4 shrink-0" aria-hidden />
            )}
            <span className="truncate">Custom range…</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            sideOffset={6}
            className="w-[min(calc(100vw-2rem),18rem)] space-y-3 p-3"
          >
            <p className="text-xs text-muted-foreground">
              Local dates · matches <span className="text-foreground/90">last updated</span> (stack or conversation).
            </p>
            <div className="space-y-1">
              <label htmlFor="org-admin-tw-from" className="text-xs text-muted-foreground">
                From
              </label>
              <input
                id="org-admin-tw-from"
                type="date"
                className={timeWindowSubmenuDateClass}
                value={activityDateFrom}
                onChange={(e) => onCustomDateFrom(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="org-admin-tw-to" className="text-xs text-muted-foreground">
                To
              </label>
              <input
                id="org-admin-tw-to"
                type="date"
                className={timeWindowSubmenuDateClass}
                value={activityDateTo}
                onChange={(e) => onCustomDateTo(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}

function formatDt(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusPill(status: string, variant: 'conversation' | 'runtime') {
  const base =
    'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize';
  if (variant === 'conversation') {
    if (status === 'active') return cn(base, 'border-success/40 bg-success/15 text-success-foreground');
    if (status === 'completed') return cn(base, 'border-border bg-muted/40 text-muted-foreground');
    if (status === 'error') return cn(base, 'border-destructive/50 bg-destructive/15 text-destructive');
    return cn(base, 'border-border bg-muted/30 text-muted-foreground');
  }
  if (status === 'running') return cn(base, 'border-info/40 bg-info/10 text-info');
  if (status === 'starting') return cn(base, 'border-warning/40 bg-warning/10 text-warning');
  if (status === 'error') return cn(base, 'border-destructive/50 bg-destructive/15 text-destructive');
  return cn(base, 'border-border bg-muted/40 text-muted-foreground');
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-2 text-muted-foreground">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export interface OrgAdminDashboardScreenProps {
  activeWorkspaceId: string;
}

export function OrgAdminDashboardScreen({ activeWorkspaceId }: OrgAdminDashboardScreenProps) {
  const allowed = isOrgAdminOrOwner(activeWorkspaceId);
  const orgLabel = getWorkspaceLabel(activeWorkspaceId);

  const [metrics, setMetrics] = useState<OrgConversationMetrics | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(ORG_ADMIN_PAGE_SIZE_OPTIONS[0]);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<OrgConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drawerConv, setDrawerConv] = useState<OrgConversation | null>(null);
  const [localStopped, setLocalStopped] = useState<Record<string, true>>({});
  const [sortField, setSortField] = useState<OrgConversationsSortField>('updatedAt');
  const [sortDir, setSortDir] = useState<OrgConversationsSortDir>('desc');
  const [conversationFilter, setConversationFilter] = useState<ConversationStatus | 'all'>('all');
  const [runtimeFilter, setRuntimeFilter] = useState<RuntimeStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activityDateFrom, setActivityDateFrom] = useState('');
  const [activityDateTo, setActivityDateTo] = useState('');
  const [updatedWithinHours, setUpdatedWithinHours] = useState<number | null>(null);
  const [activityTimeWindow, setActivityTimeWindow] = useState<ActivityTimeWindowPreset>('all');

  const listQuery = useMemo(
    () => ({
      sortField,
      sortDir,
      conversationStatus: conversationFilter,
      runtimeStatus: runtimeFilter,
      search: searchQuery,
      ...(activityDateFrom.trim() ? { dateFrom: activityDateFrom.trim() } : {}),
      ...(activityDateTo.trim() ? { dateTo: activityDateTo.trim() } : {}),
      ...(updatedWithinHours != null && updatedWithinHours > 0
        ? { updatedWithinHours }
        : {}),
    }),
    [
      sortField,
      sortDir,
      conversationFilter,
      runtimeFilter,
      searchQuery,
      activityDateFrom,
      activityDateTo,
      updatedWithinHours,
    ]
  );

  const filtersActive =
    conversationFilter !== 'all' ||
    runtimeFilter !== 'all' ||
    searchQuery.trim().length > 0 ||
    activityDateFrom.trim().length > 0 ||
    activityDateTo.trim().length > 0 ||
    (updatedWithinHours != null && updatedWithinHours > 0);

  const handleActivityTimeWindowChange = (v: ActivityTimeWindowPreset) => {
    setActivityTimeWindow(v);
    setPage(1);
    switch (v) {
      case 'all':
        setActivityDateFrom('');
        setActivityDateTo('');
        setUpdatedWithinHours(null);
        break;
      case 'rolling24h':
        setUpdatedWithinHours(24);
        setActivityDateFrom('');
        setActivityDateTo('');
        break;
      case 'last7d': {
        const end = new Date();
        const start = addCalendarDays(end, -6);
        setActivityDateFrom(ymdLocal(start));
        setActivityDateTo(ymdLocal(end));
        setUpdatedWithinHours(null);
        break;
      }
      case 'last30d': {
        const end = new Date();
        const start = addCalendarDays(end, -29);
        setActivityDateFrom(ymdLocal(start));
        setActivityDateTo(ymdLocal(end));
        setUpdatedWithinHours(null);
        break;
      }
      case 'custom':
        setUpdatedWithinHours(null);
        break;
      default:
        break;
    }
  };

  const load = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    try {
      const [m, p] = await Promise.all([
        fetchOrgConversationMetrics(activeWorkspaceId),
        fetchOrgConversationsPage(activeWorkspaceId, page, pageSize, listQuery),
      ]);
      setMetrics(m);
      setRows(p.items);
      setTotal(p.total);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId, allowed, page, pageSize, listQuery]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const mergedRows = useMemo(
    () =>
      rows.map((r) =>
        localStopped[r.id]
          ? { ...r, conversationStatus: 'stopped' as const, runtimeStatus: 'stopped' as const }
          : r
      ),
    [rows, localStopped]
  );

  const handleExportCsv = useCallback(async () => {
    if (!allowed) return;
    try {
      const items = await fetchOrgConversationsFilteredAll(activeWorkspaceId, listQuery);
      const merged = items.map((r) =>
        localStopped[r.id]
          ? { ...r, conversationStatus: 'stopped' as const, runtimeStatus: 'stopped' as const }
          : r
      );
      const csv = orgConversationsToCsv(merged);
      const stamp = new Date().toISOString().slice(0, 10);
      const safeOrg = activeWorkspaceId.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 48);
      downloadTextFile(`org-conversations-${safeOrg}-${stamp}.csv`, csv, 'text/csv;charset=utf-8');
      showAppToast({
        variant: 'success',
        message: `Exported ${merged.length} conversation${merged.length === 1 ? '' : 's'}`,
      });
    } catch {
      showAppToast({ variant: 'error', message: 'Export failed' });
    }
  }, [activeWorkspaceId, allowed, listQuery, localStopped]);

  const handleStop = (c: OrgConversation) => {
    if (c.conversationStatus === 'stopped' || localStopped[c.id]) {
      showAppToast({ variant: 'success', message: 'Conversation already stopped' });
      return;
    }
    setLocalStopped((prev) => ({ ...prev, [c.id]: true }));
    showAppToast({ variant: 'success', message: `Stopped conversation “${c.name}”` });
  };

  const copyRuntimeGuid = useCallback((guid: string) => {
    void navigator.clipboard.writeText(guid);
    showAppToast({ variant: 'success', message: 'Runtime GUID copied' });
  }, []);

  if (!allowed) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <Server className="h-10 w-10 text-muted-foreground" aria-hidden />
        <div>
          <h1 className="text-lg font-semibold text-foreground">Admin dashboard</h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Switch to an organization where you are an <strong className="text-foreground">Owner</strong> or{' '}
            <strong className="text-foreground">Admin</strong> to monitor org-wide conversations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-background">
      <div className="flex flex-col gap-6 px-6 pb-8 pt-8">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold leading-6 tracking-tight text-foreground">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Org-wide OpenHands activity for <span className="text-foreground">{orgLabel}</span> — active sessions,
            runtimes, and triage.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Active conversations"
            value={metrics ? String(metrics.activeConversations) : '—'}
            hint="In-flight agent work"
            icon={MessageSquare}
          />
          <MetricCard
            label="Running runtimes"
            value={metrics ? String(metrics.runningRuntimes) : '—'}
            hint="Connected execution cells"
            icon={RuntimeIcon}
          />
          <MetricCard
            label="Completed (24h)"
            value={metrics ? String(metrics.completedLast24h) : '—'}
            hint="Finished in last day"
            icon={CheckCircle2}
          />
          <MetricCard
            label="Est. spend (sample)"
            value={metrics ? `$${metrics.estimatedSpendUsd.toFixed(2)}` : '—'}
            hint={`~${metrics ? (metrics.totalTokensWindow / 1000).toFixed(1) : '—'}k tokens in dataset`}
            icon={Coins}
          />
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filters</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 gap-1.5"
              onClick={() => void handleExportCsv()}
            >
              <Download className="h-4 w-4" aria-hidden />
              Export CSV
            </Button>
          </div>
          <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:gap-3">
            <label className="w-full min-w-0 space-y-2 xl:w-64 xl:shrink-0">
              <span className="flex h-5 items-center text-sm font-medium leading-none text-foreground">
                Search
              </span>
              <SearchInput
                id="org-admin-conv-search"
                placeholder="Name, creator, email, model…"
                value={searchQuery}
                onValueChange={(v) => {
                  setSearchQuery(v);
                  setPage(1);
                }}
                aria-label="Search conversations"
              />
            </label>
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <label className="min-w-0 space-y-2">
                <span className="flex h-5 items-center text-sm font-medium leading-none text-foreground">
                  Sort by
                </span>
                <NativeSelect
                  id="org-admin-sort-field"
                  aria-label="Sort by"
                  value={sortField}
                  onChange={(e) => {
                    setSortField(e.target.value as OrgConversationsSortField);
                    setPage(1);
                  }}
                >
                  <option value="updatedAt">Last updated</option>
                  <option value="createdAt">Created</option>
                  <option value="name">Name</option>
                  <option value="totalTokens">Tokens</option>
                  <option value="totalCostUsd">Cost (USD)</option>
                </NativeSelect>
              </label>
              <label className="min-w-0 space-y-2">
                <span className="flex h-5 items-center text-sm font-medium leading-none text-foreground">
                  Order
                </span>
                <NativeSelect
                  id="org-admin-sort-dir"
                  aria-label="Sort order"
                  value={sortDir}
                  onChange={(e) => {
                    setSortDir(e.target.value as OrgConversationsSortDir);
                    setPage(1);
                  }}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </NativeSelect>
              </label>
              <label className="min-w-0 space-y-2">
                <span className="flex h-5 items-center text-sm font-medium leading-none text-foreground">
                  Conversation status
                </span>
                <NativeSelect
                  id="org-admin-filter-conv-status"
                  aria-label="Conversation status"
                  value={conversationFilter}
                  onChange={(e) => {
                    setConversationFilter(e.target.value as ConversationStatus | 'all');
                    setPage(1);
                  }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="error">Error</option>
                  <option value="stopped">Stopped</option>
                </NativeSelect>
              </label>
              <label className="min-w-0 space-y-2">
                <span className="flex h-5 items-center text-sm font-medium leading-none text-foreground">
                  Runtime status
                </span>
                <NativeSelect
                  id="org-admin-filter-runtime-status"
                  aria-label="Runtime status"
                  value={runtimeFilter}
                  onChange={(e) => {
                    setRuntimeFilter(e.target.value as RuntimeStatus | 'all');
                    setPage(1);
                  }}
                >
                  <option value="all">All</option>
                  <option value="running">Running</option>
                  <option value="starting">Starting</option>
                  <option value="stopped">Stopped</option>
                  <option value="error">Error</option>
                </NativeSelect>
              </label>
              <div className="min-w-0 space-y-2">
                <span className="flex h-5 items-center text-sm font-medium leading-none text-foreground">
                  Time window
                </span>
                <OrgAdminTimeWindowMenu
                  activityTimeWindow={activityTimeWindow}
                  activityDateFrom={activityDateFrom}
                  activityDateTo={activityDateTo}
                  onPresetChange={handleActivityTimeWindowChange}
                  onCustomDateFrom={(v) => {
                    setActivityDateFrom(v);
                    setUpdatedWithinHours(null);
                    setActivityTimeWindow('custom');
                    setPage(1);
                  }}
                  onCustomDateTo={(v) => {
                    setActivityDateTo(v);
                    setUpdatedWithinHours(null);
                    setActivityTimeWindow('custom');
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className={cn(dataTableShellClassName)}>
            <div className="overflow-x-auto">
              <table className={dataTableClassName}>
              <thead>
                <tr className={dataTableHeadRowClassName}>
                  <th className={dataTableTh('w-8 px-2 text-left')} aria-label="Expand" />
                  <th className={dataTableTh('px-3 text-left')}>Conversation</th>
                  <th className={dataTableTh('px-3 text-left')}>Model</th>
                  <th className={dataTableTh('px-3 text-left')}>Created by</th>
                  <th className={dataTableTh('px-3 text-left')}>Status</th>
                  <th className={dataTableTh('px-3 text-left')}>Runtime</th>
                  <th className={dataTableTh('w-72 px-3 text-left')}>Runtime URL / GUID</th>
                  <th className={dataTableTh('px-3 text-left')}>Created / Updated</th>
                  <th className={dataTableTh('px-3 text-right')}>Tokens / cost</th>
                  <th className={dataTableTh('px-3 text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody className={dataTableBodyClassName}>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading org conversations…
                    </td>
                  </tr>
                ) : mergedRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      {filtersActive
                        ? 'No conversations match your search or filters.'
                        : 'No conversations in this page.'}
                    </td>
                  </tr>
                ) : (
                  mergedRows.map((c) => {
                    const expanded = expandedId === c.id;
                    const stack = stackCreatedUpdated(c);
                    return (
                      <React.Fragment key={c.id}>
                        <tr
                          className={cn(dataTableRowClassName, 'cursor-pointer')}
                          onClick={() => setExpandedId((id) => (id === c.id ? null : c.id))}
                        >
                          <td className="px-2 py-2 align-middle">
                            <button
                              type="button"
                              className="inline-flex rounded p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                              aria-expanded={expanded}
                              aria-label={expanded ? 'Collapse row' : 'Expand row'}
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedId((id) => (id === c.id ? null : c.id));
                              }}
                            >
                              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </td>
                          <td className="px-3 py-2 align-middle font-medium text-foreground">{c.name}</td>
                          <td className="px-3 py-2 align-middle font-mono text-xs text-muted-foreground">{c.model}</td>
                          <td className="px-3 py-2 align-middle text-sm text-muted-foreground">
                            <span className="text-foreground">{c.createdBy}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{c.createdByEmail}</span>
                          </td>
                          <td className="px-3 py-2 align-middle">
                            <span className={statusPill(c.conversationStatus, 'conversation')}>
                              {c.conversationStatus}
                            </span>
                          </td>
                          <td className="px-3 py-2 align-middle">
                            <span className={statusPill(c.runtimeStatus, 'runtime')}>{c.runtimeStatus}</span>
                          </td>
                          <td className="w-72 px-3 py-2 align-middle">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <a
                                href={c.runtimeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={c.runtimeGuid}
                                className="min-w-0 flex-1 truncate rounded p-1 font-mono text-xs text-foreground underline-offset-2 transition-colors hover:bg-muted/60 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {c.runtimeGuid}
                              </a>
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  className="inline-flex rounded p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                  aria-label="Copy runtime GUID"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyRuntimeGuid(c.runtimeGuid);
                                  }}
                                >
                                  <Copy className="h-3.5 w-3.5" aria-hidden />
                                </button>
                                <a
                                  href={c.runtimeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex rounded p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                  aria-label="Open runtime in new tab"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 align-middle text-xs text-muted-foreground whitespace-nowrap">
                            <span className="block">
                              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/90">
                                Created
                              </span>{' '}
                              <span className="text-foreground">{formatDt(stack.created)}</span>
                            </span>
                            <span className="mt-1 block">
                              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/90">
                                Updated
                              </span>{' '}
                              <span className="text-foreground">{formatDt(stack.updated)}</span>
                            </span>
                          </td>
                          <td className="px-3 py-2 align-middle text-right text-xs tabular-nums text-muted-foreground">
                            {c.totalTokens.toLocaleString()}
                            <span className="mt-0.5 block text-foreground">${c.totalCostUsd.toFixed(2)}</span>
                          </td>
                          <td className="px-3 py-2 align-middle text-right">
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 gap-1.5 rounded-md px-2.5 text-xs font-medium shadow-sm [&_svg]:size-3.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDrawerConv(c);
                                }}
                              >
                                <MessageSquare aria-hidden />
                                View
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 gap-1.5 rounded-md border-destructive/45 px-2.5 text-xs font-medium text-destructive shadow-sm hover:bg-destructive/10 [&_svg]:size-3.5"
                                disabled={
                                  localStopped[c.id] ||
                                  c.conversationStatus === 'stopped' ||
                                  c.runtimeStatus === 'stopped'
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStop(c);
                                }}
                              >
                                <OctagonPause aria-hidden />
                                Stop
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expanded ? (
                          <tr className="bg-muted/20">
                            <td colSpan={10} className="px-4 py-3">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Subagents &amp; usage
                              </p>
                              {c.subagents.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No subagent rows for this conversation.</p>
                              ) : (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                      <th className="py-2 pr-4 font-medium">Subagent</th>
                                      <th className="py-2 pr-4 font-medium">Model</th>
                                      <th className="py-2 pr-4 font-medium text-right">Tokens</th>
                                      <th className="py-2 font-medium text-right">Cost (USD)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {c.subagents.map((s) => (
                                      <tr key={s.id} className="border-b border-border/60">
                                        <td className="py-2 pr-4 text-foreground">{s.name}</td>
                                        <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{s.model}</td>
                                        <td className="py-2 pr-4 text-right tabular-nums text-muted-foreground">
                                          {s.tokens.toLocaleString()}
                                        </td>
                                        <td className="py-2 text-right tabular-nums text-foreground">
                                          ${s.costUsd.toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
              <label className="flex items-center gap-2">
                <span className="whitespace-nowrap text-muted-foreground">Per page</span>
                <NativeSelect
                  id="org-admin-page-size"
                  aria-label="Conversations per page"
                  wrapperClassName="w-auto shrink-0"
                  className="h-9 min-w-[4.25rem] py-0 pl-2 pr-8 text-sm"
                  value={String(pageSize)}
                  disabled={loading}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {ORG_ADMIN_PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </NativeSelect>
              </label>
            </div>
            <span>
              Page {page} of {totalPages}
              {' · '}
              {filtersActive
                ? `${total} matching conversation${total === 1 ? '' : 's'}`
                : `${total} conversation${total === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>
      </div>

      <Sheet open={drawerConv !== null} onOpenChange={(o) => !o && setDrawerConv(null)}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg sm:rounded-l-xl"
        >
          {drawerConv ? (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="sticky top-0 z-10 border-b border-border bg-modal px-6 pb-4 pt-6 pr-14">
                <SheetHeader className="space-y-2 text-left">
                  <SheetTitle className="pr-0 text-left">{drawerConv.name}</SheetTitle>
                  <SheetDescription className="text-left">
                    UI preview (chat-components sample) · {drawerConv.model} · {drawerConv.createdBy}
                  </SheetDescription>
                  <p className="text-left text-xs text-muted-foreground">
                    Conversation started {formatDt(drawerConv.createdAt)} · Last activity{' '}
                    {formatDt(drawerConv.updatedAt)}
                  </p>
                </SheetHeader>
              </div>
              <SimulatedConversationSample className="mx-0 flex w-full max-w-none flex-col gap-2 px-4 py-6 sm:px-5" />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
