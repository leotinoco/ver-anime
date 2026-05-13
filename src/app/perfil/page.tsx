'use client';

import { useEffect, useRef, useReducer } from 'react';
import Image from 'next/image';
import { User, Mail, Shield, ListVideo, Edit2, Check, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface State {
  user: any;
  lists: any[];
  editingListId: string | null;
  newListName: string;
}

type Action =
  | { type: 'SET_USER_DATA'; payload: { user: any; lists: any[] } }
  | { type: 'SET_USER'; payload: any }
  | { type: 'START_EDITING'; payload: { id: string; name: string } }
  | { type: 'CANCEL_EDITING' }
  | { type: 'SET_NEW_LIST_NAME'; payload: string }
  | { type: 'UPDATE_LIST_NAME'; payload: { id: string; name: string } };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_USER_DATA':
      return { ...state, user: action.payload.user, lists: action.payload.lists };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'START_EDITING':
      return { ...state, editingListId: action.payload.id, newListName: action.payload.name };
    case 'CANCEL_EDITING':
      return { ...state, editingListId: null, newListName: '' };
    case 'SET_NEW_LIST_NAME':
      return { ...state, newListName: action.payload };
    case 'UPDATE_LIST_NAME':
      return {
        ...state,
        lists: state.lists.map((l) => (l._id === action.payload.id ? { ...l, name: action.payload.name } : l)),
        editingListId: null,
      };
    default:
      return state;
  }
};

const initialState: State = {
  user: null,
  lists: [],
  editingListId: null,
  newListName: '',
};

export default function PerfilPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const loadingRef = useRef(true);
  
  const { user, lists, editingListId, newListName } = state;
  const { push, refresh } = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!data.authenticated) {
          push('/login');
          return;
        }
        
        const listsRes = await fetch('/api/lists'); 
        const listsData = await listsRes.json();
        
        dispatch({ type: 'SET_USER_DATA', payload: { user: data.user, lists: listsData.lists || [] } });
      } catch (err) {
        console.error(err);
      } finally {
        loadingRef.current = false;
      }
    };

    fetchProfile();
  }, [push]);

  const handleRenameList = async (id: string) => {
    if (!newListName.trim()) return;
    
    try {
      const res = await fetch(`/api/lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName })
      });
      
      if (res.ok) {
        dispatch({ type: 'UPDATE_LIST_NAME', payload: { id, name: newListName } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      push('/login');
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarUrl })
      });
      
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: 'SET_USER', payload: data.user });
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingRef.current) return <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">Cargando perfil…</div>;

  const avatars = [
    '/avatars/avatar-1.avif',
    '/avatars/avatar-2.avif',
    '/avatars/avatar-3.avif',
    '/avatars/avatar-4.avif',
    '/avatars/avatar-5.avif',
    '/avatars/avatar-6.avif',
    '/avatars/avatar-7.avif',
    '/avatars/avatar-8.avif',
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-12 max-w-4xl">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl mb-8">
          <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/5 border-b border-zinc-800 flex items-end p-6 relative">
            <div className="size-28 bg-zinc-800 rounded-2xl border-4 border-zinc-900 flex items-center justify-center shadow-xl overflow-hidden relative group">
              {user?.avatar ? (
                <Image src={user.avatar} alt="Avatar" width={112} height={112} className="object-cover" />
              ) : (
                <User size={48} className="text-zinc-500" />
              )}
            </div>
            <div className="ml-6 mb-2">
              <h1 className="text-3xl font-semibold text-white">{user?.username}</h1>
              <p className="text-zinc-400 text-sm flex items-center gap-1 capitalize">
                <Shield size={14} className="text-primary" /> {user?.role}
              </p>
            </div>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">Personaliza tu Avatar</h3>
              <div className="flex flex-wrap gap-4">
                {avatars.map((avatar, i) => (
                  <button
                    key={avatar}
                    onClick={() => handleAvatarChange(avatar)}
                    aria-label={`Seleccionar Avatar ${i + 1}`}
                    title={`Seleccionar Avatar ${i + 1}`}
                    className={`size-16 rounded-xl border-2 transition-all overflow-hidden hover:scale-110 active:scale-95 ${
                      user?.avatar === avatar ? 'border-primary shadow-lg shadow-primary/20 scale-105' : 'border-zinc-800 grayscale hover:grayscale-0'
                    }`}
                  >
                    <Image src={avatar} alt={`Avatar ${i+1}`} width={64} height={64} className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1">
                <label htmlFor="emailDisplay" className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-1">
                  <Mail size={12} /> Correo Electrónico
                </label>
                <div id="emailDisplay" className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-800 text-zinc-200">
                  {user?.email}
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="px-6 py-2 bg-zinc-800 hover:bg-red-900 hover:text-white text-zinc-300 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border border-zinc-700"
            >
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <ListVideo className="text-primary" /> Gestión de Mis Listas
          </h2>
          
          <div className="grid gap-4">
            {lists.map((list) => (
              <div key={list._id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between group">
                <div className="flex-1">
                  {editingListId === list._id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        aria-label="Nuevo nombre de la lista"
                        placeholder="Nuevo nombre…"
                        className="bg-zinc-800 border border-primary rounded px-3 py-1 text-white outline-none"
                        value={newListName}
                        onChange={(e) => dispatch({ type: 'SET_NEW_LIST_NAME', payload: e.target.value })}
                      />
                      <button onClick={() => handleRenameList(list._id)} aria-label="Confirmar nuevo nombre" className="p-1 text-green-500 hover:bg-green-500/10 rounded">
                        <Check size={18} />
                      </button>
                      <button onClick={() => dispatch({ type: 'CANCEL_EDITING' })} aria-label="Cancelar edición" className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-zinc-100">{list.name}</h3>
                      <button 
                        onClick={() => dispatch({ type: 'START_EDITING', payload: { id: list._id, name: list.name } })}
                        aria-label={`Renombrar lista ${list.name}`}
                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-opacity"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-zinc-500 mt-1">{list.animes.length} animes guardados</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex gap-x-4 overflow-hidden py-1">
                    {list.animes.slice(0, 3).map((anime: any) => (
                      <div key={anime.slug} className="inline-block relative size-10 rounded-full border-2 border-zinc-900 overflow-hidden">
                        <Image 
                          src={anime.cover} 
                          alt={anime.title} 
                          fill
                          sizes="40px"
                          className="object-cover" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {lists.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">
                Aún no has creado ni guardado ninguna lista.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
