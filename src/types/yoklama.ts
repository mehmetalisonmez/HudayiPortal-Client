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
  tarih: string;                       // "YYYY-MM-DD" formatı (DateOnly)
  ogrenciler: StudentAttendanceDto[];
}

/** GET /api/yoklama/export-excel — Filtre parametreleri */
export interface YoklamaExportParams {
  yil: number;
  ay: number;
  yoklamaTurId: number;
}
