// ──────────────────────────────────────────────
// Backend: YemekTanimiDto, CreateYemekTanimiCommand, UpdateYemekTanimiCommand
// ──────────────────────────────────────────────

/** GET /api/yemektanimi — Yanıt öğesi */
export interface YemekTanimiFullDto {
  id: number;
  yemekAdi: string;
  kategoriId: number;
  kategoriAdi: string;
  kalori: number | null;
  resimUrl: string | null;
}

/** GET /api/yemektanimi/kategoriler — Yanıt öğesi */
export interface YemekKategorisiDto {
  id: number;
  kategoriAdi: string;
}

/** POST /api/yemektanimi — İstek gövdesi */
export interface CreateYemekTanimiRequest {
  yemekAdi: string;
  kategoriId: number;
  kalori: number | null;
  resimUrl: string | null;
}

/** PUT /api/yemektanimi/{id} — İstek gövdesi */
export interface UpdateYemekTanimiRequest {
  id: number;
  yemekAdi: string;
  kategoriId: number;
  kalori: number | null;
  resimUrl: string | null;
}
