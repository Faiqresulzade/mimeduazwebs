import type { ReactNode } from 'react';
import { KSQ_LETTERS } from '../../../../lib/ksq';
import type { KsqLetter } from '../../../../types';

interface BubbleRowProps {
  number: number;
  value: KsqLetter | null;
  /** Eyni qabarcığa təkrar toxunmaq seçimi ləğv edir. */
  onChange: (value: KsqLetter | null) => void;
  /**
   * Yoxlama rejimi: düzgün cavab. Verilibsə seçim yaşıl/qırmızı rənglənir,
   * düzgün cavab isə haşiyə ilə göstərilir.
   */
  correct?: KsqLetter | null;
  /** AI bu sualı əminliklə oxumayıb. */
  unsure?: boolean;
  /** Sağ tərəfdə (məs. sualın balı). */
  aside?: ReactNode;
}

const CORRECT = 'border-[#0e7c6b] bg-[#0e7c6b] text-white';
const WRONG = 'border-[#c0392b] bg-[#c0392b] text-white';

export function BubbleRow({ number, value, onChange, correct, unsure = false, aside }: BubbleRowProps) {
  const checking = correct !== undefined;

  function bubbleClass(letter: KsqLetter) {
    const selected = value === letter;
    if (checking) {
      if (selected) return letter === correct ? CORRECT : WRONG;
      if (letter === correct) return 'border-[#0e7c6b] bg-white text-[#0e7c6b] ring-2 ring-[#0e7c6b]/40';
    } else if (selected) {
      return 'border-brand-blue bg-brand-blue text-white';
    }
    return 'border-brand-border bg-white text-brand-slate hover:border-[#c9d8ef] hover:bg-brand-hoverBg';
  }

  return (
    <div
      className={`flex items-center gap-1.5 rounded-xl px-1.5 py-1 ${
        unsure ? 'bg-paid-bg' : ''
      }`}
      title={unsure ? 'AI bu sualı dəqiq oxuya bilmədi — yoxlayın' : undefined}
    >
      <span
        className={`w-7 shrink-0 text-right font-heading text-[13px] font-bold ${
          unsure ? 'text-paid-text' : 'text-brand-muted'
        }`}
      >
        {number}
        {unsure ? '?' : ''}
      </span>
      <div className="flex gap-1">
        {KSQ_LETTERS.map((letter) => (
          <button
            key={letter}
            type="button"
            aria-label={`${number}. sual, ${letter}`}
            aria-pressed={value === letter}
            onClick={() => onChange(value === letter ? null : letter)}
            className={`h-9 w-9 rounded-full border font-heading text-[13px] font-semibold transition ${bubbleClass(
              letter,
            )}`}
          >
            {letter}
          </button>
        ))}
      </div>
      {aside && <div className="ml-auto pl-1">{aside}</div>}
    </div>
  );
}
