import { Volume2 } from 'lucide-react';
import { useState } from 'react';
import { speakEnglish, stopSpeech } from '../utils/speech';

interface PronounceButtonProps {
  text: string;
  label?: string;
  slow?: boolean;
  compact?: boolean;
}

export function PronounceButton({ text, label = 'Escuchar', slow = false, compact = false }: PronounceButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakEnglish(text, slow, () => setSpeaking(false));
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={`Pronunciar en inglés${slow ? ' (lento)' : ''}: ${text}`}
      className={`inline-flex items-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
        speaking
          ? 'border-[#17644e] bg-[#17644e] text-white'
          : 'border-[#c8dbd3] bg-[#f4f9f7] text-[#143a30] hover:border-[#17644e] hover:bg-[#e6f4ee]'
      } ${compact ? 'px-2 py-1' : 'px-2.5 py-1.5'}`}
    >
      <Volume2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{speaking ? 'Detener' : label}</span>
    </button>
  );
}
