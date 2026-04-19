// ──────────────────────────────────────────────
// Backend: YemekYorumDto, CreateYemekYorumCommand
// ──────────────────────────────────────────────

/** GET /api/yemekyorum/menu/{id} — Yanıt öğesi */
export interface YemekYorumDto {
  id: number;
  yemekMenuId: number;
  kullaniciId: number;
  adSoyad: string;
  yorumMetni: string;
  puan: number | null;
  olusturulmaTarihi: string | null;    // ISO 8601
}

/** POST /api/yemekyorum — İstek gövdesi */
export interface CreateYemekYorumRequest {
  yemekMenuId: number;
  yorumMetni: string;
  puan: number | null;
}
