import { useEffect, useMemo, useState } from 'react';
import { PRCard } from '../../types/pr';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Badge } from '../ui/badge';
import { Bot, GitBranch, GitPullRequest, Minus, Plus, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { availableSkills } from '../../data/mockData';
import { AgentAvatarIcon } from './AgentAvatarIcon';

interface AgentPanelProps {
  card: PRCard | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (cardId: string, skillId?: string, skillName?: string) => string;
  onSendMessage: (cardId: string, conversationId: string, message: string) => void;
}

export function AgentPanel({ card, isOpen, onClose, onCreateConversation, onSendMessage }: AgentPanelProps) {
  const [message, setMessage] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  useEffect(() => {
    if (!card) return;
    setSelectedConversationId(card.conversations?.[0]?.id ?? null);
    setSelectedSkillId(null);
  }, [card?.id]);

  const conversations = card?.conversations ?? [];
  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return conversations[0] ?? null;
    return conversations.find((conv) => conv.id === selectedConversationId) ?? conversations[0] ?? null;
  }, [conversations, selectedConversationId]);

  const selectedSkill = useMemo(
    () => availableSkills.find((skill) => skill.id === selectedSkillId),
    [selectedSkillId]
  );

  const handleSend = () => {
    if (!message.trim() || !card || !selectedConversation) return;
    onSendMessage(card.id, selectedConversation.id, message);
    setMessage('');
  };

  const handleCreateConversation = () => {
    if (!card) return;
    const newConversationId = onCreateConversation(card.id, selectedSkill?.id, selectedSkill?.name);
    setSelectedConversationId(newConversationId);
    setSelectedSkillId(null);
  };

  if (!card) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-background border-l border-border p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <GitPullRequest className="w-5 h-5 text-success mt-0.5" />
              <div>
                <SheetTitle className="text-left text-base font-medium leading-tight">{card.title}</SheetTitle>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  {card.repo} #{card.number}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-mono">
              <GitBranch className="w-3 h-3" />
              {card.branch} → {card.baseBranch}
            </span>
            <span className="flex items-center gap-1">
              <Plus className="w-3 h-3 text-success" />
              <span className="text-success">{card.additions}</span>
            </span>
            <span className="flex items-center gap-1">
              <Minus className="w-3 h-3 text-destructive" />
              <span className="text-destructive">{card.deletions}</span>
            </span>
          </div>
        </SheetHeader>

        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Start a Conversation</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Pick a skill (optional) and add a new thread.</p>
            </div>
            <Button size="sm" variant="outline" className="bg-background" onClick={handleCreateConversation}>
              Add New
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedSkillId(null)}
              className={cn(
                'flex items-center gap-2 p-2 rounded border border-border bg-card',
                'hover:border-muted-foreground/50 transition-all duration-200',
                selectedSkillId === null && 'border-foreground/20 bg-background shadow-sm'
              )}
              type="button"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">—</span>
              <div className="text-left">
                <p className="text-sm font-medium">No skill</p>
                <p className="text-[10px] text-muted-foreground">Start blank</p>
              </div>
            </button>
            {availableSkills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkillId(skill.id)}
                className={cn(
                  'flex items-center gap-2 p-2 rounded border border-border bg-card',
                  'hover:border-muted-foreground/50 transition-all duration-200',
                  selectedSkillId === skill.id && 'border-foreground/20 bg-background shadow-sm'
                )}
                type="button"
              >
                <AgentAvatarIcon icon={skill.icon} className="w-4 h-4 text-foreground" />
                <div className="text-left">
                  <p className="text-sm font-medium">{skill.name}</p>
                  <p className="text-[10px] text-muted-foreground">{skill.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 && (
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                {conversations.map((conversation) => {
                  const skill = availableSkills.find((s) => s.id === conversation.skillId);
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-full border px-3 py-1 text-xs',
                        'transition-colors',
                        selectedConversation?.id === conversation.id
                          ? 'border-foreground/20 bg-background text-foreground shadow-sm'
                          : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                      )}
                      type="button"
                    >
                      <span className="font-medium">{conversation.name}</span>
                      <Badge
                        variant="secondary"
                        className={cn('text-[10px]', skill ? 'bg-muted' : 'bg-muted/50 text-muted-foreground')}
                      >
                        {skill?.name ?? 'No skill'}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-4 space-y-3">
            <AnimatePresence>
              {selectedConversation?.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    'p-3 rounded-lg text-sm',
                    msg.role === 'user' ? 'bg-muted ml-8' : 'bg-agent/10 border border-agent/20 mr-8'
                  )}
                >
                  {msg.role === 'agent' && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-agent">
                      <Bot className="w-3 h-3" />
                      <span className="font-medium">
                        {availableSkills.find((skill) => skill.id === msg.skillId)?.name || 'Agent'}
                      </span>
                    </div>
                  )}
                  <p className="text-foreground leading-relaxed">{msg.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>

            {conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <Bot className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Add a new conversation with or without a skill.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={handleCreateConversation}>
                  Add New
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message this conversation..."
              className="flex-1 bg-muted border-border focus:border-primary"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || !selectedConversation}
              size="icon"
              variant="outline"
              className="bg-background hover:bg-muted"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {!selectedConversation && (
            <p className="text-[10px] text-muted-foreground mt-2">Add a conversation before sending a message.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
