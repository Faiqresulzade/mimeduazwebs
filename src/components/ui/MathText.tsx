import { useMemo } from 'react';
import katex from 'katex';

/**
 * Sual mətnlərində `$...$` ilə əhatələnmiş LaTeX parçalarını render edir.
 * Backend mətni olduğu kimi saxlayır (CHANGELOG_EXAMS §4) — render frontend-in işidir.
 * LaTeX səhv olsa mətn olduğu kimi göstərilir, komponent çökmür.
 */
function renderSegments(text: string) {
  // $...$ (tək) və $$...$$ (blok) — kəsişməyən parçalara bölünür.
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);

  return parts.map((part, index) => {
    const isBlock = part.startsWith('$$') && part.endsWith('$$') && part.length > 4;
    const isInline = !isBlock && part.startsWith('$') && part.endsWith('$') && part.length > 2;

    if (!isBlock && !isInline) return { key: index, kind: 'text' as const, value: part };

    const formula = isBlock ? part.slice(2, -2) : part.slice(1, -1);
    try {
      return {
        key: index,
        kind: 'math' as const,
        value: katex.renderToString(formula, {
          displayMode: isBlock,
          throwOnError: false,
          output: 'html',
        }),
      };
    } catch {
      return { key: index, kind: 'text' as const, value: part };
    }
  });
}

export function MathText({ text, className = '' }: { text: string; className?: string }) {
  const segments = useMemo(() => renderSegments(text ?? ''), [text]);

  return (
    <span className={className}>
      {segments.map((segment) =>
        segment.kind === 'text' ? (
          <span key={segment.key}>{segment.value}</span>
        ) : (
          <span
            key={segment.key}
            // katex.renderToString-in çıxışı — istifadəçi mətni deyil, KaTeX-in
            // özünün sanitarlaşdırdığı HTML-dir (throwOnError: false).
            dangerouslySetInnerHTML={{ __html: segment.value }}
          />
        ),
      )}
    </span>
  );
}
