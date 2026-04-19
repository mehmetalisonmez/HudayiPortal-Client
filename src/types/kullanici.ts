// ──────────────────────────────────────────────
// Backend: KullaniciListDto, CreateKullaniciCommand,
//          UpdateKullaniciCommand, OdaListDto
// ──────────────────────────────────────────────

/** GET /api/kullanici/ogrenciler — Yanıt öğesi */
export interface KullaniciListDto {
  id: number;
  ad: string;
  soyad: string;
  tcKimlikNo: string | null;
  telefon: string | null;
  email: string | null;
  odaNo: string | null;
  kat: number | null;
  aktifMi: boolean | null;
}

/** POST /api/kullanici — İstek gövdesi */
export interface CreateKullaniciRequest {
  rolId: number;
  odaId: number | null;
  ad: string;
  soyad: string;
  tcKimlikNo: string | null;
  telefon: string | null;
  email: string | null;
  sifre: string | null;
  dogumTarihi: string | null;   // ISO 8601 tarih formatı
  kanGrubu: string | null;
}

/** PUT /api/kullanici/{id} — İstek gövdesi */
export interface UpdateKullaniciRequest {
  id: number;
  odaId: number | null;
  ad: string;
  soyad: string;
  tcKimlikNo: string | null;
  telefon: string | null;
  email: string | null;
  dogumTarihi: string | null;   // ISO 8601 tarih formatı
  kanGrubu: string | null;
}

/** GET /api/kullanici/odalar — Oda dropdown verisi */
export interface OdaListDto {
  id: number;
  odaNo: string;
  kat: number;
  kapasite: number;
}
