import { useCallback, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, FileText, Folder } from 'lucide-react';
import { cn } from '@all-hands/ui';
import type { MarketplacePlugin } from '../data/plugins';

type PluginArtifactsPanelProps = {
  className?: string;
  plugin: MarketplacePlugin;
};

type FileKey = 'readme' | 'plugin-json' | 'code-review' | 'dependency-audit';

const FILE_LABELS: Record<FileKey, string> = {
  readme: 'README.md',
  'plugin-json': 'plugin.json',
  'code-review': 'code-review.md',
  'dependency-audit': 'dependency-audit.md',
};

function buildCodeReviewPreview(plugin: MarketplacePlugin): string {
  return `# ${plugin.name}

${plugin.description}

## Initial Prompt
Analyze this codebase for potential issues, security concerns, and improvement opportunities.
`;
}

function getPreviewContent(plugin: MarketplacePlugin, fileKey: FileKey): string {
  switch (fileKey) {
    case 'readme':
      return `# ${plugin.name}

${plugin.description}

## Overview
This plugin extends your OpenHands workspace with additional capabilities.
`;
    case 'plugin-json':
      return JSON.stringify(
        {
          name: plugin.name,
          version: '1.0.0',
          description: plugin.description,
          author: plugin.author,
        },
        null,
        2
      );
    case 'code-review':
      return buildCodeReviewPreview(plugin);
    case 'dependency-audit':
      return `# Dependency Audit

Audit dependencies for outdated packages, vulnerabilities, and license compliance.

## Initial Prompt
List outdated packages and summarize any known vulnerabilities in direct dependencies.
`;
    default:
      return buildCodeReviewPreview(plugin);
  }
}

type TreeFileButtonProps = {
  label: string;
  selected: boolean;
  onOpen: () => void;
};

function TreeFileButton({ label, selected, onOpen }: TreeFileButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs transition-colors',
        selected
          ? 'bg-muted/80 text-foreground'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      )}
    >
      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </button>
  );
}

export function PluginArtifactsPanel({ className, plugin }: PluginArtifactsPanelProps) {
  const [view, setView] = useState<'list' | 'file'>('list');
  /** Last-opened file (for preview + tree highlight); default matches reference: code-review.md selected in tree. */
  const [selectedFileKey, setSelectedFileKey] = useState<FileKey | null>('code-review');
  const [skillsOpen, setSkillsOpen] = useState(true);
  const [examplesOpen, setExamplesOpen] = useState(false);

  const openFile = useCallback((key: FileKey) => {
    setSelectedFileKey(key);
    setView('file');
  }, []);

  const backToList = useCallback(() => {
    setView('list');
  }, []);

  const isSelected = (key: FileKey) => selectedFileKey === key && view === 'list';

  return (
    <section
      className={cn(
        'flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card',
        className
      )}
      aria-label="Plugin file detail"
    >
      {view === 'list' ? (
        <>
          <div className="border-b border-border px-4 py-2">
            <span className="text-sm font-medium text-foreground">Files</span>
          </div>
          <div className="repo-dropdown-scroll min-h-0 flex-1 overflow-y-auto p-4">
            <ul className="space-y-0.5">
              <li>
                <TreeFileButton
                  label="README.md"
                  selected={isSelected('readme')}
                  onOpen={() => openFile('readme')}
                />
              </li>
              <li>
                <TreeFileButton
                  label="plugin.json"
                  selected={isSelected('plugin-json')}
                  onOpen={() => openFile('plugin-json')}
                />
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSkillsOpen((o) => !o)}
                  className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                >
                  {skillsOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  )}
                  <Folder className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">skills</span>
                </button>
                {skillsOpen ? (
                  <ul className="ml-4 mt-0.5 space-y-0.5">
                    <li>
                      <TreeFileButton
                        label="code-review.md"
                        selected={isSelected('code-review')}
                        onOpen={() => openFile('code-review')}
                      />
                    </li>
                    <li>
                      <TreeFileButton
                        label="dependency-audit.md"
                        selected={isSelected('dependency-audit')}
                        onOpen={() => openFile('dependency-audit')}
                      />
                    </li>
                  </ul>
                ) : null}
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setExamplesOpen((o) => !o)}
                  className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                >
                  {examplesOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  )}
                  <Folder className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">examples</span>
                </button>
                {examplesOpen ? (
                  <ul className="ml-4 mt-0.5 space-y-0.5">
                    <li className="px-2 py-1 text-xs text-muted-foreground">No files yet</li>
                  </ul>
                ) : null}
              </li>
            </ul>
          </div>
        </>
      ) : (
        selectedFileKey && (
          <>
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <button
                type="button"
                onClick={backToList}
                className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                <span>Back</span>
              </button>
              <span className="text-xs font-medium text-foreground">{FILE_LABELS[selectedFileKey]}</span>
            </div>
            <div className="repo-dropdown-scroll min-h-0 flex-1 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                {getPreviewContent(plugin, selectedFileKey)}
              </pre>
            </div>
          </>
        )
      )}
    </section>
  );
}
