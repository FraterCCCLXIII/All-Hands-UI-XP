import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'all-hands:pageTransitionsEnabled';

function readStored(): boolean {
  try {
    if (typeof window === 'undefined') return true;
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === null) return true;
    return v !== 'false';
  } catch {
    return true;
  }
}

export type PageTransitionsContextValue = {
  pageTransitionsEnabled: boolean;
  setPageTransitionsEnabled: (enabled: boolean) => void;
};

const PageTransitionsContext = createContext<PageTransitionsContextValue | null>(null);

export function PageTransitionsProvider({ children }: { children: React.ReactNode }) {
  const [pageTransitionsEnabled, setState] = useState(readStored);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setState(e.newValue !== 'false');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setPageTransitionsEnabled = useCallback((enabled: boolean) => {
    setState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const value = useMemo(
    () => ({ pageTransitionsEnabled, setPageTransitionsEnabled }),
    [pageTransitionsEnabled, setPageTransitionsEnabled],
  );

  return (
    <PageTransitionsContext.Provider value={value}>{children}</PageTransitionsContext.Provider>
  );
}

export function usePageTransitions(): PageTransitionsContextValue {
  const ctx = useContext(PageTransitionsContext);
  if (!ctx) {
    throw new Error('usePageTransitions must be used within PageTransitionsProvider');
  }
  return ctx;
}
