import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowLeft, StickyNote } from 'lucide-react';

export interface FlowchartNote {
  id: string;
  title: string;
  body: string;
}

export interface FlowchartNode {
  id: string;
  title: string;
  subtitle?: string;
  hash: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  frame?: { width: number; height: number; scale: number };
  notes?: FlowchartNote[];
}

export interface FlowchartEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

interface FlowchartLayoutProps {
  title: string;
  description?: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  onExit?: () => void;
}

const defaultFrame = { width: 1280, height: 720, scale: 0.22 };

const normalizeHash = (hash: string) => {
  if (hash.startsWith('#/')) return hash;
  if (hash.startsWith('#')) return `#/${hash.replace(/^#+/, '')}`;
  return `#/${hash.replace(/^\/+/, '')}`;
};

const buildEmbedSrc = (hash: string) => {
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}?embed=1${normalizeHash(hash)}`;
};

export const FlowchartLayout: React.FC<FlowchartLayoutProps> = ({
  title,
  description,
  nodes,
  edges,
  onExit,
}) => {
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});

  const handleFocusNode = useCallback((nodeId: string) => {
    nodeRefs.current[nodeId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }, []);

  const canvasSize = useMemo(() => {
    const padding = 160;
    const maxX = Math.max(...nodes.map((node) => node.position.x + node.size.width), 0);
    const maxY = Math.max(...nodes.map((node) => node.position.y + node.size.height), 0);
    return {
      width: Math.max(maxX + padding, 1200),
      height: Math.max(maxY + padding, 720),
    };
  }, [nodes]);

  const nodeMap = useMemo(() => {
    return nodes.reduce<Record<string, FlowchartNode>>((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});
  }, [nodes]);

  return (
    <div className="flex-1 min-h-0 min-w-0 flex bg-sidebar text-foreground">
      <aside className="w-64 shrink-0 border-r border-border bg-sidebar/80 px-4 py-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Flow steps</div>
        <div className="space-y-2">
          {nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => handleFocusNode(node.id)}
              className="w-full rounded-md border border-transparent bg-muted/40 px-3 py-2 text-left text-sm font-medium text-foreground transition hover:border-border hover:bg-muted"
            >
              {node.title}
              {node.subtitle && (
                <div className="text-xs text-muted-foreground mt-0.5">{node.subtitle}</div>
              )}
            </button>
          ))}
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-auto bg-muted/20">
          <div className="relative" style={{ width: canvasSize.width, height: canvasSize.height }}>
            <svg
              className="absolute inset-0 h-full w-full text-muted-foreground pointer-events-none"
              role="presentation"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="flowchart-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              {edges.map((edge) => {
                const from = nodeMap[edge.from];
                const to = nodeMap[edge.to];
                if (!from || !to) return null;
                const fromX = from.position.x + from.size.width;
                const fromY = from.position.y + from.size.height / 2;
                const toX = to.position.x;
                const toY = to.position.y + to.size.height / 2;
                return (
                  <path
                    key={edge.id}
                    d={`M ${fromX} ${fromY} L ${toX} ${toY}`}
                    className="stroke-current"
                    strokeWidth={2}
                    fill="none"
                    markerEnd="url(#flowchart-arrow)"
                  />
                );
              })}
            </svg>
            {nodes.map((node) => {
              const frame = node.frame ?? defaultFrame;
              const frameWidth = frame.width;
              const frameHeight = frame.height;
              const frameScale = frame.scale;
              const scaledWidth = frameWidth * frameScale;
              const scaledHeight = frameHeight * frameScale;
              const showNotes = openNotes[node.id];
              return (
                <div
                  key={node.id}
                  ref={(element) => {
                    nodeRefs.current[node.id] = element;
                  }}
                  className="absolute"
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: node.size.width,
                    height: node.size.height,
                  }}
                >
                  <div className="h-full w-full rounded-lg border border-border bg-card shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{node.title}</div>
                        {node.subtitle && (
                          <div className="text-xs text-muted-foreground">{node.subtitle}</div>
                        )}
                      </div>
                      {node.notes && node.notes.length > 0 && (
                        <button
                          type="button"
                          aria-expanded={showNotes}
                          aria-controls={`${node.id}-notes`}
                          onClick={() =>
                            setOpenNotes((prev) => ({ ...prev, [node.id]: !prev[node.id] }))
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/70"
                        >
                          <StickyNote className="h-3.5 w-3.5" />
                          Notes
                        </button>
                      )}
                    </div>
                    <div className="flex-1 bg-background/60 p-3">
                      <div
                        className="overflow-hidden rounded-md border border-border bg-background shadow-inner"
                        style={{ width: scaledWidth, height: scaledHeight }}
                      >
                        <iframe
                          title={`${node.title} preview`}
                          src={buildEmbedSrc(node.hash)}
                          loading="lazy"
                          className="origin-top-left"
                          style={{
                            width: frameWidth,
                            height: frameHeight,
                            transform: `scale(${frameScale})`,
                            transformOrigin: 'top left',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {showNotes && node.notes && (
                    <div
                      id={`${node.id}-notes`}
                      className="absolute left-full top-0 ml-4 w-64 rounded-lg border border-border bg-card p-3 text-sm text-foreground shadow-lg"
                    >
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Notes
                      </div>
                      <div className="space-y-2">
                        {node.notes.map((note) => (
                          <div key={note.id} className="rounded-md border border-border/60 bg-muted/40 p-2">
                            <div className="text-xs font-semibold text-foreground">{note.title}</div>
                            <p className="text-xs text-muted-foreground mt-1">{note.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
