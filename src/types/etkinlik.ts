// ──────────────────────────────────────────────
// Etkinlik Tipleri
// ──────────────────────────────────────────────

/** GET /api/etkinlik — Liste yanıt öğesi */
export interface EtkinlikListDto {
  id: number;
  baslik: string;
  aciklama: string | null;
  baslangicTarihi: string; // ISO 8601
  bitisTarihi: string | null;
  sonKayitTarihi: string | null;
  ucret: number | null;
  zorunluMu: boolean | null;
  resimUrl: string | null;
  begeniSayisi: number;
  yorumSayisi: number;
  katilimciSayisi: number;
  isLiked: boolean;
  isJoined: boolean;
}

/** Yorumcu bilgisi */
export interface YorumDto {
  id: number;
  yorumMetni: string;
  olusturulmaTarihi: string | null;
  kullaniciAdSoyad: string;
}

/** GET /api/etkinlik/{id} — Detay yanıtı (yorumları içerir) */
export interface EtkinlikDetayDto extends EtkinlikListDto {
  yorumlar: YorumDto[];
}

/** GET /api/etkinlik/{id}/katilimcilar — Katılımcı öğesi */
export interface KatilimciDto {
  id: number;
  kullaniciId: number;
  ad: string;
  soyad: string;
  katilimDurumu: boolean | null; // null=Bekleniyor, true=Katıldı, false=Katılmadı
  olusturulmaTarihi: string | null;
}

/** POST /api/etkinlik — İstek gövdesi */
export interface CreateEtkinlikRequest {
  baslik: string;
  aciklama: string | null;
  baslangicTarihi: string; // ISO 8601
  bitisTarihi: string | null;
  sonKayitTarihi: string | null;
  ucret: number | null;
  zorunluMu: boolean;
  resimUrl: string | null;
}

/** PUT /api/etkinlik/{id} — İstek gövdesi */
export interface UpdateEtkinlikRequest {
  id: number;
  baslik: string;
  aciklama: string | null;
  baslangicTarihi: string;
  bitisTarihi: string | null;
  sonKayitTarihi: string | null;
  ucret: number | null;
  zorunluMu: boolean;
  resimUrl: string | null;
}

/** POST /api/etkinlik/katil — İstek gövdesi */
export interface JoinEtkinlikRequest {
  etkinlikId: number;
}

/** POST /api/etkinlik/ayril — İstek gövdesi */
export interface LeaveEtkinlikRequest {
  etkinlikId: number;
}

/** POST /api/etkinlik/yorum — İstek gövdesi */
export interface AddYorumRequest {
  etkinlikId: number;
  yorumMetni: string;
}

/** PUT /api/etkinlik/katilimci/{id}/durum — İstek gövdesi */
export interface UpdateKatilimDurumuRequest {
  katilimciId: number;
  katilimDurumu: boolean | null;
}

/** GET query parametreleri */
export interface EtkinlikFilterParams {
  aktif?: boolean;
  ucretsiz?: boolean;
}

// Geriye dönük uyumluluk için alias
export type EtkinlikDto = EtkinlikListDto;
