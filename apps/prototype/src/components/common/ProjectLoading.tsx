import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const MESSAGES = [
  'Thinking deeply about your project... 🤔',
  'Consulting the codebase oracles... 🔮',
  'Optimizing for creativity and speed... 🚀',
  'Making sure everything is pixel-perfect... 🎨',
  "Double-checking the AI's work... 🤖",
  'Almost there, just a few more neurons... 🧠',
];

const ROTATE_INTERVAL = 2500;

const ProjectLoading: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        className="mb-6"
      >
        <Loader2 className="w-12 h-12 text-warning animate-spin" />
      </motion.div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Project Loading</h2>
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-muted-foreground text-base text-center min-w-[280px]"
          >
            {MESSAGES[index]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProjectLoading; 