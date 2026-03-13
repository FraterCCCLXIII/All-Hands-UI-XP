import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn as KanbanColumnType, PRCard, AgentMessage, Conversation } from '../../types/pr';
import { KanbanColumn } from './KanbanColumn';
import { AgentPanel } from './AgentPanel';
import { NewTaskDialog } from './NewTaskDialog';
import { availablePullRequests, initialColumns } from '../../data/mockData';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

interface KanbanBoardProps {
  activeRepo: string;
  isRepoListOpen?: boolean;
  onToggleRepoList?: () => void;
}

const TASK_MODEL_OPTIONS = [
  'Claude Opus',
  'GPT-4o',
  'GPT-5',
  'Gemini 2.5 Pro',
];

export function KanbanBoard({ activeRepo, isRepoListOpen = true, onToggleRepoList }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumnType[]>(initialColumns);
  const [selectedCard, setSelectedCard] = useState<PRCard | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const isFiltered = activeRepo !== 'all';
  const visibleColumns = useMemo(() => {
    if (!isFiltered) return columns;
    return columns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => card.repo === activeRepo),
    }));
  }, [columns, activeRepo, isFiltered]);
  const allPullRequests = useMemo(() => {
    const byId = new Map<string, PRCard>();
    columns.flatMap((column) => column.cards).forEach((card) => {
      byId.set(card.id, card);
    });
    availablePullRequests.forEach((pr) => {
      if (!byId.has(pr.id)) {
        byId.set(pr.id, pr);
      }
    });
    return Array.from(byId.values());
  }, [columns]);
  const branchOptions = useMemo(() => {
    const branchSet = new Set<string>(['main']);
    allPullRequests.forEach((pr) => {
      if (pr.branch) {
        branchSet.add(pr.branch);
      }
    });
    return Array.from(branchSet);
  }, [allPullRequests]);
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source } = result;

      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }

      setColumns((prev) => {
        const newColumns = prev.map((col) => ({ ...col, cards: [...col.cards] }));
        const sourceColIndex = newColumns.findIndex((col) => col.id === source.droppableId);
        const destColIndex = newColumns.findIndex((col) => col.id === destination.droppableId);
        if (sourceColIndex === -1 || destColIndex === -1) return prev;

        const sourceCards = newColumns[sourceColIndex].cards;
        const destCards = newColumns[destColIndex].cards;

        let card: PRCard;
        let removeIndex: number;
        if (isFiltered) {
          const visibleSource = sourceCards.filter((c) => c.repo === activeRepo);
          card = visibleSource[source.index];
          if (!card) return prev;
          removeIndex = sourceCards.findIndex((c) => c.id === card.id);
        } else {
          card = sourceCards[source.index];
          removeIndex = source.index;
        }

        newColumns[sourceColIndex] = {
          ...newColumns[sourceColIndex],
          cards: sourceCards.filter((_, i) => i !== removeIndex),
        };

        let insertIndex: number;
        if (isFiltered) {
          let visibleCount = 0;
          insertIndex = 0;
          for (const c of destCards) {
            if (visibleCount === destination.index) break;
            if (c.repo === activeRepo) visibleCount++;
            insertIndex++;
          }
        } else {
          insertIndex = destination.index;
        }

        const newDestCards = [...destCards];
        newDestCards.splice(insertIndex, 0, card);
        newColumns[destColIndex] = {
          ...newColumns[destColIndex],
          cards: newDestCards,
        };

        return newColumns;
      });
    },
    [isFiltered, activeRepo]
  );

  const handleCardClick = useCallback(
    (cardId: string) => {
      const card = columns.flatMap((col) => col.cards).find((c) => c.id === cardId);
      if (card) {
        setSelectedCard(card);
        setIsPanelOpen(true);
      }
    },
    [columns]
  );

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const handleAddColumn = useCallback(() => {
    const newColumn: KanbanColumnType = {
      id: `column-${Date.now()}`,
      title: 'New Column',
      cards: [],
    };
    setColumns((prev) => [...prev, newColumn]);
  }, []);
  const handleCreateTask = useCallback(
    ({ prompt, model, branch }: { prompt: string; model: string; branch: string }) => {
      const now = new Date().toISOString();
      const generatedTitle = prompt.trim().split('\n')[0].slice(0, 80) || 'New Task';
      const maxPrNumber = Math.max(
        0,
        ...columns.flatMap((column) => column.cards.map((card) => card.number)),
        ...availablePullRequests.map((pr) => pr.number)
      );
      const generatedPrNumber = maxPrNumber + 1;

      const taskCard: PRCard = {
        id: `task-${Date.now()}`,
        number: generatedPrNumber,
        title: generatedTitle,
        repo: activeRepo === 'all' ? 'No Repository' : activeRepo,
        sourceType: 'task',
        linkedPrId: null,
        linkedPrIds: [],
        linkedIssueId: null,
        author: {
          name: 'you',
          avatar: 'Y',
        },
        labels: [{ name: 'task', color: 'info' }],
        additions: 0,
        deletions: 0,
        comments: 0,
        createdAt: now,
        updatedAt: now,
        branch,
        baseBranch: 'main',
        status: 'open',
        conversations: [
          {
            id: `conv-task-${Date.now()}`,
            name: 'Task Kickoff',
            activity: `Queued on ${model}`,
            createdAt: now,
            updatedAt: now,
            messages: [
              {
                id: `msg-task-${Date.now()}`,
                role: 'user',
                content: prompt,
                timestamp: now,
              },
              {
                id: `msg-task-${Date.now() + 1}`,
                role: 'agent',
                content: `Starting "${generatedTitle}" on ${branch} with ${model}.`,
                timestamp: now,
              },
            ],
          },
        ],
      };

      setColumns((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        const todoColumnIndex = prev.findIndex((column) => column.id === 'todo');
        const insertColumnIndex = todoColumnIndex === -1 ? 0 : todoColumnIndex;
        return prev.map((column, index) =>
          index === insertColumnIndex
            ? {
                ...column,
                cards: [taskCard, ...column.cards],
              }
            : column
        );
      });
    },
    [activeRepo, columns, availablePullRequests]
  );

  const handleRenameColumn = useCallback((columnId: string, title: string) => {
    setColumns((prev) => prev.map((column) => (column.id === columnId ? { ...column, title } : column)));
  }, []);

  const handleDeleteColumn = useCallback((columnId: string) => {
    setColumns((prev) => {
      if (prev.length <= 1) return prev;

      const deletedColumn = prev.find((column) => column.id === columnId);
      const remainingColumns = prev.filter((column) => column.id !== columnId);
      if (!deletedColumn) return prev;

      const targetColumnId = remainingColumns[0].id;

      return remainingColumns.map((column) => {
        if (column.id === targetColumnId) {
          return {
            ...column,
            cards: [...column.cards, ...deletedColumn.cards],
          };
        }
        return column;
      });
    });
  }, []);

  const handleCreateConversation = useCallback((cardId: string, skillId?: string, skillName?: string) => {
    const conversationId = `conv-${Date.now()}`;
    const timestamp = new Date().toISOString();

    setColumns((prev) => {
      return prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) => {
          if (card.id === cardId) {
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

            const updatedCard = {
              ...card,
              conversations: [...(card.conversations ?? []), newConversation],
            };

            setSelectedCard(updatedCard);
            return updatedCard;
          }
          return card;
        }),
      }));
    });

    return conversationId;
  }, []);

  const handleSendMessage = useCallback((cardId: string, conversationId: string, content: string) => {
    const newUserMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setColumns((prev) => {
      return prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) => {
          if (card.id === cardId) {
            const targetConversation = card.conversations?.find((conv) => conv.id === conversationId);
            const updatedCard = {
              ...card,
              conversations: (card.conversations ?? []).map((conversation) => {
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
                content: `I'm analyzing your request: "${content}". Let me check the codebase and provide insights...`,
                timestamp: new Date().toISOString(),
                skillId: targetConversation?.skillId,
              };

              setColumns((prevCols) =>
                prevCols.map((c) => ({
                  ...c,
                  cards: c.cards.map((crd) => {
                    if (crd.id === cardId) {
                      const updated = {
                        ...crd,
                        conversations: (crd.conversations ?? []).map((conversation) => {
                          if (conversation.id !== conversationId) return conversation;
                          return {
                            ...conversation,
                            messages: [...conversation.messages, agentResponse],
                            activity: 'Analyzing codebase...',
                            updatedAt: new Date().toISOString(),
                          };
                        }),
                      };
                      setSelectedCard(updated);
                      return updated;
                    }
                    return crd;
                  }),
                }))
              );
            }, 1500);

            setSelectedCard(updatedCard);
            return updatedCard;
          }
          return card;
        }),
      }));
    });
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex items-center justify-between px-4 pb-3 gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {onToggleRepoList && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onToggleRepoList}
                aria-label={isRepoListOpen ? 'Hide repository list' : 'Show repository list'}
                aria-expanded={isRepoListOpen}
                className="shrink-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <h2 className="text-lg font-semibold tracking-tight text-foreground truncate">
              {activeRepo === 'all' ? 'All' : activeRepo}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden items-center gap-6 text-sm md:flex">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-muted-foreground">3 agents online</span>
              </div>
            </div>
            <NewTaskDialog
              branches={branchOptions}
              modelOptions={TASK_MODEL_OPTIONS}
              onCreateTask={handleCreateTask}
            />
          </div>
        </div>
        <Droppable droppableId="board" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-1 min-h-0 gap-4 overflow-x-auto px-4 hide-scrollbar items-stretch">
              {visibleColumns.map((column, index) => (
                <Draggable key={column.id} draggableId={column.id} index={index} isDragDisabled>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="flex h-full">
                      <KanbanColumn
                        column={column}
                        onCardClick={handleCardClick}
                        onRenameColumn={handleRenameColumn}
                        onDeleteColumn={handleDeleteColumn}
                        dragHandleProps={null}
                        isDragDisabled={false}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <AgentPanel
        card={
          selectedCard
            ? columns.flatMap((col) => col.cards).find((c) => c.id === selectedCard.id) ?? selectedCard
            : null
        }
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onCreateConversation={handleCreateConversation}
        onSendMessage={handleSendMessage}
        showConversationFooter={false}
        availablePullRequests={allPullRequests.filter((pr) => pr.sourceType !== 'task')}
      />
    </div>
  );
}
