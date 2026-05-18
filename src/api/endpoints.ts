// ──────────────────────────────────────────────
// Tüm API endpoint path sabitlerini merkezi olarak tutar.
// Endpoint değişikliklerinde tek bir dosyayı güncellemek yeterlidir.
// ──────────────────────────────────────────────

export const API = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    VERIFY_EMAIL: "/auth/verify-email",
  },

  DASHBOARD: {
    YONETICI: "/dashboard/yonetici",
    OGRENCI: "/dashboard/ogrenci",
  },

  KULLANICI: {
    OGRENCI_LIST: "/kullanici/ogrenciler",
    CREATE: "/kullanici",
    UPDATE: (id: number) => `/kullanici/${id}`,
    DELETE: (id: number) => `/kullanici/${id}`,
    ODA_LIST: "/kullanici/odalar",
  },

  ETKINLIK: {
    LIST: "/etkinlik",
    DETAY: (id: number) => `/etkinlik/${id}`,
    CREATE: "/etkinlik",
    UPDATE: (id: number) => `/etkinlik/${id}`,
    DELETE: (id: number) => `/etkinlik/${id}`,
    JOIN: "/etkinlik/katil",
    LEAVE: "/etkinlik/ayril",
    YORUM: "/etkinlik/yorum",
    LIKE: (etkinlikId: number) => `/etkinlik/like/${etkinlikId}`,
    KATILIMCILAR: (id: number) => `/etkinlik/${id}/katilimcilar`,
    KATILIM_DURUM: (katilimciId: number) =>
      `/etkinlik/katilimci/${katilimciId}/durum`,
  },

  DUYURU: {
    CREATE: "/duyuru",
    LIST: "/duyuru",
    UPDATE: (id: number) => `/duyuru/${id}`,
    DELETE: (id: number) => `/duyuru/${id}`,
  },

  ROL: {
    LIST: "/rol",
  },

  NOBET: {
    LIST: "/personelnobet",
    BENIM: "/personelnobet/benim",
    PERSONELLER: "/personelnobet/personeller",
    UPDATE: (id: number) => `/personelnobet/${id}`,
    DELETE: (id: number) => `/personelnobet/${id}`,
  },

  IZIN: {
    CREATE: "/izin/talep",
    UPDATE_DURUM: (izinId: number) => `/izin/onay/${izinId}`,
    LIST: "/izin",
    DELETE: (id: number) => `/izin/${id}`,
    TURLER: "/izin/turler",
  },

  MALI_ISLEM: {
    CREATE: "/maliislem",
    LIST: "/maliislem",
    UPDATE: (id: number) => `/maliislem/${id}`,
    DELETE: (id: number) => `/maliislem/${id}`,
    DASHBOARD: "/maliislem/dashboard",
  },

  ISLEM_KATEGORISI: {
    LIST: "/islemkategorileri",
    CREATE: "/islemkategorileri",
    UPDATE: (id: number) => `/islemkategorileri/${id}`,
    DELETE: (id: number) => `/islemkategorileri/${id}`,
  },

  SIKAYET: {
    CREATE: "/sikayet",
    UPDATE_CEVAP: "/sikayet/cevap",
    LIST: "/sikayet",
    MY_LIST: "/sikayet/benim",
    DETAIL: (id: number) => `/sikayet/${id}`,
  },

  YOKLAMA: {
    OGRENCILER: "/yoklama/ogrenciler",
    TAKE: "/yoklama",
    EXPORT: "/yoklama/export-excel",
    EXPORT_GUNLUK: "/yoklama/export/gunluk",
    TURLER: "/yoklama/turler",
    GUNLUK: "/yoklama/gunluk",
  },

  SOHBET_YOKLAMA: {
    GRUPLAR: "/sohbetyoklama/gruplar",
    YOKLAMA: "/sohbetyoklama/yoklama",
    TAKE: "/sohbetyoklama/yoklama",
    EXPORT_SOHBET: "/sohbetyoklama/export/sohbet",
  },

  YEMEK_MENU: {
    CREATE: "/yemekmenu",
    BULK_CREATE: "/yemekmenu/bulk",
    UPDATE: (id: number) => `/yemekmenu/${id}`,
    DELETE: (id: number) => `/yemekmenu/${id}`,
    AYLIK: "/yemekmenu/aylik",
    EXPORT: "/yemekmenu/export-excel",
    YEMEK_TANIMLARI: "/yemekmenu/yemek-tanimlari",
    STANDART_KAHVALTI: "/yemekmenu/standart-kahvalti",
  },

  YEMEK_YORUM: {
    CREATE: "/yemekyorum",
    BY_MENU: (menuId: number) => `/yemekyorum/menu/${menuId}`,
  },

  YEMEK_TANIMI: {
    LIST: "/yemektanimi",
    CREATE: "/yemektanimi",
    UPDATE: (id: number) => `/yemektanimi/${id}`,
    DELETE: (id: number) => `/yemektanimi/${id}`,
    KATEGORILER: "/yemektanimi/kategoriler",
  },

  PERSONEL_NOBET: {
    CREATE: "/personelnobet",
    LIST: "/personelnobet",
  },

  SOHBET: {
    CREATE_GRUP: "/sohbet/grup",
    ASSIGN_OGRENCI: "/sohbet/ata",
    CREATE_OTURUM: "/sohbet/oturum",
    GRUPLAR: "/sohbet/gruplar",
    GRUP_BY_ID: (id: number) => `/sohbet/gruplar/${id}`,
    UPDATE_GRUP: (id: number) => `/sohbet/gruplar/${id}`,
    DELETE_GRUP: (id: number) => `/sohbet/gruplar/${id}`,
    SYNC_OGRENCILER: (id: number) => `/sohbet/gruplar/${id}/ogrenciler`,
    AVAILABLE_OGRENCILER: (id: number) =>
      `/sohbet/gruplar/${id}/ogrenciler/available`,
    OTURUMLAR: (id: number) => `/sohbet/gruplar/${id}/oturumlar`,
    UPDATE_OTURUM: (id: number) => `/sohbet/oturum/${id}`,
    DELETE_OTURUM: (id: number) => `/sohbet/oturum/${id}`,
  },

  MESAJ: {
    LIST: "/mesaj",
  },

  UPLOAD: {
    FILE: "/upload/upload",
  },

  ODA: {
    YERLESIM: "/oda/yerlesim",
    ASSIGN: "/oda/ata",
  },
} as const;
