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
import { Message, MessageType } from '../../types/message';
import { ThemeElement } from '../../types/theme';

interface ChatThreadProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  serverStatus: 'active' | 'stopped' | 'thinking';
  onServerStatusChange: (status: 'active' | 'stopped' | 'thinking') => void;
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
  const [newMessage, setNewMessage] = useState('');
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);
  const [showServerControlDropdown, setShowServerControlDropdown] = useState(false);
  const serverControlDropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message Thread Area */}
      <div className="relative flex-grow overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-spinner"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-solid border-transparent border-t-white"></div>
                <p className="mt-4 text-white">Loading messages...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="loaded-messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative absolute inset-0 overflow-y-scroll space-y-4 px-4 pt-4 pb-4"
            >
              {/* Top Gradient - now contained within the scrollable area */}
              <div className={`sticky top-0 left-0 right-0 h-16 pointer-events-none z-10 ${theme === 'dark' ? 'bg-gradient-to-b from-stone-900 to-transparent' : theme === 'light' ? 'bg-gradient-to-b from-stone-100 to-transparent' : 'bg-gradient-to-b from-[rgb(235,225,210)] to-transparent'}`}></div>

              {/* Messages */}
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

              {/* Bottom Gradient - now contained within the scrollable area */}
              <div className={`sticky bottom-0 left-0 right-0 h-8 pointer-events-none z-10 ${theme === 'dark' ? 'bg-gradient-to-t from-stone-900 to-transparent' : theme === 'light' ? 'bg-gradient-to-t from-stone-100 to-transparent' : 'bg-gradient-to-t from-[rgb(235,225,210)] to-transparent'}`}></div>
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-stone-700">
        <div className="relative">
          <input
            type="text"
            className={`w-full ${getThemeClasses('input-bg')} ${getThemeClasses('text')} pl-3 pr-10 py-2 rounded-md focus:outline-none text-sm ${getThemeClasses('placeholder-text')}`}
            placeholder="What do you want to build?"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <motion.button
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full flex items-center justify-center ${getThemeClasses('button-bg')} hover:opacity-90 focus:outline-none`}
            onClick={handleSendMessage}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Server Status */}
      <div className={`p-2 flex items-center justify-between text-xs border-t ${getThemeClasses('border')}`}>
        <div 
          className="flex items-center space-x-2 relative group cursor-pointer" 
          onClick={() => setShowServerControlDropdown(!showServerControlDropdown)} 
          ref={serverControlDropdownRef}
        >
          <span className={`w-2 h-2 rounded-full ${serverStatus === 'active' ? getThemeClasses('status-dot-running') : getThemeClasses('status-dot-stopped')}`}></span>
          <span className={getThemeClasses('status-text')}>
            Server: {serverStatus === 'active' ? 'Running' : serverStatus === 'stopped' ? 'Stopped' : 'Thinking'}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-2 py-1 rounded-md text-xs ${serverStatus === 'active' ? getThemeClasses('stop-button-bg') : getThemeClasses('button-bg')} ${getThemeClasses('button-text')} hover:opacity-90`}
          onClick={() => onServerStatusChange(serverStatus === 'active' ? 'stopped' : 'active')}
        >
          {serverStatus === 'active' ? 'Stop' : 'Start'}
        </motion.button>
      </div>
    </div>
  );
};