import { KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { AccessSession } from '../types';
import { saveAccessSession, verifyAccessCodeOnServer } from '../utils/storage';

interface AccessGateProps {
  onUnlocked: (session: AccessSession) => void;
}

export function AccessGate({ onUnlocked }: AccessGateProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Escribe el código que te entregó Mr. Picado.');
      return;
    }

    setLoading(true);
    setError('');
    const result = await verifyAccessCodeOnServer(trimmed);
    setLoading(false);

    if (!result.ok || !result.token || !result.role) {
      setError(result.error || 'El código no coincide. Revisa los caracteres.');
      return;
    }

    const session: AccessSession = {
      token: result.token,
      role: result.role,
      codeHint: result.codeHint || trimmed.toUpperCase(),
      activatedAt: new Date().toISOString(),
    };
    saveAccessSession(session);
    onUnlocked(session);
  };

  return (
    <div className="min-h-screen bg-[#eef6f2] text-[#102a24] flex flex-col justify-between">
      <header className="border-b border-[#1c4b3d] bg-[#102e28] text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-display text-lg font-extrabold tracking-tight">
            Learning with Mr. Picado
          </span>
          <span className="text-xs font-semibold text-[#cde7dc]">Inglés 8.º Año</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <section className="w-full max-w-md rounded-2xl border border-[#c6ded4] bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="space-y-2">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f4ee] text-[#17644e]">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#102a24]">Acceso a la Plataforma</h1>
            <p className="text-sm text-[#435b53] leading-relaxed">
              Escribe el código de activación que te dio el profesor. El acceso quedará guardado en este navegador.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="access-code-input" className="block text-sm font-bold text-[#102a24] mb-1.5">
                Código de acceso
              </label>
              <div className="relative">
                <KeyRound
                  className="h-4 w-4 text-[#647d75] absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="access-code-input"
                  type="text"
                  autoComplete="one-time-code"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={32}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ej: MP-XXXXX"
                  className="w-full rounded-xl border border-[#679888] bg-[#f8fbfa] pl-10 pr-3.5 py-2.5 font-mono-num text-base font-bold tracking-wider text-[#102a24] uppercase focus-visible:outline-2 focus-visible:outline-[#17644e]"
                />
              </div>
            </div>

            {error && (
              <p
                role="status"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-800"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#17644e] px-4 py-3 text-sm font-bold text-white hover:bg-[#124f3d] disabled:opacity-60 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>{loading ? 'Comprobando acceso...' : 'Activar acceso'}</span>
            </button>
          </form>

          <div className="border-t border-[#e6efeb] pt-4 text-xs text-[#435b53] space-y-1">
            <p>¿Necesitas un código nuevo o cambiaste de dispositivo?</p>
            <p>
              Contacta a <strong>Mr. Picado</strong> al{' '}
              <a
                href="https://wa.me/50686179072"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#17644e] underline"
              >
                WhatsApp +506 8617 9072
              </a>{' '}
              o{' '}
              <span className="font-semibold text-[#102a24]">profeluisingles@gmail.com</span>.
            </p>
          </div>
        </section>
      </main>

      <footer className="py-4 text-center text-xs text-[#435b53]">
        Learning with Mr. Picado · Inglés 8.º Año
      </footer>
    </div>
  );
}
