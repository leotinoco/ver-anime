'use client';

import { useRef, useEffect, useReducer } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, PlusCircle, ListPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddToListButtonProps {
  slug: string;
  title: string;
  cover: string;
  variant?: 'circle' | 'full';
}

interface State {
  showDropdown: boolean;
  lists: any[];
  loadingLists: boolean;
  addingToId: string | null;
  newListName: string;
  creatingList: boolean;
  message: { text: string; type: 'success' | 'error' } | null;
}

type Action =
  | { type: 'TOGGLE_DROPDOWN' }
  | { type: 'CLOSE_DROPDOWN' }
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: any[] }
  | { type: 'ADD_START'; payload: string }
  | { type: 'ADD_SUCCESS' }
  | { type: 'ADD_ERROR'; payload: string }
  | { type: 'SET_NEW_LIST_NAME'; payload: string }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS'; payload: any }
  | { type: 'CREATE_ERROR'; payload: string }
  | { type: 'CLEAR_MESSAGE' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'TOGGLE_DROPDOWN':
      return { ...state, showDropdown: !state.showDropdown };
    case 'CLOSE_DROPDOWN':
      return { ...state, showDropdown: false };
    case 'FETCH_START':
      return { ...state, loadingLists: true };
    case 'FETCH_SUCCESS':
      return { ...state, loadingLists: false, lists: action.payload };
    case 'ADD_START':
      return { ...state, addingToId: action.payload };
    case 'ADD_SUCCESS':
      return { ...state, addingToId: null, message: { text: '¡Añadido!', type: 'success' } };
    case 'ADD_ERROR':
      return { ...state, addingToId: null, message: { text: action.payload, type: 'error' } };
    case 'SET_NEW_LIST_NAME':
      return { ...state, newListName: action.payload };
    case 'CREATE_START':
      return { ...state, creatingList: true };
    case 'CREATE_SUCCESS':
      return { ...state, creatingList: false, lists: [action.payload, ...state.lists], newListName: '' };
    case 'CREATE_ERROR':
      return { ...state, creatingList: false, message: { text: action.payload, type: 'error' } };
    case 'CLEAR_MESSAGE':
      return { ...state, message: null };
    default:
      return state;
  }
};

const initialState: State = {
  showDropdown: false,
  lists: [],
  loadingLists: false,
  addingToId: null,
  newListName: '',
  creatingList: false,
  message: null,
};

export default function AddToListButton({ slug, title, cover, variant = 'circle' }: AddToListButtonProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const { showDropdown, lists, loadingLists, addingToId, newListName, creatingList, message } = state;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { push } = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        dispatch({ type: 'CLOSE_DROPDOWN' });
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const fetchLists = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await fetch('/api/lists');
      const data = await res.json();
      if (data.authenticated) {
        dispatch({ type: 'FETCH_SUCCESS', payload: data.lists });
      } else {
        push('/login');
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
      dispatch({ type: 'FETCH_SUCCESS', payload: [] });
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showDropdown) {
      fetchLists();
    }
    dispatch({ type: 'TOGGLE_DROPDOWN' });
  };

  const addToList = async (listId: string) => {
    dispatch({ type: 'ADD_START', payload: listId });
    try {
      const res = await fetch(`/api/lists/${listId}/anime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title, cover }),
      });
      const data = await res.json();
      
      if (res.ok) {
        dispatch({ type: 'ADD_SUCCESS' });
        setTimeout(() => {
          dispatch({ type: 'CLOSE_DROPDOWN' });
          dispatch({ type: 'CLEAR_MESSAGE' });
        }, 1500);
      } else {
        dispatch({ type: 'ADD_ERROR', payload: data.error || 'Error' });
      }
    } catch {
      dispatch({ type: 'ADD_ERROR', payload: 'Error de red' });
    }
  };

  const createList = async () => {
    if (!newListName.trim()) return;
    dispatch({ type: 'CREATE_START' });
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName }),
      });
      const data = await res.json();
      
      if (res.ok) {
        dispatch({ type: 'CREATE_SUCCESS', payload: data.list });
        addToList(data.list._id);
      } else {
        dispatch({ type: 'CREATE_ERROR', payload: data.error || 'Límite alcanzado' });
      }
    } catch {
      dispatch({ type: 'CREATE_ERROR', payload: 'Error de red' });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {variant === 'circle' ? (
        <button 
          onClick={toggleDropdown}
          aria-label="Añadir a mi lista" 
          title="Añadir a mi lista" 
          className={`size-8 rounded-full border-2 ${showDropdown ? 'border-primary bg-primary text-white' : 'border-zinc-400 bg-black/50 text-white'} flex items-center justify-center hover:border-white transition-colors`}
        >
          <Plus className="size-4" />
        </button>
      ) : (
        <button 
          onClick={toggleDropdown}
          className={`flex items-center gap-2 px-6 py-3 rounded text-lg font-semibold transition-colors ${showDropdown ? 'bg-primary text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
        >
          <Plus className="size-6" /> Mi Lista
        </button>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <m.div 
            initial={{ opacity: 0, scale: 0.9, y: variant === 'circle' ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: variant === 'circle' ? -10 : 10 }}
            className={`absolute ${variant === 'circle' ? 'bottom-full mb-3 right-0' : 'top-full mt-3 right-0'} w-56 max-w-[min(14rem,90vw)] bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-[100] p-2 overflow-visible`}
          >
            <div className="px-2 py-1.5 border-b border-zinc-800 mb-1 flex items-center gap-2 text-primary font-semibold text-[10px] uppercase tracking-wider">
               <ListPlus className="size-3" /> Añadir a lista
            </div>

            {loadingLists ? (
              <div className="p-4 flex justify-center text-white">
                <Loader2 className="size-5 animate-spin text-zinc-500" />
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
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <PlusCircle className="size-3 opacity-0 group-hover/item:opacity-100 text-primary" />
                    )}
                  </button>
                ))}
                
                {lists.length === 0 && !loadingLists && (
                  <p className="text-[10px] text-zinc-500 px-3 py-2 italic text-center">No tienes listas aún.</p>
                )}
              </div>
            )}

            {/* Create New List Form */}
            {!loadingLists && (
              lists.length < 25 ? (
                <div className="mt-1 pt-2 border-t border-zinc-800 p-1">
                  <div className="flex gap-1">
                    <input 
                      type="text"
                      value={newListName}
                      onChange={(e) => dispatch({ type: 'SET_NEW_LIST_NAME', payload: e.target.value })}
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
                      {creatingList ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-1 pt-2 border-t border-zinc-800 p-1 text-center">
                  <p className="text-[9px] text-yellow-500 font-semibold uppercase tracking-tighter">Límite de 25 listas alcanzado</p>
                </div>
              )
            )}

            {message && (
              <div className={`mt-1 text-[10px] text-center font-semibold p-1 rounded ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                {message.text}
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
