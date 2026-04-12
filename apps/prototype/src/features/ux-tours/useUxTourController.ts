import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { waitForTourTarget } from './uxTourTarget';
import { UxTourAction, UxTourDefinition, UxTourStep } from './uxTourTypes';

const normalizeHash = (hash: string) => {
  if (hash.startsWith('#/')) return hash;
  if (hash.startsWith('#')) return `#/${hash.replace(/^#+/, '')}`;
  return `#/${hash.replace(/^\/+/, '')}`;
};

const waitForDelay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

interface UseUxTourControllerParams {
  tours: UxTourDefinition[];
  runAction: (action: Extract<UxTourAction, { type: 'navigate' | 'set-state' }>) => Promise<void> | void;
  onStop?: () => void;
}

export interface UxTourControllerState {
  isActive: boolean;
  activeTour: UxTourDefinition | null;
  activeStep: UxTourStep | null;
  stepIndex: number;
  totalSteps: number;
  isBusy: boolean;
}

export interface UxTourController extends UxTourControllerState {
  startTour: (tourId: string) => void;
  stopTour: () => void;
  nextStep: () => Promise<void>;
  previousStep: () => void;
}

export const useUxTourController = ({ tours, runAction, onStop }: UseUxTourControllerParams): UxTourController => {
  const toursById = useMemo(
    () => tours.reduce<Record<string, UxTourDefinition>>((acc, tour) => ({ ...acc, [tour.id]: tour }), {}),
    [tours]
  );
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [enteredStepKey, setEnteredStepKey] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const activeTour = activeTourId ? toursById[activeTourId] ?? null : null;
  const activeStep = activeTour?.steps[stepIndex] ?? null;

  const executeAction = useCallback(
    async (action: UxTourAction) => {
      if (action.type === 'delay') {
        await waitForDelay(action.ms);
        return;
      }

      if (action.type === 'wait-for-target') {
        await waitForTourTarget(action.targetId, action.timeoutMs);
        return;
      }

      await runAction(action);
    },
    [runAction]
  );

  const executeActions = useCallback(
    async (actions: UxTourAction[] = []) => {
      for (const action of actions) {
        await executeAction(action);
      }
    },
    [executeAction]
  );

  const stopTour = useCallback(() => {
    setActiveTourId(null);
    setStepIndex(0);
    setIsBusy(false);
    setEnteredStepKey(null);
    onStop?.();
  }, [onStop]);

  const startTour = useCallback(
    (tourId: string) => {
      const tour = toursById[tourId];
      if (!tour) return;
      setActiveTourId(tourId);
      setStepIndex(0);
      setEnteredStepKey(null);
      void (async () => {
        await executeAction({ type: 'navigate', hash: normalizeHash(tour.startHash) });
      })();
    },
    [executeAction, toursById]
  );

  const nextStep = useCallback(async () => {
    if (!activeTour || !activeStep) return;
    setIsBusy(true);
    try {
      await executeActions(activeStep.nextActions);
      const nextIndex = stepIndex + 1;
      if (nextIndex >= activeTour.steps.length) {
        stopTour();
        return;
      }
      setStepIndex(nextIndex);
      setEnteredStepKey(null);
    } finally {
      if (isMountedRef.current) {
        setIsBusy(false);
      }
    }
  }, [activeStep, activeTour, executeActions, isBusy, stepIndex, stopTour]);

  const previousStep = useCallback(() => {
    if (!activeTour || isBusy) return;
    setStepIndex((prev) => Math.max(0, prev - 1));
    setEnteredStepKey(null);
  }, [activeTour, isBusy]);

  useEffect(() => {
    if (!activeTour || !activeStep || isBusy) return;
    const stepKey = `${activeTour.id}:${activeStep.id}:${stepIndex}`;
    if (enteredStepKey === stepKey) return;

    let cancelled = false;

    const enterStep = async () => {
      setIsBusy(true);
      try {
        await executeActions(activeStep.beforeActions);
        if (!cancelled && isMountedRef.current) {
          setEnteredStepKey(stepKey);
        }
      } catch {
        if (!cancelled && isMountedRef.current) {
          setEnteredStepKey(stepKey);
        }
      } finally {
        if (!cancelled && isMountedRef.current) {
          setIsBusy(false);
        }
      }
    };

    void enterStep();

    return () => {
      cancelled = true;
    };
  }, [activeStep, activeTour, enteredStepKey, executeActions, stepIndex]);

  return {
    isActive: Boolean(activeTour),
    activeTour,
    activeStep,
    stepIndex,
    totalSteps: activeTour?.steps.length ?? 0,
    isBusy,
    startTour,
    stopTour,
    nextStep,
    previousStep,
  };
};
