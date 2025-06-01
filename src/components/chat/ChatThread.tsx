import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  ChevronRight, 
  CheckCircle, 
  CircleX,
  Code,
  Wrench,
  GitBranch,
  Bug,
  AlertCircle,
  Package,
  Shield,
  TestTube,
  FileText,
  Zap,
  Bot,
  Gamepad2,
  User,
  LucideIcon
} from 'lucide-react';
import { Spinner } from '../common/Spinner';
import { TetrisGame } from '../tetris/TetrisGame';
import { MessageInputPanel } from './MessageInputPanel';
import { Message, MessageType } from '../../types/message';
import { ThemeElement } from '../../types/theme';
import { GitControls } from '../git/GitControls';

interface ChatThreadProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  serverStatus: 'active' | 'stopped' | 'thinking' | 'connecting';
  onServerStatusChange: (status: 'active' | 'stopped' | 'thinking' | 'connecting') => void;
  onCanvasToggle: (messageIndex: number) => void;
}

const messageTypeIcons: Record<MessageType, LucideIcon> = {
  code: Code,
  build: Wrench,
  git: GitBranch,
  bug: Bug,
  error: AlertCircle,
  llm_error: AlertCircle,
  dependency: Package,
  security: Shield,
  test: TestTube,
  docs: FileText,
  performance: Zap,
  microagent_ready: Bot,
  tetris_game: Gamepad2,
  user: User,
  completed: CheckCircle,
  success: CheckCircle,
  fail: CircleX,
};

const messageTypeColors: Record<MessageType, { text: string; border: string; bg_subtle: string }> = {
  error: { text: 'text-red-500', border: 'border-red-500', bg_subtle: 'bg-red-500/20' },
  bug: { text: 'text-orange-500', border: 'border-orange-500', bg_subtle: 'bg-orange-500/20' },
  security: { text: 'text-yellow-500', border: 'border-yellow-500', bg_subtle: 'bg-yellow-500/20' },
  performance: { text: 'text-green-500', border: 'border-green-500', bg_subtle: 'bg-green-500/20' },
  test: { text: 'text-blue-500', border: 'border-blue-500', bg_subtle: 'bg-blue-500/20' },
  docs: { text: 'text-indigo-500', border: 'border-indigo-500', bg_subtle: 'bg-indigo-500/20' },
  dependency: { text: 'text-purple-500', border: 'border-purple-500', bg_subtle: 'bg-purple-500/20' },
  git: { text: 'text-pink-500', border: 'border-pink-500', bg_subtle: 'bg-pink-500/20' },
  llm_error: { text: 'text-red-500', border: 'border-red-500', bg_subtle: 'bg-red-500/20' },
  microagent_ready: { text: 'text-green-500', border: 'border-green-500', bg_subtle: 'bg-green-500/20' },
  build: { text: 'text-blue-500', border: 'border-blue-500', bg_subtle: 'bg-blue-500/20' },
  completed: { text: 'text-gray-400', border: 'border-gray-400', bg_subtle: 'bg-gray-400/20' },
  user: { text: '', border: '', bg_subtle: '' },
  success: { text: 'text-green-500', border: 'border-green-500', bg_subtle: 'bg-green-500/20' },
  fail: { text: 'text-red-500', border: 'border-red-500', bg_subtle: 'bg-red-500/20' },
  tetris_game: { text: 'text-purple-500', border: 'border-purple-500', bg_subtle: 'bg-purple-500/20' },
  code: { text: 'text-blue-500', border: 'border-blue-500', bg_subtle: 'bg-blue-500/20' },
};

const canvasChangingMessageTypes: MessageType[] = ['code', 'build', 'git', 'bug', 'error', 'llm_error', 'dependency', 'security', 'test', 'docs', 'performance', 'microagent_ready'];

export const ChatThread: React.FC<ChatThreadProps> = ({
  theme,
  getThemeClasses,
  messages,
  onSendMessage,
  isLoading,
  serverStatus,
  onServerStatusChange,
  onCanvasToggle,
}) => {
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);
  const [showServerControlDropdown, setShowServerControlDropdown] = useState(false);
  const serverControlDropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGitPush = () => {
    // Implement git push
    console.log('Git push clicked');
  };

  const handleGitPull = () => {
    // Implement git pull
    console.log('Git pull clicked');
  };

  const handleCreatePR = () => {
    // Implement create PR
    console.log('Create PR clicked');
  };

  return (
    <div className="flex flex-col h-full w-full items-center">
      <div className="w-full max-w-[760px] flex flex-col h-full group">
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 overflow-y-auto
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:transition-[background-color]
            [&::-webkit-scrollbar-thumb]:duration-300
            [&::-webkit-scrollbar-thumb]:ease-in-out
            group-hover:[&::-webkit-scrollbar-thumb]:bg-stone-600/30
            group-hover:[&::-webkit-scrollbar-thumb]:hover:bg-stone-600/50
            scrollbar-gutter:stable
            scrollbar-width:thin
            scrollbar-color:transparent transparent
            group-hover:scrollbar-color:rgb(87 83 78 / 0.3) transparent
            transition-[scrollbar-color]
            duration-300
            ease-in-out">
            {/* Top Gradient */}
            <div className={`sticky top-0 left-0 right-0 h-16 pointer-events-none z-10 ${theme === 'dark' ? 'bg-gradient-to-b from-stone-900 to-transparent' : theme === 'light' ? 'bg-gradient-to-b from-stone-100 to-transparent' : 'bg-gradient-to-b from-[rgb(235,225,210)] to-transparent'}`}></div>

            {/* Messages Container */}
            <div className="px-4 pt-4 pb-4 space-y-4">
              {messages.map((msg: Message, index: number) => {
                const IconComponent = messageTypeIcons[msg.type];
                const iconColorClass = messageTypeColors[msg.type]?.text;
                const borderColorClass = messageTypeColors[msg.type]?.border;
                const bgColorSubtleClass = messageTypeColors[msg.type]?.bg_subtle;

                const isUserMessage = msg.role === 'user';
                const isActionRequired = msg.status === 'action_required';
                const isInProgress = msg.status === 'in_progress';
                const isSuccess = msg.status === 'success';
                const isFail = msg.status === 'fail';
                const isPillMessage = msg.type === 'code' || msg.type === 'microagent_ready' || msg.type === 'build';
                const canOpenCanvas = canvasChangingMessageTypes.includes(msg.type);

                let CompletionIcon = null;
                let completionIconColorClass = '';
                if (isSuccess) {
                  CompletionIcon = CheckCircle;
                  completionIconColorClass = messageTypeColors.success.text;
                } else if (isFail) {
                  CompletionIcon = CircleX;
                  completionIconColorClass = messageTypeColors.fail.text;
                }

                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isUserMessage ? 'items-end' : 'items-start'}`}
                    onMouseEnter={() => setHoveredMessageIndex(index)}
                    onMouseLeave={() => setHoveredMessageIndex(null)}
                  >
                    {/* Message Header (for AI messages only) */}
                    {!isUserMessage && msg.headerText && (
                      <div className={`flex items-start space-x-1 mb-1 ${getThemeClasses('text')} opacity-75 text-xs`}>
                        {IconComponent && (
                          <IconComponent className={`w-3 h-3 ${iconColorClass}`} />
                        )}
                        <span>{msg.headerText}</span>
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] p-3 relative rounded-xl break-words
                        ${isUserMessage ? getThemeClasses('user-message-bg') : getThemeClasses('ai-message-bg')}
                        ${isUserMessage ? getThemeClasses('user-message-text') : getThemeClasses('text')}
                        ${borderColorClass ? `border ${borderColorClass}` : ''}
                        ${isPillMessage ? `${bgColorSubtleClass} border-opacity-50` : ''}
                        text-sm font-light cursor-pointer
                        ${canOpenCanvas ? 'hover:opacity-90' : ''}
                      `}
                      onClick={() => canOpenCanvas && onCanvasToggle(index)}
                    >
                      <div className="flex items-start space-x-2">
                        {msg.type === 'code' ? (
                          <pre className={`w-full overflow-auto rounded-md p-2 whitespace-pre-wrap ${theme === 'dark' ? 'bg-stone-800 text-stone-200' : theme === 'light' ? 'bg-stone-200 text-stone-800' : 'bg-[rgb(215,205,190)] text-[rgb(100,80,60)]'}`}>
                            <code>{msg.text}</code>
                          </pre>
                        ) : msg.type === 'tetris_game' ? (
                          <TetrisGame theme={theme} getThemeClasses={getThemeClasses} />
                        ) : (
                          <span className={isUserMessage ? '' : 'font-normal'}>
                            {msg.text}
                          </span>
                        )}

                        {isInProgress && (
                          <Spinner className="w-4 h-4 flex-shrink-0" />
                        )}
                        {CompletionIcon && !isInProgress && (
                          <CompletionIcon className={`w-4 h-4 flex-shrink-0 ${completionIconColorClass}`} />
                        )}
                        {canOpenCanvas && (
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 self-center ${iconColorClass}`} />
                        )}
                      </div>

                      {isActionRequired && msg.actions && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.actions.map((action: { label: string; action: string }, actionIdx: number) => (
                            <motion.button
                              key={actionIdx}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-2 py-1 rounded-md text-xs border ${borderColorClass} ${iconColorClass} hover:opacity-80`}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(`Action: ${action.action}`);
                              }}
                            >
                              {action.label}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message Actions (Like/Unlike, Copy) */}
                    {msg.role === 'ai' && (
                      <div className="h-6 mt-2 relative w-full">
                        <AnimatePresence>
                          {hoveredMessageIndex === index && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-0 left-0 flex space-x-2 text-xs opacity-75"
                            >
                              <motion.button className={`flex items-center ${getThemeClasses('button-text')} hover:text-white`}>
                                <ThumbsUp className="w-3 h-3" />
                              </motion.button>
                              <motion.button className={`flex items-center ${getThemeClasses('button-text')} hover:text-white`}>
                                <ThumbsDown className="w-3 h-3" />
                              </motion.button>
                              <motion.button className={`flex items-center ${getThemeClasses('button-text')} hover:text-white`}>
                                <Copy className="w-3 h-3" />
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Gradient */}
            <div className={`sticky bottom-0 left-0 right-0 h-8 pointer-events-none z-10 ${theme === 'dark' ? 'bg-gradient-to-t from-stone-900 to-transparent' : theme === 'light' ? 'bg-gradient-to-t from-stone-100 to-transparent' : 'bg-gradient-to-t from-[rgb(235,225,210)] to-transparent'}`}></div>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input Panel - Fixed at bottom */}
        <div className="flex-shrink-0">
          <MessageInputPanel
            theme={theme}
            getThemeClasses={getThemeClasses}
            onSendMessage={onSendMessage}
            serverStatus={serverStatus}
            onServerStatusChange={onServerStatusChange}
          />
          <GitControls
            theme={theme}
            getThemeClasses={getThemeClasses}
            projectName="my-project"
            branchName="main"
            onPush={handleGitPush}
            onPull={handleGitPull}
            onCreatePR={handleCreatePR}
          />
        </div>
      </div>
    </div>
  );
};