export type UxTourPlacement = 'auto' | 'top' | 'bottom' | 'left' | 'right';

export type UxTourAction =
  | {
      type: 'navigate';
      /** App pathname, e.g. `/chat`, `/settings/llm` */
      to: string;
    }
  | {
      type: 'set-state';
      key: string;
      value: string | number | boolean | null;
    }
  | {
      type: 'wait-for-target';
      targetId: string;
      timeoutMs?: number;
    }
  | {
      type: 'delay';
      ms: number;
    };

export interface UxTourStep {
  id: string;
  title: string;
  body: string;
  targetId?: string;
  placement?: UxTourPlacement;
  beforeActions?: UxTourAction[];
  nextActions?: UxTourAction[];
  nextLabel?: string;
}

export interface UxTourDefinition {
  id: string;
  label: string;
  description?: string;
  /** Initial route when the tour starts (path-based). */
  startPath: string;
  steps: UxTourStep[];
}
