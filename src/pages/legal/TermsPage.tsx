import { Link } from 'react-router-dom';
import { LegalPage, LegalSection, SellerDetails } from '../../components/legal/LegalLayout';
import { MERCHANT_NAME, RESPONSE_DAYS, SUPPORT_EMAIL, TERMS_UPDATED_AT } from '../../data/legal';

const link = 'text-brand-blue underline';

/** İstifadə şərtləri (ictimai oferta) — ödəniş sistemi və istehlakçı hüquqları üçün əsas sənəd. */
export default function TermsPage() {
  return (
    <LegalPage
      title="İstifadə şərtləri (ictimai oferta)"
      updatedAt={TERMS_UPDATED_AT}
      intro={
        <p>
          Bu şərtlər {MERCHANT_NAME} platformasından (mimedu.az veb saytı və MIMEDU.AZ mobil
          tətbiqi) istifadə qaydalarını və platformada edilən alışların şərtlərini müəyyən edir.
          Qeydiyyatdan keçməklə və ya ödəniş etməklə bu şərtləri qəbul etmiş olursunuz.
        </p>
      }
    >
      <LegalSection title="1. Tərəflər">
        <p>
          Xidmətləri göstərən və ödənişləri qəbul edən tərəf (bundan sonra — «Satıcı»):
        </p>
        <SellerDetails />
        <p>
          {MERCHANT_NAME} platforması Satıcı tərəfindən idarə olunur. Bank kartı çıxarışında
          ödəniş «{MERCHANT_NAME}» adı ilə görünür. Platformada qeydiyyatdan keçən və ya alış edən
          şəxs — «İstifadəçi».
        </p>
      </LegalSection>

      <LegalSection title="2. Xidmətlərin təsviri">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Təlimlər:</strong> canlı (onlayn görüş), onlayn və video formatda müəllimlər
            üçün peşəkar inkişaf kursları.
          </li>
          <li>
            <strong>Rəqəmsal resurslar:</strong> iş vərəqləri, testlər, təqdimatlar, metodik
            vəsaitlər (PDF, DOCX, PPTX fayllar, video və ya xarici link).
          </li>
          <li>
            <strong>Sınaqlar:</strong> vaxt limitli onlayn imtahanlar və nəticə hesabatı.
          </li>
          <li>
            <strong>Sertifikatlar:</strong> təlim və ya sınaq uğurla tamamlandıqda verilən, koda
            görə yoxlanılan iştirak sənədi.
          </li>
          <li>
            <strong>KSQ cavab kartı yoxlama aləti:</strong> müəllimin şagird cavab kartlarını
            şəkildən oxuyub qiymətləndirməsi üçün pulsuz alət.
          </li>
        </ul>
        <p>
          Hər ödənişli məhsulun adı, təsviri, formatı və qiyməti onun səhifəsində göstərilir.
        </p>
      </LegalSection>

      <LegalSection title="3. Qeydiyyat və hesab">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Qeydiyyat e-poçt və şifrə ilə və ya Google hesabı ilə aparılır. İstifadəçi düzgün
            məlumat verməyə və şifrəsini başqaları ilə bölüşməməyə borcludur.
          </li>
          <li>
            Ödəniş etmək üçün İstifadəçi 18 yaşına çatmış olmalı və ya valideyninin (qanuni
            nümayəndəsinin) razılığı ilə hərəkət etməlidir.
          </li>
          <li>
            Hesabdakı fəaliyyətə görə İstifadəçi məsuliyyət daşıyır. Hesabın icazəsiz istifadəsi
            barədə dərhal bizə yazın: {SUPPORT_EMAIL}.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Qiymətlər və ödəniş">
        <ul className="list-disc space-y-2 pl-5">
          <li>Bütün qiymətlər Azərbaycan manatı (AZN) ilə göstərilir.</li>
          <li>
            Səbətdə göstərilən məbləğ yekun məbləğdir — ödəniş zamanı əlavə xidmət haqqı tutulmur.
          </li>
          <li>
            Ödəniş yalnız Azərbaycan banklarının buraxdığı bank kartı (Visa, Mastercard) ilə — xarici
            kartlar qəbul olunmur — AzeriCard ödəniş sisteminin təhlükəsiz
            səhifəsində aparılır. Kart məlumatlarını {MERCHANT_NAME} görmür və saxlamır (bax:{' '}
            <Link to="/odenis-tehlukesizliyi" className={link}>
              Ödəniş təhlükəsizliyi
            </Link>
            ).
          </li>
          <li>Pulsuz məhsullar üçün ödəniş tələb olunmur.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Müqavilənin bağlanması">
        <p>
          Alış müqaviləsi bank ödənişi uğurla təsdiqləndiyi an bağlanmış sayılır. Ödəniş
          təsdiqlənənə qədər sifariş «gözləmədə» qalır və məhsula giriş açılmır. Uğurlu ödənişdən
          sonra İstifadəçiyə e-poçtla qəbz göndərilir və sifariş{' '}
          <Link to="/sifarisler" className={link}>
            Sifarişlərim
          </Link>{' '}
          bölməsində görünür.
        </p>
      </LegalSection>

      <LegalSection title="6. Xidmətin təqdim edilməsi">
        <p>
          Alınan məhsula giriş qaydası və müddəti{' '}
          <Link to="/xidmetin-teqdimi" className={link}>
            Xidmətin təqdim edilməsi
          </Link>{' '}
          səhifəsində təsvir olunub. Rəqəmsal məhsullara giriş ödəniş təsdiqləndikdən dərhal sonra
          açılır.
        </p>
      </LegalSection>

      <LegalSection title="7. Geri qaytarma">
        <p>
          Rəqəmsal məhsulların geri qaytarılması qaydaları{' '}
          <Link to="/geri-qaytarma" className={link}>
            Geri qaytarma siyasəti
          </Link>{' '}
          səhifəsindədir. Ödəniş etməklə İstifadəçi rəqəmsal məhsula girişin dərhal açılacağını və
          bu siyasətdə göstərilən hallardan başqa qaytarmanın mümkün olmadığını qəbul edir.
        </p>
      </LegalSection>

      <LegalSection title="8. Müəllif (satıcı-müəllim) şərtləri">
        <p>
          Platformada materiallarının bir hissəsi müəllimlər tərəfindən hazırlanır. Bu materialları
          İstifadəçiyə Satıcı satır; müəllim materialın müəllifi və ona istifadə lisenziyası verən
          tərəfdir.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Müəllim yüklədiyi materialın müəllif hüquqlarına sahib olduğuna və onun üçüncü
            şəxslərin hüquqlarını pozmadığına zəmanət verir.
          </li>
          <li>
            Hər material dərc olunmazdan əvvəl moderasiyadan keçir (adətən 48 saat ərzində).
            Satıcı qaydalara uyğun olmayan materialı səbəbini göstərməklə rədd etmək və ya silmək
            hüququna malikdir.
          </li>
          <li>
            Qadağandır: başqasının materialını icazəsiz yükləmək, yanıltıcı təsvir, qanunsuz,
            təhqiramiz və ya reklam xarakterli məzmun.
          </li>
          <li>
            Ödənişli materialın hər satışından müəllimə 80%, platformaya 20% komissiya düşür.
            Müəllimin payı yalnız ödənişi təsdiqlənmiş satışlardan hesablanır; geri qaytarılan
            satışın payı balansdan çıxılır.
          </li>
          <li>
            Qazancın çıxarılması: balans ən azı 20 AZN olduqda müəllim panelindən tələb göndərilir;
            məbləğ 5 iş günü ərzində müəllimin bank hesabına (IBAN) köçürülür. Ödənişdən
            qanunvericiliyə uyğun vergi tutula bilər.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="9. İstifadə lisenziyası">
        <p>
          Alınan və ya endirilən materialı öz sinfinizdə sərbəst işlədə, müəllifin adını saxlamaq
          şərti ilə çap edib şagirdlərinizə paylaya bilərsiniz. Materialın kommersiya məqsədilə
          yenidən satışı, başqa platformalarda yayımlanması və müəllif adının silinməsi qadağandır.
        </p>
      </LegalSection>

      <LegalSection title="10. Sertifikatlar">
        <p>
          Sertifikat platformanın verdiyi iştirak sənədidir, dövlət nümunəli sənəd deyil. Onun
          həqiqiliyi kodu ilə{' '}
          <Link to="/sertifikat-yoxla" className={link}>
            sertifikat yoxlama
          </Link>{' '}
          səhifəsində hər kəs tərəfindən yoxlanıla bilər.
        </p>
      </LegalSection>

      <LegalSection title="11. Məsuliyyətin məhdudlaşdırılması">
        <p>
          Satıcı platformanın fasiləsiz işləməsi üçün ağlabatan tədbirlər görür, lakin texniki
          xidmət, internet və ya üçüncü tərəf (hostinq, bank) xidmətlərindəki fasilələrə görə
          məsuliyyət daşımır. Satıcının məsuliyyəti istənilən halda müvafiq sifariş üzrə ödənilmiş
          məbləğlə məhdudlaşır. Materialların tədrisdə tətbiqinə görə məsuliyyət onu istifadə edən
          müəllimin üzərindədir.
        </p>
      </LegalSection>

      <LegalSection title="12. Mübahisələrin həlli">
        <p>
          Şikayət və iradlarınızı {SUPPORT_EMAIL} ünvanına sifariş nömrəsi ilə göndərin — {RESPONSE_DAYS}{' '}
          iş günü ərzində cavab veririk. Razılığa gəlinmədikdə mübahisə Azərbaycan Respublikasının
          qanunvericiliyinə uyğun olaraq həll edilir.
        </p>
      </LegalSection>

      <LegalSection title="13. Şərtlərin dəyişdirilməsi">
        <p>
          Satıcı bu şərtləri dəyişə bilər. Yeni versiya bu səhifədə dərc olunduğu tarixdən qüvvəyə
          minir və ondan sonra edilən alışlara şamil olunur. Əvvəl edilmiş alışlara alış anında
          qüvvədə olan şərtlər tətbiq olunur.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
