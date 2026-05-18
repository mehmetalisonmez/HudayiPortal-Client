// ──────────────────────────────────────────────
// Backend: OgrenciYoklamaDto, StudentAttendanceDto, TakeAttendanceCommand
// ──────────────────────────────────────────────

/** GET /api/yoklama/ogrenciler — Yanıt öğesi */
export interface OgrenciYoklamaDto {
  kullaniciId: number;
  ad: string;
  soyad: string;
  odaId: number | null;
  odaNo: string | null;
}

/** POST /api/yoklama — Oğrenci yoklama kaydı (TakeAttendanceCommand içindeki liste öğesi) */
export interface StudentAttendanceDto {
  kullaniciId: number;
  durum: boolean;
  aciklama: string | null;
}

/** POST /api/yoklama — İstek gövdesi */
export interface TakeAttendanceRequest {
  yoklamaTurId: number;
  tarih: string; // "YYYY-MM-DD" formatı (DateOnly)
  ogrenciler: StudentAttendanceDto[];
}

/** GET /api/yoklama/export-excel — Filtre parametreleri */
export interface YoklamaExportParams {
  yil: number;
  ay: number;
  yoklamaTurId: number;
}

/** GET /api/yoklama/turler — Yoklama türü */
export interface YoklamaTuruDto {
  id: number;
  turAdi: string;
}

/** GET /api/yoklama/gruplar — Sohbet grubu */
export interface SohbetGrubuDto {
  id: number;
  grupAdi: string;
}

/** GET /api/yoklama/gunluk — Öğrenci yoklama durumu (tarih+tür bazlı) */
export interface OgrenciYoklamaDurumDto {
  kullaniciId: number;
  ad: string;
  soyad: string;
  odaNo: string | null;
  durum: boolean | null; // null=henüz alınmamış, true=Var, false=Yok
  aciklama: string | null;
}

// ── Sohbet Yoklama Modülü ───────────────────

/** GET /api/sohbetyoklama/yoklama — Yanıt */
export interface SohbetYoklamaResponse {
  sohbetId: number;
  ogrenciler: SohbetOgrenciDurumDto[];
}

/** Sohbet yoklama — öğrenci katılım durumu */
export interface SohbetOgrenciDurumDto {
  kullaniciId: number;
  ad: string;
  soyad: string;
  odaNo: string | null;
  katilimDurumu: boolean | null;
  mazeretAciklamasi: string | null;
}

/** POST /api/sohbetyoklama/yoklama — İstek gövdesi */
export interface TakeSohbetAttendanceRequest {
  sohbetId: number;
  ogrenciler: SohbetStudentAttendanceDto[];
}

/** POST /api/sohbetyoklama/yoklama — Öğrenci kaydı */
export interface SohbetStudentAttendanceDto {
  kullaniciId: number;
  katilimDurumu: boolean;
  mazeretAciklamasi: string | null;
}
