import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2,
  PlayCircle,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { ThemeElement } from '../../types/theme';
import { ChatWindowTabs, ChatWindowTabId } from '../chat/ChatWindowTabs';

interface TopBarProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  projectTitle: string;
  onProjectTitleChange: (newTitle: string) => void;
  serverStatus: 'active' | 'stopped' | 'thinking' | 'connecting';
  onServerStatusChange: (status: 'active' | 'stopped' | 'thinking' | 'connecting') => void;
  onShare: () => void;
  onRun: () => void;
  isRunning: boolean;
  isCanvasVisible: boolean;
  onCanvasToggle: () => void;
  activeChatWindowTab: ChatWindowTabId;
  onChatWindowTabChange: (tabId: ChatWindowTabId) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  theme,
  getThemeClasses,
  projectTitle,
  onProjectTitleChange,
  serverStatus,
  onServerStatusChange,
  onShare,
  onRun,
  isRunning,
  isCanvasVisible,
  onCanvasToggle,
  activeChatWindowTab,
  onChatWindowTabChange,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
  };

  return (
    <nav className={`flex items-center justify-between px-4 py-3 ${getThemeClasses('bg')} flex-shrink-0`}>
      {/* Left side: Project Title and Status */}
      <div className="flex items-center space-x-4">
        <div 
          className="flex items-center cursor-pointer group relative"
          onClick={() => onServerStatusChange(serverStatus === 'active' ? 'stopped' : 'active')}
        >
          <div 
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              serverStatus === 'active' 
                ? getThemeClasses('status-dot-running')
                : serverStatus === 'thinking'
                ? 'animate-pulse bg-yellow-500'
                : serverStatus === 'connecting'
                ? 'animate-pulse bg-blue-500'
                : getThemeClasses('status-dot-stopped')
            }`}
          />
          <div className={`absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${getThemeClasses('bg')} ${getThemeClasses('text')} shadow-lg`}>
            {serverStatus === 'active' ? 'Active' : serverStatus === 'thinking' ? 'Thinking' : serverStatus === 'connecting' ? 'Connecting' : 'Stopped'}
          </div>
        </div>
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={projectTitle}
            onChange={(e) => onProjectTitleChange(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleTitleSubmit();
              }
            }}
            className={`bg-transparent border-b ${getThemeClasses('border')} focus:outline-none text-lg font-light ${getThemeClasses('text')}`}
          />
        ) : (
          <span 
            className="text-lg font-light cursor-pointer hover:opacity-80" 
            onClick={handleTitleEdit}
          >
            {projectTitle}
          </span>
        )}
      </div>

      {/* Right side: Share, Run, and Canvas Toggle buttons */}
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center mr-2">
          <ChatWindowTabs
            activeTab={activeChatWindowTab}
            onTabChange={onChatWindowTabChange}
            getThemeClasses={getThemeClasses}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-md ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')}`}
          onClick={onShare}
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-md ${isRunning ? getThemeClasses('stop-button-bg') : getThemeClasses('button-bg')} ${getThemeClasses('button-text')}`}
          onClick={onRun}
        >
          <PlayCircle className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
          <span>{isRunning ? 'Stop' : 'Run'}</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-2 rounded-md ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')}`}
          onClick={onCanvasToggle}
          title={isCanvasVisible ? "Hide Canvas" : "Show Canvas"}
        >
          {isCanvasVisible ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </motion.button>
      </div>
    </nav>
  );
}; 