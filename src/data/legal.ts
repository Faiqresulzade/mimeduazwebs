/**
 * Hüquqi səhifələrin, footer-in və ödəniş səhifələrinin yeganə mənbəyi.
 * Satıcı bank (ABB/AzeriCard) müqaviləsindəki şəxsdir — backend-dəki "Seller" bölməsi
 * (appsettings.json) ilə eyni olmalıdır. Kart çıxarışındakı ad: MERCHANT_NAME.
 */
export const SELLER_NAME = 'Fərdi sahibkar Vəfa Kərimli Zeyqəm';
export const SELLER_VOEN = '4002166852';
/** VÖEN-də qeydiyyatda olan ünvan (ofis yoxdur — fəaliyyət onlayndır). */
export const SELLER_ADDRESS = 'Bakı şəhəri, Xətai rayonu, Lütfi Zadə küçəsi 24';
export const SELLER_PHONE = '+994 55 861 60 88';
export const SELLER_PHONE_HREF = '+994558616088';
export const SUPPORT_EMAIL = 'vefakerimli92@gmail.com';
export const MERCHANT_NAME = 'MIMEDU.AZ';
/** Loqodakı tam ad — MİM qısaltmasının açılışı. */
export const BRAND_FULL_NAME = 'Müəllimlərin İnkişaf Mərkəzi';

/** Bank tələbi: yalnız ölkədaxili kartlar qəbul olunur. */
export const CARD_ACCEPTANCE_NOTE =
  'Yalnız Azərbaycan banklarının buraxdığı Visa və Mastercard kartları qəbul olunur. Xarici bank kartları ilə ödəniş mümkün deyil.';
export const SUPPORT_HOURS = 'Bazar ertəsi – Cümə, 10:00–18:00';

/** Müraciətə cavab müddəti (geri qaytarma, giriş problemi). */
export const RESPONSE_DAYS = 3;

/** Əvvəlki adı saxlanılır — məxfilik və hesab silmə səhifələri bundan oxuyur. */
export const CONTACT_EMAIL = SUPPORT_EMAIL;

export const PRIVACY_UPDATED_AT = '17 noyabr 2026';
export const TERMS_UPDATED_AT = '17 noyabr 2026';

/** Backend-dəki Payment:TermsVersion ilə eyni. */
export const TERMS_VERSION = '2026-11-17';

export const LEGAL_LINKS = [
  { to: '/istifade-sertleri', label: 'İstifadə şərtləri' },
  { to: '/mexfilik', label: 'Məxfilik siyasəti' },
  { to: '/geri-qaytarma', label: 'Geri qaytarma siyasəti' },
  { to: '/xidmetin-teqdimi', label: 'Xidmətin təqdim edilməsi' },
  { to: '/odenis-tehlukesizliyi', label: 'Ödəniş təhlükəsizliyi' },
  { to: '/elaqe', label: 'Əlaqə' },
] as const;
