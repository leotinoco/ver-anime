'use client';

import { useState, FormEvent } from 'react';
import { Lock, X, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface UserPasswordModalProps {
  userId: string;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserPasswordModal({
  userId,
  email,
  onClose,
  onSuccess,
}: UserPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isPasswordTooShort = password.length > 0 && password.length < 8;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (password.length < 8) {
      setFeedback({ type: 'error', msg: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({ type: 'error', msg: 'Las contraseñas no coinciden' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/users/${userId}/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al cambiar la contraseña');

      setFeedback({ type: 'success', msg: 'Contraseña actualizada correctamente' });
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => onSuccess(), 1500);
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Error desconocido',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-xl shadow-2xl relative overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Cambiar Contraseña
          </h3>
          <button aria-label="Cerrar modal" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-400">
            Restableciendo contraseña para: <span className="text-white font-semibold">{email}</span>
          </p>

          {feedback && (
            <div
              className={`p-3 rounded text-sm flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/50'
                  : 'bg-red-500/10 text-red-400 border border-red-500/50'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              {feedback.msg}
            </div>
          )}

          <div>
            <label htmlFor="new-password" className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 pr-10 text-white outline-none focus:border-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isPasswordTooShort && (
              <p className="text-xs text-red-400 mt-1">Mínimo 8 caracteres</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                required
                minLength={8}
                className={`w-full bg-zinc-800 border rounded p-2.5 pr-10 text-white outline-none focus:border-primary ${
                  passwordsMismatch
                    ? 'border-red-500'
                    : passwordsMatch
                      ? 'border-green-500'
                      : 'border-zinc-700'
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordsMismatch && (
              <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
            )}
            {passwordsMatch && (
              <p className="text-xs text-green-400 mt-1">Las contraseñas coinciden</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || password.length < 8 || !passwordsMatch}
            className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 rounded mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Actualizando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
