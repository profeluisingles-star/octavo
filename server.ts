import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '.data');
const DATA_FILE = path.join(DATA_DIR, 'records.json');

export type GradeEventType =
  | 'Visita'
  | 'Práctica'
  | 'Quiz'
  | 'Quiz reiniciado'
  | 'Lectura'
  | 'Vocabulario'
  | 'Audio Lab'
  | 'Verbos'
  | 'Flashcards';

export interface GradeEvent {
  id: string;
  timestamp: string;
  student: string;
  type: GradeEventType;
  activity: string;
  topicIndex?: number;
  score: number;
  max: number;
  percentage: number;
  details?: string;
}

interface StorePayload {
  events: GradeEvent[];
}

function ensureStore(): StorePayload {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial: StorePayload = { events: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as StorePayload;
    return {
      events: Array.isArray(parsed?.events) ? parsed.events : [],
    };
  } catch {
    return { events: [] };
  }
}

let memoryStore: StorePayload = ensureStore();

function persistStore(next: StorePayload): void {
  memoryStore = { events: next.events };
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Could not persist records:', err);
  }
}

function normalizeStudentName(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  const cleaned = name.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (cleaned.length < 2 || cleaned.length > 80) return null;
  if (!/^\p{L}[\p{L}\p{M} .’'-]*$/u.test(cleaned)) return null;
  return cleaned;
}

const VALID_TYPES = new Set<string>([
  'Visita',
  'Práctica',
  'Quiz',
  'Quiz reiniciado',
  'Lectura',
  'Vocabulario',
  'Audio Lab',
  'Verbos',
  'Flashcards',
]);

function formatCostaRicaStamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
  } catch {
    return iso;
  }
}

function getNotificationConfig() {
  const teacherEmail = (process.env.TEACHER_EMAIL || 'profeluisingles@gmail.com').trim();
  const whatsappPhone = (process.env.WHATSAPP_PHONE || '50686179072').replace(/\D/g, '');
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const resendFrom = (process.env.RESEND_FROM || 'Learning with Mr. Picado <onboarding@resend.dev>').trim();
  const appsScriptUrl = (process.env.APPS_SCRIPT_WEBHOOK_URL || '').trim();
  const callmebotApiKey = (process.env.CALLMEBOT_APIKEY || '').trim();
  const notifyWebhookUrl = (process.env.NOTIFY_WEBHOOK_URL || '').trim();

  return {
    teacherEmail,
    whatsappPhone,
    resendApiKey,
    resendFrom,
    appsScriptUrl,
    callmebotApiKey,
    notifyWebhookUrl,
  };
}

async function dispatchNotifications(ev: GradeEvent): Promise<{ delivered: string[]; errors: string[] }> {
  const cfg = getNotificationConfig();
  const delivered: string[] = [];
  const errors: string[] = [];

  const stamp = formatCostaRicaStamp(ev.timestamp);
  const scoreLine = ev.max > 0 ? `${ev.score}/${ev.max} (${ev.percentage}%)` : 'Registro de acceso';
  const subject = `Learning with Mr. Picado · ${ev.student} · ${ev.type}`;
  const plainBody = [
    'Learning with Mr. Picado — Reporte Automático',
    `Estudiante: ${ev.student}`,
    `Fecha (CR): ${stamp}`,
    `Evento: ${ev.type}`,
    `Actividad: ${ev.activity}`,
    `Resultado: ${scoreLine}`,
    ev.details ? `Detalles: ${ev.details}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const htmlBody = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;padding:18px;border:1px solid #d4e4dd;border-radius:12px;background:#ffffff;color:#102a24;">
      <h2 style="margin:0 0 10px;color:#17644e;">Learning with Mr. Picado</h2>
      <p style="margin:4px 0;"><strong>Estudiante:</strong> ${ev.student}</p>
      <p style="margin:4px 0;"><strong>Fecha (CR):</strong> ${stamp}</p>
      <p style="margin:4px 0;"><strong>Evento:</strong> ${ev.type}</p>
      <p style="margin:4px 0;"><strong>Actividad:</strong> ${ev.activity}</p>
      <p style="margin:4px 0;"><strong>Resultado:</strong> ${scoreLine}</p>
      ${ev.details ? `<p style="margin:4px 0;"><strong>Detalles:</strong> ${ev.details}</p>` : ''}
    </div>
  `;

  // 1. Resend Email API
  if (cfg.resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: cfg.resendFrom,
          to: [cfg.teacherEmail],
          subject,
          text: plainBody,
          html: htmlBody,
        }),
      });
      if (res.ok) {
        delivered.push('email:resend');
      } else {
        errors.push(`resend:${res.status}`);
      }
    } catch {
      errors.push('resend:network');
    }
  }

  // 2. Google Apps Script Webhook (sends email via MailApp + logs row)
  if (cfg.appsScriptUrl) {
    try {
      const res = await fetch(cfg.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: cfg.teacherEmail,
          subject,
          body: plainBody,
          event: ev,
        }),
      });
      if (res.ok) {
        delivered.push('email:apps-script');
      } else {
        errors.push(`apps-script:${res.status}`);
      }
    } catch {
      errors.push('apps-script:network');
    }
  }

  // 3. CallMeBot Free WhatsApp Notification API
  if (cfg.callmebotApiKey && cfg.whatsappPhone) {
    try {
      const waText = `📚 Mr. Picado | ${ev.student}\n• ${ev.type}: ${ev.activity}\n• Resultado: ${scoreLine}\n• ${stamp}`;
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cfg.whatsappPhone)}&text=${encodeURIComponent(waText)}&apikey=${encodeURIComponent(cfg.callmebotApiKey)}`;
      const res = await fetch(url);
      if (res.ok) {
        delivered.push('whatsapp:callmebot');
      } else {
        errors.push(`callmebot:${res.status}`);
      }
    } catch {
      errors.push('callmebot:network');
    }
  }

  // 4. Generic Webhook (Make / Zapier / n8n / Telegram)
  if (cfg.notifyWebhookUrl) {
    try {
      const res = await fetch(cfg.notifyWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherEmail: cfg.teacherEmail,
          whatsappPhone: cfg.whatsappPhone,
          subject,
          text: plainBody,
          event: ev,
        }),
      });
      if (res.ok) {
        delivered.push('webhook');
      } else {
        errors.push(`webhook:${res.status}`);
      }
    } catch {
      errors.push('webhook:network');
    }
  }

  return { delivered, errors };
}

function buildStudentSummaries(events: GradeEvent[]) {
  const byStudent = new Map<
    string,
    {
      student: string;
      visits: number;
      lastSeen: string;
      practices: Record<string, { score: number; max: number; pct: number }>;
      quizzes: Record<string, { score: number; max: number; pct: number }>;
      restarts: Record<string, number>;
      readings: Record<string, { comprehension?: number; compMax?: number; vocabulary?: number; vocMax?: number }>;
      audioBestPct: number;
      verbsBestPct: number;
      overallAvgPct: number;
      totalActivities: number;
    }
  >();

  for (const ev of events) {
    let entry = byStudent.get(ev.student);
    if (!entry) {
      entry = {
        student: ev.student,
        visits: 0,
        lastSeen: ev.timestamp,
        practices: {},
        quizzes: {},
        restarts: {},
        readings: {},
        audioBestPct: 0,
        verbsBestPct: 0,
        overallAvgPct: 0,
        totalActivities: 0,
      };
      byStudent.set(ev.student, entry);
    }
    if (ev.timestamp > entry.lastSeen) entry.lastSeen = ev.timestamp;
    if (ev.type === 'Visita') {
      entry.visits += 1;
    } else if (ev.type === 'Práctica') {
      entry.totalActivities += 1;
      const prev = entry.practices[ev.activity];
      if (!prev || ev.score > prev.score) {
        entry.practices[ev.activity] = { score: ev.score, max: ev.max, pct: ev.percentage };
      }
    } else if (ev.type === 'Quiz') {
      entry.totalActivities += 1;
      const prev = entry.quizzes[ev.activity];
      if (!prev || ev.score > prev.score) {
        entry.quizzes[ev.activity] = { score: ev.score, max: ev.max, pct: ev.percentage };
      }
    } else if (ev.type === 'Quiz reiniciado') {
      entry.totalActivities += 1;
      entry.restarts[ev.activity] = ev.score;
    } else if (ev.type === 'Lectura') {
      entry.totalActivities += 1;
      const rec = entry.readings[ev.activity] ?? {};
      if (rec.comprehension === undefined || ev.score > rec.comprehension) {
        rec.comprehension = ev.score;
        rec.compMax = ev.max;
      }
      entry.readings[ev.activity] = rec;
    } else if (ev.type === 'Vocabulario') {
      entry.totalActivities += 1;
      const rec = entry.readings[ev.activity] ?? {};
      if (rec.vocabulary === undefined || ev.score > rec.vocabulary) {
        rec.vocabulary = ev.score;
        rec.vocMax = ev.max;
      }
      entry.readings[ev.activity] = rec;
    } else if (ev.type === 'Audio Lab') {
      entry.totalActivities += 1;
      entry.audioBestPct = Math.max(entry.audioBestPct, ev.percentage);
    } else if (ev.type === 'Verbos') {
      entry.totalActivities += 1;
      entry.verbsBestPct = Math.max(entry.verbsBestPct, ev.percentage);
    } else {
      entry.totalActivities += 1;
    }
  }

  return Array.from(byStudent.values()).map((s) => {
    const pcts: number[] = [
      ...Object.values(s.practices).map((p) => p.pct),
      ...Object.values(s.quizzes).map((q) => q.pct),
    ];
    for (const r of Object.values(s.readings)) {
      if (r.comprehension !== undefined && r.compMax) {
        pcts.push(Math.round((r.comprehension / r.compMax) * 100));
      }
      if (r.vocabulary !== undefined && r.vocMax) {
        pcts.push(Math.round((r.vocabulary / r.vocMax) * 100));
      }
    }
    s.overallAvgPct = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
    return s;
  });
}

function escapeCsvCell(val: string | number): string {
  const s = String(val ?? '');
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, count: memoryStore.events.length, timestamp: new Date().toISOString() });
  });

  // --- Notification Channel Status & Live Test ---
  app.get('/api/notifications/status', (_req: Request, res: Response) => {
    const cfg = getNotificationConfig();
    res.json({
      teacherEmail: cfg.teacherEmail,
      whatsappPhone: cfg.whatsappPhone,
      emailAutomatic: Boolean(cfg.resendApiKey || cfg.appsScriptUrl),
      emailProviders: {
        resend: Boolean(cfg.resendApiKey),
        appsScript: Boolean(cfg.appsScriptUrl),
      },
      whatsappAutomatic: Boolean(cfg.callmebotApiKey),
      whatsappProviders: {
        callmebot: Boolean(cfg.callmebotApiKey),
      },
      webhookAutomatic: Boolean(cfg.notifyWebhookUrl),
    });
  });

  app.post('/api/notifications/test', async (_req: Request, res: Response) => {

    const sampleEvent: GradeEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      student: 'Prueba del Sistema (Mr. Picado)',
      type: 'Quiz',
      activity: 'Present Simple (Prueba)',
      score: 48,
      max: 50,
      percentage: 96,
      details: 'Verificación de envío automático a correo y WhatsApp',
    };

    const result = await dispatchNotifications(sampleEvent);
    if (result.delivered.length === 0) {
      res.json({
        ok: false,
        channels: [],
        message:
          'No hay un proveedor automático configurado todavía (RESEND_API_KEY, APPS_SCRIPT_WEBHOOK_URL o CALLMEBOT_APIKEY). Revisa las instrucciones en pantalla para activarlo gratis.',
      });
      return;
    }

    res.json({
      ok: true,
      channels: result.delivered,
      message: `Prueba enviada correctamente por: ${result.delivered.join(', ')}`,
    });
  });

  app.get('/api/reports', (req: Request, res: Response) => {
    const studentQuery = typeof req.query.student === 'string' ? req.query.student.trim() : '';
    const allEvents = [...memoryStore.events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const filteredEvents = studentQuery
      ? allEvents.filter((e) => e.student.toLowerCase() === studentQuery.toLowerCase())
      : allEvents;
    const studentsSummary = buildStudentSummaries(memoryStore.events);
    res.json({
      events: filteredEvents.slice(0, 300),
      totalCount: filteredEvents.length,
      studentsSummary,
      updatedAt: new Date().toISOString(),
    });
  });

  app.post('/api/events', async (req: Request, res: Response) => {
    const body = req.body as Partial<GradeEvent>;
    const student = normalizeStudentName(body.student);
    if (!student) {
      res.status(400).json({ error: 'Nombre de estudiante inválido.' });
      return;
    }
    if (!body.type || !VALID_TYPES.has(body.type)) {
      res.status(400).json({ error: 'Tipo de evento inválido.' });
      return;
    }
    const activity = typeof body.activity === 'string' ? body.activity.trim().slice(0, 120) : '';
    if (!activity) {
      res.status(400).json({ error: 'Actividad requerida.' });
      return;
    }
    const id =
      typeof body.id === 'string' && body.id.trim().length >= 8
        ? body.id.trim().slice(0, 64)
        : crypto.randomUUID();

    const existing = memoryStore.events.find((e) => e.id === id);
    if (existing) {
      res.json({ ok: true, event: existing, deduplicated: true });
      return;
    }

    const score = Number.isFinite(body.score) ? Math.max(0, Math.round(Number(body.score))) : 0;
    const max = Number.isFinite(body.max) ? Math.max(0, Math.round(Number(body.max))) : 0;
    const percentage = max > 0 ? Math.min(100, Math.round((score / max) * 100)) : 0;

    const event: GradeEvent = {
      id,
      timestamp: typeof body.timestamp === 'string' && body.timestamp ? body.timestamp : new Date().toISOString(),
      student,
      type: body.type as GradeEventType,
      activity,
      topicIndex: typeof body.topicIndex === 'number' ? body.topicIndex : undefined,
      score,
      max,
      percentage,
      details: typeof body.details === 'string' ? body.details.slice(0, 240) : undefined,
    };

    persistStore({ events: [event, ...memoryStore.events].slice(0, 3000) });
    const notifications = await dispatchNotifications(event);
    res.status(201).json({
      ok: true,
      event,
      totalEvents: memoryStore.events.length,
      notifications,
    });
  });

  app.get('/api/reports/csv', (req: Request, res: Response) => {
    const studentQuery = typeof req.query.student === 'string' ? req.query.student.trim().toLowerCase() : '';
    const rows = memoryStore.events.filter((e) =>
      studentQuery ? e.student.toLowerCase() === studentQuery : true
    );
    const header = ['Fecha', 'Estudiante', 'Evento', 'Actividad', 'Puntaje', 'Puntaje máximo', 'Porcentaje', 'Detalles', 'ID'];
    const lines = [
      header.map(escapeCsvCell).join(','),
      ...rows.map((e) =>
        [
          formatCostaRicaStamp(e.timestamp),
          e.student,
          e.type,
          e.activity,
          e.score,
          e.max,
          e.max > 0 ? `${e.percentage}%` : '—',
          e.details ?? '',
          e.id,
        ]
          .map(escapeCsvCell)
          .join(',')
      ),
    ];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-mr-picado.csv"');
    res.send('\uFEFF' + lines.join('\r\n'));
  });

  app.delete('/api/events/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const next = memoryStore.events.filter((e) => e.id !== id);
    persistStore({ events: next });
    res.json({ ok: true, remaining: next.length });
  });

  app.delete('/api/students/:name', (req: Request, res: Response) => {
    const target = decodeURIComponent(String(req.params.name || '')).toLowerCase();
    const next = memoryStore.events.filter((e) => e.student.toLowerCase() !== target);
    persistStore({ events: next });
    res.json({ ok: true, remaining: next.length });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Learning with Mr. Picado server running on http://0.0.0.0:${port}`);
  });
}

startServer();
