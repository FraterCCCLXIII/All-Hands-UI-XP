import React from 'react';
import { motion } from 'framer-motion';
import { ThemeElement } from '../../types/theme';

interface SuggestedTasksProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
}

export const SuggestedTasks: React.FC<SuggestedTasksProps> = ({
  theme,
  getThemeClasses,
}) => {
  const tasks = [
    { id: 1, text: 'Resolve merge conflicts' },
    { id: 2, text: 'Fix LM Studio CORS issues with proxy server' },
    { id: 3, text: 'Launch' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`p-6 rounded-xl shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} w-80 h-full flex flex-col`}
    >
      <h3 className="text-lg font-normal mb-4">Suggested tasks</h3>
      <div className="divide-y divide-stone-700 flex-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center space-x-3 p-3 ${getThemeClasses('button-hover')} cursor-pointer hover:opacity-90 transition-opacity`}
          >
            <span className={`text-sm font-medium ${getThemeClasses('text')}`}>#{task.id}</span>
            <span className={`text-sm ${getThemeClasses('text')}`}>{task.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}; 