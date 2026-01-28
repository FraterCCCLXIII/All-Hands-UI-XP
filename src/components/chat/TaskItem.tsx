import React from 'react';
import { Circle, CheckCircle2 } from 'lucide-react';
import { ThemeElement } from '../../types/theme';

interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  onToggle?: (id: string) => void;
  getThemeClasses: (element: ThemeElement) => string;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  completed,
  onToggle,
  getThemeClasses,
}) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={completed}
      onClick={() => onToggle?.(id)}
      className={[
        'group flex w-full items-start gap-3 p-3 rounded-lg transition-all duration-200 text-left',
        getThemeClasses('button-hover'),
        completed ? 'opacity-60' : '',
      ].join(' ')}
    >
      {completed ? (
        <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getThemeClasses('success-text')}`} />
      ) : (
        <Circle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getThemeClasses('status-text')}`} />
      )}
      <div className="flex-1 min-w-0">
        <p
          className={[
            'text-sm leading-relaxed',
            completed ? `line-through ${getThemeClasses('status-text')}` : getThemeClasses('text'),
          ].join(' ')}
        >
          {title}
        </p>
        <p className={`text-xs mt-1 ${getThemeClasses('status-text')}`}>ID: {id}</p>
      </div>
    </button>
  );
};
