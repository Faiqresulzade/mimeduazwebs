import { fileUrl } from '../../api';
import { MathText } from '../ui/MathText';

interface ExamQuestionCardProps {
  index: number;
  questionText: string;
  imageUrl: string | null;
  options: string[];
  selectedIndex: number | null;
  /** Nəticə ekranında doludur — cavab açarı göstərilir. */
  correctOptionIndex?: number;
  disabled?: boolean;
  onSelect?: (optionIndex: number) => void;
}

export function ExamQuestionCard({
  index,
  questionText,
  imageUrl,
  options,
  selectedIndex,
  correctOptionIndex,
  disabled = false,
  onSelect,
}: ExamQuestionCardProps) {
  const reviewing = correctOptionIndex !== undefined;

  return (
    <article className="card">
      <div className="flex gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-chipBg font-heading text-[13px] font-bold text-brand-blue">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          {questionText && (
            <MathText
              text={questionText}
              className="block text-[15px] leading-relaxed text-brand-navy"
            />
          )}

          {imageUrl && (
            <img
              src={fileUrl(imageUrl)}
              alt={`Sual ${index + 1}`}
              loading="lazy"
              className="mt-3 max-h-80 w-auto rounded-xl border border-brand-border"
            />
          )}
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {options.map((option, optionIndex) => {
          const selected = selectedIndex === optionIndex;
          const correct = reviewing && correctOptionIndex === optionIndex;
          const wrongPick = reviewing && selected && !correct;

          let tone = 'border-brand-border bg-white hover:bg-brand-hoverBg';
          if (correct) tone = 'border-free-text bg-free-bg';
          else if (wrongPick) tone = 'border-danger-text bg-danger-bg';
          else if (selected) tone = 'border-brand-blue bg-brand-chipBg';

          return (
            <li key={optionIndex}>
              <button
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => onSelect?.(optionIndex)}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-default ${tone}`}
              >
                <span className="font-heading text-[13px] font-bold text-brand-faint">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <MathText text={option} className="min-w-0 flex-1 text-brand-ink" />
                {correct && (
                  <span className="font-heading text-[13px] font-bold text-free-text">
                    Doğru
                  </span>
                )}
                {wrongPick && (
                  <span className="font-heading text-[13px] font-bold text-danger-text">
                    Sizin cavab
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {reviewing && selectedIndex === null && (
        <p className="mt-3 text-xs text-brand-faint">Bu suala cavab verilməyib.</p>
      )}
    </article>
  );
}
