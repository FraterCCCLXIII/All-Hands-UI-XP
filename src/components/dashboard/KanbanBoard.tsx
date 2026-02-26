import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn as KanbanColumnType, PRCard, AgentMessage, Conversation } from '../../types/pr';
import { KanbanColumn } from './KanbanColumn';
import { AgentPanel } from './AgentPanel';
import { NewTaskDialog } from './NewTaskDialog';
import { availablePullRequests, initialColumns } from '../../data/mockData';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ChevronDown, Menu, Plus } from 'lucide-react';

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
  const [prFilter, setPrFilter] = useState<'all' | 'created' | 'assigned'>('all');
  const prFilterLabel =
    prFilter === 'all'
      ? 'All PRs'
      : prFilter === 'created'
        ? 'PRs created by me'
        : 'PRs assigned to me';
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
  const taskPullRequests = useMemo(
    () =>
      (activeRepo === 'all' ? allPullRequests : allPullRequests.filter((pr) => pr.repo === activeRepo)).filter(
        (pr) => pr.sourceType !== 'task'
      ),
    [activeRepo, allPullRequests]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source } = result;

      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }

      if (result.type === 'COLUMN') {
        setColumns((prev) => {
          const newColumns = [...prev];
          const [moved] = newColumns.splice(source.index, 1);
          newColumns.splice(destination.index, 0, moved);
          return newColumns;
        });
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
    ({
      prompt,
      model,
      branch,
      linkedPrIds,
    }: {
      prompt: string;
      model: string;
      branch: string;
      linkedPrIds: string[];
    }) => {
      const linkedPrs = linkedPrIds
        .map((prId) => allPullRequests.find((pr) => pr.id === prId && pr.sourceType !== 'task') ?? null)
        .filter((pr): pr is PRCard => Boolean(pr));
      const primaryLinkedPr = linkedPrs[0] ?? null;
      const now = new Date().toISOString();
      const generatedTitle = primaryLinkedPr
        ? `${primaryLinkedPr.title} Task`
        : prompt.trim().split('\n')[0].slice(0, 80) || 'New Task';
      const maxPrNumber = Math.max(
        0,
        ...columns.flatMap((column) => column.cards.map((card) => card.number)),
        ...availablePullRequests.map((pr) => pr.number)
      );
      const generatedPrNumber = maxPrNumber + 1;

      const taskCard: PRCard = {
        id: `task-${Date.now()}`,
        number: primaryLinkedPr?.number ?? generatedPrNumber,
        title: generatedTitle,
        repo: primaryLinkedPr?.repo ?? (activeRepo === 'all' ? 'No Repository' : activeRepo),
        sourceType: 'task',
        linkedPrId: primaryLinkedPr?.id ?? null,
        linkedPrIds: linkedPrs.map((pr) => pr.id),
        author: {
          name: 'you',
          avatar: 'Y',
        },
        labels: [
          { name: 'task', color: 'info' },
          ...linkedPrs.slice(0, 2).map((pr) => ({ name: `linked #${pr.number}`, color: 'muted' as const })),
        ],
        additions: 0,
        deletions: 0,
        comments: 0,
        createdAt: now,
        updatedAt: now,
        branch,
        baseBranch: primaryLinkedPr?.baseBranch ?? 'main',
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
                content: linkedPrs.length > 0
                  ? `Starting "${generatedTitle}" on ${branch} with ${model}. Linked to ${linkedPrs.length} PR${linkedPrs.length > 1 ? 's' : ''}.`
                  : `Starting "${generatedTitle}" on ${branch} with ${model}.`,
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
    [activeRepo, allPullRequests, columns]
  );
  const handleUpdateCardLinkedPrs = useCallback(
    (cardId: string, linkedPrIds: string[]) => {
      const linkedPrs = linkedPrIds
        .map((prId) => allPullRequests.find((pr) => pr.id === prId && pr.sourceType !== 'task') ?? null)
        .filter((pr): pr is PRCard => Boolean(pr));
      const primaryLinkedPr = linkedPrs[0] ?? null;
      const timestamp = new Date().toISOString();

      setColumns((prev) =>
        prev.map((column) => ({
          ...column,
          cards: column.cards.map((card) => {
            if (card.id !== cardId) {
              return card;
            }

            if (card.sourceType !== 'task') {
              const relatedLinkedPrIds = linkedPrs
                .map((pr) => pr.id)
                .filter((prId) => prId !== card.id);
              return {
                ...card,
                linkedPrIds: relatedLinkedPrIds,
                updatedAt: timestamp,
              };
            }

            const retainedLabels = card.labels.filter((label) => !label.name.toLowerCase().startsWith('linked #'));
            const nextLabels = [
              ...retainedLabels,
              ...linkedPrs.slice(0, 2).map((pr) => ({ name: `linked #${pr.number}`, color: 'muted' as const })),
            ];

            return {
              ...card,
              linkedPrId: primaryLinkedPr?.id ?? null,
              linkedPrIds: linkedPrs.map((pr) => pr.id),
              repo: primaryLinkedPr?.repo ?? 'No Repository',
              baseBranch: primaryLinkedPr?.baseBranch ?? 'main',
              labels: nextLabels,
              updatedAt: timestamp,
            };
          }),
        }))
      );

      setSelectedCard((previous) => {
        if (!previous || previous.id !== cardId) {
          return previous;
        }

        if (previous.sourceType !== 'task') {
          const relatedLinkedPrIds = linkedPrs
            .map((pr) => pr.id)
            .filter((prId) => prId !== previous.id);
          return {
            ...previous,
            linkedPrIds: relatedLinkedPrIds,
            updatedAt: timestamp,
          };
        }

        const retainedLabels = previous.labels.filter((label) => !label.name.toLowerCase().startsWith('linked #'));
        const nextLabels = [
          ...retainedLabels,
          ...linkedPrs.slice(0, 2).map((pr) => ({ name: `linked #${pr.number}`, color: 'muted' as const })),
        ];
        return {
          ...previous,
          linkedPrId: primaryLinkedPr?.id ?? null,
          linkedPrIds: linkedPrs.map((pr) => pr.id),
          repo: primaryLinkedPr?.repo ?? 'No Repository',
          baseBranch: primaryLinkedPr?.baseBranch ?? 'main',
          labels: nextLabels,
          updatedAt: timestamp,
        };
      });
    },
    [allPullRequests]
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Filter pull requests">
                  {prFilterLabel}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setPrFilter('all')}>
                  All PRs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPrFilter('created')}>
                  PRs created by me
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPrFilter('assigned')}>
                  PRs assigned to me
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <NewTaskDialog
              pullRequests={taskPullRequests}
              branches={branchOptions}
              modelOptions={TASK_MODEL_OPTIONS}
              onCreateTask={handleCreateTask}
            />
            <Button size="icon" variant="outline" onClick={handleAddColumn} aria-label="Add column">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Droppable droppableId="board" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-1 min-h-0 gap-4 overflow-x-auto pb-8 px-4 hide-scrollbar items-stretch">
              {visibleColumns.map((column, index) => (
                <Draggable key={column.id} draggableId={column.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="flex h-full">
                      <KanbanColumn
                        column={column}
                        onCardClick={handleCardClick}
                        onRenameColumn={handleRenameColumn}
                        onDeleteColumn={handleDeleteColumn}
                        dragHandleProps={provided.dragHandleProps}
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
        onUpdateCardLinkedPrs={handleUpdateCardLinkedPrs}
      />
    </div>
  );
}
