import { AlertTriangle, CheckCircle2, Heart, HelpCircle, PauseCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { isCorrectAnswer } from '../data/questionBanks';
import { schoolCards } from '../data/schoolCards';
import type { ActiveAttempt, AssessmentMode, Question, ReviewItem, Topic } from '../types';
import { playTone } from '../utils/speech';
import { PronounceButton } from './PronounceButton';

interface AssessmentViewProps {
  topic: Topic;
  mode: AssessmentMode;
  active: ActiveAttempt | null;
  pausedQuiz: ActiveAttempt | undefined;
  bestScore: number | undefined;
  lastRestartScore: number | undefined;
  lastResult: { points: number; max: number; review: ReviewItem[] } | null;
  restartBanner: boolean;
  soundEffects: boolean;
  onStart: (mode: AssessmentMode) => void;
  onResumeQuiz: () => void;
  onSubmitAnswer: (choice: string) => void;
  onAdvancePractice: () => void;
  onPauseAndExitQuiz: () => void;
  onGoToMode: (nextMode: AssessmentMode | 'study') => void;
  onNextTopic?: () => void;
}

export function AssessmentView({
  topic,
  mode,
  active,
  pausedQuiz,
  bestScore,
  lastRestartScore,
  lastResult,
  restartBanner,
  soundEffects,
  onStart,
  onResumeQuiz,
  onSubmitAnswer,
  onAdvancePractice,
  onPauseAndExitQuiz,
  onGoToMode,
  onNextTopic,
}: AssessmentViewProps) {
  const [typedInput, setTypedInput] = useState('');
  const isQuiz = mode === 'quiz';

  // --- RESULT SCREEN ---
  if (!active && lastResult) {
    const pct = Math.round((lastResult.points / lastResult.max) * 100);
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-[#d4e4dd] bg-[#f4f9f6] p-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#17644e]">Tu resultado</p>
          <div className="flex flex-wrap items-baseline gap-3">
            <p className="text-4xl font-extrabold font-mono-num text-[#102a24]">
              {lastResult.points} / {lastResult.max}
            </p>
            <span className="text-lg font-bold font-mono-num text-[#17644e]">({pct}%)</span>
          </div>
          <p className="text-sm text-[#354c45]">
            {pct >= 90
              ? 'Excelente dominio del tema.'
              : pct >= 70
              ? 'Buen avance. Repasa los detalles pendientes para perfeccionarlo.'
              : 'Te recomendamos revisar la explicación y repetir la serie.'}
          </p>
        </div>

        {lastResult.review.length > 0 && (
          <details open className="rounded-xl border border-[#e3ece7] bg-white p-4">
            <summary className="cursor-pointer font-bold text-[#102a24]">
              Revisar mis respuestas incorrectas ({lastResult.review.length})
            </summary>
            <ol className="mt-4 space-y-4 list-decimal pl-5">
              {lastResult.review.map((r, i) => (
                <li key={`${r.prompt}-${i}`} className="text-sm space-y-1">
                  {r.passage && (
                    <div className="rounded-lg border border-[#cddcf5] bg-[#eef4ff] p-3 text-xs text-[#142a26] mb-2">
                      {r.passage}
                    </div>
                  )}
                  <p className="font-bold text-[#102a24]" lang="en">{r.prompt}</p>
                  <p className="text-rose-700">Tu respuesta: {r.choice}</p>
                  <p className="text-emerald-800 font-semibold">Respuesta correcta: {r.correct}</p>
                  <p className="text-[#17644e]">{r.hint}</p>
                  {r.complete && <p className="text-xs text-[#435b53]" lang="en">{r.complete}</p>}
                </li>
              ))}
            </ol>
          </details>
        )}

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onStart(mode)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#17644e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124f3d]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Repetir con nuevas preguntas</span>
          </button>
          {!isQuiz && (
            <button
              type="button"
              onClick={() => onGoToMode('quiz')}
              className="rounded-xl border border-[#17644e] bg-white px-4 py-2.5 text-sm font-bold text-[#17644e] hover:bg-[#e6f4ee]"
            >
              Ir al quiz (50 pts)
            </button>
          )}
          {isQuiz && onNextTopic && (
            <button
              type="button"
              onClick={onNextTopic}
              className="rounded-xl border border-[#17644e] bg-white px-4 py-2.5 text-sm font-bold text-[#17644e] hover:bg-[#e6f4ee]"
            >
              Siguiente tema
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- INTRO SCREEN ---
  if (!active || active.mode !== mode) {
    return (
      <div className="space-y-5">
        <h3 className="text-xl font-bold text-[#102a24]">
          {isQuiz ? 'Quiz · 50 puntos' : 'Práctica · 30 puntos'}
        </h3>

        {isQuiz ? (
          <div className="space-y-3">
            <p className="text-sm text-[#354c45] leading-relaxed">
              25 preguntas de 2 puntos, sorteadas para cada intento. Encontrarás preguntas de selección y, según el tema, de respuesta escrita. Empiezas con 3 vidas y cada error consume una. Al perder la tercera, se registra el puntaje obtenido con un tope de 15/50 y se abre otro intento.
            </p>
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" aria-hidden="true" />
              <span>
                Responde por tu cuenta, sin traductor automático. Los ejemplos y las ayudas de la guía quedan fuera de la pantalla del quiz.
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#354c45] leading-relaxed">
            30 preguntas de 1 punto. Puedes escuchar la oración en inglés, abrir una pista antes de responder, ver la explicación inmediata y repasar tus errores al final.
          </p>
        )}

        {isQuiz && pausedQuiz ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-950">
              Intento guardado · Pregunta {pausedQuiz.cursor + 1} de {pausedQuiz.items.length} ·{' '}
              {3 - pausedQuiz.errors} vidas restantes.
            </p>
            <button
              type="button"
              onClick={onResumeQuiz}
              className="rounded-xl bg-[#17644e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124f3d]"
            >
              Retomar quiz
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bestScore !== undefined && (
              <p className="text-sm font-semibold text-[#17644e] font-mono-num">
                Tu mejor resultado: {bestScore}/{isQuiz ? 50 : 30} ({Math.round((bestScore / (isQuiz ? 50 : 30)) * 100)}%)
              </p>
            )}
            <button
              type="button"
              onClick={() => onStart(mode)}
              className="rounded-xl bg-[#17644e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124f3d]"
            >
              {isQuiz ? 'Empezar quiz' : 'Empezar práctica'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- ACTIVE QUESTION STAGE ---
  const item: Question = active.items[active.cursor];
  const attemptIsQuiz = active.mode === 'quiz';
  const livesLeft = 3 - active.errors;

  const handleAnswer = (val: string) => {
    const ok = isCorrectAnswer(item, val);
    playTone(ok ? 'correct' : 'wrong', soundEffects);
    setTypedInput('');
    onSubmitAnswer(val);
  };

  return (
    <div className={`space-y-5 ${attemptIsQuiz ? 'quiz-no-copy' : ''}`}>
      {/* Progress & Stats Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3ece7] pb-3">
        <div className="flex flex-wrap items-center gap-4 text-sm font-bold font-mono-num text-[#17644e]">
          <span>
            Pregunta {active.cursor + 1} de {active.items.length}
          </span>
          {attemptIsQuiz ? (
            <span className="inline-flex items-center gap-1.5 text-[#102a24]">
              <span>Vidas:</span>
              {Array.from({ length: 3 }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`h-4 w-4 ${idx < livesLeft ? 'fill-rose-600 text-rose-600' : 'text-slate-300'}`}
                  aria-hidden="true"
                />
              ))}
              <span>({livesLeft}/3)</span>
            </span>
          ) : (
            <span>Aciertos: {active.hits}</span>
          )}
        </div>

        {attemptIsQuiz && (
          <button
            type="button"
            onClick={onPauseAndExitQuiz}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#c8dbd3] bg-white px-3 py-1.5 text-xs font-bold text-[#143a30] hover:bg-[#f1f6f4]"
          >
            <PauseCircle className="h-4 w-4 text-[#17644e]" aria-hidden="true" />
            <span>Salir del quiz y guardar</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-[#e6efeb] overflow-hidden">
        <div
          className="h-full bg-[#17644e] transition-all duration-300"
          style={{ width: `${Math.round(((active.cursor + 1) / active.items.length) * 100)}%` }}
        />
      </div>

      {/* Restart Notification Banner */}
      {attemptIsQuiz && restartBanner && lastRestartScore !== undefined && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-3" role="status">
          <p className="text-sm font-bold text-amber-950">
            Perdiste las 3 vidas. Puntaje registrado: {lastRestartScore}/50. Empezaste otro intento con 3 vidas y preguntas sorteadas.
          </p>
          {active.restartReview && active.restartReview.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer font-bold text-amber-900">
                Repasar los errores del intento anterior ({active.restartReview.length})
              </summary>
              <ol className="mt-2 space-y-2 list-decimal pl-5">
                {active.restartReview.map((r, i) => (
                  <li key={`${r.prompt}-${i}`}>
                    <p className="font-bold">{r.prompt}</p>
                    <p>Tu respuesta: {r.choice} · Correcta: {r.correct}</p>
                    <p className="text-xs text-[#17644e]">{r.hint}</p>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>
      )}

      {/* Passage Block */}
      {item.passage && (
        <div className="rounded-xl border border-[#cddcf5] bg-[#eef4ff] p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-bold text-sm text-[#21487c]">{item.passageTitle || 'Read the text'}</h4>
            {!attemptIsQuiz && <PronounceButton text={item.passage} label="Escuchar texto" compact />}
          </div>
          <div className="space-y-2 text-sm text-[#102a24] leading-relaxed" lang="en">
            {item.passage.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* Word Bank */}
      {item.wordBank && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#435b53]">Word bank</p>
          <ul className="flex flex-wrap gap-1.5">
            {item.wordBank.map((w) => (
              <li key={w} lang="en" className="rounded-lg border border-[#b7d5c9] bg-[#e5f2eb] px-2.5 py-1 text-xs font-semibold">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.direction && <p className="text-sm font-semibold text-[#385a83]">{item.direction}</p>}

      {/* Question Prompt */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-xl font-bold text-[#102a24]" lang="en">
          {item.prompt}
        </h3>
        {!attemptIsQuiz && !item.picture && (
          <PronounceButton text={item.prompt} label="Escuchar" compact />
        )}
      </div>

      {/* Picture Prompt */}
      {item.picture && schoolCards[item.picture] && (
        <figure className="inline-block rounded-xl border border-[#cbded6] bg-white p-2.5 max-w-[200px]">
          <img
            src={schoolCards[item.picture].src}
            alt={`${item.picture} · ${schoolCards[item.picture].alt}`}
            className="w-full h-auto rounded-md"
          />
        </figure>
      )}

      {/* Practice Hint Drawer */}
      {!attemptIsQuiz && active.selection === null && (
        <details className="rounded-xl border border-[#e3ece7] bg-[#f8fbfa] px-4 py-2.5 text-sm">
          <summary className="cursor-pointer font-semibold text-[#17644e] inline-flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            <span>Necesito una pista</span>
          </summary>
          <p className="mt-2 text-[#354c45]">{topic.practiceCue}</p>
        </details>
      )}

      {/* Answer Controls */}
      {item.typed ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!typedInput.trim() || active.selection !== null) return;
            handleAnswer(typedInput);
          }}
          className="space-y-3 max-w-xl"
        >
          <label htmlFor="written-answer" className="block text-xs font-bold text-[#435b53]">
            {item.answerMode === 'question'
              ? 'Escribe la pregunta completa en inglés.'
              : item.answerMode === 'sentence'
              ? 'Escribe la oración completa.'
              : item.answerMode === 'blank'
              ? 'Escribe lo que va en el espacio.'
              : item.blankParts === 2
              ? 'Escribe las dos palabras en orden, separadas por un espacio.'
              : 'Escribe la respuesta en inglés.'}
          </label>
          <input
            id="written-answer"
            type="text"
            required
            maxLength={200}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            disabled={active.selection !== null}
            value={active.selection !== null ? active.selection : typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            className="w-full rounded-xl border border-[#679888] bg-white px-3.5 py-2.5 text-sm font-medium text-[#102a24] focus-visible:outline-2 focus-visible:outline-[#17644e]"
          />
          <button
            type="submit"
            disabled={active.selection !== null}
            className="rounded-xl bg-[#17644e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124f3d] disabled:opacity-50"
          >
            Confirmar respuesta
          </button>
        </form>
      ) : (
        <div
          className={
            item.imageChoices
              ? 'grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl'
              : 'grid gap-2.5 max-w-2xl'
          }
        >
          {item.options.map((option) => {
            const chosen = active.selection !== null;
            const isRight = option === item.correct;
            const isUserPick = option === active.selection;
            const style = chosen
              ? isRight
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                : isUserPick
                ? 'border-rose-600 bg-rose-50 text-rose-950'
                : 'border-[#d4e4dd] bg-white opacity-70'
              : 'border-[#aac9bd] bg-white hover:border-[#17644e] hover:bg-[#f4f9f6]';

            if (item.imageChoices && schoolCards[option]) {
              return (
                <button
                  key={option}
                  type="button"
                  disabled={chosen}
                  onClick={() => handleAnswer(option)}
                  className={`rounded-xl border p-2.5 text-center transition-colors ${style}`}
                >
                  <img
                    src={schoolCards[option].src}
                    alt={`${option} · ${schoolCards[option].alt}`}
                    className="w-full h-auto rounded-md mb-1.5"
                  />
                  <span className="block text-xs font-bold text-[#102a24]" lang="en">
                    {option}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={option}
                type="button"
                disabled={chosen}
                onClick={() => handleAnswer(option)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {/* Immediate Practice Feedback */}
      {active.selection !== null && (
        <div
          role="status"
          className={`rounded-xl border p-4 space-y-2 ${
            isCorrectAnswer(item, active.selection)
              ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
              : 'border-amber-300 bg-amber-50 text-amber-950'
          }`}
        >
          <p className="text-sm font-bold flex items-center gap-1.5">
            {isCorrectAnswer(item, active.selection) ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
            ) : null}
            <span>
              {isCorrectAnswer(item, active.selection)
                ? '¡Correcto! '
                : `La respuesta es ${item.correct}. `}
              {item.hint}
            </span>
          </p>
          {item.complete && (
            <p className="text-xs font-semibold text-[#17644e]" lang="en">
              {item.complete}
            </p>
          )}
          <div className="pt-1">
            <button
              type="button"
              onClick={onAdvancePractice}
              className="rounded-xl bg-[#17644e] px-5 py-2 text-sm font-bold text-white hover:bg-[#124f3d]"
            >
              {active.cursor + 1 === active.items.length ? 'Ver resultado' : 'Siguiente pregunta'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
