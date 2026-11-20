import { BookOpen, ExternalLink, Headphones, Play, Printer, Sparkles, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  costaRicaDays,
  extraYearVerbs,
  holidayWordBank,
  verbForms,
  vocabulary,
  worked,
} from '../data/curriculum';
import { schoolCards } from '../data/schoolCards';
import type { Topic } from '../types';
import { speakEnglish, speakText, stopSpeech } from '../utils/speech';
import { PronounceButton } from './PronounceButton';

interface TopicStudyViewProps {
  topic: Topic;
  onNavigateTab: (tab: 'verbs' | 'interactive' | 'audio' | 'practice' | 'quiz') => void;
}

export function TopicStudyView({ topic, onNavigateTab }: TopicStudyViewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  useEffect(() => {
    setAudioError(false);
    setShowTranscript(false);
    stopSpeech();
    setTtsPlaying(false);
  }, [topic.id]);

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleSegmentPlay = () => {
    const el = audioRef.current;
    if (!el || !topic.narrationTime) return;
    const [from, to] = topic.narrationTime;
    if (el.currentTime < from - 0.3 || el.currentTime >= to - 0.15) {
      el.currentTime = from;
    }
    el.playbackRate = playbackRate;
  };

  const handleSegmentTimeUpdate = () => {
    const el = audioRef.current;
    if (!el || !topic.narrationTime) return;
    const [, to] = topic.narrationTime;
    if (el.currentTime >= to) {
      el.pause();
    }
  };

  const toggleTranscriptAudio = () => {
    if (ttsPlaying) {
      stopSpeech();
      setTtsPlaying(false);
      return;
    }
    setTtsPlaying(true);
    speakText(topic.narrationTranscript, {
      lang: 'es-CR',
      rate: playbackRate,
      onEnd: () => setTtsPlaying(false),
      onError: () => setTtsPlaying(false),
    });
  };

  const handleCardSpeak = (subject: string, alt: string) => {
    setActiveCard(subject);
    speakEnglish(`${subject}. ${alt}`, false, () => setActiveCard(null));
  };

  const topicWorked = worked[topic.id] || [];
  const hasNarrationMp3 = Boolean(topic.narrationUrl && topic.narrationTime);

  return (
    <div className="space-y-8 print-clean">
      {/* Audio Explanation Block */}
      <section className="rounded-xl border border-[#d6e4dd] bg-[#f4f9f6] p-5 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-[#17644e]" aria-hidden="true" />
            <h3 className="text-lg font-bold text-[#102a24]">Escuchar la explicación del tema</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-[#435b53] mr-1">Velocidad:</span>
            {[0.85, 1, 1.15].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleRateChange(rate)}
                className={`rounded-md px-2 py-1 text-xs font-mono-num font-semibold border transition-colors ${
                  playbackRate === rate
                    ? 'border-[#17644e] bg-[#17644e] text-white'
                    : 'border-[#c8dbd3] bg-white text-[#143a30] hover:bg-[#e6f4ee]'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {hasNarrationMp3 && topic.narrationTime ? (
          <div className="space-y-2">
            <audio
              ref={audioRef}
              controls
              preload="none"
              src={`${topic.narrationUrl}#t=${topic.narrationTime[0].toFixed(2)},${topic.narrationTime[1].toFixed(2)}`}
              aria-label={`Explicación en audio de ${topic.title}`}
              onPlay={handleSegmentPlay}
              onTimeUpdate={handleSegmentTimeUpdate}
              onError={() => setAudioError(true)}
              className="w-full"
            />
            {audioError && (
              <p role="status" className="text-sm text-amber-800">
                No se pudo cargar el audio remoto; puedes usar el lector de voz o leer la transcripción.
              </p>
            )}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTranscriptAudio}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
              ttsPlaying
                ? 'border-[#17644e] bg-[#17644e] text-white'
                : 'border-[#c0d6cd] bg-white text-[#143a30] hover:bg-[#e6f4ee]'
            }`}
          >
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            <span>{ttsPlaying ? 'Detener narración' : hasNarrationMp3 ? 'Narración alterna por voz' : 'Escuchar narración guiada'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTranscript((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#c0d6cd] bg-white px-3 py-1.5 text-sm font-semibold text-[#143a30] hover:bg-[#e6f4ee]"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>{showTranscript ? 'Ocultar transcripción' : 'Leer la transcripción del audio'}</span>
          </button>
        </div>

        {showTranscript && (
          <div className="mt-3 rounded-lg border border-[#d6e4dd] bg-white p-4 text-sm leading-relaxed text-[#142a26]">
            {topic.narrationTranscript}
          </div>
        )}
      </section>

      {/* Step-by-step explanation */}
      <section>
        <h3 className="text-xl font-bold text-[#102a24] mb-4">Entiende el tema paso a paso</h3>
        <ol className="space-y-4">
          {topic.steps.map(([label, detail], idx) => (
            <li key={label} className="flex gap-3.5 rounded-xl border border-[#e3ece7] bg-white p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e6f4ee] font-mono-num text-sm font-bold text-[#17644e]">
                {idx + 1}
              </span>
              <div>
                <h4 className="font-bold text-[#102a24] mb-1">{label}</h4>
                <p className="text-sm leading-relaxed text-[#354c45]">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Visual Infographic Summary Grid */}
      <section className="rounded-xl border border-[#cddcf5] bg-[#eef4ff] p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#21487c] mb-3">
          Infografía de repaso
        </p>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topic.map.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#d7e3f7] bg-white p-3.5 flex flex-col justify-between gap-2">
              <div>
                <dt className="text-sm font-bold text-[#21487c] mb-1">{label}</dt>
                <dd className="text-sm text-[#142a26]" lang="en">
                  {value}
                </dd>
              </div>
              <div className="no-print">
                <PronounceButton text={value.replace(/·/g, '. ')} label="Pronunciar" compact />
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* Worked Examples with Bilingual + Pronunciation */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-xl font-bold text-[#102a24]">Ejemplos resueltos</h3>
          <span className="text-xs text-[#435b53] no-print">Toca “Escuchar” o “Lento” para practicar pronunciación</span>
        </div>
        <div className="grid gap-3.5 md:grid-cols-2">
          {topicWorked.map(([english, spanish, reason]) => (
            <article key={english} className="rounded-xl border border-[#d9e7e1] bg-[#f8fbfa] p-4 flex flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <p className="font-bold text-[#102a24] leading-snug" lang="en">
                  {english}
                </p>
                <p className="text-sm text-[#354c45]">{spanish}</p>
                <p className="text-xs font-medium text-[#17644e] pt-1 border-t border-[#e5efea]">{reason}</p>
              </div>
              <div className="flex items-center gap-2 no-print">
                <PronounceButton text={english.split('→').pop()?.trim() || english} label="Escuchar" compact />
                <PronounceButton text={english.split('→').pop()?.trim() || english} label="Lento" slow compact />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Topic 0 Special: 12 School Subject Cards */}
      {topic.id === 0 && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-xl font-bold text-[#102a24]">Tarjetas de School Subjects de la práctica</h3>
            <span className="text-xs text-[#435b53] no-print">Haz clic en cualquier tarjeta para escuchar su nombre</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(schoolCards).map(([subject, card]) => {
              const isPlaying = activeCard === subject;
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => handleCardSpeak(subject, card.alt)}
                  className={`group rounded-xl border bg-white p-2.5 text-left transition-all ${
                    isPlaying
                      ? 'border-[#17644e] ring-2 ring-[#17644e]/30'
                      : 'border-[#cbded6] hover:border-[#17644e]'
                  }`}
                >
                  <img
                    src={card.src}
                    alt={`${subject} · ${card.alt}`}
                    className="w-full h-auto rounded-md mb-2"
                    loading="lazy"
                  />
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[#102a24] leading-tight" lang="en">
                      {subject}
                    </span>
                    <Volume2 className="h-3.5 w-3.5 shrink-0 text-[#17644e] opacity-75 group-hover:opacity-100 no-print" aria-hidden="true" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Topics 1 & 4 Special: Core 10 Verb Forms Table + Full Year Expansion */}
      {(topic.id === 1 || topic.id === 4) && (
        <section className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-[#102a24]">Verbos de la práctica</h3>
            <p className="text-sm text-[#435b53] mt-1">
              Aprende las formas de los mismos diez verbos en presente y en pasado. Usa la forma base después de do, does, did, can y cannot.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#d4e4dd] bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <caption className="px-4 py-2.5 text-left font-bold text-[#102a24] bg-[#f4f9f6] border-b border-[#d4e4dd]">
                Formas de los diez verbos base
              </caption>
              <thead>
                <tr className="bg-[#e6f4ee] text-[#102a24]">
                  <th className="px-3 py-2.5 font-bold">Forma base</th>
                  <th className="px-3 py-2.5 font-bold">He / she / it</th>
                  <th className="px-3 py-2.5 font-bold">Past Simple</th>
                  <th className="px-3 py-2.5 font-bold">Past Participle</th>
                  <th className="px-3 py-2.5 font-bold">Gerund</th>
                  <th className="px-3 py-2.5 font-bold">Español</th>
                  <th className="px-3 py-2.5 font-bold no-print">Audio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6efeb]">
                {verbForms.map((v) => (
                  <tr key={v.base} className="hover:bg-[#f8fbfa]">
                    <td className="px-3 py-2 font-bold text-[#102a24]" lang="en">{v.base}</td>
                    <td className="px-3 py-2 font-mono-num text-[#17644e]" lang="en">{v.third}</td>
                    <td className="px-3 py-2 font-mono-num" lang="en">{v.past}</td>
                    <td className="px-3 py-2 font-mono-num text-[#435b53]" lang="en">{v.participle}</td>
                    <td className="px-3 py-2 font-mono-num text-[#435b53]" lang="en">{v.gerund}</td>
                    <td className="px-3 py-2 text-[#354c45]">{v.es}</td>
                    <td className="px-3 py-2 no-print">
                      <PronounceButton text={`${v.base}, ${v.third}, ${v.past}`} label="Oír" compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#435b53]">
            La tabla incluye participio y gerundio porque aparecen en la práctica. Para un espacio que pide pasado simple usa, por ejemplo, saw, wrote o ate.
          </p>

          <details className="rounded-xl border border-[#d4e4dd] bg-white p-4">
            <summary className="cursor-pointer font-bold text-sm text-[#17644e]">
              6 verbos adicionales para practicar Present Simple y Past Simple
            </summary>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#f1f6f4] text-[#102a24]">
                    <th className="px-3 py-2 font-bold">Base</th>
                    <th className="px-3 py-2 font-bold">3.ª Persona</th>
                    <th className="px-3 py-2 font-bold">Past Simple</th>
                    <th className="px-3 py-2 font-bold">Gerund</th>
                    <th className="px-3 py-2 font-bold">Español</th>
                    <th className="px-3 py-2 font-bold no-print">Audio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6efeb]">
                  {extraYearVerbs.map((v) => (
                    <tr key={v.base}>
                      <td className="px-3 py-2 font-bold" lang="en">{v.base}</td>
                      <td className="px-3 py-2 font-mono-num text-[#17644e]" lang="en">{v.third}</td>
                      <td className="px-3 py-2 font-mono-num" lang="en">{v.past}</td>
                      <td className="px-3 py-2 font-mono-num" lang="en">{v.gerund}</td>
                      <td className="px-3 py-2">{v.es}</td>
                      <td className="px-3 py-2 no-print">
                        <PronounceButton text={`${v.base}, ${v.past}, ${v.gerund}`} label="Oír" compact />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
      )}

      {/* Topic 4 Special: Word Bank, Sports/Holidays Vocabulary & Costa Rica Holidays */}
      {topic.id === 4 && (
        <section className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-[#102a24] mb-2">Banco de palabras de la práctica</h3>
            <ul className="flex flex-wrap gap-2">
              {holidayWordBank.map((word) => (
                <li key={word}>
                  <button
                    type="button"
                    onClick={() => speakEnglish(word)}
                    lang="en"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#b7d5c9] bg-[#e5f2eb] px-3 py-1.5 text-sm font-semibold text-[#102a24] hover:border-[#17644e]"
                  >
                    <span>{word}</span>
                    <Volume2 className="h-3.5 w-3.5 text-[#17644e] no-print" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#d4e4dd] bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <caption className="px-4 py-2.5 text-left font-bold text-[#102a24] bg-[#f4f9f6] border-b border-[#d4e4dd]">
                Vocabulario de deportes y festividades
              </caption>
              <thead>
                <tr className="bg-[#e6f4ee] text-[#102a24]">
                  <th className="px-3 py-2 font-bold">English</th>
                  <th className="px-3 py-2 font-bold">Español</th>
                  <th className="px-3 py-2 font-bold no-print">Audio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6efeb]">
                {vocabulary.map(([en, es]) => (
                  <tr key={en} className="hover:bg-[#f8fbfa]">
                    <td className="px-3 py-2 font-semibold text-[#102a24]" lang="en">{en}</td>
                    <td className="px-3 py-2 text-[#354c45]">{es}</td>
                    <td className="px-3 py-2 no-print">
                      <PronounceButton text={en} label="Oír" compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#d4e4dd] bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <caption className="px-4 py-2.5 text-left font-bold text-[#102a24] bg-[#f4f9f6] border-b border-[#d4e4dd]">
                Días festivos de Costa Rica
              </caption>
              <thead>
                <tr className="bg-[#e6f4ee] text-[#102a24]">
                  <th className="px-3 py-2 font-bold">Date</th>
                  <th className="px-3 py-2 font-bold">English</th>
                  <th className="px-3 py-2 font-bold">Español</th>
                  <th className="px-3 py-2 font-bold no-print">Audio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6efeb]">
                {costaRicaDays.map(([date, en, es]) => (
                  <tr key={date} className="hover:bg-[#f8fbfa]">
                    <td className="px-3 py-2 font-mono-num font-semibold text-[#17644e]" lang="en">{date}</td>
                    <td className="px-3 py-2 font-semibold text-[#102a24]" lang="en">{en}</td>
                    <td className="px-3 py-2 text-[#354c45]">{es}</td>
                    <td className="px-3 py-2 no-print">
                      <PronounceButton text={`${en} is on ${date}`} label="Oír" compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm no-print">
            <a
              href="https://www.mtss.go.cr/temas-laborales/feriados/feriados_calendario_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-[#17644e] underline underline-offset-2 hover:text-[#104737]"
            >
              <span>Calendario oficial de feriados de Costa Rica (MTSS)</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </p>
        </section>
      )}

      {/* Video & Action Footer */}
      <section className="border-t border-[#d4e4dd] pt-6 space-y-5 no-print">
        <div>
          <h3 className="text-lg font-bold text-[#102a24] mb-3">Video del tema</h3>
          <div className="flex flex-wrap gap-2.5">
            <a
              href={topic.video}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#aac9bd] bg-white px-4 py-2 text-sm font-bold text-[#143a30] hover:border-[#17644e] hover:bg-[#f4f9f6]"
            >
              <Play className="h-4 w-4 text-[#17644e]" aria-hidden="true" />
              <span>{topic.videoLabel}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </a>
            {topic.extraVideo && (
              <a
                href={topic.extraVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[#aac9bd] bg-white px-4 py-2 text-sm font-bold text-[#143a30] hover:border-[#17644e] hover:bg-[#f4f9f6]"
              >
                <Play className="h-4 w-4 text-[#17644e]" aria-hidden="true" />
                <span>{topic.extraVideo.label}</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => onNavigateTab('interactive')}
            className="inline-flex items-center gap-2 rounded-xl border border-[#17644e] bg-white px-4 py-2.5 text-sm font-bold text-[#17644e] hover:bg-[#e6f4ee]"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Juegos y Tarjetas</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('audio')}
            className="inline-flex items-center gap-2 rounded-xl border border-[#17644e] bg-white px-4 py-2.5 text-sm font-bold text-[#17644e] hover:bg-[#e6f4ee]"
          >
            <Headphones className="h-4 w-4" aria-hidden="true" />
            <span>Audio Lab y Dictado</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('practice')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#17644e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#124f3d]"
          >
            <span>Ir a la práctica (30 pts)</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-[#c8dbd3] bg-white px-4 py-2.5 text-sm font-semibold text-[#435b53] hover:text-[#102a24]"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>Imprimir explicación e infografía</span>
          </button>
        </div>
      </section>
    </div>
  );
}
