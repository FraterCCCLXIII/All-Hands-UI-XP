import { useCallback, useState } from 'react';
import { availableSkills } from '../data/mockData';
import { PRCard, AgentMessage, Conversation } from '../types/pr';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AgentAvatarIcon } from '../components/dashboard/AgentAvatarIcon';
import { AgentPanel } from '../components/dashboard/AgentPanel';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';

const baseSkillCard: PRCard = {
  id: 'skill-sandbox',
  number: 1000,
  title: 'Skills Sandbox',
  repo: 'hyperdrive/skills',
  author: {
    name: 'hyperdrive',
    avatar: 'H',
  },
  labels: [{ name: 'skills', color: 'primary' }],
  additions: 0,
  deletions: 0,
  comments: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  branch: 'skills',
  baseBranch: 'main',
  status: 'open',
  conversations: [],
};

export function SkillsScreen() {
  const [card, setCard] = useState<PRCard>(baseSkillCard);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleCreateConversation = useCallback((_cardId: string, skillId?: string, skillName?: string) => {
    const conversationId = `conv-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const sequence = (card.conversations?.length ?? 0) + 1;
    const name = skillName ? `${skillName} ${sequence}` : `Conversation ${sequence}`;
    const newConversation: Conversation = {
      id: conversationId,
      name,
      skillId,
      activity: 'Initializing...',
      messages: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setCard((prev) => ({
      ...prev,
      conversations: [...(prev.conversations ?? []), newConversation],
    }));

    return conversationId;
  }, [card.conversations]);

  const handleSendMessage = useCallback((_cardId: string, conversationId: string, content: string) => {
    const newUserMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setCard((prev) => {
      const updatedCard = {
        ...prev,
        conversations: (prev.conversations ?? []).map((conversation) => {
          if (conversation.id !== conversationId) return conversation;
          return {
            ...conversation,
            messages: [...conversation.messages, newUserMessage],
            activity: 'Processing request...',
            updatedAt: new Date().toISOString(),
          };
        }),
      };

      setTimeout(() => {
        const agentResponse: AgentMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'agent',
          content: `Starting skill run for: "${content}". Gathering context and next steps...`,
          timestamp: new Date().toISOString(),
          skillId: updatedCard.conversations?.find((conv) => conv.id === conversationId)?.skillId,
        };

        setCard((current) => ({
          ...current,
          conversations: (current.conversations ?? []).map((conversation) => {
            if (conversation.id !== conversationId) return conversation;
            return {
              ...conversation,
              messages: [...conversation.messages, agentResponse],
              activity: 'Analyzing...',
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      }, 1200);

      return updatedCard;
    });
  }, []);

  const handleOpenAssistant = (skillId?: string, skillName?: string) => {
    handleCreateConversation(card.id, skillId, skillName);
    setIsPanelOpen(true);
  };

  return (
    <div className="flex-1 min-w-0">
      <main className="px-4 pb-6">
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Skills</h1>
            <p className="text-sm text-muted-foreground">
              Launch an agent skill or start a new conversation thread.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsPanelOpen(true)}>
            Open Assistant
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {availableSkills.map((skill) => (
            <div key={skill.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <AgentAvatarIcon icon={skill.icon} className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-foreground">{skill.name}</h2>
                    <p className="text-xs text-muted-foreground">{skill.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Skill
                </Badge>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Ready</span>
                <Button size="sm" variant="outline" onClick={() => handleOpenAssistant(skill.id, skill.name)}>
                  Start
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AgentPanel
        card={card}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onCreateConversation={handleCreateConversation}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
