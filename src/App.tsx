import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatArea } from './components/chat/ChatArea';
import { Canvas } from './components/canvas/Canvas';
import { StatusIndicator } from './components/common/StatusIndicator';
import { TopBar } from './components/navigation/TopBar';
import { LeftNav } from './components/navigation/LeftNav';
import { Message, MessageType } from './types/message';
import { Theme, ThemeElement, ThemeClassMap } from './types/theme';
import { LoadingScreen } from './screens';
import { Gripper } from './components/common/Gripper';
import { CanvasResizer } from './components/canvas/CanvasResizer';

const themeClasses: ThemeClassMap = {
  dark: {
    text: 'text-stone-200',
    bg: 'bg-stone-900',
    border: 'border-stone-700',
    'input-bg': 'bg-stone-800',
    'placeholder-text': 'placeholder-stone-500',
    'button-bg': 'bg-stone-700',
    'button-text': 'text-stone-200',
    'user-message-bg': 'bg-stone-700',
    'user-message-text': 'text-stone-200',
    'ai-message-bg': 'bg-stone-800',
    'ai-message-text': 'text-stone-200',
    'status-dot-running': 'bg-green-500',
    'status-dot-stopped': 'bg-red-500',
    'status-text': 'text-stone-400',
    'stop-button-bg': 'bg-red-500',
    'canvas-bg': 'bg-stone-900',
    'panel-bg': 'bg-stone-800',
    'active-button-bg': 'bg-stone-600',
    'active-button-text': 'text-white',
    'pill-button-bg': 'bg-stone-700',
    'pill-button-text': 'text-stone-200',
    'icon-color': 'text-stone-400',
    'hover-icon-color': 'hover:text-yellow-400',
    'hover-resizer-bg': 'hover:bg-yellow-500',
    'stop-button-bg-subtle': 'bg-stone-700',
    'stop-button-text': 'text-stone-200',
    'button-hover': 'hover:bg-stone-600',
    'scrollbar': 'scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-stone-800',
  },
  light: {
    text: 'text-stone-800',
    bg: 'bg-stone-100',
    border: 'border-stone-300',
    'input-bg': 'bg-white',
    'placeholder-text': 'placeholder-stone-400',
    'button-bg': 'bg-stone-200',
    'button-text': 'text-stone-800',
    'user-message-bg': 'bg-stone-200',
    'user-message-text': 'text-stone-800',
    'ai-message-bg': 'bg-white',
    'ai-message-text': 'text-stone-800',
    'status-dot-running': 'bg-green-500',
    'status-dot-stopped': 'bg-red-500',
    'status-text': 'text-stone-600',
    'stop-button-bg': 'bg-red-500',
    'canvas-bg': 'bg-stone-100',
    'panel-bg': 'bg-white',
    'active-button-bg': 'bg-stone-400',
    'active-button-text': 'text-stone-900',
    'pill-button-bg': 'bg-stone-200',
    'pill-button-text': 'text-stone-800',
    'icon-color': 'text-stone-600',
    'hover-icon-color': 'hover:text-amber-600',
    'hover-resizer-bg': 'hover:bg-amber-200',
    'stop-button-bg-subtle': 'bg-stone-300',
    'stop-button-text': 'text-stone-800',
    'button-hover': 'hover:bg-stone-300',
    'scrollbar': 'scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100',
  },
  sepia: {
    text: 'text-[rgb(100,80,60)]',
    bg: 'bg-[rgb(235,225,210)]',
    border: 'border-[rgb(215,205,190)]',
    'input-bg': 'bg-[rgb(245,235,220)]',
    'placeholder-text': 'placeholder-[rgb(180,160,140)]',
    'button-bg': 'bg-[rgb(225,215,200)]',
    'button-text': 'text-[rgb(100,80,60)]',
    'user-message-bg': 'bg-[rgb(225,215,200)]',
    'user-message-text': 'text-[rgb(100,80,60)]',
    'ai-message-bg': 'bg-[rgb(245,235,220)]',
    'ai-message-text': 'text-[rgb(100,80,60)]',
    'status-dot-running': 'bg-[rgb(120,180,120)]',
    'status-dot-stopped': 'bg-[rgb(180,120,120)]',
    'status-text': 'text-[rgb(140,120,100)]',
    'stop-button-bg': 'bg-[rgb(180,120,120)]',
    'canvas-bg': 'bg-[rgb(235,225,210)]',
    'panel-bg': 'bg-[rgb(245,235,220)]',
    'active-button-bg': 'bg-[rgb(200,190,175)]',
    'active-button-text': 'text-[rgb(100,80,60)]',
    'pill-button-bg': 'bg-[rgb(215,205,190)]',
    'pill-button-text': 'text-[rgb(100,80,60)]',
    'icon-color': 'text-[rgb(140,120,100)]',
    'hover-icon-color': 'hover:text-[rgb(160,140,120)]',
    'hover-resizer-bg': 'hover:bg-[rgb(200,190,175)]',
    'stop-button-bg-subtle': 'bg-[rgb(200,190,175)]',
    'stop-button-text': 'text-[rgb(100,80,60)]',
    'button-hover': 'hover:bg-[rgb(215,205,190)]',
    'scrollbar': 'scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-100',
  },
};

function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<'active' | 'stopped' | 'thinking' | 'connecting'>('active');
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
  const [projectTitle, setProjectTitle] = useState('My Project');
  const [activeNavItem, setActiveNavItem] = useState('code');
  const [isRunning, setIsRunning] = useState(false);
  const [isWelcomeScreenActive, setIsWelcomeScreenActive] = useState(true);
  const [isLeftNavExpanded, setIsLeftNavExpanded] = useState(false);
  
  // Canvas resizing state
  const [canvasWidth, setCanvasWidth] = useState(50); // Default to 50% width
  const minCanvasWidth = 30; // Minimum 30% width
  const maxCanvasWidth = 70; // Maximum 70% width

  const getThemeClasses = useCallback((element: ThemeElement): string => {
    return themeClasses[theme][element] || '';
  }, [theme]);

  const handleLoadingComplete = useCallback(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show loading screen for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    const userMessage: Message = {
      role: 'user',
      text: message,
      type: 'user',
      status: 'completed',
    };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const aiMessage: Message = {
        role: 'ai',
        text: 'This is a simulated AI response.',
        type: 'code',
        status: 'completed',
        headerText: 'AI Assistant',
        actions: [
          { label: 'Accept', action: 'accept' },
          { label: 'Reject', action: 'reject' },
        ],
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  }, []);

  const handleCanvasToggle = useCallback(() => {
    setCanvasVisible(prev => !prev);
  }, []);

  const handleNavItemClick = useCallback((action: string) => {
    setActiveNavItem(action);
    if (action === 'tetris') {
      const tetrisMessage: Message = {
        role: 'ai',
        text: 'Starting Tetris game...',
        type: 'tetris_game',
        status: 'completed',
      };
      setMessages(prev => [...prev, tetrisMessage]);
    }
  }, []);

  const handleShare = useCallback(() => {
    // Implement share functionality
    console.log('Share clicked');
  }, []);

  const handleRun = useCallback(() => {
    setIsRunning(prev => !prev);
    if (!isRunning) {
      const runMessage: Message = {
        role: 'ai',
        text: 'Starting the application...',
        type: 'build',
        status: 'in_progress',
      };
      setMessages(prev => [...prev, runMessage]);
    } else {
      const stopMessage: Message = {
        role: 'ai',
        text: 'Stopping the application...',
        type: 'build',
        status: 'completed',
      };
      setMessages(prev => [...prev, stopMessage]);
    }
  }, [isRunning]);

  const handleCanvasResize = useCallback((percentage: number) => {
    setCanvasWidth(Math.min(Math.max(percentage, minCanvasWidth), maxCanvasWidth));
  }, []);

  return (
    <div className={`h-screen flex flex-col ${getThemeClasses('bg')} ${getThemeClasses('text')}`}>
      <AnimatePresence>
        {isLoading ? (
          <LoadingScreen theme={theme} getThemeClasses={getThemeClasses} onLoadingComplete={handleLoadingComplete} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex relative overflow-hidden"
          >
            <LeftNav
              theme={theme}
              getThemeClasses={getThemeClasses}
              isExpanded={isLeftNavExpanded}
              onExpandChange={setIsLeftNavExpanded}
              onNavItemClick={handleNavItemClick}
              activeNavItem={activeNavItem}
            />
            <div 
              className={`flex-1 flex flex-col transition-all duration-200 ${
                isLeftNavExpanded ? 'ml-[17rem]' : 'ml-20'
              }`}
              style={{ minWidth: 0 }}
            >
              {!isWelcomeScreenActive && (
                <TopBar
                  theme={theme}
                  getThemeClasses={getThemeClasses}
                  projectTitle={projectTitle}
                  onProjectTitleChange={setProjectTitle}
                  serverStatus={serverStatus}
                  onServerStatusChange={setServerStatus}
                  onShare={handleShare}
                  onRun={handleRun}
                  isRunning={isRunning}
                  isCanvasVisible={canvasVisible}
                  onCanvasToggle={handleCanvasToggle}
                />
              )}
              <div className="flex-1 flex">
                <div className="flex w-full h-full">
                  {/* Chat Area Column */}
                  <div
                    className={`h-full transition-all duration-400 ease-out${!canvasVisible ? ' flex justify-center' : ''}`}
                    style={{
                      width: canvasVisible ? `calc(${100 - canvasWidth}% - 0.5rem)` : '100%',
                      minWidth: 0,
                      marginRight: canvasVisible ? '1rem' : 0,
                      ...(canvasVisible ? {} : { maxWidth: '760px' }),
                    }}
                  >
                    <ChatArea
                      theme={theme}
                      getThemeClasses={getThemeClasses}
                      messages={messages}
                      isProcessing={false}
                      serverStatus={serverStatus}
                      projectName={projectTitle}
                      branchName="main"
                      userName="User"
                      onSendMessage={handleSendMessage}
                      onServerStatusChange={setServerStatus}
                      onPush={handlePush}
                      onPull={handlePull}
                      onCreatePR={handleCreatePR}
                      onRepoSelect={handleRepoSelect}
                      onBranchSelect={handleBranchSelect}
                      onCreateNewRepo={handleCreateNewRepo}
                      onWelcomeScreenChange={setIsWelcomeScreenActive}
                    />
                  </div>
                  {/* Canvas Column */}
                  {canvasVisible && (
                    <div
                      className="h-full transition-all duration-400 ease-out flex flex-col mr-4"
                      style={{
                        width: `calc(${canvasWidth}% - 0.5rem)`,
                        minWidth: 0,
                      }}
                    >
                      <div className="flex-1 flex flex-col pb-4">
                        <Canvas
                          theme={theme}
                          getThemeClasses={getThemeClasses}
                          content={selectedMessageIndex !== null ? messages[selectedMessageIndex] : { type: 'user', text: '', headerText: 'Canvas' }}
                          onResize={handleCanvasResize}
                          initialWidth={canvasWidth}
                          minWidth={minCanvasWidth}
                          maxWidth={maxCanvasWidth}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const handlePush = () => {
  console.log('Push clicked');
};

const handlePull = () => {
  console.log('Pull clicked');
};

const handleCreatePR = () => {
  console.log('Create PR clicked');
};

const handleRepoSelect = (repo: string) => {
  console.log('Repo selected:', repo);
};

const handleBranchSelect = (branch: string) => {
  console.log('Branch selected:', branch);
};

const handleCreateNewRepo = () => {
  console.log('Create new repo clicked');
};

export default App; 