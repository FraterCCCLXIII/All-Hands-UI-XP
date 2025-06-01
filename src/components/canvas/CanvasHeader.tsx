import React from 'react';
import { Code, Terminal, Settings, FileText, GitBranch, Bug, Shield, Package, TestTube, Zap } from 'lucide-react';
import { ThemeElement } from '../../types/theme';

interface CanvasHeaderProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  onClose: () => void;
  onMaximize: () => void;
  isMaximized: boolean;
  headerText?: string;
}

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  theme,
  getThemeClasses,
  onClose,
  onMaximize,
  isMaximized,
  headerText,
}) => {
  const navItems = [
    { icon: Code, label: 'Code', active: true },
    { icon: Terminal, label: 'Console' },
    { icon: Settings, label: 'Settings' },
    { icon: FileText, label: 'Docs' },
    { icon: GitBranch, label: 'Git' },
    { icon: Bug, label: 'Debug' },
    { icon: Shield, label: 'Security' },
    { icon: Package, label: 'Dependencies' },
    { icon: TestTube, label: 'Tests' },
    { icon: Zap, label: 'Performance' },
  ];

  return (
    <div className={`flex items-center space-x-1 px-2 py-1.5 border-b ${getThemeClasses('border')}`}>
      {navItems.map((item, index) => (
        <button
          key={index}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap
            ${item.active 
              ? `${getThemeClasses('active-button-bg')} ${getThemeClasses('active-button-text')}`
              : `${getThemeClasses('button-text')} hover:${getThemeClasses('button-bg')}`
            }`}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}; 