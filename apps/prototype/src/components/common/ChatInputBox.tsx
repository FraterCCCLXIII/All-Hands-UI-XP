import { useState, useRef } from 'react';
import {
  ArrowUp,
  ArrowDownToLine,
  ChevronDown,
  FileText,
  GitBranch,
  GitPullRequest,
  Hammer,
  ListChecks,
  Merge,
  MessageCircleQuestion,
  Microchip,
  Droplets,
  Paperclip,
  Settings,
  Sparkles,
  TestTube,
  Wrench,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { navigateAppRoute } from '../../lib/captureNavigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const LLM_MODELS = ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'GPT-4o', 'GPT-4o mini'] as const;
type LlmModel = (typeof LLM_MODELS)[number];
type ChatMode = 'build' | 'ask' | 'plan';

interface ChatInputBoxProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  className?: string;
}

export function ChatInputBox({ placeholder = 'What do you want to build?', onSend, className }: ChatInputBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>('build');
  const [selectedModel, setSelectedModel] = useState<LlmModel>('Claude 3.5 Sonnet');
  const inputRef = useRef<HTMLDivElement>(null);

  const hasInput = inputValue.trim().length > 0;

  const handleSend = () => {
    if (!hasInput) return;
    onSend?.(inputValue.trim());
    setInputValue('');
    if (inputRef.current) inputRef.current.innerText = '';
  };

  return (
    <div
      className={cn(
        'border border-border box-border flex flex-col items-start justify-center relative rounded-xl w-full bg-secondary',
        className
      )}
      style={{ padding: '0.75rem' }}
    >
      {/* Input row */}
      <div className="box-border flex flex-row items-end justify-between p-0 relative shrink-0 w-full pb-[18px] gap-2">
        <div className="relative min-w-0 flex-1 flex flex-row gap-4 items-end justify-start p-0">
          <button
            type="button"
            className="flex items-center justify-center rounded-full size-8 shrink-0 transition-all duration-200 hover:scale-105 hover:bg-muted active:scale-[0.97] cursor-not-allowed text-muted-foreground"
            aria-label="Attach"
          >
            <Paperclip className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1 flex flex-row items-start justify-start min-h-6 p-0">
            <div
              ref={inputRef}
              contentEditable
              data-placeholder={placeholder}
              data-testid="chat-input"
              className="chat-input min-w-0 max-w-full bg-transparent text-foreground text-base font-normal leading-5 outline-none resize-none custom-scrollbar min-h-5 max-h-[400px] w-full block break-words whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
              style={{ height: 20, overflowY: 'hidden' }}
              role="textbox"
              aria-multiline="true"
              onInput={(e) => setInputValue((e.target as HTMLDivElement).innerText)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
        </div>
        <button
          type="button"
          className={cn(
            'flex items-center justify-center rounded-full border size-[35px] transition-colors shrink-0',
            hasInput
              ? 'bg-primary text-primary-foreground border-primary cursor-pointer hover:opacity-90'
              : 'border-[hsl(0,0%,24%)] text-[hsl(0,0%,70%)] cursor-not-allowed'
          )}
          data-testid="submit-button"
          disabled={!hasInput}
          aria-label="Send"
          onClick={handleSend}
        >
          <ArrowUp className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      {/* Toolbar row */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2 flex-nowrap overflow-hidden">
        {/* Tools dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 cursor-pointer text-muted-foreground rounded-full border border-transparent bg-transparent px-2 py-0.5 transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground active:border-border active:bg-muted/60 active:text-foreground data-[state=open]:border-border data-[state=open]:bg-muted/50 data-[state=open]:text-foreground whitespace-nowrap shrink-0"
              aria-label="Tools"
              data-testid="tools-trigger"
            >
              <Wrench className="h-[13px] w-[13px] shrink-0" aria-hidden="true" />
              <span className="text-xs font-normal leading-4">Tools</span>
              <ChevronDown className="h-[11px] w-[11px] shrink-0 opacity-50" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" sideOffset={8} className="min-w-[200px] rounded-lg py-[6px] px-1 z-[100]">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                <GitBranch className="h-4 w-4 shrink-0" />
                Git Tools
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="rounded-lg min-w-[8rem]">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <ArrowDownToLine className="h-4 w-4" />
                  Git Pull
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <ArrowUp className="h-4 w-4" />
                  Git Push
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <GitPullRequest className="h-4 w-4" />
                  Create PR
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <GitBranch className="h-4 w-4" />
                  Create New Branch
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                <Merge className="h-4 w-4 shrink-0" />
                Macros
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="rounded-lg min-w-[8rem]">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <TestTube className="h-4 w-4" />
                  Increase test coverage
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  Fix README
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Merge className="h-4 w-4" />
                  Auto-merge PRs
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Droplets className="h-4 w-4" />
                  Clean dependencies
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Sparkles className="h-4 w-4" />
              Show Available Skills
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Wrench className="h-4 w-4" />
              Show Agent Tools &amp; Metadata
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mode dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center gap-1 cursor-pointer rounded-full border border-transparent px-2 py-0.5 transition-colors text-xs font-normal leading-4 whitespace-nowrap shrink-0',
                chatMode === 'build' && 'bg-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground data-[state=open]:border-border data-[state=open]:bg-muted/50 data-[state=open]:text-foreground',
                chatMode === 'ask' && 'border-info/50 bg-info/20 text-info hover:bg-info/30',
                chatMode === 'plan' && 'border-success/50 bg-success/20 text-success-foreground hover:bg-success/30'
              )}
              aria-label="Chat mode"
              data-testid="mode-pill"
            >
              {chatMode === 'build' && <Hammer className="w-4 h-4 shrink-0" aria-hidden="true" />}
              {chatMode === 'ask' && <MessageCircleQuestion className="w-4 h-4 shrink-0" aria-hidden="true" />}
              {chatMode === 'plan' && <ListChecks className="w-4 h-4 shrink-0" aria-hidden="true" />}
              <span>{chatMode === 'build' ? 'Build' : chatMode === 'ask' ? 'Ask' : 'Plan'}</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" sideOffset={8} className="min-w-[8rem] rounded-lg py-[6px] px-1 z-[100]">
            <DropdownMenuItem className="gap-2 cursor-pointer" onSelect={() => setChatMode('build')}>
              <Hammer className="h-4 w-4 shrink-0" />
              Build
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onSelect={() => setChatMode('ask')}>
              <MessageCircleQuestion className="h-4 w-4 shrink-0" />
              Ask
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onSelect={() => setChatMode('plan')}>
              <ListChecks className="h-4 w-4 shrink-0" />
              Plan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Model selector dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 cursor-pointer text-muted-foreground rounded-full border border-transparent bg-transparent px-2 py-0.5 transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground active:border-border active:bg-muted/60 active:text-foreground data-[state=open]:border-border data-[state=open]:bg-muted/50 data-[state=open]:text-foreground w-fit shrink-0 max-w-[160px]"
              aria-label="Select model"
              title={selectedModel}
              data-testid="model-trigger"
            >
              <Microchip className="h-[13px] w-[13px] shrink-0" aria-hidden="true" />
              <span className="text-xs font-normal leading-4 truncate">{selectedModel}</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" sideOffset={8} className="min-w-[200px] rounded-lg py-[6px] px-1 z-[100]">
            {LLM_MODELS.map((model) => (
              <DropdownMenuItem key={model} className="gap-2 cursor-pointer" onSelect={() => setSelectedModel(model)}>
                <Microchip className="h-4 w-4 shrink-0" />
                {model}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onSelect={() => {
                navigateAppRoute('/settings/llm');
              }}
            >
              <Settings className="h-4 w-4" />
              LLM Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
