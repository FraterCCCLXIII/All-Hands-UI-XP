import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, GitBranch, ChevronDown } from 'lucide-react';
import { ThemeElement } from '../../types/theme';
import { WavingHand } from '../common/WavingHand';
import { SuggestedTasks } from './SuggestedTasks';

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
    <div className={`fixed inset-0 flex ${getThemeClasses('text')}`}>
      {/* Main content container */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[760px] flex flex-col h-full">
          <div className="flex flex-col h-full bg-stone-900">
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
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative" ref={repoDropdownRef}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-base ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')} hover:opacity-90`}
                        onClick={() => setShowRepoDropdown(!showRepoDropdown)}
                      >
                        <Github className="w-5 h-5" />
                        <span>Select Repo</span>
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

                    <div className="relative" ref={branchDropdownRef}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-base ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')} hover:opacity-90`}
                        onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                      >
                        <GitBranch className="w-5 h-5" />
                        <span>Select Branch</span>
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
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <span className={`text-base ${getThemeClasses('status-text')} mb-4`}>OR</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-3 rounded-md text-base border ${getThemeClasses('border')} ${getThemeClasses('text')} hover:bg-white hover:text-stone-900 transition-colors`}
                      onClick={handleCreateNewRepo}
                    >
                      New Repo
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Right column with suggested tasks - fixed to viewport */}
      <div className="fixed right-0 top-0 bottom-0 flex items-start">
        <div className="w-80 mt-4 mr-4 mb-4 h-[calc(100vh-3rem)]">
          <SuggestedTasks theme={theme} getThemeClasses={getThemeClasses} />
        </div>
      </div>
    </div>
  );
}; 