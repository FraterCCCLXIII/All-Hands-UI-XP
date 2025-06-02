import React from 'react';
import { Code, Terminal, GitFork, Globe, Monitor } from 'lucide-react';
import { ThemeElement } from '../../types/theme';

interface CanvasHeaderProps {
  getThemeClasses: (element: ThemeElement) => string;
  currentView: 'changes' | 'code' | 'terminal' | 'browser' | 'preview';
  isTerminalVisible: boolean;
  onViewChange: (view: 'changes' | 'code' | 'terminal' | 'browser' | 'preview') => void;
}

const navItems = [
  { id: 'changes', label: 'Changes', icon: GitFork },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'browser', label: 'Browser', icon: Globe },
  { id: 'preview', label: 'App Preview', icon: Monitor },
] as const;

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  getThemeClasses,
  currentView,
  isTerminalVisible,
  onViewChange,
}) => {
  return (
    <div className={`flex items-center border-b ${getThemeClasses('border')} py-2`}>
      <div className="flex items-center space-x-1 px-4 flex-nowrap whitespace-nowrap">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === currentView || (item.id === 'terminal' && isTerminalVisible);
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
                isActive
                  ? `${getThemeClasses('button-bg')} ${getThemeClasses('text')}`
                  : `${getThemeClasses('text')} opacity-60 hover:opacity-100`
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}; 