// ──────────────────────────────────────────────
// Backend: PersonelNobetDto, CreatePersonelNobetCommand
// ──────────────────────────────────────────────

/** GET /api/personelnobet — Yanıt öğesi */
export interface PersonelNobetDto {
  id: number;
  personelId: number;
  personelAdSoyad: string;
  tarih: string;                       // ISO 8601
  nobetTuru: string;
  aciklama: string | null;
}

/** POST /api/personelnobet — İstek gövdesi */
export interface CreatePersonelNobetRequest {
  personelId: number;
  tarih: string;                       // ISO 8601
  nobetTuru: string;
  aciklama: string;
}

/** GET /api/personelnobet — Filtre parametreleri */
export interface PersonelNobetFilterParams {
  personelId?: number;
  baslangicTarihi?: string;
  bitisTarihi?: string;
}
