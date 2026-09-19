import { useEffect, useState } from 'react';
import { certificatesApi, trainingsApi } from '../../../api';
import { apiErrorMessage } from '../../../hooks/useApiError';
import { useToast } from '../../../hooks/useToast';
import { FormatBadge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ErrorNote } from '../../ui/ErrorNote';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Spinner } from '../../ui/Spinner';
import { formatNumber, formatPrice } from '../../../lib/format';
import type { Training, TrainingFormat } from '../../../types';

interface EditState {
  name: string;
  format: TrainingFormat;
  description: string;
  price: number;
  durationHours: number;
  metaLabel: string;
  seatLimit: string;
}

const FORMATS: { value: TrainingFormat; label: string }[] = [
  { value: 'Live', label: 'Canlı' },
  { value: 'Online', label: 'Onlayn' },
  { value: 'Video', label: 'Video' },
];

export default function AdminTrainingsTab() {
  const { toast } = useToast();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    trainingsApi
      .list()
      .then((data) => !cancelled && setTrainings(data))
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'Təlimlər yüklənmədi.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function issue(trainingId: string) {
    const fullName = (names[trainingId] ?? '').trim();
    if (fullName.length < 3) {
      toast('Müəllimin adını yazın.');
      return;
    }

    setBusyId(trainingId);
    try {
      const certificate = await certificatesApi.issue(fullName, trainingId);
      toast(`Sertifikat verildi: ${certificate.code}`);
      setNames((current) => ({ ...current, [trainingId]: '' }));
    } catch (err) {
      toast(apiErrorMessage(err, 'Sertifikat verilmədi.'));
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(training: Training) {
    setEditingId(training.id);
    setConfirmDeleteId(null);
    setEditError(null);
    setEdit({
      name: training.name,
      format: training.format,
      description: training.description,
      price: training.price,
      durationHours: training.durationHours,
      metaLabel: training.metaLabel,
      seatLimit: training.seatLimit === null ? '' : String(training.seatLimit),
    });
  }

  async function saveEdit(trainingId: string) {
    if (!edit) return;

    if (edit.name.trim().length < 5) {
      setEditError('Təlimin adı ən azı 5 simvol olsun.');
      return;
    }
    if (edit.format === 'Live' && edit.seatLimit.trim() === '') {
      setEditError('Canlı təlim üçün yer sayı məcburidir.');
      return;
    }

    setBusyId(trainingId);
    try {
      const updated = await trainingsApi.update(trainingId, {
        name: edit.name.trim(),
        format: edit.format,
        description: edit.description.trim(),
        price: edit.price,
        durationHours: edit.durationHours,
        metaLabel: edit.metaLabel.trim(),
        seatLimit: edit.seatLimit.trim() === '' ? null : Number(edit.seatLimit),
        // null → proqram maddələrinə toxunulmur (dərslər ayrı endpoint-dədir).
        syllabus: null,
      });

      setTrainings((current) =>
        current.map((item) => (item.id === trainingId ? { ...item, ...updated } : item)),
      );
      setEditingId(null);
      setEdit(null);
      toast('Təlim yeniləndi.');
    } catch (err) {
      // 400 — yer limiti mövcud qeydiyyat sayından aşağı endirilib.
      setEditError(apiErrorMessage(err, 'Təlim yenilənmədi.'));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(trainingId: string) {
    setBusyId(trainingId);
    try {
      await trainingsApi.remove(trainingId);
      setTrainings((current) => current.filter((item) => item.id !== trainingId));
      setConfirmDeleteId(null);
      toast('Təlim silindi.');
    } catch (err) {
      // 409 — qeydiyyatı olan təlim silinmir.
      toast(apiErrorMessage(err, 'Bu təlimə qeydiyyat var, silinə bilməz.'));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-brand-navy">Təlimlər</h2>
      <p className="mt-1.5 text-sm text-brand-muted">
        Redaktə, silmə, yazılan iştirakçı sayı və əl ilə sertifikat vermə.
      </p>

      <ul className="mt-5 space-y-3">
        {trainings.map((training) => (
          <li key={training.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <FormatBadge format={training.format} />
                <h3 className="mt-3 font-heading text-[15px] font-semibold text-brand-navy">
                  {training.name}
                </h3>
                <p className="mt-1 text-sm text-brand-muted">
                  {formatNumber(training.seatsTaken)} nəfər yazılıb ·{' '}
                  {training.seatLimit === null ? 'limitsiz' : `${training.seatLimit} yer`} ·{' '}
                  {training.lessonCount} dərs
                </p>
              </div>
              <span className="font-heading text-lg font-bold text-brand-navy">
                {formatPrice(training.price)}
              </span>
            </div>

            {editingId === training.id && edit ? (
              <div className="mt-4 space-y-3 border-t border-brand-borderLight pt-4">
                <Input
                  name={`name-${training.id}`}
                  label="Ad"
                  value={edit.name}
                  onChange={(event) => setEdit({ ...edit, name: event.target.value })}
                />
                <Input
                  name={`description-${training.id}`}
                  label="Təsvir"
                  value={edit.description}
                  onChange={(event) =>
                    setEdit({ ...edit, description: event.target.value })
                  }
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    name={`format-${training.id}`}
                    label="Format"
                    value={edit.format}
                    onChange={(event) =>
                      setEdit({ ...edit, format: event.target.value as TrainingFormat })
                    }
                  >
                    {FORMATS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>

                  <Input
                    name={`metaLabel-${training.id}`}
                    label="Meta etiket"
                    value={edit.metaLabel}
                    onChange={(event) =>
                      setEdit({ ...edit, metaLabel: event.target.value })
                    }
                    placeholder="2 gün · 8 saat"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    name={`price-${training.id}`}
                    type="number"
                    min={0}
                    step={0.5}
                    label="Qiymət (₼)"
                    value={edit.price}
                    onChange={(event) =>
                      setEdit({ ...edit, price: Number(event.target.value) })
                    }
                  />
                  <Input
                    name={`hours-${training.id}`}
                    type="number"
                    min={1}
                    label="Saat"
                    value={edit.durationHours}
                    onChange={(event) =>
                      setEdit({ ...edit, durationHours: Number(event.target.value) })
                    }
                  />
                  <Input
                    name={`seatLimit-${training.id}`}
                    type="number"
                    min={training.seatsTaken}
                    label="Yer sayı"
                    value={edit.seatLimit}
                    onChange={(event) =>
                      setEdit({ ...edit, seatLimit: event.target.value })
                    }
                    hint={`Boş = limitsiz. Ən azı ${training.seatsTaken}.`}
                  />
                </div>

                <ErrorNote message={editError} />

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={busyId === training.id}
                    onClick={() => saveEdit(training.id)}
                  >
                    Yadda saxla
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setEdit(null);
                      setEditError(null);
                    }}
                  >
                    İmtina
                  </Button>
                </div>
              </div>
            ) : confirmDeleteId === training.id ? (
              <div className="mt-4 rounded-xl bg-danger-bg p-4">
                <p className="text-sm font-medium text-danger-text">
                  «{training.name}» silinsin? Qeydiyyatı olan təlim silinmir.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={busyId === training.id}
                    onClick={() => remove(training.id)}
                  >
                    Bəli, sil
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    İmtina
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-borderLight pt-4">
                  <Button size="sm" variant="secondary" onClick={() => startEdit(training)}>
                    Redaktə et
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setConfirmDeleteId(training.id)}
                  >
                    Sil
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-brand-borderLight pt-4">
                  <div className="min-w-[220px] flex-1">
                    <Input
                      name={`holder-${training.id}`}
                      label="Müəllim adı"
                      value={names[training.id] ?? ''}
                      onChange={(event) =>
                        setNames((current) => ({
                          ...current,
                          [training.id]: event.target.value,
                        }))
                      }
                      placeholder="Nigar Əliyeva"
                    />
                  </div>
                  <Button
                    size="sm"
                    disabled={busyId === training.id}
                    onClick={() => issue(training.id)}
                  >
                    Sertifikat ver
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
