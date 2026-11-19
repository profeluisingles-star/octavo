import { Check, Headphones, Layers, Puzzle, RefreshCw, Sparkles, Volume2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { verbForms } from '../data/curriculum';
import {
  audioDrills,
  flashcards,
  matchPairsByTopic,
  sentenceBuildsByTopic,
} from '../data/interactiveActivities';
import { isCorrectAnswer, mix, normalized, verbSetsByTopic } from '../data/questionBanks';
import type { GradeEventType, Topic } from '../types';
import { playTone, speakEnglish } from '../utils/speech';
import { PronounceButton } from './PronounceButton';

interface InteractivePracticeViewProps {
  topic: Topic;
  mode: 'interactive' | 'audio' | 'verbs';
  soundEffects: boolean;
  flashcardsMastered: Record<string, boolean>;
  onToggleFlashcardMastered: (cardId: string, mastered: boolean) => void;
  onRecordProgress: (type: GradeEventType, activity: string, score: number, max: number, details?: string) => void;
}

export function InteractivePracticeView({
  topic,
  mode,
  soundEffects,
  flashcardsMastered,
  onToggleFlashcardMastered,
  onRecordProgress,
}: InteractivePracticeViewProps) {
  const [subMode, setSubMode] = useState<'flashcards' | 'match' | 'builder'>('flashcards');

  // Flashcards state
  const topicCards = flashcards.filter((c) => c.topicId === topic.id);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Pair Match state
  const pairs = matchPairsByTopic[topic.id] || [];
  const [leftItems, setLeftItems] = useState<{ id: string; text: string; spoken: string }[]>([]);
  const [rightItems, setRightItems] = useState<{ id: string; text: string }[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [matchWrongPair, setMatchWrongPair] = useState<[string, string] | null>(null);
  const [matchMoves, setMatchMoves] = useState(0);

  // Sentence Builder state
  const builders = sentenceBuildsByTopic[topic.id] || [];
  const [builderIdx, setBuilderIdx] = useState(0);
  const [builtTokens, setBuiltTokens] = useState<number[]>([]);
  const [builderStatus, setBuilderStatus] = useState<'idle' | 'ok' | 'wrong'>('idle');

  // Audio Lab state
  const topicAudio = audioDrills.filter((a) => a.topicId === topic.id);
  const [audioIdx, setAudioIdx] = useState(0);
  const [audioInput, setAudioInput] = useState('');
  const [audioChoice, setAudioChoice] = useState<string | null>(null);
  const [audioChecked, setAudioChecked] = useState<boolean | null>(null);
  const [audioScore, setAudioScore] = useState(0);
  const [audioDone, setAudioDone] = useState(false);

  // Verbs Drill state
  const verbGroups = verbSetsByTopic[topic.id] || [];
  const [verbSetIdx, setVerbSetIdx] = useState(0);
  const [verbStep, setVerbStep] = useState(0);
  const [verbCorrect, setVerbCorrect] = useState(0);
  const [verbInput, setVerbInput] = useState('');
  const [verbAnswered, setVerbAnswered] = useState<{ ok: boolean; firstAttemptUsed: boolean } | null>(null);
  const [verbFirstTry, setVerbFirstTry] = useState(true);

  const resetMatch = () => {
    setLeftItems(mix(pairs.map((p) => ({ id: p.id, text: p.left, spoken: p.spoken }))));
    setRightItems(mix(pairs.map((p) => ({ id: p.id, text: p.right }))));
    setSelectedLeft(null);
    setMatchedIds(new Set());
    setMatchWrongPair(null);
    setMatchMoves(0);
  };

  useEffect(() => {
    setCardIdx(0);
    setFlipped(false);
    resetMatch();
    setBuilderIdx(0);
    setBuiltTokens([]);
    setBuilderStatus('idle');
    setAudioIdx(0);
    setAudioInput('');
    setAudioChoice(null);
    setAudioChecked(null);
    setAudioScore(0);
    setAudioDone(false);
    setVerbSetIdx(0);
    setVerbStep(0);
    setVerbCorrect(0);
    setVerbInput('');
    setVerbAnswered(null);
    setVerbFirstTry(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id]);

  // --- AUDIO LAB ---
  if (mode === 'audio') {
    if (!topicAudio.length) {
      return <p className="text-sm text-[#435b53]">No hay ejercicios de audio disponibles para este tema.</p>;
    }

    if (audioDone) {
      return (
        <div className="rounded-xl border border-[#d4e4dd] bg-[#f8fbfa] p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#17644e]">Audio Lab · Resultado</p>
          <p className="text-3xl font-extrabold font-mono-num text-[#102a24]">
            {audioScore} / {topicAudio.length}
          </p>
          <p className="text-sm text-[#354c45]">
            Resultado registrado en tiempo real para tu reporte de comprensión auditiva y dictado.
          </p>
          <button
            type="button"
            onClick={() => {
              setAudioIdx(0);
              setAudioInput('');
              setAudioChoice(null);
              setAudioChecked(null);
              setAudioScore(0);
              setAudioDone(false);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#17644e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124f3d]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Repetir Audio Lab</span>
          </button>
        </div>
      );
    }

    const currentAudio = topicAudio[audioIdx];

    const submitAudioDictation = (e: React.FormEvent) => {
      e.preventDefault();
      if (!audioInput.trim() || audioChecked !== null) return;
      const candidate = normalized(audioInput);
      const accepted = [currentAudio.correctAnswer, ...(currentAudio.alternatives || [])].some(
        (ans) => normalized(ans) === candidate
      );
      setAudioChecked(accepted);
      playTone(accepted ? 'correct' : 'wrong', soundEffects);
      if (accepted) setAudioScore((s) => s + 1);
    };

    const chooseAudioOption = (opt: string) => {
      if (audioChecked !== null) return;
      const accepted = opt === currentAudio.correctAnswer;
      setAudioChoice(opt);
      setAudioChecked(accepted);
      playTone(accepted ? 'correct' : 'wrong', soundEffects);
      if (accepted) setAudioScore((s) => s + 1);
    };

    const nextAudio = () => {
      if (audioIdx + 1 >= topicAudio.length) {
        setAudioDone(true);
        onRecordProgress('Audio Lab', topic.title, audioScore, topicAudio.length, 'Comprensión auditiva y dictado');
        return;
      }
      setAudioIdx((i) => i + 1);
      setAudioInput('');
      setAudioChoice(null);
      setAudioChecked(null);
    };

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3ece7] pb-3">
          <div>
            <h3 className="text-lg font-bold text-[#102a24]">Laboratorio de Audio y Dictado</h3>
            <p className="text-sm text-[#435b53]">
              Escucha el audio en inglés a velocidad normal o lenta y completa el ejercicio.
            </p>
          </div>
          <div className="font-mono-num text-sm font-bold text-[#17644e]">
            Ejercicio {audioIdx + 1} de {topicAudio.length} · Aciertos: {audioScore}
          </div>
        </div>

        <div className="rounded-xl border border-[#d4e4dd] bg-[#f4f9f6] p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => speakEnglish(currentAudio.spokenText, false)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#17644e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124f3d]"
            >
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              <span>Reproducir audio (Normal)</span>
            </button>
            <button
              type="button"
              onClick={() => speakEnglish(currentAudio.spokenText, true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#aac9bd] bg-white px-4 py-2.5 text-sm font-bold text-[#143a30] hover:bg-[#e6f4ee]"
            >
              <Headphones className="h-4 w-4 text-[#17644e]" aria-hidden="true" />
              <span>Escuchar lento (0.72x)</span>
            </button>
          </div>

          <p className="font-bold text-[#102a24]">{currentAudio.questionPrompt}</p>

          {currentAudio.mode === 'comprehension' && currentAudio.options ? (
            <div className="grid gap-2.5 max-w-xl">
              {currentAudio.options.map((opt) => {
                const isChosen = audioChoice === opt;
                const isRight = opt === currentAudio.correctAnswer;
                const btnStyle =
                  audioChecked !== null
                    ? isRight
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                      : isChosen
                      ? 'border-rose-600 bg-rose-50 text-rose-950'
                      : 'border-[#d4e4dd] bg-white opacity-70'
                    : 'border-[#aac9bd] bg-white hover:border-[#17644e] hover:bg-[#f0f7f4]';
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={audioChecked !== null}
                    onClick={() => chooseAudioOption(opt)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={submitAudioDictation} className="space-y-3 max-w-xl">
              <label htmlFor="audio-dictation-input" className="block text-xs font-bold text-[#435b53]">
                Escribe la oración completa en inglés:
              </label>
              <input
                id="audio-dictation-input"
                type="text"
                value={audioInput}
                onChange={(e) => setAudioInput(e.target.value)}
                disabled={audioChecked !== null}
                autoComplete="off"
                spellCheck={false}
                placeholder="Write what you hear..."
                className="w-full rounded-xl border border-[#74978a] bg-white px-3.5 py-2.5 text-sm font-medium text-[#102a24] focus-visible:outline-2 focus-visible:outline-[#17644e]"
              />
              {audioChecked === null && (
                <button
                  type="submit"
                  className="rounded-xl bg-[#17644e] px-4 py-2 text-sm font-bold text-white hover:bg-[#124f3d]"
                >
                  Comprobar dictado
                </button>
              )}
            </form>
          )}

          {audioChecked !== null && (
            <div
              role="status"
              className={`rounded-xl border p-4 text-sm space-y-1.5 ${
                audioChecked
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                  : 'border-amber-300 bg-amber-50 text-amber-950'
              }`}
            >
              <p className="font-bold flex items-center gap-1.5">
                {audioChecked ? <Check className="h-4 w-4 text-emerald-700" /> : <X className="h-4 w-4 text-rose-700" />}
                <span>{audioChecked ? '¡Correcto!' : `Respuesta esperada: ${currentAudio.correctAnswer}`}</span>
              </p>
              <p lang="en" className="font-semibold">
                Audio: “{currentAudio.spokenText}”
              </p>
              <p className="text-xs opacity-90">
                Significado: {currentAudio.spanishMeaning} · {currentAudio.hint}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={nextAudio}
                  className="rounded-xl bg-[#17644e] px-4 py-2 text-sm font-bold text-white hover:bg-[#124f3d]"
                >
                  {audioIdx + 1 >= topicAudio.length ? 'Finalizar Audio Lab' : 'Siguiente audio'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VERBS & PDF REWRITE DRILL ---
  if (mode === 'verbs') {
    if (!verbGroups.length) {
      return <p className="text-sm text-[#435b53]">Este tema no tiene serie dedicada de verbos. Usa la pestaña de Juegos o Práctica.</p>;
    }
    const activeGroup = verbGroups[verbSetIdx] || verbGroups[0];
    const isFinished = verbStep >= activeGroup.items.length;
    const currentItem = !isFinished ? activeGroup.items[verbStep] : null;

    const handleVerbSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentItem || !verbInput.trim()) return;
      const ok = isCorrectAnswer({ typed: true, correct: currentItem.correct, alternatives: currentItem.alternatives }, verbInput);
      playTone(ok ? 'correct' : 'wrong', soundEffects);
      if (verbFirstTry && ok) {
        setVerbCorrect((c) => c + 1);
      }
      setVerbFirstTry(false);
      setVerbAnswered({ ok, firstAttemptUsed: verbFirstTry });
    };

    const handleVerbNext = () => {
      const nextStep = verbStep + 1;
      setVerbStep(nextStep);
      setVerbInput('');
      setVerbAnswered(null);
      setVerbFirstTry(true);
      if (nextStep >= activeGroup.items.length) {
        onRecordProgress('Verbos', activeGroup.label, verbCorrect, activeGroup.items.length, topic.title);
      }
    };

    return (
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-bold text-[#102a24]">
            {topic.id === 3 ? 'Reescritura del PDF' : 'Verbos de la práctica'}
          </h3>
        </div>

        {topic.id !== 3 && (
          <details className="rounded-xl border border-[#d4e4dd] bg-[#f8fbfa] p-4">
            <summary className="cursor-pointer text-sm font-bold text-[#17644e]">
              Consultar la tabla de diez verbos base
            </summary>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#e6f4ee] text-[#102a24]">
                    <th className="px-2.5 py-2 font-bold">Base</th>
                    <th className="px-2.5 py-2 font-bold">He/she/it</th>
                    <th className="px-2.5 py-2 font-bold">Past</th>
                    <th className="px-2.5 py-2 font-bold">Participle</th>
                    <th className="px-2.5 py-2 font-bold">Gerund</th>
                    <th className="px-2.5 py-2 font-bold">Español</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ece7]">
                  {verbForms.map((v) => (
                    <tr key={v.base}>
                      <td className="px-2.5 py-1.5 font-bold" lang="en">{v.base}</td>
                      <td className="px-2.5 py-1.5 font-mono-num" lang="en">{v.third}</td>
                      <td className="px-2.5 py-1.5 font-mono-num" lang="en">{v.past}</td>
                      <td className="px-2.5 py-1.5 font-mono-num" lang="en">{v.participle}</td>
                      <td className="px-2.5 py-1.5 font-mono-num" lang="en">{v.gerund}</td>
                      <td className="px-2.5 py-1.5">{v.es}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}

        <div className="flex flex-wrap gap-2">
          {verbGroups.map((g, i) => (
            <button
              key={g.label}
              type="button"
              onClick={() => {
                setVerbSetIdx(i);
                setVerbStep(0);
                setVerbCorrect(0);
                setVerbInput('');
                setVerbAnswered(null);
                setVerbFirstTry(true);
              }}
              className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                verbSetIdx === i
                  ? 'border-[#17644e] bg-[#17644e] text-white'
                  : 'border-[#c8dbd3] bg-white text-[#143a30] hover:bg-[#e6f4ee]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-[#d4e4dd] bg-white p-5 space-y-4">
          <div>
            <h4 className="font-bold text-[#102a24]">{activeGroup.label}</h4>
            <p className="text-sm text-[#435b53]">{activeGroup.intro}</p>
          </div>

          {isFinished ? (
            <div className="space-y-4">
              <p className="text-2xl font-extrabold font-mono-num text-[#17644e]">
                Primer intento correcto: {verbCorrect} de {activeGroup.items.length}
              </p>
              <button
                type="button"
                onClick={() => {
                  setVerbStep(0);
                  setVerbCorrect(0);
                  setVerbInput('');
                  setVerbAnswered(null);
                  setVerbFirstTry(true);
                }}
                className="rounded-xl bg-[#17644e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#124f3d]"
              >
                Repetir esta serie
              </button>
            </div>
          ) : currentItem ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#17644e] font-mono-num">
                  Ejercicio {verbStep + 1} de {activeGroup.items.length}
                </span>
                <PronounceButton text={currentItem.complete || currentItem.correct} label="Escuchar modelo" compact />
              </div>

              {currentItem.direction && <p className="text-sm text-[#435b53]">{currentItem.direction}</p>}
              <p className="text-lg font-bold text-[#102a24]" lang="en">
                {currentItem.prompt}
              </p>

              <form onSubmit={handleVerbSubmit} className="space-y-3 max-w-lg">
                <label htmlFor="verb-drill-input" className="block text-xs font-bold text-[#435b53]">
                  {currentItem.answerMode === 'blank'
                    ? 'Escribe lo que va en el espacio.'
                    : 'Escribe la oración completa.'}
                </label>
                <input
                  id="verb-drill-input"
                  type="text"
                  required
                  value={verbInput}
                  onChange={(e) => setVerbInput(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-xl border border-[#679888] px-3.5 py-2.5 text-sm font-medium text-[#102a24] focus-visible:outline-2 focus-visible:outline-[#17644e]"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-[#17644e] px-4 py-2 text-sm font-bold text-white hover:bg-[#124f3d]"
                  >
                    Comprobar
                  </button>
                  {verbAnswered && (
                    <button
                      type="button"
                      onClick={handleVerbNext}
                      className="rounded-xl border border-[#17644e] bg-[#e6f4ee] px-4 py-2 text-sm font-bold text-[#17644e] hover:bg-[#d6ede3]"
                    >
                      {verbStep + 1 === activeGroup.items.length ? 'Ver resultado' : 'Siguiente ejercicio'}
                    </button>
                  )}
                </div>
              </form>

              {verbAnswered && (
                <div
                  role="status"
                  className={`rounded-xl border p-3.5 text-sm ${
                    verbAnswered.ok
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                      : 'border-amber-300 bg-amber-50 text-amber-950'
                  }`}
                >
                  <p className="font-bold">
                    {verbAnswered.ok ? 'Correcto. ' : `Respuesta: ${currentItem.correct} · `}
                    {currentItem.hint}
                  </p>
                  <p className="text-xs font-semibold mt-1" lang="en">
                    Oración completa: {currentItem.complete || currentItem.correct}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // --- INTERACTIVE SUITE: FLASHCARDS / MATCH PAIRS / SENTENCE BUILDER ---
  const currentCard = topicCards[cardIdx];

  const handleLeftPick = (id: string) => {
    if (matchedIds.has(id)) return;
    setSelectedLeft(id);
    setMatchWrongPair(null);
  };

  const handleRightPick = (id: string) => {
    if (!selectedLeft || matchedIds.has(id)) return;
    setMatchMoves((m) => m + 1);
    if (selectedLeft === id) {
      const next = new Set(matchedIds);
      next.add(id);
      setMatchedIds(next);
      setSelectedLeft(null);
      playTone('correct', soundEffects);
      const found = pairs.find((p) => p.id === id);
      if (found) speakEnglish(found.spoken);
      if (next.size === pairs.length) {
        onRecordProgress('Flashcards', `${topic.title} · Emparejar`, pairs.length, pairs.length, `${matchMoves + 1} intentos`);
      }
    } else {
      playTone('wrong', soundEffects);
      setMatchWrongPair([selectedLeft, id]);
      setTimeout(() => {
        setMatchWrongPair(null);
        setSelectedLeft(null);
      }, 650);
    }
  };

  const activeBuilder = builders[builderIdx];
  const assembledSentence = activeBuilder ? builtTokens.map((i) => activeBuilder.tokens[i]).join(' ') : '';

  const checkBuilder = () => {
    if (!activeBuilder) return;
    const ok = normalized(assembledSentence) === normalized(activeBuilder.target);
    setBuilderStatus(ok ? 'ok' : 'wrong');
    playTone(ok ? 'correct' : 'wrong', soundEffects);
    if (ok) speakEnglish(activeBuilder.target);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 border-b border-[#e3ece7] pb-3">
        <button
          type="button"
          onClick={() => setSubMode('flashcards')}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold ${
            subMode === 'flashcards'
              ? 'border-[#17644e] bg-[#17644e] text-white'
              : 'border-[#c8dbd3] bg-white text-[#143a30] hover:bg-[#e6f4ee]'
          }`}
        >
          <Layers className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Tarjetas de Repaso ({topicCards.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubMode('match')}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold ${
            subMode === 'match'
              ? 'border-[#17644e] bg-[#17644e] text-white'
              : 'border-[#c8dbd3] bg-white text-[#143a30] hover:bg-[#e6f4ee]'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Juego Emparejar ({pairs.length} pares)</span>
        </button>

        <button
          type="button"
          onClick={() => setSubMode('builder')}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold ${
            subMode === 'builder'
              ? 'border-[#17644e] bg-[#17644e] text-white'
              : 'border-[#c8dbd3] bg-white text-[#143a30] hover:bg-[#e6f4ee]'
          }`}
        >
          <Puzzle className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Constructor de Oraciones</span>
        </button>
      </div>

      {/* FLASHCARDS */}
      {subMode === 'flashcards' && currentCard && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono-num text-[#435b53]">
            <span>Tarjeta {cardIdx + 1} de {topicCards.length} · {currentCard.category}</span>
            <span>Dominadas: {topicCards.filter((c) => flashcardsMastered[c.id]).length}/{topicCards.length}</span>
          </div>

          <div
            onClick={() => setFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFlipped((f) => !f);
              }
            }}
            className="cursor-pointer rounded-2xl border border-[#c0d6cd] bg-[#f8fbfa] p-6 min-h-[190px] flex flex-col justify-between transition-colors hover:border-[#17644e]"
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#17644e]">
              <span>{flipped ? 'Respuesta y Ejemplo' : 'Concepto / Regla (Haz clic para voltear)'}</span>
              <span>{flashcardsMastered[currentCard.id] ? '✓ Dominada' : 'En estudio'}</span>
            </div>

            <div className="py-4">
              {!flipped ? (
                <p className="text-xl font-bold text-[#102a24]" lang="en">
                  {currentCard.front}
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xl font-extrabold text-[#17644e]">{currentCard.back}</p>
                  <p className="text-sm font-semibold text-[#102a24]" lang="en">
                    Ejemplo: {currentCard.example}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
              <PronounceButton text={currentCard.example} label="Escuchar ejemplo" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleFlashcardMastered(currentCard.id, !flashcardsMastered[currentCard.id])}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                    flashcardsMastered[currentCard.id]
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-[#c0d6cd] bg-white text-[#143a30]'
                  }`}
                >
                  {flashcardsMastered[currentCard.id] ? '✓ Ya la domino' : 'Marcar como dominada'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFlipped(false);
                    setCardIdx((i) => (i + 1) % topicCards.length);
                  }}
                  className="rounded-lg bg-[#17644e] px-3 py-1.5 text-xs font-bold text-white"
                >
                  Siguiente tarjeta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAIR MATCH */}
      {subMode === 'match' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-[#435b53]">
              Selecciona una pista de la columna izquierda y su pareja exacta de la derecha.
            </p>
            <div className="flex items-center gap-3 font-mono-num text-xs font-bold text-[#17644e]">
              <span>Pares: {matchedIds.size}/{pairs.length}</span>
              <span>Intentos: {matchMoves}</span>
              <button
                type="button"
                onClick={resetMatch}
                className="rounded-lg border border-[#c0d6cd] bg-white px-2.5 py-1 text-xs font-semibold text-[#143a30]"
              >
                Reiniciar
              </button>
            </div>
          </div>

          {matchedIds.size === pairs.length && pairs.length > 0 && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-950">
              ¡Excelente! Completaste los {pairs.length} pares en {matchMoves} intentos.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              {leftItems.map((item) => {
                const isMatched = matchedIds.has(item.id);
                const isSelected = selectedLeft === item.id;
                const isWrong = matchWrongPair?.[0] === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleLeftPick(item.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      isMatched
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900 opacity-75'
                        : isWrong
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : isSelected
                        ? 'border-[#17644e] bg-[#17644e] text-white'
                        : 'border-[#c8dbd3] bg-white text-[#102a24] hover:border-[#17644e]'
                    }`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              {rightItems.map((item) => {
                const isMatched = matchedIds.has(item.id);
                const isWrong = matchWrongPair?.[1] === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isMatched || !selectedLeft}
                    onClick={() => handleRightPick(item.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      isMatched
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900 opacity-75'
                        : isWrong
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-[#c8dbd3] bg-white text-[#102a24] hover:border-[#17644e] disabled:opacity-70'
                    }`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SENTENCE BUILDER */}
      {subMode === 'builder' && activeBuilder && (
        <div className="rounded-xl border border-[#d4e4dd] bg-[#f8fbfa] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-[#102a24]">{activeBuilder.instruction}</h4>
              <p className="text-xs text-[#435b53]">{activeBuilder.spanish}</p>
            </div>
            {builders.length > 1 && (
              <div className="flex gap-1.5">
                {builders.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setBuilderIdx(i);
                      setBuiltTokens([]);
                      setBuilderStatus('idle');
                    }}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${
                      builderIdx === i ? 'border-[#17644e] bg-[#17644e] text-white' : 'border-[#c0d6cd] bg-white'
                    }`}
                  >
                    Reto {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-h-[56px] rounded-xl border border-dashed border-[#8cb3a4] bg-white p-3 flex flex-wrap gap-2 items-center">
            {builtTokens.length === 0 ? (
              <span className="text-xs text-[#647d75]">Toca las palabras de abajo en orden para construir la oración...</span>
            ) : (
              builtTokens.map((tokIdx, pos) => (
                <button
                  key={`${tokIdx}-${pos}`}
                  type="button"
                  onClick={() => {
                    setBuiltTokens((prev) => prev.filter((_, p) => p !== pos));
                    setBuilderStatus('idle');
                  }}
                  lang="en"
                  className="rounded-lg border border-[#17644e] bg-[#e6f4ee] px-3 py-1.5 text-sm font-bold text-[#102a24]"
                >
                  {activeBuilder.tokens[tokIdx]}
                </button>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {activeBuilder.tokens.map((tok, i) => {
              const used = builtTokens.includes(i);
              return (
                <button
                  key={`${tok}-${i}`}
                  type="button"
                  disabled={used}
                  onClick={() => {
                    setBuiltTokens((prev) => [...prev, i]);
                    setBuilderStatus('idle');
                  }}
                  lang="en"
                  className="rounded-lg border border-[#c8dbd3] bg-white px-3 py-1.5 text-sm font-semibold text-[#102a24] hover:border-[#17644e] disabled:opacity-35"
                >
                  {tok}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={checkBuilder}
              disabled={builtTokens.length !== activeBuilder.tokens.length}
              className="rounded-xl bg-[#17644e] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Comprobar oración
            </button>
            <button
              type="button"
              onClick={() => {
                setBuiltTokens([]);
                setBuilderStatus('idle');
              }}
              className="rounded-xl border border-[#c8dbd3] bg-white px-3.5 py-2 text-sm font-semibold text-[#435b53]"
            >
              Limpiar
            </button>
            <PronounceButton text={activeBuilder.target} label="Oír meta" />
          </div>

          {builderStatus !== 'idle' && (
            <div
              role="status"
              className={`rounded-xl border p-3.5 text-sm ${
                builderStatus === 'ok'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                  : 'border-amber-300 bg-amber-50 text-amber-950'
              }`}
            >
              {builderStatus === 'ok' ? (
                <p className="font-bold">¡Excelente orden! “{activeBuilder.target}”</p>
              ) : (
                <p className="font-bold">Pista: {activeBuilder.tip}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
