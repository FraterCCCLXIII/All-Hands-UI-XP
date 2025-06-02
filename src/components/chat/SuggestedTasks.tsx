import React from 'react';
import { ThemeElement } from '../../types/theme';

interface SuggestedTasksProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
}

const tasks = [
  { id: 1, text: 'Resolve merge conflicts' },
  { id: 2, text: 'Fix LM Studio CORS issues with proxy server' },
  { id: 3, text: 'Launch' },
];

const SuggestedTasks: React.FC<SuggestedTasksProps> = () => {
  return (
    <div className="rounded-xl shadow-lg bg-stone-800 border border-stone-700 w-80 h-full flex flex-col">
      <h3 className="p-4 text-lg font-normal">Suggested tasks</h3>
      <div className="divide-y divide-stone-700 flex-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center space-x-3 p-3 hover:bg-stone-600 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="text-sm font-medium text-stone-200">#{task.id}</span>
            <span className="text-sm text-stone-200">{task.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedTasks; 