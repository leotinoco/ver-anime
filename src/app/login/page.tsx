'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { Suspense } from 'react';
import styles from './login.module.css';

function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Credenciales inválidas');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {error && (
        <div className="bg-red-500/20 text-red-400 border border-red-500/50 p-3 rounded text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-gray-400 text-sm font-medium mb-1" htmlFor="identifier">
          Usuario o Correo Electrónico
        </label>
        <input
          id="identifier"
          type="text"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
          placeholder="usuario o correo@ejemplo.com"
        />
      </div>

      <div>
        <label className="block text-gray-400 text-sm font-medium mb-1" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? 'Iniciando sesión...' : (
          <>
            <LogIn className="w-5 h-5" /> Entrar
          </>
        )}
      </button>

      <p className="text-gray-400 text-sm text-center">
        ¿Aún no tienes cuenta? El registro público está cerrado temporalmente. Creado para demostración.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Heavy Blur background inspired by Netflix */}
      <div className={`absolute inset-0 w-full h-full opacity-30 pointer-events-none ${styles.bgBlur}`}></div>

      <div className="w-full max-w-md bg-black/80 backdrop-blur-md rounded-xl p-8 shadow-2xl relative z-10 border border-zinc-800">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Inicia Sesión</h1>
        <Suspense fallback={<div className="text-white text-center">Cargando formulario...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
