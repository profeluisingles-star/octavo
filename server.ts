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
    return Array.isArray(parsed?.events) ? parsed : { events: [] };
  } catch {
    return { events: [] };
  }
}

let memoryStore: StorePayload = ensureStore();

function persistStore(next: StorePayload): void {
  memoryStore = next;
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

  app.post('/api/events', (req: Request, res: Response) => {
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
    res.status(201).json({ ok: true, event, totalEvents: memoryStore.events.length });
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
          new Date(e.timestamp).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
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
