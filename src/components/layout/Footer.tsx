import { Link } from 'react-router-dom';
import { useSectionLink } from '../../hooks/useSectionLink';
import { CardBrands } from '../legal/CardBrands';
import {
  BRAND_FULL_NAME,
  LEGAL_LINKS,
  MERCHANT_NAME,
  SELLER_ADDRESS,
  SELLER_NAME,
  SELLER_PHONE,
  SELLER_PHONE_HREF,
  SELLER_VOEN,
  SUPPORT_EMAIL,
} from '../../data/legal';

export function Footer() {
  const goToSection = useSectionLink();

  return (
    <footer className="mt-20 border-t border-brand-borderLight bg-brand-surface">
      <div className="shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold text-brand-navy">
            <img src="/logo-mark.png" alt="" width={36} height={36} className="h-9 w-9" />
            MIMEDU.AZ
          </Link>
          <p className="mt-1 text-[13px] font-semibold text-brand-slate">{BRAND_FULL_NAME}</p>
          <p className="mt-3 max-w-xs text-sm text-brand-muted">
            Müəllimlər üçün təlim, resurs bankı və koda görə yoxlanılan sertifikat
            platforması.
          </p>
        </div>

        <nav aria-label="Platform">
          <h2 className="font-heading text-[13px] font-bold uppercase tracking-[.08em] text-brand-faint">
            Platform
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/telimler" className="text-brand-slate hover:text-brand-blue">
                Təlimlər
              </Link>
            </li>
            <li>
              <Link to="/resurslar" className="text-brand-slate hover:text-brand-blue">
                Resurs Bankı
              </Link>
            </li>
            <li>
              <Link to="/promptlar" className="text-brand-slate hover:text-brand-blue">
                Prompt Kitabxanası
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => goToSection('sertifikat')}
                className="text-brand-slate hover:text-brand-blue"
              >
                Sertifikat yoxlama
              </button>
            </li>
          </ul>
        </nav>

        <nav aria-label="Müəllif">
          <h2 className="font-heading text-[13px] font-bold uppercase tracking-[.08em] text-brand-faint">
            Müəllif
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link
                to="/giris?mode=register&type=teacher"
                className="text-brand-slate hover:text-brand-blue"
              >
                Müəllif hesabı aç
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => goToSection('muellif', '/haqqimizda')}
                className="text-brand-slate hover:text-brand-blue"
              >
                Komissiya şərtləri
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => goToSection('faq')}
                className="text-brand-slate hover:text-brand-blue"
              >
                Moderasiya qaydaları
              </button>
            </li>
          </ul>
        </nav>

        <nav aria-label="Məzmun">
          <h2 className="font-heading text-[13px] font-bold uppercase tracking-[.08em] text-brand-faint">
            Məzmun
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/haqqimizda" className="text-brand-slate hover:text-brand-blue">
                Haqqımızda
              </Link>
            </li>
            <li>
              <Link to="/hesabi-sil" className="text-brand-slate hover:text-brand-blue">
                Hesabın silinməsi
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => goToSection('blog')}
                className="text-brand-slate hover:text-brand-blue"
              >
                Blog
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => goToSection('faq')}
                className="text-brand-slate hover:text-brand-blue"
              >
                Tez-tez verilən suallar
              </button>
            </li>
          </ul>
        </nav>

        <nav aria-label="Hüquqi">
          <h2 className="font-heading text-[13px] font-bold uppercase tracking-[.08em] text-brand-faint">
            Hüquqi
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {LEGAL_LINKS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-brand-slate hover:text-brand-blue">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-brand-borderLight py-6">
        <div className="shell flex flex-col gap-3 text-xs text-brand-faint lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p>
              © {new Date().getFullYear()} {MERCHANT_NAME} platforması {SELLER_NAME} tərəfindən idarə
              olunur · VÖEN: {SELLER_VOEN}
            </p>
            <p>
              {SELLER_ADDRESS} ·{' '}
              <a href={`tel:${SELLER_PHONE_HREF}`} className="hover:text-brand-blue">
                {SELLER_PHONE}
              </a>{' '}
              ·{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-brand-blue">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
          <CardBrands compact />
        </div>
      </div>
    </footer>
  );
}
