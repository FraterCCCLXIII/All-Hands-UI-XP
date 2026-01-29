import { useEffect, useState } from 'react';
import { Droppable, Draggable, type DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { KanbanColumn as KanbanColumnType } from '../../types/pr';
import { PRCardComponent } from './PRCard';
import { cn } from '../../lib/utils';
import { GripVertical, MoreHorizontal, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onCardClick: (cardId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDragDisabled?: boolean;
}

export function KanbanColumn({
  column,
  onCardClick,
  onRenameColumn,
  onDeleteColumn,
  dragHandleProps,
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

  return (
    <div className="flex flex-col w-80 flex-shrink-0 h-full min-h-0">
      <div className="flex items-center justify-between mb-3 px-2 group">
        <div className="flex items-center gap-2 relative">
          <button
            type="button"
            aria-label="Move column"
            className={cn(
              'absolute -left-6 rounded p-1 text-muted-foreground transition-opacity',
              'opacity-0 group-hover:opacity-100 hover:text-foreground'
            )}
            {...dragHandleProps}
          >
            <GripVertical className="w-4 h-4" />
          </button>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Column options"
              className={cn(
                'rounded p-1 text-muted-foreground transition-opacity',
                'opacity-0 group-hover:opacity-100 hover:text-foreground'
              )}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDeleteColumn(column.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Droppable droppableId={column.id} isDropDisabled={isDragDisabled}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 min-h-0 space-y-2 p-2 pb-6 rounded-lg transition-colors duration-200 overflow-y-auto',
              'bg-card border-0',
              snapshot.isDraggingOver && 'ring-1 ring-foreground/20 bg-background'
            )}
          >
            {column.cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled={isDragDisabled}>
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
