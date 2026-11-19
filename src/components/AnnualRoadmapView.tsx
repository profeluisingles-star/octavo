import { ArrowRight, BookOpen, CheckCircle2, Headphones, Sparkles } from 'lucide-react';
import { costaRicaDays, topics } from '../data/curriculum';
import type { StudentState, TopicPeriod } from '../types';

interface AnnualRoadmapViewProps {
  state: StudentState;
  onSelectTopic: (topicId: number, subTab?: 'study' | 'interactive' | 'audio' | 'practice' | 'quiz') => void;
  onGoToReadings: () => void;
  onGoToReports: () => void;
}

const PERIOD_ORDER: TopicPeriod[] = [
  'Trimestre 1 · Convocatoria Base',
  'Trimestre 2 · Ampliación Anual',
  'Trimestre 3 · Consolidación Anual',
];

export function AnnualRoadmapView({
  state,
  onSelectTopic,
  onGoToReadings,
  onGoToReports,
}: AnnualRoadmapViewProps) {
  const quizzesDone = Object.keys(state.quiz).length;
  const practicesDone = Object.keys(state.practice).length;
  const audioDone = Object.keys(state.audioLab).length;

  return (
    <div className="space-y-8">
      {/* Annual Progress Overview Strip */}
      <section className="rounded-2xl border border-[#c6ded4] bg-[#eef7f3] p-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] items-center">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#17644e]">
            Plan Anual Completo · 8.º Año Inglés
          </p>
          <h2 className="text-3xl font-extrabold text-[#102a24]">
            Ruta de Aprendizaje con Mr. Picado
          </h2>
          <p className="text-sm text-[#354c45] leading-relaxed max-w-2xl">
            Todo el material base de Primera Convocatoria (Unidades 1–5) más la ampliación del año completo (Unidades 6–8), con audios interactivos, laboratorio de dictado, tarjetas, juegos y seguimiento de notas en tiempo real.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => onSelectTopic(state.topic || 0, 'study')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#17644e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124f3d]"
            >
              <span>Continuar Unidad {(state.topic || 0) + 1}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onGoToReadings}
              className="inline-flex items-center gap-2 rounded-xl border border-[#aac9bd] bg-white px-4 py-2.5 text-sm font-bold text-[#143a30] hover:bg-[#f4f9f6]"
            >
              <BookOpen className="h-4 w-4 text-[#17644e]" aria-hidden="true" />
              <span>12 Lecturas Guiadas</span>
            </button>
            <button
              type="button"
              onClick={onGoToReports}
              className="inline-flex items-center gap-2 rounded-xl border border-[#aac9bd] bg-white px-4 py-2.5 text-sm font-bold text-[#143a30] hover:bg-[#f4f9f6]"
            >
              <span>Ver Notas y Reportes</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#d4e4dd] bg-white p-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#435b53]">Avance del año</span>
            <span className="font-mono-num text-lg font-extrabold text-[#17644e]">
              {quizzesDone}/{topics.length} Quizzes
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#e6efeb] overflow-hidden">
            <div
              className="h-full bg-[#17644e] transition-all duration-300"
              style={{ width: `${Math.round((quizzesDone / topics.length) * 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e6efeb] text-center">
            <div>
              <p className="font-mono-num text-lg font-extrabold text-[#102a24]">{practicesDone}/{topics.length}</p>
              <p className="text-xs text-[#435b53]">Prácticas</p>
            </div>
            <div>
              <p className="font-mono-num text-lg font-extrabold text-[#102a24]">{audioDone}/{topics.length}</p>
              <p className="text-xs text-[#435b53]">Audio Lab</p>
            </div>
            <div>
              <p className="font-mono-num text-lg font-extrabold text-[#102a24]">{Object.keys(state.readings).length}/12</p>
              <p className="text-xs text-[#435b53]">Lecturas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Units Grouped by Academic Period */}
      {PERIOD_ORDER.map((period) => {
        const groupTopics = topics.filter((t) => t.period === period);
        return (
          <section key={period} className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#dde8e3] pb-2">
              <h3 className="text-lg font-extrabold text-[#102a24]">{period}</h3>
              <span className="text-xs font-medium text-[#435b53]">
                {groupTopics.length} {groupTopics.length === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {groupTopics.map((t) => {
                const bestP = state.practice[t.id];
                const bestQ = state.quiz[t.id];
                const audioRec = state.audioLab[t.id];
                const passed = bestQ !== undefined && bestQ >= 46;

                return (
                  <article
                    key={t.id}
                    className="rounded-2xl border border-[#d4e4dd] bg-white p-5 flex flex-col justify-between gap-4 hover:border-[#17644e] transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#435b53]">
                        <span>
                          Unidad {t.id + 1} · {t.source}
                        </span>
                        {passed ? (
                          <span className="inline-flex items-center gap-1 text-[#17644e]">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Dominado</span>
                          </span>
                        ) : bestQ !== undefined || bestP !== undefined ? (
                          <span className="text-amber-700">En progreso</span>
                        ) : (
                          <span>Pendiente</span>
                        )}
                      </div>

                      <h4 className="text-xl font-extrabold text-[#102a24]">{t.title}</h4>
                      <p className="text-sm font-medium text-[#17644e]">{t.subtitle}</p>
                      <p className="text-sm text-[#354c45]">{t.goal}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#ebf2ee]">
                      <div className="flex flex-wrap gap-4 font-mono-num text-xs text-[#435b53]">
                        <span>Práctica: {bestP !== undefined ? `${bestP}/30` : '—'}</span>
                        <span>Quiz: {bestQ !== undefined ? `${bestQ}/50` : '—'}</span>
                        <span>Audio: {audioRec ? `${audioRec.score}/${audioRec.total}` : '—'}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectTopic(t.id, 'study')}
                          className="rounded-lg bg-[#17644e] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#124f3d]"
                        >
                          Estudiar
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectTopic(t.id, 'interactive')}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#c8dbd3] bg-[#f8fbfa] px-3 py-1.5 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-[#17644e]" aria-hidden="true" />
                          <span>Juegos</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectTopic(t.id, 'audio')}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#c8dbd3] bg-[#f8fbfa] px-3 py-1.5 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
                        >
                          <Headphones className="h-3.5 w-3.5 text-[#17644e]" aria-hidden="true" />
                          <span>Audio</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectTopic(t.id, 'practice')}
                          className="rounded-lg border border-[#c8dbd3] bg-white px-3 py-1.5 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
                        >
                          Práctica
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectTopic(t.id, 'quiz')}
                          className="rounded-lg border border-[#c8dbd3] bg-white px-3 py-1.5 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
                        >
                          Quiz
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Quick Costa Rica Calendar Reference */}
      <section className="rounded-2xl border border-[#d4e4dd] bg-white p-5">
        <h3 className="text-base font-extrabold text-[#102a24] mb-3">
          Calendario Escolar de Efemérides y Feriados en Inglés (Costa Rica)
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {costaRicaDays.map(([date, en, es]) => (
            <div key={date} className="rounded-xl border border-[#e6efeb] bg-[#f8fbfa] p-3 text-xs">
              <p className="font-mono-num font-bold text-[#17644e]">{date}</p>
              <p className="font-bold text-[#102a24] mt-0.5" lang="en">{en}</p>
              <p className="text-[#435b53]">{es}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
