// ──────────────────────────────────────────────
// Backend: SikayetDto, CreateSikayetCommand, UpdateSikayetCevapCommand
// ──────────────────────────────────────────────

/** Şikâyet durumu sabitleri */
export const SikayetDurumu = {
  Beklemede: 0,
  Cevaplanmis: 1,
  Kapatilmis: 2,
} as const;

export type SikayetDurumuType = (typeof SikayetDurumu)[keyof typeof SikayetDurumu];

/** GET /api/sikayet — Yanıt öğesi */
export interface SikayetDto {
  id: number;
  ogrenciAdSoyad: string;
  baslik: string;
  icerik: string;
  cevap: string | null;
  durum: number | null;
  olusturulmaTarihi: string | null;   // ISO 8601
  cevaplanmaTarihi: string | null;
}

/** POST /api/sikayet — İstek gövdesi */
export interface CreateSikayetRequest {
  baslik: string;
  icerik: string;
}

/** PUT /api/sikayet/cevap — İstek gövdesi */
export interface UpdateSikayetCevapRequest {
  sikayetId: number;
  cevap: string;
  yeniDurum: number;
}

/** GET /api/sikayet — Filtre parametreleri */
export interface SikayetFilterParams {
  gonderenKullaniciId?: number;
  durum?: number;
}
