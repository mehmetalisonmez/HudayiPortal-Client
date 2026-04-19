// ──────────────────────────────────────────────
// Backend: CreateSohbetGrubuCommand, AssignOgrenciToSohbetGrubuCommand, CreateSohbetSessionCommand
// ──────────────────────────────────────────────

/** POST /api/sohbet/grup — İstek gövdesi */
export interface CreateSohbetGrubuRequest {
  grupAdi: string;
  sorumluHocaAdi: string;
  donem: string;
}

/** POST /api/sohbet/ata — İstek gövdesi */
export interface AssignOgrenciRequest {
  kullaniciId: number;
  sohbetGrupId: number;
}

/** POST /api/sohbet/oturum — İstek gövdesi */
export interface CreateSohbetSessionRequest {
  sohbetGrupId: number;
  tarih: string;                       // ISO 8601
  konuBasligi: string;
}
