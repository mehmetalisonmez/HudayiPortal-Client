// ──────────────────────────────────────────────
// Backend: DuyuruDto, CreateDuyuruCommand, UpdateDuyuruCommand
// ──────────────────────────────────────────────

/** GET /api/duyuru | GET /api/duyuru/aktif — Yanıt öğesi */
export interface DuyuruDto {
  id: number;
  baslik: string;
  icerik: string;
  gecerlilikTarihi: string | null;   // ISO 8601
  olusturulmaTarihi: string | null;
}

/** POST /api/duyuru — İstek gövdesi */
export interface CreateDuyuruRequest {
  baslik: string;
  icerik: string;
  gecerlilikTarihi: string | null;   // ISO 8601
  hedefRolId: number | null;
}

/** PUT /api/duyuru/{id} — İstek gövdesi */
export interface UpdateDuyuruRequest {
  id: number;
  baslik: string;
  icerik: string;
  gecerlilikTarihi: string | null;   // ISO 8601
  hedefRolId: number | null;
}
