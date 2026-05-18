// ──────────────────────────────────────────────
// Backend: Sohbet Modülü Tipleri
// ──────────────────────────────────────────────

/** POST /api/sohbet/grup — İstek gövdesi */
export interface CreateSohbetGrubuRequest {
  grupAdi: string;
  sorumluHocaAdi: string;
  donem: string;
}

/** PUT /api/sohbet/gruplar/:id — İstek gövdesi */
export interface UpdateSohbetGrubuRequest {
  id: number;
  grupAdi: string;
  sorumluHocaAdi: string;
  donem: string;
}

/** POST /api/sohbet/ata — İstek gövdesi */
export interface AssignOgrenciRequest {
  kullaniciId: number;
  sohbetGrupId: number;
}

/** PUT /api/sohbet/gruplar/:id/ogrenciler — İstek gövdesi */
export interface SyncOgrencilerRequest {
  sohbetGrupId: number;
  kullaniciIds: number[];
}

/** POST /api/sohbet/oturum — İstek gövdesi */
export interface CreateSohbetSessionRequest {
  sohbetGrupId: number;
  tarih: string; // ISO 8601
  konuBasligi: string;
}

/** PUT /api/sohbet/oturum/:id — İstek gövdesi */
export interface UpdateSohbetSessionRequest {
  id: number;
  tarih: string; // ISO 8601
  konuBasligi: string;
}

// ── Response DTO'ları ────────────────────────

/** GET /api/sohbet/gruplar — Yanıt öğesi */
export interface SohbetGrubuDetailDto {
  id: number;
  grupAdi: string;
  sorumluHocaAdi: string | null;
  donem: string | null;
  ogrenciSayisi: number;
  oturumSayisi: number;
  olusturulmaTarihi: string | null;
}

/** GET /api/sohbet/gruplar/:id — Yanıt */
export interface SohbetGrubuFullDto {
  id: number;
  grupAdi: string;
  sorumluHocaAdi: string | null;
  donem: string | null;
  olusturulmaTarihi: string | null;
  ogrenciler: GrupOgrenciDto[];
  oturumlar: GrupOturumDto[];
}

/** Grup öğrenci DTO */
export interface GrupOgrenciDto {
  kullaniciId: number;
  ad: string;
  soyad: string;
  odaNo: string | null;
  atanmaTarihi: string | null;
}

/** Grup oturum DTO */
export interface GrupOturumDto {
  id: number;
  tarih: string;
  konuBasligi: string | null;
  yoklamaSayisi: number;
}

/** GET /api/sohbet/gruplar/:id/ogrenciler/available — Yanıt öğesi */
export interface AvailableOgrenciDto {
  kullaniciId: number;
  ad: string;
  soyad: string;
  odaNo: string | null;
  isAssigned: boolean;
}
