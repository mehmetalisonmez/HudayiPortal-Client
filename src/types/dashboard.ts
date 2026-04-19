// ──────────────────────────────────────────────
// Backend: YoneticiDashboardDto, OgrenciDashboardDto
// ──────────────────────────────────────────────

/** GET /api/dashboard/yonetici — Yanıt */
export interface YoneticiDashboard {
  toplamOgrenciSayisi: number;
  bekleyenSikayetSayisi: number;
  aktifDuyuruSayisi: number;
  yaklasanEtkinlikSayisi: number;
}

/** GET /api/dashboard/ogrenci — Yanıt */
export interface OgrenciDashboard {
  odaNo: string;
  bugunYoklamaAlindiMi: boolean;
  okunmamisMesajSayisi: number;
  yaklasanEtkinlikSayisi: number;
}
