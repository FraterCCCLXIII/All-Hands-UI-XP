import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sheet, SheetContent } from '../ui/sheet';

type BoxSideValues = {
  top: string;
  right: string;
  bottom: string;
  left: string;
};

type ElementInfo = {
  tagName: string;
  id: string | null;
  className: string;
  classes: string[];
  attributes: Array<{ name: string; value: string }>;
  html: string;
  dimensions: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  boxModel: {
    margin: BoxSideValues;
    padding: BoxSideValues;
    border: BoxSideValues;
  };
  computedStyles: string;
  componentName: string | null;
};

const INSPECTOR_IGNORE_ATTR = 'data-inspector-ignore';

const STYLE_KEYS = [
  'display',
  'position',
  'z-index',
  'width',
  'height',
  'max-width',
  'min-width',
  'max-height',
  'min-height',
  'margin',
  'padding',
  'gap',
  'color',
  'background-color',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'text-align',
  'border',
  'border-radius',
  'box-shadow',
  'opacity',
];

const toBoxSideValues = (style: CSSStyleDeclaration, prefix: 'margin' | 'padding' | 'border') => ({
  top: style.getPropertyValue(`${prefix}-top`),
  right: style.getPropertyValue(`${prefix}-right`),
  bottom: style.getPropertyValue(`${prefix}-bottom`),
  left: style.getPropertyValue(`${prefix}-left`),
});

const getComponentName = (element: HTMLElement) => {
  return (
    element.dataset.component ||
    element.dataset.componentName ||
    element.dataset.reactComponent ||
    element.getAttribute('data-component') ||
    element.getAttribute('data-component-name') ||
    element.getAttribute('data-react-component')
  );
};

const getElementInfo = (element: HTMLElement): ElementInfo => {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  const classes = typeof element.className === 'string' ? element.className.split(/\s+/).filter(Boolean) : [];
  const attributes = Array.from(element.attributes).map((attr) => ({ name: attr.name, value: attr.value }));
  const computedStyles = STYLE_KEYS
    .map((key) => `${key}: ${style.getPropertyValue(key)};`)
    .filter((line) => !line.endsWith(': ;'))
    .join('\n');

  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id || null,
    className: typeof element.className === 'string' ? element.className : '',
    classes,
    attributes,
    html: element.outerHTML,
    dimensions: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      bottom: Math.round(rect.bottom),
    },
    boxModel: {
      margin: toBoxSideValues(style, 'margin'),
      padding: toBoxSideValues(style, 'padding'),
      border: toBoxSideValues(style, 'border'),
    },
    computedStyles,
    componentName: getComponentName(element),
  };
};

const isInspectableElement = (target: EventTarget | null): target is HTMLElement => {
  if (!(target instanceof HTMLElement)) return false;
  return !target.closest(`[${INSPECTOR_IGNORE_ATTR}="true"]`);
};

export interface InspectorOverlayProps {
  enabled: boolean;
  onRequestDisable?: () => void;
}

export const InspectorOverlay = ({ enabled, onRequestDisable }: InspectorOverlayProps) => {
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<ElementInfo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hoveredElementRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const updateHoverRect = useCallback(() => {
    if (!hoveredElementRef.current) {
      setHoverRect(null);
      return;
    }
    setHoverRect(hoveredElementRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (!enabled) {
      hoveredElementRef.current = null;
      setHoverRect(null);
      setSelectedInfo(null);
      setDrawerOpen(false);
      document.body.style.cursor = '';
      return;
    }

    document.body.style.cursor = 'crosshair';

    const handleMouseMove = (event: MouseEvent) => {
      if (!isInspectableElement(event.target)) return;
      hoveredElementRef.current = event.target;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = window.requestAnimationFrame(updateHoverRect);
    };

    const handleClick = (event: MouseEvent) => {
      if (!isInspectableElement(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      const target = event.target as HTMLElement;
      setSelectedInfo(getElementInfo(target));
      setDrawerOpen(true);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        onRequestDisable?.();
      }
    };

    const handleScroll = () => updateHoverRect();
    const handleResize = () => updateHoverRect();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      document.body.style.cursor = '';
    };
  }, [enabled, onRequestDisable, updateHoverRect]);

  const spacingSummary = useMemo(() => {
    if (!selectedInfo) return '';
    const { margin, padding, border } = selectedInfo.boxModel;
    return [
      `margin: ${margin.top} ${margin.right} ${margin.bottom} ${margin.left};`,
      `padding: ${padding.top} ${padding.right} ${padding.bottom} ${padding.left};`,
      `border: ${border.top} ${border.right} ${border.bottom} ${border.left};`,
    ].join('\n');
  }, [selectedInfo]);

  if (!enabled) return null;

  return (
    <>
      {hoverRect && (
        <div
          {...{ [INSPECTOR_IGNORE_ATTR]: 'true' }}
          className="fixed pointer-events-none z-[60] border-2 border-primary/70 bg-primary/10"
          style={{
            top: `${hoverRect.top}px`,
            left: `${hoverRect.left}px`,
            width: `${hoverRect.width}px`,
            height: `${hoverRect.height}px`,
          }}
        />
      )}
      <div
        {...{ [INSPECTOR_IGNORE_ATTR]: 'true' }}
        className="fixed bottom-4 left-20 z-[60] rounded-md border border-border bg-background/95 px-3 py-2 text-xs text-foreground shadow-lg"
      >
        Inspector mode: hover to highlight, click to inspect, Esc to exit.
      </div>
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="right"
          hideOverlay
          className="w-full sm:max-w-2xl bg-background p-0 flex flex-col"
          {...{ [INSPECTOR_IGNORE_ATTR]: 'true' }}
        >
          <div className="border-b border-border px-4 py-3">
            <div className="text-sm font-semibold text-foreground">Inspector</div>
            <div className="text-xs text-muted-foreground">
              Click another element to refresh the selection.
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4 text-sm text-foreground">
            {!selectedInfo && (
              <div className="text-muted-foreground">No element selected yet.</div>
            )}
            {selectedInfo && (
              <>
                <section>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Element</div>
                  <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1">
                    <div><span className="text-muted-foreground">Tag:</span> {selectedInfo.tagName}</div>
                    <div><span className="text-muted-foreground">ID:</span> {selectedInfo.id || '—'}</div>
                    <div><span className="text-muted-foreground">Component:</span> {selectedInfo.componentName || 'Not available at runtime'}</div>
                    <div><span className="text-muted-foreground">Attributes:</span> {selectedInfo.attributes.length ? `${selectedInfo.attributes.length} found` : 'None'}</div>
                  </div>
                </section>
                <section>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Dimensions</div>
                  <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1">
                    <div><span className="text-muted-foreground">Size:</span> {selectedInfo.dimensions.width} × {selectedInfo.dimensions.height}px</div>
                    <div><span className="text-muted-foreground">Position:</span> x {selectedInfo.dimensions.x}, y {selectedInfo.dimensions.y}</div>
                    <div><span className="text-muted-foreground">Edges:</span> top {selectedInfo.dimensions.top}, right {selectedInfo.dimensions.right}, bottom {selectedInfo.dimensions.bottom}, left {selectedInfo.dimensions.left}</div>
                  </div>
                </section>
                <section>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Box Model</div>
                  <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap">{spacingSummary}</pre>
                </section>
                <section>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Classes (Tailwind or custom)</div>
                  <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap">{selectedInfo.className || '—'}</pre>
                </section>
                <section>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">HTML</div>
                  <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap max-h-64 overflow-auto">
                    {selectedInfo.html}
                  </pre>
                </section>
                <section>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Computed CSS</div>
                  <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap max-h-64 overflow-auto">
                    {selectedInfo.computedStyles || '—'}
                  </pre>
                </section>
                <section>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">JavaScript / TypeScript</div>
                  <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                    Runtime DOM inspection cannot derive source TypeScript/JS for this element. If you add
                    a <code className="font-mono">data-component</code> attribute, the inspector will surface it.
                  </div>
                </section>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
