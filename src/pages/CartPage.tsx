import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { paymentsApi } from '../api';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { apiErrorMessage } from '../hooks/useApiError';
import { CartItemRow } from '../components/cart/CartItemRow';
import { CardBrands } from '../components/legal/CardBrands';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorNote } from '../components/ui/ErrorNote';
import { Spinner } from '../components/ui/Spinner';
import { formatPrice } from '../lib/format';
import { buildClientInfo, submitPaymentForm } from '../lib/payment';
import { CARD_ACCEPTANCE_NOTE, MERCHANT_NAME } from '../data/legal';
import type { PaymentConfig } from '../types';

const link = 'text-brand-blue underline';

/**
 * Səbət və ödənişə keçid. Kart məlumatı bu səhifədə daxil EDİLMİR — "Kartla ödə" istifadəçini
 * AzeriCard-ın təhlükəsiz səhifəsinə yönləndirir. Pulsuz səbət dərhal tamamlanır.
 */
export default function CartPage() {
  const { items, total, loading, removeItem, checkout } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptDigital, setAcceptDigital] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    paymentsApi
      .config()
      .then((data) => !cancelled && setConfig(data))
      .catch(() => !cancelled && setConfig({ enabled: false, currency: 'AZN', termsVersion: '' }));
    return () => {
      cancelled = true;
    };
  }, []);

  const isFree = total <= 0;
  const paymentsEnabled = config?.enabled ?? false;
  const canSubmit = isFree || (paymentsEnabled && acceptTerms && acceptDigital);

  async function handleRemove(cartItemId: string) {
    setRemovingId(cartItemId);
    try {
      await removeItem(cartItemId);
      toast('Səbətdən silindi.');
    } catch (err) {
      toast(apiErrorMessage(err, 'Silmək alınmadı.'));
    } finally {
      setRemovingId(null);
    }
  }

  async function handleCheckout() {
    setError(null);
    setSubmitting(true);
    try {
      const result = await checkout({
        acceptTerms: isFree || (acceptTerms && acceptDigital),
        clientInfo: isFree ? undefined : buildClientInfo(),
      });

      if (result.payment) {
        // Səhifə banka keçir - submitting vəziyyəti saxlanılır ki, təkrar basılmasın.
        submitPaymentForm(result.payment);
        return;
      }

      toast(`Sifariş ${result.order.code} tamamlandı.`);
      navigate('/sifarisler');
      setSubmitting(false);
    } catch (err) {
      setError(apiErrorMessage(err, 'Sifariş yaradılmadı.'));
      setSubmitting(false);
    }
  }

  if (loading && items.length === 0) return <Spinner />;

  return (
    <div className="page">
      <h1 className="hidden font-heading text-3xl font-bold text-brand-navy lg:block">Səbət</h1>

      {items.length === 0 ? (
        <div className="lg:mt-8">
          <EmptyState
            title="Səbətiniz boşdur"
            text="Təlim və ya ödənişli resurs əlavə edib ödənişə keçə bilərsiniz."
            action={
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Link to="/telimler">
                  <Button size="sm">Təlimlərə bax</Button>
                </Link>
                <Link to="/resurslar">
                  <Button size="sm" variant="secondary">
                    Resurs Bankı
                  </Button>
                </Link>
              </div>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:mt-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <ul className="card !p-0">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                removing={removingId === item.id}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </ul>

          <div className="card space-y-4 lg:sticky lg:top-24">
            <h2 className="font-heading text-lg font-bold text-brand-navy">Sifarişin xülasəsi</h2>

            <ul className="space-y-1.5 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-brand-slate">{item.name}</span>
                  <span className="shrink-0 font-semibold">{formatPrice(item.price)}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-brand-borderLight pt-3">
              <span className="font-heading text-base font-semibold text-brand-slate">Cəmi</span>
              <span className="font-heading text-2xl font-bold text-brand-navy">{formatPrice(total)}</span>
            </div>

            {!isFree && (
              <>
                <label className="flex items-start gap-2.5 text-[13px] leading-snug text-brand-ink">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <span>
                    <Link to="/istifade-sertleri" target="_blank" className={link}>
                      İstifadə şərtləri
                    </Link>
                    ,{' '}
                    <Link to="/geri-qaytarma" target="_blank" className={link}>
                      Geri qaytarma siyasəti
                    </Link>{' '}
                    və{' '}
                    <Link to="/xidmetin-teqdimi" target="_blank" className={link}>
                      Xidmətin təqdimi qaydaları
                    </Link>{' '}
                    ilə tanış oldum və razıyam.
                  </span>
                </label>
                <label className="flex items-start gap-2.5 text-[13px] leading-snug text-brand-ink">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
                    checked={acceptDigital}
                    onChange={(e) => setAcceptDigital(e.target.checked)}
                  />
                  <span>
                    Rəqəmsal məhsula girişin ödənişdən dərhal sonra açılacağını və endirildikdən və
                    ya istifadəyə başlandıqdan sonra pulun qaytarılmadığını başa düşürəm.
                  </span>
                </label>
              </>
            )}

            <ErrorNote message={error} />

            {!isFree && config && !paymentsEnabled ? (
              <p className="rounded-xl bg-paid-bg px-4 py-3 text-sm font-medium text-paid-text">
                Kartla ödəniş tezliklə aktiv olacaq. Hazırda yalnız pulsuz məhsulları əldə etmək
                mümkündür.
              </p>
            ) : (
              <Button fullWidth onClick={handleCheckout} disabled={submitting || !config || !canSubmit}>
                {submitting
                  ? isFree
                    ? 'Gözləyin…'
                    : 'Bank səhifəsinə yönləndirilirsiniz…'
                  : isFree
                    ? 'Pulsuz əldə et'
                    : `Kartla ödə · ${formatPrice(total)}`}
              </Button>
            )}

            {!isFree && (
              <div className="space-y-2 border-t border-brand-borderLight pt-3 text-[12px] text-brand-muted">
                <p>
                  Ödəniş AzeriCard-ın təhlükəsiz səhifəsində aparılır — kart məlumatları{' '}
                  {MERCHANT_NAME}-da daxil edilmir və saxlanılmır.{' '}
                  <Link to="/odenis-tehlukesizliyi" target="_blank" className={link}>
                    Ətraflı
                  </Link>
                </p>
                <p className="font-medium text-brand-slate">{CARD_ACCEPTANCE_NOTE}</p>
                <CardBrands compact />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
