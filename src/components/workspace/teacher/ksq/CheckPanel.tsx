import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { ApiError, ksqApi } from '../../../../api';
import { apiErrorMessage } from '../../../../hooks/useApiError';
import { useToast } from '../../../../hooks/useToast';
import { downscaleImage, keyReady, normalize, readyVariants, variantKey } from '../../../../lib/ksq';
import type { KsqTest, SaveKsqResultRequest } from '../../../../types';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { ScanCard } from './ScanCard';
import { hasAnyAnswer, SCAN_CONCURRENCY, type Scan } from './scan';

interface CheckPanelProps {
  tests: KsqTest[];
  onGoToKey: () => void;
}

function scanErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 0) {
    return 'Şəbəkə xətası — internet bağlantısını yoxlayıb yenidən cəhd edin.';
  }
  return apiErrorMessage(error, 'Kart oxunmadı. Cavabları əl ilə qeyd edə bilərsiniz.');
}

export function CheckPanel({ tests, onGoToKey }: CheckPanelProps) {
  const { toast } = useToast();

  const usableTests = useMemo(() => tests.filter((t) => readyVariants(t).length > 0), [tests]);

  const [testId, setTestId] = useState(() => usableTests[0]?.id ?? '');
  const [sinif, setSinif] = useState('');
  const [scans, setScans] = useState<Scan[]>([]);
  const [bulkSaving, setBulkSaving] = useState(false);

  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const test = usableTests.find((t) => t.id === testId) ?? null;
  const testRef = useRef(test);
  testRef.current = test;

  // Seçilmiş test silinibsə və ya açarı artıq hazır deyilsə, ilk uyğun testə keçirik.
  useEffect(() => {
    if (!usableTests.some((t) => t.id === testId)) setTestId(usableTests[0]?.id ?? '');
  }, [usableTests, testId]);

  // Test dəyişəndə kartların massivləri yeni sual sayına gətirilir.
  useEffect(() => {
    if (!test) return;
    const closed = test.closedPoints.length;
    const open = test.openPoints.length;
    setScans((current) =>
      current.map((scan) =>
        scan.cavablar.length === closed && scan.aciq.length === open
          ? scan
          : {
              ...scan,
              cavablar: normalize(scan.cavablar, closed, null),
              aciq: normalize(scan.aciq, open, null),
              aciqText: normalize(scan.aciqText, open, null),
            },
      ),
    );
  }, [test]);

  // Önizləmə URL-ləri səhifədən çıxanda azad edilir.
  const scansRef = useRef(scans);
  scansRef.current = scans;
  useEffect(() => () => scansRef.current.forEach((s) => URL.revokeObjectURL(s.previewUrl)), []);

  function patchScan(id: string, patch: Partial<Scan>) {
    setScans((current) => current.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  // Növbə: eyni anda ən çox SCAN_CONCURRENCY şəkil, əlavə olunma sırası ilə.
  useEffect(() => {
    if (!test) return;
    const processing = scans.filter((s) => s.status === 'processing').length;
    const next = scans
      .filter((s) => s.status === 'waiting')
      .slice(0, Math.max(0, SCAN_CONCURRENCY - processing));
    if (next.length === 0) return;

    setScans((current) =>
      current.map((s) => (next.some((n) => n.id === s.id) ? { ...s, status: 'processing' } : s)),
    );
    next.forEach((scan) => void processScan(scan, test));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scans, test]);

  async function processScan(scan: Scan, scanTest: KsqTest) {
    const closed = scanTest.closedPoints.length;
    const open = scanTest.openPoints.length;

    try {
      const image = await downscaleImage(scan.file);
      const result = await ksqApi.scan(image, closed, open);

      // Oxuma vaxtı test dəyişibsə, cavab cari testin ölçüsünə gətirilir.
      const current = testRef.current ?? scanTest;
      const fallbackVariant = readyVariants(current)[0] ?? 'A';

      patchScan(scan.id, {
        status: 'done',
        error: null,
        ad: result.ad ?? '',
        variant: result.variant ?? fallbackVariant,
        kod: result.kod ?? '',
        cavablar: normalize(result.cavablar, current.closedPoints.length, null),
        aciqText: normalize(result.aciqCavablar, current.openPoints.length, null),
        unsure: result.unsure,
        qeyd: result.qeyd,
      });
    } catch (error) {
      patchScan(scan.id, { status: 'error', error: scanErrorMessage(error) });
    }
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((f) => f.type.startsWith('image/'));
    event.target.value = '';
    if (!test || files.length === 0) return;

    const variant = readyVariants(test)[0] ?? 'A';
    const added: Scan[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'waiting',
      error: null,
      ad: '',
      variant,
      kod: '',
      cavablar: normalize([], test.closedPoints.length, null),
      aciq: normalize([], test.openPoints.length, null),
      aciqText: normalize([], test.openPoints.length, null),
      unsure: [],
      qeyd: null,
      saved: false,
      saving: false,
      expanded: false,
    }));

    setScans((current) => [...added, ...current]);
    toast(files.length === 1 ? 'Şəkil oxunur…' : `${files.length} şəkil növbəyə əlavə olundu.`);
  }

  function toRequest(scan: Scan, scanTest: KsqTest): SaveKsqResultRequest {
    return {
      testId: scanTest.id,
      sinif: sinif.trim(),
      ad: scan.ad.trim(),
      variant: scan.variant,
      kod: scan.kod.trim(),
      cavablar: scan.cavablar,
      aciq: scan.aciq,
    };
  }

  async function saveOne(scan: Scan) {
    if (!test) return;
    patchScan(scan.id, { saving: true });
    try {
      await ksqApi.saveResult(toRequest(scan, test));
      patchScan(scan.id, { saving: false, saved: true });
      toast('Nəticə saxlanıldı.');
    } catch (error) {
      patchScan(scan.id, { saving: false });
      toast(apiErrorMessage(error, 'Nəticə saxlanmadı.'));
    }
  }

  const pending = scans.filter(
    (s) => !s.saved && (s.status === 'done' || s.status === 'error') && hasAnyAnswer(s),
  );

  async function saveAll() {
    if (!test) return;
    const savable = pending.filter((s) => keyReady(variantKey(test, s.variant), test.closedPoints.length));
    const skipped = pending.length - savable.length;

    if (savable.length === 0) {
      toast(skipped > 0 ? 'Kartların variant açarı hazır deyil.' : 'Saxlanacaq kart yoxdur.');
      return;
    }

    const ids = new Set(savable.map((s) => s.id));
    setBulkSaving(true);
    setScans((current) => current.map((s) => (ids.has(s.id) ? { ...s, saving: true } : s)));

    try {
      await ksqApi.saveResults(savable.map((s) => toRequest(s, test)));
      setScans((current) =>
        current.map((s) => (ids.has(s.id) ? { ...s, saving: false, saved: true } : s)),
      );
      toast(
        skipped > 0
          ? `${savable.length} nəticə saxlanıldı. ${skipped} kartın açarı hazır deyil.`
          : `${savable.length} nəticə saxlanıldı.`,
      );
    } catch (error) {
      setScans((current) => current.map((s) => (ids.has(s.id) ? { ...s, saving: false } : s)));
      toast(apiErrorMessage(error, 'Nəticələr saxlanmadı.'));
    } finally {
      setBulkSaving(false);
    }
  }

  function removeScan(scan: Scan) {
    URL.revokeObjectURL(scan.previewUrl);
    setScans((current) => current.filter((s) => s.id !== scan.id));
  }

  function clearAll() {
    const unsaved = scans.filter((s) => !s.saved && s.status !== 'error').length;
    if (unsaved > 0 && !window.confirm(`Saxlanmamış ${unsaved} kart var. Siyahı təmizlənsin?`)) return;
    // Oxunmaqda olan kartlar siyahıda qalır - cavabları gələndə itməsin.
    scans.filter((s) => s.status !== 'processing').forEach((s) => URL.revokeObjectURL(s.previewUrl));
    setScans((current) => current.filter((s) => s.status === 'processing'));
    toast('Siyahı təmizləndi.');
  }

  if (usableTests.length === 0) {
    return (
      <div className="card space-y-3 text-center">
        <p className="text-sm text-brand-slate">
          Əvvəlcə Açar bölməsində testi yaradın və ən azı bir variantın bütün cavablarını qeyd edin.
        </p>
        <Button onClick={onGoToKey}>Açar bölməsinə keç</Button>
      </div>
    );
  }

  const processingCount = scans.filter((s) => s.status === 'waiting' || s.status === 'processing').length;

  return (
    <div className="space-y-5">
      <div className="card space-y-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
          <Select
            name="ksqCheckTest"
            label="Hansı test yoxlanır"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
          >
            {usableTests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Input
            name="ksqSinif"
            label="Sinif"
            placeholder="məs. 9A"
            maxLength={20}
            value={sinif}
            onChange={(e) => setSinif(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => cameraInput.current?.click()}>Şəkil çək</Button>
          <Button variant="secondary" onClick={() => galleryInput.current?.click()}>
            Qalereyadan seç
          </Button>
        </div>
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFiles}
        />
        <input
          ref={galleryInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />

        <p className="text-[13px] text-brand-muted">
          İstənilən kart olar: Word cavab kartı və ya cavabları dairəyə alınmış test vərəqi. Kartı
          düz, yaxşı işıqda və bütöv çəkin. AI-ın oxuduğunu yoxlayın — səhvi qabarcığa toxunub
          düzəldin, açıq sualların balını əl ilə yazın.
        </p>
      </div>

      {scans.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={saveAll} disabled={bulkSaving || pending.length === 0}>
            {bulkSaving ? 'Saxlanılır…' : `Hamısını saxla${pending.length ? ` (${pending.length})` : ''}`}
          </Button>
          <Button variant="secondary" onClick={clearAll}>
            Siyahını təmizlə
          </Button>
          {processingCount > 0 && (
            <span className="text-[13px] text-brand-muted">{processingCount} kart oxunur…</span>
          )}
        </div>
      )}

      {test &&
        scans.map((scan) => (
          <ScanCard
            key={scan.id}
            scan={scan}
            test={test}
            onChange={(patch) => patchScan(scan.id, patch)}
            onSave={() => saveOne(scan)}
            onRetry={() => patchScan(scan.id, { status: 'waiting', error: null })}
            onRemove={() => removeScan(scan)}
          />
        ))}
    </div>
  );
}
