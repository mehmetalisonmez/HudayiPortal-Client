// ──────────────────────────────────────────────
// Tüm API endpoint path sabitlerini merkezi olarak tutar.
// Endpoint değişikliklerinde tek bir dosyayı güncellemek yeterlidir.
// ──────────────────────────────────────────────

export const API = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  DASHBOARD: {
    YONETICI: '/dashboard/yonetici',
    OGRENCI: '/dashboard/ogrenci',
  },

  KULLANICI: {
    OGRENCI_LIST: '/kullanici/ogrenciler',
    CREATE: '/kullanici',
    UPDATE: (id: number) => `/kullanici/${id}`,
    DELETE: (id: number) => `/kullanici/${id}`,
    ODA_LIST: '/kullanici/odalar',
  },

  ETKINLIK: {
    CREATE: '/etkinlik',
    JOIN: '/etkinlik/katil',
    AKTIF: '/etkinlik/aktif',
  },

  DUYURU: {
    CREATE: '/duyuru',
    AKTIF: '/duyuru/aktif',
    LIST: '/duyuru',
    UPDATE: (id: number) => `/duyuru/${id}`,
    DELETE: (id: number) => `/duyuru/${id}`,
  },

  IZIN: {
    CREATE: '/izin/talep',
    UPDATE_DURUM: (izinId: number) => `/izin/onay/${izinId}`,
    LIST: '/izin',
    DELETE: (id: number) => `/izin/${id}`,
    TURLER: '/izin/turler',
  },

  MALI_ISLEM: {
    CREATE: '/maliislem',
    LIST: '/maliislem',
  },

  SIKAYET: {
    CREATE: '/sikayet',
    UPDATE_CEVAP: '/sikayet/cevap',
    LIST: '/sikayet',
  },

  YOKLAMA: {
    OGRENCILER: '/yoklama/ogrenciler',
    TAKE: '/yoklama',
    EXPORT: '/yoklama/export-excel',
  },

  YEMEK_MENU: {
    CREATE: '/yemekmenu',
    AYLIK: '/yemekmenu/aylik',
    EXPORT: '/yemekmenu/export-excel',
  },

  YEMEK_YORUM: {
    CREATE: '/yemekyorum',
    BY_MENU: (menuId: number) => `/yemekyorum/menu/${menuId}`,
  },

  PERSONEL_NOBET: {
    CREATE: '/personelnobet',
    LIST: '/personelnobet',
  },

  SOHBET: {
    CREATE_GRUP: '/sohbet/grup',
    ASSIGN_OGRENCI: '/sohbet/ata',
    CREATE_OTURUM: '/sohbet/oturum',
  },

  MESAJ: {
    LIST: '/mesaj',
  },

  UPLOAD: {
    FILE: '/upload/upload',
  },
} as const;
