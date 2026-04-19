// ──────────────────────────────────────────────
// Backend: IzinDto, CreateIzinTalebiCommand, UpdateIzinDurumuCommand, IzinTuruDto
// ──────────────────────────────────────────────

/** Onay durumu sabitleri */
export const OnayDurumu = {
  Beklemede: 0,
  Onaylandi: 1,
  Reddedildi: 2,
} as const;

export type OnayDurumuType = (typeof OnayDurumu)[keyof typeof OnayDurumu];

/** GET /api/izin — Yanıt öğesi */
export interface IzinDto {
  id: number;
  ogrenciAdSoyad: string;
  izinTuruAdi: string;
  baslangicTarihi: string;         // ISO 8601
  bitisTarihi: string;
  gidecegiAdres: string;
  onayDurumu: number;
}

/** POST /api/izin/talep — İstek gövdesi */
export interface CreateIzinRequest {
  izinTurId: number;
  baslangicTarihi: string;         // ISO 8601
  bitisTarihi: string;
  gidecegiAdres: string;
  aciklama: string;
}

/** PUT /api/izin/onay/{izinId}?yeniDurum=X — İstek parametreleri */
export interface UpdateIzinDurumuRequest {
  izinId: number;
  yeniDurum: number;
}

/** GET /api/izin — Filtre parametreleri */
export interface IzinFilterParams {
  kullaniciId?: number;
  onayDurumu?: number;
}

/** GET /api/izin/turler — İzin türü dropdown öğesi */
export interface IzinTuruDto {
  id: number;
  turAdi: string;
}
