import React, { useRef, useEffect, useState } from 'react';
import { Message } from './Message';
import { MessageInputPanel } from './MessageInputPanel';
import { GitControls } from '../git/GitControls';
import { WelcomeScreen } from './WelcomeScreen';
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
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(messages.length === 0);

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