import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  RotateCcw,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { verbForms } from '../data/curriculum';
import { finalExams, type ExamPart, type ExamQuestionItem, type FinalExam } from '../data/finalExams';
import { normalized } from '../data/questionBanks';
import { schoolCards } from '../data/schoolCards';
import type { StudentState } from '../types';
import { playTone, stopSpeech } from '../utils/speech';
import { PronounceButton } from './PronounceButton';

interface FinalExamsViewProps {
  state: StudentState;
  onUpdateDraft: (examId: string, answers: Record<string, string>) => void;
  onSaveExamResult: (examId: string, examTitle: string, score: number, total: number) => void;
}

function evaluateExamItem(item: ExamQuestionItem, userRaw: string, partKind: ExamPart['kind']): boolean {
  const userNorm = normalized(userRaw);
  if (!userNorm) return false;

  const validList = [item.answer, ...(item.alternatives || [])].map(normalized);
  if (validList.includes(userNorm)) return true;

  if (partKind === 'long-answer' && item.requiredConcepts?.length) {
    const words = userNorm.split(' ').filter(Boolean);
    if (words.length < 2) return false;
    return item.requiredConcepts.every((group) =>
      group.some((keyword) => userNorm.includes(normalized(keyword)))
    );
  }

  return false;
}

export function FinalExamsView({ state, onUpdateDraft, onSaveExamResult }: FinalExamsViewProps) {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [partIdx, setPartIdx] = useState<number>(0);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [checkedParts, setCheckedParts] = useState<Record<string, boolean>>({});
  const [examSubmitted, setExamSubmitted] = useState<Record<string, boolean>>({});

  const activeExam: FinalExam | null = useMemo(
    () => finalExams.find((e) => e.id === selectedExamId) ?? null,
    [selectedExamId]
  );

  const drafts = state.mockExamDrafts || {};
  const savedScores = state.mockExams || {};

  const setAnswer = (examId: string, itemId: string, value: string) => {
    const prevExamAnswers = drafts[examId] || {};
    onUpdateDraft(examId, { ...prevExamAnswers, [itemId]: value });
  };

  const resetExam = (exam: FinalExam) => {
    stopSpeech();
    onUpdateDraft(exam.id, {});
    setCheckedParts((prev) => {
      const next = { ...prev };
      for (const p of exam.parts) {
        delete next[`${exam.id}-${p.partNumber}`];
      }
      return next;
    });
    setExamSubmitted((prev) => ({ ...prev, [exam.id]: false }));
    setPartIdx(0);
    setFocusedItemId(exam.parts[0]?.items[0]?.id ?? null);
  };

  const gradeFullExam = (exam: FinalExam) => {
    stopSpeech();
    const answers = drafts[exam.id] || {};
    let totalCorrect = 0;
    const allChecked: Record<string, boolean> = { ...checkedParts };

    for (const part of exam.parts) {
      allChecked[`${exam.id}-${part.partNumber}`] = true;
      for (const item of part.items) {
        if (evaluateExamItem(item, answers[item.id] || '', part.kind)) {
          totalCorrect += 1;
        }
      }
    }

    setCheckedParts(allChecked);
    setExamSubmitted((prev) => ({ ...prev, [exam.id]: true }));
    const pct = Math.round((totalCorrect / exam.totalPoints) * 100);
    playTone(pct >= 70 ? 'correct' : 'wrong', state.soundEffects);
    onSaveExamResult(exam.id, exam.title, totalCorrect, exam.totalPoints);
  };

  // =========================================================================
  // HUB VIEW: 3 Complete Final Exams
  // =========================================================================
  if (!activeExam) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#d4e4dd] pb-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#17644e]">
            Simulacros Integrales · Unidades 1–5 (10 Partes cada uno)
          </p>
          <h2 className="text-2xl font-extrabold text-[#102a24]">
            Exámenes Finales de Práctica (Estilo Prof. Carlos Rodriguez-H)
          </h2>
          <p className="text-sm text-[#435b53] max-w-3xl">
            Aquí puedes practicar la hoja oficial completa entregada para el examen (Examen 1) más dos simulacros adicionales (Exámenes 2 y 3) con exactamente la misma metodología de 10 partes, sin alterar tus notas ni avances anteriores.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {finalExams.map((exam) => {
            const draft = drafts[exam.id] || {};
            const answeredCount = exam.parts.reduce(
              (acc, part) => acc + part.items.filter((it) => (draft[it.id] || '').trim().length > 0).length,
              0
            );
            const best = savedScores[exam.id];

            return (
              <article
                key={exam.id}
                className="rounded-2xl border border-[#d4e4dd] bg-[#f8fbfa] p-5 flex flex-col justify-between gap-4 hover:border-[#17644e] transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#17644e]">
                    <span>{exam.sourceBadge}</span>
                    <span className="font-mono-num">{exam.totalPoints} pts</span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#102a24] leading-snug">{exam.title}</h3>
                  <p className="text-xs font-semibold text-[#435b53]">{exam.subtitle}</p>
                  <p className="text-sm text-[#354c45] leading-relaxed">{exam.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#dde8e3]">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
                    <div className="rounded-lg bg-white border border-[#e3ece7] p-2.5">
                      <p className="text-[#435b53]">Respondidas</p>
                      <p className="font-bold text-[#102a24] text-sm mt-0.5">
                        {answeredCount}/{exam.totalPoints}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white border border-[#e3ece7] p-2.5">
                      <p className="text-[#435b53]">Mejor nota</p>
                      <p className="font-bold text-[#17644e] text-sm mt-0.5">
                        {best ? `${best.score}/${best.total} (${best.bestPct}%)` : 'Sin intento'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExamId(exam.id);
                      setPartIdx(0);
                      setFocusedItemId(exam.parts[0]?.items[0]?.id ?? null);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#17644e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124f3d]"
                  >
                    <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                    <span>{answeredCount > 0 ? 'Continuar Examen' : 'Comenzar Examen'}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // ACTIVE EXAM WORKSPACE
  // =========================================================================
  const currentPart = activeExam.parts[partIdx];
  const examAnswers = drafts[activeExam.id] || {};
  const totalAnswered = activeExam.parts.reduce(
    (acc, p) => acc + p.items.filter((it) => (examAnswers[it.id] || '').trim().length > 0).length,
    0
  );

  const partCheckKey = `${activeExam.id}-${currentPart.partNumber}`;
  const isPartChecked = Boolean(checkedParts[partCheckKey]);
  const isExamDone = Boolean(examSubmitted[activeExam.id]);

  const partCorrectCount = currentPart.items.filter((it) =>
    evaluateExamItem(it, examAnswers[it.id] || '', currentPart.kind)
  ).length;

  const fullExamScore = activeExam.parts.reduce(
    (sum, p) =>
      sum + p.items.filter((it) => evaluateExamItem(it, examAnswers[it.id] || '', p.kind)).length,
    0
  );
  const fullExamPct = Math.round((fullExamScore / activeExam.totalPoints) * 100);

  const activeFocusItem =
    currentPart.items.find((it) => it.id === focusedItemId) ??
    currentPart.items.find((it) => !(examAnswers[it.id] || '').trim()) ??
    currentPart.items[0];

  return (
    <div className="space-y-6">
      {/* Top Exam Banner */}
      <div className="rounded-2xl border border-[#c6ded4] bg-[#eef7f3] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              setSelectedExamId(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#aac9bd] bg-white px-3 py-1.5 text-xs font-bold text-[#143a30] hover:border-[#17644e]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Volver a los 3 Exámenes</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono-num text-xs font-bold text-[#143a30] bg-white border border-[#c8dbd3] rounded-lg px-3 py-1.5">
              Respondidas: {totalAnswered}/{activeExam.totalPoints}
            </span>
            <button
              type="button"
              onClick={() => resetExam(activeExam)}
              className="inline-flex items-center gap-1 rounded-xl border border-[#aac9bd] bg-white px-3 py-1.5 text-xs font-bold text-[#435b53] hover:text-rose-700"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reiniciar</span>
            </button>
            <button
              type="button"
              onClick={() => gradeFullExam(activeExam)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#17644e] px-4 py-2 text-xs font-bold text-white hover:bg-[#124f3d]"
            >
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              <span>Calificar Examen Completo</span>
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-[#17644e]">{activeExam.schoolHeader}</p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#102a24]">{activeExam.title}</h2>
        </div>

        {isExamDone && (
          <div
            role="status"
            className="rounded-xl border border-[#17644e] bg-white p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <Award className="h-6 w-6 text-[#17644e]" aria-hidden="true" />
              <div>
                <p className="text-sm font-extrabold text-[#102a24]">
                  Resultado del Examen Completo:{' '}
                  <span className="font-mono-num text-[#17644e]">
                    {fullExamScore}/{activeExam.totalPoints} ({fullExamPct}%)
                  </span>
                </p>
                <p className="text-xs text-[#435b53]">
                  Calificación guardada automáticamente en tu boleta de Notas y Reportes. Revisa cada parte para ver las correcciones.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Part 1 .. Part 10 Quick Tabs */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Partes del examen">
        {activeExam.parts.map((part, idx) => {
          const filledInPart = part.items.filter((it) => (examAnswers[it.id] || '').trim().length > 0).length;
          const isCurrent = idx === partIdx;
          const partChecked = Boolean(checkedParts[`${activeExam.id}-${part.partNumber}`]);
          return (
            <button
              key={part.partNumber}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              onClick={() => {
                stopSpeech();
                setPartIdx(idx);
                setFocusedItemId(part.items[0]?.id ?? null);
              }}
              className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                isCurrent
                  ? 'border-[#17644e] bg-[#17644e] text-white'
                  : partChecked
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : filledInPart === part.items.length
                  ? 'border-[#9ec4b6] bg-[#eef7f3] text-[#143a30]'
                  : 'border-[#d4e4dd] bg-white text-[#354c45] hover:border-[#17644e]'
              }`}
            >
              <span>Parte {part.partNumber}</span>
              <span className="ml-1 font-mono-num opacity-85">
                ({filledInPart}/{part.items.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Part Body */}
      <section className="rounded-2xl border border-[#d4e4dd] bg-white p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e6efeb] pb-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#17644e]">{currentPart.topicTag}</p>
            <h3 className="text-xl font-extrabold text-[#102a24]">{currentPart.title}</h3>
            <p className="text-sm text-[#354c45]">{currentPart.instructions}</p>
            {currentPart.ruleTip && (
              <p className="text-xs font-semibold text-[#17644e] bg-[#eef7f3] rounded-lg px-3 py-1.5 inline-block mt-1">
                {currentPart.ruleTip}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setCheckedParts((prev) => ({ ...prev, [partCheckKey]: true }));
              playTone(partCorrectCount === currentPart.items.length ? 'correct' : 'wrong', state.soundEffects);
            }}
            className="rounded-xl border border-[#17644e] bg-[#f4f9f6] px-4 py-2 text-xs font-bold text-[#17644e] hover:bg-[#e6f4ee]"
          >
            {isPartChecked
              ? `Revisada (${partCorrectCount}/${currentPart.items.length})`
              : 'Comprobar esta parte'}
          </button>
        </div>

        {/* Reading Passage (Parts 5, 7, 9, 10) */}
        {currentPart.passage && (
          <div className="rounded-xl border border-[#cddcf5] bg-[#eef4ff] p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#21487c] font-bold">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>{currentPart.passageTitle || 'Reading Text'}</span>
              </div>
              <PronounceButton text={currentPart.passage} label="Escuchar lectura" compact />
            </div>
            <div className="space-y-2.5 text-sm sm:text-base leading-relaxed text-[#102a24]" lang="en">
              {currentPart.passage.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Word Bank Chips (Part 9) */}
        {currentPart.wordBank && (
          <div className="rounded-xl border border-[#d4e4dd] bg-[#f8fbfa] p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#17644e]">
              Word Bank (haz clic en una palabra para colocarla en el espacio seleccionado)
            </p>
            <div className="flex flex-wrap gap-2">
              {currentPart.wordBank.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => {
                    if (activeFocusItem) {
                      setAnswer(activeExam.id, activeFocusItem.id, word);
                    }
                  }}
                  className="rounded-lg border border-[#aac9bd] bg-white px-3 py-1.5 text-xs font-bold text-[#102a24] hover:border-[#17644e] hover:bg-[#e6f4ee]"
                  lang="en"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reference Verb Chart (Part 8, matching Page 9 of PDF) */}
        {currentPart.showVerbChart && (
          <div className="overflow-x-auto rounded-xl border border-[#d4e4dd]">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <caption className="px-4 py-2 text-left font-bold text-[#102a24] bg-[#f4f9f6] border-b border-[#d4e4dd]">
                Verb Chart (Apoyo para Past Simple)
              </caption>
              <thead>
                <tr className="bg-[#e6f4ee] text-[#102a24]">
                  <th className="px-3 py-2 font-bold">Present simple</th>
                  <th className="px-3 py-2 font-bold">Past simple</th>
                  <th className="px-3 py-2 font-bold">Past Participle</th>
                  <th className="px-3 py-2 font-bold">Gerund</th>
                  <th className="px-3 py-2 font-bold">Spanish meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6efeb]">
                {verbForms.map((v) => (
                  <tr key={v.base}>
                    <td className="px-3 py-1.5 font-semibold" lang="en">{v.base}</td>
                    <td className="px-3 py-1.5 font-mono-num font-bold text-[#17644e]" lang="en">{v.past}</td>
                    <td className="px-3 py-1.5 font-mono-num text-[#435b53]" lang="en">{v.participle}</td>
                    <td className="px-3 py-1.5 font-mono-num text-[#435b53]" lang="en">{v.gerund}</td>
                    <td className="px-3 py-1.5 text-[#354c45]">{v.es}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* School Subject Cards Reference Sheet (Part 1, matching Page 1 of PDF) */}
        {currentPart.kind === 'subject-match' && (
          <div className="rounded-xl border border-[#d4e4dd] bg-[#f8fbfa] p-4 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#17644e]">
              Lámina de School Subjects (selecciona una pregunta abajo y haz clic en su tarjeta)
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {Object.entries(schoolCards).map(([subject, card]) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => {
                    if (activeFocusItem) {
                      setAnswer(activeExam.id, activeFocusItem.id, subject);
                    }
                  }}
                  className="rounded-xl border border-[#cbded6] bg-white p-2 text-center hover:border-[#17644e] transition-colors"
                >
                  <img src={card.src} alt={subject} className="w-full h-auto rounded mb-1" loading="lazy" />
                  <span className="block text-[11px] font-bold text-[#102a24] leading-tight" lang="en">
                    {subject}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question Items */}
        <div className="space-y-3.5">
          {currentPart.items.map((item) => {
            const val = examAnswers[item.id] || '';
            const isCorrect = isPartChecked && evaluateExamItem(item, val, currentPart.kind);
            const isActiveTarget = activeFocusItem?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setFocusedItemId(item.id)}
                className={`rounded-xl border p-4 space-y-2.5 transition-colors ${
                  isPartChecked
                    ? isCorrect
                      ? 'border-emerald-300 bg-emerald-50/60'
                      : 'border-rose-300 bg-rose-50/50'
                    : isActiveTarget
                    ? 'border-[#17644e] bg-[#f8fbfa]'
                    : 'border-[#d4e4dd] bg-white'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-sm sm:text-base text-[#102a24]" lang="en">
                    {item.prompt}{' '}
                    {item.clue ? <span className="font-mono-num text-[#17644e]">{item.clue}</span> : null}
                  </p>
                  <PronounceButton text={item.prompt.replace(/___/g, 'blank')} label="Oír" compact />
                </div>

                {/* Multiple choice (Part 4 / Part 7) */}
                {currentPart.kind === 'choice-mcq' && item.options && (
                  <div className="flex flex-wrap gap-2">
                    {item.options.map((opt, oIdx) => {
                      const chosen = normalized(val) === normalized(opt);
                      const letter = String.fromCharCode(97 + oIdx);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswer(activeExam.id, item.id, opt)}
                          className={`rounded-xl border px-3.5 py-2 text-sm font-semibold text-left transition-colors ${
                            chosen
                              ? 'border-[#17644e] bg-[#17644e] text-white'
                              : 'border-[#aac9bd] bg-white text-[#102a24] hover:border-[#17644e]'
                          }`}
                          lang="en"
                        >
                          <span className="font-mono-num mr-1.5">{letter})</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Subject selector dropdown + quick text (Part 1) */}
                {currentPart.kind === 'subject-match' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={val}
                      onChange={(e) => setAnswer(activeExam.id, item.id, e.target.value)}
                      aria-label={item.prompt}
                      className="rounded-xl border border-[#679888] bg-white px-3 py-2 text-sm font-semibold text-[#102a24]"
                    >
                      <option value="">-- Selecciona la materia --</option>
                      {Object.keys(schoolCards).map((subj) => (
                        <option key={subj} value={subj}>
                          {subj}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Text inputs (fill-blank, modal-rewrite, word-bank) */}
                {(currentPart.kind === 'fill-blank' ||
                  currentPart.kind === 'modal-rewrite' ||
                  currentPart.kind === 'word-bank') && (
                  <input
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={val}
                    onFocus={() => setFocusedItemId(item.id)}
                    onChange={(e) => setAnswer(activeExam.id, item.id, e.target.value)}
                    placeholder={
                      currentPart.kind === 'modal-rewrite'
                        ? 'Reescribe la oración completa con can o cannot...'
                        : 'Escribe tu respuesta en inglés...'
                    }
                    className="w-full max-w-xl rounded-xl border border-[#679888] bg-white px-3.5 py-2 text-sm font-medium text-[#102a24]"
                    lang="en"
                  />
                )}

                {/* Long answer (Part 5 / Part 10) */}
                {currentPart.kind === 'long-answer' && (
                  <div className="space-y-2">
                    {item.starter && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!val.trim()) {
                            setAnswer(activeExam.id, item.id, item.starter!.replace(/\.\.\.$/, ' '));
                          }
                        }}
                        className="text-xs font-bold text-[#17644e] hover:underline"
                      >
                        Usar inicio sugerido: “{item.starter}”
                      </button>
                    )}
                    <textarea
                      rows={2}
                      value={val}
                      onFocus={() => setFocusedItemId(item.id)}
                      onChange={(e) => setAnswer(activeExam.id, item.id, e.target.value)}
                      placeholder="Escribe una oración completa en inglés según el texto..."
                      className="w-full rounded-xl border border-[#679888] bg-white px-3.5 py-2 text-sm font-medium text-[#102a24]"
                      lang="en"
                    />
                  </div>
                )}

                {isPartChecked && (
                  <div className="text-xs sm:text-sm space-y-1 pt-1" role="status">
                    <p className={`font-bold flex items-center gap-1.5 ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      <span>
                        {isCorrect
                          ? 'Correcto.'
                          : `Respuesta esperada: ${item.answer}${item.alternatives?.length ? ` (o ${item.alternatives.join(' / ')})` : ''}`}
                      </span>
                    </p>
                    <p className="text-[#354c45]">{item.hint}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Part Pagination & Full Exam Grade CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#e6efeb]">
          <button
            type="button"
            disabled={partIdx === 0}
            onClick={() => {
              stopSpeech();
              const prevIdx = Math.max(0, partIdx - 1);
              setPartIdx(prevIdx);
              setFocusedItemId(activeExam.parts[prevIdx]?.items[0]?.id ?? null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#aac9bd] bg-white px-4 py-2 text-xs font-bold text-[#143a30] disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Parte anterior</span>
          </button>

          <div className="flex flex-wrap gap-2">
            {partIdx < activeExam.parts.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  const nextIdx = partIdx + 1;
                  setPartIdx(nextIdx);
                  setFocusedItemId(activeExam.parts[nextIdx]?.items[0]?.id ?? null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#17644e] px-4 py-2 text-xs font-bold text-white hover:bg-[#124f3d]"
              >
                <span>Siguiente parte (Parte {partIdx + 2})</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => gradeFullExam(activeExam)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#17644e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124f3d]"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Finalizar y Calificar Examen ({activeExam.totalPoints} pts)</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
