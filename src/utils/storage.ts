import type { GradeEvent, GradeEventType, StudentState, Topic } from '../types';

export const LEGACY_STORAGE_KEY = 'ingles-primera-v2';
export const STORAGE_KEY = 'ingles-mr-picado-anual-v3';
export const VISIT_SESSION_KEY = `${STORAGE_KEY}-named-visit`;
export const MATERIAL_VERSION = 'anual-2026-v1';

export const TEACHER_EMAIL = 'profeluisingles@gmail.com';
export const TEACHER_WHATSAPP = '50686179072';

export function createInitialState(): StudentState {
  return {
    student: '',
    visits: 0,
    topic: 0,
    practice: {},
    quiz: {},
    readings: {},
    audioLab: {},
    verbDrills: {},
    flashcardsMastered: {},
    active: null,
    pausedQuizzes: {},
    previous: {},
    restarts: {},
    outbox: [],
    localHistory: [],
    soundEffects: true,
  };
}

export function loadStudentState(): StudentState {
  const base = createInitialState();
  try {
    const rawV3 = localStorage.getItem(STORAGE_KEY);
    if (rawV3) {
      return { ...base, ...JSON.parse(rawV3) };
    }
    // Preserve seamlessly any prior progress stored under the original GAS key
    const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawLegacy) {
      const legacy = JSON.parse(rawLegacy);
      return { ...base, ...legacy };
    }
  } catch {
    // Fallback to initial state if storage unavailable
  }
  return base;
}

export function saveStudentState(state: StudentState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function isValidStudentName(input: string): { valid: boolean; cleaned: string } {
  const cleaned = input.normalize('NFC').trim().replace(/\s+/g, ' ');
  const valid =
    cleaned.length >= 2 &&
    cleaned.length <= 80 &&
    /^\p{L}[\p{L}\p{M} .’'-]*$/u.test(cleaned);
  return { valid, cleaned };
}

export function generateEventId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function postEventToServer(event: GradeEvent): Promise<boolean> {
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function buildGradeEvent(
  student: string,
  type: GradeEventType,
  activity: string,
  score: number,
  max: number,
  topicIndex?: number,
  details?: string
): GradeEvent {
  const percentage = max > 0 ? Math.min(100, Math.round((score / max) * 100)) : 0;
  return {
    id: generateEventId(),
    timestamp: new Date().toISOString(),
    student,
    type,
    activity,
    topicIndex,
    score,
    max,
    percentage,
    details,
  };
}

export function formatReportText(state: StudentState, topics: Topic[]): string {
  const lines: string[] = [
    'Avance de Inglés · Learning with Mr. Picado (Plan Anual)',
    `Estudiante: ${state.student || 'Sin registrar'}`,
    `Visitas registradas: ${state.visits}`,
    '',
    '--- Resultados por Tema ---',
  ];

  topics.forEach((t, i) => {
    const p = state.practice[i];
    const q = state.quiz[i];
    const r = state.restarts[i];
    const a = state.audioLab[i];
    if (p !== undefined || q !== undefined || r !== undefined || a !== undefined) {
      const parts: string[] = [];
      if (p !== undefined) parts.push(`Práctica: ${p}/30 (${Math.round((p / 30) * 100)}%)`);
      if (q !== undefined) parts.push(`Quiz: ${q}/50 (${Math.round((q / 50) * 100)}%)`);
      if (r !== undefined) parts.push(`Último reinicio: ${r}/50`);
      if (a !== undefined) parts.push(`Audio Lab: ${a.score}/${a.total}`);
      lines.push(`• ${t.title}: ${parts.join(' · ')}`);
    }
  });

  const readingEntries = Object.entries(state.readings);
  if (readingEntries.length) {
    lines.push('', '--- Comprensión de Lectura y Vocabulario ---');
    for (const [title, rec] of readingEntries) {
      if (rec.vocabulary) {
        lines.push(`• ${title} · Vocabulario: ${rec.vocabulary.score}/${rec.vocabulary.total}`);
      }
      if (rec.comprehension) {
        lines.push(`• ${title} · Lectura: ${rec.comprehension.score}/${rec.comprehension.total}`);
      }
    }
  }

  return lines.join('\n');
}

export function buildWhatsAppHref(state: StudentState, topics: Topic[]): string {
  const text = formatReportText(state, topics);
  return `https://wa.me/${TEACHER_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export function buildGmailHref(state: StudentState, topics: Topic[]): string {
  const text = formatReportText(state, topics);
  const subject = `Avance de Inglés · ${state.student || 'Estudiante'}`;
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(TEACHER_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
}
