// ──────────────────────────────────────────────
// Backend: MaliIslemDto, IslemKategorisiDto, FinansDashboardDto
// ──────────────────────────────────────────────

/** GET /api/maliislem — Yanıt öğesi */
export interface MaliIslemDto {
  id: number;
  yonId: number;
  yonAdi: string;
  baslik: string;
  aciklama: string | null;
  tutar: number;
  islemTarihi: string; // ISO 8601
  ilgiliKullaniciAdSoyad: string | null;
  kategoriId: number | null;
  kategoriAdi: string | null;
  belgeUrl: string | null;
}

/** POST /api/maliislem — İstek gövdesi */
export interface CreateMaliIslemRequest {
  yonId: number;
  baslik: string;
  aciklama: string | null;
  tutar: number;
  islemTarihi: string; // ISO 8601
  ilgiliKullaniciId: number | null;
  kategoriId: number | null;
  belgeUrl: string | null;
}

/** PUT /api/maliislem/{id} — İstek gövdesi */
export interface UpdateMaliIslemRequest {
  id: number;
  yonId: number;
  baslik: string;
  aciklama: string | null;
  tutar: number;
  islemTarihi: string; // ISO 8601
  ilgiliKullaniciId: number | null;
  kategoriId: number | null;
  belgeUrl: string | null;
}

/** GET /api/maliislem — Filtre parametreleri */
export interface MaliIslemFilterParams {
  yonId?: number;
  baslangicTarihi?: string;
  bitisTarihi?: string;
  kategoriId?: number;
}

// ─── İşlem Kategorileri ──────────────────────

/** GET /api/islemkategorileri — Yanıt öğesi */
export interface IslemKategorisiDto {
  id: number;
  kategoriAdi: string;
  yonId: number;
  yonAdi: string;
}

/** POST /api/islemkategorileri — İstek gövdesi */
export interface CreateIslemKategorisiRequest {
  kategoriAdi: string;
  yonId: number;
}

/** PUT /api/islemkategorileri/{id} — İstek gövdesi */
export interface UpdateIslemKategorisiRequest {
  id: number;
  kategoriAdi: string;
  yonId: number;
}

// ─── Finans Dashboard ────────────────────────

/** GET /api/maliislem/dashboard — Yanıt */
export interface FinansDashboardDto {
  toplamGelir: number;
  toplamGider: number;
  netKasa: number;
  kategoriDagilimi: KategoriDagilimiDto[];
  aylikTrend: AylikTrendDto[];
}

/** Gider kategorisi dağılımı */
export interface KategoriDagilimiDto {
  kategoriAdi: string;
  tutar: number;
  yuzde: number;
}

/** Aylık gelir/gider trendi */
export interface AylikTrendDto {
  ay: string; // "yyyy-MM"
  gelir: number;
  gider: number;
}
