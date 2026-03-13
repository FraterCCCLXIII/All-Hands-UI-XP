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
  Package,
  Paperclip,
  Settings,
  Sparkles,
  TestTube,
  Wrench,
} from 'lucide-react';
import { cn } from '../../lib/utils';
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
        'border border-border box-border flex flex-col items-start justify-center relative rounded-[15px] w-full bg-[#141414]',
        className
      )}
      style={{ padding: '0.75rem' }}
    >
      {/* Input row */}
      <div className="box-border flex flex-row items-center justify-between p-0 relative shrink-0 w-full pb-[18px] gap-2">
        <div className="basis-0 flex flex-row gap-4 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0">
          <button
            type="button"
            className="flex items-center justify-center rounded-full size-8 shrink-0 transition-all duration-200 hover:scale-105 hover:bg-muted active:scale-95 cursor-not-allowed text-muted-foreground"
            aria-label="Attach"
          >
            <Paperclip className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="flex flex-row items-center justify-start min-h-6 p-0 relative shrink-0 flex-1">
            <div
              ref={inputRef}
              contentEditable
              data-placeholder={placeholder}
              data-testid="chat-input"
              className="chat-input bg-transparent text-foreground text-base font-normal leading-5 outline-none resize-none custom-scrollbar min-h-5 max-h-[400px] w-full block whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
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
      <div className="w-full flex items-center gap-2 flex-nowrap overflow-hidden">
        {/* Tools dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 cursor-pointer text-muted-foreground rounded-[100px] border border-border bg-muted/30 px-2 py-0.5 transition-colors hover:bg-muted/50 hover:text-foreground active:bg-muted/60 active:text-foreground data-[state=open]:bg-muted/50 data-[state=open]:text-foreground whitespace-nowrap shrink-0"
              aria-label="Tools"
              data-testid="tools-trigger"
            >
              <Wrench className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="text-xs font-normal leading-4">Tools</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-[200px] rounded-[6px] py-[6px] px-1 z-[100]">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                <GitBranch className="h-4 w-4 shrink-0" />
                Git Tools
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="rounded-[6px] min-w-[8rem]">
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
              <DropdownMenuSubContent className="rounded-[6px] min-w-[8rem]">
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
                  <Package className="h-4 w-4" />
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
                'flex items-center gap-1 cursor-pointer rounded-[100px] border px-2 py-0.5 transition-colors text-xs font-normal leading-4 hover:opacity-90 data-[state=open]:opacity-90 whitespace-nowrap shrink-0',
                chatMode === 'build' && 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                chatMode === 'ask' && 'border-blue-500/50 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30',
                chatMode === 'plan' && 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
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
          <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-[8rem] rounded-[6px] py-[6px] px-1 z-[100]">
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
              className="flex items-center gap-1 cursor-pointer text-muted-foreground rounded-[100px] border border-border bg-muted/30 px-2 py-0.5 transition-colors hover:bg-muted/50 hover:text-foreground active:bg-muted/60 active:text-foreground data-[state=open]:bg-muted/50 data-[state=open]:text-foreground w-fit shrink-0 max-w-[160px]"
              aria-label="Select model"
              title={selectedModel}
              data-testid="model-trigger"
            >
              <Microchip className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="text-xs font-normal leading-4 truncate">{selectedModel}</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-[200px] rounded-[6px] py-[6px] px-1 z-[100]">
            {LLM_MODELS.map((model) => (
              <DropdownMenuItem key={model} className="gap-2 cursor-pointer" onSelect={() => setSelectedModel(model)}>
                <Microchip className="h-4 w-4 shrink-0" />
                {model}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onSelect={() => { window.location.hash = '#/settings/llm'; }}
            >
              <Settings className="h-4 w-4" />
              LLM Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
