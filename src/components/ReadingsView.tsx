import { BookOpen, Check, Headphones, Volume2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { mix, normalized } from '../data/questionBanks';
import { readingPassages } from '../data/readings';
import type { GradeEventType, ReadingRecord } from '../types';
import { playTone, speakEnglish, speakParagraphs, stopSpeech } from '../utils/speech';
import { PronounceButton } from './PronounceButton';

interface ReadingsViewProps {
  records: Record<string, ReadingRecord>;
  soundEffects: boolean;
  onSaveResult: (kind: Extract<GradeEventType, 'Lectura' | 'Vocabulario'>, title: string, score: number, total: number) => void;
  onBackToTopics: () => void;
}

export function ReadingsView({ records, soundEffects, onSaveResult, onBackToTopics }: ReadingsViewProps) {
  const [filter, setFilter] = useState<'all' | 'original' | 'annual'>('all');
  const [selectedTitle, setSelectedTitle] = useState<string>(readingPassages[0].title);

  // Read-aloud state
  const [readingRate, setReadingRate] = useState<number>(0.94);
  const [activePara, setActivePara] = useState<number>(-1);

  // Vocabulary mini-quiz state
  const [vocItems, setVocItems] = useState<[string, string][]>([]);
  const [vocCursor, setVocCursor] = useState(0);
  const [vocScore, setVocScore] = useState(0);
  const [vocOptions, setVocOptions] = useState<string[]>([]);
  const [vocChoice, setVocChoice] = useState<string | null>(null);
  const [vocDone, setVocDone] = useState(false);

  // Comprehension tasks state
  const [taskInputs, setTaskInputs] = useState<Record<number, string>>({});
  const [taskFeedback, setTaskFeedback] = useState<Record<number, { ok: boolean; text: string; model?: string }>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});
  const [firstAttemptScore, setFirstAttemptScore] = useState(0);

  const visibleList = readingPassages.filter((r) =>
    filter === 'original' ? r.isOriginal : filter === 'annual' ? !r.isOriginal : true
  );

  const activeReading =
    readingPassages.find((r) => r.title === selectedTitle) ?? visibleList[0] ?? readingPassages[0];

  const resetReadingSession = () => {
    stopSpeech();
    setActivePara(-1);
    setVocItems([]);
    setVocCursor(0);
    setVocScore(0);
    setVocChoice(null);
    setVocDone(false);
    setTaskInputs({});
    setTaskFeedback({});
    setCompletedTasks({});
    setFirstAttemptScore(0);
  };

  useEffect(() => {
    resetReadingSession();
  }, [activeReading.title]);

  const paragraphs = activeReading.text.split('\n\n');
  const objectiveTasks = activeReading.tasks.filter((t) => t.type !== 'Responde en inglés');
  const objectiveTotal = objectiveTasks.length;
  const completedCount = Object.keys(completedTasks).length;

  const startVocabPractice = () => {
    const picked = mix(activeReading.vocabulary).slice(0, 4);
    setVocItems(picked);
    setVocCursor(0);
    setVocScore(0);
    setVocChoice(null);
    setVocDone(false);
    if (picked.length) {
      const [term, correct] = picked[0];
      const distractors = mix(activeReading.vocabulary.filter((w) => w[0] !== term))
        .slice(0, 2)
        .map((w) => w[1]);
      setVocOptions(mix([correct, ...distractors]));
    }
  };

  const pickVocabOption = (opt: string) => {
    if (vocChoice !== null) return;
    const [, correct] = vocItems[vocCursor];
    const ok = opt === correct;
    setVocChoice(opt);
    playTone(ok ? 'correct' : 'wrong', soundEffects);
    if (ok) setVocScore((s) => s + 1);
  };

  const nextVocabWord = () => {
    const next = vocCursor + 1;
    if (next >= vocItems.length) {
      setVocDone(true);
      onSaveResult('Vocabulario', activeReading.title, vocScore, vocItems.length);
      return;
    }
    const [term, correct] = vocItems[next];
    const distractors = mix(activeReading.vocabulary.filter((w) => w[0] !== term))
      .slice(0, 2)
      .map((w) => w[1]);
    setVocCursor(next);
    setVocChoice(null);
    setVocOptions(mix([correct, ...distractors]));
  };

  const handleTaskComplete = (idx: number, isCorrectObjective: boolean) => {
    const alreadyDone = Boolean(completedTasks[idx]);
    const nextCompleted = { ...completedTasks, [idx]: true };
    const nextScore = !alreadyDone && isCorrectObjective ? firstAttemptScore + 1 : firstAttemptScore;
    if (!alreadyDone) {
      setCompletedTasks(nextCompleted);
      if (isCorrectObjective) setFirstAttemptScore(nextScore);
    }
    if (!alreadyDone && Object.keys(nextCompleted).length === activeReading.tasks.length) {
      onSaveResult('Lectura', activeReading.title, nextScore, objectiveTotal);
    }
  };

  const toggleReadAloud = () => {
    if (activePara >= 0) {
      stopSpeech();
      setActivePara(-1);
      return;
    }
    speakParagraphs(paragraphs, readingRate, setActivePara, () => setActivePara(-1));
  };

  const rec = records[activeReading.title];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d4e4dd] pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#102a24]">Reading Comprehension</h2>
          <p className="text-sm text-[#435b53]">
            Escucha la lectura en voz alta, practica el vocabulario y responde los ejercicios de comprensión.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToTopics}
          className="rounded-xl border border-[#aac9bd] bg-white px-4 py-2 text-sm font-bold text-[#143a30] hover:bg-[#f4f9f6]"
        >
          Volver a los temas
        </button>
      </div>

      {/* Filter Segmented Control */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-[#c8dbd3] bg-[#f4f9f6] p-1">
          {[
            ['all', `Todas (${readingPassages.length})`],
            ['original', 'Lecturas Base (8)'],
            ['annual', 'Lecturas Ampliadas (4)'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key as 'all' | 'original' | 'annual')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                filter === key ? 'bg-[#17644e] text-white' : 'text-[#354c45] hover:text-[#102a24]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reading Selector Buttons */}
      <div className="flex flex-wrap gap-2">
        {visibleList.map((r) => {
          const rRec = records[r.title];
          const isCurrent = r.title === activeReading.title;
          return (
            <button
              key={r.title}
              type="button"
              onClick={() => setSelectedTitle(r.title)}
              className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                isCurrent
                  ? 'border-[#17644e] bg-[#17644e] text-white'
                  : 'border-[#c8dbd3] bg-white text-[#143a30] hover:border-[#17644e] hover:bg-[#f4f9f6]'
              }`}
            >
              <span>{r.title}</span>
              {rRec?.comprehension ? (
                <span className="ml-1.5 font-mono-num opacity-85">
                  · {rRec.comprehension.score}/{rRec.comprehension.total}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Active Reading Header & Grades */}
      <div className="rounded-xl border border-[#d4e4dd] bg-[#f8fbfa] p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#17644e]">{activeReading.period}</p>
            <h3 className="text-xl font-extrabold text-[#102a24]">{activeReading.title}</h3>
          </div>
          <div className="flex flex-wrap gap-4 font-mono-num text-xs font-bold text-[#17644e]">
            <span>
              Mejor Vocabulario: {rec?.vocabulary ? `${rec.vocabulary.score}/${rec.vocabulary.total}` : 'Sin intento'}
            </span>
            <span>
              Mejor Lectura: {rec?.comprehension ? `${rec.comprehension.score}/${rec.comprehension.total}` : 'Sin intento'}
            </span>
          </div>
        </div>

        {/* Vocabulary Table */}
        <div className="overflow-x-auto rounded-xl border border-[#d4e4dd] bg-white">
          <table className="w-full text-left text-sm border-collapse">
            <caption className="px-4 py-2 text-left font-bold text-[#102a24] bg-[#f4f9f6] border-b border-[#d4e4dd]">
              Vocabulario de la lectura
            </caption>
            <thead>
              <tr className="bg-[#e6f4ee] text-[#102a24]">
                <th className="px-3 py-2 font-bold">English</th>
                <th className="px-3 py-2 font-bold">Español</th>
                <th className="px-3 py-2 font-bold">Audio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6efeb]">
              {activeReading.vocabulary.map(([en, es]) => (
                <tr key={en}>
                  <td className="px-3 py-2 font-semibold text-[#102a24]" lang="en">{en}</td>
                  <td className="px-3 py-2 text-[#354c45]">{es}</td>
                  <td className="px-3 py-2">
                    <PronounceButton text={en} label="Oír" compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vocabulary Practice Widget */}
        <section className="rounded-xl border border-[#d4e4dd] bg-white p-4 space-y-3">
          <h4 className="font-bold text-sm text-[#102a24]">Práctica de vocabulario (4 palabras)</h4>
          {!vocItems.length ? (
            <button
              type="button"
              onClick={startVocabPractice}
              className="rounded-xl bg-[#17644e] px-4 py-2 text-sm font-bold text-white hover:bg-[#124f3d]"
            >
              Empezar práctica de vocabulario
            </button>
          ) : vocDone ? (
            <div className="space-y-3">
              <p className="font-bold font-mono-num text-[#17644e]">
                {vocScore} de {vocItems.length} aciertos
              </p>
              <button
                type="button"
                onClick={startVocabPractice}
                className="rounded-xl border border-[#17644e] bg-white px-4 py-2 text-sm font-bold text-[#17644e]"
              >
                Practicar otras palabras
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-[#102a24]">
                  Palabra {vocCursor + 1} de {vocItems.length} · <span lang="en">{vocItems[vocCursor][0]}</span>
                </p>
                <PronounceButton text={vocItems[vocCursor][0]} label="Escuchar palabra" compact />
              </div>
              <div className="flex flex-wrap gap-2">
                {vocOptions.map((opt) => {
                  const right = opt === vocItems[vocCursor][1];
                  const chosen = vocChoice === opt;
                  const style =
                    vocChoice !== null
                      ? right
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                        : chosen
                        ? 'border-rose-600 bg-rose-50 text-rose-950'
                        : 'border-[#d4e4dd] bg-white opacity-70'
                      : 'border-[#aac9bd] bg-white hover:border-[#17644e]';
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={vocChoice !== null}
                      onClick={() => pickVocabOption(opt)}
                      className={`rounded-xl border px-3.5 py-2 text-sm font-semibold ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {vocChoice !== null && (
                <div className="space-y-2" role="status">
                  <p className="text-sm font-semibold text-[#17644e]">
                    {vocChoice === vocItems[vocCursor][1] ? 'Correcto. ' : 'Respuesta: '}
                    {vocItems[vocCursor][0]} significa {vocItems[vocCursor][1]}.
                  </p>
                  <button
                    type="button"
                    onClick={nextVocabWord}
                    className="rounded-xl bg-[#17644e] px-4 py-2 text-xs font-bold text-white"
                  >
                    {vocCursor === vocItems.length - 1 ? 'Ver resultado' : 'Siguiente palabra'}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Passage Read Aloud Block */}
        <section className="rounded-xl border border-[#cddcf5] bg-[#eef4ff] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#21487c]" aria-hidden="true" />
              <h4 className="font-bold text-[#21487c]">Read the text</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[0.78, 0.94, 1.1].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setReadingRate(rate)}
                  className={`rounded-md border px-2 py-1 text-xs font-mono-num font-bold ${
                    readingRate === rate
                      ? 'border-[#21487c] bg-[#21487c] text-white'
                      : 'border-[#b9ceef] bg-white text-[#21487c]'
                  }`}
                >
                  {rate === 0.78 ? 'Lento' : rate === 0.94 ? 'Normal' : 'Ágil'}
                </button>
              ))}
              <button
                type="button"
                onClick={toggleReadAloud}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold ${
                  activePara >= 0
                    ? 'bg-rose-700 text-white'
                    : 'bg-[#21487c] text-white hover:bg-[#193861]'
                }`}
              >
                <Headphones className="h-4 w-4" aria-hidden="true" />
                <span>{activePara >= 0 ? 'Detener lectura' : 'Escuchar lectura completa'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 text-base leading-relaxed text-[#102a24]" lang="en">
            {paragraphs.map((para, i) => (
              <div
                key={i}
                className={`rounded-lg p-2.5 transition-colors flex items-start justify-between gap-3 ${
                  activePara === i ? 'bg-white ring-2 ring-[#21487c]/30' : ''
                }`}
              >
                <p className="flex-1">{para}</p>
                <button
                  type="button"
                  onClick={() => speakEnglish(para, readingRate < 0.85)}
                  title="Escuchar este párrafo"
                  className="shrink-0 rounded-lg border border-[#c6d7f5] bg-white p-1.5 text-[#21487c] hover:bg-[#dce8fb]"
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Reading Tasks */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-lg font-bold text-[#102a24]">Práctica de lectura</h4>
            <span className="font-mono-num text-xs font-bold text-[#17644e]">
              Avance: {completedCount}/{activeReading.tasks.length} tareas · Aciertos primer intento: {firstAttemptScore}/{objectiveTotal}
            </span>
          </div>

          {activeReading.tasks.map((task, idx) => {
            const fb = taskFeedback[idx];
            return (
              <div key={`${task.prompt}-${idx}`} className="rounded-xl border border-[#d4e4dd] bg-white p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#17644e]">{task.type}</span>
                  <PronounceButton text={task.prompt} label="Oír pregunta" compact />
                </div>
                <p className="font-bold text-[#102a24]" lang="en">
                  {task.prompt}
                </p>

                {task.type === 'Completa la oración' ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = taskInputs[idx] || '';
                      if (!val.trim()) return;
                      const ok = normalized(val) === normalized(task.answer);
                      playTone(ok ? 'correct' : 'wrong', soundEffects);
                      setTaskFeedback((prev) => ({
                        ...prev,
                        [idx]: {
                          ok,
                          text: ok ? `Correcto. ${task.hint}` : `La respuesta es ${task.answer}. ${task.hint}`,
                        },
                      }));
                      handleTaskComplete(idx, ok);
                    }}
                    className="flex flex-wrap gap-2 items-center"
                  >
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      spellCheck={false}
                      value={taskInputs[idx] || ''}
                      onChange={(e) => setTaskInputs((prev) => ({ ...prev, [idx]: e.target.value }))}
                      placeholder="Escribe la palabra o frase..."
                      className="flex-1 min-w-[210px] max-w-md rounded-xl border border-[#679888] px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-[#17644e] px-4 py-2 text-sm font-bold text-white"
                    >
                      Comprobar
                    </button>
                  </form>
                ) : task.options ? (
                  <div className="flex flex-wrap gap-2">
                    {task.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          const ok = normalized(opt) === normalized(task.answer);
                          playTone(ok ? 'correct' : 'wrong', soundEffects);
                          setTaskFeedback((prev) => ({
                            ...prev,
                            [idx]: {
                              ok,
                              text: (ok ? 'Correcto. ' : 'Inténtalo otra vez. ') + task.hint,
                            },
                          }));
                          handleTaskComplete(idx, ok);
                        }}
                        className="rounded-xl border border-[#aac9bd] bg-[#f8fbfa] px-3.5 py-2 text-sm font-semibold text-[#102a24] hover:border-[#17644e] hover:bg-[#e6f4ee]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <textarea
                      rows={2}
                      maxLength={300}
                      value={taskInputs[idx] || ''}
                      onChange={(e) => setTaskInputs((prev) => ({ ...prev, [idx]: e.target.value }))}
                      placeholder="Escribe una oración completa en inglés"
                      className="w-full rounded-xl border border-[#679888] px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = taskInputs[idx] || '';
                        if (!val.trim()) {
                          setTaskFeedback((prev) => ({
                            ...prev,
                            [idx]: { ok: false, text: 'Primero escribe una oración en inglés.' },
                          }));
                          return;
                        }
                        setTaskFeedback((prev) => ({
                          ...prev,
                          [idx]: {
                            ok: true,
                            text: task.hint,
                            model: task.answer,
                          },
                        }));
                        handleTaskComplete(idx, false);
                      }}
                      className="rounded-xl border border-[#17644e] bg-white px-4 py-2 text-xs font-bold text-[#17644e] hover:bg-[#e6f4ee]"
                    >
                      Comparar con una respuesta modelo
                    </button>
                  </div>
                )}

                {fb && (
                  <div
                    role="status"
                    className={`rounded-xl border p-3 text-sm space-y-1 ${
                      fb.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-amber-300 bg-amber-50 text-amber-950'
                    }`}
                  >
                    {fb.model ? (
                      <>
                        <p className="font-bold">Respuesta modelo en inglés:</p>
                        <p className="font-semibold text-[#102a24]" lang="en">
                          {fb.model}
                        </p>
                        <p className="text-xs text-[#17644e]">{fb.text}</p>
                        <PronounceButton text={fb.model} label="Escuchar modelo" compact />
                      </>
                    ) : (
                      <p className="font-semibold flex items-center gap-1.5">
                        {fb.ok ? <Check className="h-4 w-4 text-emerald-700" /> : <X className="h-4 w-4 text-rose-700" />}
                        <span>{fb.text}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="rounded-xl border border-[#d4e4dd] bg-white p-4 text-sm font-medium text-[#354c45]" role="status">
            {completedCount === activeReading.tasks.length
              ? `Práctica terminada. Comprensión: ${firstAttemptScore} de ${objectiveTotal} puntos en el primer intento. Completaste las respuestas abiertas.`
              : 'Al terminar los ejercicios verás tu puntaje de comprensión y se guardará automáticamente en tu boleta.'}
          </div>
        </section>
      </div>
    </div>
  );
}
