// ──────────────────────────────────────────────
// Backend: YemekMenuDto, CreateYemekMenuCommand
// ──────────────────────────────────────────────

/** GET /api/yemekmenu/aylik — Yanıt öğesi */
export interface YemekMenuDto {
  id: number;
  tarih: string;                       // "YYYY-MM-DD" (DateOnly)
  ogunTuruId: number;
  corbaAdi: string | null;
  anaYemekAdi: string | null;
  yardimciYemekAdi: string | null;
  ekstraAdi: string | null;
  kahvaltiSicak1Adi: string | null;
  kahvaltiSicak2Adi: string | null;
}

/** POST /api/yemekmenu — İstek gövdesi */
export interface CreateYemekMenuRequest {
  tarih: string;                       // "YYYY-MM-DD"
  ogunTuruId: number;
  corbaId: number | null;
  anaYemekId: number | null;
  yardimciYemekId: number | null;
  ekstraId: number | null;
  kahvaltiSicak1Id: number | null;
  kahvaltiSicak2Id: number | null;
}

/** GET /api/yemekmenu/aylik — Filtre parametreleri */
export interface YemekMenuFilterParams {
  yil: number;
  ay: number;
}
