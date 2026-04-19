// ──────────────────────────────────────────────
// Backend: EtkinlikDto, CreateEtkinlikCommand, JoinEtkinlikCommand
// ──────────────────────────────────────────────

/** GET /api/etkinlik/aktif — Yanıt öğesi */
export interface EtkinlikDto {
  id: number;
  baslik: string;
  aciklama: string | null;
  baslangicTarihi: string;       // ISO 8601
  bitisTarihi: string | null;
  sonKayitTarihi: string | null;
  ucret: number | null;
  zorunluMu: boolean | null;
  resimUrl: string | null;
}

/** POST /api/etkinlik — İstek gövdesi */
export interface CreateEtkinlikRequest {
  baslik: string;
  aciklama: string;
  baslangicTarihi: string;       // ISO 8601
  bitisTarihi: string;
  sonKayitTarihi: string | null;
  ucret: number | null;
  zorunluMu: boolean;
  resimUrl: string | null;
}

/** POST /api/etkinlik/katil — İstek gövdesi */
export interface JoinEtkinlikRequest {
  etkinlikId: number;
}
