import React from 'react';
import { ThemeElement } from '../../types/theme';
import { TaskItem } from './TaskItem';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  getThemeClasses: (element: ThemeElement) => string;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, getThemeClasses }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1 py-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskItem
                id={task.id}
                title={task.title}
                completed={task.completed}
                onToggle={onToggle}
                getThemeClasses={getThemeClasses}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
