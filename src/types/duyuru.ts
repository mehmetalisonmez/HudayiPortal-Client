// ──────────────────────────────────────────────
// Backend: DuyuruListDto, CreateDuyuruCommand, UpdateDuyuruCommand
// ──────────────────────────────────────────────

/** GET /api/duyuru — Yanıt öğesi (rol tabanlı filtrelenmiş) */
export interface DuyuruDto {
  id: number;
  baslik: string;
  icerik: string;
  yayinTarihi: string | null; // ISO 8601
  gecerlilikTarihi: string | null; // ISO 8601
  olusturulmaTarihi: string | null;
  hedefRolId: number | null;
  hedefRolAdi: string | null;
}

/** Roller listesi — GET /api/rol yanıt öğesi */
export interface RolDto {
  id: number;
  rolAdi: string;
}

/** POST /api/duyuru — İstek gövdesi */
export interface CreateDuyuruRequest {
  baslik: string;
  icerik: string;
  yayinTarihi: string | null; // ISO 8601
  gecerlilikTarihi: string | null; // ISO 8601
  hedefRolId: number | null;
}

/** PUT /api/duyuru/{id} — İstek gövdesi */
export interface UpdateDuyuruRequest {
  id: number;
  baslik: string;
  icerik: string;
  yayinTarihi: string | null; // ISO 8601
  gecerlilikTarihi: string | null; // ISO 8601
  hedefRolId: number | null;
}
