import { useState, useEffect } from 'react';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';

type SkillType = 'Repository' | 'AgentSkills';

interface Skill {
  name: string;
  type: SkillType;
  triggers?: string[];
  content?: string;
}

const MOCK_SKILLS: Skill[] = [
  {
    name: 'work_hosts',
    type: 'Repository',
    content: `The user has access to the following hosts for accessing a web application, each of which has a corresponding port:
* https://work-1-eghrwldllwtakyhm.prod-runtime.all-hands.dev/ (port 12000)
* https://work-2-eghrwldllwtakyhm.prod-runtime.all-hands.dev/ (port 12001)`,
  },
  {
    name: 'azure-devops',
    type: 'AgentSkills',
    triggers: ['azure_devops', 'azure'],
    content: `You have access to an environment variable, \`AZURE_DEVOPS_TOKEN\`, which allows you to interact with the Azure DevOps API.

<IMPORTANT>
You can use \`curl\` with the \`AZURE_DEVOPS_TOKEN\` to interact with Azure DevOps's API.
ALWAYS use the Azure DevOps API for operations instead of a web browser.
</IMPORTANT>

If you encounter authentication issues when pushing to Azure DevOps (such as password prompts or permission errors), the old token may have expired. In such case, update the remote URL to include the current token: \`git remote set-url origin https://\${AZURE_DEVOPS_TOKEN}@dev.azure.com/organization/project/_git/repository\`

Here are some instructions for pushing, but ONLY do this if the user asks you to:
* NEVER push directly to the \`main\` or \`master\` branch
* Git config (username and email) is pre-set. Do not modify.
* You may already be on a branch starting with \`openhands-workspace\`. Create a new branch with a better name before pushing.
* Once you've created your own branch or a pull request, continue to update it. Do NOT create a new one unless you are explicitly asked to. Update the PR title and description as necessary, but don't change the branch name.
* Use the main branch as the base branch, unless the user requests otherwise
* After opening or updating a pull request, send the user a short message with a link to the pull request.
* Do NOT mark a pull request as ready to review unless the user explicitly says so

## Azure DevOps API Usage

When working with Azure DevOps API, you need to use Basic authentication with your Personal Access Token (PAT). The username is ignored (empty string), and the password is the PAT.

\`\`\`bash
# Convert PAT to base64
AUTH=$(echo -n ":$AZURE_DEVOPS_TOKEN" | base64)

# Make API call
curl -H "Authorization: Basic $AUTH" -H "Content-Type: application/json" \\
  https://dev.azure.com/{organization}/{project}/_apis/git/repositories?api-version=7.1
\`\`\``,
  },
  {
    name: 'learn-from-code-review',
    type: 'AgentSkills',
    triggers: ['/learn-from-reviews', 'learn from code review', 'distill reviews'],
    content: `# Learn from Code Review

Analyze code review comments from GitHub pull requests and distill them into reusable skills or repository guidelines that improve future code quality.

## Overview

Code review feedback contains valuable institutional knowledge that often gets buried across hundreds of PRs. This skill extracts meaningful patterns from review comments and transforms them into:

1. **Repository-specific skills** - Placed in \`.openhands/skills/\` for domain-specific patterns
2. **AGENTS.md guidelines** - Overall repository conventions and best practices

## Prerequisites

- \`GITHUB_TOKEN\` environment variable must be set
- GitHub CLI (\`gh\`) should be available

## Workflow

### Step 1: Identify Target Repository

Determine the repository to analyze:

\`\`\`bash
gh repo view --json nameWithOwner -q '.nameWithOwner'
\`\`\`

### Step 2: Fetch Review Comments

\`\`\`bash
gh pr list --repo {owner}/{repo} --state merged --limit 50 --json number,title,mergedAt
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments \\
  --jq '.[] | {body: .body, path: .path, user: .user.login}'
\`\`\`

### Step 3: Filter and Categorize Comments

Exclude bot comments, low-signal responses ("LGTM", "+1"), and comments shorter than 30 characters. Categorize remaining comments by: Security, Performance, Code style, Architecture, Error handling, Testing, Documentation.

### Step 4: Distill Patterns

For each category with 3+ similar comments, identify the recurring issue, desired pattern, and example context.

### Step 5: Generate Output

Place skills in \`.openhands/skills/{domain-name}/SKILL.md\`. Prefer skills over AGENTS.md updates.`,
  },
  {
    name: 'code-review',
    type: 'AgentSkills',
    triggers: ['/codereview'],
    content: `PERSONA:
You are an expert software engineer and code reviewer with deep experience in modern programming best practices, secure coding, and clean code principles.

TASK:
Review the code changes in this pull request or merge request, and provide actionable feedback on **important issues only**. Focus on bugs, security, and correctness - skip minor style nits. If the code is good, just approve it. DO NOT modify the code; only provide specific feedback.

CODE REVIEW SCENARIOS:
1. Style and Formatting (Only flag significant issues)
2. Clarity and Readability
3. Security and Common Bug Patterns
4. Testing and Behavior Verification

REMEMBER, DO NOT MODIFY THE CODE. ONLY PROVIDE FEEDBACK IN YOUR RESPONSE.`,
  },
  {
    name: 'vercel',
    type: 'AgentSkills',
    triggers: ['vercel', 'preview deployment'],
    content: `# Vercel Deployment Guide

## Deployment Protection and Agent Access

Vercel deployments may have **Deployment Protection** enabled, which requires authentication to access preview deployments.

### Enabling Agent Access with Protection Bypass

1. Navigate to **Settings** → **Deployment Protection**
2. Under "Protection Bypass for Automation", click **Generate Secret**
3. Use the secret as a header or query parameter:

\`\`\`bash
curl -H "x-vercel-protection-bypass: <secret>" https://your-preview-url.vercel.app
\`\`\`

## Vercel CLI Commands

\`\`\`bash
vercel          # Deploy to preview
vercel --prod   # Deploy to production
vercel ls       # List deployments
vercel logs <url>
vercel env pull
\`\`\``,
  },
  {
    name: 'npm',
    type: 'AgentSkills',
    triggers: ['npm'],
    content: `When using npm to install packages, you will not be able to use an interactive shell, and it may be hard to confirm your actions.
As an alternative, you can pipe in the output of the unix "yes" command to confirm your actions.`,
  },
  {
    name: 'codereview-roasted',
    type: 'AgentSkills',
    triggers: ['/codereview-roasted'],
    content: `PERSONA:
You are a critical code reviewer with the engineering mindset of Linus Torvalds. Apply 30+ years of experience maintaining robust, scalable systems to analyze code quality risks. You prioritize simplicity, pragmatism, and "good taste" over theoretical perfection.

CORE PHILOSOPHY:
1. **"Good Taste"**: Look for elegant solutions that eliminate special cases.
2. **"Never Break Userspace"**: Any change that breaks existing functionality is unacceptable.
3. **Pragmatism**: Solve real problems, not imaginary ones.
4. **Simplicity**: If it needs more than 3 levels of indentation, it's broken.

Start with a **Taste Rating**:
🟢 Good taste – Just approve
🟡 Acceptable – Could be cleaner
🔴 Needs improvement – Violates fundamental principles

REMEMBER: DO NOT MODIFY THE CODE. PROVIDE CRITICAL BUT CONSTRUCTIVE FEEDBACK ONLY.`,
  },
  {
    name: 'theme-factory',
    type: 'AgentSkills',
    content: `# Theme Factory Skill

This skill provides a curated collection of professional font and color themes, each with carefully selected color palettes and font pairings.

## Usage Instructions

1. **Show the theme showcase**: Display \`theme-showcase.pdf\` to allow users to see all available themes visually.
2. **Ask for their choice**: Ask which theme to apply to the deck
3. **Apply the theme**: Once chosen, apply the selected theme's colors and fonts.

## Themes Available

1. Ocean Depths, 2. Sunset Boulevard, 3. Forest Canopy, 4. Modern Minimalist,
5. Golden Hour, 6. Arctic Frost, 7. Desert Rose, 8. Tech Innovation,
9. Botanical Garden, 10. Midnight Galaxy`,
  },
  {
    name: 'uv',
    type: 'AgentSkills',
    triggers: ['uv', 'uv.lock'],
    content: `# uv (Python)

Use \`uv\` as the default tool for Python dependency + environment management when the repo has \`uv.lock\`, mentions \`uv\` in its docs/Makefile, or already uses a \`.venv\` created by \`uv\`.

## Common operations

\`\`\`bash
uv init              # Initialize a new project
uv venv              # Create virtual environment
uv add requests      # Add dependency
uv remove requests   # Remove dependency
uv lock              # (Re)generate uv.lock
uv sync              # Update .venv to match uv.lock
uv run python main.py
uv run pytest -q
\`\`\`

## Quick decision rules

- Repo has \`uv.lock\` + \`pyproject.toml\` → treat as uv-managed project
- Repo has only \`requirements.txt\` → use \`uv pip\` for fast installs
- Prefer project commands (\`uv add/remove/sync/run/lock\`) over raw \`pip\``,
  },
  {
    name: 'skill-creator',
    type: 'AgentSkills',
    content: `# Skill Creator

This skill provides guidance for creating effective OpenHands skills.

## Anatomy of a Skill

\`\`\`
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name + description)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── scripts/    - Executable code
    ├── references/ - Documentation loaded as needed
    └── assets/     - Files used in output
\`\`\`

## Skill Creation Process

1. **Understand use cases** with concrete examples
2. **Plan resources** (scripts, references, assets)
3. **Create structure**: \`mkdir -p skill-name/{references,scripts,assets}\`
4. **Write SKILL.md** – frontmatter with third-person description and trigger phrases; lean body (1,500–2,000 words) in imperative form
5. **Validate** – check description, writing style, organization
6. **Test** – verify skill loads on expected triggers
7. **Iterate** – improve based on usage`,
  },
  {
    name: 'onboarding-agent',
    type: 'AgentSkills',
    triggers: ['/onboard'],
    content: `# First-time User Conversation with OpenHands

## Skill purpose
In **<= 5 progressive questions**, interview the user to identify their coding goal and constraints, then generate a **concrete, step-by-step plan** that maximizes the likelihood of a **successful pull request (PR)**.
Finish by asking: **"Do you want me to execute the plan?"**

## Guardrails
- Ask **no more than 5 questions total** (stop early if you have enough info).
- Keep questions concise (<= 2 sentences each).
- NEVER push directly to the main or master branch.

## Interview Flow

**First question – always start here:**
> "What are you trying to build or change, in one or two sentences? (e.g., add an endpoint, fix a bug, write a script, tweak UI)"`,
  },
  { name: 'kubernetes', type: 'AgentSkills', triggers: ['kubectl', 'kubernetes', 'k8s'] },
  { name: 'deno', type: 'AgentSkills', triggers: ['deno'] },
  { name: 'swift-linux', type: 'AgentSkills', triggers: ['swift', 'swift-linux'] },
  { name: 'gitlab', type: 'AgentSkills', triggers: ['gitlab'] },
  { name: 'security', type: 'AgentSkills', triggers: ['security', 'cve'] },
  { name: 'ssh', type: 'AgentSkills', triggers: ['ssh'] },
  { name: 'openhands-api', type: 'AgentSkills', triggers: ['openhands-api', 'openhands api'] },
  { name: 'add-skill', type: 'AgentSkills', triggers: ['/add-skill'] },
  { name: 'datadog', type: 'AgentSkills', triggers: ['datadog'] },
  { name: 'github-pr-review', type: 'AgentSkills', triggers: ['github-pr-review', '/pr-review'] },
  { name: 'automation', type: 'AgentSkills', triggers: ['automation', 'automate'] },
  { name: 'pdflatex', type: 'AgentSkills', triggers: ['pdflatex', 'latex', 'pdf'] },
  { name: 'releasenotes', type: 'AgentSkills', triggers: ['release notes', 'changelog'] },
  { name: 'babysit-pr', type: 'AgentSkills', triggers: ['babysit-pr', '/babysit'] },
  { name: 'agent-sdk-builder', type: 'AgentSkills', triggers: ['agent-sdk', 'sdk builder'] },
  { name: 'discord', type: 'AgentSkills', triggers: ['discord'] },
  { name: 'agent-memory', type: 'AgentSkills', triggers: ['agent-memory', 'memory'] },
  { name: 'frontend-design', type: 'AgentSkills', triggers: ['frontend-design', 'ui design'] },
  { name: 'notion', type: 'AgentSkills', triggers: ['notion'] },
  { name: 'bitbucket', type: 'AgentSkills', triggers: ['bitbucket'] },
  { name: 'github', type: 'AgentSkills', triggers: ['github'] },
  { name: 'jupyter', type: 'AgentSkills', triggers: ['jupyter', 'notebook'] },
  { name: 'docker', type: 'AgentSkills', triggers: ['docker', 'dockerfile', 'container'] },
  { name: 'linear', type: 'AgentSkills', triggers: ['linear'] },
];

const SIMULATED_LOAD_MS = 1200;

function SkillTableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <tr key={i} className="animate-pulse border-b border-border">
          <td className="py-3.5 pl-3 pr-2">
            <div className="h-3.5 w-28 rounded bg-muted" />
          </td>
          <td className="py-3.5 px-2">
            <div className="h-5 w-20 rounded-full bg-muted" />
          </td>
          <td className="py-3.5 pr-3 w-6" />
        </tr>
      ))}
    </>
  );
}

function SkillTableRow({ skill }: { skill: Skill }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = Boolean(skill.triggers?.length || skill.content);

  return (
    <>
      <tr
        role="button"
        tabIndex={hasDetail ? 0 : -1}
        aria-expanded={hasDetail ? expanded : undefined}
        aria-label={hasDetail ? `Expand ${skill.name}` : undefined}
        onClick={() => hasDetail && setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (hasDetail && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        className={cn(
          'transition-colors',
          expanded ? 'border-b-0' : 'border-b border-border',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
          hasDetail ? 'hover:bg-muted/30 cursor-pointer' : 'cursor-default',
          expanded && 'bg-muted/20'
        )}
      >
        <td className="py-3.5 pl-3 pr-2 text-sm font-medium text-foreground">
          {skill.name}
        </td>
        <td className="py-3.5 px-2">
          <Badge variant="secondary" className="bg-muted text-muted-foreground border-transparent">{skill.type}</Badge>
        </td>
        <td className="py-3.5 pr-3 w-6 text-right text-muted-foreground">
          {hasDetail && (
            <ChevronRight
              className={cn('h-3.5 w-3.5 ml-auto transition-transform duration-200', expanded && 'rotate-90')}
              aria-hidden
            />
          )}
        </td>
      </tr>

      {expanded && hasDetail && (
        <tr className="border-b border-border bg-muted/10">
          <td colSpan={3} className="px-3 pb-4 pt-3">
            {skill.triggers && skill.triggers.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">Triggers</p>
                <div className="flex flex-wrap gap-1">
                  {skill.triggers.map((t) => (
                    <Badge key={t} variant="secondary" className="bg-muted text-muted-foreground border-transparent">{t}</Badge>
                  ))}
                </div>
              </div>
            )}
            {skill.content && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">Content</p>
                <pre className="whitespace-pre-wrap text-xs font-mono leading-relaxed bg-background/60 text-foreground/80 border border-border p-3 rounded-md max-h-72 overflow-auto custom-scrollbar">
                  {skill.content}
                </pre>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

interface AvailableSkillsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvailableSkillsModal({ open, onOpenChange }: AvailableSkillsModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), SIMULATED_LOAD_MS);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsRefreshing(false);
    }, SIMULATED_LOAD_MS);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="skills-modal"
        className="flex flex-col gap-4 w-[min(700px,95vw)] max-w-none h-[80vh]"
      >
        <div className="flex items-center gap-2">
          <DialogTitle className="text-xl font-semibold leading-6 -tracking-[0.01em]">
            Available Skills
          </DialogTitle>
          <button
            data-testid="refresh-skills"
            type="button"
            disabled={isRefreshing}
            onClick={handleRefresh}
            aria-label="Refresh skills"
            title="Refresh skills"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              'transition-colors cursor-pointer',
              'disabled:opacity-30 disabled:cursor-not-allowed',
            )}
          >
            <RefreshCw
              className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              aria-hidden
            />
          </button>
        </div>

        <p className="font-normal text-sm text-muted-foreground">
          If you update the skills, you will need to stop the conversation and then click on the
          refresh button to see the changes.
        </p>

        <div className="flex-1 min-h-0 overflow-auto rounded-md border border-border custom-scrollbar bg-muted/30">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {isLoading
                ? <SkillTableSkeleton />
                : MOCK_SKILLS.map((skill) => (
                    <SkillTableRow key={skill.name} skill={skill} />
                  ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
