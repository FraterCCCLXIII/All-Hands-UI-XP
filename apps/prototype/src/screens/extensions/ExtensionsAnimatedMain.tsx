import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { usePageTransitions } from '../../contexts/PageTransitionsContext';

type ExtensionsAnimatedMainProps = {
  className?: string;
  children: React.ReactNode;
};

/**
 * Slides/fades only the extensions **main** column on route changes; keeps
 * {@link ExtensionsShellSidebar} outside this motion so the in-page left nav stays stable.
 */
export function ExtensionsAnimatedMain({ className, children }: ExtensionsAnimatedMainProps) {
  const location = useLocation();
  const { pageTransitionsEnabled } = usePageTransitions();
  const prefersReducedMotion = useReducedMotion();
  const motionOn = pageTransitionsEnabled && !prefersReducedMotion;

  const routeKey = `${location.pathname}${location.search}`;
  const transition = motionOn ? { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const } : { duration: 0 };

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={routeKey}
        className={className}
        initial={motionOn ? { opacity: 0, x: 28 } : false}
        animate={{ opacity: 1, x: 0 }}
        exit={motionOn ? { opacity: 0, x: -28 } : { opacity: 0 }}
        transition={transition}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
