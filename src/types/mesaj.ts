// ──────────────────────────────────────────────
// Backend: MesajDto, SendMessageCommand / CreateMesajCommand
// ──────────────────────────────────────────────

/** GET /api/mesaj — Yanıt öğesi */
export interface MesajDto {
  id: number;
  gonderenId: number;
  gonderenAdSoyad: string;
  aliciId: number | null;
  chatGrupId: number | null;
  mesajIcerigi: string;
  olusturulmaTarihi: string | null;    // ISO 8601
}

/** POST — Mesaj gönderme istek gövdesi */
export interface SendMessageRequest {
  aliciId: number | null;
  chatGrupId: number | null;
  mesajIcerigi: string;
}

/** GET /api/mesaj — Filtre parametreleri */
export interface MesajFilterParams {
  aliciId?: number;
  chatGrupId?: number;
}
