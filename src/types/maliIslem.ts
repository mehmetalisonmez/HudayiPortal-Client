// ──────────────────────────────────────────────
// Backend: MaliIslemDto, CreateMaliIslemCommand
// ──────────────────────────────────────────────

/** GET /api/maliislem — Yanıt öğesi */
export interface MaliIslemDto {
  id: number;
  yonAdi: string;
  baslik: string;
  aciklama: string | null;
  tutar: number;
  islemTarihi: string;               // ISO 8601
  ilgiliKullaniciAdSoyad: string | null;
}

/** POST /api/maliislem — İstek gövdesi */
export interface CreateMaliIslemRequest {
  yonId: number;
  baslik: string;
  aciklama: string;
  tutar: number;
  islemTarihi: string;               // ISO 8601
  ilgiliKullaniciId: number | null;
}

/** GET /api/maliislem — Filtre parametreleri */
export interface MaliIslemFilterParams {
  yonId?: number;
  baslangicTarihi?: string;
  bitisTarihi?: string;
}
