import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Message } from './Message';
import { MessageInputPanel } from './MessageInputPanel';
import { GitControls } from '../git/GitControls';
import { WelcomeScreen } from './WelcomeScreen';
import { DrawerTabs, DrawerTab } from './DrawerTabs';
import { TaskList, Task } from './TaskList';
import { ChangesView, FileChange } from './ChangesView';
import { ChatWindowTabId } from './ChatWindowTabs';
import { ThemeElement, Theme } from '../../types/theme';
import { Message as MessageType } from '../../types/message';

interface ChatAreaProps {
  theme: Theme;
  getThemeClasses: (element: ThemeElement) => string;
  messages: MessageType[];
  serverStatus: 'active' | 'stopped' | 'thinking' | 'connecting';
  projectName: string;
  branchName: string;
  userName: string;
  onSendMessage: (message: string) => void;
  onServerStatusChange: (status: 'active' | 'stopped' | 'thinking' | 'connecting') => void;
  onPush: () => void;
  onPull: () => void;
  onCreatePR: () => void;
  onRepoSelect: (repo: string) => void;
  onBranchSelect: (branch: string) => void;
  onCreateNewRepo: () => void;
  onWelcomeScreenChange?: (isActive: boolean) => void;
  activeChatWindowTab: ChatWindowTabId;
  onChatWindowTabChange: (tabId: ChatWindowTabId) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  theme,
  getThemeClasses,
  messages,
  serverStatus,
  projectName,
  branchName,
  userName,
  onSendMessage,
  onServerStatusChange,
  onPush,
  onPull,
  onCreatePR,
  onRepoSelect,
  onBranchSelect,
  onCreateNewRepo,
  onWelcomeScreenChange,
  activeChatWindowTab,
  onChatWindowTabChange,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(messages.length === 0);
  const [drawerActiveTab, setDrawerActiveTab] = useState<DrawerTab['id']>('tasks');
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'analyze_css_modules',
      title: 'Analyze current CSS modules usage in the project',
      completed: true,
    },
    {
      id: 'analyze_css_modules_2',
      title: 'Analyze current CSS modules usage in the project',
      completed: false,
    },
    {
      id: 'analyze_css_modules_3',
      title: 'Analyze current CSS modules usage in the project',
      completed: false,
    },
    {
      id: 'refactor_components',
      title: 'Refactor component architecture for better modularity',
      completed: false,
    },
    {
      id: 'implement_tests',
      title: 'Implement unit tests for core functionality',
      completed: false,
    },
    {
      id: 'optimize_bundle',
      title: 'Optimize bundle size and lazy load components',
      completed: false,
    },
    {
      id: 'update_dependencies',
      title: 'Update all dependencies to latest stable versions',
      completed: false,
    },
    {
      id: 'document_api',
      title: 'Document API endpoints and data structures',
      completed: true,
    },
    {
      id: 'accessibility_audit',
      title: 'Perform accessibility audit and fix issues',
      completed: false,
    },
    {
      id: 'performance_testing',
      title: 'Run performance testing and optimize bottlenecks',
      completed: false,
    },
  ]);

  const changes = useMemo<FileChange[]>(
    () => [
      { name: 'src/components/ChatInterface.tsx', additions: 45, deletions: 12 },
      { name: 'src/components/TaskList.tsx', additions: 23, deletions: 5 },
      { name: 'src/index.css', additions: 15, deletions: 3 },
      { name: 'tailwind.config.ts', additions: 6, deletions: 2 },
      { name: 'src/components/TaskItem.tsx', additions: 0, deletions: 1 },
    ],
    []
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    onWelcomeScreenChange?.(showWelcomeScreen);
  }, [showWelcomeScreen, onWelcomeScreenChange]);

  const handleWelcomeScreenClose = () => {
    setShowWelcomeScreen(false);
  };

  const handleTaskToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const drawerTabs = useMemo<DrawerTab[]>(() => {
    const completedCount = tasks.filter((task) => task.completed).length;
    const totalAdditions = changes.reduce((sum, change) => sum + change.additions, 0);
    const totalDeletions = changes.reduce((sum, change) => sum + change.deletions, 0);

    return [
      {
        id: 'tasks',
        label: 'Task List',
        badge: `${completedCount}/${tasks.length} Tasks Completed`,
      },
      {
        id: 'changes',
        label: 'Changes',
        stats: {
          additions: totalAdditions,
          deletions: totalDeletions,
          count: changes.length,
        },
      },
    ];
  }, [tasks, changes]);

  if (showWelcomeScreen) {
    return (
      <div className={`flex flex-col h-full w-full ${getThemeClasses('bg')}`}>
        <WelcomeScreen
          theme={theme}
          getThemeClasses={getThemeClasses}
          userName={userName}
          onRepoSelect={onRepoSelect}
          onBranchSelect={onBranchSelect}
          onCreateNewRepo={onCreateNewRepo}
          onClose={handleWelcomeScreenClose}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full w-full ${getThemeClasses('bg')}`}>
      <div className="flex items-center justify-end px-2 pt-2">
        <span className="sr-only">Chat window tabs (now in the top bar)</span>
      </div>
      <div className={`flex-1 overflow-y-auto space-y-4 ${getThemeClasses('scrollbar')}`}>
        {messages.map((message, index) => (
          <Message
            key={index}
            message={{
              role: message.role,
              text: message.text,
              headerText: message.headerText,
              actions: message.actions
            }}
            theme={theme}
            getThemeClasses={getThemeClasses}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div>
        <div className="flex-shrink-0 w-full flex justify-center">
          <div
            className={`w-full max-w-3xl transition-all duration-300 rounded-t-lg overflow-hidden ${isDrawerCollapsed ? 'h-12' : 'h-80'}`}
          >
            <DrawerTabs
              tabs={drawerTabs}
              activeTab={drawerActiveTab}
              onTabChange={setDrawerActiveTab}
              isCollapsed={isDrawerCollapsed}
              onToggleCollapse={() => setIsDrawerCollapsed((prev) => !prev)}
              getThemeClasses={getThemeClasses}
            />
            {!isDrawerCollapsed && (
              <div className="h-[calc(100%-48px)] overflow-hidden">
                {drawerActiveTab === 'tasks' ? (
                  <TaskList tasks={tasks} onToggle={handleTaskToggle} getThemeClasses={getThemeClasses} />
                ) : (
                  <ChangesView changes={changes} getThemeClasses={getThemeClasses} />
                )}
              </div>
            )}
          </div>
        </div>
        <MessageInputPanel
          getThemeClasses={getThemeClasses}
          onSendMessage={onSendMessage}
          serverStatus={serverStatus}
          onServerStatusChange={onServerStatusChange}
        />
        <GitControls
          theme={theme}
          getThemeClasses={getThemeClasses}
          projectName={projectName}
          branchName={branchName}
          onPush={onPush}
          onPull={onPull}
          onCreatePR={onCreatePR}
        />
      </div>
    </div>
  );
}; 