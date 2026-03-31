'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, ListVideo, Edit2, Check, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.authenticated) {
        router.push('/login');
        return;
      }
      setUser(data.user);
      
      // Fetch user lists - Assuming we create an endpoint for this
      const listsRes = await fetch('/api/lists'); 
      const listsData = await listsRes.json();
      if (listsData.lists) setLists(listsData.lists);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRenameList = async (id: string) => {
    if (!newListName.trim()) return;
    
    try {
      const res = await fetch(`/api/lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName })
      });
      
      if (res.ok) {
        setLists(lists.map(l => l._id === id ? { ...l, name: newListName } : l));
        setEditingListId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
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
        setUser(data.user);
        // Refresh the page to update the Navbar through server-side cookie update
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">Cargando perfil...</div>;

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
            <div className="w-28 h-28 bg-zinc-800 rounded-2xl border-4 border-zinc-900 flex items-center justify-center shadow-xl overflow-hidden relative group">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-500" />
              )}
            </div>
            <div className="ml-6 mb-2">
              <h1 className="text-3xl font-black text-white">{user?.username}</h1>
              <p className="text-gray-400 text-sm flex items-center gap-1 capitalize">
                <Shield size={14} className="text-primary" /> {user?.role}
              </p>
            </div>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Personaliza tu Avatar</h3>
              <div className="flex flex-wrap gap-4">
                {avatars.map((avatar, i) => (
                  <button
                    key={i}
                    onClick={() => handleAvatarChange(avatar)}
                    className={`w-16 h-16 rounded-xl border-2 transition-all overflow-hidden hover:scale-110 active:scale-95 ${
                      user?.avatar === avatar ? 'border-primary shadow-lg shadow-primary/20 scale-105' : 'border-zinc-800 grayscale hover:grayscale-0'
                    }`}
                  >
                    <img src={avatar} alt={`Avatar ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Mail size={12} /> Correo Electrónico
                </label>
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-800 text-gray-200">
                  {user?.email}
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="px-6 py-2 bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 text-gray-300 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border border-zinc-700"
            >
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-3">
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
                        className="bg-zinc-800 border border-primary rounded px-3 py-1 text-white outline-none"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => handleRenameList(list._id)} className="p-1 text-green-500 hover:bg-green-500/10 rounded">
                        <Check size={18} />
                      </button>
                      <button onClick={() => setEditingListId(null)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-100">{list.name}</h3>
                      <button 
                        onClick={() => {
                          setEditingListId(list._id);
                          setNewListName(list.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-opacity"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{list.animes.length} animes guardados</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-4 overflow-hidden py-1">
                    {list.animes.slice(0, 3).map((anime: any, i: number) => (
                      <img 
                        key={i}
                        className="inline-block h-10 w-10 rounded-full border-2 border-zinc-900 object-cover" 
                        src={anime.cover} 
                        alt={anime.title} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {lists.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl text-gray-500">
                Aún no has creado ni guardado ninguna lista.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
