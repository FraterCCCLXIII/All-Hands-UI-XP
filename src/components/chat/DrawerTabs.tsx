import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ThemeElement } from '../../types/theme';

export interface DrawerTab {
  id: string;
  label: string;
  badge?: string;
  stats?: {
    additions?: number;
    deletions?: number;
    count?: number;
  };
}

interface DrawerTabsProps {
  tabs: DrawerTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  getThemeClasses: (element: ThemeElement) => string;
}

export const DrawerTabs: React.FC<DrawerTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  getThemeClasses,
}) => {
  return (
    <div
      className={`flex items-center border-b ${getThemeClasses('border')} ${getThemeClasses('panel-bg')}`}
      role="tablist"
      aria-label="Chat drawer tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`chat-drawer-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`chat-drawer-panel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={[
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2',
              isActive
                ? `${getThemeClasses('active-button-bg')} ${getThemeClasses('active-button-text')} border-current`
                : `${getThemeClasses('status-text')} border-transparent ${getThemeClasses('button-hover')}`,
            ].join(' ')}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-xs ${getThemeClasses('status-text')}`}>{tab.badge}</span>
            )}
            {tab.stats && (
              <div className="flex items-center gap-2 text-xs">
                {tab.stats.additions !== undefined && (
                  <span className={getThemeClasses('success-text')}>+{tab.stats.additions}</span>
                )}
                {tab.stats.deletions !== undefined && (
                  <span className={getThemeClasses('error-text')}>-{tab.stats.deletions}</span>
                )}
                {tab.stats.count !== undefined && (
                  <span className={getThemeClasses('status-text')}>{tab.stats.count} Files</span>
                )}
              </div>
            )}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onToggleCollapse}
        className={`ml-auto px-3 py-3 transition-colors ${getThemeClasses('status-text')} ${getThemeClasses('button-hover')}`}
        aria-label={isCollapsed ? 'Expand drawer' : 'Collapse drawer'}
        aria-expanded={!isCollapsed}
        aria-controls="chat-drawer-content"
      >
        {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
    </div>
  );
};
