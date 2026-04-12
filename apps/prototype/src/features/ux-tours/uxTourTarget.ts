const DEFAULT_WAIT_TIMEOUT_MS = 5000;
const DEFAULT_WAIT_INTERVAL_MS = 100;

const escapeAttributeValue = (value: string) => value.replace(/"/g, '\\"');

export const getTourTargetSelector = (targetId: string) => {
  return `[data-tour-id="${escapeAttributeValue(targetId)}"]`;
};

export const findTourTarget = (targetId: string): HTMLElement | null => {
  const directMatch = document.querySelector<HTMLElement>(getTourTargetSelector(targetId));
  if (directMatch) return directMatch;

  const fallbackMatch = Array.from(document.querySelectorAll<HTMLElement>('[data-tour-id]')).find(
    (element) => element.getAttribute('data-tour-id') === targetId
  );
  return fallbackMatch ?? null;
};

export const scrollTourTargetIntoView = (targetId: string) => {
  const target = findTourTarget(targetId);
  if (!target) return null;
  target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  return target;
};

export const waitForTourTarget = (
  targetId: string,
  timeoutMs = DEFAULT_WAIT_TIMEOUT_MS,
  intervalMs = DEFAULT_WAIT_INTERVAL_MS
): Promise<HTMLElement> => {
  const initialTarget = findTourTarget(targetId);
  if (initialTarget) return Promise.resolve(initialTarget);

  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const target = findTourTarget(targetId);
      if (target) {
        window.clearInterval(interval);
        resolve(target);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        window.clearInterval(interval);
        reject(new Error(`Timed out waiting for target: ${targetId}`));
      }
    }, intervalMs);
  });
};
