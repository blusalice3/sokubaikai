import React, { useRef } from 'react';
import { ShoppingItem } from '../types';
import ShoppingItemCard from './ShoppingItemCard';

interface ShoppingListProps {
  items: ShoppingItem[];
  onUpdateItem: (item: ShoppingItem) => void;
  onMoveItem: (dragId: string, hoverId: string, targetColumn?: 'execute' | 'candidate') => void;
  onEditRequest: (item: ShoppingItem) => void;
  onDeleteRequest: (item: ShoppingItem) => void;
  selectedItemIds: Set<string>;
  onSelectItem: (itemId: string) => void;
  onMoveToColumn?: (itemIds: string[]) => void;
  onRemoveFromColumn?: (itemIds: string[]) => void;
  columnType?: 'execute' | 'candidate';
}

// Constants for drag-and-drop auto-scrolling
const SCROLL_SPEED = 20;
const TOP_SCROLL_TRIGGER_PX = 150;
const BOTTOM_SCROLL_TRIGGER_PX = 100;

const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  onUpdateItem,
  onMoveItem,
  onEditRequest,
  onDeleteRequest,
  selectedItemIds,
  onSelectItem,
  onMoveToColumn,
  onRemoveFromColumn,
  columnType,
}) => {
  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);
  const dragOverColumn = useRef<'execute' | 'candidate' | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: ShoppingItem) => {
    dragItem.current = item.id;
    const target = e.currentTarget;
    setTimeout(() => {
        if(target) {
            target.classList.add('opacity-40');
        }
        if (selectedItemIds.has(item.id)) {
            document.querySelectorAll('[data-is-selected="true"]').forEach(el => el.classList.add('opacity-40'));
        }
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, item: ShoppingItem) => {
    e.preventDefault();
    if (selectedItemIds.has(item.id)) {
        dragOverItem.current = null;
    } else {
        dragOverItem.current = item.id;
        dragOverColumn.current = columnType || null;
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const clientY = e.clientY;
    const windowHeight = window.innerHeight;

    if (clientY < TOP_SCROLL_TRIGGER_PX) {
      window.scrollBy(0, -SCROLL_SPEED);
    } else if (clientY > windowHeight - BOTTOM_SCROLL_TRIGGER_PX) {
      window.scrollBy(0, SCROLL_SPEED);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // 列間の移動を検出
    const targetColumn = columnType;
    const sourceColumn = (e.dataTransfer.getData('sourceColumn') || columnType) as 'execute' | 'candidate' | undefined;
    
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      // 同じ列内での移動
      if (sourceColumn === targetColumn) {
        onMoveItem(dragItem.current, dragOverItem.current, columnType);
      } else {
        // 列間の移動
        if (selectedItemIds.has(dragItem.current)) {
          const selectedIds = Array.from(selectedItemIds);
          if (targetColumn === 'execute' && onMoveToColumn) {
            onMoveToColumn(selectedIds);
          } else if (targetColumn === 'candidate' && onRemoveFromColumn) {
            onRemoveFromColumn(selectedIds);
          }
        } else {
          if (targetColumn === 'execute' && onMoveToColumn) {
            onMoveToColumn([dragItem.current]);
          } else if (targetColumn === 'candidate' && onRemoveFromColumn) {
            onRemoveFromColumn([dragItem.current]);
          }
        }
      }
    } else if (dragItem.current !== null && targetColumn && sourceColumn && sourceColumn !== targetColumn) {
      // 列間の移動（アイテム上にドロップしなくても列にドロップした場合は移動）
      if (selectedItemIds.has(dragItem.current)) {
        const selectedIds = Array.from(selectedItemIds);
        if (targetColumn === 'execute' && onMoveToColumn) {
          onMoveToColumn(selectedIds);
        } else if (targetColumn === 'candidate' && onRemoveFromColumn) {
          onRemoveFromColumn(selectedIds);
        }
      } else {
        if (targetColumn === 'execute' && onMoveToColumn) {
          onMoveToColumn([dragItem.current]);
        } else if (targetColumn === 'candidate' && onRemoveFromColumn) {
          onRemoveFromColumn([dragItem.current]);
        }
      }
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-40');
    document.querySelectorAll('[data-is-selected="true"]').forEach(el => el.classList.remove('opacity-40'));
    dragItem.current = null;
    dragOverItem.current = null;
    dragOverColumn.current = null;
    e.dataTransfer.clearData();
  };

  if (items.length === 0) {
      return (
        <div 
          className="text-center text-slate-500 dark:text-slate-400 py-12 min-h-[200px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
            const sourceColumn = e.dataTransfer.getData('sourceColumn') as 'execute' | 'candidate' | undefined;
            if (columnType && sourceColumn && sourceColumn !== columnType) {
              const dragId = dragItem.current;
              if (dragId) {
                if (selectedItemIds.has(dragId)) {
                  const selectedIds = Array.from(selectedItemIds);
                  if (columnType === 'execute' && onMoveToColumn) {
                    onMoveToColumn(selectedIds);
                  } else if (columnType === 'candidate' && onRemoveFromColumn) {
                    onRemoveFromColumn(selectedIds);
                  }
                } else {
                  if (columnType === 'execute' && onMoveToColumn) {
                    onMoveToColumn([dragId]);
                  } else if (columnType === 'candidate' && onRemoveFromColumn) {
                    onRemoveFromColumn([dragId]);
                  }
                }
              }
            }
          }}
        >
          この日のアイテムはありません。
          {columnType && <div className="text-xs mt-2">他の列からアイテムをドラッグ&ドロップできます</div>}
        </div>
      );
  }

  return (
    <div 
      className="space-y-4 pb-24"
      onDragOver={(e) => {
        if (e.currentTarget === e.target) {
          e.preventDefault();
        }
      }}
      onDrop={(e) => {
        if (e.currentTarget === e.target) {
          e.preventDefault();
          const sourceColumn = e.dataTransfer.getData('sourceColumn') as 'execute' | 'candidate' | undefined;
          if (columnType && sourceColumn && sourceColumn !== columnType) {
            const dragId = dragItem.current;
            if (dragId) {
              if (selectedItemIds.has(dragId)) {
                const selectedIds = Array.from(selectedItemIds);
                if (columnType === 'execute' && onMoveToColumn) {
                  onMoveToColumn(selectedIds);
                } else if (columnType === 'candidate' && onRemoveFromColumn) {
                  onRemoveFromColumn(selectedIds);
                }
              } else {
                if (columnType === 'execute' && onMoveToColumn) {
                  onMoveToColumn([dragId]);
                } else if (columnType === 'candidate' && onRemoveFromColumn) {
                  onRemoveFromColumn([dragId]);
                }
              }
            }
          }
        }
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          data-item-id={item.id}
          draggable
          onDragStart={(e) => {
            handleDragStart(e, item);
            if (columnType) {
              e.dataTransfer.setData('sourceColumn', columnType);
            }
          }}
          onDragEnter={(e) => handleDragEnter(e, item)}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          className="transition-opacity duration-200"
          data-is-selected={selectedItemIds.has(item.id)}
        >
          <ShoppingItemCard
            item={item}
            onUpdate={onUpdateItem}
            isStriped={index % 2 !== 0}
            onEditRequest={onEditRequest}
            onDeleteRequest={onDeleteRequest}
            isSelected={selectedItemIds.has(item.id)}
            onSelectItem={onSelectItem}
          />
        </div>
      ))}
    </div>
  );
};

export default ShoppingList;
