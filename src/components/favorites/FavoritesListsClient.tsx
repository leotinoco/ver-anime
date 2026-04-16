'use client';

import { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable';
import { ListVideo } from 'lucide-react';
import SortableList from './SortableList';
import DraggableAnimeCard from './DraggableAnimeCard';

interface List {
  _id: string;
  name: string;
  animes: any[];
}

interface FavoritesListsClientProps {
  initialLists: List[];
}

export default function FavoritesListsClient({ initialLists }: FavoritesListsClientProps) {
  const [lists, setLists] = useState<List[]>(initialLists);
  const [activeAnime, setActiveAnime] = useState<any>(null);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string) => {
    if (lists.find((list) => list._id === id)) return id;
    return lists.find((list) => list.animes.some((anime) => anime.slug === id))?._id;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { anime, listId } = active.data.current as any;
    
    setActiveAnime(anime);
    setActiveListId(listId);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setLists((prev) => {
      const activeItems = prev.find((l) => l._id === activeContainer)?.animes || [];
      const overItems = prev.find((l) => l._id === overContainer)?.animes || [];

      const activeIndex = activeItems.findIndex((i) => i.slug === activeId);
      const overIndex = overItems.findIndex((i) => i.slug === overId);

      let newIndex;
      if (overId in prev.map(l => l._id)) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;
        const modifier = isBelowLastItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return prev.map((list) => {
        if (list._id === activeContainer) {
          return {
            ...list,
            animes: list.animes.filter((i) => i.slug !== activeId)
          };
        }
        if (list._id === overContainer) {
          return {
            ...list,
            animes: [
              ...list.animes.slice(0, newIndex),
              activeItems[activeIndex],
              ...list.animes.slice(newIndex)
            ]
          };
        }
        return list;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveAnime(null);
      setActiveListId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = activeListId; // Start container
    const overContainer = findContainer(overId); // Result container

    if (!overContainer || !activeContainer) {
        setActiveAnime(null);
        setActiveListId(null);
        return;
    }

    const activeIndex = lists.find(l => l._id === activeContainer)?.animes.findIndex(i => i.slug === activeId) ?? -1;
    const overIndex = lists.find(l => l._id === overContainer)?.animes.findIndex(i => i.slug === overId) ?? -1;

    // Persist to API
    try {
      await fetch('/api/lists/move-anime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animeSlug: activeId,
          sourceListId: activeContainer,
          targetListId: overContainer,
          newIndex: overIndex
        }),
      });
    } catch (error) {
      console.error('Failed to persist move:', error);
      // Optional: rollback state
    }

    if (activeContainer === overContainer) {
      if (activeIndex !== overIndex) {
        setLists((prev) => prev.map((list) => {
          if (list._id === activeContainer) {
            return {
              ...list,
              animes: arrayMove(list.animes, activeIndex, overIndex)
            };
          }
          return list;
        }));
      }
    }

    setActiveAnime(null);
    setActiveListId(null);
  };

  const handleDeleteList = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta lista?')) return;
    
    try {
      const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLists(lists.filter(l => l._id !== id));
      }
    } catch (error) {
      console.error('Delete list error:', error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-12">
        {lists.map((list) => (
          <SortableList
            key={list._id}
            id={list._id}
            name={list.name}
            animes={list.animes}
            onDeleteList={handleDeleteList}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.4',
              },
            },
          }),
        }}>
        {activeAnime ? (
          <div className="w-32 md:w-48 aspect-[2/3] rounded-md overflow-hidden bg-zinc-800 border-2 border-primary shadow-2xl opacity-80 cursor-grabbing">
            <img
              src={activeAnime.cover}
              alt={activeAnime.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
