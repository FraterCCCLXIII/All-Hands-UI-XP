import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Logo } from '../components/common/Logo';
import { ThemeElement } from '../types/theme';

interface LoadingScreenProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  isLoading?: boolean;
  onLoadingComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  theme,
  getThemeClasses,
  isLoading = true,
  onLoadingComplete,
}) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isLoading) {
      // Start the loading animation
      controls.start({
        width: '100%',
        transition: {
          duration: 2,
          ease: 'easeInOut',
        },
      }).then(() => {
        // Call the completion callback when animation finishes
        onLoadingComplete?.();
      });
    }
  }, [isLoading, controls, onLoadingComplete]);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-0 flex flex-col items-center justify-center ${getThemeClasses('bg')}`}
    >
      {/* Logo Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-8"
      >
        <Logo className="w-16 h-16" />
      </motion.div>

      {/* Loading Bar Container */}
      <div className="w-48 h-1 bg-stone-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getThemeClasses('button-bg')}`}
          initial={{ width: '0%' }}
          animate={controls}
        />
      </div>
    </motion.div>
  );
}; 