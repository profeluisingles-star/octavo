import { Copy, Mail, MessageCircle, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { NotificationChannelStatus } from '../types';
import { fetchNotificationStatus, sendTestNotification } from '../utils/storage';

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

export function TeacherControlPanel() {
  const [status, setStatus] = useState<NotificationChannelStatus | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const loadChannelStatus = useCallback(async () => {
    const s = await fetchNotificationStatus();
    if (s) setStatus(s);
  }, []);

  useEffect(() => {
    loadChannelStatus();
  }, [loadChannelStatus]);

  const handleSendTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await sendTestNotification();
    setTesting(false);
    setTestResult({ ok: res.ok, text: res.message });
  };

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch {
      // Clipboard fallback unavailable
    }
  };

  return (
    <section className="rounded-2xl border border-[#c6ded4] bg-[#f7fbf9] p-5 space-y-4 no-print">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-[#102a24]">
            Envíos Automáticos al Docente
          </h3>
          <p className="text-xs text-[#435b53]">
            Estado de entregas automáticas a {status?.teacherEmail || 'profeluisingles@gmail.com'} y WhatsApp (+506 8617 9072).
          </p>
        </div>

        <button
          type="button"
          onClick={handleSendTest}
          disabled={testing}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#17644e] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#124f3d] disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{testing ? 'Enviando...' : 'Probar envío automático'}</span>
        </button>
      </div>

      {testResult && (
        <p
          role="status"
          className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${
            testResult.ok
              ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
              : 'border-amber-300 bg-amber-50 text-amber-950'
          }`}
        >
          {testResult.text}
        </p>
      )}

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
              {status?.emailAutomatic ? 'Activo automáticamente' : 'Pendiente de configurar'}
            </span>
          </div>
          <p className="text-xs text-[#354c45]">
            Destino: <strong>{status?.teacherEmail || 'profeluisingles@gmail.com'}</strong>
          </p>
          <p className="text-[11px] text-[#435b53]">
            {status?.emailAutomatic
              ? 'Cada práctica, quiz, lectura o visita se envía al correo automáticamente.'
              : 'Configura APPS_SCRIPT_WEBHOOK_URL o RESEND_API_KEY en Netlify para envío automático.'}
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
              : 'El botón "Enviar por WhatsApp" funciona siempre. Para envíos automáticos agrega CALLMEBOT_APIKEY.'}
          </p>
        </div>
      </div>

      <details className="rounded-xl border border-[#d4e4dd] bg-white p-4">
        <summary className="cursor-pointer text-xs font-bold text-[#17644e]">
          Cómo activar el envío automático gratis a profeluisingles@gmail.com en Netlify
        </summary>
        <div className="mt-3 space-y-3 text-xs text-[#354c45] leading-relaxed">
          <div>
            <p className="font-bold text-[#102a24]">1. Correo automático gratis con tu cuenta de Google (Apps Script):</p>
            <p>
              Pega esta función <code>doPost</code> en Google Apps Script, publícala como Aplicación web (<em>Cualquier persona</em>) y guarda la URL en Netlify como variable <code>APPS_SCRIPT_WEBHOOK_URL</code>:
            </p>
            <pre className="mt-1.5 overflow-x-auto rounded-lg bg-[#102a24] p-3 text-[11px] text-[#e6f4ee] font-mono-num">
              {APPS_SCRIPT_SNIPPET}
            </pre>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="mt-1.5 inline-flex items-center gap-1 font-bold text-[#17644e] hover:underline"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{copiedSnippet ? '¡Código Apps Script copiado!' : 'Copiar función doPost'}</span>
            </button>
          </div>

          <div>
            <p className="font-bold text-[#102a24]">2. Alternativa rápida de correo (Resend):</p>
            <p>
              Agrega la variable <code>RESEND_API_KEY</code> en Netlify.
            </p>
          </div>

          <div>
            <p className="font-bold text-[#102a24]">3. WhatsApp automático a +506 8617 9072 (CallMeBot):</p>
            <p>
              Activa CallMeBot desde tu WhatsApp y guarda la clave en Netlify como <code>CALLMEBOT_APIKEY</code>.
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}
