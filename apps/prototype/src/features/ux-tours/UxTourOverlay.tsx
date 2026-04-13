import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { findTourTarget, scrollTourTargetIntoView } from './uxTourTarget';
import { UxTourPlacement, UxTourStep } from './uxTourTypes';

interface UxTourOverlayProps {
  isActive: boolean;
  step: UxTourStep | null;
  stepIndex: number;
  totalSteps: number;
  isBusy: boolean;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}

const TOOLTIP_WIDTH = 340;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const computeTooltipPosition = (
  rect: DOMRect | null,
  placement: UxTourPlacement = 'auto'
): { left: number; top: number } => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 16;

  if (!rect) {
    return {
      left: clamp((viewportWidth - TOOLTIP_WIDTH) / 2, margin, viewportWidth - TOOLTIP_WIDTH - margin),
      top: clamp(viewportHeight / 2 - 120, margin, viewportHeight - 240),
    };
  }

  const fallbackTop = clamp(rect.bottom + 12, margin, viewportHeight - 240);
  const fallbackLeft = clamp(rect.left, margin, viewportWidth - TOOLTIP_WIDTH - margin);

  switch (placement) {
    case 'top':
      return {
        left: clamp(rect.left, margin, viewportWidth - TOOLTIP_WIDTH - margin),
        top: clamp(rect.top - 220, margin, viewportHeight - 240),
      };
    case 'left':
      return {
        left: clamp(rect.left - TOOLTIP_WIDTH - 12, margin, viewportWidth - TOOLTIP_WIDTH - margin),
        top: clamp(rect.top, margin, viewportHeight - 240),
      };
    case 'right':
      return {
        left: clamp(rect.right + 12, margin, viewportWidth - TOOLTIP_WIDTH - margin),
        top: clamp(rect.top, margin, viewportHeight - 240),
      };
    case 'bottom':
      return {
        left: fallbackLeft,
        top: fallbackTop,
      };
    case 'auto':
    default:
      return rect.bottom + 240 < viewportHeight
        ? { left: fallbackLeft, top: fallbackTop }
        : {
            left: clamp(rect.left, margin, viewportWidth - TOOLTIP_WIDTH - margin),
            top: clamp(rect.top - 220, margin, viewportHeight - 240),
          };
  }
};

export const UxTourOverlay: React.FC<UxTourOverlayProps> = ({
  isActive,
  step,
  stepIndex,
  totalSteps,
  isBusy,
  onNext,
  onBack,
  onClose,
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isActive || !step?.targetId) {
      setTargetRect(null);
      return;
    }

    let animationFrame = 0;
    let interval = 0;

    const updateRect = () => {
      const target = findTourTarget(step.targetId!);
      if (!target) {
        setTargetRect(null);
        return;
      }
      setTargetRect(target.getBoundingClientRect());
    };

    scrollTourTargetIntoView(step.targetId);
    updateRect();
    animationFrame = window.requestAnimationFrame(updateRect);
    interval = window.setInterval(updateRect, 150);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearInterval(interval);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isActive, step]);

  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowRight' && stepIndex + 1 <= totalSteps) {
        event.preventDefault();
        onNext();
        return;
      }
      if (event.key === 'ArrowLeft' && stepIndex > 0) {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onBack, onClose, onNext, stepIndex, totalSteps]);

  const overlayContent = useMemo(() => {
    if (!isActive || !step) return null;

    const tooltipPosition = computeTooltipPosition(targetRect, step.placement);
    const canGoBack = stepIndex > 0;

    return (
      <div className="fixed inset-0 z-[120] pointer-events-none" role="presentation" aria-hidden={!isActive}>
        <div className="absolute inset-0 bg-black/55" />
        {targetRect && (
          <div
            className="absolute rounded-md border border-primary/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
            style={{
              left: targetRect.left - 4,
              top: targetRect.top - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
            }}
          />
        )}
        <section
          className="pointer-events-auto absolute rounded-lg border border-border bg-card p-4 shadow-2xl"
          style={{ width: TOOLTIP_WIDTH, left: tooltipPosition.left, top: tooltipPosition.top }}
          role="dialog"
          aria-modal="true"
          aria-label={`Tutorial step ${stepIndex + 1} of ${totalSteps}`}
        >
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Step {stepIndex + 1} of {totalSteps}
          </div>
          <h3 className="mt-2 text-sm font-semibold text-foreground">{step.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
          {!targetRect && step.targetId && (
            <p className="mt-2 text-xs text-amber-300">
              Waiting for "{step.targetId}" to appear. You can still continue.
            </p>
          )}
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 rounded-md border border-border bg-muted px-3 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
            >
              Exit tour
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                disabled={!canGoBack || isBusy}
                className="h-8 rounded-md border border-border bg-muted px-3 text-xs font-medium text-foreground hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={isBusy}
                className="h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {step.nextLabel ?? (stepIndex + 1 >= totalSteps ? 'Finish' : 'Next')}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }, [isActive, isBusy, onBack, onClose, onNext, step, stepIndex, targetRect, totalSteps]);

  if (!isActive || !step) return null;
  return createPortal(overlayContent, document.body);
};
