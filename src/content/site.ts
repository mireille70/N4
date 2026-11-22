/**
 * SITE CONTENT — brand, navigation, footer and page copy.
 * All Arabic strings are taken from the reference screenshots unless marked
 * "UI" (functional micro-copy the demo needs, e.g. empty states).
 */

export const site = {
  brand: {
    name: 'KOON',
    /** Arabic tagline used in <meta> only */
    tagline: 'بطاقات الألعاب والهدايا والمتاجر الرقمية',
  },
  locale: {
    lang: 'ar',
    dir: 'rtl' as const,
    currency: { code: 'SAR', symbol: 'ر.س' },
    defaultCountry: 'SA',
  },

  nav: [
    { label: 'الرئيسية', to: '/' },
    { label: 'الفئات', to: '/categories' },
    { label: 'تواصل معنا', to: '/contact' },
  ],

  /**
   * Contact details shown on the contact page. PLACEHOLDERS — replace with the
   * store's real phone, e-mail and hours before going live.
   */
  contact: {
    phone: '920000000',
    email: 'support@example.com',
    whatsapp: '966500000000',
    hours: 'يوميًا من 9 صباحًا حتى 12 منتصف الليل',
  },

  /** UI: mobile bottom tab bar labels */
  tabBar: [
    { label: 'الرئيسية', to: '/', icon: 'home' },
    { label: 'الفئات', to: '/categories', icon: 'grid' },
    { label: 'السلة', to: '/cart', icon: 'cart' },
    { label: 'حسابي', to: '/account', icon: 'user' },
  ],

  footer: {
    about:
      'بطاقات الألعاب والهدايا والشحن الفوري — دفع آمن، تسليم خلال دقائق، ودعم بالعربي.',
    columns: [
      { title: 'روابط سريعة', links: [
        { label: 'بطاقات الألعاب', to: '/categories/game-cards' },
        { label: 'بطاقات الهدايا', to: '/categories/gift-cards' },
        { label: 'العروض', to: '/offers' },
      ] },
      { title: 'المساعدة', links: [
        { label: 'تواصل معنا', to: '/contact' },
        { label: 'الأسئلة الشائعة', to: '/faq' },
        { label: 'حسابي', to: '/account' },
      ] },
      { title: 'السياسات', links: [
        { label: 'سياسة الخصوصية', to: '/privacy' },
        { label: 'الشروط والأحكام', to: '/terms' },
        { label: 'سياسة الاسترجاع', to: '/refund' },
      ] },
    ],
    /** Reference read "ASUS 2024"; the holder is now driven by brand.name. */
    copyright: (brand: string) => `جميع الحقوق محفوظة ${brand} 2024 ©`,
  },

  auth: {
    login: {
      title: 'تسجيل الدخول',
      phoneLabel: 'رقم الهاتف',
      phonePlaceholder: 'رقم الهاتف',
      submit: 'تسجيل الدخول',
      divider: 'أو باستخدام',
      switchPrompt: 'ليس لديك وصول بعد؟',
      switchLink: 'إنشاء حساب',
    },
    register: {
      /** Reference heading repeated "تسجيل الدخول" on the sign-up screen; corrected. */
      title: 'إنشاء حساب',
      nameLabel: 'الاسم الكامل',
      /** Reference placeholder was "أدخل بريدك الإلكتروني" (copy error); corrected. */
      namePlaceholder: 'أدخل اسمك الكامل',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      phoneLabel: 'رقم الجوال',
      phonePlaceholder: 'رقم الهاتف',
      passwordLabel: 'كلمة المرور',
      confirmLabel: 'تأكيد كلمة المرور',
      /** Reference button read "تسجيل الدخول"; corrected to match the action. */
      submit: 'إنشاء حساب',
      divider: 'أو باستخدام',
      switchPrompt: 'لديك حساب بالفعل؟',
      switchLink: 'سجل الدخول',
    },
    forgot: {
      title: 'استعادة الوصول',
      subtitle: 'أدخل رقم هاتفك المسجل لتلقي رسالة استرداد.',
      phoneLabel: 'رقم الهاتف',
      phonePlaceholder: 'رقم الهاتف',
      submit: 'طلب استرداد',
    },
    verify: {
      title: 'رمز التحقق',
      subtitle: 'لقد أرسلنا رمزًا إلى بريدك الإلكتروني المسجل.',
      submit: 'تحقق من الرمز',
      notReceived: 'لم تستلم الرمز؟',
      resendIn: 'إعادة الإرسال بعد',
      resend: 'إعادة الإرسال',
    },
    reset: {
      title: 'إنشاء كلمه سر جديدة',
      subtitle: 'قم بإنشاء كلمة مرور جديدة آمنة لحسابك.',
      newLabel: 'كلمة مرور جديدة',
      confirmLabel: 'تأكيد كلمة المرور الجديدة',
      submit: 'تأكيد كلمة المرور',
    },
    /** UI: shown on every auth screen — no real SMS/email is sent in the demo */
    demoNote: 'عرض تجريبي: لا يتم إرسال رسائل فعلية، وأي رمز من 6 أرقام يُقبل.',
    /** UI: the three steps narrated on the auth art stage */
    steps: ['الهوية', 'التحقق', 'الحماية'],
  },

  account: {
    tabs: [
      { label: 'الملف الشخصي', to: '/account', icon: 'user' },
      { label: 'عمليات الشراء', to: '/account/orders', icon: 'history' },
      { label: 'الولاء والمكافآت', to: '/account/loyalty', icon: 'gift' },
      { label: 'المفضله', to: '/account/favorites', icon: 'heart' },
      { label: 'بطاقات الدفع', to: '/account/cards', icon: 'id-card' },
    ],
    profile: {
      title: 'البيانات الشخصية',
      fields: {
        name: { label: 'الاسم بالكامل', placeholder: 'أدخل الاسم' },
        phone: { label: 'رقم الهاتف', placeholder: 'رقم الهاتف' },
        email: { label: 'بريد الكتروني', placeholder: 'أدخل بريد إلكتروني' },
        birthday: { label: 'تاريخ الميلاد', placeholder: 'يوم/شهر/سنة' },
        country: { label: 'البلد', placeholder: 'اختر عنصر' },
        gender: { label: 'الجنس', placeholder: 'اختر عنصر' },
      },
      save: 'حفظ',
      changePassword: 'تغيير كلمه السر',
      disable: {
        title: 'تعطيل الحساب',
        body: 'حذف حسابك من المتجر، بما في ذلك طلباتك السابقة ومنتجات قائمة الرغبات',
        action: 'حذف الحساب',
      },
      logout: 'تسجيل الخروج',
    },
    /** Loyalty programme copy (from the reference homepage banner) */
    loyalty: {
      badge: 'برنامج الولاء',
      title: 'اجمع النقاط واستبدلها',
      highlight: 'بمكافأت',
      body: 'مع نقاط مع كل طلب، واستبدلها برصيد وخصومات على مشترياتك القادمة.',
    },
    /** UI option lists for the profile selects */
    countries: ['السعودية', 'الإمارات', 'الكويت', 'البحرين', 'قطر', 'عُمان', 'مصر'],
    genders: ['ذكر', 'أنثى'],
  },
};

export type Site = typeof site;
