import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { examsApi } from '../../../api';
import { apiErrorMessage } from '../../../hooks/useApiError';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { PriceBadge, StatusBadge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Chip } from '../../ui/Chip';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorNote } from '../../ui/ErrorNote';
import { Input } from '../../ui/Input';
import { MathText } from '../../ui/MathText';
import { Select } from '../../ui/Select';
import { Spinner } from '../../ui/Spinner';
import { BecomeAuthorPrompt } from './BecomeAuthorPrompt';
import { GRADES, SUBJECTS } from '../../../lib/constants';
import type { Exam, ExamSectionInput } from '../../../types';

interface DraftQuestion {
  key: number;
  questionText: string;
  imagePath: string | null;
  imageUrl: string | null;
  options: string[];
  correctOptionIndex: number;
}

interface DraftSection {
  key: number;
  subject: string;
  questions: DraftQuestion[];
}

const MAX_IMAGE_MB = 5;

export default function ExamBuilderTab() {
  const { toast } = useToast();
  const { canPublishResources } = useAuth();
  const imageRef = useRef<HTMLInputElement>(null);
  /** Qaralama sualının şəkli — dərc anında `POST /exams/{id}/images` ilə yüklənir. */
  const pendingFiles = useRef(new Map<number, File>());

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Sınağın meta məlumatları
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [grade, setGrade] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passPercent, setPassPercent] = useState(50);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(5);

  // Bölmə və sual qaralamaları
  const [sections, setSections] = useState<DraftSection[]>([
    { key: 1, subject: SUBJECTS[0], questions: [] },
  ]);
  const [activeSectionKey, setActiveSectionKey] = useState(1);
  const [nextKey, setNextKey] = useState(2);

  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [pendingImage, setPendingImage] = useState<File | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [busyExamId, setBusyExamId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    examsApi
      .mine()
      .then((data) => !cancelled && setExams(data))
      .catch((err) => !cancelled && setLoadError(apiErrorMessage(err, 'Sınaqlar yüklənmədi.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const activeSection = sections.find((item) => item.key === activeSectionKey) ?? null;
  const totalQuestions = useMemo(
    () => sections.reduce((sum, section) => sum + section.questions.length, 0),
    [sections],
  );

  function addSection() {
    const key = nextKey;
    setSections((current) => [...current, { key, subject: SUBJECTS[0], questions: [] }]);
    setActiveSectionKey(key);
    setNextKey((value) => value + 1);
  }

  function addQuestion() {
    if (!activeSection) return;

    const filled = options.map((option) => option.trim()).filter(Boolean);
    const text = questionText.trim();

    // Backend qaydası: sual ya mətn, ya şəkil ehtiva etməlidir.
    if (!text && !pendingImage) {
      setFormError('Sual mətni yazın və ya şəkil əlavə edin.');
      return;
    }
    if (filled.length < 2) {
      setFormError('Ən azı iki variant yazılmalıdır.');
      return;
    }
    if (correctIndex >= filled.length) {
      setFormError('Düzgün variant boş ola bilməz.');
      return;
    }
    if (pendingImage && pendingImage.size > MAX_IMAGE_MB * 1024 * 1024) {
      setFormError(`Şəkil ${MAX_IMAGE_MB} MB-dan böyük ola bilməz.`);
      return;
    }

    // Şəkil yalnız sınaq yaradıldıqdan sonra yüklənə bilir (endpoint sınaq id-si tələb
    // edir), ona görə fayl qaralamada saxlanılır və dərc anında yüklənir.
    const key = nextKey;
    setSections((current) =>
      current.map((section) =>
        section.key === activeSectionKey
          ? {
              ...section,
              questions: [
                ...section.questions,
                {
                  key,
                  questionText: text,
                  imagePath: null,
                  imageUrl: pendingImage ? URL.createObjectURL(pendingImage) : null,
                  options: filled,
                  correctOptionIndex: correctIndex,
                },
              ],
            }
          : section,
      ),
    );

    if (pendingImage) pendingFiles.current.set(key, pendingImage);
    setNextKey((value) => value + 1);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setPendingImage(null);
    if (imageRef.current) imageRef.current.value = '';
    setFormError(null);
  }

  function removeQuestion(sectionKey: number, questionKey: number) {
    pendingFiles.current.delete(questionKey);
    setSections((current) =>
      current.map((section) =>
        section.key === sectionKey
          ? {
              ...section,
              questions: section.questions.filter((item) => item.key !== questionKey),
            }
          : section,
      ),
    );
  }

  function resetForm() {
    setName('');
    setDescription('');
    setSubject(SUBJECTS[0]);
    setGrade(null);
    setDurationMinutes(60);
    setPassPercent(50);
    setIsPaid(false);
    setPrice(5);
    setSections([{ key: nextKey, subject: SUBJECTS[0], questions: [] }]);
    setActiveSectionKey(nextKey);
    setNextKey((value) => value + 1);
    pendingFiles.current.clear();
  }

  async function publish() {
    if (name.trim().length < 5) {
      setFormError('Sınağın adı ən azı 5 simvol olsun.');
      return;
    }
    const filledSections = sections.filter((section) => section.questions.length > 0);
    if (filledSections.length === 0) {
      setFormError('Ən azı bir bölməyə sual əlavə edin.');
      return;
    }
    if (isPaid && price <= 0) {
      setFormError('Ödənişli sınaq üçün qiymət yazın.');
      return;
    }

    setPublishing(true);
    try {
      const toPayload = (list: DraftSection[]): ExamSectionInput[] =>
        list.map((section) => ({
          subject: section.subject,
          questions: section.questions.map((question) => ({
            questionText: question.questionText,
            imagePath: question.imagePath,
            options: question.options,
            correctOptionIndex: question.correctOptionIndex,
          })),
        }));

      // 1) Sınağı yarat (şəkil endpoint-i mövcud sınaq id-si tələb edir).
      const created = await examsApi.create({
        name: name.trim(),
        description: description.trim(),
        subject,
        grade,
        durationMinutes,
        passPercent,
        isPaid,
        price: isPaid ? price : 0,
        sections: toPayload(filledSections),
      });

      // 2) Şəkil varsa yüklə və bölmələri `imagePath` ilə yenidən göndər.
      if (pendingFiles.current.size > 0) {
        const uploaded = new Map<number, string>();
        for (const [questionKey, file] of pendingFiles.current) {
          const { imagePath } = await examsApi.uploadImage(created.id, file);
          uploaded.set(questionKey, imagePath);
        }

        const withImages = filledSections.map((section) => ({
          ...section,
          questions: section.questions.map((question) => ({
            ...question,
            imagePath: uploaded.get(question.key) ?? question.imagePath,
          })),
        }));

        await examsApi.saveSections(created.id, { sections: toPayload(withImages) });
      }

      const refreshed = await examsApi.mine();
      setExams(refreshed);
      resetForm();
      setFormError(null);
      toast('Sınaq moderasiyaya göndərildi.');
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Sınaq yadda saxlanmadı.'));
    } finally {
      setPublishing(false);
    }
  }

  async function remove(examId: string) {
    setBusyExamId(examId);
    try {
      await examsApi.remove(examId);
      setExams((current) => current.filter((item) => item.id !== examId));
      toast('Sınaq silindi.');
    } catch (err) {
      // 409 — kimsə sınağı artıq verib.
      toast(apiErrorMessage(err, 'Sınaq silinmədi.'));
    } finally {
      setBusyExamId(null);
    }
  }

  if (!canPublishResources) return <BecomeAuthorPrompt />;
  if (loading) return <Spinner />;
  if (loadError) return <ErrorNote message={loadError} />;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-brand-navy">Sınaqlarım</h2>
        <p className="mt-1.5 text-sm text-brand-muted">
          Vaxt limitli sınaq yaradın və satın. Sınaq moderasiyadan keçir; keçid balından
          yuxarı nəticə alan iştirakçıya sertifikat avtomatik verilir.
        </p>
      </div>

      <div className="card space-y-4">
        <h3 className="font-heading text-base font-bold text-brand-navy">Yeni sınaq</h3>

        <Input
          name="examName"
          label="Sınağın adı"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Buraxılış sınağı — I mərhələ"
        />

        <Input
          name="examDescription"
          label="Təsvir"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Riyaziyyat və fizika bölmələrindən ibarət sınaq."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            name="examSubject"
            label="Əsas fənn"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            {SUBJECTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          <Select
            name="examGrade"
            label="Sinif"
            value={grade ?? ''}
            onChange={(event) =>
              setGrade(event.target.value === '' ? null : Number(event.target.value))
            }
          >
            <option value="">Sinif göstərilməsin</option>
            {GRADES.map((item) => (
              <option key={item} value={item}>
                {item}-ci sinif
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="durationMinutes"
            type="number"
            min={1}
            max={600}
            label="Vaxt limiti (dəqiqə)"
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
          />
          <Input
            name="passPercent"
            type="number"
            min={1}
            max={100}
            label="Keçid balı (%)"
            value={passPercent}
            onChange={(event) => setPassPercent(Number(event.target.value))}
            hint="Bu faizdən yuxarı nəticəyə sertifikat verilir."
          />
        </div>

        <div className="rounded-xl bg-brand-chipBg p-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(event) => setIsPaid(event.target.checked)}
              className="h-4 w-4 accent-brand-blue"
            />
            <span className="font-heading text-sm font-semibold text-brand-slate">
              Ödənişli sınaq
            </span>
          </label>

          {isPaid && (
            <div className="mt-4">
              <Input
                name="examPrice"
                type="number"
                min={1}
                step={0.5}
                label="Qiymət (₼)"
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                hint="Satışın 80%-i sizə, 20%-i platformaya gedir."
              />
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-base font-bold text-brand-navy">
            Bölmələr ({totalQuestions} sual)
          </h3>
          <Button variant="secondary" size="sm" onClick={addSection}>
            Bölmə əlavə et
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {sections.map((section) => (
            <Chip
              key={section.key}
              active={section.key === activeSectionKey}
              onClick={() => setActiveSectionKey(section.key)}
            >
              {section.subject} ({section.questions.length})
            </Chip>
          ))}
        </div>

        {activeSection && (
          <div className="mt-4 border-t border-brand-borderLight pt-4">
            <Select
              name="sectionSubject"
              label="Bölmənin fənni"
              value={activeSection.subject}
              onChange={(event) =>
                setSections((current) =>
                  current.map((section) =>
                    section.key === activeSectionKey
                      ? { ...section, subject: event.target.value }
                      : section,
                  ),
                )
              }
            >
              {SUBJECTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      <div className="card space-y-4">
        <h3 className="font-heading text-base font-bold text-brand-navy">
          Sual əlavə et {activeSection ? `— ${activeSection.subject}` : ''}
        </h3>

        <Input
          name="questionText"
          label="Sual mətni"
          value={questionText}
          onChange={(event) => setQuestionText(event.target.value)}
          placeholder="$x^2 = 49$ tənliyinin müsbət kökü nədir?"
          hint="Düstur üçün LaTeX yaza bilərsiniz: $...$ arasında."
        />

        {questionText.includes('$') && (
          <div className="rounded-xl bg-brand-chipBg px-4 py-3">
            <span className="block text-[11px] font-bold uppercase tracking-[.08em] text-brand-faint">
              Önizləmə
            </span>
            <MathText text={questionText} className="mt-1 block text-sm text-brand-navy" />
          </div>
        )}

        <div>
          <span className="mb-1.5 block font-heading text-[13px] font-semibold text-brand-slate">
            Şəkil (istəyə bağlı, maks. {MAX_IMAGE_MB} MB)
          </span>
          <input
            ref={imageRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(event) => setPendingImage(event.target.files?.[0] ?? null)}
            className="w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-ink file:mr-3 file:rounded-pill file:border-0 file:bg-brand-chipBg file:px-4 file:py-1.5 file:font-heading file:text-[13px] file:font-semibold file:text-brand-blue"
          />
          {pendingImage && (
            <p className="mt-1.5 text-xs text-brand-faint">
              {pendingImage.name} · {(pendingImage.size / 1024 / 1024).toFixed(1)} MB
            </p>
          )}
        </div>

        {options.map((option, index) => (
          <Input
            key={index}
            name={`examOption-${index}`}
            label={`Variant ${index + 1}${index > 1 ? ' (opsional)' : ''}`}
            value={option}
            onChange={(event) =>
              setOptions((current) =>
                current.map((item, i) => (i === index ? event.target.value : item)),
              )
            }
          />
        ))}

        <div>
          <span className="mb-2 block font-heading text-[13px] font-semibold text-brand-slate">
            Düzgün variant
          </span>
          <div className="flex flex-wrap gap-2">
            {options.map((_, index) => (
              <Chip
                key={index}
                active={correctIndex === index}
                onClick={() => setCorrectIndex(index)}
              >
                Variant {index + 1}
              </Chip>
            ))}
          </div>
        </div>

        <ErrorNote message={formError} />

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={addQuestion}>
            Sualı əlavə et
          </Button>
          <Button disabled={publishing || totalQuestions === 0} onClick={publish}>
            {publishing ? 'Göndərilir…' : 'Sınağı dərc et'}
          </Button>
        </div>
      </div>

      {totalQuestions > 0 && (
        <div className="card">
          <h3 className="font-heading text-base font-bold text-brand-navy">Qaralama</h3>
          <div className="mt-4 space-y-5">
            {sections
              .filter((section) => section.questions.length > 0)
              .map((section) => (
                <div key={section.key}>
                  <p className="font-heading text-sm font-bold text-brand-slate">
                    {section.subject}
                  </p>
                  <ol className="mt-2 space-y-2">
                    {section.questions.map((question, index) => (
                      <li
                        key={question.key}
                        className="flex items-start gap-3 rounded-xl bg-brand-chipBg p-4"
                      >
                        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white font-heading text-xs font-bold text-brand-blue">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          {question.questionText && (
                            <MathText
                              text={question.questionText}
                              className="block text-sm font-medium text-brand-navy"
                            />
                          )}
                          {question.imageUrl && (
                            <img
                              src={question.imageUrl}
                              alt=""
                              className="mt-2 max-h-32 rounded-lg border border-brand-border"
                            />
                          )}
                          <p className="mt-1 text-xs text-brand-muted">
                            Doğru: {question.options[question.correctOptionIndex]}
                          </p>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeQuestion(section.key, question.key)}
                        >
                          Sil
                        </Button>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-heading text-base font-bold text-brand-navy">
          Mövcud sınaqlarım
        </h3>

        {exams.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="Hələ sınaq yaratmamısınız" />
          </div>
        ) : (
          <ul className="card mt-3 !p-0">
            {exams.map((exam) => (
              <li
                key={exam.id}
                className="flex flex-wrap items-center gap-3 border-b border-brand-borderLight px-5 py-4 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-[15px] font-semibold text-brand-navy">
                    {exam.name}
                  </p>
                  <p className="mt-0.5 text-sm text-brand-muted">
                    {exam.questionCount} sual · {exam.durationMinutes} dəq · keçid balı{' '}
                    {exam.passPercent}% · {exam.attemptCount} cəhd
                  </p>
                </div>

                <PriceBadge isPaid={exam.isPaid} price={exam.price} />
                <StatusBadge
                  tone={
                    exam.status === 'Approved'
                      ? 'free'
                      : exam.status === 'Pending'
                        ? 'info'
                        : 'danger'
                  }
                >
                  {exam.status === 'Approved'
                    ? 'Təsdiqlənib'
                    : exam.status === 'Pending'
                      ? 'Moderasiyada'
                      : 'Rədd edilib'}
                </StatusBadge>

                <Link to={`/sinaqlar/${exam.id}`}>
                  <Button variant="secondary" size="sm">
                    Bax
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={busyExamId === exam.id}
                  title={
                    exam.attemptCount > 0
                      ? 'Cəhd olan sınaq silinmir.'
                      : undefined
                  }
                  onClick={() => remove(exam.id)}
                >
                  Sil
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
