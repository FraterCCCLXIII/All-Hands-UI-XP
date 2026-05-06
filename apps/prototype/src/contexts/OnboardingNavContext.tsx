import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'all-hands:onboardingNavVisible';

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

export type OnboardingNavContextValue = {
  onboardingNavVisible: boolean;
  setOnboardingNavVisible: (visible: boolean) => void;
};

const OnboardingNavContext = createContext<OnboardingNavContextValue | null>(null);

export function OnboardingNavProvider({ children }: { children: React.ReactNode }) {
  const [onboardingNavVisible, setState] = useState(readStored);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setState(e.newValue !== 'false');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setOnboardingNavVisible = useCallback((visible: boolean) => {
    setState(visible);
    try {
      localStorage.setItem(STORAGE_KEY, visible ? 'true' : 'false');
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const value = useMemo(
    () => ({ onboardingNavVisible, setOnboardingNavVisible }),
    [onboardingNavVisible, setOnboardingNavVisible],
  );

  return (
    <OnboardingNavContext.Provider value={value}>{children}</OnboardingNavContext.Provider>
  );
}

export function useOnboardingNav(): OnboardingNavContextValue {
  const ctx = useContext(OnboardingNavContext);
  if (!ctx) {
    throw new Error('useOnboardingNav must be used within OnboardingNavProvider');
  }
  return ctx;
}
