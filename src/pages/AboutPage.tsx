import { Link } from 'react-router-dom';
import { aboutSteps } from '../data/static';
import { Button } from '../components/ui/Button';
import { SellerDetails } from '../components/legal/LegalLayout';
import { CardBrands } from '../components/legal/CardBrands';
import { BRAND_FULL_NAME, CARD_ACCEPTANCE_NOTE, MERCHANT_NAME, SUPPORT_HOURS } from '../data/legal';

export default function AboutPage() {
  return (
    <div className="page">
      <header className="flex max-w-3xl flex-col gap-6 sm:flex-row sm:items-center">
        <img
          src="/logo.png"
          alt={`${BRAND_FULL_NAME} — Təlimlər, Seminarlar, Sınaqlar`}
          width={640}
          height={594}
          className="h-auto w-44 shrink-0 self-center sm:w-52"
        />
        <div>
          <h1 className="hidden font-heading text-3xl font-bold text-brand-navy lg:block">Haqqımızda</h1>
          <p className="text-base leading-relaxed text-brand-ink lg:mt-3">
            <strong>{MERCHANT_NAME}</strong> — <strong>{BRAND_FULL_NAME}</strong> (MİM) platformasıdır.
            Müəllimlər üçün təlimlər, seminarlar, sınaqlar və resurs bankı bir yerdədir:
            müəllim öyrəndiyini materiala, materialı isə gəlirə çevirir.
          </p>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="font-heading text-xl font-bold text-brand-navy">
          5 addım, bir dövrə
        </h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aboutSteps.map((step) => (
            <li key={step.number} className="card flex flex-col">
              <span className="font-heading text-2xl font-bold text-brand-blue">
                {step.number}
              </span>
              <h3 className="mt-3 font-heading text-lg font-semibold text-brand-navy">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="odenis" className="card mt-12 scroll-mt-24">
        <h2 className="font-heading text-xl font-bold text-brand-navy">Ödənişi kim edir?</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-ink">
          <p>
            Ödənişi saytda qeydiyyatdan keçmiş <strong>istifadəçi özü</strong> — müəllim və ya
            müəllimliyə hazırlaşan tələbə — yalnız özü üçün seçdiyi məhsula görə edir:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Təlimlər</strong> — video və canlı təlimə qoşulmaq (sertifikatla);
            </li>
            <li>
              <strong>Resurs Bankı</strong> — ödənişli dərs materialını əldə etmək;
            </li>
            <li>
              <strong>Sınaqlar</strong> — ödənişli onlayn sınaqda iştirak etmək.
            </li>
          </ul>
          <p>
            Qeydiyyat, pulsuz materiallar və platformaya qoşulmaq <strong>ödənişsizdir</strong> —
            aylıq abunə haqqı yoxdur. Qiymət hər məhsulun səhifəsində manatla (AZN) göstərilir və
            ödəniş səbətdən bank kartı ilə, AzeriCard-ın təhlükəsiz səhifəsində edilir.
          </p>
          <p className="rounded-xl bg-brand-chipBg p-3 font-medium text-brand-navy">
            {CARD_ACCEPTANCE_NOTE}
          </p>
          <CardBrands />
        </div>
      </section>

      <section id="muellif" className="card mt-8 scroll-mt-24">
        <h2 className="font-heading text-xl font-bold text-brand-navy">
          Komissiya şərtləri
        </h2>
        <p className="text-sm leading-relaxed text-brand-ink lg:mt-3">
          Ödənişli materialın satışından əldə olunan məbləğin <strong>80%-i müəllifə</strong>{' '}
          gedir, <strong>20%-i platforma komissiyasıdır</strong>. Aylıq abunə haqqı və
          yükləmə haqqı yoxdur — yalnız real satışdan komissiya tutulur.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-free-bg p-4">
            <p className="font-heading text-2xl font-bold text-free-text">80%</p>
            <p className="mt-1 text-[13px] text-free-text">Müəllifin payı</p>
          </div>
          <div className="rounded-xl bg-online-bg p-4">
            <p className="font-heading text-2xl font-bold text-online-text">20%</p>
            <p className="mt-1 text-[13px] text-online-text">Platforma komissiyası</p>
          </div>
          <div className="rounded-xl bg-brand-chipBg p-4">
            <p className="font-heading text-2xl font-bold text-brand-navy">0 ₼</p>
            <p className="mt-1 text-[13px] text-brand-muted">Aylıq abunə</p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-brand-muted">
          Yüklənən hər material moderasiya növbəsinə düşür. Fənn üzrə moderator 48 saat
          içində təsdiqləyir və ya səbəbini yazaraq geri qaytarır.
        </p>

        <Link to="/giris?mode=register" className="mt-6 inline-block">
          <Button>Müəllif hesabı aç</Button>
        </Link>
      </section>

      <section id="rekvizitler" className="card mt-8 scroll-mt-24">
        <h2 className="font-heading text-xl font-bold text-brand-navy">Rekvizitlər və əlaqə</h2>
        <p className="mb-4 mt-2 text-sm leading-relaxed text-brand-muted">
          Müraciətlər: {SUPPORT_HOURS}.
        </p>
        <SellerDetails />
      </section>
    </div>
  );
}
