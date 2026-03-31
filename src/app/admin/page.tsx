'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, UserPlus, Trash2, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users/list'); // I need to create this helper or use a server action. 
      // For now let's assume we create a simple GET endpoint or just fetch.
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al crear usuario');

      setFeedback({ type: 'success', msg: 'Usuario creado correctamente' });
      setFormData({ username: '', email: '', password: '', role: 'user' });
      fetchUsers();
      setTimeout(() => setIsModalOpen(false), 2000);
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">Cargando panel...</div>;

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-12 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" /> Panel de Administración
            </h1>
            <p className="text-gray-400">
              Gestiona los usuarios que tienen acceso a la plataforma Anime Fan.
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded text-sm font-bold hover:bg-red-700 transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Registrar Usuario
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" /> Usuarios del Sistema
              <span className="text-xs font-normal text-gray-400 bg-zinc-800 px-2 py-0.5 rounded-full ml-2">
                {users.length}
              </span>
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-zinc-800/50 text-xs uppercase font-semibold text-gray-400">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{user.username}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-block text-[10px] rounded font-bold uppercase ${user.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-gray-800 text-gray-300'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-500 hover:text-red-500 p-2 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-xl shadow-2xl relative overflow-hidden">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" /> Nuevo Usuario
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                {feedback && (
                  <div className={`p-3 rounded text-sm flex items-center gap-2 ${feedback.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/50' : 'bg-red-500/10 text-red-400 border border-red-500/50'}`}>
                    {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {feedback.msg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de Usuario</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-white outline-none focus:border-primary"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-white outline-none focus:border-primary"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña Provisoria</label>
                  <input 
                    type="password" 
                    required 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-white outline-none focus:border-primary"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol</label>
                  <select 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-white outline-none focus:border-primary capitalize"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">Usuario Estándar</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 rounded mt-4 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Registrando...' : 'Confirmar Registro'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
