import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  GitBranch, 
  GitPullRequest, 
  ArrowUpToLine, 
  ChevronUp, 
  ChevronDown,
  Share2,
  PlayCircle
} from 'lucide-react';
import { ThemeElement } from '../../types/theme';

interface TopBarProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  projectTitle: string;
  onProjectTitleChange: (newTitle: string) => void;
  serverStatus: 'active' | 'stopped' | 'thinking';
  onServerStatusChange: (status: 'active' | 'stopped' | 'thinking') => void;
  onGitAction: (action: string) => void;
  onShare: () => void;
  onRun: () => void;
  isRunning: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  theme,
  getThemeClasses,
  projectTitle,
  onProjectTitleChange,
  serverStatus,
  onServerStatusChange,
  onGitAction,
  onShare,
  onRun,
  isRunning,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
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
                : getThemeClasses('status-dot-stopped')
            }`}
          />
          <div className={`absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${getThemeClasses('bg')} ${getThemeClasses('text')} shadow-lg`}>
            {serverStatus === 'active' ? 'Active' : serverStatus === 'thinking' ? 'Thinking' : 'Stopped'}
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

      {/* Center: Git Controls */}
      <div className="flex items-center space-x-3">
        {/* Repository Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')}`}
            onClick={() => setShowRepoDropdown(!showRepoDropdown)}
          >
            <Github className="w-4 h-4" />
            <span>my-project</span>
            {showRepoDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </motion.button>
          <AnimatePresence>
            {showRepoDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20`}
              >
                <div className="py-1">
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')}`}
                    onClick={() => onGitAction('select-repo-a')}
                  >
                    Repo A
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')}`}
                    onClick={() => onGitAction('select-repo-b')}
                  >
                    Repo B
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Branch Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')}`}
            onClick={() => setShowBranchDropdown(!showBranchDropdown)}
          >
            <GitBranch className="w-4 h-4" />
            <span>main</span>
            {showBranchDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </motion.button>
          <AnimatePresence>
            {showBranchDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20`}
              >
                <div className="py-1">
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')}`}
                    onClick={() => onGitAction('select-branch-develop')}
                  >
                    Develop
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')}`}
                    onClick={() => onGitAction('select-branch-feature')}
                  >
                    Feature/X
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Git Actions */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${getThemeClasses('pill-button-bg')} ${getThemeClasses('pill-button-text')}`}
          onClick={() => onGitAction('push')}
        >
          <ArrowUpToLine className="w-4 h-4" />
          <span>Push</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${getThemeClasses('pill-button-bg')} ${getThemeClasses('pill-button-text')}`}
          onClick={() => onGitAction('pull')}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Pull</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${getThemeClasses('pill-button-bg')} ${getThemeClasses('pill-button-text')}`}
          onClick={() => onGitAction('create-pr')}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Create PR</span>
        </motion.button>
      </div>

      {/* Right side: Share and Run buttons */}
      <div className="flex items-center space-x-3">
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
      </div>
    </nav>
  );
}; 