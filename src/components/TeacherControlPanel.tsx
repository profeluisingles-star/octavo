import { CheckCircle2, Copy, KeyRound, Mail, MessageCircle, Plus, Send, Shield, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { AccessSession, NotificationChannelStatus } from '../types';
import {
  fetchNotificationStatus,
  generateMpCode,
  sendTestNotification,
  verifyAccessCodeOnServer,
} from '../utils/storage';

interface TeacherControlPanelProps {
  accessSession: AccessSession;
}

const APPS_SCRIPT_SNIPPET = `function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  MailApp.sendEmail({
    to: data.recipient || 'profeluisingles@gmail.com',
    subject: data.subject || 'Learning with Mr. Picado',
    body: data.body || ''
  });
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export function TeacherControlPanel({ accessSession }: TeacherControlPanelProps) {
  const [teacherKey, setTeacherKey] = useState<string>(() =>
    accessSession.role === 'teacher' ? accessSession.codeHint : ''
  );
  const [unlocked, setUnlocked] = useState<boolean>(accessSession.role === 'teacher');
  const [authError, setAuthError] = useState<string>('');
  const [status, setStatus] = useState<NotificationChannelStatus | null>(null);
  const [codes, setCodes] = useState<string[]>([]);
  const [customCodes, setCustomCodes] = useState<string[]>([]);
  const [newCodeInput, setNewCodeInput] = useState<string>(() => generateMpCode());
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  const loadChannelStatus = useCallback(async () => {
    const s = await fetchNotificationStatus();
    if (s) setStatus(s);
  }, []);

  const loadCodes = useCallback(async (key: string) => {
    try {
      const res = await fetch('/api/access/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherCode: key, action: 'list' }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.ok) {
        setCodes(data.allCodes || []);
        setCustomCodes(data.customCodes || []);
      }
    } catch {
      // Netlify static mode relies on STUDENT_ACCESS_CODES env var
    }
  }, []);

  useEffect(() => {
    loadChannelStatus();
  }, [loadChannelStatus]);

  useEffect(() => {
    if (unlocked && teacherKey) {
      loadCodes(teacherKey);
    }
  }, [unlocked, teacherKey, loadCodes]);

  const handleTeacherUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await verifyAccessCodeOnServer(teacherKey.trim());
    if (res.ok && res.role === 'teacher') {
      setUnlocked(true);
      setAuthError('');
      loadCodes(teacherKey.trim());
    } else {
      setAuthError('Código docente incorrecto.');
    }
  };

  const handleCodeAction = async (action: 'add' | 'remove', code: string) => {
    if (!code.trim()) return;
    try {
      const res = await fetch('/api/access/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherCode: teacherKey, action, code: code.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setCodes(data.allCodes || []);
        setCustomCodes(data.customCodes || []);
        if (action === 'add') {
          setNewCodeInput(generateMpCode());
        }
        loadChannelStatus();
      }
    } catch {
      // Ignore network restriction
    }
  };

  const handleSendTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await sendTestNotification(teacherKey);
    setTesting(false);
    setTestResult({ ok: res.ok, text: res.message });
  };

  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(label);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch {
      // Clipboard fallback unavailable
    }
  };

  return (
    <section className="rounded-2xl border border-[#c6ded4] bg-[#f7fbf9] p-5 space-y-5 no-print">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-[#17644e]" aria-hidden="true" />
          <div>
            <h3 className="text-base font-extrabold text-[#102a24]">
              Panel Docente: Códigos de Acceso y Envíos Automáticos
            </h3>
            <p className="text-xs text-[#435b53]">
              Estado en tiempo real de entregas automáticas a correo ({status?.teacherEmail || 'profeluisingles@gmail.com'}) y WhatsApp (+506 8617 9072).
            </p>
          </div>
        </div>
      </div>

      {/* Live Automatic Delivery Status Cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#d4e4dd] bg-white p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#17644e]">
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span>Correo Automático</span>
            </span>
            <span
              className={`text-xs font-bold ${
                status?.emailAutomatic ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {status?.emailAutomatic ? 'Activo automáticamente' : 'Requiere clave en Netlify'}
            </span>
          </div>
          <p className="text-xs text-[#354c45]">
            Destino: <strong>{status?.teacherEmail || 'profeluisingles@gmail.com'}</strong>
          </p>
          <p className="text-[11px] text-[#435b53]">
            {status?.emailAutomatic
              ? 'Cada práctica, quiz, lectura o visita se envía al correo automáticamente.'
              : 'Usa Gmail gratis con Google Apps Script (APPS_SCRIPT_WEBHOOK_URL) o Resend (RESEND_API_KEY).'}
          </p>
        </div>

        <div className="rounded-xl border border-[#d4e4dd] bg-white p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#17644e]">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>WhatsApp Automático</span>
            </span>
            <span
              className={`text-xs font-bold ${
                status?.whatsappAutomatic ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {status?.whatsappAutomatic ? 'Activo automáticamente' : 'Enlace manual activo'}
            </span>
          </div>
          <p className="text-xs text-[#354c45]">
            Destino: <strong>+{status?.whatsappPhone || '50686179072'}</strong>
          </p>
          <p className="text-[11px] text-[#435b53]">
            {status?.whatsappAutomatic
              ? 'Mensajes automáticos por CallMeBot habilitados al finalizar cada actividad.'
              : 'WhatsApp normal requiere pulsar "Enviar". Para alertas automáticas agrega CALLMEBOT_APIKEY.'}
          </p>
        </div>
      </div>

      {!unlocked ? (
        <form onSubmit={handleTeacherUnlock} className="rounded-xl border border-[#d4e4dd] bg-white p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[210px]">
            <label htmlFor="teacher-admin-code" className="block text-xs font-bold text-[#102a24] mb-1">
              Ingresa el código docente para administrar códigos MP-XXXXX y probar envíos
            </label>
            <input
              id="teacher-admin-code"
              type="password"
              value={teacherKey}
              onChange={(e) => setTeacherKey(e.target.value)}
              placeholder="Código docente"
              className="w-full rounded-lg border border-[#aac9bd] px-3 py-1.5 text-sm font-mono-num"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[#17644e] px-4 py-2 text-xs font-bold text-white hover:bg-[#124f3d]"
          >
            Desbloquear panel docente
          </button>
          {authError && <p className="w-full text-xs font-semibold text-rose-700">{authError}</p>}
        </form>
      ) : (
        <div className="space-y-4">
          {/* Code Generator & Active List */}
          <div className="rounded-xl border border-[#d4e4dd] bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-[#102a24] inline-flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-[#17644e]" aria-hidden="true" />
                <span>Códigos de acceso para estudiantes (estilo MP-XXXXX)</span>
              </h4>
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#17644e] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#124f3d] disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{testing ? 'Enviando...' : 'Enviar prueba automática'}</span>
              </button>
            </div>

            {testResult && (
              <p
                role="status"
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  testResult.ok
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                    : 'border-amber-300 bg-amber-50 text-amber-950'
                }`}
              >
                {testResult.text}
              </p>
            )}

            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                value={newCodeInput}
                onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
                placeholder="Ej: MP-EBA64"
                aria-label="Nuevo código de estudiante"
                className="rounded-lg border border-[#aac9bd] bg-[#f8fbfa] px-3 py-1.5 font-mono-num text-sm font-bold uppercase text-[#102a24]"
              />
              <button
                type="button"
                onClick={() => setNewCodeInput(generateMpCode())}
                className="rounded-lg border border-[#aac9bd] bg-white px-3 py-1.5 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
              >
                Generar otro aleatorio
              </button>
              <button
                type="button"
                onClick={() => handleCodeAction('add', newCodeInput)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#17644e] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#124f3d]"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Agregar código</span>
              </button>
            </div>

            {codes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#ebf2ee]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#435b53]">
                    Códigos activos en este servidor ({codes.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText('env', codes.join(','))}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#17644e] hover:underline"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {copiedKey === 'env'
                        ? '¡Lista copiada para Netlify!'
                        : 'Copiar para Netlify (STUDENT_ACCESS_CODES)'}
                    </span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {codes.map((c) => {
                    const isCustom = customCodes.some((cc) => cc.toUpperCase() === c.toUpperCase());
                    return (
                      <div
                        key={c}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#d4e4dd] bg-[#f8fbfa] px-2.5 py-1 text-xs font-mono-num font-bold text-[#102a24]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#17644e]" aria-hidden="true" />
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => copyText(c, c)}
                          title="Copiar código"
                          className="text-[#17644e] hover:text-[#102a24]"
                        >
                          <Copy className="h-3 w-3" aria-hidden="true" />
                        </button>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => handleCodeAction('remove', c)}
                            title="Revocar código"
                            className="text-rose-700 hover:text-rose-900"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Setup Guide for Free Automatic Gmail + WhatsApp on Netlify */}
          <details className="rounded-xl border border-[#d4e4dd] bg-white p-4">
            <summary className="cursor-pointer text-xs font-bold text-[#17644e]">
              Cómo activar correo automático gratis a profeluisingles@gmail.com y WhatsApp automático en Netlify
            </summary>
            <div className="mt-3 space-y-3 text-xs text-[#354c45] leading-relaxed">
              <div>
                <p className="font-bold text-[#102a24]">1. Correo automático gratis con tu cuenta de Google (Apps Script):</p>
                <p>
                  En tu Google Apps Script pega esta función <code>doPost</code>, publícala como Aplicación web (<em>Cualquier persona</em>) y guarda la URL en Netlify como variable de entorno <code>APPS_SCRIPT_WEBHOOK_URL</code>:
                </p>
                <pre className="mt-1.5 overflow-x-auto rounded-lg bg-[#102a24] p-3 text-[11px] text-[#e6f4ee] font-mono-num">
                  {APPS_SCRIPT_SNIPPET}
                </pre>
                <button
                  type="button"
                  onClick={() => copyText('snippet', APPS_SCRIPT_SNIPPET)}
                  className="mt-1.5 inline-flex items-center gap-1 font-bold text-[#17644e] hover:underline"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{copiedKey === 'snippet' ? '¡Código Apps Script copiado!' : 'Copiar función doPost'}</span>
                </button>
              </div>

              <div>
                <p className="font-bold text-[#102a24]">2. Alternativa rápida de correo (Resend API):</p>
                <p>
                  Crea una cuenta gratuita en Resend y agrega la variable <code>RESEND_API_KEY</code> en Netlify.
                </p>
              </div>

              <div>
                <p className="font-bold text-[#102a24]">3. WhatsApp automático a +506 8617 9072 (CallMeBot):</p>
                <p>
                  Activa CallMeBot enviando el mensaje de autorización desde tu WhatsApp personal y guarda la clave recibida en Netlify como <code>CALLMEBOT_APIKEY</code>.
                </p>
              </div>
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
