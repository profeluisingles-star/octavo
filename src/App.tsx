import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Compass,
  ExternalLink,
  Headphones,
  Mail,
  MessageCircle,
  Search,
  Sparkles,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnnualRoadmapView } from './components/AnnualRoadmapView';
import { AssessmentView } from './components/AssessmentView';
import { GradesAndReportsView } from './components/GradesAndReportsView';
import { InteractivePracticeView } from './components/InteractivePracticeView';
import { ReadingsView } from './components/ReadingsView';
import { TopicStudyView } from './components/TopicStudyView';
import { topics } from './data/curriculum';
import { drawQuestions, idFor, isCorrectAnswer } from './data/questionBanks';
import type {
  AssessmentMode,
  GradeEventType,
  ReviewItem,
  StudentState,
} from './types';
import { stopSpeech } from './utils/speech';
import {
  buildGmailHref,
  buildGradeEvent,
  buildWhatsAppHref,
  isValidStudentName,
  loadStudentState,
  MATERIAL_VERSION,
  postEventToServer,
  saveStudentState,
  TEACHER_EMAIL,
  VISIT_SESSION_KEY,
} from './utils/storage';

type PrimaryView = 'roadmap' | 'topics' | 'readings' | 'reports';
type TopicTab = 'study' | 'verbs' | 'interactive' | 'audio' | 'practice' | 'quiz';

export default function App() {
  const [state, setState] = useState<StudentState>(() => loadStudentState());
  const [view, setView] = useState<PrimaryView>('topics');
  const [topicIdx, setTopicIdx] = useState<number>(() => {
    const initial = loadStudentState();
    const candidate = initial.active?.index ?? initial.topic ?? 0;
    return Number.isInteger(candidate) && candidate >= 0 && candidate < topics.length ? candidate : 0;
  });
  const [topicTab, setTopicTab] = useState<TopicTab>(() => {
    const initial = loadStudentState();
    return initial.active?.mode ?? 'study';
  });

  const [editingProfile, setEditingProfile] = useState<boolean>(() => !loadStudentState().student);
  const [nameInput, setNameInput] = useState<string>(() => loadStudentState().student || '');
  const [nameError, setNameError] = useState<string>('');
  const [topicSearch, setTopicSearch] = useState<string>('');
  const [lastResult, setLastResult] = useState<{ points: number; max: number; review: ReviewItem[] } | null>(null);
  const [restartBanner, setRestartBanner] = useState<boolean>(() =>
    Boolean(loadStudentState().active?.restartReview?.length && loadStudentState().active?.cursor === 0)
  );
  const [syncStatus, setSyncStatus] = useState<string>('');

  const stageRef = useRef<HTMLDivElement | null>(null);
  const flushingRef = useRef(false);

  const persist = useCallback((updater: (prev: StudentState) => StudentState) => {
    setState((prev) => {
      const next = updater(prev);
      saveStudentState(next);
      return next;
    });
  }, []);

  const flushOutbox = useCallback(async (currentOutbox: StudentState['outbox']) => {
    if (flushingRef.current || !currentOutbox.length) return;
    flushingRef.current = true;
    const remaining: StudentState['outbox'] = [];
    for (const ev of currentOutbox) {
      const ok = await postEventToServer(ev);
      if (!ok) {
        remaining.push(ev);
      }
    }
    flushingRef.current = false;
    if (remaining.length !== currentOutbox.length) {
      persist((prev) => ({ ...prev, outbox: remaining }));
      if (remaining.length === 0) {
        setSyncStatus('Sincronizado en tiempo real');
      }
    }
  }, [persist]);

  const recordActivity = useCallback(
    (type: GradeEventType, activity: string, score: number, max: number, idx?: number, details?: string) => {
      const currentName = state.student;
      if (!currentName) return;
      const ev = buildGradeEvent(currentName, type, activity, score, max, idx, details);
      persist((prev) => ({
        ...prev,
        outbox: [...prev.outbox, ev],
        localHistory: [ev, ...prev.localHistory].slice(0, 200),
      }));
      postEventToServer(ev).then((ok) => {
        if (ok) {
          persist((prev) => ({
            ...prev,
            outbox: prev.outbox.filter((item) => item.id !== ev.id),
          }));
          setSyncStatus('Guardado en tiempo real');
        } else {
          setSyncStatus('Guardado en este dispositivo');
        }
      });
    },
    [persist, state.student]
  );

  // Visit logging once per session when student name exists
  useEffect(() => {
    if (!state.student) return;
    flushOutbox(state.outbox);
    try {
      if (sessionStorage.getItem(VISIT_SESSION_KEY)) return;
      sessionStorage.setItem(VISIT_SESSION_KEY, 'yes');
    } catch {
      // Ignore sessionStorage restrictions
    }
    persist((prev) => ({ ...prev, visits: prev.visits + 1 }));
    recordActivity('Visita', 'Entrada a la plataforma', 0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.student]);

  // Anti-copy guard during active quiz
  useEffect(() => {
    const handleCopy = (event: ClipboardEvent) => {
      if (state.active?.mode === 'quiz' && stageRef.current?.contains(document.getSelection()?.anchorNode ?? null)) {
        event.preventDefault();
      }
    };
    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, [state.active?.mode]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, cleaned } = isValidStudentName(nameInput);
    if (!valid) {
      setNameError('Escribe un nombre válido con letras y espacios.');
      return;
    }
    setNameError('');
    persist((prev) => ({ ...prev, student: cleaned }));
    setEditingProfile(false);
  };

  const selectTopic = (nextIdx: number, nextTab: TopicTab = 'study') => {
    stopSpeech();
    if (state.active && (state.active.index !== nextIdx || state.active.mode !== nextTab)) {
      persist((prev) => {
        const paused = { ...prev.pausedQuizzes };
        if (prev.active?.mode === 'quiz') {
          paused[prev.active.index] = prev.active;
        }
        return { ...prev, topic: nextIdx, active: null, pausedQuizzes: paused };
      });
    } else {
      persist((prev) => ({ ...prev, topic: nextIdx }));
    }
    setTopicIdx(nextIdx);
    setTopicTab(nextTab);
    setLastResult(null);
    setView('topics');
  };

  const startAssessment = (mode: AssessmentMode) => {
    stopSpeech();
    const excluded = mode === 'quiz' ? state.previous[topicIdx] || [] : [];
    const items = drawQuestions(mode, topicIdx, excluded);
    persist((prev) => ({
      ...prev,
      active: {
        mode,
        index: topicIdx,
        items,
        revision: MATERIAL_VERSION,
        cursor: 0,
        hits: 0,
        errors: 0,
        selection: null,
        review: [],
      },
    }));
    setTopicTab(mode);
    setLastResult(null);
    setRestartBanner(false);
  };

  const resumePausedQuiz = () => {
    const paused = state.pausedQuizzes[topicIdx];
    if (!paused) return;
    persist((prev) => {
      const nextPaused = { ...prev.pausedQuizzes };
      delete nextPaused[topicIdx];
      return { ...prev, active: paused, pausedQuizzes: nextPaused };
    });
    setRestartBanner(Boolean(paused.restartReview?.length && paused.cursor === 0));
  };

  const handleSubmitAnswer = (choice: string) => {
    const attempt = state.active;
    if (!attempt || attempt.selection !== null) return;
    const item = attempt.items[attempt.cursor];
    const ok = isCorrectAnswer(item, choice);
    const nextHits = attempt.hits + (ok ? 1 : 0);
    const nextErrors = attempt.errors + (ok ? 0 : 1);
    const nextReview: ReviewItem[] = ok
      ? attempt.review || []
      : [
          ...(attempt.review || []),
          {
            prompt: item.prompt,
            choice,
            correct: item.correct,
            hint: item.hint,
            passage: item.passage,
            complete: item.complete,
          },
        ];

    if (attempt.mode === 'quiz') {
      const nextCursor = attempt.cursor + 1;
      if (nextErrors === 3) {
        const restartPoints = Math.min(15, nextHits * 2);
        const excluded = attempt.items.map(idFor);
        const freshItems = drawQuestions('quiz', topicIdx, excluded);
        persist((prev) => ({
          ...prev,
          restarts: { ...prev.restarts, [topicIdx]: restartPoints },
          previous: { ...prev.previous, [topicIdx]: excluded },
          active: {
            mode: 'quiz',
            index: topicIdx,
            items: freshItems,
            revision: MATERIAL_VERSION,
            cursor: 0,
            hits: 0,
            errors: 0,
            selection: null,
            review: [],
            restartReview: nextReview,
          },
        }));
        setRestartBanner(true);
        recordActivity('Quiz reiniciado', topics[topicIdx].title, restartPoints, 50, topicIdx, '3 errores alcanzados (tope 15/50)');
        return;
      }

      if (nextCursor >= attempt.items.length) {
        const finalPoints = nextHits * 2;
        const excluded = attempt.items.map(idFor);
        persist((prev) => ({
          ...prev,
          quiz: { ...prev.quiz, [topicIdx]: Math.max(prev.quiz[topicIdx] ?? 0, finalPoints) },
          previous: { ...prev.previous, [topicIdx]: excluded },
          active: null,
        }));
        setLastResult({ points: finalPoints, max: 50, review: nextReview });
        recordActivity('Quiz', topics[topicIdx].title, finalPoints, 50, topicIdx);
        return;
      }

      persist((prev) => ({
        ...prev,
        active: {
          ...attempt,
          cursor: nextCursor,
          hits: nextHits,
          errors: nextErrors,
          review: nextReview,
        },
      }));
      setRestartBanner(false);
    } else {
      persist((prev) => ({
        ...prev,
        active: {
          ...attempt,
          hits: nextHits,
          errors: nextErrors,
          selection: choice,
          review: nextReview,
        },
      }));
    }
  };

  const handleAdvancePractice = () => {
    const attempt = state.active;
    if (!attempt) return;
    const nextCursor = attempt.cursor + 1;
    if (nextCursor >= attempt.items.length) {
      const points = attempt.hits;
      persist((prev) => ({
        ...prev,
        practice: { ...prev.practice, [topicIdx]: Math.max(prev.practice[topicIdx] ?? 0, points) },
        active: null,
      }));
      setLastResult({ points, max: 30, review: attempt.review || [] });
      recordActivity('Práctica', topics[topicIdx].title, points, 30, topicIdx);
      return;
    }
    persist((prev) => ({
      ...prev,
      active: { ...attempt, cursor: nextCursor, selection: null },
    }));
  };

  const handlePauseAndExitQuiz = () => {
    selectTopic(topicIdx, 'study');
  };

  const activeTopic = topics[topicIdx];
  const quizLocked = state.active?.mode === 'quiz';
  const quizzesDoneCount = Object.keys(state.quiz).length;

  const filteredTopics = topics.filter((t) => {
    const q = topicSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.subtitle.toLowerCase().includes(q) ||
      t.goal.toLowerCase().includes(q)
    );
  });

  const topicTabs: { key: TopicTab; label: string }[] = [
    { key: 'study', label: 'Explicación' },
    ...(topicIdx === 1 || topicIdx === 4 ? [{ key: 'verbs' as const, label: 'Verbos' }] : []),
    ...(topicIdx === 3 ? [{ key: 'verbs' as const, label: 'Reescritura del PDF' }] : []),
    { key: 'interactive', label: 'Juegos y Tarjetas' },
    { key: 'audio', label: 'Audio Lab' },
    { key: 'practice', label: 'Práctica · 30 pts' },
    { key: 'quiz', label: 'Quiz · 50 pts' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f8f6] text-[#102a24]">
      {/* TOP BAR CONTRACT: 1 row, 3 zones (Wordmark | Single-line Nav | 1 Primary Action) */}
      <header className="sticky top-0 z-30 border-b border-[#1c4b3d] bg-[#102e28] text-white no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setView('roadmap')}
            className="font-display text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 text-left"
          >
            Learning with Mr. Picado
          </button>

          <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'roadmap' as const, label: 'Ruta Anual', icon: Compass },
              { id: 'topics' as const, label: 'Temas', icon: Sparkles },
              { id: 'readings' as const, label: 'Lecturas', icon: BookOpen },
              { id: 'reports' as const, label: 'Notas y Reportes', icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    setView(item.id);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-[#17644e] text-white'
                      : 'text-[#d1eae0] hover:bg-[#174036] hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setEditingProfile((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#17644e] px-3.5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#1d7a60] whitespace-nowrap shrink-0"
          >
            <User className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{state.student ? state.student.split(' ')[0] : 'Ingresar'}</span>
          </button>
        </div>

        {/* Mobile Nav Row */}
        <div className="md:hidden border-t border-[#1c4b3d] px-3 py-2 flex gap-1.5 overflow-x-auto">
          {[
            { id: 'roadmap' as const, label: 'Ruta Anual' },
            { id: 'topics' as const, label: 'Temas' },
            { id: 'readings' as const, label: 'Lecturas' },
            { id: 'reports' as const, label: 'Notas' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 ${
                view === item.id ? 'bg-[#17644e] text-white' : 'text-[#d1eae0] bg-[#143a31]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Student Entry / Quick Profile & Fast Access Controls */}
        {(editingProfile || !state.student) && (
          <section
            aria-label="Registro rápido del estudiante"
            className="rounded-2xl border border-[#c6ded4] bg-white p-5 sm:p-6 no-print"
          >
            <form onSubmit={handleProfileSubmit} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[240px]">
                <label htmlFor="student-name-input" className="block text-sm font-bold text-[#102a24] mb-1.5">
                  Nombre completo del estudiante (Acceso rápido anual)
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ej: Valeria Méndez Rojas"
                  className="w-full rounded-xl border border-[#679888] px-3.5 py-2.5 text-sm font-medium text-[#102a24] focus-visible:outline-2 focus-visible:outline-[#17644e]"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#17644e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124f3d]"
              >
                {state.student ? 'Guardar nombre' : 'Entrar a estudiar'}
              </button>
              {state.student && (
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="rounded-xl border border-[#c8dbd3] px-4 py-2.5 text-sm font-semibold text-[#435b53]"
                >
                  Cancelar
                </button>
              )}
            </form>
            {nameError && (
              <p role="status" className="mt-2 text-sm font-semibold text-rose-700">
                {nameError}
              </p>
            )}
            <p className="mt-2 text-xs text-[#435b53]">
              Tu nombre se guarda al instante para identificar tus notas, quizzes, lecturas y reportes en tiempo real.
            </p>
          </section>
        )}

        {/* Active Student Utility Ribbon */}
        {state.student && (
          <section className="rounded-xl border border-[#d4e4dd] bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-bold text-[#102a24]">
                Estudiante: <span className="text-[#17644e]">{state.student}</span>
              </span>
              <span className="text-[#9cb8ae]">·</span>
              <span className="font-mono-num text-xs font-bold text-[#435b53]">
                {quizzesDoneCount} de {topics.length} quizzes dominados · Visitas: {state.visits}
              </span>
              {syncStatus && (
                <>
                  <span className="text-[#9cb8ae]">·</span>
                  <span className="text-xs font-semibold text-[#17644e]">{syncStatus}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => persist((prev) => ({ ...prev, soundEffects: !prev.soundEffects }))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#c8dbd3] bg-[#f8fbfa] px-2.5 py-1.5 text-xs font-semibold text-[#143a30] hover:border-[#17644e]"
              >
                {state.soundEffects ? (
                  <Volume2 className="h-3.5 w-3.5 text-[#17644e]" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5 text-[#647d75]" aria-hidden="true" />
                )}
                <span>{state.soundEffects ? 'Efectos: Sí' : 'Efectos: No'}</span>
              </button>

              <button
                type="button"
                onClick={() => setView('reports')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#e6f4ee] px-3 py-1.5 text-xs font-bold text-[#17644e] hover:bg-[#d5ece2]"
              >
                <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ver Boleta de Notas</span>
              </button>
            </div>
          </section>
        )}

        {/* MAIN CONTENT WORKSPACE (visible once student enters name) */}
        {state.student ? (
          view === 'roadmap' ? (
            <AnnualRoadmapView
              state={state}
              onSelectTopic={(id, sub) => selectTopic(id, sub || 'study')}
              onGoToReadings={() => setView('readings')}
              onGoToReports={() => setView('reports')}
            />
          ) : view === 'readings' ? (
            <section className="rounded-2xl border border-[#d4e4dd] bg-white p-5 sm:p-7">
              <ReadingsView
                records={state.readings}
                soundEffects={state.soundEffects}
                onSaveResult={(kind, title, score, total) => {
                  persist((prev) => {
                    const key = kind === 'Vocabulario' ? 'vocabulary' : 'comprehension';
                    const existing = prev.readings[title] || {};
                    const best = existing[key];
                    const nextRec =
                      !best || score > best.score ? { ...existing, [key]: { score, total } } : existing;
                    return {
                      ...prev,
                      readings: { ...prev.readings, [title]: nextRec },
                    };
                  });
                  recordActivity(kind, title, score, total);
                }}
                onBackToTopics={() => setView('topics')}
              />
            </section>
          ) : view === 'reports' ? (
            <section className="rounded-2xl border border-[#d4e4dd] bg-white p-5 sm:p-7">
              <GradesAndReportsView
                state={state}
                quizLocked={quizLocked}
                onJumpToTopic={(id) => selectTopic(id, 'study')}
              />
            </section>
          ) : (
            /* TOPICS WORKSPACE */
            <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)] items-start">
              {/* Fast Topic Navigation Sidebar */}
              <aside className="rounded-2xl border border-[#d4e4dd] bg-white p-4 space-y-3 lg:sticky lg:top-20 no-print">
                <div className="relative">
                  <Search className="h-4 w-4 text-[#647d75] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    type="search"
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    placeholder="Buscar tema o regla..."
                    aria-label="Buscar tema del año"
                    className="w-full rounded-xl border border-[#d4e4dd] bg-[#f8fbfa] pl-9 pr-3 py-2 text-xs font-medium text-[#102a24] focus-visible:outline-2 focus-visible:outline-[#17644e]"
                  />
                </div>

                <nav aria-label="Temas del plan anual" className="space-y-1.5">
                  {filteredTopics.map((t) => {
                    const isCurrent = t.id === topicIdx;
                    const qScore = state.quiz[t.id];
                    const pScore = state.practice[t.id];
                    const done = qScore !== undefined && qScore >= 46;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => selectTopic(t.id, 'study')}
                        className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          isCurrent
                            ? 'border-[#17644e] bg-[#17644e] text-white'
                            : 'border-[#e3ece7] bg-[#f8fbfa] text-[#102a24] hover:border-[#17644e]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono-num font-bold opacity-80">
                            U{t.id + 1} · {t.isOriginalConvocatoria ? 'Base' : 'Anual'}
                          </span>
                          {done ? (
                            <CheckCircle2
                              className={`h-3.5 w-3.5 shrink-0 ${isCurrent ? 'text-white' : 'text-[#17644e]'}`}
                              aria-hidden="true"
                            />
                          ) : null}
                        </div>
                        <p className="text-sm font-bold leading-snug mt-0.5">{t.title}</p>
                        {(qScore !== undefined || pScore !== undefined) && (
                          <p
                            className={`text-[11px] font-mono-num mt-1 ${
                              isCurrent ? 'text-[#d1eae0]' : 'text-[#435b53]'
                            }`}
                          >
                            {pScore !== undefined ? `P: ${pScore}/30` : ''}{' '}
                            {qScore !== undefined ? `· Q: ${qScore}/50` : ''}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="pt-2 border-t border-[#e3ece7] grid gap-1.5">
                  <button
                    type="button"
                    onClick={() => setView('readings')}
                    className="w-full inline-flex items-center justify-between rounded-xl border border-[#c8dbd3] bg-white px-3 py-2 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-[#17644e]" aria-hidden="true" />
                      <span>Reading Comprehension</span>
                    </span>
                    <span className="font-mono-num text-[#17644e]">12</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectTopic(topicIdx, 'audio')}
                    className="w-full inline-flex items-center justify-between rounded-xl border border-[#c8dbd3] bg-white px-3 py-2 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Headphones className="h-3.5 w-3.5 text-[#17644e]" aria-hidden="true" />
                      <span>Audio Lab Rápido</span>
                    </span>
                    <span className="font-mono-num text-[#17644e]">U{topicIdx + 1}</span>
                  </button>
                </div>
              </aside>

              {/* Main Topic Card */}
              <section
                ref={stageRef}
                tabIndex={-1}
                className="rounded-2xl border border-[#d4e4dd] bg-white p-5 sm:p-7 space-y-6 focus-visible:outline-none"
              >
                {/* Topic Header */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#17644e]">
                    Unidad {topicIdx + 1} de {topics.length} · {activeTopic.period}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102a24]">
                    {activeTopic.title}
                  </h1>
                  <p className="text-sm font-semibold text-[#435b53]">{activeTopic.subtitle}</p>
                  <p className="text-sm text-[#142a26] pt-1">{activeTopic.goal}</p>
                  <p className="text-xs text-[#647d75]">Referencia: {activeTopic.source}</p>
                </div>

                {/* Topic Segmented Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-[#d4e4dd] pb-4 no-print">
                  {topicTabs.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => selectTopic(topicIdx, t.key)}
                      className={`rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors ${
                        topicTab === t.key
                          ? 'border-[#17644e] bg-[#17644e] text-white'
                          : 'border-[#aac9bd] bg-white text-[#143a30] hover:border-[#17644e] hover:bg-[#f4f9f6]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Stage Content */}
                {topicTab === 'study' && (
                  <TopicStudyView
                    topic={activeTopic}
                    onNavigateTab={(next) => selectTopic(topicIdx, next)}
                  />
                )}

                {(topicTab === 'verbs' || topicTab === 'interactive' || topicTab === 'audio') && (
                  <InteractivePracticeView
                    topic={activeTopic}
                    mode={topicTab}
                    soundEffects={state.soundEffects}
                    flashcardsMastered={state.flashcardsMastered}
                    onToggleFlashcardMastered={(cardId, mastered) =>
                      persist((prev) => ({
                        ...prev,
                        flashcardsMastered: { ...prev.flashcardsMastered, [cardId]: mastered },
                      }))
                    }
                    onRecordProgress={(type, activity, score, max, details) => {
                      if (type === 'Audio Lab') {
                        persist((prev) => ({
                          ...prev,
                          audioLab: {
                            ...prev.audioLab,
                            [topicIdx]: {
                              score: Math.max(prev.audioLab[topicIdx]?.score ?? 0, score),
                              total: max,
                            },
                          },
                        }));
                      } else if (type === 'Verbos') {
                        persist((prev) => ({
                          ...prev,
                          verbDrills: {
                            ...prev.verbDrills,
                            [activity]: {
                              score: Math.max(prev.verbDrills[activity]?.score ?? 0, score),
                              total: max,
                            },
                          },
                        }));
                      }
                      recordActivity(type, activity, score, max, topicIdx, details);
                    }}
                  />
                )}

                {(topicTab === 'practice' || topicTab === 'quiz') && (
                  <AssessmentView
                    topic={activeTopic}
                    mode={topicTab}
                    active={state.active}
                    pausedQuiz={state.pausedQuizzes[topicIdx]}
                    bestScore={topicTab === 'quiz' ? state.quiz[topicIdx] : state.practice[topicIdx]}
                    lastRestartScore={state.restarts[topicIdx]}
                    lastResult={lastResult}
                    restartBanner={restartBanner}
                    soundEffects={state.soundEffects}
                    onStart={startAssessment}
                    onResumeQuiz={resumePausedQuiz}
                    onSubmitAnswer={handleSubmitAnswer}
                    onAdvancePractice={handleAdvancePractice}
                    onPauseAndExitQuiz={handlePauseAndExitQuiz}
                    onGoToMode={(m) => selectTopic(topicIdx, m)}
                    onNextTopic={
                      topicIdx < topics.length - 1
                        ? () => selectTopic(topicIdx + 1, 'study')
                        : undefined
                    }
                  />
                )}
              </section>
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-[#d4e4dd] bg-white p-8 text-center space-y-2">
            <h2 className="text-xl font-bold text-[#102a24]">Bienvenido a Learning with Mr. Picado</h2>
            <p className="text-sm text-[#435b53]">
              Ingresa tu nombre arriba para desbloquear el plan anual completo de 8.º año, audios interactivos, prácticas y boleta de notas.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-[#dde8e3] bg-white py-5 px-4 sm:px-6 no-print">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs text-[#435b53]">
          <div className="space-y-1">
            <p className="font-bold text-[#102a24]">
              Learning with Mr. Picado · Inglés 8.º Año (Plan Anual + Primera Convocatoria)
            </p>
            <p>
              Docente: Mr. Picado · Correo: {TEACHER_EMAIL} · WhatsApp: +506 8617 9072
            </p>
          </div>
          {state.student && (
            <div className="flex flex-wrap gap-2">
              <a
                href={quizLocked ? undefined : buildWhatsAppHref(state, topics)}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={quizLocked}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold ${
                  quizLocked
                    ? 'pointer-events-none bg-slate-200 text-slate-500'
                    : 'bg-[#17644e] text-white hover:bg-[#124f3d]'
                }`}
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Compartir mi avance por WhatsApp</span>
                <ExternalLink className="h-3 w-3 opacity-75" aria-hidden="true" />
              </a>

              <a
                href={quizLocked ? undefined : buildGmailHref(state, topics)}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={quizLocked}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold ${
                  quizLocked
                    ? 'pointer-events-none border-slate-200 bg-slate-100 text-slate-500'
                    : 'border-[#aac9bd] bg-white text-[#143a30] hover:border-[#17644e]'
                }`}
              >
                <Mail className="h-3.5 w-3.5 text-[#17644e]" aria-hidden="true" />
                <span>Preparar informe en Gmail</span>
                <ExternalLink className="h-3 w-3 opacity-75" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
