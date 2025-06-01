import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatThread } from './components/chat/ChatThread';
import { Canvas } from './components/canvas/Canvas';
import { StatusIndicator } from './components/common/StatusIndicator';
import { TopBar } from './components/navigation/TopBar';
import { LeftNav } from './components/navigation/LeftNav';
import { Message, MessageType } from './types/message';
import { Theme, ThemeElement, ThemeClasses } from './types/theme';

const themeClasses: ThemeClasses = {
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
    'button-hover': 'hover:bg-stone-600',
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
    'button-hover': 'hover:bg-stone-300',
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
    'button-hover': 'hover:bg-[rgb(215,205,190)]',
  },
};

export const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<'active' | 'stopped' | 'thinking'>('active');
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
  const [projectTitle, setProjectTitle] = useState('My Project');
  const [activeNavItem, setActiveNavItem] = useState('code');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setInitialLoading(false);
    }, 1000);
  }, []);

  const getThemeClasses = useCallback((element: ThemeElement) => {
    return themeClasses[theme][element];
  }, [theme]);

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

  const handleCanvasToggle = useCallback((messageIndex: number) => {
    setSelectedMessageIndex(messageIndex);
    setCanvasVisible(true);
  }, []);

  const handleGitAction = useCallback((action: string) => {
    console.log('Git action:', action);
    // Implement git actions here
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

  return (
    <div className={`min-h-screen ${getThemeClasses('bg')} ${getThemeClasses('text')}`}>
      <div className="flex h-screen">
        {/* Left Navigation - now extends full height */}
        <LeftNav
          theme={theme}
          getThemeClasses={getThemeClasses}
          onNavItemClick={handleNavItemClick}
          activeItem={activeNavItem}
        />

        {/* Right side content area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <TopBar
            theme={theme}
            getThemeClasses={getThemeClasses}
            projectTitle={projectTitle}
            onProjectTitleChange={setProjectTitle}
            serverStatus={serverStatus}
            onServerStatusChange={setServerStatus}
            onGitAction={handleGitAction}
            onShare={handleShare}
            onRun={handleRun}
            isRunning={isRunning}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex">
            {/* Chat Thread */}
            <div className="flex-1 flex flex-col">
              <ChatThread
                theme={theme}
                getThemeClasses={getThemeClasses}
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={initialLoading}
                serverStatus={serverStatus}
                onServerStatusChange={setServerStatus}
                onCanvasToggle={handleCanvasToggle}
              />
            </div>

            {/* Canvas */}
            <AnimatePresence>
              {canvasVisible && selectedMessageIndex !== null && (
                <Canvas
                  theme={theme}
                  getThemeClasses={getThemeClasses}
                  isVisible={canvasVisible}
                  onClose={() => setCanvasVisible(false)}
                  onToggleMaximize={() => {}}
                  isMaximized={false}
                  content={{
                    type: 'code',
                    text: messages[selectedMessageIndex]?.text || '',
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}; 