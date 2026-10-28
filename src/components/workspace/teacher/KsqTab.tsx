import { useEffect, useState } from 'react';
import { ksqApi } from '../../../api';
import { apiErrorMessage } from '../../../hooks/useApiError';
import { useAuth } from '../../../hooks/useAuth';
import type { KsqTest } from '../../../types';
import { Chip } from '../../ui/Chip';
import { ErrorNote } from '../../ui/ErrorNote';
import { Spinner } from '../../ui/Spinner';
import { BecomeAuthorPrompt } from './BecomeAuthorPrompt';
import { CheckPanel } from './ksq/CheckPanel';
import { KeyPanel } from './ksq/KeyPanel';
import { ResultsPanel } from './ksq/ResultsPanel';

type KsqSection = 'yoxla' | 'acar' | 'neticeler';

const sections: { id: KsqSection; label: string }[] = [
  { id: 'yoxla', label: 'Yoxla' },
  { id: 'acar', label: 'Açar' },
  { id: 'neticeler', label: 'Nəticələr' },
];

/**
 * KSQ cavab kartı yoxlaması. Bölmələr gizlədilir, silinmir — Yoxla-dakı oxunmuş
 * kartlar başqa bölməyə keçəndə itməsin.
 */
export default function KsqTab() {
  const { canPublishResources } = useAuth();

  const [tests, setTests] = useState<KsqTest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<KsqSection>('yoxla');

  useEffect(() => {
    if (!canPublishResources) return;
    let cancelled = false;

    ksqApi
      .tests()
      .then((list) => {
        if (cancelled) return;
        setTests(list);
        if (list.length === 0) setSection('acar');
      })
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'Testlər yüklənmədi.')));

    return () => {
      cancelled = true;
    };
  }, [canPublishResources]);

  if (!canPublishResources) return <BecomeAuthorPrompt />;

  function upsert(test: KsqTest) {
    setTests((current) => {
      const list = current ?? [];
      return list.some((t) => t.id === test.id)
        ? list.map((t) => (t.id === test.id ? test : t))
        : [...list, test];
    });
  }

  function remove(id: string) {
    setTests((current) => (current ?? []).filter((t) => t.id !== id));
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-brand-navy">KSQ Cavab Kartı Yoxlama</h2>
        <p className="mt-1.5 text-sm text-brand-muted">
          Açarı bir dəfə qeyd edin, şagird kartlarının şəklini çəkin — AI cavabları oxuyur, bal
          avtomatik hesablanır.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="KSQ bölmələri">
        {sections.map((s) => (
          <Chip key={s.id} active={section === s.id} onClick={() => setSection(s.id)}>
            {s.label}
          </Chip>
        ))}
      </div>

      <ErrorNote message={error} />

      {tests === null ? (
        !error && <Spinner />
      ) : (
        <>
          <div hidden={section !== 'yoxla'}>
            <CheckPanel tests={tests} onGoToKey={() => setSection('acar')} />
          </div>
          <div hidden={section !== 'acar'}>
            <KeyPanel tests={tests} onSaved={upsert} onDeleted={remove} />
          </div>
          <div hidden={section !== 'neticeler'}>
            <ResultsPanel tests={tests} active={section === 'neticeler'} />
          </div>
        </>
      )}
    </section>
  );
}
