// Instant Web Speech API pronunciation engine & subtle audio feedback

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeech(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore browser speech cancel edge errors
  }
  currentUtterance = null;
}

function pickVoice(langPrefix: string): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const exact = voices.find(
    (v) => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()) && v.localService
  );
  if (exact) return exact;
  return voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase())) ?? null;
}

export function speakText(
  text: string,
  options?: {
    lang?: 'en-US' | 'en-GB' | 'es-CR' | 'es-ES';
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  if (!isSpeechSupported()) {
    options?.onError?.();
    return;
  }
  const clean = text.replace(/___/g, 'blank').trim();
  if (!clean) return;

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(clean);
  const lang = options?.lang ?? 'en-US';
  utterance.lang = lang;
  utterance.rate = options?.rate ?? 0.96;
  utterance.pitch = 1;

  const voice = pickVoice(lang.slice(0, 2));
  if (voice) utterance.voice = voice;

  utterance.onstart = () => options?.onStart?.();
  utterance.onend = () => {
    currentUtterance = null;
    options?.onEnd?.();
  };
  utterance.onerror = () => {
    currentUtterance = null;
    options?.onError?.();
  };

  currentUtterance = utterance;
  try {
    window.speechSynthesis.speak(utterance);
  } catch {
    options?.onError?.();
  }
}

export function speakEnglish(text: string, slow = false, onDone?: () => void): void {
  speakText(text, {
    lang: 'en-US',
    rate: slow ? 0.72 : 0.96,
    onEnd: onDone,
    onError: onDone,
  });
}

export function speakParagraphs(
  paragraphs: string[],
  rate = 0.94,
  onIndex?: (idx: number) => void,
  onFinish?: () => void
): void {
  if (!isSpeechSupported() || !paragraphs.length) {
    onFinish?.();
    return;
  }
  stopSpeech();
  let cursor = 0;

  const next = () => {
    if (cursor >= paragraphs.length) {
      onIndex?.(-1);
      onFinish?.();
      return;
    }
    const idx = cursor;
    cursor += 1;
    onIndex?.(idx);
    const u = new SpeechSynthesisUtterance(paragraphs[idx]);
    u.lang = 'en-US';
    u.rate = rate;
    const v = pickVoice('en');
    if (v) u.voice = v;
    u.onend = next;
    u.onerror = () => {
      onIndex?.(-1);
      onFinish?.();
    };
    currentUtterance = u;
    window.speechSynthesis.speak(u);
  };

  next();
}

export function playTone(kind: 'correct' | 'wrong', enabled = true): void {
  if (!enabled || typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (kind === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.09);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.23);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(175, now + 0.14);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.21);
    }
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 320);
  } catch {
    // Ignore audio context restrictions
  }
}

export function hasActiveSpeech(): boolean {
  return currentUtterance !== null;
}
