import React from 'react';
import { Eye, Code, FileText } from 'lucide-react';
import { ThemeElement } from '../../types/theme';

export type ChatWindowTabId = 'preview' | 'code' | 'docs';

interface ChatWindowTabsProps {
  activeTab: ChatWindowTabId;
  onTabChange: (tabId: ChatWindowTabId) => void;
  getThemeClasses: (element: ThemeElement) => string;
}

const chatWindowTabs: Array<{ id: ChatWindowTabId; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'preview', label: 'Preview', Icon: Eye },
  { id: 'code', label: 'Code', Icon: Code },
  { id: 'docs', label: 'Docs', Icon: FileText },
];

export const ChatWindowTabs: React.FC<ChatWindowTabsProps> = ({
  activeTab,
  onTabChange,
  getThemeClasses,
}) => {
  return (
    <div className="w-auto" dir="ltr">
      <div
        role="tablist"
        aria-orientation="horizontal"
        className={`inline-flex items-center justify-center rounded-md p-1 h-8 ${getThemeClasses('panel-bg')} ${getThemeClasses('status-text')}`}
      >
        {chatWindowTabs.map(({ id, label, Icon }) => {
          const isActive = id === activeTab;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`chat-window-${id}`}
              id={`chat-window-tab-${id}`}
              onClick={() => onTabChange(id)}
              className={[
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm font-medium transition-all text-xs px-2 py-1',
                isActive
                  ? `${getThemeClasses('active-button-bg')} ${getThemeClasses('active-button-text')}`
                  : getThemeClasses('status-text'),
              ].join(' ')}
            >
              <Icon className="w-3 h-3" />
              {label && <span className="ml-1">{label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
