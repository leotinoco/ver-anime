'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, PlusCircle, ListPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddToListButtonProps {
  slug: string;
  title: string;
  cover: string;
  variant?: 'circle' | 'full';
}

export default function AddToListButton({ slug, title, cover, variant = 'circle' }: AddToListButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [lists, setLists] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [addingToId, setAddingToId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [creatingList, setCreatingList] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const fetchLists = async () => {
    setLoadingLists(true);
    try {
      const res = await fetch('/api/lists');
      const data = await res.json();
      if (data.authenticated) {
        setLists(data.lists);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoadingLists(false);
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showDropdown) {
      fetchLists();
    }
    setShowDropdown(!showDropdown);
  };

  const addToList = async (listId: string) => {
    setAddingToId(listId);
    try {
      const res = await fetch(`/api/lists/${listId}/anime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title, cover }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ text: '¡Añadido!', type: 'success' });
        setTimeout(() => {
          setShowDropdown(false);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ text: data.error || 'Error', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error de red', type: 'error' });
    } finally {
      setAddingToId(null);
    }
  };

  const createList = async () => {
    if (!newListName.trim()) return;
    setCreatingList(true);
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setLists([data.list, ...lists]);
        setNewListName('');
        addToList(data.list._id);
      } else {
        setMessage({ text: data.error || 'Límite alcanzado', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error de red', type: 'error' });
    } finally {
      setCreatingList(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {variant === 'circle' ? (
        <button 
          onClick={toggleDropdown}
          aria-label="Añadir a mi lista" 
          title="Añadir a mi lista" 
          className={`w-8 h-8 rounded-full border-2 ${showDropdown ? 'border-primary bg-primary text-white' : 'border-gray-400 bg-black/50 text-white'} flex items-center justify-center hover:border-white transition-colors`}
        >
          <Plus className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={toggleDropdown}
          className={`flex items-center gap-2 px-6 py-3 rounded text-lg font-bold transition-colors ${showDropdown ? 'bg-primary text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
        >
          <Plus className="w-6 h-6" /> Mi Lista
        </button>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: variant === 'circle' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: variant === 'circle' ? 10 : -10 }}
            className={`absolute ${variant === 'circle' ? 'bottom-10 right-0' : 'top-14 right-0'} w-56 max-w-[min(14rem,90vw)] bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-[100] p-2 overflow-visible`}
          >
            <div className="px-2 py-1.5 border-b border-zinc-800 mb-1 flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider">
               <ListPlus size={12} /> Añadir a lista
            </div>

            {loadingLists ? (
              <div className="p-4 flex justify-center text-white">
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="max-h-32 overflow-y-auto custom-scrollbar text-white">
                {lists.map((list) => (
                  <button
                    key={list._id}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToList(list._id); }}
                    disabled={addingToId !== null}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 rounded flex items-center justify-between group/item transition-colors text-white"
                  >
                    <span className="truncate">{list.name}</span>
                    {addingToId === list._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <PlusCircle className="w-3 h-3 opacity-0 group-hover/item:opacity-100 text-primary" />
                    )}
                  </button>
                ))}
                
                {lists.length === 0 && !loadingLists && (
                  <p className="text-[10px] text-gray-500 px-3 py-2 italic text-center">No tienes listas aún.</p>
                )}
              </div>
            )}

            {/* Create New List Form */}
            {lists.length < 3 && (
              <div className="mt-1 pt-2 border-t border-zinc-800 p-1">
                <div className="flex gap-1">
                  <input 
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    placeholder="Nueva lista..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-primary text-white"
                    maxLength={20}
                  />
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); createList(); }}
                    disabled={creatingList || !newListName.trim()}
                    className="bg-primary text-white p-1 rounded disabled:opacity-50 hover:bg-red-700 transition-colors"
                  >
                    {creatingList ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div className={`mt-1 text-[10px] text-center font-bold p-1 rounded ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                {message.text}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
