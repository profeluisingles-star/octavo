import {
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Mail,
  MessageCircle,
  Printer,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { topics } from '../data/curriculum';
import { readingPassages } from '../data/readings';
import type { AccessSession, GradeEvent, StudentState } from '../types';
import {
  buildCsvContent,
  buildGmailHref,
  buildWhatsAppHref,
  formatReportText,
} from '../utils/storage';
import { TeacherControlPanel } from './TeacherControlPanel';

interface StudentServerSummary {
  student: string;
  visits: number;
  lastSeen: string;
  practices: Record<string, { score: number; max: number; pct: number }>;
  quizzes: Record<string, { score: number; max: number; pct: number }>;
  restarts: Record<string, number>;
  audioBestPct: number;
  verbsBestPct: number;
  overallAvgPct: number;
  totalActivities: number;
}

interface ReportsPayload {
  events: GradeEvent[];
  totalCount: number;
  studentsSummary: StudentServerSummary[];
  updatedAt: string;
}

interface GradesAndReportsViewProps {
  state: StudentState;
  accessSession: AccessSession;
  quizLocked: boolean;
  onJumpToTopic: (topicId: number) => void;
}

export function GradesAndReportsView({ state, accessSession, quizLocked, onJumpToTopic }: GradesAndReportsViewProps) {
  const [subView, setSubView] = useState<'student' | 'realtime'>('student');
  const [serverData, setServerData] = useState<ReportsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('ALL');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = (await res.json()) as ReportsPayload;
        setServerData(data);
      }
    } catch {
      // Keep local fallback seamlessly
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    const timer = setInterval(fetchReports, 8000);
    return () => clearInterval(timer);
  }, [fetchReports]);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(formatReportText(state, topics));
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    } catch {
      // Clipboard fallback unavailable in restricted browser context
    }
  };

  const handleDownloadCsv = () => {
    const csv = buildCsvContent(displayedEvents);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-${(state.student || 'mr-picado').toLowerCase().replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setPendingDeleteId(null);
        await fetchReports();
      }
    } catch {
      // Ignore network error
    }
  };

  // Compute clear student KPIs
  const unitScores = topics.map((t, idx) => {
    const p = state.practice[idx];
    const q = state.quiz[idx];
    const pPct = p !== undefined ? Math.round((p / 30) * 100) : null;
    const qPct = q !== undefined ? Math.round((q / 50) * 100) : null;
    const bestPct = qPct !== null ? qPct : pPct;
    return { topic: t, p, q, pPct, qPct, bestPct, restart: state.restarts[idx], audio: state.audioLab[idx] };
  });

  const gradedUnitPcts = unitScores.map((u) => u.bestPct).filter((v): v is number => v !== null);
  const overallAvg = gradedUnitPcts.length
    ? Math.round(gradedUnitPcts.reduce((a, b) => a + b, 0) / gradedUnitPcts.length)
    : 0;
  const quizzesPassed = unitScores.filter((u) => u.q !== undefined && u.q >= 46).length;
  const practicesCompleted = unitScores.filter((u) => u.p !== undefined).length;
  const readingsCompleted = Object.keys(state.readings).length;

  const displayedEvents: GradeEvent[] = (() => {
    const base = serverData?.events?.length ? serverData.events : state.localHistory;
    if (selectedStudentFilter === 'ALL') return base;
    return base.filter((e) => e.student.toLowerCase() === selectedStudentFilter.toLowerCase());
  })();

  const whatsappHref = buildWhatsAppHref(state, topics);
  const gmailHref = buildGmailHref(state, topics);

  return (
    <div className="space-y-6">
      {/* Header & Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d4e4dd] pb-4 no-print">
        <div>
          <h2 className="text-2xl font-extrabold text-[#102a24]">Notas y Reportes en Tiempo Real</h2>
          <p className="text-sm text-[#435b53]">
            Visualización clara de calificaciones, progreso por tema y registro en vivo para estudiante y docente.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-[#c8dbd3] bg-[#f4f9f6] p-1">
          <button
            type="button"
            onClick={() => setSubView('student')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
              subView === 'student' ? 'bg-[#17644e] text-white' : 'text-[#354c45] hover:text-[#102a24]'
            }`}
          >
            Boleta del Estudiante
          </button>
          <button
            type="button"
            onClick={() => setSubView('realtime')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
              subView === 'realtime' ? 'bg-[#17644e] text-white' : 'text-[#354c45] hover:text-[#102a24]'
            }`}
          >
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Gestión en Tiempo Real ({serverData?.totalCount ?? state.localHistory.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#d4e4dd] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#435b53]">Promedio General (MEP)</p>
          <p className="text-3xl font-extrabold font-mono-num text-[#17644e] mt-1">{overallAvg}%</p>
          <p className="text-xs text-[#435b53] mt-1">Basado en {gradedUnitPcts.length} de {topics.length} unidades</p>
        </div>
        <div className="rounded-xl border border-[#d4e4dd] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#435b53]">Quizzes Aprobados (≥46/50)</p>
          <p className="text-3xl font-extrabold font-mono-num text-[#102a24] mt-1">
            {quizzesPassed} / {topics.length}
          </p>
          <p className="text-xs text-[#435b53] mt-1">Meta de dominio: 46 pts o más</p>
        </div>
        <div className="rounded-xl border border-[#d4e4dd] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#435b53]">Prácticas Completadas</p>
          <p className="text-3xl font-extrabold font-mono-num text-[#102a24] mt-1">
            {practicesCompleted} / {topics.length}
          </p>
          <p className="text-xs text-[#435b53] mt-1">Escala de 30 puntos c/u</p>
        </div>
        <div className="rounded-xl border border-[#d4e4dd] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#435b53]">Lecturas y Vocabulario</p>
          <p className="text-3xl font-extrabold font-mono-num text-[#102a24] mt-1">
            {readingsCompleted} / {readingPassages.length}
          </p>
          <p className="text-xs text-[#435b53] mt-1">Visitas en navegador: {state.visits}</p>
        </div>
      </div>

      {/* Share & Export Bar */}
      <section className="rounded-xl border border-[#d4e4dd] bg-[#f4f9f6] p-4 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="text-sm">
          <p className="font-bold text-[#102a24]">
            Estudiante activo: <span className="text-[#17644e]">{state.student || 'Sin nombre'}</span>
          </p>
          <p className="text-xs text-[#435b53]">
            {quizLocked
              ? 'Termina o pausa el quiz actual antes de enviar tu informe.'
              : 'Envía o descarga tu informe oficial en un clic.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={quizLocked ? undefined : whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={quizLocked}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold ${
              quizLocked
                ? 'pointer-events-none bg-slate-300 text-slate-600'
                : 'bg-[#17644e] text-white hover:bg-[#124f3d]'
            }`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span>Enviar por WhatsApp</span>
            <ExternalLink className="h-3 w-3 opacity-80" aria-hidden="true" />
          </a>

          <a
            href={quizLocked ? undefined : gmailHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={quizLocked}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold ${
              quizLocked
                ? 'pointer-events-none border-slate-300 bg-slate-100 text-slate-500'
                : 'border-[#aac9bd] bg-white text-[#143a30] hover:border-[#17644e]'
            }`}
          >
            <Mail className="h-4 w-4 text-[#17644e]" aria-hidden="true" />
            <span>Preparar en Gmail</span>
            <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#aac9bd] bg-white px-3.5 py-2 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
          >
            <Copy className="h-3.5 w-3.5 text-[#17644e]" aria-hidden="true" />
            <span>{copiedNotice ? '¡Copiado!' : 'Copiar resumen'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#aac9bd] bg-white px-3.5 py-2 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
          >
            <Download className="h-3.5 w-3.5 text-[#17644e]" aria-hidden="true" />
            <span>Descargar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#aac9bd] bg-white px-3.5 py-2 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
          >
            <Printer className="h-3.5 w-3.5 text-[#17644e]" aria-hidden="true" />
            <span>Imprimir Boleta</span>
          </button>
        </div>
      </section>

      {subView === 'student' ? (
        <div className="space-y-6">
          {/* Custom SVG Mastery Chart */}
          <section className="rounded-xl border border-[#d4e4dd] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-base font-extrabold text-[#102a24]">Rendimiento Visual por Unidad (%)</h3>
              <div className="flex items-center gap-4 text-xs text-[#435b53]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#17644e]" />
                  <span>Quiz (/50)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#8bc5b1]" />
                  <span>Práctica (/30)</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <svg viewBox="0 0 540 210" className="w-full min-w-[440px] h-auto" role="img" aria-label="Gráfico de notas por tema">
                {[0, 25, 50, 75, 100].map((val) => {
                  const y = 170 - val * 1.4;
                  return (
                    <g key={val}>
                      <line x1="42" y1={y} x2="515" y2={y} stroke="#e6efeb" strokeWidth="1" />
                      <text x="34" y={y + 4} textAnchor="end" fontSize="10" fill="#435b53" className="font-mono-num">
                        {val}%
                      </text>
                    </g>
                  );
                })}
                {unitScores.map((u, idx) => {
                  const groupX = 72 + idx * 88;
                  const pH = ((u.pPct ?? 0) / 100) * 140;
                  const qH = ((u.qPct ?? 0) / 100) * 140;
                  return (
                    <g key={u.topic.id}>
                      <rect x={groupX} y={170 - pH} width="22" height={Math.max(pH, 2)} rx="4" fill="#8bc5b1" />
                      <rect x={groupX + 26} y={170 - qH} width="22" height={Math.max(qH, 2)} rx="4" fill="#17644e" />
                      <text x={groupX + 24} y="190" textAnchor="middle" fontSize="11" fontWeight="700" fill="#102a24">
                        Tema {idx + 1}
                      </text>
                      {(u.qPct !== null || u.pPct !== null) && (
                        <text
                          x={groupX + 24}
                          y={Math.min(170 - qH, 170 - pH) - 5}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="700"
                          fill="#17644e"
                          className="font-mono-num"
                        >
                          {u.qPct !== null ? `${u.qPct}%` : `${u.pPct}%`}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </section>

          {/* Detailed Grade Matrix */}
          <section className="overflow-x-auto rounded-xl border border-[#d4e4dd] bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <caption className="px-4 py-3 text-left font-extrabold text-[#102a24] bg-[#f4f9f6] border-b border-[#d4e4dd]">
                Matriz Detallada de Calificaciones
              </caption>
              <thead>
                <tr className="bg-[#e6f4ee] text-[#102a24]">
                  <th className="px-3.5 py-2.5 font-bold">Unidad y Tema</th>
                  <th className="px-3.5 py-2.5 font-bold">Práctica (/30)</th>
                  <th className="px-3.5 py-2.5 font-bold">Quiz (/50)</th>
                  <th className="px-3.5 py-2.5 font-bold">Audio Lab</th>
                  <th className="px-3.5 py-2.5 font-bold">Reinicios</th>
                  <th className="px-3.5 py-2.5 font-bold">Estado</th>
                  <th className="px-3.5 py-2.5 font-bold no-print">Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6efeb]">
                {unitScores.map(({ topic, p, q, pPct, qPct, restart, audio }) => {
                  const statusLabel =
                    q !== undefined && q >= 46
                      ? 'Aprobado'
                      : q !== undefined || p !== undefined
                      ? 'En progreso'
                      : 'Pendiente';
                  return (
                    <tr key={topic.id} className="hover:bg-[#f8fbfa]">
                      <td className="px-3.5 py-2.5">
                        <p className="font-bold text-[#102a24]">
                          {topic.id + 1}. {topic.title}
                        </p>
                        <p className="text-xs text-[#435b53]">{topic.period}</p>
                      </td>
                      <td className="px-3.5 py-2.5 font-mono-num">
                        {p !== undefined ? `${p}/30 (${pPct}%)` : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono-num font-bold text-[#17644e]">
                        {q !== undefined ? `${q}/50 (${qPct}%)` : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono-num">
                        {audio ? `${audio.score}/${audio.total}` : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono-num text-xs text-[#435b53]">
                        {restart !== undefined ? `${restart}/50` : 'Ninguno'}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold ${
                            statusLabel === 'Aprobado'
                              ? 'text-[#17644e]'
                              : statusLabel === 'En progreso'
                              ? 'text-amber-700'
                              : 'text-[#647d75]'
                          }`}
                        >
                          {statusLabel === 'Aprobado' ? (
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          <span>{statusLabel}</span>
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 no-print">
                        <button
                          type="button"
                          onClick={() => onJumpToTopic(topic.id)}
                          className="rounded-lg border border-[#aac9bd] bg-white px-2.5 py-1 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
                        >
                          Abrir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Readings Summary Table */}
          <section className="overflow-x-auto rounded-xl border border-[#d4e4dd] bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <caption className="px-4 py-3 text-left font-extrabold text-[#102a24] bg-[#f4f9f6] border-b border-[#d4e4dd]">
                Registro de Lecturas y Vocabulario
              </caption>
              <thead>
                <tr className="bg-[#e6f4ee] text-[#102a24]">
                  <th className="px-3.5 py-2.5 font-bold">Lectura</th>
                  <th className="px-3.5 py-2.5 font-bold">Período</th>
                  <th className="px-3.5 py-2.5 font-bold">Vocabulario</th>
                  <th className="px-3.5 py-2.5 font-bold">Comprensión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6efeb]">
                {readingPassages.map((r) => {
                  const rec = state.readings[r.title];
                  return (
                    <tr key={r.title} className="hover:bg-[#f8fbfa]">
                      <td className="px-3.5 py-2 font-semibold text-[#102a24]">{r.title}</td>
                      <td className="px-3.5 py-2 text-xs text-[#435b53]">{r.period}</td>
                      <td className="px-3.5 py-2 font-mono-num">
                        {rec?.vocabulary ? `${rec.vocabulary.score}/${rec.vocabulary.total}` : '—'}
                      </td>
                      <td className="px-3.5 py-2 font-mono-num font-bold text-[#17644e]">
                        {rec?.comprehension ? `${rec.comprehension.score}/${rec.comprehension.total}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      ) : (
        /* REAL-TIME TEACHER MANAGEMENT VIEW */
        <div className="space-y-6">
          <TeacherControlPanel accessSession={accessSession} />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d4e4dd] bg-white p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="student-filter" className="text-xs font-bold text-[#435b53]">
                Filtrar por estudiante:
              </label>
              <select
                id="student-filter"
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                className="rounded-lg border border-[#aac9bd] bg-white px-3 py-1.5 text-sm font-semibold text-[#102a24]"
              >
                <option value="ALL">Todos los estudiantes ({serverData?.studentsSummary.length ?? 0})</option>
                {serverData?.studentsSummary.map((s) => (
                  <option key={s.student} value={s.student}>
                    {s.student} ({s.overallAvgPct}%)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={fetchReports}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#aac9bd] bg-white px-3.5 py-2 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>Actualizar ahora</span>
            </button>
          </div>

          {/* Multi-student Summary Table */}
          {serverData && serverData.studentsSummary.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-[#d4e4dd] bg-white">
              <table className="w-full text-left text-sm border-collapse">
                <caption className="px-4 py-3 text-left font-extrabold text-[#102a24] bg-[#f4f9f6] border-b border-[#d4e4dd]">
                  Resumen de Grupo en Tiempo Real
                </caption>
                <thead>
                  <tr className="bg-[#e6f4ee] text-[#102a24]">
                    <th className="px-3.5 py-2.5 font-bold">Estudiante</th>
                    <th className="px-3.5 py-2.5 font-bold">Promedio</th>
                    <th className="px-3.5 py-2.5 font-bold">Quizzes</th>
                    <th className="px-3.5 py-2.5 font-bold">Prácticas</th>
                    <th className="px-3.5 py-2.5 font-bold">Audio Lab</th>
                    <th className="px-3.5 py-2.5 font-bold">Visitas</th>
                    <th className="px-3.5 py-2.5 font-bold">Última actividad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6efeb]">
                  {serverData.studentsSummary.map((s) => (
                    <tr key={s.student} className="hover:bg-[#f8fbfa]">
                      <td className="px-3.5 py-2.5 font-bold text-[#102a24]">{s.student}</td>
                      <td className="px-3.5 py-2.5 font-mono-num font-bold text-[#17644e]">{s.overallAvgPct}%</td>
                      <td className="px-3.5 py-2.5 font-mono-num">{Object.keys(s.quizzes).length}</td>
                      <td className="px-3.5 py-2.5 font-mono-num">{Object.keys(s.practices).length}</td>
                      <td className="px-3.5 py-2.5 font-mono-num">{s.audioBestPct ? `${s.audioBestPct}%` : '—'}</td>
                      <td className="px-3.5 py-2.5 font-mono-num">{s.visits}</td>
                      <td className="px-3.5 py-2.5 text-xs font-mono-num text-[#435b53]">
                        {new Date(s.lastSeen).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Live Event Log */}
          <div className="overflow-x-auto rounded-xl border border-[#d4e4dd] bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <caption className="px-4 py-3 text-left font-extrabold text-[#102a24] bg-[#f4f9f6] border-b border-[#d4e4dd]">
                Bitácora Cronológica en Vivo
              </caption>
              <thead>
                <tr className="bg-[#e6f4ee] text-[#102a24]">
                  <th className="px-3 py-2 font-bold">Fecha y Hora</th>
                  <th className="px-3 py-2 font-bold">Estudiante</th>
                  <th className="px-3 py-2 font-bold">Evento</th>
                  <th className="px-3 py-2 font-bold">Actividad</th>
                  <th className="px-3 py-2 font-bold">Puntaje</th>
                  <th className="px-3 py-2 font-bold no-print">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6efeb]">
                {displayedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-[#435b53]">
                      Aún no hay eventos registrados. Al estudiar o completar un ejercicio aparecerán aquí al instante.
                    </td>
                  </tr>
                ) : (
                  displayedEvents.slice(0, 80).map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#f8fbfa]">
                      <td className="px-3 py-2 font-mono-num text-xs text-[#435b53]">
                        {new Date(ev.timestamp).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}
                      </td>
                      <td className="px-3 py-2 font-semibold text-[#102a24]">{ev.student}</td>
                      <td className="px-3 py-2 text-xs font-bold text-[#17644e]">{ev.type}</td>
                      <td className="px-3 py-2 text-sm text-[#102a24]">
                        {ev.activity}
                        {ev.details ? <span className="block text-xs text-[#435b53]">{ev.details}</span> : null}
                      </td>
                      <td className="px-3 py-2 font-mono-num font-bold">
                        {ev.max > 0 ? `${ev.score}/${ev.max} (${ev.percentage}%)` : '—'}
                      </td>
                      <td className="px-3 py-2 no-print">
                        {pendingDeleteId === ev.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="rounded bg-rose-700 px-2 py-1 text-xs font-bold text-white"
                            >
                              Borrar
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(null)}
                              className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(ev.id)}
                            title="Eliminar registro"
                            className="rounded-lg p-1.5 text-[#435b53] hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
