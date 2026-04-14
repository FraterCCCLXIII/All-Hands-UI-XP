import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

type TabId = 'system-message' | 'available-tools';

interface AgentTool {
  name: string;
  description: string;
  parameters?: Array<{ name: string; type: string; description: string; required?: boolean }>;
}

const SYSTEM_MESSAGE = `You are OpenHands agent, a helpful AI assistant that can interact with a computer to solve tasks.

<ROLE>
* Your primary role is to assist users by executing commands, modifying code, and solving technical problems effectively. You should be thorough, methodical, and prioritize quality over speed.
* If the user asks a question, like "why is X happening", don't try to fix the problem. Just give an answer to the question.
</ROLE>

<MEMORY>
* Use \`AGENTS.md\` under the repository root as your persistent memory for repository-specific knowledge and context.
* Add important insights, patterns, and learnings to this file to improve future task performance.
* This repository skill is automatically loaded for every conversation and helps maintain context across sessions.
* For more information about skills, see: https://docs.openhands.dev/overview/skills
</MEMORY>

<EFFICIENCY>
* Each action you take is somewhat expensive. Wherever possible, combine multiple actions into a single action, e.g. combine multiple bash commands into one, using sed and grep to edit/view multiple files at once.
* When exploring the codebase, use efficient tools like find, grep, and git commands with appropriate filters to minimize unnecessary operations.
</EFFICIENCY>

<FILE_SYSTEM_GUIDELINES>
* When a user provides a file path, do NOT assume it's relative to the current working directory. First explore the file system to locate the file before working on it.
* If asked to edit a file, edit the file directly, rather than creating a new file with a different filename.
* For global search-and-replace operations, consider using \`sed\` instead of opening file editors multiple times.
* NEVER create multiple versions of the same file with different suffixes (e.g., file_test.py, file_fix.py, file_simple.py). Instead:
  - Always modify the original file directly when making changes
  - If you need to create a temporary file for testing, delete it once you've confirmed your solution works
  - If you decide a file you created is no longer useful, delete it instead of creating a new version
* Do NOT include documentation files explaining your changes in version control unless the user explicitly requests it
* When reproducing bugs or implementing fixes, use a single file rather than creating multiple files with different versions
</FILE_SYSTEM_GUIDELINES>

<CODE_QUALITY>
* Write clean, efficient code with minimal comments. Avoid redundancy in comments: Do not repeat information that can be easily inferred from the code itself.
* When implementing solutions, focus on making the minimal changes needed to solve the problem.
* Before implementing any changes, first thoroughly understand the codebase through exploration.
* If you are adding a lot of code to a function or file, consider splitting the function or file into smaller pieces when appropriate.
* Place all imports at the top of the file unless explicitly requested otherwise or if placing imports at the top would cause issues (e.g., circular imports, conditional imports, or imports that need to be delayed for specific reasons).
</CODE_QUALITY>

<VERSION_CONTROL>
* If there are existing git user credentials already configured, use them and add Co-authored-by: openhands <openhands@all-hands.dev> to any commits messages you make. if a git config doesn't exist use "openhands" as the user.name and "openhands@all-hands.dev" as the user.email by default, unless explicitly instructed otherwise.
* Exercise caution with git operations. Do NOT make potentially dangerous changes (e.g., pushing to main, deleting repositories) unless explicitly asked to do so.
* When committing changes, use \`git status\` to see all modified files, and stage all files necessary for the commit. Use \`git commit -a\` whenever possible.
* Do NOT commit files that typically shouldn't go into version control (e.g., node_modules/, .env files, build directories, cache files, large binaries) unless explicitly instructed by the user.
* If unsure about committing certain files, check for the presence of .gitignore files or ask the user for clarification.
* When running git commands that may produce paged output (e.g., \`git diff\`, \`git log\`, \`git show\`), use \`git --no-pager <command>\` or set \`GIT_PAGER=cat\` to prevent the command from getting stuck waiting for interactive input.
</VERSION_CONTROL>

<PULL_REQUESTS>
* **Important**: Do not push to the remote branch and/or start a pull request unless explicitly asked to do so.
* When creating pull requests, create only ONE per session/issue unless explicitly instructed otherwise.
* When working with an existing PR, update it with new commits rather than creating additional PRs for the same issue.
* When updating a PR, preserve the original PR title and purpose, updating description only when necessary.
</PULL_REQUESTS>

<PROBLEM_SOLVING_WORKFLOW>
1. EXPLORATION: Thoroughly explore relevant files and understand the context before proposing solutions
2. ANALYSIS: Consider multiple approaches and select the most promising one
3. TESTING:
   * For bug fixes: Create tests to verify issues before implementing fixes
   * For new features: Consider test-driven development when appropriate
   * Do NOT write tests for documentation changes, README updates, configuration files, or other non-functionality changes
   * Do not use mocks in tests unless strictly necessary and justify their use when they are used. You must always test real code paths in tests, NOT mocks.
   * If the repository lacks testing infrastructure and implementing tests would require extensive setup, consult with the user before investing time in building testing infrastructure
   * If the environment is not set up to run tests, consult with the user first before investing time to install all dependencies
4. IMPLEMENTATION:
   * Make focused, minimal changes to address the problem
   * Always modify existing files directly rather than creating new versions with different suffixes
   * If you create temporary files for testing, delete them after confirming your solution works
5. VERIFICATION: If the environment is set up to run tests, test your implementation thoroughly, including edge cases. If the environment is not set up to run tests, consult with the user first before investing time to run tests.
</PROBLEM_SOLVING_WORKFLOW>`;

const AGENT_TOOLS: AgentTool[] = [
  {
    name: 'execute_bash',
    description: 'Execute a bash command in the sandbox environment.',
    parameters: [
      { name: 'command', type: 'string', description: 'The bash command to execute.', required: true },
      { name: 'timeout', type: 'number', description: 'Timeout in seconds (default 120).', required: false },
    ],
  },
  {
    name: 'read_file',
    description: 'Read the contents of a file at the given path.',
    parameters: [
      { name: 'path', type: 'string', description: 'Absolute or relative path to the file.', required: true },
      { name: 'start_line', type: 'number', description: 'First line to read (1-indexed).', required: false },
      { name: 'end_line', type: 'number', description: 'Last line to read (inclusive).', required: false },
    ],
  },
  {
    name: 'write_file',
    description: 'Write or overwrite a file with the given content.',
    parameters: [
      { name: 'path', type: 'string', description: 'Path to the file to write.', required: true },
      { name: 'content', type: 'string', description: 'Full content to write to the file.', required: true },
    ],
  },
  {
    name: 'str_replace',
    description: 'Replace a specific string in a file with a new string.',
    parameters: [
      { name: 'path', type: 'string', description: 'Path to the target file.', required: true },
      { name: 'old_str', type: 'string', description: 'Exact string to find and replace.', required: true },
      { name: 'new_str', type: 'string', description: 'Replacement string.', required: true },
    ],
  },
  {
    name: 'browser_navigate',
    description: 'Navigate the browser to a URL.',
    parameters: [
      { name: 'url', type: 'string', description: 'The URL to navigate to.', required: true },
    ],
  },
  {
    name: 'browser_click',
    description: 'Click on an element in the current browser page.',
    parameters: [
      { name: 'selector', type: 'string', description: 'CSS selector or element reference.', required: true },
    ],
  },
  {
    name: 'browser_type',
    description: 'Type text into a focused input field in the browser.',
    parameters: [
      { name: 'text', type: 'string', description: 'Text to type.', required: true },
    ],
  },
  {
    name: 'think',
    description: 'Record internal reasoning without producing any observable output.',
    parameters: [
      { name: 'thought', type: 'string', description: 'The reasoning or plan to record.', required: true },
    ],
  },
  {
    name: 'finish',
    description: 'Signal that the task is complete and provide a final message to the user.',
    parameters: [
      { name: 'message', type: 'string', description: 'Summary of what was accomplished.', required: true },
    ],
  },
];

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'system-message', label: 'System Message' },
  { id: 'available-tools', label: 'Available Tools' },
];

function ToolTableRow({ tool }: { tool: AgentTool }) {
  const [expanded, setExpanded] = useState(false);
  const hasParams = Boolean(tool.parameters?.length);

  return (
    <>
      <tr
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`Expand ${tool.name}`}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        className={cn(
          'transition-colors cursor-pointer',
          expanded ? 'border-b-0' : 'border-b border-border',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
          'hover:bg-muted/30',
          expanded && 'bg-muted/20'
        )}
      >
        <td className="py-3.5 pl-3 pr-2 font-sans text-sm font-medium text-foreground whitespace-nowrap">
          {tool.name}
        </td>
        <td className="py-3.5 pl-2 pr-2 text-sm text-muted-foreground">
          {tool.description}
        </td>
        <td className="py-3.5 pr-3 w-6 text-right text-muted-foreground">
          {hasParams && (
            <ChevronRight
              className={cn('h-3.5 w-3.5 ml-auto transition-transform duration-200', expanded && 'rotate-90')}
              aria-hidden
            />
          )}
        </td>
      </tr>

      {expanded && hasParams && (
        <tr className="border-b border-border bg-muted/10">
          <td colSpan={3} className="px-3 pb-4 pt-3">
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground w-1/4">Parameter</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground w-1/6">Type</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Description</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground w-[5rem]">Required</th>
                  </tr>
                </thead>
                <tbody>
                  {tool.parameters!.map((param, i) => (
                    <tr key={param.name} className={cn('border-b border-border last:border-0', i % 2 === 1 && 'bg-muted/20')}>
                      <td className="px-3 py-2 font-mono font-semibold text-foreground">{param.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{param.type}</td>
                      <td className="px-3 py-2 text-muted-foreground">{param.description}</td>
                      <td className="px-3 py-2">
                        {param.required
                          ? <span className="text-success-foreground font-medium">yes</span>
                          : <span className="text-muted-foreground">no</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

interface AgentToolsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentToolsModal({ open, onOpenChange }: AgentToolsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('system-message');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="agent-tools-modal"
        className="flex flex-col gap-6 w-[min(700px,95vw)] max-w-none h-[80vh]"
      >
        <DialogTitle className="text-xl font-semibold leading-6 -tracking-[0.01em]">
          Agent Tools &amp; Metadata
        </DialogTitle>

        <div className="w-full flex flex-col min-h-0 flex-1">
          <div className="flex border-b border-border -mx-6 px-6 mb-6" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors rounded-none',
                  activeTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'system-message' && (
            <div className="flex-1 min-h-0 overflow-auto rounded-md border border-border custom-scrollbar bg-muted/30">
              <div className="p-4">
                <pre className="font-mono text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
                  {SYSTEM_MESSAGE}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'available-tools' && (
            <div className="flex-1 min-h-0 overflow-auto rounded-md border border-border custom-scrollbar bg-muted/30">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {AGENT_TOOLS.map((tool) => (
                    <ToolTableRow key={tool.name} tool={tool} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
