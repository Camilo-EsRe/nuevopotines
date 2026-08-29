import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Loader2, UserPlus, LogIn } from 'lucide-react';

interface DispatcherLoginProps {
  onLogin: () => void;
}

export function DispatcherLogin({ onLogin }: DispatcherLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Check existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) onLogin();
    });
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // Auto-login after signup (email confirmation is off)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        onLogin();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-gold-lg mb-4">
            <img src="/potines.png" alt="POTINES" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold gold-text">POTINES</h1>
          <p className="text-white/40 text-sm mt-1">Panel de despacho</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="flex gap-2 p-1 bg-ink-700/60 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-gold-500 text-ink-900'
                  : 'text-white/50'
              }`}
            >
              <LogIn className="w-4 h-4" /> Ingresar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-gold-500 text-ink-900'
                  : 'text-white/50'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Crear cuenta
            </button>
          </div>

          <div>
            <label className="text-xs text-gold-300 font-medium mb-1.5 block">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="despacho@potines.co"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gold-300 font-medium mb-1.5 block">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pr-10"
                minLength={6}
                required
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3.5 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> {mode === 'signup' ? 'Creando...' : 'Ingresando...'}
              </>
            ) : mode === 'signup' ? (
              'Crear cuenta e ingresar'
            ) : (
              'Ingresar'
            )}
          </button>

          {mode === 'signup' && (
            <p className="text-xs text-white/30 text-center">
              La primera cuenta que crees será la del despacho.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
