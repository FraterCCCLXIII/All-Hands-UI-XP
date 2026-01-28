import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, GitBranch, ChevronDown, Plus } from 'lucide-react';
import { ThemeElement } from '../../types/theme';
import { WavingHand } from '../common/WavingHand';
import SuggestedTasks from './SuggestedTasks';

interface WelcomeScreenProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  userName: string;
  onRepoSelect: (repo: string) => void;
  onBranchSelect: (branch: string) => void;
  onCreateNewRepo: () => void;
  onClose: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  theme,
  getThemeClasses,
  userName,
  onRepoSelect,
  onBranchSelect,
  onCreateNewRepo,
  onClose,
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

  const handleCreateNewRepo = () => {
    onCreateNewRepo();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden w-screen h-screen max-w-full max-h-full">
      {/* Main content container */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[760px] flex flex-col h-full">
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <WavingHand className="w-16 h-16" color={theme === 'dark' ? '#e7e5e4' : theme === 'light' ? '#292524' : '#64503c'} />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl font-normal mb-6 text-center"
              >
                Welcome back, {userName}!
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`p-8 rounded-xl shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} max-w-lg text-center mx-auto`}
              >
                <h3 className="text-xl font-normal mb-6">Start a New Project or Continue</h3>
                
                <div className="flex flex-col md:flex-row justify-center items-center md:space-x-8 space-y-6 md:space-y-0">
                  <div className="flex flex-col items-center space-y-4 w-full max-w-md">
                    <div className="relative w-full" ref={repoDropdownRef}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex w-full items-center justify-between px-4 py-2 rounded-md text-base ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')} hover:opacity-90`}
                        onClick={() => setShowRepoDropdown(!showRepoDropdown)}
                      >
                        <div className="flex items-center space-x-2">
                           <Github className="w-5 h-5" />
                           <span>Select Repo</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </motion.button>
                      <AnimatePresence>
                        {showRepoDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute top-full left-0 right-0 mt-2 rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20`}
                          >
                            <div className="py-1">
                              <button
                                className={`block w-full text-left px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}
                                onClick={() => {
                                  onRepoSelect('current-repo');
                                  setShowRepoDropdown(false);
                                  onClose();
                                }}
                              >
                                Current Repository
                              </button>
                              <button
                                className={`block w-full text-left px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}
                                onClick={() => {
                                  onRepoSelect('another-repo');
                                  setShowRepoDropdown(false);
                                  onClose();
                                }}
                              >
                                Another Repository
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative w-full" ref={branchDropdownRef}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex w-full items-center justify-between px-4 py-2 rounded-md text-base ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')} hover:opacity-90`}
                        onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                      >
                        <div className="flex items-center space-x-2">
                           <GitBranch className="w-5 h-5" />
                           <span>Select Branch</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </motion.button>
                      <AnimatePresence>
                        {showBranchDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute top-full left-0 right-0 mt-2 rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20`}
                          >
                            <div className="py-1">
                              <button
                                className={`block w-full text-left px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}
                                onClick={() => {
                                  onBranchSelect('main');
                                  setShowBranchDropdown(false);
                                }}
                              >
                                main
                              </button>
                              <button
                                className={`block w-full text-left px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}
                                onClick={() => {
                                  onBranchSelect('develop');
                                  setShowBranchDropdown(false);
                                }}
                              >
                                develop
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button
                      className="text-xs text-stone-400 hover:text-stone-500 transition-colors flex items-center gap-1"
                      onClick={onCreateNewRepo}
                    >
                      <Plus className="w-3 h-3" />
                      Add Repository
                    </button>
                  </div>
                </div>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 max-w-lg mx-auto px-6 py-3 rounded-md text-base border border-stone-700 text-stone-200 hover:bg-white hover:text-stone-900 transition-colors"
                onClick={handleCreateNewRepo}
              >
                New Project
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Right column with suggested tasks - fixed to viewport */}
      <div className="fixed right-0 top-4 h-[calc(100vh-3rem)] w-80 mt-4 mr-4 mb-4 max-h-[calc(100vh-3rem)] overflow-hidden">
        <SuggestedTasks theme={theme} getThemeClasses={getThemeClasses} />
      </div>
    </div>
  );
}; 