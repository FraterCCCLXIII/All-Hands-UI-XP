import { useEffect, useState } from 'react';
import { Droppable, Draggable, type DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { Archive, CheckCircle2, CircleDashed, Clock3, TriangleAlert } from 'lucide-react';
import { KanbanColumn as KanbanColumnType } from '../../types/pr';
import { PRCardComponent } from './PRCard';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onCardClick: (cardId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  activeDraggedCardId?: string | null;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDragDisabled?: boolean;
}

export function KanbanColumn({
  column,
  onCardClick,
  onRenameColumn,
  onDeleteColumn: _onDeleteColumn,
  activeDraggedCardId = null,
  dragHandleProps: _dragHandleProps,
  isDragDisabled = false,
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(column.title);

  useEffect(() => {
    setTitleValue(column.title);
  }, [column.title]);

  const commitRename = () => {
    const nextTitle = titleValue.trim() || column.title;
    setTitleValue(nextTitle);
    setIsEditing(false);
    if (nextTitle !== column.title) {
      onRenameColumn(column.id, nextTitle);
    }
  };

  const Icon = {
    'in-progress': CircleDashed,
    waiting: Clock3,
    done: CheckCircle2,
    failed: TriangleAlert,
    archived: Archive,
  }[column.icon ?? 'in-progress'];

  return (
    <div className="flex flex-col w-[22rem] flex-shrink-0 h-full min-h-0">
      <div className="mb-3 px-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 relative">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={titleValue}
                    onChange={(event) => setTitleValue(event.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        commitRename();
                      }
                      if (event.key === 'Escape') {
                        setTitleValue(column.title);
                        setIsEditing(false);
                      }
                    }}
                    className="h-7 w-44 text-sm"
                    autoFocus
                  />
                ) : (
                  <h2 className="text-sm font-medium text-foreground" onDoubleClick={() => setIsEditing(true)}>
                    {column.title}
                  </h2>
                )}
                <span className="px-2 py-0.5 text-xs font-mono text-muted-foreground bg-muted rounded">
                  {column.cards.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Droppable droppableId={column.id} isDropDisabled={isDragDisabled}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 min-h-0 space-y-2 p-2 pb-6 mb-4 rounded-modal transition-colors duration-200 overflow-y-auto',
              'bg-card border-0',
              snapshot.isDraggingOver && 'ring-1 ring-foreground/20 bg-background'
            )}
          >
            {column.cards.map((card, index) => (
              <Draggable
                key={card.id}
                draggableId={card.id}
                index={index}
                isDragDisabled={isDragDisabled || (activeDraggedCardId !== null && activeDraggedCardId !== card.id)}
              >
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <PRCardComponent card={card} onClick={() => onCardClick(card.id)} isDragging={snapshot.isDragging} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
