import { LegalPage, LegalSection } from '../../components/legal/LegalLayout';
import { CardBrands } from '../../components/legal/CardBrands';
import { CARD_ACCEPTANCE_NOTE, MERCHANT_NAME, SUPPORT_EMAIL, TERMS_UPDATED_AT } from '../../data/legal';

/** Ödəniş təhlükəsizliyi: kart məlumatı saytdan keçmir — AzeriCard-ın hosted səhifəsi. */
export default function PaymentSecurityPage() {
  return (
    <LegalPage
      title="Ödəniş təhlükəsizliyi"
      updatedAt={TERMS_UPDATED_AT}
      intro={
        <p>
          Kartla ödəniş Azərbaycanın milli prosessinq mərkəzi AzeriCard-ın təhlükəsiz səhifəsində
          aparılır. Kart məlumatlarınız {MERCHANT_NAME}-a ötürülmür, saytımızda görünmür və
          saxlanılmır.
        </p>
      }
    >
      <LegalSection title="Ödəniş necə aparılır">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Səbətdə «Kartla ödə» düyməsini basırsınız.</li>
          <li>
            AzeriCard-ın ödəniş səhifəsinə (3dsecure.az) yönləndirilirsiniz — kart nömrəsi, bitmə
            tarixi və CVV/CVC kodu yalnız orada daxil edilir.
          </li>
          <li>
            Bank ödənişi 3-D Secure ilə təsdiqləyir: kartınıza bağlı nömrəyə SMS kod gəlir (Visa
            Secure, Mastercard Identity Check).
          </li>
          <li>
            Bank nəticəni imzalı şəkildə bizə bildirir; yalnız bundan sonra sifariş təsdiqlənir və
            məhsula giriş açılır.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="Nəyi saxlayırıq">
        <p>
          Yalnız sifariş nömrəsi, məbləğ, ödənişin statusu, bankın qaytardığı maskalanmış kart
          nömrəsi (məs. 4169 73** **** 5678), əməliyyat (RRN) və təsdiq kodu. Bu məlumatlar qəbz
          və mübahisələrin həlli üçündür. Tam kart nömrəsi və CVV kodu heç vaxt bizə ötürülmür.
        </p>
      </LegalSection>

      <LegalSection title="Qəbul olunan kartlar və valyuta">
        <p>
          Visa və Mastercard bank kartları. Ödəniş valyutası — Azərbaycan manatı (AZN).
        </p>
        <p>
          <strong>{CARD_ACCEPTANCE_NOTE}</strong>
        </p>
        <CardBrands />
      </LegalSection>

      <LegalSection title="Əlaqənin şifrələnməsi">
        <p>
          Sayt və server arasındakı bütün əlaqə HTTPS (TLS) ilə şifrələnir. Brauzerin ünvan
          sətrində kilid işarəsinə və ünvanın mimedu.az olmasına diqqət edin.
        </p>
      </LegalSection>

      <LegalSection title="Şübhəli əməliyyat">
        <p>
          Kartınızdan tanımadığınız «{MERCHANT_NAME}» ödənişi görsəniz, dərhal bankınıza və bizə (
          {SUPPORT_EMAIL}) yazın. Biz heç vaxt e-poçt, telefon və ya mesajla kart məlumatlarınızı,
          SMS kodunu soruşmuruq.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
