import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

export interface FlowchartLink {
  id: string;
  label: string;
}

interface FlowchartLayoutProps {
  title: string;
  description?: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  flows?: FlowchartLink[];
  activeFlowId?: string;
  onFlowSelect?: (flowId: string) => void;
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

const FlowNodeFrame: React.FC<{
  title: string;
  hash: string;
  frame: { width: number; height: number };
}> = ({ title, hash, frame }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;
      const nextScale = Math.min(width / frame.width, height / frame.height);
      setScale(nextScale);
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [frame.height, frame.width]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden rounded-md border border-border bg-background shadow-inner">
      <iframe
        title={`${title} preview`}
        src={buildEmbedSrc(hash)}
        loading="lazy"
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: frame.width,
          height: frame.height,
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
};

export const FlowchartLayout: React.FC<FlowchartLayoutProps> = ({
  title,
  description,
  nodes,
  edges,
  flows = [],
  activeFlowId,
  onFlowSelect,
  onExit,
}) => {
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});
  const [isFlowNavOpen, setIsFlowNavOpen] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const panOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartRef = useRef<{
    distance: number;
    zoom: number;
    center: { x: number; y: number };
  } | null>(null);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);

  const handleFlowSelect = useCallback(
    (flowId: string) => {
      if (onFlowSelect) {
        onFlowSelect(flowId);
        return;
      }
      window.location.hash = `#/flows/${flowId}`;
    },
    [onFlowSelect]
  );

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

  const handleZoomChange = useCallback((nextZoom: number) => {
    const clamped = Math.min(2, Math.max(0.5, nextZoom));
    setZoom(clamped);
  }, []);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest('button, a, input, textarea, select, [data-pan-exclude="true"]'));
  };

  useEffect(() => {
    const handleDocumentWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
    };

    const handleGesture = (event: Event) => {
      event.preventDefault();
    };

    document.addEventListener('wheel', handleDocumentWheel, { passive: false });
    document.addEventListener('gesturestart', handleGesture as EventListener, { passive: false });
    document.addEventListener('gesturechange', handleGesture as EventListener, { passive: false });
    return () => {
      document.removeEventListener('wheel', handleDocumentWheel);
      document.removeEventListener('gesturestart', handleGesture as EventListener);
      document.removeEventListener('gesturechange', handleGesture as EventListener);
    };
  }, []);

  const getPoint = (event: React.PointerEvent) => ({
    x: event.clientX,
    y: event.clientY,
  });

  const distanceBetween = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const midpoint = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  const applyZoomAtPoint = (nextZoom: number, point: { x: number; y: number }) => {
    const currentZoom = zoomRef.current;
    const currentPan = panRef.current;
    const clamped = Math.min(2, Math.max(0.5, nextZoom));
    const worldX = (point.x - currentPan.x) / currentZoom;
    const worldY = (point.y - currentPan.y) / currentZoom;
    const nextPan = {
      x: point.x - worldX * clamped,
      y: point.y - worldY * clamped,
    };
    setZoom(clamped);
    setPan(nextPan);
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (isInteractiveTarget(event.target)) return;
    const point = getPoint(event);
    pointersRef.current.set(event.pointerId, point);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (pointersRef.current.size === 1) {
      panStartRef.current = point;
      panOriginRef.current = panRef.current;
      setIsPanning(true);
    }

    if (pointersRef.current.size === 2) {
      const points = Array.from(pointersRef.current.values());
      pinchStartRef.current = {
        distance: distanceBetween(points[0], points[1]),
        zoom: zoomRef.current,
        center: midpoint(points[0], points[1]),
      };
      panStartRef.current = null;
      setIsPanning(false);
    }
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    const point = getPoint(event);
    pointersRef.current.set(event.pointerId, point);

    if (pointersRef.current.size === 1 && panStartRef.current) {
      const delta = {
        x: point.x - panStartRef.current.x,
        y: point.y - panStartRef.current.y,
      };
      setPan({
        x: panOriginRef.current.x + delta.x,
        y: panOriginRef.current.y + delta.y,
      });
      return;
    }

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const points = Array.from(pointersRef.current.values());
      const nextDistance = distanceBetween(points[0], points[1]);
      const nextZoom = pinchStartRef.current.zoom * (nextDistance / pinchStartRef.current.distance);
      const center = midpoint(points[0], points[1]);
      applyZoomAtPoint(nextZoom, center);
    }
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    pointersRef.current.delete(event.pointerId);
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      panStartRef.current = null;
      setIsPanning(false);
    }
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    event.stopPropagation();
    const nextZoom = zoomRef.current - event.deltaY * 0.002;
    applyZoomAtPoint(nextZoom, { x: event.clientX, y: event.clientY });
  };

  return (
    <div className="flex-1 min-h-0 min-w-0 flex bg-sidebar text-foreground">
      {flows.length > 0 && (
        <aside
          className={`shrink-0 border-r border-border bg-sidebar/80 px-4 py-6 overflow-y-auto transition-all duration-200 ${
            isFlowNavOpen ? 'w-64' : 'w-14'
          }`}
        >
          <div className={`flex items-center ${isFlowNavOpen ? 'justify-between' : 'justify-center'} mb-4`}>
            {isFlowNavOpen && (
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Flowcharts</div>
            )}
            <button
              type="button"
              onClick={() => setIsFlowNavOpen((prev) => !prev)}
              aria-label={isFlowNavOpen ? 'Collapse flowcharts' : 'Expand flowcharts'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-foreground hover:bg-muted/70 transition-colors"
            >
              {isFlowNavOpen ? '«' : '»'}
            </button>
          </div>
          {isFlowNavOpen && (
            <div className="space-y-2">
              {flows.map((flow) => {
                const isActive = flow.id === activeFlowId;
                return (
                  <button
                    key={flow.id}
                    type="button"
                    onClick={() => handleFlowSelect(flow.id)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
                      isActive
                        ? 'border-border bg-muted text-foreground'
                        : 'border-transparent bg-muted/40 text-foreground hover:border-border hover:bg-muted'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {flow.label}
                  </button>
                );
              })}
            </div>
          )}
        </aside>
      )}
      <aside className="w-64 shrink-0 border-r border-border bg-sidebar/80 px-4 py-6 overflow-y-auto">
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
        <div className="flex-1 min-h-0 overflow-hidden bg-muted/20 relative">
          <div
            data-pan-exclude="true"
            className="absolute right-6 top-4 z-10 flex items-center gap-2 rounded-md border border-border bg-background/80 px-3 py-2 text-xs text-foreground shadow-sm backdrop-blur"
          >
            <span className="text-muted-foreground">Zoom</span>
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 0.1)}
              className="h-7 w-7 rounded-md border border-border bg-muted text-sm font-semibold text-foreground hover:bg-muted/70"
              aria-label="Zoom out"
            >
              −
            </button>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.05}
              value={zoom}
              onChange={(event) => handleZoomChange(Number(event.target.value))}
              className="w-24 accent-foreground"
              aria-label="Zoom level"
            />
            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 0.1)}
              className="h-7 w-7 rounded-md border border-border bg-muted text-sm font-semibold text-foreground hover:bg-muted/70"
              aria-label="Zoom in"
            >
              +
            </button>
            <span className="w-10 text-right text-muted-foreground">{Math.round(zoom * 100)}%</span>
          </div>
          <div
            data-flowchart-canvas="true"
            className={`relative h-full w-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            style={{ touchAction: 'none' }}
          >
            <div
              className="relative origin-top-left"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
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
                        <FlowNodeFrame title={node.title} hash={node.hash} frame={frame} />
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
    </div>
  );
};
