// ──────────────────────────────────────────────
// Backend: YemekMenuDto, CreateYemekMenuCommand
// ──────────────────────────────────────────────

/** GET /api/yemekmenu/aylik — Yanıt öğesi */
export interface YemekMenuDto {
  id: number;
  tarih: string; // "YYYY-MM-DD" (DateOnly)
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
  tarih: string; // "YYYY-MM-DD"
  ogunTuruId: number;
  corbaId: number | null;
  anaYemekId: number | null;
  yardimciYemekId: number | null;
  ekstraId: number | null;
  kahvaltiSicak1Id: number | null;
  kahvaltiSicak2Id: number | null;
}

/** PUT /api/yemekmenu/{id} — İstek gövdesi */
export interface UpdateYemekMenuRequest {
  id: number;
  tarih: string; // "YYYY-MM-DD"
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

/** GET /api/yemekmenu/yemek-tanimlari — Yanıt öğesi */
export interface YemekTanimiListItem {
  id: number;
  yemekAdi: string;
  kategoriId: number;
}

/** POST /api/yemekmenu/bulk — İstek gövdesi */
export interface BulkCreateYemekMenuRequest {
  menuler: CreateYemekMenuRequest[];
}

/** GET /api/yemekmenu/standart-kahvalti — Yanıt öğesi */
export interface StandartKahvaltiItem {
  id: number;
  yemekAdi: string;
}
