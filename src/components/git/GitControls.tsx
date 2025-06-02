import React, { useState, useRef, useEffect } from 'react';
import { ThemeElement } from '../../types/theme';
import { Github, GitBranch, ChevronDown, ArrowUpToLine, GitPullRequest } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GitControlsProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  projectName: string;
  branchName: string;
  onPush: () => void;
  onPull: () => void;
  onCreatePR: () => void;
}

export const GitControls: React.FC<GitControlsProps> = ({
  getThemeClasses,
  projectName,
  branchName,
  onPush,
  onPull,
  onCreatePR,
}) => {
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const repoDropdownRef = useRef<HTMLDivElement>(null);
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (repoDropdownRef.current && !repoDropdownRef.current.contains(event.target as Node)) {
        setShowRepoDropdown(false);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setShowBranchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center space-x-2 mb-4">
      <div className="relative" ref={repoDropdownRef}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${getThemeClasses('stop-button-bg-subtle')} ${getThemeClasses('stop-button-text')} hover:opacity-90`}
          onClick={() => setShowRepoDropdown(!showRepoDropdown)}
        >
          <Github className="w-4 h-4" />
          <span>{projectName}</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>
        <AnimatePresence>
          {showRepoDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`absolute bottom-full left-0 mb-2 w-48 rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20`}
            >
              <div className="py-1">
                <button
                  className={`block w-full text-left px-4 py-2 text-xs ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}
                  onClick={() => {
                    // Handle repository selection
                    setShowRepoDropdown(false);
                  }}
                >
                  {projectName}
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-xs ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}
                  onClick={() => {
                    // Handle repository selection
                    setShowRepoDropdown(false);
                  }}
                >
                  New Repository
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative" ref={branchDropdownRef}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${getThemeClasses('stop-button-bg-subtle')} ${getThemeClasses('stop-button-text')} hover:opacity-90`}
          onClick={() => setShowBranchDropdown(!showBranchDropdown)}
        >
          <GitBranch className="w-4 h-4" />
          <span>{branchName}</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>
        <AnimatePresence>
          {showBranchDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`absolute bottom-full left-0 mb-2 w-48 rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20`}
            >
              <div className="py-1">
                <button
                  className={`block w-full text-left px-4 py-2 text-xs ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}
                  onClick={() => {
                    // Handle branch selection
                    setShowBranchDropdown(false);
                  }}
                >
                  {branchName}
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-xs ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}
                  onClick={() => {
                    // Handle branch selection
                    setShowBranchDropdown(false);
                  }}
                >
                  New Branch
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${getThemeClasses('stop-button-bg-subtle')} ${getThemeClasses('stop-button-text')} hover:opacity-90`}
        onClick={onPush}
      >
        <ArrowUpToLine className="w-4 h-4" />
        <span>Push</span>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${getThemeClasses('stop-button-bg-subtle')} ${getThemeClasses('stop-button-text')} hover:opacity-90`}
        onClick={onPull}
      >
        <ArrowUpToLine className="w-4 h-4 rotate-180" />
        <span>Pull</span>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${getThemeClasses('stop-button-bg-subtle')} ${getThemeClasses('stop-button-text')} hover:opacity-90`}
        onClick={onCreatePR}
      >
        <GitPullRequest className="w-4 h-4" />
        <span>Create PR</span>
      </motion.button>
    </div>
  );
}; 